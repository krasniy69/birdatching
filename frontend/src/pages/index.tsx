import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Если пользователь авторизован, перенаправляем на страницу экскурсий
      router.push('/excursions');
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

  if (user) {
    return null; // Редирект происходит в useEffect
  }

  return (
    <Layout title="BirdWatch - Орнитологические экскурсии">
      <div className="max-w-4xl mx-auto">
        {/* Hero секция */}
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Добро пожаловать в BirdWatch
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к увлекательным орнитологическим экскурсиям и откройте для себя 
            удивительный мир птиц вместе с опытными экскурсоводами
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/auth/register')}
            >
              Начать путешествие
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/auth/login')}
            >
              Войти в аккаунт
            </Button>
          </div>
        </div>

        {/* Особенности */}
        <div className="grid md:grid-cols-3 gap-8 py-16">
          <Card>
            <CardHeader>
              <CardTitle>🦅 Экспертные экскурсии</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Наши опытные орнитологи проведут вас по лучшим местам наблюдения за птицами
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔭 Профессиональное оборудование</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Предоставляем качественные бинокли для комфортного наблюдения
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📅 Удобная запись</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Простая система бронирования с учетом всех ваших предпочтений
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA секция */}
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Готовы начать?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Зарегистрируйтесь прямо сейчас и получите доступ к эксклюзивным экскурсиям
          </p>
          <Button 
            size="lg"
            onClick={() => router.push('/auth/register')}
          >
            Присоединиться к BirdWatch
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;




