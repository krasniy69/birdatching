import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Excursion } from './excursion.entity';
import { CreateExcursionDto, UpdateExcursionDto } from './dto/excursion.dto';
import { UserRole } from '../users/user.entity';
import { Booking } from '../bookings/booking.entity';
import { ExcursionCategory } from './excursion-category.entity';

@Injectable()
export class ExcursionsService {
  constructor(
    @InjectRepository(Excursion)
    private excursionsRepository: Repository<Excursion>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(ExcursionCategory)
    private excursionCategoryRepository: Repository<ExcursionCategory>,
  ) {}

  async create(createExcursionDto: CreateExcursionDto): Promise<Excursion> {
    const { categoryIds, ...excursionData } = createExcursionDto;
    const excursion = this.excursionsRepository.create(excursionData);
    const savedExcursion = await this.excursionsRepository.save(excursion);
    
    // Связываем с категориями, если они указаны
    if (categoryIds && categoryIds.length > 0) {
      await this.addCategoriesToExcursion(savedExcursion.id, categoryIds);
    }
    
    return this.findOneWithCategories(savedExcursion.id);
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

    const { categoryIds, ...excursionData } = updateExcursionDto;
    Object.assign(excursion, excursionData);
    const savedExcursion = await this.excursionsRepository.save(excursion);
    
    // Обновляем связи с категориями, если они указаны
    if (categoryIds !== undefined) {
      await this.addCategoriesToExcursion(savedExcursion.id, categoryIds);
    }
    
    return this.findOneWithCategories(savedExcursion.id, userRole, userId);
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

  // Методы для работы с категориями
  async findAllWithCategories(userRole?: UserRole, userId?: string, categoryIds?: string[]): Promise<Excursion[]> {
    const queryBuilder = this.excursionsRepository
      .createQueryBuilder('excursion')
      .leftJoinAndSelect('excursion.guide', 'guide')
      .leftJoinAndSelect('excursion.excursionCategories', 'excursionCategory')
      .leftJoinAndSelect('excursionCategory.category', 'category')
      .where('excursion.isActive = :isActive', { isActive: true })
      .orderBy('excursion.date', 'ASC')
      .addOrderBy('excursion.time', 'ASC');

    // Если экскурсовод - показываем только его экскурсии
    if (userRole === UserRole.GUIDE && userId) {
      queryBuilder.andWhere('excursion.guideId = :userId', { userId });
    }

    // Фильтрация по категориям
    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere('category.id IN (:...categoryIds)', { categoryIds });
    }

    return queryBuilder.getMany();
  }

  async findOneWithCategories(id: string, userRole?: UserRole, userId?: string): Promise<Excursion> {
    const queryBuilder = this.excursionsRepository
      .createQueryBuilder('excursion')
      .leftJoinAndSelect('excursion.guide', 'guide')
      .leftJoinAndSelect('excursion.excursionCategories', 'excursionCategory')
      .leftJoinAndSelect('excursionCategory.category', 'category')
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

  async addCategoriesToExcursion(excursionId: string, categoryIds: string[]): Promise<void> {
    // Удаляем существующие связи
    await this.excursionCategoryRepository.delete({ excursionId });

    // Создаем новые связи
    const excursionCategories = categoryIds.map(categoryId => 
      this.excursionCategoryRepository.create({
        excursionId,
        categoryId
      })
    );

    await this.excursionCategoryRepository.save(excursionCategories);
  }

  async removeCategoriesFromExcursion(excursionId: string): Promise<void> {
    await this.excursionCategoryRepository.delete({ excursionId });
  }
}



