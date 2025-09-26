export interface UserWithDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'guide' | 'user';
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRoleRequest {
  role: 'admin' | 'guide' | 'user';
}



