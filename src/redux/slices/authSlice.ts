import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

/**
 * Auth Redux Slice
 * Maneja el estado de autenticación global
 */

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Recuperar usuario del almacenamiento
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // Establecer estado de carga
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Establecer error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Login exitoso
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    // Login fallido
    loginFailure: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    // Limpiar error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
