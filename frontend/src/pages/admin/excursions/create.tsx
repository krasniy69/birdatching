import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { useExcursions } from '@/hooks/useExcursions';
import { useUsers } from '@/hooks/useUsers';
import { useCategories } from '@/hooks/useCategories';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateExcursionRequest } from '@/types/excursions';
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
  categoryIds: string[];
}

const CreateExcursionPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { users, isLoading: usersLoading } = useUsers();
  const { createExcursion } = useExcursions();
  const { categories } = useCategories();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLatitude, setSelectedLatitude] = useState<number | undefined>();
  const [selectedLongitude, setSelectedLongitude] = useState<number | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExcursionFormData>({
    defaultValues: {
      difficulty: 1,
      reserve: 0,
      categoryIds: [],
    },
  });

  if (authLoading || usersLoading) {
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
            Только администраторы могут создавать экскурсии.
          </p>
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

      const excursionData: CreateExcursionRequest = {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        capacity: Number(data.capacity),
        reserve: Number(data.reserve || 0),
        guideId: data.guideId,
        difficulty: Number(data.difficulty),
      };

      // Добавляем необязательные поля
      if (selectedLatitude) excursionData.latitude = selectedLatitude;
      if (selectedLongitude) excursionData.longitude = selectedLongitude;
      if (data.price) excursionData.price = Number(data.price);
      if (data.duration) excursionData.duration = Number(data.duration);

      console.log('Отправляем данные экскурсии:', excursionData);
      await createExcursion(excursionData);
      router.push('/excursions');
    } catch (err: any) {
      console.error('Ошибка создания экскурсии:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Создать экскурсию - BirdWatch">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Создать экскурсию
          </h1>
          <p className="text-gray-600 mt-2">
            Заполните информацию о новой орнитологической экскурсии
          </p>
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
                <div>
                  <Label htmlFor="title">Название экскурсии *</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Название обязательно' })}
                    placeholder="Утренние птицы в парке"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="guideId">Экскурсовод *</Label>
                  <select
                    id="guideId"
                    {...register('guideId', { required: 'Выберите экскурсовода' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Выберите экскурсовода</option>
                    {guides.map((guide) => (
                      <option key={guide.id} value={guide.id}>
                        {guide.firstName} {guide.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.guideId && (
                    <p className="text-sm text-red-600 mt-1">{errors.guideId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Описание *</Label>
                <textarea
                  id="description"
                  {...register('description', { required: 'Описание обязательно' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                  placeholder="Подробное описание экскурсии, что увидят участники..."
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

              {/* Выбор категорий */}
              <div>
                <Label>Категории экскурсии</Label>
                <div className="mt-2 space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={category.id}
                        {...register('categoryIds')}
                        className="rounded border-gray-300"
                      />
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Категории не найдены. Создайте категории в разделе управления.
                  </p>
                )}
              </div>

              {/* Карта для выбора координат */}
              <div>
                <Label>Выберите точку на карте</Label>
                <div className="mt-2">
                  <YandexMap
                    latitude={selectedLatitude || 55.7558}
                    longitude={selectedLongitude || 37.6173}
                    onLocationSelect={(lat, lng) => {
                      setSelectedLatitude(lat);
                      setSelectedLongitude(lng);
                    }}
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
                  <Label htmlFor="reserve">Резерв мест</Label>
                  <Input
                    id="reserve"
                    type="number"
                    {...register('reserve')}
                    placeholder="3"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Цена (₽)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price')}
                    placeholder="500"
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Сложность</Label>
                  <select
                    id="difficulty"
                    {...register('difficulty')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="1">1 - Легко</option>
                    <option value="2">2 - Средне</option>
                    <option value="3">3 - Сложно</option>
                    <option value="4">4 - Очень сложно</option>
                    <option value="5">5 - Экстрим</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? 'Создание...' : 'Создать экскурсию'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/excursions')}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            💡 Советы по созданию экскурсии
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Указывайте точное место встречи в поле "Место проведения"</li>
            <li>• Координаты помогут участникам найти место на карте</li>
            <li>• Резерв мест используется для замещения отменивших участие</li>
            <li>• Сложность влияет на рекомендации для участников</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default CreateExcursionPage;
