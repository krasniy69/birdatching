import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TelegramLink from '@/components/telegram/TelegramLink';

const ProfilePage: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [telegramLinked, setTelegramLinked] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <Layout title="Личный кабинет">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Личный кабинет</h1>
          <p className="text-gray-600">Управляйте своим профилем и настройками</p>
        </div>

        <div className="grid gap-6">
          {/* Информация о пользователе */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Информация о профиле</CardTitle>
              <CardDescription>Основные данные вашего аккаунта</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Имя</label>
                    <p className="text-lg">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Фамилия</label>
                    <p className="text-lg">{user.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Роль</label>
                    <p className="text-lg capitalize">
                      {user.role === 'admin' && 'Администратор'}
                      {user.role === 'guide' && 'Экскурсовод'}
                      {user.role === 'user' && 'Участник'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" onClick={handleLogout}>
                    Выйти из аккаунта
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Telegram интеграция */}
          <TelegramLink onStatusChange={setTelegramLinked} />

          {/* Навигация */}
          <Card>
            <CardHeader>
              <CardTitle>🚀 Быстрая навигация</CardTitle>
              <CardDescription>Перейдите к нужному разделу</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/excursions')}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <span className="font-semibold">🦅 Экскурсии</span>
                  <span className="text-sm text-gray-600">Просмотр и запись на экскурсии</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/my-bookings')}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <span className="font-semibold">📋 Мои записи</span>
                  <span className="text-sm text-gray-600">Управление вашими записями</span>
                </Button>

                {user.role === 'admin' && (
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/admin')}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <span className="font-semibold">⚙️ Админ панель</span>
                    <span className="text-sm text-gray-600">Управление системой</span>
                  </Button>
                )}

                {user.role === 'guide' && (
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/guide')}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <span className="font-semibold">🎯 Кабинет экскурсовода</span>
                    <span className="text-sm text-gray-600">Управление экскурсиями</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
