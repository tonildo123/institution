// Global Types

export type UserRole = 'admin' | 'familia' | 'preceptor';

/**
 * Credenciales requeridas por rol:
 * - admin: email + password
 * - familia: dni + password
 * - preceptor: email + password
 */
export interface User {
  id: string;
  role: UserRole;

  // Credenciales (varían según el rol)
  email?: string;        // admin, preceptor
  dni?: string;          // familia
  password?: string;     // (nunca enviado desde el cliente)

  // Información personal
  displayName: string;
  photoURL?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  enabledAt?: Date;      // Cuándo se habilitó la cuenta

  // Tokens para notificaciones push
  pushTokens: string[];  // Array de tokens FCM

  // Metadata
  isEnabled: boolean;    // Cuenta habilitada/deshabilitada
  lastLogin?: Date;
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

/**
 * Credenciales para crear usuario desde el admin panel
 */
export interface CreateUserCredentials {
  displayName: string;
  role: UserRole;
  email?: string;      // Requerido para admin, preceptor
  dni?: string;        // Requerido para familia
  password: string;
  isEnabled?: boolean;
}

/**
 * Datos de usuario para actualizar (sin password)
 */
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
