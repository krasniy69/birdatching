export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface Subscription {
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

export interface UserSubscriptionsResponse {
  subscriptions: Subscription[];
  categories: {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    isSubscribed: boolean;
  }[];
}

