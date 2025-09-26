import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Excursion, CreateExcursionRequest, UpdateExcursionRequest } from '@/types/excursions';

export const useExcursions = (onlyMy = false) => {
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExcursions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = onlyMy ? '?my=true' : '';
      const response = await api.get<Excursion[]>(`/excursions${params}`);
      setExcursions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки экскурсий');
    } finally {
      setIsLoading(false);
    }
  };

  const createExcursion = async (data: CreateExcursionRequest) => {
    try {
      const response = await api.post<Excursion>('/excursions', data);
      setExcursions(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка создания экскурсии');
    }
  };

  const updateExcursion = async (id: string, data: UpdateExcursionRequest) => {
    try {
      const response = await api.patch<Excursion>(`/excursions/${id}`, data);
      setExcursions(prev => 
        prev.map(excursion => 
          excursion.id === id ? response.data : excursion
        )
      );
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка обновления экскурсии');
    }
  };

  const deleteExcursion = async (id: string) => {
    try {
      await api.delete(`/excursions/${id}`);
      setExcursions(prev => prev.filter(excursion => excursion.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка удаления экскурсии');
    }
  };

  const getExcursion = async (id: string) => {
    try {
      const response = await api.get<Excursion>(`/excursions/${id}`);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка загрузки экскурсии');
    }
  };

  useEffect(() => {
    fetchExcursions();
  }, [onlyMy]);

  return {
    excursions,
    isLoading,
    error,
    fetchExcursions,
    createExcursion,
    updateExcursion,
    deleteExcursion,
    getExcursion,
  };
};



