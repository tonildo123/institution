/**
 * Tipos específicos del módulo Login
 */

export interface LoginFormState {
  email: string;
  password: string;
  showPassword: boolean;
}

export interface LoginFormErrors {
  emailError: string;
  passwordError: string;
  generalError: string;
}

export interface LoginScreenProps {
  navigation?: any;
}
