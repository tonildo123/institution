import { auth } from '@/services/firebase/firebaseConfig';
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
import { classroomIdFromURL, communicationIdFromURL, notificationURL } from './notificationLinks';
import { View, ActivityIndicator, Text, Linking } from 'react-native';
import { OfflineBanner } from '../components/OfflineBanner';

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

type PendingDetail =
  | { route: 'NotificationDetail'; communicationId: string }
  | { route: 'ClassroomNotificationDetail'; classroomId: string };

const navigationRef = createNavigationContainerRef<{
  MainApp: undefined;
  NotificationDetail: { communicationId: string };
  ClassroomNotificationDetail: { classroomId: string };
}>();

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

  const pendingMessage = useRef<PendingDetail | null>(null);
  const canNavigate = useRef(false);
  canNavigate.current = isReady && isAuthenticated && !isLoading;
  const openPendingMessage = useCallback(() => {
    const pending = pendingMessage.current;
    if (!canNavigate.current || !navigationRef.isReady() || !pending) return;
    // Esperar a que el stack autenticado esté montado.
    if (!navigationRef.getRootState()?.routeNames.includes(pending.route)) return;
    pendingMessage.current = null;
    if (pending.route === 'NotificationDetail') navigationRef.navigate('NotificationDetail', { communicationId: pending.communicationId });
    else navigationRef.navigate('ClassroomNotificationDetail', { classroomId: pending.classroomId });
  }, []);

  useEffect(() => {
    let active = true;
    const openURL = (url: string | null) => {
      if (!active || !url) return;
      const classroomId = classroomIdFromURL(url);
      const communicationId = communicationIdFromURL(url);
      if (classroomId) pendingMessage.current = { route: 'ClassroomNotificationDetail', classroomId };
      else if (communicationId) pendingMessage.current = { route: 'NotificationDetail', communicationId };
      else return;
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

      await auth.authStateReady();
      const savedUser = userData ? JSON.parse(userData) : null;
      if (savedUser && auth.currentUser?.uid === savedUser.id) {
        dispatch(setUser(serializeUser(savedUser)));
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
    <View style={{ flex: 1 }}>
      <OfflineBanner />
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
    </View>
  );
};

export default RootNavigator;
