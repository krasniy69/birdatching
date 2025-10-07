import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useExcursions } from '@/hooks/useExcursions';
import { useBookings } from '@/hooks/useBookings';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Excursion } from '@/types/excursions';
import { Booking, BookingStats } from '@/types/bookings';

const ParticipantsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: authLoading } = useAuth();
  const { getExcursion } = useExcursions();
  const { getExcursionBookings, getBookingStats } = useBookings();
  const [excursion, setExcursion] = useState<Excursion | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string' && user) {
      fetchData(id);
    }
  }, [id, user]);

  const fetchData = async (excursionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const [excursionData, bookingsData, statsData] = await Promise.all([
        getExcursion(excursionId),
        getExcursionBookings(excursionId),
        getBookingStats(excursionId),
      ]);
      setExcursion(excursionData);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  if (!user || user.role !== 'guide') {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Доступ запрещен
          </h2>
          <p className="text-gray-600">
            Эта страница доступна только экскурсоводам.
          </p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/')}
          >
            На главную
          </Button>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ошибка загрузки
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/guide')}>
              Вернуться в кабинет
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!excursion) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Экскурсия не найдена
            </h2>
            <p className="text-gray-600 mb-6">
              Возможно, экскурсия была удалена или у вас нет прав для ее просмотра.
            </p>
            <Button onClick={() => router.push('/guide')}>
              Вернуться в кабинет
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Проверяем, что это экскурсия текущего экскурсовода
  if (excursion.guideId !== user.id) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Доступ запрещен
          </h2>
          <p className="text-gray-600">
            Вы можете управлять только своими экскурсиями.
          </p>
          <Button onClick={() => router.push('/guide')}>
            Вернуться в кабинет
          </Button>
        </div>
      </Layout>
    );
  }

  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const reserveBookings = bookings.filter(b => b.status === 'RESERVE');

  return (
    <Layout title={`Участники: ${excursion.title} - BirdWatch`}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button 
              onClick={() => router.push('/guide')}
              className="hover:text-primary"
            >
              Кабинет экскурсовода
            </button>
            <span>/</span>
            <span className="text-gray-900">Участники экскурсии</span>
          </div>
        </nav>

        {/* Информация об экскурсии */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{excursion.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">📅 {formatDate(excursion.date)}</p>
                <p className="text-sm text-gray-600 mb-1">🕒 {formatTime(excursion.time)}</p>
                <p className="text-sm text-gray-600 mb-1">📍 {excursion.location}</p>
                {excursion.duration && (
                  <p className="text-sm text-gray-600">⏱️ {excursion.duration} минут</p>
                )}
              </div>
              {stats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.confirmedPeople}</p>
                    <p className="text-xs text-gray-600">Подтверждено</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{stats.reservePeople}</p>
                    <p className="text-xs text-gray-600">В резерве</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.availableSpots}</p>
                    <p className="text-xs text-gray-600">Свободно</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Подтвержденные участники */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Подтвержденные участники ({confirmedBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {confirmedBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Пока нет подтвержденных участников</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-900">Участник</th>
                      <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">Человек</th>
                      <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">Бинокль</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-900">Заметки</th>
                      <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">Дата записи</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmedBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100">
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.user.firstName} {booking.user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{booking.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-lg font-semibold">{booking.peopleCount}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {booking.binocularNeeded ? (
                            <span className="text-green-600">✅ Да</span>
                          ) : (
                            <span className="text-gray-400">❌ Нет</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {booking.notes ? (
                            <p className="text-sm text-gray-700">{booking.notes}</p>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-sm text-gray-600">
                          {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Участники в резерве */}
        {reserveBookings.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                Участники в резерве ({reserveBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-900">Участник</th>
                      <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">Человек</th>
                      <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">Бинокль</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-900">Заметки</th>
                      <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">Дата записи</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reserveBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100">
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.user.firstName} {booking.user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{booking.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-lg font-semibold">{booking.peopleCount}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {booking.binocularNeeded ? (
                            <span className="text-green-600">✅ Да</span>
                          ) : (
                            <span className="text-gray-400">❌ Нет</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {booking.notes ? (
                            <p className="text-sm text-gray-700">{booking.notes}</p>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-sm text-gray-600">
                          {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Действия */}
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={() => router.push('/guide')}
          >
            ← Вернуться в кабинет
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push(`/excursions/${excursion.id}`)}
          >
            Просмотр экскурсии
          </Button>
          <Button 
            onClick={() => window.print()}
          >
            🖨️ Печать списка
          </Button>
        </div>

        {/* Советы */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            💡 Советы по проведению экскурсии
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Свяжитесь с участниками за день до экскурсии для подтверждения</li>
            <li>• Подготовьте биноклей на {confirmedBookings.filter(b => b.binocularNeeded).length} человек</li>
            <li>• Учтите общее количество участников: {stats?.confirmedPeople} человек</li>
            <li>• Не забудьте про участников из резерва - они могут присоединиться</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ParticipantsPage;




