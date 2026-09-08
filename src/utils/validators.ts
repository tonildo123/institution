/**
 * Funciones de validación reutilizables
 */

/**
 * Valida si un email es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una contraseña es segura
 * Mínimo: 8 caracteres, mayúscula, minúscula, número
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Valida el nombre
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

/**
 * Obtiene el mensaje de error para una contraseña
 */
export const getPasswordErrorMessage = (password: string): string | null => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Requiere mayúscula';
  if (!/[a-z]/.test(password)) return 'Requiere minúscula';
  if (!/\d/.test(password)) return 'Requiere número';
  return null;
};

/**
 * Obtiene el mensaje de error para un email
 */
export const getEmailErrorMessage = (email: string): string | null => {
  if (!email) return 'El email es requerido';
  if (!isValidEmail(email)) return 'Email inválido';
  return null;
};
