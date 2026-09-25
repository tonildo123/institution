import { serializeUser } from '@/utils/serializeUser';
import React, { useEffect, useRef, useCallback } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser, setLoading } from '@/redux/slices/authSlice';
import { RootState } from '@/redux/store';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import messaging from '@react-native-firebase/messaging';
import { communicationIdFromURL, notificationURL } from './notificationLinks';
import { View, ActivityIndicator, Text, Linking } from 'react-native';

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

const navigationRef = createNavigationContainerRef<{ MainApp: undefined; NotificationDetail: { communicationId: string } }>();

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

  const pendingMessage = useRef<string | null>(null);
  const canNavigate = useRef(false);
  canNavigate.current = isReady && isAuthenticated && !isLoading;
  const openPendingMessage = useCallback(() => {
    if (!canNavigate.current || !navigationRef.isReady() || !pendingMessage.current) return;
    // Esperar a que el stack autenticado esté montado.
    if (!navigationRef.getRootState()?.routeNames.includes('NotificationDetail')) return;
    const communicationId = pendingMessage.current;
    pendingMessage.current = null;
    navigationRef.navigate('NotificationDetail', { communicationId });
  }, []);

  useEffect(() => {
    let active = true;
    const openURL = (url: string | null) => {
      if (!active || !url) return;
      const id = communicationIdFromURL(url);
      if (!id) return;
      pendingMessage.current = id;
      openPendingMessage();
    };
    const unsubscribe = messaging().onNotificationOpenedApp(message => openURL(notificationURL(message.data)));
    const linkSubscription = Linking.addEventListener('url', event => openURL(event.url));
    Promise.all([Linking.getInitialURL(), messaging().getInitialNotification()])
      .then(([url, message]) => openURL(notificationURL(message?.data) || url))
      .catch(() => console.warn('No se pudo recuperar la notificación inicial'));
    return () => { active = false; unsubscribe(); linkSubscription.remove(); };
  }, [openPendingMessage]);

  useEffect(() => { openPendingMessage(); }, [isReady, isAuthenticated, isLoading, openPendingMessage]);

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
        dispatch(setUser(serializeUser(JSON.parse(userData))));
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
      ref={navigationRef}
      onStateChange={openPendingMessage}
      fallback={<SplashScreen />}
      onReady={openPendingMessage}
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
