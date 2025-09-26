import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Excursion } from './excursion.entity';
import { CreateExcursionDto, UpdateExcursionDto } from './dto/excursion.dto';
import { UserRole } from '../users/user.entity';
import { Booking } from '../bookings/booking.entity';

@Injectable()
export class ExcursionsService {
  constructor(
    @InjectRepository(Excursion)
    private excursionsRepository: Repository<Excursion>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(createExcursionDto: CreateExcursionDto): Promise<Excursion> {
    const excursion = this.excursionsRepository.create(createExcursionDto);
    return this.excursionsRepository.save(excursion);
  }

  async findAll(userRole?: UserRole, userId?: string): Promise<Excursion[]> {
    const queryBuilder = this.excursionsRepository
      .createQueryBuilder('excursion')
      .leftJoinAndSelect('excursion.guide', 'guide')
      .where('excursion.isActive = :isActive', { isActive: true })
      .orderBy('excursion.date', 'ASC')
      .addOrderBy('excursion.time', 'ASC');

    // Если экскурсовод - показываем только его экскурсии
    if (userRole === UserRole.GUIDE && userId) {
      queryBuilder.andWhere('excursion.guideId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, userRole?: UserRole, userId?: string): Promise<Excursion> {
    const queryBuilder = this.excursionsRepository
      .createQueryBuilder('excursion')
      .leftJoinAndSelect('excursion.guide', 'guide')
      .where('excursion.id = :id', { id });

    // Если экскурсовод - проверяем, что это его экскурсия
    if (userRole === UserRole.GUIDE && userId) {
      queryBuilder.andWhere('excursion.guideId = :userId', { userId });
    }

    const excursion = await queryBuilder.getOne();

    if (!excursion) {
      throw new NotFoundException('Экскурсия не найдена');
    }

    return excursion;
  }

  async update(
    id: string, 
    updateExcursionDto: UpdateExcursionDto, 
    userRole?: UserRole, 
    userId?: string
  ): Promise<Excursion> {
    const excursion = await this.findOne(id, userRole, userId);

    // Проверяем права на редактирование
    if (userRole === UserRole.GUIDE && excursion.guideId !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои экскурсии');
    }

    Object.assign(excursion, updateExcursionDto);
    return this.excursionsRepository.save(excursion);
  }

  async remove(id: string, userRole?: UserRole, userId?: string): Promise<void> {
    const excursion = await this.findOne(id, userRole, userId);

    // Проверяем права на удаление
    if (userRole === UserRole.GUIDE && excursion.guideId !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои экскурсии');
    }

    // Мягкое удаление - помечаем как неактивную
    excursion.isActive = false;
    await this.excursionsRepository.save(excursion);
  }

  async findByGuide(guideId: string): Promise<Excursion[]> {
    return this.excursionsRepository.find({
      where: { guideId, isActive: true },
      relations: ['guide'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async findUpcoming(): Promise<Excursion[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.excursionsRepository.find({
      where: { isActive: true },
      relations: ['guide'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async getStatistics(): Promise<{
    total: number;
    upcoming: number;
    byDifficulty: Record<number, number>;
  }> {
    const total = await this.excursionsRepository.count({ where: { isActive: true } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = await this.excursionsRepository.count({
      where: { 
        isActive: true,
        date: { $gte: today } as any
      }
    });

    const difficultyStats = await this.excursionsRepository
      .createQueryBuilder('excursion')
      .select('excursion.difficulty', 'difficulty')
      .addSelect('COUNT(*)', 'count')
      .where('excursion.isActive = :isActive', { isActive: true })
      .groupBy('excursion.difficulty')
      .getRawMany();

    const byDifficulty: Record<number, number> = {};
    difficultyStats.forEach(stat => {
      byDifficulty[stat.difficulty] = parseInt(stat.count);
    });

    return { total, upcoming, byDifficulty };
  }

  async getExcursionBookings(
    excursionId: string, 
    userRole: UserRole, 
    userId: string
  ): Promise<{
    confirmed: any[];
    reserve: any[];
    totalConfirmed: number;
    totalReserve: number;
  }> {
    // Сначала проверяем, что экскурсия существует и у пользователя есть права
    const excursion = await this.findOne(excursionId, userRole, userId);

    // Получаем все записи на экскурсию
    const bookings = await this.bookingsRepository.find({
      where: { excursionId },
      relations: ['user'],
      order: { createdAt: 'ASC' }
    });

    // Разделяем на подтвержденные и резерв
    const confirmed = bookings.filter(booking => booking.status === 'CONFIRMED');
    const reserve = bookings.filter(booking => booking.status === 'RESERVE');

    return {
      confirmed: confirmed.map(booking => ({
        id: booking.id,
        user: {
          id: booking.user.id,
          firstName: booking.user.firstName,
          lastName: booking.user.lastName,
          email: booking.user.email,
          phone: booking.user.phone,
          telegramId: booking.user.telegramId
        },
        peopleCount: booking.peopleCount,
        binocularNeeded: booking.binocularNeeded,
        notes: booking.notes,
        createdAt: booking.createdAt
      })),
      reserve: reserve.map(booking => ({
        id: booking.id,
        user: {
          id: booking.user.id,
          firstName: booking.user.firstName,
          lastName: booking.user.lastName,
          email: booking.user.email,
          phone: booking.user.phone,
          telegramId: booking.user.telegramId
        },
        peopleCount: booking.peopleCount,
        binocularNeeded: booking.binocularNeeded,
        notes: booking.notes,
        createdAt: booking.createdAt
      })),
      totalConfirmed: confirmed.reduce((sum, booking) => sum + booking.peopleCount, 0),
      totalReserve: reserve.reduce((sum, booking) => sum + booking.peopleCount, 0)
    };
  }
}



