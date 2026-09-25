import * as functions from 'firebase-functions';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const managerRoles = ['admin', 'equipo directivo', 'representante legal'];
const emailRoles = [...managerRoles, 'preceptor'];

export const createManagedUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Ingresá con una cuenta administrativa de Firebase Auth');
  const db = getFirestore();
  const actor = await db.collection('users').doc(context.auth.uid).get();
  if (!actor.exists || actor.data()?.isEnabled !== true || !managerRoles.includes(actor.data()?.role)) {
    throw new functions.https.HttpsError('permission-denied', 'No tenés permiso para crear cuentas');
  }

  const displayName = typeof data?.displayName === 'string' ? data.displayName.trim() : '';
  const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data?.password === 'string' ? data.password : '';
  const role = data?.role;
  const isEnabled = data?.isEnabled ?? true;
  if (!displayName || displayName.length > 120 || !emailRoles.includes(role) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      password.length < 6 || password.length > 128 || typeof isEnabled !== 'boolean') {
    throw new functions.https.HttpsError('invalid-argument', 'Revisá nombre, email, rol y contraseña (6 a 128 caracteres)');
  }

  // No apropiarse de perfiles anteriores que todavía esperan migración a Auth.
  const existing = await db.collection('users').where('email', '==', email).limit(1).get();
  if (!existing.empty) throw new functions.https.HttpsError('already-exists', 'Ya existe un perfil con ese email');

  const auth = getAuth();
  let account;
  try {
    account = await auth.createUser({ email, password, displayName, disabled: !isEnabled });
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'Ya existe una cuenta con ese email');
    }
    if (['auth/invalid-email', 'auth/invalid-password', 'auth/password-does-not-meet-requirements'].includes(error.code)) {
      throw new functions.https.HttpsError('invalid-argument', 'El email o la contraseña no cumple los requisitos de Firebase Auth');
    }
    throw new functions.https.HttpsError('internal', 'No se pudo crear la cuenta');
  }

  const now = Timestamp.now();
  const profile = {
    id: account.uid, email, displayName, role, isEnabled,
    pushTokens: [], createdAt: now, updatedAt: now,
    ...(isEnabled ? { enabledAt: now } : {}),
  };
  try {
    await db.collection('users').doc(account.uid).create(profile);
  } catch {
    try {
      await auth.deleteUser(account.uid);
    } catch {
      // Solo registrar UID, nunca contraseña ni datos del request.
      functions.logger.error('No se pudo revertir el alta Auth sin perfil', { uid: account.uid });
      throw new functions.https.HttpsError('internal', 'El alta quedó incompleta. Contactá al administrador antes de reintentar');
    }
    throw new functions.https.HttpsError('internal', 'No se pudo guardar el perfil. La cuenta fue revertida; podés reintentar');
  }

  return {
    ...profile, createdAt: now.toDate().toISOString(), updatedAt: now.toDate().toISOString(),
    ...(isEnabled ? { enabledAt: now.toDate().toISOString() } : {}),
  };
});
