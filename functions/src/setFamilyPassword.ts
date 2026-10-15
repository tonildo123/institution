import * as functions from 'firebase-functions';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/** Preparar una familia existente sin cambiar su UID ni sus asignaciones. */
async function savePassword(data: any, context: functions.https.CallableContext, familyOnly: boolean) {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Ingresá con una cuenta administrativa');
  const db = getFirestore();
  const actor = await db.collection('users').doc(context.auth.uid).get();
  if (!actor.exists || actor.data()?.isEnabled !== true || !['admin', 'equipo directivo', 'representante legal'].includes(actor.data()?.role)) {
    throw new functions.https.HttpsError('permission-denied', 'No tenés permiso para establecer contraseñas');
  }
  const userId = data?.userId;
  const password = data?.password;
  if (typeof userId !== 'string' || !userId || userId.includes('/') || typeof password !== 'string' || password.length < 6 || password.length > 128) {
    throw new functions.https.HttpsError('invalid-argument', 'Indicá una contraseña de 6 a 128 caracteres');
  }
  const profile = await db.collection('users').doc(userId).get();
  if (!profile.exists || (familyOnly && profile.data()?.role !== 'familia')) {
    throw new functions.https.HttpsError('not-found', 'No se encontró la familia');
  }
  // Alias interno estable: editar el DNI no cambia la identidad autenticada.
  const family = profile.data()?.role === 'familia';
  const email = family ? `${userId}@familias.imep.invalid` : profile.data()?.email;
  if (!email) throw new functions.https.HttpsError('failed-precondition', 'El usuario no tiene un email vinculado');
  const auth = getAuth();
  try {
    let existing;
    try { existing = await auth.getUser(userId); }
    catch (error: any) { if (error.code !== 'auth/user-not-found') throw error; }
    if (existing && existing.email !== email) {
      throw new functions.https.HttpsError('failed-precondition', 'La identidad ya está vinculada a otra cuenta; revisá la vinculación');
    }
    if (!existing && !family) throw new functions.https.HttpsError('failed-precondition', 'Primero vinculá el usuario con su cuenta de Firebase Auth');
    if (existing) await auth.updateUser(userId, { password, disabled: profile.data()?.isEnabled !== true });
    else await auth.createUser({ uid: userId, email, password, displayName: profile.data()?.displayName, disabled: profile.data()?.isEnabled !== true });
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'No se pudo establecer la contraseña. Revisá los requisitos de Firebase Auth');
  }
  return { success: true };
}

export const setFamilyPassword = functions.https.onCall((data, context) => savePassword(data, context, true));
export const setUserPassword = functions.https.onCall((data, context) => savePassword(data, context, false));
