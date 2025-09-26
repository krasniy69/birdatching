import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcursionsService } from './excursions.service';
import { ExcursionsController } from './excursions.controller';
import { Excursion } from './excursion.entity';
import { Booking } from '../bookings/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Excursion, Booking])],
  controllers: [ExcursionsController],
  providers: [ExcursionsService],
  exports: [ExcursionsService],
})
export class ExcursionsModule {}



