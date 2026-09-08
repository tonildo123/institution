/**
 * Manejo centralizado de errores
 */

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
}

/**
 * Convierte errores de Firebase a mensajes amigables
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error.code) {
    switch (error.code) {
      // Auth errors
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/email-already-in-use':
        return 'El email ya está registrado';
      case 'auth/weak-password':
        return 'La contraseña es muy débil';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/user-disabled':
        return 'Usuario deshabilitado';
      case 'auth/operation-not-allowed':
        return 'Operación no permitida';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde';

      // Firestore errors
      case 'permission-denied':
        return 'No tienes permisos para realizar esta acción';
      case 'not-found':
        return 'Documento no encontrado';
      case 'already-exists':
        return 'El documento ya existe';

      default:
        return error.message || 'Error desconocido';
    }
  }

  return error.message || 'Error desconocido';
};

/**
 * Valida y normaliza errores
 */
export const normalizeError = (error: any): ErrorInfo => {
  return {
    code: error.code || 'UNKNOWN_ERROR',
    message: getErrorMessage(error),
    details: error,
  };
};

/**
 * Log de errores (útil para debugging)
 */
export const logError = (error: any, context?: string) => {
  console.error(`[Error${context ? ` - ${context}` : ''}]`, {
    code: error.code,
    message: error.message,
    details: error,
  });
};
