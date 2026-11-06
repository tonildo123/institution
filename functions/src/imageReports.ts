import * as functions from 'firebase-functions';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Acciones del panel web sobre los reportes de imágenes (colección imageReports).
const MANAGER_ROLES = ['admin', 'equipo directivo', 'representante legal'];
const REPORT_READER_ROLES = ['admin', 'equipo directivo'];
const ADMIN_ROLES = ['admin', 'equipo directivo', 'representante legal'];
const IMAGE_FIELDS = ['imageUrl', 'photoUrl'];
const SOURCE_PATH = /^(communications\/[^/]+|classroom\/[^/]+|classroom\/[^/]+\/submissions\/[^/]+)$/;

const requireRole = async (uid: string | undefined, roles: string[]): Promise<void> => {
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Ingresá con una cuenta autenticada');
  const snap = await getFirestore().collection('users').doc(uid).get();
  const profile = snap.data();
  if (!snap.exists || profile?.isEnabled !== true || !roles.includes(profile?.role)) {
    throw new functions.https.HttpsError('permission-denied', 'No tenés permiso para esta acción');
  }
};

const idArg = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || !value || value.includes('/')) {
    throw new functions.https.HttpsError('invalid-argument', `${label} inválido`);
  }
  return value;
};

// Borra la foto reportada: quita el campo del mensaje, entrega o publicación y el archivo de Storage.
// La ruta del archivo se toma del documento real, no del reporte, así el reporte no puede apuntar a otro archivo.
export const adminDeleteReportedImage = functions.https.onCall(async (data, context) => {
  await requireRole(context.auth?.uid, REPORT_READER_ROLES);
  const reportId = idArg(data?.reportId, 'El reporte');

  const db = getFirestore();
  const reportRef = db.collection('imageReports').doc(reportId);
  const report = await reportRef.get();
  if (!report.exists) throw new functions.https.HttpsError('not-found', 'El reporte no existe');

  const reportData = report.data() ?? {};
  const sourcePath = String(reportData.sourcePath ?? '');
  const imageField = String(reportData.imageField ?? '');
  if (!SOURCE_PATH.test(sourcePath) || !IMAGE_FIELDS.includes(imageField)) {
    throw new functions.https.HttpsError('failed-precondition', 'El reporte no apunta a una imagen válida');
  }

  const sourceRef = db.doc(sourcePath);
  const source = await sourceRef.get();
  if (!source.exists) throw new functions.https.HttpsError('not-found', 'El mensaje ya no existe');

  const payload = (source.data()?.data ?? {}) as Record<string, unknown>;
  if (!payload[imageField] || payload[imageField] !== reportData.imageURL) {
    throw new functions.https.HttpsError('failed-precondition', 'La imagen cambió después del reporte. No se borró nada.');
  }

  const pathField = imageField === 'photoUrl' ? 'photoPath' : 'imagePath';
  const storedPath = typeof payload[pathField] === 'string' ? (payload[pathField] as string) : '';

  await sourceRef.update({
    [`data.${imageField}`]: FieldValue.delete(),
    [`data.${pathField}`]: FieldValue.delete(),
    updatedAt: new Date().toISOString(),
  });

  if (storedPath && !storedPath.startsWith('/') && !storedPath.includes('..')) {
    await getStorage().bucket().file(storedPath).delete({ ignoreNotFound: true });
  }

  await reportRef.update({ imageRemovedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  return { ok: true };
});

// Bloquea o desbloquea una cuenta: deshabilita el acceso en Auth y marca users/{uid}.isEnabled.
// No se puede bloquear a uno mismo ni a una cuenta administrativa.
export const adminSetUserEnabled = functions.https.onCall(async (data, context) => {
  const adminUid = context.auth?.uid;
  await requireRole(adminUid, MANAGER_ROLES);
  const uid = idArg(data?.uid, 'El usuario');
  const enabled = data?.enabled;
  if (typeof enabled !== 'boolean') throw new functions.https.HttpsError('invalid-argument', 'Indicá si la cuenta queda habilitada');
  if (uid === adminUid) throw new functions.https.HttpsError('failed-precondition', 'No podés bloquear tu propia cuenta');

  const ref = getFirestore().collection('users').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) throw new functions.https.HttpsError('not-found', 'El usuario no existe');
  if (ADMIN_ROLES.includes(snap.data()?.role)) {
    throw new functions.https.HttpsError('permission-denied', 'No se puede bloquear a una cuenta administrativa desde el panel');
  }

  try {
    await getAuth().updateUser(uid, { disabled: !enabled });
  } catch (error) {
    // Sin cuenta en Auth: solo se actualiza el perfil
    if ((error as { code?: string }).code !== 'auth/user-not-found') {
      console.error('adminSetUserEnabled: Auth update failed', uid, error);
      throw new functions.https.HttpsError('internal', 'No se pudo actualizar el acceso. Intentá de nuevo.');
    }
  }
  await ref.update({ isEnabled: enabled, updatedAt: new Date().toISOString() });
  return { ok: true };
});
