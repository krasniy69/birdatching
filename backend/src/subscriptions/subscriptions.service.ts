import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { Category } from '../categories/category.entity';
import { CreateSubscriptionDto, UserSubscriptionsResponseDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async subscribe(userId: string, createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const { categoryId } = createSubscriptionDto;

    // Проверяем, что категория существует
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId, isActive: true }
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена или неактивна');
    }

    // Проверяем, что пользователь еще не подписан
    const existingSubscription = await this.subscriptionsRepository.findOne({
      where: { userId, categoryId }
    });

    if (existingSubscription) {
      throw new ConflictException('Вы уже подписаны на эту категорию');
    }

    const subscription = this.subscriptionsRepository.create({
      userId,
      categoryId
    });

    return await this.subscriptionsRepository.save(subscription);
  }

  async unsubscribe(userId: string, categoryId: string): Promise<void> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { userId, categoryId }
    });

    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    await this.subscriptionsRepository.remove(subscription);
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await this.subscriptionsRepository.find({
      where: { userId },
      relations: ['category'],
      order: { createdAt: 'DESC' }
    });
  }

  async getUserSubscriptionsWithCategories(userId: string): Promise<UserSubscriptionsResponseDto> {
    // Получаем все активные категории
    const allCategories = await this.categoriesRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });

    // Получаем подписки пользователя
    const userSubscriptions = await this.subscriptionsRepository.find({
      where: { userId },
      relations: ['category']
    });

    const subscribedCategoryIds = new Set(userSubscriptions.map(sub => sub.categoryId));

    const categoriesWithSubscriptionStatus = allCategories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      isSubscribed: subscribedCategoryIds.has(category.id)
    }));

    return {
      subscriptions: userSubscriptions.map(sub => ({
        id: sub.id,
        userId: sub.userId,
        categoryId: sub.categoryId,
        createdAt: sub.createdAt,
        category: {
          id: sub.category.id,
          name: sub.category.name,
          description: sub.category.description,
          color: sub.category.color,
          icon: sub.category.icon
        }
      })),
      categories: categoriesWithSubscriptionStatus
    };
  }

  async getUserSubscribedCategoryIds(userId: string): Promise<string[]> {
    const subscriptions = await this.subscriptionsRepository.find({
      where: { userId },
      select: ['categoryId']
    });

    return subscriptions.map(sub => sub.categoryId);
  }
}

