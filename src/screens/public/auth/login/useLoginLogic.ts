import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginCredentials } from '@/types';
import {
  isValidEmail,
  isValidPassword,
  getEmailErrorMessage,
  getPasswordErrorMessage,
} from '@/utils/validators';
import { getErrorMessage } from '@/utils/errorHandler';

/**
 * Hook de lógica para LoginScreen
 * Maneja: estado del formulario, validación, y login
 */

export const useLoginLogic = () => {
  // Estado del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estado de validación
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Hook de autenticación
  const { login } = useAuth();

  /**
   * Maneja cambios en el email
   */
  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Limpiar error cuando el usuario empieza a escribir
    if (emailError) {
      setEmailError('');
    }
  };

  /**
   * Maneja cambios en la contraseña
   */
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Limpiar error cuando el usuario empieza a escribir
    if (passwordError) {
      setPasswordError('');
    }
  };

  /**
   * Valida los datos del formulario
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Validar email
    const emailError = getEmailErrorMessage(email);
    if (emailError) {
      setEmailError(emailError);
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validar contraseña
    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  /**
   * Maneja el envío del formulario de login
   */
  const handleLogin = async () => {
    try {
      setGeneralError('');
      setSuccessMessage('');

      // Validar formulario
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);

      // Preparar credenciales
      const credentials: LoginCredentials = {
        email: email.trim().toLowerCase(),
        password,
      };

      // Llamar al login
      await login(credentials);

      setSuccessMessage('¡Login exitoso!');
      // La navegación se manejará desde la pantalla o el navigator
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpia los errores
   */
  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
  };

  return {
    // Estado del formulario
    email,
    password,
    showPassword,

    // Errores
    emailError,
    passwordError,
    generalError,
    successMessage,

    // Estado de carga
    isLoading,

    // Manejadores
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
    setShowPassword,
    clearErrors,
  };
};
