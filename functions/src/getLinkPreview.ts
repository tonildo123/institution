import * as functions from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { fetchLinkPreview, previewURL } from './linkPreview.js';

export const getLinkPreview = functions.runWith({ timeoutSeconds: 15, memory: '256MB', maxInstances: 5 }).https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Ingresá para adjuntar un enlace.');
  const db = getFirestore();
  const actor = await db.collection('users').doc(context.auth.uid).get();
  if (!actor.exists || actor.data()?.isEnabled !== true ||
      !['admin', 'preceptor', 'equipo directivo', 'representante legal'].includes(actor.data()?.role)) {
    throw new functions.https.HttpsError('permission-denied', 'No tenés permiso para generar vistas previas.');
  }
  let url: string;
  try {
    if (typeof data?.url !== 'string') throw new Error('Invalid URL');
    url = previewURL(data.url).href;
  } catch { throw new functions.https.HttpsError('invalid-argument', 'El enlace no admite vista previa.'); }
  // Evitar que un emisor genere solicitudes ilimitadas a sitios externos.
  const limit = db.collection('_linkPreviewLimits').doc(context.auth.uid);
  await db.runTransaction(async transaction => {
    const previous = (await transaction.get(limit)).data();
    const now = Date.now();
    const sameWindow = typeof previous?.startedAt === 'number' && now - previous.startedAt < 60000;
    const count = sameWindow ? previous?.count || 0 : 0;
    if (count >= 20) throw new functions.https.HttpsError('resource-exhausted', 'Intentá generar otra vista previa en un minuto.');
    transaction.set(limit, { startedAt: sameWindow ? previous!.startedAt : now, count: count + 1, updatedAt: Timestamp.now() });
  });
  return fetchLinkPreview(url);
});
