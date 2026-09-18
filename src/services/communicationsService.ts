/**
 * Servicio de Comunicaciones
 * Llama Cloud Functions para enviar mensajes a todos los usuarios
 */

import { RootState } from '@/redux/store';

const CLOUD_FUNCTION_URL = 'https://us-central1-institucion-59d9a.cloudfunctions.net';

/**
 * Obtener el user ID del usuario autenticado
 */
function getUserIdFromStore(store: any): string {
  try {
    const state: RootState = store.getState();
    return state.auth.user?.id || 'unknown-' + Date.now();
  } catch {
    return 'unknown-' + Date.now();
  }
}

/**
 * Enviar comunicación a usuarios (todos o lista específica)
 */
export async function sendCommunicationToAll(
  params: {
    title: string;
    body: string;
    description?: string;
    data?: Record<string, string>;
  },
  store: any,
  targetUserIds?: string[]
): Promise<any> {
  try {
    const isSpecificUsers = targetUserIds && targetUserIds.length > 0;
    console.log(`📤 Enviando comunicación ${isSpecificUsers ? `a ${targetUserIds.length} usuarios específicos` : 'a todos'}...`);

    const response = await fetch(
      `${CLOUD_FUNCTION_URL}/sendCommunicationToAll`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          userId: getUserIdFromStore(store),
          targetUserIds: targetUserIds,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log('✅ Resultado:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Error al enviar comunicación:', error);
    throw error;
  }
}

/**
 * Health check
 */
export async function checkFunctions(): Promise<any> {
  try {
    const response = await fetch(
      `${CLOUD_FUNCTION_URL}/healthCheck`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error en health check:', error);
    throw error;
  }
}
