import { useState, useEffect } from 'react';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/categories';
import { api } from '@/utils/api';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CreateCategoryDto): Promise<Category> => {
    try {
      setError(null);
      const response = await api.post('/categories', data);
      await fetchCategories(); // Обновляем список
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка создания категории';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    try {
      setError(null);
      const response = await api.patch(`/categories/${id}`, data);
      await fetchCategories(); // Обновляем список
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка обновления категории';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      setError(null);
      await api.delete(`/categories/${id}`);
      await fetchCategories(); // Обновляем список
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка удаления категории';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deactivateCategory = async (id: string): Promise<Category> => {
    try {
      setError(null);
      const response = await api.patch(`/categories/${id}/deactivate`);
      await fetchCategories(); // Обновляем список
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка деактивации категории';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    deactivateCategory,
  };
};
