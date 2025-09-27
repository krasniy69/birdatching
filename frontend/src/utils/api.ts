import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

// Отладочная информация
console.log('API_URL:', API_URL);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Безопасные настройки cookies
const getCookieOptions = (expires: number) => ({
  expires,
  secure: false, // Отключаем secure для локальной разработки
  sameSite: 'lax' as const, // Используем lax для локальной разработки
  // httpOnly: false - оставляем false для клиентского доступа
});

// Создаем экземпляр axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок и обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          Cookies.set('accessToken', accessToken, getCookieOptions(7));
          Cookies.set('refreshToken', newRefreshToken, getCookieOptions(30));

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Если обновление токена не удалось, перенаправляем на логин
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Если нет refresh токена, перенаправляем на логин
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
