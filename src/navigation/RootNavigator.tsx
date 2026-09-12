import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser, setLoading } from '@/redux/slices/authSlice';
import { RootState } from '@/redux/store';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { linking } from './linking';
import { View, ActivityIndicator, Text } from 'react-native';

/**
 * Root Navigator
 *
 * Cambia entre:
 * - AuthNavigator (Login, Signup) si NO está autenticado
 * - AppNavigator (Dashboard, Profile) si SÍ está autenticado
 *
 * También maneja:
 * - Recuperación de sesión desde AsyncStorage
 * - Deep Linking
 */

const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 20, fontSize: 16 }}>Cargando...</Text>
  </View>
);

export const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
  const [isReady, setIsReady] = React.useState(false);

  // Log cambios de autenticación
  useEffect(() => {
    console.log('🔐 RootNavigator - Estado auth:', {
      isAuthenticated: !!isAuthenticated,
      user: user?.displayName,
      isLoading,
    });
    console.log('📱 Renderizando:', isAuthenticated ? 'AppNavigator' : 'AuthNavigator');
  }, [isAuthenticated, user, isLoading]);

  /**
   * 1. Al iniciar la app, recuperar usuario de AsyncStorage
   * 2. Esto mantiene la sesión incluso si cierras la app
   */
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      dispatch(setLoading(true));

      // Recuperar usuario guardado
      const userData = await AsyncStorage.getItem('user');

      if (userData) {
        dispatch(setUser(JSON.parse(userData)));
      } else {
        dispatch(setUser(null));
      }
    } catch (e) {
      console.error('Error recuperando usuario:', e);
      dispatch(setUser(null));
    } finally {
      dispatch(setLoading(false));
      setIsReady(true);
    }
  };

  // Mostrar splash mientras se recupera la sesión
  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      linking={linking}
      fallback={<SplashScreen />}
      onReady={() => console.log('Navigation ready')}
    >
      {isAuthenticated ? (
        // 🔐 Usuario autenticado → Pantallas protegidas
        <AppNavigator />
      ) : (
        // 🔓 Usuario no autenticado → Pantallas públicas
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
