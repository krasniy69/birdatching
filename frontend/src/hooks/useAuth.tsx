import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '@/utils/api';
import { User, AuthContextType, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

// Безопасные настройки cookies
const getCookieOptions = (expires: number) => ({
  expires,
  secure: process.env.NODE_ENV === 'production', // HTTPS only в production
  sameSite: 'strict' as const, // Защита от CSRF
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      loadUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      // Если профиль не удалось загрузить, очищаем токены
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { accessToken, refreshToken, user: userData } = response.data;

      // Сохраняем токены в куки с безопасными настройками
      Cookies.set('accessToken', accessToken, getCookieOptions(7));
      Cookies.set('refreshToken', refreshToken, getCookieOptions(30));

      setUser(userData);
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      throw new Error(error.response?.data?.message || 'Ошибка входа в систему');
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { accessToken, refreshToken, user: userData } = response.data;

      // Сохраняем токены в куки с безопасными настройками
      Cookies.set('accessToken', accessToken, getCookieOptions(7));
      Cookies.set('refreshToken', refreshToken, getCookieOptions(30));

      setUser(userData);
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      throw new Error(error.response?.data?.message || 'Ошибка регистрации');
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = Cookies.get('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('Нет refresh токена');
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: refreshTokenValue,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      Cookies.set('accessToken', accessToken, getCookieOptions(7));
      Cookies.set('refreshToken', newRefreshToken, getCookieOptions(30));
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};
