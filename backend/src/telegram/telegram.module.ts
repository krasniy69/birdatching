import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TelegramController, TelegramPublicController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
  ],
  controllers: [TelegramController, TelegramPublicController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
