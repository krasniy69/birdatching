import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { useExcursions } from '@/hooks/useExcursions';
import { useUsers } from '@/hooks/useUsers';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpdateExcursionRequest, Excursion } from '@/types/excursions';
import YandexMap from '@/components/map/YandexMap';

interface ExcursionFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  reserve: number;
  guideId: string;
  price?: number;
  duration?: number;
  difficulty: number;
  isActive: boolean;
}

const EditExcursionPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { users, isLoading: usersLoading } = useUsers();
  const { getExcursion, updateExcursion } = useExcursions();
  const router = useRouter();
  const { id } = router.query;
  const [excursion, setExcursion] = useState<Excursion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLatitude, setSelectedLatitude] = useState<number | undefined>();
  const [selectedLongitude, setSelectedLongitude] = useState<number | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ExcursionFormData>();

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchExcursion(id);
    }
  }, [id]);

  const fetchExcursion = async (excursionId: string) => {
    try {
      setIsLoading(true);
      const data = await getExcursion(excursionId);
      setExcursion(data);
      
      // Заполняем форму данными экскурсии
      reset({
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        capacity: data.capacity,
        reserve: data.reserve,
        guideId: data.guideId,
        price: data.price || undefined,
        duration: data.duration || undefined,
        difficulty: data.difficulty,
        isActive: data.isActive,
      });

      // Устанавливаем координаты
      if (data.latitude && data.longitude) {
        setSelectedLatitude(data.latitude);
        setSelectedLongitude(data.longitude);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || usersLoading || isLoading) {
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
            Только администраторы могут редактировать экскурсии.
          </p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ошибка загрузки
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/excursions')}>
            Вернуться к списку
          </Button>
        </div>
      </Layout>
    );
  }

  if (!excursion) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Экскурсия не найдена
          </h2>
          <Button onClick={() => router.push('/excursions')}>
            Вернуться к списку
          </Button>
        </div>
      </Layout>
    );
  }

  const guides = users.filter(u => u.role === 'guide');

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setSelectedLatitude(latitude);
    setSelectedLongitude(longitude);
    console.log('Выбраны координаты:', latitude, longitude);
  };

  const onSubmit = async (data: ExcursionFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const excursionData: UpdateExcursionRequest = {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        capacity: Number(data.capacity),
        reserve: Number(data.reserve),
        guideId: data.guideId,
        difficulty: Number(data.difficulty),
        isActive: data.isActive,
      };

      // Добавляем необязательные поля
      if (selectedLatitude) excursionData.latitude = selectedLatitude;
      if (selectedLongitude) excursionData.longitude = selectedLongitude;
      if (data.price) excursionData.price = Number(data.price);
      if (data.duration) excursionData.duration = Number(data.duration);

      await updateExcursion(excursion.id, excursionData);
      router.push(`/excursions/${excursion.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title={`Редактировать экскурсию: ${excursion.title} - BirdWatch`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Редактировать экскурсию
          </h1>
          <p className="text-gray-600 mt-2">
            Внесите изменения в данные экскурсии
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Информация об экскурсии</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="title">Название экскурсии *</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Название обязательно' })}
                  placeholder="Утренние птицы в Сокольниках"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Описание *</Label>
                <textarea
                  id="description"
                  {...register('description', { required: 'Описание обязательно' })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Подробное описание экскурсии..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="date">Дата *</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date', { required: 'Дата обязательна' })}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="time">Время *</Label>
                  <Input
                    id="time"
                    type="time"
                    {...register('time', { required: 'Время обязательно' })}
                  />
                  {errors.time && (
                    <p className="text-sm text-red-600 mt-1">{errors.time.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duration">Длительность (мин)</Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register('duration')}
                    placeholder="120"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Место проведения *</Label>
                <Input
                  id="location"
                  {...register('location', { required: 'Место проведения обязательно' })}
                  placeholder="Парк Сокольники, центральный вход"
                />
                {errors.location && (
                  <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
                )}
              </div>

              {/* Карта для выбора координат */}
              <div>
                <Label>Выберите точку на карте</Label>
                <div className="mt-2">
                  <YandexMap
                    latitude={selectedLatitude || 55.7558}
                    longitude={selectedLongitude || 37.6173}
                    onLocationSelect={handleLocationSelect}
                    editable={true}
                    height="300px"
                    zoom={10}
                  />
                </div>
                {selectedLatitude && selectedLongitude && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Выбранные координаты:</strong> {Number(selectedLatitude).toFixed(6)}, {Number(selectedLongitude).toFixed(6)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Кликните по карте для выбора точного местоположения экскурсии
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="capacity">Количество мест *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    {...register('capacity', { 
                      required: 'Количество мест обязательно',
                      min: { value: 1, message: 'Минимум 1 место' }
                    })}
                    placeholder="15"
                  />
                  {errors.capacity && (
                    <p className="text-sm text-red-600 mt-1">{errors.capacity.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reserve">Резервные места</Label>
                  <Input
                    id="reserve"
                    type="number"
                    min="0"
                    {...register('reserve')}
                    placeholder="3"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Стоимость (₽)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    {...register('price')}
                    placeholder="500"
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Сложность *</Label>
                  <select
                    id="difficulty"
                    {...register('difficulty', { required: 'Сложность обязательна' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value={1}>1 - Легко</option>
                    <option value={2}>2 - Средне</option>
                    <option value={3}>3 - Сложно</option>
                    <option value={4}>4 - Очень сложно</option>
                    <option value={5}>5 - Экстрим</option>
                  </select>
                  {errors.difficulty && (
                    <p className="text-sm text-red-600 mt-1">{errors.difficulty.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="guideId">Экскурсовод *</Label>
                <select
                  id="guideId"
                  {...register('guideId', { required: 'Экскурсовод обязателен' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Выберите экскурсовода</option>
                  {guides.map((guide) => (
                    <option key={guide.id} value={guide.id}>
                      {guide.firstName} {guide.lastName} ({guide.email})
                    </option>
                  ))}
                </select>
                {errors.guideId && (
                  <p className="text-sm text-red-600 mt-1">{errors.guideId.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  {...register('isActive')}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="isActive" className="ml-2">
                  Экскурсия активна
                </Label>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/excursions/${excursion.id}`)}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditExcursionPage;
