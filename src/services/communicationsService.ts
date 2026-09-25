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
 * Enviar comunicación a TODOS los usuarios
 */
export async function sendCommunicationToAll(
  params: {
    level?: 'inicial' | 'primario' | 'secundario' | 'todos';
    cursoId?: string | null;
    cursoLabel?: string | null;
    title: string;
    body: string;
    description?: string;
    data?: Record<string, string>;
  },
  store: any
): Promise<any> {
  try {
    console.log('📤 Enviando comunicación a TODOS los usuarios...');

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
 * Enviar comunicación a usuarios específicos
 */
export async function sendCommunicationToUsers(
  params: {
    level?: 'inicial' | 'primario' | 'secundario' | 'todos';
    cursoId?: string | null;
    cursoLabel?: string | null;
    title: string;
    body: string;
    description?: string;
    data?: Record<string, string>;
  },
  store: any,
  userIds: string[]
): Promise<any> {
  try {
    console.log(`📤 Enviando comunicación a ${userIds.length} usuarios específicos...`);

    const response = await fetch(
      `${CLOUD_FUNCTION_URL}/sendCommunicationToUsers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          userId: getUserIdFromStore(store),
          userIds: userIds,
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
