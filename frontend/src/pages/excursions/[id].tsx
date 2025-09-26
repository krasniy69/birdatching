import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useExcursions } from '@/hooks/useExcursions';
import { useBookings } from '@/hooks/useBookings';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingModal } from '@/components/bookings/BookingModal';
import { Excursion } from '@/types/excursions';
import { BookingStats } from '@/types/bookings';
import YandexMap from '@/components/map/YandexMap';
import MeetingPointSelector from '@/components/map/MeetingPointSelector';
import ExcursionParticipants from '@/components/excursions/ExcursionParticipants';

const ExcursionDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: authLoading } = useAuth();
  const { getExcursion } = useExcursions();
  const { getBookingStats } = useBookings();
  const [excursion, setExcursion] = useState<Excursion | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMeetingPointModalOpen, setIsMeetingPointModalOpen] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchExcursion(id);
    }
  }, [id]);

  const fetchExcursion = async (excursionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const [excursionData, statsData] = await Promise.all([
        getExcursion(excursionId),
        getBookingStats(excursionId),
      ]);
      setExcursion(excursionData);
      setBookingStats(statsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    // Обновляем статистику после успешного бронирования
    if (excursion) {
      getBookingStats(excursion.id).then(setBookingStats).catch(console.error);
    }
  };

  const handleMeetingPointSave = async (meetingPoint: string, latitude: number, longitude: number) => {
    if (!excursion) return;

    try {
      const response = await fetch(`/api/excursions/${excursion.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          meetingPoint,
          meetingLatitude: latitude,
          meetingLongitude: longitude,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении точки встречи');
      }

      // Обновляем данные экскурсии
      await fetchExcursion(excursion.id);
    } catch (error) {
      console.error('Error updating meeting point:', error);
      throw error;
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
    return timeString.slice(0, 5); // Убираем секунды
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Легко';
      case 2: return 'Средне';
      case 3: return 'Сложно';
      case 4: return 'Очень сложно';
      case 5: return 'Экстрим';
      default: return 'Не указано';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      case 5: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ошибка загрузки
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/excursions')}>
              Вернуться к экскурсиям
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
            <Button onClick={() => router.push('/excursions')}>
              Вернуться к экскурсиям
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${excursion.title} - BirdWatch`}>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button 
              onClick={() => router.push('/excursions')}
              className="hover:text-primary"
            >
              Экскурсии
            </button>
            <span>/</span>
            <span className="text-gray-900">{excursion.title}</span>
          </div>
        </nav>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{excursion.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📅 {formatDate(excursion.date)}</span>
                      <span>🕒 {formatTime(excursion.time)}</span>
                      {excursion.duration && (
                        <span>⏱️ {excursion.duration} мин</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {excursion.price && (
                      <span className="text-lg font-semibold text-primary">
                        {excursion.price} ₽
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(excursion.difficulty)}`}>
                      {getDifficultyLabel(excursion.difficulty)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {excursion.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📍 Место проведения</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{excursion.location}</p>
                
                {excursion.latitude && excursion.longitude && (
                  <div className="mt-4">
                    <YandexMap
                      latitude={excursion.latitude}
                      longitude={excursion.longitude}
                      meetingLatitude={excursion.meetingLatitude}
                      meetingLongitude={excursion.meetingLongitude}
                      showMeetingPoint={!!excursion.meetingLatitude && !!excursion.meetingLongitude}
                      height="300px"
                      zoom={14}
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                          <span>Место экскурсии</span>
                        </div>
                        {excursion.meetingLatitude && excursion.meetingLongitude && (
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            <span>Место встречи</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-1">
                        Координаты: {Number(excursion.latitude).toFixed(6)}, {Number(excursion.longitude).toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Meeting Point */}
            {(excursion.meetingPoint || (user && user.id === excursion.guideId)) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">🤝 Место встречи</CardTitle>
                    {user && user.id === excursion.guideId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsMeetingPointModalOpen(true)}
                      >
                        {excursion.meetingPoint ? 'Изменить' : 'Указать место встречи'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {excursion.meetingPoint ? (
                    <div>
                      <p className="text-gray-700 mb-2">{excursion.meetingPoint}</p>
                      {excursion.meetingLatitude && excursion.meetingLongitude && (
                        <div className="text-sm text-gray-600">
                          <p>
                            <strong>Координаты места встречи:</strong> {Number(excursion.meetingLatitude).toFixed(6)}, {Number(excursion.meetingLongitude).toFixed(6)}
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => {
                              const url = `https://yandex.ru/maps/?pt=${excursion.meetingLongitude},${excursion.meetingLatitude}&z=16&l=map`;
                              window.open(url, '_blank');
                            }}
                          >
                            Открыть место встречи на карте
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    user && user.id === excursion.guideId && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="mb-4">Место встречи не указано</p>
                        <Button onClick={() => setIsMeetingPointModalOpen(true)}>
                          📍 Указать место встречи
                        </Button>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}

            {/* Guide Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">👨‍🏫 Экскурсовод</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {excursion.guide.firstName[0]}{excursion.guide.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {excursion.guide.firstName} {excursion.guide.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {excursion.guide.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Участие в экскурсии</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Всего мест:</span>
                  <span className="font-medium">{excursion.capacity}</span>
                </div>
                
                {bookingStats && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Занято:</span>
                      <span className="font-medium">{bookingStats.confirmedPeople}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Свободно:</span>
                      <span className="font-medium text-green-600">{bookingStats.availableSpots}</span>
                    </div>

                    {bookingStats.reservePeople > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">В резерве:</span>
                        <span className="font-medium text-amber-600">{bookingStats.reservePeople}</span>
                      </div>
                    )}
                  </>
                )}

                {excursion.price && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Стоимость:</span>
                    <span className="text-xl font-semibold text-primary">
                      {excursion.price} ₽
                    </span>
                  </div>
                )}

                <div className="pt-4">
                  {user ? (
                    <Button 
                      className="w-full" 
                      onClick={() => setIsBookingModalOpen(true)}
                      disabled={!excursion.isActive}
                    >
                      {excursion.isActive ? 'Записаться на экскурсию' : 'Экскурсия неактивна'}
                    </Button>
                  ) : (
                    <div>
                      <Button 
                        className="w-full" 
                        onClick={() => router.push('/auth/login')}
                      >
                        Войти для записи
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Необходимо войти в систему для записи на экскурсию
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ℹ️ Дополнительная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Сложность:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(excursion.difficulty)}`}>
                    {getDifficultyLabel(excursion.difficulty)}
                  </span>
                </div>

                {excursion.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Длительность:</span>
                    <span>{Math.floor(excursion.duration / 60)}ч {excursion.duration % 60}м</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Статус:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    excursion.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {excursion.isActive ? 'Активна' : 'Неактивна'}
                  </span>
                </div>

                <div className="pt-3 border-t text-xs text-gray-500">
                  <p>Создано: {new Date(excursion.createdAt).toLocaleDateString('ru-RU')}</p>
                  <p>Обновлено: {new Date(excursion.updatedAt).toLocaleDateString('ru-RU')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Admin/Guide Actions */}
            {user && (user.role === 'admin' || (user.role === 'guide' && user.id === excursion.guideId)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔧 Управление</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/admin/excursions/edit/${excursion.id}`)}
                  >
                    Редактировать
                  </Button>
                  
                  {user.role === 'admin' && (
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Вы уверены, что хотите удалить эту экскурсию?')) {
                          // Delete functionality will be implemented
                          alert('Функция удаления будет реализована позже');
                        }
                      }}
                    >
                      Удалить экскурсию
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Participants Section - Only for Admin and Guide */}
        {user && (user.role === 'admin' || (user.role === 'guide' && user.id === excursion.guideId)) && (
          <div className="mt-8">
            <ExcursionParticipants excursionId={excursion.id} />
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => router.push('/excursions')}
          >
            ← Вернуться к списку экскурсий
          </Button>
        </div>

        {/* Booking Modal */}
        {excursion && bookingStats && (
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            excursion={excursion}
            availableSpots={bookingStats.availableSpots}
            onSuccess={handleBookingSuccess}
          />
        )}

        {/* Meeting Point Modal */}
        {excursion && isMeetingPointModalOpen && (
          <MeetingPointSelector
            excursionId={excursion.id}
            excursionTitle={excursion.title}
            currentLatitude={excursion.latitude}
            currentLongitude={excursion.longitude}
            currentMeetingPoint={excursion.meetingPoint}
            currentMeetingLatitude={excursion.meetingLatitude}
            currentMeetingLongitude={excursion.meetingLongitude}
            onSave={handleMeetingPointSave}
            onClose={() => setIsMeetingPointModalOpen(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default ExcursionDetailPage;
