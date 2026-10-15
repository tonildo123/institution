import { EmailAuthProvider, reauthenticateWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';

export interface ProfileChanges { displayName: string; email: string; password?: string; photoPath?: string | null }

export async function deactivateOwnAccount(): Promise<void> {
  await auth.authStateReady();
  const account = auth.currentUser;
  if (!account) throw new Error('Volvé a iniciar sesión para dar de baja tu cuenta.');
  const token = await account.getIdToken();
  const response = await fetch(`https://us-central1-${auth.app.options.projectId}.cloudfunctions.net/deactivateOwnAccount`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: {} }),
  });
  const payload = await response.json();
  if (!response.ok || payload.error || (payload.data ?? payload.result)?.isEnabled !== false) {
    throw new Error(payload.error?.message || 'No se pudo dar de baja tu cuenta. Intentá nuevamente.');
  }
}

export async function saveOwnProfile(changes: ProfileChanges, currentPassword: string, previousEmail: string): Promise<{ displayName: string; email: string; photoURL?: string }> {
  await auth.authStateReady();
  const account = auth.currentUser;
  if (!account?.email) throw new Error('Volvé a iniciar sesión para editar tu perfil.');
  const sensitive = Boolean(changes.password || changes.email !== previousEmail);
  if (sensitive) {
    if (!currentPassword) throw new Error('Ingresá tu contraseña actual para confirmar los cambios.');
    try { await reauthenticateWithCredential(account, EmailAuthProvider.credential(account.email, currentPassword)); }
    catch { throw new Error('No se pudo confirmar tu contraseña actual. Revisala e intentá nuevamente.'); }
  }
  const token = await account.getIdToken(sensitive);
  const response = await fetch(`https://us-central1-${auth.app.options.projectId}.cloudfunctions.net/updateOwnProfile`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: changes }),
  });
  const payload = await response.json();
  const result = payload.data ?? payload.result;
  if (!response.ok || payload.error) {
    const failure = payload.error;
    if (failure?.details?.profileSaved) {
      if (sensitive) {
        try { await signInWithEmailAndPassword(auth, failure.details.authEmail || account.email, currentPassword); } catch { /* El mensaje conserva el resultado parcial. */ }
      }
      throw Object.assign(new Error(failure.message), { profileChanges: { displayName: failure.details.displayName, email: failure.details.email, ...(typeof failure.details.photoURL === 'string' ? { photoURL: failure.details.photoURL } : {}) } });
    }
    throw new Error(failure?.message || 'No se pudo guardar el perfil.');
  }
  if (!result?.displayName || typeof result.email !== 'string') throw new Error('Respuesta inesperada al guardar el perfil.');
  if (sensitive) {
    try {
      const session = await signInWithEmailAndPassword(auth, result.authEmail || account.email, changes.password || currentPassword);
      if (session.user.uid !== account.uid) throw new Error('La sesión no corresponde a tu perfil');
    } catch {
      throw Object.assign(new Error('Los cambios se guardaron. Volvé a iniciar sesión con tus datos actualizados.'), { profileChanges: { displayName: result.displayName, email: result.email, ...(typeof result.photoURL === 'string' ? { photoURL: result.photoURL } : {}) } });
    }
  }
  return { displayName: result.displayName, email: result.email, ...(typeof result.photoURL === 'string' ? { photoURL: result.photoURL } : {}) };
}
