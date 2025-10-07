import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { useExcursions } from '@/hooks/useExcursions';
import { useCategories } from '@/hooks/useCategories';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpdateExcursionRequest } from '@/types/excursions';
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
  price?: number;
  duration?: number;
  difficulty: number;
  categoryIds: string[];
}

const EditExcursionPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: authLoading } = useAuth();
  const { getExcursion, updateExcursion } = useExcursions();
  const { categories } = useCategories();
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
    watch,
    reset,
  } = useForm<ExcursionFormData>({
    defaultValues: {
      difficulty: 1,
      reserve: 0,
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (id && typeof id === 'string' && user?.role === 'guide') {
      loadExcursion(id);
    }
  }, [id, user]);

  const loadExcursion = async (excursionId: string) => {
    try {
      setIsLoading(true);
      const excursion = await getExcursion(excursionId);
      
      // Проверяем что это экскурсия гида
      if (excursion.guideId !== user?.id) {
        setError('Вы можете редактировать только свои экскурсии');
        return;
      }

      // Заполняем форму
      reset({
        title: excursion.title,
        description: excursion.description,
        date: excursion.date,
        time: excursion.time.slice(0, 5), // убираем секунды
        location: excursion.location,
        latitude: excursion.latitude || undefined,
        longitude: excursion.longitude || undefined,
        capacity: excursion.capacity,
        reserve: excursion.reserve,
        price: excursion.price ? Number(excursion.price) : undefined,
        duration: excursion.duration || undefined,
        difficulty: excursion.difficulty,
        categoryIds: excursion.excursionCategories?.map(ec => ec.category.id) || [],
      });

      setSelectedLatitude(excursion.latitude || undefined);
      setSelectedLongitude(excursion.longitude || undefined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setSelectedLatitude(latitude);
    setSelectedLongitude(longitude);
  };

  const onSubmit = async (data: ExcursionFormData) => {
    if (!id || typeof id !== 'string') return;

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
        reserve: Number(data.reserve || 0),
        difficulty: Number(data.difficulty),
        categoryIds: data.categoryIds || [],
      };

      // Добавляем необязательные поля
      if (selectedLatitude !== undefined) excursionData.latitude = selectedLatitude;
      if (selectedLongitude !== undefined) excursionData.longitude = selectedLongitude;
      if (data.price) excursionData.price = Number(data.price);
      if (data.duration) excursionData.duration = Number(data.duration);

      await updateExcursion(id, excursionData);
      router.push('/guide');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
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
            Только экскурсоводы могут редактировать экскурсии.
          </p>
        </div>
      </Layout>
    );
  }

  const selectedCategoryIds = watch('categoryIds') || [];

  return (
    <Layout title="Редактировать экскурсию - BirdWatch">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Редактировать экскурсию
            </h1>
            <p className="text-gray-600 mt-2">
              Обновите информацию об экскурсии
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/guide')}
          >
            Назад к списку
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Информация об экскурсии</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Название экскурсии *</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Название обязательно' })}
                    placeholder="Например: Утренняя прогулка по парку"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Описание *</Label>
                  <textarea
                    id="description"
                    {...register('description', { required: 'Описание обязательно' })}
                    className="w-full min-h-[120px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Подробное описание экскурсии, что увидим..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="date">Дата *</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date', { required: 'Дата обязательна' })}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
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
                    <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="location">Место проведения *</Label>
                  <Input
                    id="location"
                    {...register('location', { required: 'Место обязательно' })}
                    placeholder="Например: Удельный парк, главный вход"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                  )}
                </div>

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
                  />
                  {errors.capacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reserve">Резервные места</Label>
                  <Input
                    id="reserve"
                    type="number"
                    min="0"
                    {...register('reserve')}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Стоимость (₽)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    {...register('price')}
                    placeholder="0 - бесплатно"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Длительность (минут)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    {...register('duration')}
                    placeholder="Например: 120"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="difficulty">Сложность *</Label>
                  <select
                    id="difficulty"
                    {...register('difficulty', { required: 'Выберите сложность' })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="1">1 - Легко (для всех)</option>
                    <option value="2">2 - Средне (требуется базовая подготовка)</option>
                    <option value="3">3 - Сложно (хорошая физическая форма)</option>
                    <option value="4">4 - Очень сложно (отличная подготовка)</option>
                    <option value="5">5 - Экстрим (профессиональный уровень)</option>
                  </select>
                  {errors.difficulty && (
                    <p className="text-red-500 text-sm mt-1">{errors.difficulty.message}</p>
                  )}
                </div>

                {/* Категории */}
                {categories.length > 0 && (
                  <div className="md:col-span-2">
                    <Label>Категории</Label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            value={category.id}
                            checked={selectedCategoryIds.includes(category.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...selectedCategoryIds, category.id]
                                : selectedCategoryIds.filter(id => id !== category.id);
                              setValue('categoryIds', newIds);
                            }}
                            className="rounded"
                          />
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Карта */}
              <div>
                <Label>Место на карте</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Кликните на карте, чтобы указать точное место проведения экскурсии
                </p>
                <YandexMap
                  latitude={selectedLatitude}
                  longitude={selectedLongitude}
                  onLocationSelect={handleLocationSelect}
                  editable={true}
                  height="400px"
                  zoom={selectedLatitude && selectedLongitude ? 15 : 10}
                />
              </div>

              <div className="flex gap-4 pt-4">
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
                  onClick={() => router.push('/guide')}
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

