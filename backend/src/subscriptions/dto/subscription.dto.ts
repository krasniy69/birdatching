import { IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  categoryId: string;
}

export class SubscriptionResponseDto {
  id: string;
  userId: string;
  categoryId: string;
  createdAt: Date;
  category?: {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
  };
}

export class UserSubscriptionsResponseDto {
  subscriptions: SubscriptionResponseDto[];
  categories: {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    isSubscribed: boolean;
  }[];
}

