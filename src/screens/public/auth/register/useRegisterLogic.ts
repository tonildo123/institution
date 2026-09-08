import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SignUpCredentials } from '@/types';
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  getEmailErrorMessage,
  getPasswordErrorMessage,
} from '@/utils/validators';
import { getErrorMessage } from '@/utils/errorHandler';

/**
 * Hook de lógica para RegisterScreen
 * Maneja: estado del formulario, validación, y registro
 */

export const useRegisterLogic = () => {
  // Estado del formulario
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Estado de validación
  const [displayNameError, setDisplayNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');

  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Hook de autenticación
  const { signUp } = useAuth();

  /**
   * Maneja cambios en displayName
   */
  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (displayNameError) setDisplayNameError('');
  };

  /**
   * Maneja cambios en email
   */
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  /**
   * Maneja cambios en password
   */
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError('');
    if (passwordConfirmError && passwordConfirm) {
      // Revalidar si los passwords no coinciden
      if (value !== passwordConfirm) {
        setPasswordConfirmError('Las contraseñas no coinciden');
      } else {
        setPasswordConfirmError('');
      }
    }
  };

  /**
   * Maneja cambios en passwordConfirm
   */
  const handlePasswordConfirmChange = (value: string) => {
    setPasswordConfirm(value);
    if (passwordConfirmError) {
      if (value !== password) {
        setPasswordConfirmError('Las contraseñas no coinciden');
      } else {
        setPasswordConfirmError('');
      }
    }
  };

  /**
   * Valida los datos del formulario
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Validar displayName
    if (!isValidName(displayName)) {
      setDisplayNameError('El nombre debe tener al menos 2 caracteres');
      isValid = false;
    } else {
      setDisplayNameError('');
    }

    // Validar email
    const emailErr = getEmailErrorMessage(email);
    if (emailErr) {
      setEmailError(emailErr);
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validar password
    const passErr = getPasswordErrorMessage(password);
    if (passErr) {
      setPasswordError(passErr);
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validar passwordConfirm
    if (!passwordConfirm) {
      setPasswordConfirmError('Confirma tu contraseña');
      isValid = false;
    } else if (password !== passwordConfirm) {
      setPasswordConfirmError('Las contraseñas no coinciden');
      isValid = false;
    } else {
      setPasswordConfirmError('');
    }

    return isValid;
  };

  /**
   * Maneja el envío del formulario de registro
   */
  const handleRegister = async () => {
    try {
      setGeneralError('');
      setSuccessMessage('');

      // Validar formulario
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);

      // Preparar credenciales
      const credentials: SignUpCredentials = {
        email: email.trim().toLowerCase(),
        password,
        displayName: displayName.trim(),
      };

      // Llamar al signup
      await signUp(credentials);

      setSuccessMessage('¡Registro exitoso! Iniciando sesión...');
      // La navegación se manejará desde el navigator
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
    setDisplayNameError('');
    setEmailError('');
    setPasswordError('');
    setPasswordConfirmError('');
    setGeneralError('');
  };

  return {
    // Estado del formulario
    displayName,
    email,
    password,
    passwordConfirm,
    showPassword,
    showPasswordConfirm,

    // Errores
    displayNameError,
    emailError,
    passwordError,
    passwordConfirmError,
    generalError,
    successMessage,

    // Estado de carga
    isLoading,

    // Manejadores
    handleDisplayNameChange,
    handleEmailChange,
    handlePasswordChange,
    handlePasswordConfirmChange,
    handleRegister,
    setShowPassword,
    setShowPasswordConfirm,
    clearErrors,
  };
};
