import React, { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserWithDetails } from '@/types/users';

interface RoleSelectorProps {
  user: UserWithDetails;
  onRoleUpdate: (userId: string, role: 'admin' | 'guide' | 'user') => Promise<UserWithDetails>;
  currentUserId: string;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ 
  user, 
  onRoleUpdate, 
  currentUserId 
}) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'guide' | 'user'>(user.role);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value as 'admin' | 'guide' | 'user');
    setError(null);
  };

  const handleUpdate = async () => {
    if (selectedRole === user.role) return;

    setIsUpdating(true);
    setError(null);

    try {
      await onRoleUpdate(user.id, selectedRole);
    } catch (err: any) {
      setError(err.message);
      setSelectedRole(user.role); // Возвращаем к исходной роли при ошибке
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'guide': return 'Экскурсовод';
      case 'user': return 'Пользователь';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'guide': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isCurrentUser = user.id === currentUserId;
  const hasChanges = selectedRole !== user.role;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
        
        {!isCurrentUser && (
          <>
            <span className="text-gray-400">→</span>
            <Select 
              value={selectedRole} 
              onChange={handleRoleChange}
              disabled={isUpdating}
              className="w-32"
            >
              <option value="user">Пользователь</option>
              <option value="guide">Экскурсовод</option>
              <option value="admin">Администратор</option>
            </Select>
          </>
        )}
      </div>

      {!isCurrentUser && hasChanges && (
        <Button
          onClick={handleUpdate}
          disabled={isUpdating}
          size="sm"
          className="ml-2"
        >
          {isUpdating ? 'Сохранение...' : 'Сохранить'}
        </Button>
      )}

      {isCurrentUser && (
        <span className="text-xs text-gray-500 ml-2">
          (Ваш аккаунт)
        </span>
      )}

      {error && (
        <span className="text-xs text-red-500 ml-2">
          {error}
        </span>
      )}
    </div>
  );
};

export default RoleSelector;
