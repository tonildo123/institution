import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errorHandler';
import { VALIDATION } from '@/utils/constants';

/**
 * Hook de lógica para LoginScreen - SIMPLIFICADO
 *
 * Flujo:
 * 1. Usuario ingresa email/dni + password
 * 2. Detecta si es email o DNI automáticamente
 * 3. Consulta Firebase para obtener el rol
 * 4. Redirige según el rol
 */

export const useLoginLogic = () => {
  // Estado del formulario
  const [credential, setCredential] = useState(''); // email o DNI
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estado de validación
  const [credentialError, setCredentialError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Hook de autenticación
  const { loginWithCredential } = useAuth();

  /**
   * Detectar si es email o DNI
   */
  const isEmail = (value: string): boolean => {
    return VALIDATION.EMAIL_REGEX.test(value);
  };

  const isDNI = (value: string): boolean => {
    return VALIDATION.DNI_REGEX.test(value);
  };

  /**
   * Maneja cambios en la credencial
   */
  const handleCredentialChange = (value: string) => {
    setCredential(value);
    if (credentialError) {
      setCredentialError('');
    }
  };

  /**
   * Maneja cambios en la contraseña
   */
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  /**
   * Valida los datos
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Validar credencial
    if (!credential.trim()) {
      setCredentialError('Email o DNI requerido');
      isValid = false;
    } else if (!isEmail(credential) && !isDNI(credential)) {
      setCredentialError('Ingresa un email o DNI válido');
      isValid = false;
    } else {
      setCredentialError('');
    }

    // Validar contraseña
    if (!password) {
      setPasswordError('Contraseña requerida');
      isValid = false;
    } else if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      setPasswordError(`Mínimo ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`);
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  /**
   * Maneja el login
   * Firebase determinará el rol según el tipo de credencial
   */
  const handleLogin = async () => {
    try {
      setGeneralError('');

      // Validar formulario
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);

      // Determinar tipo de credencial
      const isEmailLogin = isEmail(credential);

      // Llamar al login con credencial
      await loginWithCredential({
        credential: credential.trim().toLowerCase(),
        password,
        type: isEmailLogin ? 'email' : 'dni',
      });

    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estado
    credential,
    password,
    showPassword,

    // Errores
    credentialError,
    passwordError,
    generalError,

    // Loading
    isLoading,

    // Handlers
    handleCredentialChange,
    handlePasswordChange,
    handleLogin,
    setShowPassword,
  };
};
