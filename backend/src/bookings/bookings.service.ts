import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
import { Excursion } from '../excursions/excursion.entity';
import { User } from '../users/user.entity';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Excursion)
    private excursionRepository: Repository<Excursion>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private telegramService: TelegramService,
  ) {}

  async createBooking(excursionId: string, userId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    // Проверяем существование пользователя
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем существование экскурсии
    const excursion = await this.excursionRepository.findOne({
      where: { id: excursionId },
    });

    if (!excursion) {
      throw new NotFoundException('Экскурсия не найдена');
    }

    if (!excursion.isActive) {
      throw new BadRequestException('Экскурсия неактивна');
    }

    // Проверяем, не записан ли уже пользователь на эту экскурсию
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        userId,
        excursionId,
        status: BookingStatus.CONFIRMED,
      },
    });

    if (existingBooking) {
      throw new BadRequestException('Вы уже записаны на эту экскурсию');
    }

    // Подсчитываем текущее количество подтвержденных участников
    const confirmedBookings = await this.bookingRepository.find({
      where: {
        excursionId,
        status: BookingStatus.CONFIRMED,
      },
    });

    const totalConfirmedPeople = confirmedBookings.reduce(
      (sum, booking) => sum + booking.peopleCount,
      0,
    );

    // Определяем статус нового бронирования
    let status = BookingStatus.CONFIRMED;
    if (totalConfirmedPeople + createBookingDto.peopleCount > excursion.capacity) {
      status = BookingStatus.RESERVE;
    }

    // Создаем бронирование
    const booking = this.bookingRepository.create({
      userId,
      excursionId,
      peopleCount: createBookingDto.peopleCount,
      binocularNeeded: createBookingDto.binocularNeeded || false,
      notes: createBookingDto.notes,
      status,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Отправляем уведомления
    // 1. Уведомление участнику
    await this.telegramService.notifyParticipantBooked(
      userId,
      excursion.title,
      status,
      createBookingDto.peopleCount,
    );

    // 2. Уведомление экскурсоводу
    if (excursion.guideId) {
      const participantName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
      await this.telegramService.notifyGuideNewBooking(
        excursion.guideId,
        excursion.title,
        participantName,
        createBookingDto.peopleCount,
        status,
      );
    }

    // 3. Уведомление админам
    const participantName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    await this.telegramService.notifyAdminsNewBooking(
      excursion.title,
      participantName,
      createBookingDto.peopleCount,
    );

    return savedBooking;
  }

  async findUserBookings(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findExcursionBookings(excursionId: string, userId?: string): Promise<Booking[]> {
    // Проверяем права доступа
    if (userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      // Только админы и экскурсоводы могут видеть все бронирования экскурсии
      if (user.role !== 'admin' && user.role !== 'guide') {
        throw new ForbiddenException('Недостаточно прав для просмотра бронирований');
      }

      // Экскурсоводы могут видеть только бронирования своих экскурсий
      if (user.role === 'guide') {
        const excursion = await this.excursionRepository.findOne({
          where: { id: excursionId },
        });
        
        if (!excursion || excursion.guideId !== userId) {
          throw new ForbiddenException('Вы можете видеть только бронирования своих экскурсий');
        }
      }
    }

    return await this.bookingRepository.find({
      where: { excursionId },
      order: { createdAt: 'ASC' },
    });
  }

  async updateBooking(bookingId: string, userId: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Бронирование не найдено');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    // Проверяем права: пользователь может изменять только свои бронирования, админы - любые
    if (booking.userId !== userId && user.role !== 'admin') {
      throw new ForbiddenException('Вы можете изменять только свои бронирования');
    }

    // Обновляем поля
    if (updateBookingDto.peopleCount !== undefined) {
      booking.peopleCount = updateBookingDto.peopleCount;
    }
    if (updateBookingDto.binocularNeeded !== undefined) {
      booking.binocularNeeded = updateBookingDto.binocularNeeded;
    }
    if (updateBookingDto.status !== undefined && user.role === 'admin') {
      booking.status = updateBookingDto.status;
    }
    if (updateBookingDto.notes !== undefined) {
      booking.notes = updateBookingDto.notes;
    }

    return await this.bookingRepository.save(booking);
  }

  async cancelBooking(bookingId: string, userId: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Бронирование не найдено');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const excursion = await this.excursionRepository.findOne({
      where: { id: booking.excursionId },
    });

    if (!excursion) {
      throw new NotFoundException('Экскурсия не найдена');
    }

    // Проверяем права: пользователь может отменять только свои бронирования, 
    // админы и экскурсоводы (своих экскурсий) - любые
    const isOwner = booking.userId === userId;
    const isAdmin = user.role === 'admin';
    const isGuide = user.role === 'guide' && excursion.guideId === userId;

    if (!isOwner && !isAdmin && !isGuide) {
      throw new ForbiddenException('Вы можете отменять только свои бронирования');
    }

    // Получаем информацию об участнике для уведомлений
    const participant = await this.userRepository.findOne({ where: { id: booking.userId } });
    const participantName = participant 
      ? `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || participant.email
      : 'Неизвестный участник';

    // Удаляем бронирование
    await this.bookingRepository.remove(booking);

    // Отправляем уведомления
    // 1. Уведомление участнику (если отменил не он сам)
    if (booking.userId !== userId) {
      await this.telegramService.notifyParticipantCancelled(
        booking.userId,
        excursion.title,
        userId,
      );
    }

    // 2. Уведомление экскурсоводу (если отменил не он сам)
    if (excursion.guideId && excursion.guideId !== userId) {
      await this.telegramService.notifyGuideCancellation(
        excursion.guideId,
        excursion.title,
        participantName,
      );
    }

    // 3. Уведомление админам
    await this.telegramService.notifyAdminsCancellation(
      excursion.title,
      participantName,
    );

    // Проверяем, можно ли перевести кого-то из резерва в подтвержденные
    await this.promoteFromReserve(booking.excursionId);
  }

  private async promoteFromReserve(excursionId: string): Promise<void> {
    const excursion = await this.excursionRepository.findOne({
      where: { id: excursionId },
    });

    if (!excursion) return;

    // Подсчитываем текущее количество подтвержденных участников
    const confirmedBookings = await this.bookingRepository.find({
      where: {
        excursionId,
        status: BookingStatus.CONFIRMED,
      },
    });

    const totalConfirmedPeople = confirmedBookings.reduce(
      (sum, booking) => sum + booking.peopleCount,
      0,
    );

    // Находим бронирования в резерве
    const reserveBookings = await this.bookingRepository.find({
      where: {
        excursionId,
        status: BookingStatus.RESERVE,
      },
      order: { createdAt: 'ASC' }, // По порядку поступления
    });

    // Переводим из резерва в подтвержденные, если есть место
    for (const reserveBooking of reserveBookings) {
      if (totalConfirmedPeople + reserveBooking.peopleCount <= excursion.capacity) {
        reserveBooking.status = BookingStatus.CONFIRMED;
        await this.bookingRepository.save(reserveBooking);

        // Отправляем уведомление о переводе из резерва
        await this.telegramService.notifyParticipantPromoted(
          reserveBooking.userId,
          excursion.title,
        );

        // Уведомляем экскурсовода о новом подтвержденном участнике
        if (excursion.guideId) {
          const participant = await this.userRepository.findOne({ 
            where: { id: reserveBooking.userId } 
          });
          const participantName = participant 
            ? `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || participant.email
            : 'Неизвестный участник';

          await this.telegramService.notifyGuideNewBooking(
            excursion.guideId,
            excursion.title,
            participantName,
            reserveBooking.peopleCount,
            'CONFIRMED',
          );
        }

        break; // Переводим только одно бронирование за раз
      }
    }
  }

  async getBookingStats(excursionId: string): Promise<{
    totalBookings: number;
    confirmedPeople: number;
    reservePeople: number;
    availableSpots: number;
  }> {
    const excursion = await this.excursionRepository.findOne({
      where: { id: excursionId },
    });

    if (!excursion) {
      throw new NotFoundException('Экскурсия не найдена');
    }

    const bookings = await this.bookingRepository.find({
      where: { excursionId },
    });

    const confirmedBookings = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
    const reserveBookings = bookings.filter(b => b.status === BookingStatus.RESERVE);

    const confirmedPeople = confirmedBookings.reduce((sum, b) => sum + b.peopleCount, 0);
    const reservePeople = reserveBookings.reduce((sum, b) => sum + b.peopleCount, 0);

    return {
      totalBookings: bookings.length,
      confirmedPeople,
      reservePeople,
      availableSpots: Math.max(0, excursion.capacity - confirmedPeople),
    };
  }
}
