import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Booking, CreateBookingRequest, UpdateBookingRequest, BookingStats } from '@/types/bookings';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Booking[]>('/bookings/my');
      setBookings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки бронирований');
    } finally {
      setIsLoading(false);
    }
  };

  const createBooking = async (excursionId: string, data: CreateBookingRequest): Promise<Booking> => {
    try {
      const response = await api.post<Booking>(`/excursions/${excursionId}/book`, data);
      setBookings(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка создания бронирования');
    }
  };

  const updateBooking = async (bookingId: string, data: UpdateBookingRequest): Promise<Booking> => {
    try {
      const response = await api.patch<Booking>(`/bookings/${bookingId}`, data);
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? response.data : booking
        )
      );
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка обновления бронирования');
    }
  };

  const cancelBooking = async (bookingId: string): Promise<void> => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка отмены бронирования');
    }
  };

  const getBookingStats = async (excursionId: string): Promise<BookingStats> => {
    try {
      const response = await api.get<BookingStats>(`/excursions/${excursionId}/stats`);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка загрузки статистики');
    }
  };

  const getExcursionBookings = async (excursionId: string): Promise<Booking[]> => {
    try {
      const response = await api.get<Booking[]>(`/excursions/${excursionId}/bookings`);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка загрузки бронирований экскурсии');
    }
  };

  return {
    bookings,
    isLoading,
    error,
    fetchMyBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    getBookingStats,
    getExcursionBookings,
  };
};



