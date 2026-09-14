/**
 * Servicio de Comunicaciones
 * Llama Cloud Functions con fetch directo (sin httpsCallable)
 */

const CLOUD_FUNCTION_URL = 'https://us-central1-institucion-59d9a.cloudfunctions.net';

/**
 * Obtener el user ID del usuario autenticado
 */
function getUserId(): string {
  // Obtener del localStorage o contexto de Firebase
  try {
    const auth = JSON.parse(localStorage.getItem('firebase:authUser:AIzaSyDrRuAtnlA7iZSgjZJAeT-I-cXr2dDghhg:[DEFAULT]') || '{}');
    return auth.localId || 'unknown-' + Date.now();
  } catch {
    return 'unknown-' + Date.now();
  }
}

/**
 * Enviar comunicación a TODOS los usuarios
 */
export async function sendCommunicationToAll(params: {
  title: string;
  body: string;
  description?: string;
  data?: Record<string, string>;
}): Promise<any> {
  try {
    console.log('📤 Enviando comunicación a todos...');

    const response = await fetch(
      `${CLOUD_FUNCTION_URL}/sendCommunicationToAll`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          userId: getUserId(),
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
