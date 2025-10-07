import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';

export default function CategoriesPage() {
  const { user } = useAuth();
  const { 
    categoriesWithStatus, 
    loading, 
    error, 
    toggleSubscription 
  } = useSubscriptions();
  
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggleSubscription = async (categoryId: string, isSubscribed: boolean) => {
    setUpdating(categoryId);
    try {
      await toggleSubscription(categoryId, isSubscribed);
    } catch (error) {
      console.error('Ошибка изменения подписки:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  // Если есть ошибка авторизации, перенаправляем на страницу входа
  if (error && error.includes('Unauthorized')) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Требуется авторизация</p>
            <p className="mt-2">Для просмотра категорий необходимо войти в систему.</p>
            <div className="mt-4">
              <a href="/auth/login">
                <Button>Войти в систему</Button>
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Мои категории</h1>
          <p className="text-gray-600">
            Выберите категории экскурсий, на которые хотите подписаться. 
            В ленте будут показываться только экскурсии из выбранных категорий.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Ошибка загрузки</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoriesWithStatus.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                    )}
                    {category.icon && (
                      <span className="text-xs text-gray-500">
                        Иконка: {category.icon}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded ${
                  category.isSubscribed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.isSubscribed ? 'Подписан' : 'Не подписан'}
                </span>
                
                <Button
                  size="sm"
                  variant={category.isSubscribed ? "outline" : "default"}
                  onClick={() => handleToggleSubscription(category.id, category.isSubscribed)}
                  disabled={updating === category.id}
                >
                  {updating === category.id ? (
                    'Обновление...'
                  ) : category.isSubscribed ? (
                    'Отписаться'
                  ) : (
                    'Подписаться'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {categoriesWithStatus.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Категории не найдены</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            Как работают подписки?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Подписавшись на категорию, вы будете видеть только экскурсии из этой категории</li>
            <li>• Если вы не подписаны ни на одну категорию, будут показываться все экскурсии</li>
            <li>• Вы можете подписаться на несколько категорий одновременно</li>
            <li>• Подписки можно изменять в любое время</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

