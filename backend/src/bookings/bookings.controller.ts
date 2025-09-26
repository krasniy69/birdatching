import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { Booking } from './booking.entity';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('excursions/:id/book')
  @ApiOperation({ summary: 'Записаться на экскурсию' })
  @ApiResponse({ status: 201, description: 'Бронирование создано', type: Booking })
  @ApiResponse({ status: 400, description: 'Ошибка валидации или бизнес-логики' })
  @ApiResponse({ status: 404, description: 'Экскурсия не найдена' })
  async bookExcursion(
    @Param('id') excursionId: string,
    @Body() createBookingDto: CreateBookingDto,
    @Request() req,
  ): Promise<Booking> {
    return await this.bookingsService.createBooking(
      excursionId,
      req.user.userId,
      createBookingDto,
    );
  }

  @Get('bookings/my')
  @ApiOperation({ summary: 'Получить мои бронирования' })
  @ApiResponse({ status: 200, description: 'Список бронирований пользователя', type: [Booking] })
  async getMyBookings(@Request() req): Promise<Booking[]> {
    return await this.bookingsService.findUserBookings(req.user.userId);
  }

  @Get('excursions/:id/bookings')
  @ApiOperation({ summary: 'Получить бронирования экскурсии (только для админов и экскурсоводов)' })
  @ApiResponse({ status: 200, description: 'Список бронирований экскурсии', type: [Booking] })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Экскурсия не найдена' })
  async getExcursionBookings(
    @Param('id') excursionId: string,
    @Request() req,
  ): Promise<Booking[]> {
    return await this.bookingsService.findExcursionBookings(excursionId, req.user.userId);
  }

  @Get('excursions/:id/stats')
  @ApiOperation({ summary: 'Получить статистику бронирований экскурсии' })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика бронирований',
    schema: {
      type: 'object',
      properties: {
        totalBookings: { type: 'number' },
        confirmedPeople: { type: 'number' },
        reservePeople: { type: 'number' },
        availableSpots: { type: 'number' },
      },
    },
  })
  async getBookingStats(@Param('id') excursionId: string) {
    return await this.bookingsService.getBookingStats(excursionId);
  }

  @Patch('bookings/:id')
  @ApiOperation({ summary: 'Изменить бронирование' })
  @ApiResponse({ status: 200, description: 'Бронирование обновлено', type: Booking })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Бронирование не найдено' })
  async updateBooking(
    @Param('id') bookingId: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req,
  ): Promise<Booking> {
    return await this.bookingsService.updateBooking(
      bookingId,
      req.user.userId,
      updateBookingDto,
    );
  }

  @Delete('bookings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отменить бронирование' })
  @ApiResponse({ status: 204, description: 'Бронирование отменено' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Бронирование не найдено' })
  async cancelBooking(
    @Param('id') bookingId: string,
    @Request() req,
  ): Promise<void> {
    await this.bookingsService.cancelBooking(bookingId, req.user.userId);
  }
}
