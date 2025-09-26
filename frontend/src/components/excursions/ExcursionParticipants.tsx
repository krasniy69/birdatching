import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExcursionBookings } from '@/hooks/useExcursionBookings';

interface ExcursionParticipantsProps {
  excursionId: string;
}

const ExcursionParticipants: React.FC<ExcursionParticipantsProps> = ({ excursionId }) => {
  const { bookings, isLoading, error, refetch } = useExcursionBookings(excursionId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>👥 Участники экскурсии</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Загрузка участников...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>👥 Участники экскурсии</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={refetch} variant="outline">
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bookings) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderBookingList = (bookings: any[], title: string, emptyMessage: string) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-lg">{title}</h4>
      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">
                    {booking.user.firstName} {booking.user.lastName}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>📧 {booking.user.email}</div>
                    {booking.user.phone && <div>📞 {booking.user.phone}</div>}
                    {booking.user.telegramId && (
                      <div>📱 Telegram: {booking.user.telegramId}</div>
                    )}
                    <div>👥 Количество человек: {booking.peopleCount}</div>
                    {booking.binocularNeeded && (
                      <div className="text-blue-600">🔭 Нужен бинокль</div>
                    )}
                    {booking.notes && (
                      <div className="text-gray-500 italic">💬 {booking.notes}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      Записано: {formatDate(booking.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>👥 Участники экскурсии</CardTitle>
            <CardDescription>
              Список всех записавшихся на экскурсию
            </CardDescription>
          </div>
          <Button onClick={refetch} variant="outline" size="sm">
            🔄 Обновить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {bookings.totalConfirmed}
              </div>
              <div className="text-sm text-green-700">Подтверждено</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {bookings.totalReserve}
              </div>
              <div className="text-sm text-yellow-700">В резерве</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {bookings.totalConfirmed + bookings.totalReserve}
              </div>
              <div className="text-sm text-blue-700">Всего записей</div>
            </div>
          </div>

          {/* Списки участников */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderBookingList(
              bookings.confirmed,
              `✅ Подтвержденные участники (${bookings.confirmed.length})`,
              'Нет подтвержденных участников'
            )}
            
            {renderBookingList(
              bookings.reserve,
              `⏳ Резерв (${bookings.reserve.length})`,
              'Нет участников в резерве'
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcursionParticipants;
