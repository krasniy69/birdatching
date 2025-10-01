import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="flex justify-between items-center bg-white shadow px-6 py-3">
      <div className="text-xl font-semibold">
        <Link href="/" className="text-foreground hover:text-primary">
          BirdWatch
        </Link>
      </div>
      
      {user ? (
        <nav className="flex items-center gap-6">
          <Link 
            href="/excursions" 
            className="text-gray-700 hover:text-primary transition-colors"
          >
            Экскурсии
          </Link>
          <Link 
            href="/my-bookings" 
            className="text-gray-700 hover:text-primary transition-colors"
          >
            Мои записи
          </Link>
          <Link 
            href="/categories" 
            className="text-gray-700 hover:text-primary transition-colors"
          >
            Категории
          </Link>
          
          {user.role === 'admin' && (
            <>
              <Link 
                href="/admin" 
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Админ-панель
              </Link>
              <Link 
                href="/admin/categories" 
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Категории
              </Link>
              <Link 
                href="/admin/statistics" 
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Статистика
              </Link>
            </>
          )}
          
          {user.role === 'guide' && (
            <Link 
              href="/guide" 
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Мои экскурсии
            </Link>
          )}
          
          <div className="flex items-center gap-3">
            <Link 
              href="/profile" 
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Профиль
            </Link>
            <span className="text-sm text-gray-600">
              {user.firstName} {user.lastName}
            </span>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-gray-700 hover:text-primary"
            >
              Выйти
            </Button>
          </div>
        </nav>
      ) : (
        <nav className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="ghost">Войти</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Регистрация</Button>
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
