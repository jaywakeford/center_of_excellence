export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  jobTitle?: string;
  phoneNumber?: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: UserRole[];
}

export interface UserRole {
  id: string;
  assignedAt: string;
  role: Role;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
} 