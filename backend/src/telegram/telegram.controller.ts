import { Controller, Post, Get, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class LinkTelegramDto {
  code: string;
}

class GenerateCodeDto {
  telegramId: string;
}

@ApiTags('Telegram')
@Controller('telegram')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('link')
  @ApiOperation({ summary: 'Привязать Telegram аккаунт по коду' })
  @ApiResponse({ status: 200, description: 'Telegram аккаунт успешно привязан' })
  @ApiResponse({ status: 400, description: 'Неверный код или код истек' })
  async linkTelegram(@Request() req, @Body() linkTelegramDto: LinkTelegramDto) {
    const userId = req.user.id;
    return this.telegramService.linkTelegramAccount(userId, linkTelegramDto.code);
  }

  @Post('generate-code')
  @ApiOperation({ summary: 'Сгенерировать код для привязки Telegram' })
  @ApiResponse({ status: 200, description: 'Код успешно сгенерирован' })
  async generateCode(@Request() req, @Body() generateCodeDto: GenerateCodeDto) {
    const userId = req.user.id;
    const code = this.telegramService.generateLinkCode(userId, generateCodeDto.telegramId);
    return { code, message: 'Код сгенерирован. Введите его в Telegram боте в течение 10 минут.' };
  }

  @Get('status')
  @ApiOperation({ summary: 'Получить статус привязки Telegram' })
  @ApiResponse({ status: 200, description: 'Статус привязки получен' })
  async getStatus(@Request() req) {
    const userId = req.user.id;
    return this.telegramService.getTelegramLinkStatus(userId);
  }

  @Delete('unlink')
  @ApiOperation({ summary: 'Отвязать Telegram аккаунт' })
  @ApiResponse({ status: 200, description: 'Telegram аккаунт успешно отвязан' })
  async unlinkTelegram(@Request() req) {
    const userId = req.user.id;
    return this.telegramService.unlinkTelegramAccount(userId);
  }
}
