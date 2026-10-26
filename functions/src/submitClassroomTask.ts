import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';

const ALLOWED_KEYS = new Set([
  'imageUrl', 'imagePath', 'photoUrl', 'photoPath',
  'videoUrl', 'videoPath', 'videoName', 'videoSize', 'videoContentType', 'videoDurationMs',
  'audioUrl', 'audioPath', 'audioName', 'audioSize', 'audioContentType', 'audioDurationMs',
  'documentUrl', 'documentPath', 'documentName', 'documentSize', 'documentContentType',
  'linkUrl', 'linkTitle', 'linkDescription', 'linkDomain', 'linkImageUrl',
]);
const MAX_BODY = 4000;

/** Valida que los adjuntos sean del alumno y de esta tarea; nunca acepta rutas ajenas. */
export function validateSubmissionData(data: unknown, taskId: string, uid: string): Record<string, string> {
  if (data === undefined || data === null) return {};
  if (typeof data !== 'object' || Array.isArray(data)) throw new functions.https.HttpsError('invalid-argument', 'Adjuntos inválidos');
  const prefix = `classroom-submissions/${uid}/${taskId}/`;
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (!ALLOWED_KEYS.has(key)) throw new functions.https.HttpsError('invalid-argument', 'Adjunto no permitido');
    if (typeof value !== 'string' || value.length > 500) throw new functions.https.HttpsError('invalid-argument', 'Adjunto inválido');
    if (key.endsWith('Path') && (!value.startsWith(prefix) || value.includes('..'))) {
      throw new functions.https.HttpsError('invalid-argument', 'El archivo no pertenece a tu entrega');
    }
    if (key.endsWith('Url') && !value.startsWith('https://')) {
      throw new functions.https.HttpsError('invalid-argument', 'El enlace del archivo no es válido');
    }
    clean[key] = value;
  }
  return clean;
}

/**
 * Entrega de un alumno a una tarea de Classroom.
 * Una sola entrega por alumno (ID = UID), dentro del plazo y del cupo, en una transacción.
 */
export const submitClassroomTask = functions.https.onCall(async (payload, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Iniciá sesión para entregar la tarea');
  const uid = context.auth.uid;
  const taskId = payload.taskId;
  const body = typeof payload.body === 'string' ? payload.body.trim() : '';
  if (typeof taskId !== 'string' || !taskId || taskId.includes('/')) {
    throw new functions.https.HttpsError('invalid-argument', 'Tarea inválida');
  }
  if (body.length > MAX_BODY) throw new functions.https.HttpsError('invalid-argument', 'La entrega supera los 4000 caracteres');
  const data = validateSubmissionData(payload.data, taskId, uid);
  if (!body && Object.keys(data).length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Escribí una respuesta o adjuntá un archivo');
  }

  const db = getFirestore();
  const profile = await db.collection('users').doc(uid).get();
  if (!profile.exists || profile.data()?.isEnabled !== true || profile.data()?.role !== 'familia') {
    throw new functions.https.HttpsError('permission-denied', 'Tu cuenta no puede entregar tareas');
  }
  const taskRef = db.collection('classroom').doc(taskId);
  const submissionRef = taskRef.collection('submissions').doc(uid);

  await db.runTransaction(async tx => {
    const task = await tx.get(taskRef);
    if (!task.exists) throw new functions.https.HttpsError('not-found', 'La tarea no existe');
    const taskData = task.data() || {};
    const targets: string[] = Array.isArray(taskData.targetUserIds) ? taskData.targetUserIds : [];
    if (!targets.includes(uid)) throw new functions.https.HttpsError('permission-denied', 'Esta tarea no está asignada a tu cuenta');
    if (typeof taskData.dueDate === 'string' && Date.now() > Date.parse(taskData.dueDate)) {
      throw new functions.https.HttpsError('failed-precondition', 'El plazo para entregar esta tarea venció');
    }
    const existing = await tx.get(submissionRef);
    if (existing.exists) throw new functions.https.HttpsError('already-exists', 'Ya entregaste esta tarea');
    const count = Number(taskData.submissionsCount) || 0;
    const max = Number(taskData.maxSubmissions) || targets.length;
    if (count >= max) throw new functions.https.HttpsError('resource-exhausted', 'Cupo completo: la tarea ya tiene todas las entregas');

    const now = new Date().toISOString();
    tx.set(submissionRef, {
      studentId: uid,
      studentName: profile.data()?.displayName || 'Familia',
      body,
      data,
      createdAt: now,
    });
    tx.update(taskRef, { submissionsCount: count + 1 });
  });

  return { success: true };
});
