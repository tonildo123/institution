import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getEmailErrorMessage } from '@/utils/validators';
import { getErrorMessage } from '@/utils/errorHandler';

/**
 * Hook de lógica para ForgotPasswordScreen
 * Maneja: envío de email de recuperación
 */

export const useForgotPasswordLogic = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { resetPassword } = useAuth();

  /**
   * Maneja cambios en email
   */
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
    if (successMessage) setSuccessMessage('');
  };

  /**
   * Valida el email
   */
  const validateEmail = (): boolean => {
    const error = getEmailErrorMessage(email);
    if (error) {
      setEmailError(error);
      return false;
    }
    setEmailError('');
    return true;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSendReset = async () => {
    try {
      setGeneralError('');
      setSuccessMessage('');

      if (!validateEmail()) {
        return;
      }

      setIsLoading(true);

      // Llamar a resetPassword
      await resetPassword(email.trim().toLowerCase());

      setSuccessMessage(
        `✅ Email enviado a ${email}\n\nRevisa tu bandeja de entrada para el link de recuperación`
      );
      setEmail('');
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
    setGeneralError('');
  };

  return {
    email,
    emailError,
    generalError,
    successMessage,
    isLoading,
    handleEmailChange,
    handleSendReset,
    clearErrors,
  };
};
