import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';

/**
 * Componente Provider para inicializar notificaciones FCM
 * Se ejecuta automáticamente cuando el usuario se autentica
 */

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  // El hook se ejecuta automáticamente al montar el componente
  useNotifications();

  return <>{children}</>;
};
