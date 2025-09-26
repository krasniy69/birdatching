import { useState } from 'react';
import api from '@/utils/api';

interface TelegramStatus {
  isLinked: boolean;
  telegramId?: string;
}

interface LinkTelegramResponse {
  success: boolean;
  message: string;
}

interface GenerateCodeResponse {
  code: string;
  message: string;
}

export const useTelegram = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatus = async (): Promise<TelegramStatus> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/telegram/status');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка получения статуса Telegram';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = async (telegramId: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<GenerateCodeResponse>('/telegram/generate-code', {
        telegramId
      });
      return response.data.code;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка генерации кода';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const linkAccount = async (code: string): Promise<LinkTelegramResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<LinkTelegramResponse>('/telegram/link', {
        code
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка привязки аккаунта';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkAccount = async (): Promise<LinkTelegramResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.delete<LinkTelegramResponse>('/telegram/unlink');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка отвязки аккаунта';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getStatus,
    generateCode,
    linkAccount,
    unlinkAccount,
  };
};
