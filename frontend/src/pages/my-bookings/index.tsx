import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookings';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Booking, BookingStatus } from '@/types/bookings';

const MyBookingsPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { bookings, isLoading, error, fetchMyBookings, cancelBooking } = useBookings();
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Вы уверены, что хотите отменить запись на экскурсию?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'RESERVE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Подтверждено';
      case 'RESERVE':
        return 'Резерв';
      case 'CANCELLED':
        return 'Отменено';
      default:
        return 'Неизвестно';
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-semibold mb-4">Доступ ограничен</h1>
          <p className="text-gray-600">Для просмотра записей необходимо войти в систему</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Мои записи - BirdWatch">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Мои записи на экскурсии
            </h1>
            <p className="text-gray-600 mt-2">
              Здесь вы можете управлять своими записями на экскурсии
            </p>
          </div>
          
          <Button onClick={() => router.push('/excursions')}>
            Найти экскурсии
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              У вас пока нет записей
            </h3>
            <p className="text-gray-600 mb-6">
              Запишитесь на экскурсию, чтобы увидеть ее здесь
            </p>
            <Button onClick={() => router.push('/excursions')}>
              Посмотреть экскурсии
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.excursion.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="mb-1">
                            📅 {formatDate(booking.excursion.date)}
                          </p>
                          <p className="mb-1">
                            🕒 {formatTime(booking.excursion.time)}
                          </p>
                          <p className="mb-1">
                            📍 {booking.excursion.location}
                          </p>
                        </div>
                        
                        <div>
                          <p className="mb-1">
                            👥 Количество человек: {booking.peopleCount}
                          </p>
                          <p className="mb-1">
                            🔭 Бинокль: {booking.binocularNeeded ? 'Нужен' : 'Не нужен'}
                          </p>
                          <p className="mb-1">
                            📅 Забронировано: {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Заметки:</span> {booking.notes}
                          </p>
                        </div>
                      )}

                      {booking.status === 'RESERVE' && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Вы находитесь в резерве. Мы уведомим вас, если освободится место.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/excursions/${booking.excursion.id}`)}
                      >
                        Подробнее
                      </Button>
                      
                      {booking.status !== 'CANCELLED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {cancellingId === booking.id ? 'Отменяем...' : 'Отменить'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500 text-center">
            💡 Совет: Приходите на экскурсию за 10-15 минут до начала
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default MyBookingsPage;
