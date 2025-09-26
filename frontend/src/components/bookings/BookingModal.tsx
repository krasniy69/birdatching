import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog as DialogPrimitive, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookings } from '@/hooks/useBookings';
import { CreateBookingRequest } from '@/types/bookings';
import { Excursion } from '@/types/excursions';

interface BookingFormData {
  peopleCount: number;
  binocularNeeded: boolean;
  notes?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  excursion: Excursion;
  availableSpots: number;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  excursion,
  availableSpots,
  onSuccess,
}) => {
  const { createBooking } = useBookings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BookingFormData>({
    defaultValues: {
      peopleCount: 1,
      binocularNeeded: false,
    },
  });

  const peopleCount = watch('peopleCount');

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const bookingData: CreateBookingRequest = {
        peopleCount: Number(data.peopleCount),
        binocularNeeded: data.binocularNeeded,
        notes: data.notes,
      };

      const booking = await createBooking(excursion.id, bookingData);
      
      if (booking.status === 'CONFIRMED') {
        setSuccessMessage('Вы успешно записались на экскурсию!');
      } else if (booking.status === 'RESERVE') {
        setSuccessMessage('Вы добавлены в резерв. Мы уведомим вас, если освободится место.');
      }

      reset();
      onSuccess?.();
      
      // Закрываем модалку через 2 секунды
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setSuccessMessage(null);
    onClose();
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

  if (!isOpen) return null;

  return (
    <DialogPrimitive open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <Card className="w-full border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">Записаться на экскурсию</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Информация об экскурсии */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{excursion.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📅 {formatDate(excursion.date)}</p>
              <p>🕒 {formatTime(excursion.time)}</p>
              <p>📍 {excursion.location}</p>
              <p>👥 Свободных мест: {availableSpots}</p>
              {excursion.price && (
                <p>💰 Стоимость: {excursion.price} ₽</p>
              )}
            </div>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 text-green-700 bg-green-50 border border-green-200 rounded-lg">
              ✅ {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 text-red-700 bg-red-50 border border-red-200 rounded-lg">
              ❌ {error}
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="peopleCount">Количество человек *</Label>
                <Input
                  id="peopleCount"
                  type="number"
                  min="1"
                  max="3"
                  {...register('peopleCount', {
                    required: 'Укажите количество человек',
                    min: { value: 1, message: 'Минимум 1 человек' },
                    max: { value: 3, message: 'Максимум 3 человека' },
                    valueAsNumber: true,
                  })}
                />
                {errors.peopleCount && (
                  <p className="text-sm text-red-600 mt-1">{errors.peopleCount.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Максимум 3 человека в одном бронировании
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="binocularNeeded"
                  type="checkbox"
                  {...register('binocularNeeded')}
                  className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <Label htmlFor="binocularNeeded" className="text-sm">
                  Нужен бинокль
                </Label>
              </div>

              <div>
                <Label htmlFor="notes">Дополнительные пожелания</Label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Укажите особые пожелания или вопросы..."
                />
              </div>

              {availableSpots < peopleCount && (
                <div className="p-3 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                  ⚠️ Свободных мест меньше, чем вы хотите забронировать. 
                  Вы будете добавлены в резерв.
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Записываем...' : 'Записаться'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        </Card>
      </DialogContent>
    </DialogPrimitive>
  );
};
