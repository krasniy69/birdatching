import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { randomBytes } from 'crypto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private linkCodes = new Map<string, { userId: string; telegramId: string; expiresAt: Date }>();
  private readonly botToken: string;
  private readonly telegramApiUrl: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;
    
    if (!this.botToken) {
      this.logger.warn('⚠️ TELEGRAM_BOT_TOKEN не настроен. Уведомления будут отключены.');
    }
  }

  /**
   * Генерирует код для привязки Telegram аккаунта
   */
  generateLinkCode(userId: string, telegramId: string): string {
    const code = randomBytes(6).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    this.linkCodes.set(code, { userId, telegramId, expiresAt });

    // Очистка просроченных кодов
    this.cleanupExpiredCodes();

    return code;
  }

  /**
   * Получает данные кода привязки (для проверки ботом)
   */
  getLinkCode(code: string): { userId: string; telegramId: string; expiresAt: Date } | undefined {
    return this.linkCodes.get(code);
  }

  /**
   * Привязывает Telegram аккаунт к пользователю по коду
   */
  async linkTelegramAccount(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    const linkData = this.linkCodes.get(code);

    if (!linkData) {
      throw new BadRequestException('Неверный код привязки');
    }

    if (linkData.expiresAt < new Date()) {
      this.linkCodes.delete(code);
      throw new BadRequestException('Код привязки истек');
    }

    if (linkData.userId !== userId) {
      throw new BadRequestException('Код не принадлежит данному пользователю');
    }

    // Проверяем, не привязан ли уже этот Telegram ID
    const existingUser = await this.userRepository.findOne({
      where: { telegramId: linkData.telegramId }
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Этот Telegram аккаунт уже привязан к другому пользователю');
    }

    // Обновляем пользователя
    await this.userRepository.update(userId, {
      telegramId: linkData.telegramId
    });

    // Удаляем использованный код
    this.linkCodes.delete(code);

    return {
      success: true,
      message: 'Telegram аккаунт успешно привязан'
    };
  }

  /**
   * Отвязывает Telegram аккаунт от пользователя
   */
  async unlinkTelegramAccount(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!user.telegramId) {
      throw new BadRequestException('Telegram аккаунт не привязан');
    }

    await this.userRepository.update(userId, { telegramId: null });

    return {
      success: true,
      message: 'Telegram аккаунт успешно отвязан'
    };
  }

  /**
   * Получает информацию о привязке Telegram
   */
  async getTelegramLinkStatus(userId: string): Promise<{ isLinked: boolean; telegramId?: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      isLinked: !!user.telegramId,
      telegramId: user.telegramId
    };
  }

  /**
   * Очищает просроченные коды
   */
  private cleanupExpiredCodes(): void {
    const now = new Date();
    for (const [code, data] of this.linkCodes.entries()) {
      if (data.expiresAt < now) {
        this.linkCodes.delete(code);
      }
    }
  }

  /**
   * Отправляет уведомление в Telegram через Bot API
   */
  async sendTelegramNotification(telegramId: string, message: string): Promise<boolean> {
    if (!this.botToken) {
      this.logger.warn('Telegram Bot Token не настроен. Уведомление не отправлено.');
      return false;
    }

    try {
      const response = await axios.post(`${this.telegramApiUrl}/sendMessage`, {
        chat_id: telegramId,
        text: message,
        parse_mode: 'HTML',
      });

      if (response.data.ok) {
        this.logger.log(`✅ Уведомление отправлено в Telegram (ID: ${telegramId})`);
        return true;
      } else {
        this.logger.error(`❌ Ошибка отправки уведомления: ${response.data.description}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`❌ Ошибка при отправке Telegram уведомления: ${error.message}`);
      return false;
    }
  }

  /**
   * Отправляет уведомление пользователю по userId
   */
  async sendNotificationToUser(userId: string, message: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || !user.telegramId) {
      this.logger.warn(`Пользователь ${userId} не имеет привязанного Telegram аккаунта`);
      return false;
    }

    return await this.sendTelegramNotification(user.telegramId, message);
  }

  /**
   * Отправляет уведомление о новой записи участнику
   */
  async notifyParticipantBooked(userId: string, excursionTitle: string, status: 'CONFIRMED' | 'RESERVE', peopleCount: number): Promise<void> {
    const statusText = status === 'CONFIRMED' 
      ? '✅ <b>Ваша запись подтверждена!</b>' 
      : '🕐 <b>Вы в резерве</b>';
    
    const message = `
${statusText}

🦅 Экскурсия: <b>${excursionTitle}</b>
👥 Количество человек: ${peopleCount}

${status === 'RESERVE' ? 'Вы будете переведены в основную группу при освобождении мест.' : 'С нетерпением ждем вас на экскурсии!'}
    `.trim();

    await this.sendNotificationToUser(userId, message);
  }

  /**
   * Отправляет уведомление о переводе из резерва в основную группу
   */
  async notifyParticipantPromoted(userId: string, excursionTitle: string): Promise<void> {
    const message = `
🎉 <b>Отличная новость!</b>

Вы переведены из резерва в основную группу!

🦅 Экскурсия: <b>${excursionTitle}</b>

Встретимся на экскурсии!
    `.trim();

    await this.sendNotificationToUser(userId, message);
  }

  /**
   * Отправляет уведомление об отмене записи
   */
  async notifyParticipantCancelled(userId: string, excursionTitle: string, cancelledBy: string): Promise<void> {
    const message = `
❌ <b>Запись отменена</b>

🦅 Экскурсия: <b>${excursionTitle}</b>
${cancelledBy !== userId ? '\n⚠️ Запись была отменена администратором или экскурсоводом' : ''}

Вы можете записаться на другие экскурсии в приложении.
    `.trim();

    await this.sendNotificationToUser(userId, message);
  }

  /**
   * Отправляет уведомление экскурсоводу о новой записи
   */
  async notifyGuideNewBooking(guideId: string, excursionTitle: string, participantName: string, peopleCount: number, status: string): Promise<void> {
    const statusEmoji = status === 'CONFIRMED' ? '✅' : '🕐';
    const message = `
📝 <b>Новая запись на экскурсию</b>

🦅 Экскурсия: <b>${excursionTitle}</b>
👤 Участник: ${participantName}
👥 Количество человек: ${peopleCount}
${statusEmoji} Статус: ${status === 'CONFIRMED' ? 'Подтверждено' : 'Резерв'}
    `.trim();

    await this.sendNotificationToUser(guideId, message);
  }

  /**
   * Отправляет уведомление экскурсоводу об отмене записи
   */
  async notifyGuideCancellation(guideId: string, excursionTitle: string, participantName: string): Promise<void> {
    const message = `
❌ <b>Отмена записи</b>

🦅 Экскурсия: <b>${excursionTitle}</b>
👤 Участник: ${participantName}

Запись была отменена.
    `.trim();

    await this.sendNotificationToUser(guideId, message);
  }

  /**
   * Отправляет уведомление всем админам
   */
  async notifyAdmins(message: string): Promise<void> {
    const admins = await this.userRepository.find({ 
      where: { role: UserRole.ADMIN } 
    });

    for (const admin of admins) {
      if (admin.telegramId) {
        await this.sendTelegramNotification(admin.telegramId, message);
      }
    }
  }

  /**
   * Отправляет уведомление админам о новой записи
   */
  async notifyAdminsNewBooking(excursionTitle: string, participantName: string, peopleCount: number): Promise<void> {
    const message = `
📊 <b>Новая запись</b>

🦅 Экскурсия: <b>${excursionTitle}</b>
👤 Участник: ${participantName}
👥 Количество: ${peopleCount}
    `.trim();

    await this.notifyAdmins(message);
  }

  /**
   * Отправляет уведомление админам об отмене записи
   */
  async notifyAdminsCancellation(excursionTitle: string, participantName: string): Promise<void> {
    const message = `
📊 <b>Отмена записи</b>

🦅 Экскурсия: <b>${excursionTitle}</b>
👤 Участник: ${participantName}
    `.trim();

    await this.notifyAdmins(message);
  }
}
