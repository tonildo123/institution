/** Mensaje único para cualquier fallo de red o de conexión con el servidor. */
export const CONNECTION_MESSAGE = 'Verificá tu conexión e intentá nuevamente.';

const CONNECTION_CODES = ['unavailable', 'deadline-exceeded', 'auth/network-request-failed'];

/** Reconoce errores de red de Firebase y de fetch (en React Native, "Network request failed"). */
export function isConnectionError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  if (CONNECTION_CODES.includes(code || '')) return true;
  const message = (error as { message?: string })?.message || '';
  return /network request failed|failed to get documents from server|offline/i.test(message);
}

/** Devuelve el mensaje de conexión si el error es de red; si no, el mensaje indicado. */
export function messageForError(error: unknown, fallback: string): string {
  return isConnectionError(error) ? CONNECTION_MESSAGE : fallback;
}
