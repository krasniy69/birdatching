import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Excursion, CreateExcursionRequest, UpdateExcursionRequest } from '@/types/excursions';

export const useExcursions = (onlyMy = false, categoryIds?: string[]) => {
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExcursions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (onlyMy) {
        params.append('my', 'true');
      }
      if (categoryIds && categoryIds.length > 0) {
        params.append('categories', categoryIds.join(','));
      }
      
      const queryString = params.toString();
      const url = `/excursions${queryString ? `?${queryString}` : ''}`;
      const response = await api.get<Excursion[]>(url);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyMy, categoryIds ? categoryIds.join(',') : '']);

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



