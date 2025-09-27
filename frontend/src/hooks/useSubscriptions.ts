import { useState, useEffect } from 'react';
import { Subscription, UserSubscriptionsResponse } from '@/types/categories';
import { api } from '@/utils/api';

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categoriesWithStatus, setCategoriesWithStatus] = useState<UserSubscriptionsResponse['categories']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/subscriptions/my-with-categories');
      setSubscriptions(response.data.subscriptions);
      setCategoriesWithStatus(response.data.categories);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки подписок');
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (categoryId: string): Promise<void> => {
    try {
      setError(null);
      await api.post('/subscriptions', { categoryId });
      await fetchUserSubscriptions(); // Обновляем список
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка подписки';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const unsubscribe = async (categoryId: string): Promise<void> => {
    try {
      setError(null);
      await api.delete(`/subscriptions/${categoryId}`);
      await fetchUserSubscriptions(); // Обновляем список
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка отписки';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const toggleSubscription = async (categoryId: string, isSubscribed: boolean): Promise<void> => {
    if (isSubscribed) {
      await unsubscribe(categoryId);
    } else {
      await subscribe(categoryId);
    }
  };

  useEffect(() => {
    fetchUserSubscriptions();
  }, []);

  return {
    subscriptions,
    categoriesWithStatus,
    loading,
    error,
    fetchUserSubscriptions,
    subscribe,
    unsubscribe,
    toggleSubscription,
  };
};
