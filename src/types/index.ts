// Global Types

export type UserRole = 'admin' | 'user' | 'guest';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  displayName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
