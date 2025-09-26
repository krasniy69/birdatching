import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class TelegramService {
  private linkCodes = new Map<string, { userId: string; telegramId: string; expiresAt: Date }>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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
   * Отправляет уведомление в Telegram (заглушка для будущей реализации)
   */
  async sendTelegramNotification(telegramId: string, message: string): Promise<void> {
    // TODO: Реализовать отправку через Telegram Bot API
    console.log(`Telegram notification to ${telegramId}: ${message}`);
  }
}
