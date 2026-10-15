import * as functions from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

export const deactivateOwnAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Iniciá sesión para dar de baja tu cuenta');
  if (!data || Object.keys(data).length !== 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Solo podés dar de baja tu propia cuenta');
  }
  const ref = getFirestore().collection('users').doc(context.auth.uid);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new functions.https.HttpsError('not-found', 'No se encontró tu cuenta');
  await ref.update({ isEnabled: false, updatedAt: Timestamp.now() });
  return { isEnabled: false };
});
