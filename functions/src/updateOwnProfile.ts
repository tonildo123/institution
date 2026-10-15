import * as functions from 'firebase-functions';
import { getStorage, getDownloadURL } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

export const updateOwnProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Iniciá sesión para editar tu perfil');
  const uid = context.auth.uid;
  if (!data || Object.keys(data).some(key => !['displayName', 'email', 'password', 'photoPath'].includes(key))) {
    throw new functions.https.HttpsError('invalid-argument', 'Solo podés editar tu nombre, correo y contraseña');
  }
  const displayName = typeof data.displayName === 'string' ? data.displayName.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data.password === 'string' ? data.password : '';
  if (!displayName || displayName.length > 120 || email.length > 254 ||
    (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
    (password && (password.length < 6 || password.length > 128))) {
    throw new functions.https.HttpsError('invalid-argument', 'Revisá nombre, correo y contraseña (6 a 128 caracteres)');
  }
  const ref = getFirestore().collection('users').doc(uid);
  const snapshot = await ref.get();
  const profile = snapshot.data();
  if (!snapshot.exists || profile?.isEnabled !== true) throw new functions.https.HttpsError('permission-denied', 'La cuenta no está habilitada');
  const family = profile.role === 'familia';
  if (!family && !email) throw new functions.https.HttpsError('invalid-argument', 'El correo de acceso es requerido');
  const emailChanged = email !== (profile.email || '');
  const age = Date.now() / 1000 - Number(context.auth.token.auth_time || 0);
  if ((emailChanged || password) && (context.auth.token.firebase?.sign_in_provider !== 'password' || !Number.isFinite(age) || age < -60 || age > 300)) {
    throw new functions.https.HttpsError('failed-precondition', 'Confirmá tu contraseña actual antes de guardar');
  }
  const photoChanged = data.photoPath !== undefined;
  let photoURL: string | undefined;
  if (photoChanged) {
    if (data.photoPath === null) photoURL = '';
    else {
      if (typeof data.photoPath !== 'string' || !data.photoPath.startsWith(`profile-photos/${uid}/`) ||
        data.photoPath.slice(`profile-photos/${uid}/`.length).includes('/') || data.photoPath.length > 250) {
        throw new functions.https.HttpsError('invalid-argument', 'La foto debe pertenecer a tu perfil');
      }
      try {
        const file = getStorage().bucket().file(data.photoPath);
        const [metadata] = await file.getMetadata();
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(metadata.contentType || '') ||
          Number(metadata.size) <= 0 || Number(metadata.size) > 5 * 1024 * 1024) throw new Error('Foto inválida');
        photoURL = await getDownloadURL(file);
      } catch {
        throw new functions.https.HttpsError('invalid-argument', 'No se pudo verificar la foto. Volvé a seleccionarla');
      }
    }
  }
  const auth = getAuth();
  const account = await auth.getUser(uid);
  const authEmail = family ? account.email : email;
  try {
    await auth.updateUser(uid, { displayName, ...(photoChanged ? { photoURL: photoURL || null } : {}), ...(!family && emailChanged ? { email, emailVerified: false } : {}) });
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') throw new functions.https.HttpsError('already-exists', 'Ese correo ya está en uso');
    throw new functions.https.HttpsError('internal', 'No se pudo actualizar la cuenta');
  }
  try {
    await ref.update({ displayName, email, ...(photoChanged ? { photoURL } : {}), updatedAt: Timestamp.now() });
  } catch {
    try {
      await auth.updateUser(uid, { displayName: account.displayName || '', ...(photoChanged ? { photoURL: account.photoURL || null } : {}), ...(!family && emailChanged ? { email: account.email, emailVerified: account.emailVerified } : {}) });
    } catch {
      functions.logger.error('No se pudo revertir la sincronización de perfil', { uid });
      throw new functions.https.HttpsError('internal', 'No se pudo sincronizar el perfil. Contactá a la institución para revisar el correo de acceso');
    }
    throw new functions.https.HttpsError('internal', 'No se pudo guardar el perfil. Intentá nuevamente');
  }
  if (password) {
    try { await auth.updateUser(uid, { password }); }
    catch {
      throw new functions.https.HttpsError('internal', 'Los datos del perfil se guardaron, pero la contraseña no pudo actualizarse. Intentá nuevamente', { profileSaved: true, displayName, email, authEmail, ...(photoChanged ? { photoURL } : {}) });
    }
  }
  return { displayName, email, authEmail, ...(photoChanged ? { photoURL } : {}) };
});
