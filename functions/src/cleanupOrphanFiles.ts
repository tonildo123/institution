import * as functions from 'firebase-functions';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

/** Carpetas de Storage que la app escribe; cualquier otra ruta no se toca. */
export const MANAGED_FOLDERS = [
  'profile-photos/',
  'problem-report-images/',
  'communication-images/',
  'communication-documents/',
  'communication-audios/',
  'communication-videos/',
  'classroom-submissions/',
];

// Un archivo recién subido puede todavía no estar guardado en su documento: se respeta una ventana de gracia.
const MIN_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface StorageFile { name: string; timeCreated?: string }

/** Extrae la ruta de Storage de una URL de descarga de Firebase. */
export function storagePathFromDownloadURL(url: string): string | null {
  const match = /\/o\/([^?]+)/.exec(url);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Devuelve las rutas que pueden borrarse: dentro de una carpeta administrada, no referenciadas por ningún documento,
 * con una carpeta de usuario verificable y con más de MIN_AGE_MS de antigüedad.
 */
export function selectOrphanFiles(files: StorageFile[], referencedPaths: Set<string>, uncertainUids: Set<string>, now: number): string[] {
  return files
    .filter(file => MANAGED_FOLDERS.some(folder => file.name.startsWith(folder)))
    .filter(file => !referencedPaths.has(file.name))
    .filter(file => !uncertainUids.has(file.name.split('/')[1] || ''))
    .filter(file => {
      const created = Date.parse(file.timeCreated || '');
      return Number.isFinite(created) && now - created > MIN_AGE_MS;
    })
    .map(file => file.name);
}

/** Rutas referenciadas por los documentos de mensajes, entregas y reportes. */
function addMessagePaths(data: Record<string, unknown> | undefined, referenced: Set<string>) {
  if (!data) return;
  for (const [key, value] of Object.entries(data)) {
    if (key.endsWith('Path') && typeof value === 'string') referenced.add(value);
  }
}

// Cada 3 meses (1 de enero, abril, julio y octubre a las 03:00, hora de Argentina).
export const cleanupOrphanFiles = functions.pubsub.schedule('0 3 1 */3 *')
  .timeZone('America/Argentina/Buenos_Aires')
  .onRun(async () => {
    const db = getFirestore();
    const referencedPaths = new Set<string>();
    const uncertainUids = new Set<string>();

    // Fotos de perfil: la URL guardada en el perfil.
    const users = await db.collection('users').get();
    users.docs.forEach(user => {
      const photoURL = user.data().photoURL;
      if (!photoURL) return;
      const path = typeof photoURL === 'string' ? storagePathFromDownloadURL(photoURL) : null;
      if (path) referencedPaths.add(path);
      else uncertainUids.add(user.id);
    });

    // Adjuntos de comunicaciones y de classroom (campos *Path dentro de data), y de sus entregas.
    for (const collection of ['communications', 'classroom']) {
      const docs = await db.collection(collection).get();
      docs.docs.forEach(item => {
        const data = item.data();
        addMessagePaths(data.data, referencedPaths);
        addMessagePaths(data, referencedPaths);
      });
    }
    const submissions = await db.collectionGroup('submissions').get();
    submissions.docs.forEach(item => addMessagePaths(item.data().data, referencedPaths));

    // Imágenes de reportes de problemas.
    const reports = await db.collection('problemReports').get();
    reports.docs.forEach(item => {
      const imagePath = item.data().imagePath;
      if (typeof imagePath === 'string') referencedPaths.add(imagePath);
    });

    const bucket = getStorage().bucket();
    const [files] = await bucket.getFiles();
    const orphans = selectOrphanFiles(
      files.map(file => ({ name: file.name, timeCreated: file.metadata.timeCreated })),
      referencedPaths,
      uncertainUids,
      Date.now(),
    );

    const results = await Promise.allSettled(orphans.map(name => bucket.file(name).delete({ ignoreNotFound: true })));
    const failed = results.filter(result => result.status === 'rejected').length;
    functions.logger.info('Limpieza de archivos huérfanos', { reviewed: files.length, deleted: orphans.length - failed, failed });
    return null;
  });
