import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useExcursions } from '@/hooks/useExcursions';
import { useBookings } from '@/hooks/useBookings';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Excursion } from '@/types/excursions';
import { BookingStats } from '@/types/bookings';

interface ExcursionWithStats extends Excursion {
  stats?: BookingStats;
}

const GuideDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { excursions, isLoading, error, fetchExcursions } = useExcursions(true); // onlyMy = true
  const { getBookingStats } = useBookings();
  const router = useRouter();
  const [excursionsWithStats, setExcursionsWithStats] = useState<ExcursionWithStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'guide') {
      fetchExcursions();
    }
  }, [user]);

  useEffect(() => {
    if (excursions.length > 0) {
      loadStats();
    }
  }, [excursions]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const excursionsWithStatsData = await Promise.all(
        excursions.map(async (excursion) => {
          try {
            const stats = await getBookingStats(excursion.id);
            return { ...excursion, stats };
          } catch (error) {
            console.error(`Error loading stats for excursion ${excursion.id}:`, error);
            return { ...excursion, stats: undefined };
          }
        })
      );
      setExcursionsWithStats(excursionsWithStatsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
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

  const totalExcursions = excursionsWithStats.length;
  const activeExcursions = excursionsWithStats.filter(e => e.isActive).length;
  const totalParticipants = excursionsWithStats.reduce((sum, e) => 
    sum + (e.stats?.confirmedPeople || 0), 0
  );
  const totalReserve = excursionsWithStats.reduce((sum, e) => 
    sum + (e.stats?.reservePeople || 0), 0
  );

  return (
    <Layout title="Кабинет экскурсовода - BirdWatch">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Кабинет экскурсовода
          </h1>
          <p className="text-gray-600 mt-2">
            Добро пожаловать, {user.firstName} {user.lastName}! Здесь вы можете управлять своими экскурсиями.
          </p>
        </div>

        {/* Статистика */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Всего экскурсий</p>
                  <p className="text-2xl font-bold text-gray-900">{totalExcursions}</p>
                </div>
                <div className="text-3xl">🦅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Активных</p>
                  <p className="text-2xl font-bold text-green-600">{activeExcursions}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Участников</p>
                  <p className="text-2xl font-bold text-blue-600">{totalParticipants}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">В резерве</p>
                  <p className="text-2xl font-bold text-amber-600">{totalReserve}</p>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Список экскурсий */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Мои экскурсии</CardTitle>
              <Button onClick={() => router.push('/admin/excursions/create')}>
                Создать экскурсию
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {excursionsWithStats.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  У вас пока нет экскурсий
                </h3>
                <p className="text-gray-600 mb-6">
                  Создайте свою первую экскурсию, чтобы начать проводить занятия
                </p>
                <Button onClick={() => router.push('/admin/excursions/create')}>
                  Создать экскурсию
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Название</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Дата и время</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Участники</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Резерв</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Свободно</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Статус</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excursionsWithStats.map((excursion) => (
                      <tr key={excursion.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{excursion.title}</p>
                            <p className="text-sm text-gray-600">📍 {excursion.location}</p>
                            {excursion.price && (
                              <p className="text-sm text-green-600">💰 {excursion.price} ₽</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium">{formatDate(excursion.date)}</p>
                            <p className="text-sm text-gray-600">{formatTime(excursion.time)}</p>
                            {excursion.duration && (
                              <p className="text-xs text-gray-500">{excursion.duration} мин</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {statsLoading ? '...' : (excursion.stats?.confirmedPeople || 0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            из {excursion.capacity}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-lg font-semibold text-amber-600">
                            {statsLoading ? '...' : (excursion.stats?.reservePeople || 0)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {statsLoading ? '...' : (excursion.stats?.availableSpots || 0)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(excursion.isActive)}`}>
                            {excursion.isActive ? 'Активна' : 'Неактивна'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/excursions/${excursion.id}`)}
                            >
                              Просмотр
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/guide/excursions/${excursion.id}/participants`)}
                            >
                              Участники
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Быстрые действия */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🚀 Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/admin/excursions/create')}
              >
                ➕ Создать новую экскурсию
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/excursions')}
              >
                👁️ Посмотреть все экскурсии
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Советы экскурсоводу</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Проверяйте список участников за день до экскурсии</li>
                <li>• Приходите на место встречи за 15 минут до начала</li>
                <li>• Имейте запасной план на случай плохой погоды</li>
                <li>• Не забывайте про участников из резерва</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default GuideDashboard;




