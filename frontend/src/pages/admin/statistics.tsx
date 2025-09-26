import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useExcursions } from '@/hooks/useExcursions';
import { useBookings } from '@/hooks/useBookings';
import { useUsers } from '@/hooks/useUsers';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Excursion } from '@/types/excursions';
import { BookingStats } from '@/types/bookings';
import { UserWithDetails } from '@/types/users';

interface ExcursionWithStats extends Excursion {
  stats?: BookingStats;
}

const AdminStatistics: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { excursions, isLoading: excursionsLoading, fetchExcursions } = useExcursions();
  const { getBookingStats } = useBookings();
  const { users, isLoading: usersLoading, fetchUsers } = useUsers();
  const router = useRouter();
  const [excursionsWithStats, setExcursionsWithStats] = useState<ExcursionWithStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchExcursions();
      fetchUsers();
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
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  if (authLoading || excursionsLoading || usersLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Доступ запрещен
          </h2>
          <p className="text-gray-600">
            Эта страница доступна только администраторам.
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

  // Вычисляем общую статистику
  const totalUsers = users.length;
  const totalGuides = users.filter(u => u.role === 'guide').length;
  const totalExcursions = excursionsWithStats.length;
  const activeExcursions = excursionsWithStats.filter(e => e.isActive).length;
  const totalParticipants = excursionsWithStats.reduce((sum, e) => 
    sum + (e.stats?.confirmedPeople || 0), 0
  );
  const totalReserve = excursionsWithStats.reduce((sum, e) => 
    sum + (e.stats?.reservePeople || 0), 0
  );
  const totalBookings = excursionsWithStats.reduce((sum, e) => 
    sum + (e.stats?.totalBookings || 0), 0
  );

  return (
    <Layout title="Статистика - BirdWatch">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Статистика системы
          </h1>
          <p className="text-gray-600 mt-2">
            Общий обзор активности и показателей платформы
          </p>
        </div>

        {/* Общая статистика */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Пользователи</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  <p className="text-xs text-gray-500">экскурсоводов: {totalGuides}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Экскурсии</p>
                  <p className="text-2xl font-bold text-gray-900">{totalExcursions}</p>
                  <p className="text-xs text-gray-500">активных: {activeExcursions}</p>
                </div>
                <div className="text-3xl">🦅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Участники</p>
                  <p className="text-2xl font-bold text-blue-600">{totalParticipants}</p>
                  <p className="text-xs text-gray-500">в резерве: {totalReserve}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Бронирования</p>
                  <p className="text-2xl font-bold text-green-600">{totalBookings}</p>
                  <p className="text-xs text-gray-500">всего заявок</p>
                </div>
                <div className="text-3xl">📝</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Детальная статистика экскурсий */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Детальная статистика экскурсий</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => router.push('/admin/excursions/create')}
                >
                  Создать экскурсию
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                >
                  🖨️ Печать
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {excursionsWithStats.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Экскурсии не найдены
                </h3>
                <p className="text-gray-600 mb-6">
                  Создайте первую экскурсию, чтобы увидеть статистику
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
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Экскурсия</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Дата</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Экскурсовод</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Мест</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Записано</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Резерв</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Свободно</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Заполненность</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Статус</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excursionsWithStats.map((excursion) => {
                      const fillRate = excursion.stats 
                        ? Math.round((excursion.stats.confirmedPeople / excursion.capacity) * 100)
                        : 0;
                      
                      return (
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
                          <td className="py-4 px-4 text-center">
                            <div>
                              <p className="text-sm font-medium">{formatDate(excursion.date)}</p>
                              <p className="text-sm text-gray-600">{formatTime(excursion.time)}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <p className="text-sm font-medium">
                              {excursion.guide.firstName} {excursion.guide.lastName}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-lg font-semibold">{excursion.capacity}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-lg font-semibold text-blue-600">
                              {statsLoading ? '...' : (excursion.stats?.confirmedPeople || 0)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-lg font-semibold text-amber-600">
                              {statsLoading ? '...' : (excursion.stats?.reservePeople || 0)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-lg font-semibold text-green-600">
                              {statsLoading ? '...' : (excursion.stats?.availableSpots || 0)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    fillRate >= 80 ? 'bg-green-500' : 
                                    fillRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${fillRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{fillRate}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              excursion.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {excursion.isActive ? 'Активна' : 'Неактивна'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/excursions/${excursion.id}`)}
                              >
                                👁️
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/guide/excursions/${excursion.id}/participants`)}
                              >
                                👥
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Топ экскурсоводы */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏆 Топ экскурсоводы</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const guideStats = users
                  .filter(u => u.role === 'guide')
                  .map(guide => {
                    const guideExcursions = excursionsWithStats.filter(e => e.guideId === guide.id);
                    const totalParticipants = guideExcursions.reduce((sum, e) => 
                      sum + (e.stats?.confirmedPeople || 0), 0
                    );
                    return {
                      guide,
                      excursionsCount: guideExcursions.length,
                      totalParticipants,
                    };
                  })
                  .sort((a, b) => b.totalParticipants - a.totalParticipants)
                  .slice(0, 5);

                return guideStats.length > 0 ? (
                  <div className="space-y-3">
                    {guideStats.map((stat, index) => (
                      <div key={stat.guide.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{stat.guide.firstName} {stat.guide.lastName}</p>
                            <p className="text-sm text-gray-600">{stat.excursionsCount} экскурсий</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{stat.totalParticipants}</p>
                          <p className="text-xs text-gray-500">участников</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Нет данных</p>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Сводка по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const monthlyStats = excursionsWithStats.reduce((acc, excursion) => {
                    const month = new Date(excursion.date).toLocaleDateString('ru-RU', { 
                      month: 'long', 
                      year: 'numeric' 
                    });
                    if (!acc[month]) {
                      acc[month] = { excursions: 0, participants: 0 };
                    }
                    acc[month].excursions += 1;
                    acc[month].participants += excursion.stats?.confirmedPeople || 0;
                    return acc;
                  }, {} as Record<string, { excursions: number; participants: number }>);

                  return Object.entries(monthlyStats)
                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                    .slice(-6) // Последние 6 месяцев
                    .map(([month, stats]) => (
                      <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{month}</p>
                          <p className="text-sm text-gray-600">{stats.excursions} экскурсий</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{stats.participants}</p>
                          <p className="text-xs text-gray-500">участников</p>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminStatistics;



