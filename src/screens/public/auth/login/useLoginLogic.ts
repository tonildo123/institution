import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginCredentials, UserRole } from '@/types';
import {
  isValidEmail,
  getEmailErrorMessage,
} from '@/utils/validators';
import { getErrorMessage } from '@/utils/errorHandler';

/**
 * Hook de lógica para LoginScreen
 * Soporta 3 roles:
 * - Admin: email + password
 * - Preceptor: email + password
 * - Familia: DNI + password
 */

export const useLoginLogic = () => {
  // Estado del formulario
  const [credential, setCredential] = useState(''); // email o DNI
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('familia');
  const [showPassword, setShowPassword] = useState(false);

  // Estado de validación
  const [credentialError, setCredentialError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Hook de autenticación
  const { login, loginWithDNI } = useAuth();

  /**
   * Detectar automáticamente el rol según lo que escribe
   * Email → admin/preceptor
   * DNI (8+ dígitos) → familia
   */
  const detectRoleFromCredential = (value: string): UserRole | null => {
    if (!value) return null;

    // Si tiene @ es email
    if (value.includes('@')) {
      return 'admin'; // Asume admin, el usuario puede cambiar
    }

    // Si es solo números y tiene 8+ caracteres, es DNI
    if (/^\d{8,}$/.test(value)) {
      return 'familia';
    }

    return null;
  };

  /**
   * Maneja cambios en la credencial (email o DNI)
   */
  const handleCredentialChange = (value: string) => {
    setCredential(value);

    // Auto-detectar rol
    const detectedRole = detectRoleFromCredential(value);
    if (detectedRole) {
      setSelectedRole(detectedRole);
    }

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
   * Cambia el rol manualmente
   */
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setCredential('');
    setCredentialError('');
  };

  /**
   * Valida los datos según el rol
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Validar credencial según el rol
    if (selectedRole === 'familia') {
      // DNI: debe ser números, mínimo 8 caracteres
      if (!credential) {
        setCredentialError('DNI requerido');
        isValid = false;
      } else if (!/^\d{8,}$/.test(credential)) {
        setCredentialError('DNI inválido (números solamente)');
        isValid = false;
      } else {
        setCredentialError('');
      }
    } else {
      // Email para admin y preceptor
      const emailError = getEmailErrorMessage(credential);
      if (emailError) {
        setCredentialError(emailError);
        isValid = false;
      } else {
        setCredentialError('');
      }
    }

    // Validar contraseña
    if (!password) {
      setPasswordError('Contraseña requerida');
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

      // Login según el rol
      if (selectedRole === 'familia') {
        // Login por DNI
        await loginWithDNI(credential.trim(), password, selectedRole);
      } else {
        // Login por email (admin/preceptor)
        const credentials: LoginCredentials = {
          email: credential.trim().toLowerCase(),
          password,
        };
        await login(credentials, selectedRole);
      }

      setSuccessMessage('¡Login exitoso!');
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
    setCredentialError('');
    setPasswordError('');
    setGeneralError('');
  };

  return {
    // Estado del formulario
    credential,
    password,
    selectedRole,
    showPassword,

    // Errores
    credentialError,
    passwordError,
    generalError,
    successMessage,

    // Estado de carga
    isLoading,

    // Manejadores
    handleCredentialChange,
    handlePasswordChange,
    handleRoleChange,
    handleLogin,
    setShowPassword,
    clearErrors,
  };
};
