// Web App Types (shared with mobile types)

/** Roles de la app móvil. Un usuario puede tener uno o varios (multirol, pendiente). */
export type UserRole = 'admin' | 'equipo directivo' | 'representante legal' | 'preceptor' | 'familia' | 'user';

/** Roles con acceso al panel de administración de la web. */
export const ADMIN_ROLES: UserRole[] = ['admin', 'equipo directivo', 'representante legal'];

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
