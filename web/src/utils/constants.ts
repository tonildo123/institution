/**
 * CONSTANTES GLOBALES
 * Fuente de verdad para toda la aplicación
 * Usado en: mobile (React Native) + web (Vite)
 */

// ==================== Firebase Collections ====================
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
} as const;

// ==================== User Roles ====================
export const USER_ROLES = {
  ADMIN: 'admin',
  FAMILIA: 'familia',
  PRECEPTOR: 'preceptor',
} as const;

// ==================== Validation Rules ====================
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_DNI_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DNI_REGEX: /^\d{8,}$/,
} as const;

// ==================== API Routes ====================
export const API_ROUTES = {
  BASE_URL: 'http://localhost:3000',
} as const;

// ==================== App Info ====================
export const APP_INFO = {
  NAME: 'Instituto',
  VERSION: '1.0.0',
  AUTHOR: 'Xetro',
} as const;

// ==================== Routes ====================
export const ROUTES = {
  // Public
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Private
  DASHBOARD: 'Dashboard',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
} as const;

// ==================== Timeouts ====================
export const TIMEOUTS = {
  API_REQUEST: 30000,
  LOADING_INDICATOR: 500,
} as const;
