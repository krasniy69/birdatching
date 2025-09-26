import { useState, useEffect } from 'react';
import api from '@/utils/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  telegramId?: string;
}

interface Booking {
  id: string;
  user: User;
  peopleCount: number;
  binocularNeeded: boolean;
  notes?: string;
  createdAt: string;
}

interface ExcursionBookings {
  confirmed: Booking[];
  reserve: Booking[];
  totalConfirmed: number;
  totalReserve: number;
}

export const useExcursionBookings = (excursionId: string | null) => {
  const [bookings, setBookings] = useState<ExcursionBookings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!excursionId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/excursions/${excursionId}/bookings`);
      setBookings(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка загрузки участников';
      setError(errorMessage);
      console.error('Ошибка загрузки участников:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [excursionId]);

  return {
    bookings,
    isLoading,
    error,
    refetch: fetchBookings,
  };
};
