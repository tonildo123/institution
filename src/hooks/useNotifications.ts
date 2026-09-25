/**
 * Hook para manejar registración de tokens FCM
 * Se ejecuta automáticamente cuando el usuario se autentica
 */

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { registerDeviceToken, initializePushNotifications } from '@/services/pushNotificationService';

export const useNotifications = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.id) {
      const cleanup = initializePushNotifications();
      const initializeNotifications = async () => {
        try {
          console.log('🔔 Inicializando notificaciones para usuario:', user.id);

          // 1. Registrar token FCM
          const token = await registerDeviceToken(user.id);
          if (token) {
            console.log('✅ Token FCM registrado correctamente');
          }


        } catch (error) {
          console.error('❌ Error inicializando notificaciones:', error);
          // Continuar sin problema, notificaciones no son críticas
        }
      };

      initializeNotifications();
      return cleanup;
    }
  }, [user?.id]);
};
