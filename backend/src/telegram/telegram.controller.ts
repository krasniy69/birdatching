import { Controller, Post, Get, Delete, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { TelegramService } from './telegram.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class LinkTelegramDto {
  @ApiProperty({ description: 'Код привязки из приложения' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

class GenerateCodeDto {
  @ApiProperty({ description: 'Telegram ID пользователя' })
  @IsString()
  @IsNotEmpty()
  telegramId: string;
}

@ApiTags('Telegram')
@Controller('telegram')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Post('link')
  @ApiOperation({ summary: 'Привязать Telegram аккаунт по коду' })
  @ApiResponse({ status: 200, description: 'Telegram аккаунт успешно привязан' })
  @ApiResponse({ status: 400, description: 'Неверный код или код истек' })
  async linkTelegram(@Request() req, @Body() linkTelegramDto: LinkTelegramDto) {
    const userId = req.user.userId;
    this.logger.log(`Попытка привязки Telegram для пользователя ${userId}, код: ${linkTelegramDto.code}`);
    
    if (!userId) {
      this.logger.error('userId отсутствует в req.user');
      throw new Error('User ID не найден');
    }
    
    return this.telegramService.linkTelegramAccount(userId, linkTelegramDto.code);
  }

  @Post('generate-code')
  @ApiOperation({ summary: 'Сгенерировать код для привязки Telegram' })
  @ApiResponse({ status: 200, description: 'Код успешно сгенерирован' })
  async generateCode(@Request() req, @Body() generateCodeDto: GenerateCodeDto) {
    const userId = req.user.userId;
    this.logger.log(`Генерация кода для пользователя ${userId}, telegramId: ${generateCodeDto.telegramId}`);
    
    if (!userId) {
      this.logger.error('userId отсутствует в req.user');
      throw new Error('User ID не найден');
    }
    
    const code = this.telegramService.generateLinkCode(userId, generateCodeDto.telegramId);
    return { code, message: 'Код сгенерирован. Введите его в Telegram боте в течение 10 минут.' };
  }

  @Get('status')
  @ApiOperation({ summary: 'Получить статус привязки Telegram' })
  @ApiResponse({ status: 200, description: 'Статус привязки получен' })
  async getStatus(@Request() req) {
    const userId = req.user.userId;
    return this.telegramService.getTelegramLinkStatus(userId);
  }

  @Delete('unlink')
  @ApiOperation({ summary: 'Отвязать Telegram аккаунт' })
  @ApiResponse({ status: 200, description: 'Telegram аккаунт успешно отвязан' })
  async unlinkTelegram(@Request() req) {
    const userId = req.user.userId;
    return this.telegramService.unlinkTelegramAccount(userId);
  }
}

// Контроллер для публичных endpoints (без авторизации)
@ApiTags('Telegram Public')
@Controller('telegram/public')
export class TelegramPublicController {
  private readonly logger = new Logger(TelegramPublicController.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Post('verify-code')
  @ApiOperation({ summary: 'Проверить код привязки (для бота)' })
  @ApiResponse({ status: 200, description: 'Код проверен' })
  @ApiResponse({ status: 400, description: 'Неверный код' })
  async verifyCode(@Body() body: { code: string; telegramId: string }) {
    this.logger.log(`Проверка кода ${body.code} для telegramId ${body.telegramId}`);
    
    // Проверяем что код существует и соответствует telegramId
    const linkData = this.telegramService.getLinkCode(body.code);
    
    if (!linkData) {
      return { valid: false, message: 'Неверный или устаревший код' };
    }
    
    if (linkData.telegramId !== body.telegramId) {
      return { valid: false, message: 'Код не соответствует вашему Telegram ID' };
    }
    
    if (linkData.expiresAt < new Date()) {
      return { valid: false, message: 'Код истек' };
    }
    
    // Код валиден, привязываем аккаунт
    try {
      await this.telegramService.linkTelegramAccount(linkData.userId, body.code);
      return { 
        valid: true, 
        success: true,
        message: 'Telegram аккаунт успешно привязан' 
      };
    } catch (error) {
      this.logger.error(`Ошибка при привязке: ${error.message}`);
      return { 
        valid: true, 
        success: false,
        message: error.message 
      };
    }
  }
}
