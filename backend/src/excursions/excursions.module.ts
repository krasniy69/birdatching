import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcursionsService } from './excursions.service';
import { ExcursionsController } from './excursions.controller';
import { Excursion } from './excursion.entity';
import { Booking } from '../bookings/booking.entity';
import { ExcursionCategory } from './excursion-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Excursion, Booking, ExcursionCategory])],
  controllers: [ExcursionsController],
  providers: [ExcursionsService],
  exports: [ExcursionsService],
})
export class ExcursionsModule {}



