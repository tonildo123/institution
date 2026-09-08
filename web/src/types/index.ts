// Web App Types (shared with mobile types)

export type UserRole = 'admin' | 'familia' | 'preceptor';

export interface User {
  id: string;
  role: UserRole;
  email?: string;
  dni?: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  enabledAt?: Date;
  pushTokens: string[];
  isEnabled: boolean;
  lastLogin?: Date;
}

export interface CreateUserCredentials {
  displayName: string;
  role: UserRole;
  email?: string;
  dni?: string;
  password: string;
  isEnabled?: boolean;
}

export interface UpdateUserData {
  displayName?: string;
  email?: string;
  dni?: string;
  photoURL?: string;
  isEnabled?: boolean;
  enabledAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
