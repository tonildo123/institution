import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@/services/firebase/firebaseConfig';
import {
  loginWithEmail,
  signUpWithEmail,
  logout,
  sendPasswordReset,
  getUserData,
} from '@/services/firebase/auth';
import { getUserByDNI } from '@/services/firebase/users';
import { LoginCredentials, SignUpCredentials, UserRole } from '@/types';
import { onAuthStateChanged } from 'firebase/auth';
import {
  setUser,
  setLoading,
  setError,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  clearError,
} from '@/redux/slices/authSlice';
import { RootState } from '@/redux/store';

/**
 * Hook de Autenticación
 *
 * Integra:
 * - Redux para estado global
 * - AsyncStorage para persistencia
 * - Firebase Auth para autenticación
 */

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth_state = useSelector((state: RootState) => state.auth);

  /**
   * Monitorear cambios en Firebase Auth
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Usuario autenticado
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            dispatch(setUser(userData));
            // Guardar en AsyncStorage para persistencia
            await AsyncStorage.setItem('user', JSON.stringify(userData));
          }
        } else {
          // Usuario no autenticado
          dispatch(setUser(null));
          await AsyncStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error en monitoreo de auth:', error);
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  /**
   * Inicia sesión con email (admin/preceptor)
   */
  const login = useCallback(
    async (credentials: LoginCredentials, role?: UserRole) => {
      try {
        dispatch(setLoading(true));
        dispatch(clearError());

        // Login con Firebase
        const firebaseUser = await loginWithEmail(credentials);

        // Obtener datos del usuario
        const userData = await getUserData(firebaseUser.uid);
        if (userData) {
          dispatch(loginSuccess(userData));
          // Guardar en AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Error al iniciar sesión';
        dispatch(loginFailure(errorMessage));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Inicia sesión con DNI (familia)
   * Busca en Firestore el usuario por DNI
   */
  const loginWithDNI = useCallback(
    async (dni: string, password: string, role: UserRole = 'familia') => {
      try {
        dispatch(setLoading(true));
        dispatch(clearError());

        // Buscar usuario por DNI
        const user = await getUserByDNI(dni);

        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        if (user.role !== 'familia') {
          throw new Error('Este DNI no corresponde a una familia');
        }

        // Verificar contraseña (aquí iría la verificación real)
        // Por ahora, asumimos que es válida
        // En producción, esto debe hacerse de forma segura

        // Usuario autenticado
        dispatch(loginSuccess(user));
        // Guardar en AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } catch (err: any) {
        const errorMessage = err.message || 'Error al iniciar sesión';
        dispatch(loginFailure(errorMessage));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Registra un nuevo usuario
   */
  const signUp = useCallback(
    async (credentials: any) => {
      try {
        dispatch(setLoading(true));
        dispatch(clearError());

        // Signup con Firebase
        const firebaseUser = await signUpWithEmail(credentials);

        // Obtener datos del usuario
        const userData = await getUserData(firebaseUser.uid);
        if (userData) {
          dispatch(loginSuccess(userData));
          // Guardar en AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Error al registrarse';
        dispatch(loginFailure(errorMessage));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Cierra la sesión
   */
  const logoutUser = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      await logout(); // Firebase logout
      dispatch(logoutAction()); // Redux logout
      await AsyncStorage.removeItem('user'); // Limpiar AsyncStorage
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cerrar sesión';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Envía email de recuperación de contraseña
   */
  const resetPassword = useCallback(
    async (email: string) => {
      try {
        dispatch(setLoading(true));
        dispatch(clearError());
        await sendPasswordReset(email);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al enviar email';
        dispatch(setError(errorMessage));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Limpiar error
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...auth_state,
    login,
    loginWithDNI,
    signUp,
    logout: logoutUser,
    resetPassword,
    clearError: handleClearError,
  };
};
