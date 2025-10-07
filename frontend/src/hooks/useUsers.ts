import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { UserWithDetails, UpdateUserRoleRequest } from '@/types/users';

export const useUsers = () => {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<UserWithDetails[]>('/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'guide' | 'user') => {
    try {
      const response = await api.patch<UserWithDetails>(`/users/${userId}/role`, { role });
      
      // Обновляем пользователя в списке
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: response.data.role, updatedAt: response.data.updatedAt }
            : user
        )
      );
      
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка обновления роли');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUserRole,
  };
};




