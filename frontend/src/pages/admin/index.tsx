import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RoleSelector from '@/components/admin/RoleSelector';

const AdminPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { users, isLoading, error, updateUserRole } = useUsers();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-semibold mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <Layout title="Панель администратора - BirdWatch">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Панель администратора
          </h1>
          <p className="text-gray-600 mt-2">
            Управление пользователями и их ролями
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Управление пользователями</CardTitle>
            <CardDescription>
              Просмотр и изменение ролей пользователей системы
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Пользователь
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Роль
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Дата регистрации
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userData) => (
                    <tr key={userData.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {userData.firstName} {userData.lastName}
                          </div>
                          {userData.phone && (
                            <div className="text-sm text-gray-500">
                              {userData.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {userData.email}
                      </td>
                      <td className="py-4 px-4">
                        <RoleSelector
                          user={userData}
                          onRoleUpdate={updateUserRole}
                          currentUserId={user.id}
                        />
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(userData.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && !error && (
                <div className="text-center py-8 text-gray-500">
                  Пользователи не найдены
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Всего пользователей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Экскурсоводы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {users.filter(u => u.role === 'guide').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Администраторы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;



