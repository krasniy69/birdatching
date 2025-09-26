import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Если пользователь уже авторизован, перенаправляем на главную
      router.push('/excursions');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (user) {
    return null; // Редирект происходит в useEffect
  }

  return <RegisterForm />;
};

export default RegisterPage;



