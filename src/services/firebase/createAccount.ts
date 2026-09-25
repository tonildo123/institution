import { auth } from './firebaseConfig';
import { CreateUserCredentials, User } from '@/types';

export async function createAccount(credentials: CreateUserCredentials): Promise<User> {
  await auth.authStateReady();
  if (!auth.currentUser) throw new Error('Ingresá con una cuenta administrativa de Firebase Auth para crear usuarios.');
  const token = await auth.currentUser.getIdToken();
  const projectId = auth.app.options.projectId;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 70000);
  try {
    let response: Response;
    try {
      response = await fetch(`https://us-central1-${projectId}.cloudfunctions.net/createManagedUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: credentials }),
        signal: controller.signal,
      });
    } catch {
      throw new Error('No se pudo obtener respuesta de Firebase. Revisá la conexión del teléfono. Antes de reintentar, actualizá la lista para comprobar si la cuenta llegó a crearse.');
    }
    const payload = await response.json();
    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message || `No se pudo crear la cuenta (HTTP ${response.status})`);
    }
    const user = payload.data ?? payload.result;
    if (!user?.id) throw new Error('Firebase devolvió una respuesta inesperada. Revisá la lista antes de reintentar.');
    return user;
  } finally {
    clearTimeout(timeout);
  }
}
