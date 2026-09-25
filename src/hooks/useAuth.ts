import { serializeUser } from '@/utils/serializeUser';
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
import { getUserByDNI, getUserByEmail } from '@/services/firebase/users';
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
  const currentUser = useSelector((state: RootState) => state.auth.user);

  /**
   * Monitorear cambios en Firebase Auth
   * NOTA: Solo sincroniza Firebase Auth. Los logins de Firestore (DNI) se manejan en loginWithCredential
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('🔐 Firebase Auth: Usuario autenticado');
          // Usuario autenticado en Firebase Auth
          const userData = await getUserData(firebaseUser.uid);
          if (userData && auth.currentUser?.uid === firebaseUser.uid) {
            dispatch(setUser(serializeUser(userData)));
            // Guardar en AsyncStorage para persistencia
            await AsyncStorage.setItem('user', JSON.stringify(serializeUser(userData)));
          }
        } else {
          console.log('🔐 Firebase Auth: Sin usuario');
          // Usuario NO autenticado en Firebase Auth
          // Pero NO reseteamos si hay un usuario activo en Redux (login de Firestore)
          if (currentUser?.id?.startsWith('user_')) {
            // Es un usuario de Firestore, lo mantenemos
            console.log('🔐 Manteniendo usuario de Firestore:', currentUser.displayName);
          } else {
            // No hay usuario o fue de Firebase Auth, reseteamos
            dispatch(setUser(null));
            await AsyncStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error en monitoreo de auth:', error);
        // No reseteamos aquí, dejar que el usuario intente de nuevo
      }
    });

    return () => unsubscribe();
  }, [dispatch, currentUser?.id]);

  /**
   * Serializar fechas de Date a ISO string
   */


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
          const serializedUser = serializeUser(userData);
          dispatch(loginSuccess(serializedUser));
          // Guardar en AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(serializedUser));
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
        const serializedUser = serializeUser(user);
        dispatch(loginSuccess(serializedUser));
        // Guardar en AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(serializedUser));
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
   * Login con credencial (email o DNI)
   * Determina automáticamente el rol consultando Firebase
   */
  const loginWithCredential = useCallback(
    async (params: {
      credential: string; // email o DNI
      password: string;
      type: 'email' | 'dni';
    }) => {
      try {
        console.log('🚀 loginWithCredential iniciado:', {
          credential: params.credential,
          type: params.type,
        });

        dispatch(setLoading(true));
        dispatch(clearError());

        let user = null;

        if (params.type === 'email') {
          console.log('📧 Buscando por email...');
          // Buscar por email
          user = await getUserByEmail(params.credential);
          if (!user) {
            throw new Error('Email no registrado');
          }
          if (!user.isEnabled) {
            throw new Error('Cuenta deshabilitada');
          }

          // Validar que sea admin, preceptor, equipo directivo o representante legal
          if (user.role !== 'admin' && user.role !== 'preceptor' && user.role !== 'equipo directivo' && user.role !== 'representante legal') {
            throw new Error('Este email no tiene permisos para acceder');
          }

          console.log('✅ Usuario email encontrado y validado:', user.displayName);
          const authenticated = await loginWithEmail({ email: user.email!, password: params.password });
          if (authenticated.uid !== user.id) {
            await logout();
            throw new Error('La cuenta de Firebase Auth no está vinculada al usuario. Contactá al administrador para completar la vinculación.');
          }
        } else if (params.type === 'dni') {
          console.log('🆔 Buscando por DNI...');
          // Buscar por DNI
          try {
            console.log('⏳ Llamando getUserByDNI...');
            user = await getUserByDNI(params.credential);
            console.log('📋 Resultado de búsqueda:', user);
          } catch (searchError: any) {
            console.error('❌ Error en búsqueda:', searchError);
            throw searchError;
          }

          if (!user) {
            console.log('⚠️ Usuario no encontrado');
            throw new Error('DNI no registrado');
          }

          console.log('✅ Usuario encontrado:', user.displayName);

          if (!user.isEnabled) {
            throw new Error('Cuenta deshabilitada');
          }

          // Validar que sea familia
          if (user.role !== 'familia') {
            throw new Error('Este DNI no corresponde a una familia');
          }

          console.log('✅ Usuario familia encontrado y validado');
          // Para DNI, no hacemos login en Firebase Auth
          // Solo usamos el usuario de Firestore
        }

        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        // Serializar usuario antes de guardar en Redux
        const serializedUser = serializeUser(user);

        console.log('💾 Guardando en Redux:', {
          user: serializedUser.displayName,
          role: serializedUser.role,
        });

        console.log('📤 Despachando loginSuccess...');
        // Actualizar Redux con el usuario serializado
        dispatch(loginSuccess(serializedUser));
        console.log('✅ loginSuccess despachado');
        // Guardar en AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(serializedUser));

        console.log('🎉 Login exitoso! Usuario:', serializedUser.displayName);
      } catch (err: any) {
        console.error('💥 Error en loginWithCredential:', err);
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
          const serializedUser = serializeUser(userData);
          dispatch(loginSuccess(serializedUser));
          // Guardar en AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(serializedUser));
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
    loginWithCredential,
    signUp,
    logout: logoutUser,
    resetPassword,
    clearError: handleClearError,
  };
};
