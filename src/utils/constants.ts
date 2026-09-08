/**
 * Constantes globales de la aplicación
 */

// URLs
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || 'development';

// Rutas de navegación
export const ROUTES = {
  // Auth
  LOGIN: 'Login',
  SIGNUP: 'SignUp',
  FORGOT_PASSWORD: 'ForgotPassword',
  ONBOARDING: 'Onboarding',

  // Private
  DASHBOARD: 'Dashboard',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
};

// Timing
export const TIMEOUTS = {
  SHORT: 3000,      // 3 segundos
  MEDIUM: 5000,     // 5 segundos
  LONG: 10000,      // 10 segundos
};

// Errores comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Intenta de nuevo.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  VALIDATION_ERROR: 'Por favor verifica los datos.',
  UNKNOWN_ERROR: 'Algo salió mal. Intenta de nuevo.',
};

// Validación
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
};

// Notificaciones
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Colores
export const COLORS = {
  PRIMARY: '#007AFF',
  SUCCESS: '#34C759',
  ERROR: '#FF3B30',
  WARNING: '#FF9500',
  INFO: '#00B4DB',
  BACKGROUND: '#f8f9fa',
  TEXT_PRIMARY: '#1a1a1a',
  TEXT_SECONDARY: '#666',
  BORDER: '#ddd',
};
