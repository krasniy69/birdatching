import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useExcursions } from '@/hooks/useExcursions';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ExcursionsPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { excursions, isLoading, error } = useExcursions();
  const router = useRouter();

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
          <p className="text-gray-600">Для просмотра экскурсий необходимо войти в систему</p>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
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

  return (
    <Layout title="Экскурсии - BirdWatch">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Орнитологические экскурсии
            </h1>
            <p className="text-gray-600 mt-2">
              Выберите интересную экскурсию и присоединяйтесь к наблюдению за птицами
            </p>
          </div>
          
          {user?.role === 'admin' && (
            <Button onClick={() => router.push('/admin/excursions/create')}>
              Создать экскурсию
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {excursions.map((excursion) => (
            <Card key={excursion.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{excursion.title}</CardTitle>
                <CardDescription>
                  {formatDate(excursion.date)}, {excursion.time}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {excursion.description}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  📍 {excursion.location}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  👨‍🏫 {excursion.guide.firstName} {excursion.guide.lastName}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  👥 Мест: {excursion.capacity} / Резерв: {excursion.reserve}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {excursion.price && (
                      <span className="text-sm font-medium text-primary">
                        {excursion.price} ₽
                      </span>
                    )}
                    {excursion.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(excursion.difficulty)}`}>
                        {getDifficultyLabel(excursion.difficulty)}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    size="sm"
                    onClick={() => router.push(`/excursions/${excursion.id}`)}
                  >
                    Подробнее
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {excursions.length === 0 && !error && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Экскурсии не найдены
            </h3>
            <p className="text-gray-600">
              {user?.role === 'admin' 
                ? 'Создайте первую экскурсию, нажав кнопку "Создать экскурсию"'
                : 'Пока нет доступных экскурсий. Загляните позже!'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExcursionsPage;
