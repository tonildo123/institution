/**
 * Servicio de Push Notifications
 * Basado en implementación comprobada de viandas
 * @react-native-firebase v24.0.0
 */

import messaging from '@react-native-firebase/messaging';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';
import { PermissionsAndroid, Platform } from 'react-native';
import { FIREBASE_COLLECTIONS } from '@/utils/constants';

/**
 * Solicita permiso para Android 13+ (POST_NOTIFICATIONS)
 */
async function requestAndroidNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS !== 'android') return true;
    if (Number(Platform.Version) < 33) return true;

    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (alreadyGranted) {
      console.log('✅ Permiso POST_NOTIFICATIONS ya otorgado');
      return true;
    }

    console.log('🔔 Solicitando permiso POST_NOTIFICATIONS en Android 13+...');
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    const granted = status === PermissionsAndroid.RESULTS.GRANTED;
    if (granted) {
      console.log('✅ Permiso POST_NOTIFICATIONS otorgado');
    } else {
      console.warn('⚠️ Permiso POST_NOTIFICATIONS denegado');
    }

    return granted;
  } catch (error) {
    console.error('❌ Error solicitando permiso POST_NOTIFICATIONS:', error);
    return false;
  }
}

/**
 * Solicita permiso a Firebase Messaging (iOS y Android)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    console.log('🔔 Solicitando permisos a Firebase Messaging...');

    // Solicitar permiso de Android primero
    const androidPermissionGranted = await requestAndroidNotificationPermission();
    console.log(`📱 Permiso Android: ${androidPermissionGranted}`);

    // Luego solicitar a Firebase Messaging (iOS y Android)
    const authorizationStatus = await messaging().requestPermission();

    const enabled =
      authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Permisos de notificación otorgados');
    } else {
      console.warn('⚠️ Permisos de notificación denegados por el usuario');
    }

    return enabled;
  } catch (error) {
    console.error('❌ Error solicitando permisos:', error);
    return false;
  }
}

/**
 * Obtiene el FCM token del dispositivo y lo guarda en Firestore
 */
export async function registerDeviceToken(userId: string): Promise<string> {
  try {
    // Solicitar permisos primero
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('⚠️ No hay permisos para notificaciones');
      return '';
    }

    // Obtener el token FCM
    console.log('📱 Obteniendo FCM token...');
    const token = await messaging().getToken();

    if (!token) {
      console.warn('❌ No se pudo obtener el token FCM');
      return '';
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ 🔑 FCM TOKEN OBTENIDO:');
    console.log(token);
    console.log('═══════════════════════════════════════');

    // Obtener documento del usuario
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.warn('⚠️ Usuario no encontrado en Firestore');
      return token;
    }

    const userData = userDoc.data();
    const existingTokens = userData?.pushTokens || [];

    // Comparar token nuevo con los guardados
    const tokenAlreadyExists = existingTokens.some((t: any) => t.token === token);

    if (tokenAlreadyExists) {
      console.log('✅ Token sin cambios, se mantiene');
      return token;
    }

    // Token cambió o es nuevo - actualizar Firestore
    console.log('🔄 Token es nuevo, actualizando Firestore');
    const newToken = {
      token,
      savedAt: new Date().toISOString(),
    };

    const updatedTokens = [...existingTokens, newToken];

    await updateDoc(userRef, {
      pushTokens: updatedTokens,
    });

    console.log('✅ Token guardado en Firestore');
    console.log('📋 Timestamp:', newToken.savedAt);
    return token;
  } catch (error) {
    console.error('❌ Error al registrar token:', error);
    return '';
  }
}

/**
 * Configura listeners para notificaciones
 */
export function initializePushNotifications() {
  try {
    // Listener en primer plano
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      console.log('📲 Notificación en primer plano:', remoteMessage.notification);
    });

    // Handler en background
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('🔔 Notificación en background:', remoteMessage.notification);
    });

    console.log('✅ Push Notifications inicializado correctamente');

    return () => {
      unsubscribeOnMessage();
    };
  } catch (error) {
    console.error('⚠️ Error inicializando push notifications:', error);
  }
}

/**
 * Suscribirse a cambios de tokens FCM
 */
export function onTokenRefresh(callback: (token: string) => void) {
  const unsubscribe = messaging().onTokenRefresh((token) => {
    console.log('🔄 Token FCM refrescado:', token.substring(0, 20) + '...');
    callback(token);
  });

  return unsubscribe;
}
