import * as functions from 'firebase-functions';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

const PHOTO_FOLDER = 'profile-photos/';
// Un archivo recién subido puede todavía no estar guardado en el perfil: se respeta una ventana de gracia.
const MIN_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface PhotoFile { name: string; timeCreated?: string }

/** Extrae la ruta de Storage de una URL de descarga de Firebase. */
export function storagePathFromDownloadURL(url: string): string | null {
  const match = /\/o\/([^?]+)/.exec(url);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Devuelve las rutas que pueden borrarse: no están referenciadas por ningún perfil,
 * su carpeta de usuario no se pudo verificar y tienen más de MIN_AGE_MS de antigüedad.
 */
export function selectOrphanPhotos(files: PhotoFile[], referencedPaths: Set<string>, uncertainUids: Set<string>, now: number): string[] {
  return files
    .filter(file => file.name.startsWith(PHOTO_FOLDER))
    .filter(file => !referencedPaths.has(file.name))
    .filter(file => !uncertainUids.has(file.name.split('/')[1] || ''))
    .filter(file => {
      const created = Date.parse(file.timeCreated || '');
      return Number.isFinite(created) && now - created > MIN_AGE_MS;
    })
    .map(file => file.name);
}

// Cada 3 meses (1 de enero, abril, julio y octubre a las 03:00, hora de Argentina).
export const cleanupProfilePhotos = functions.pubsub.schedule('0 3 1 */3 *')
  .timeZone('America/Argentina/Buenos_Aires')
  .onRun(async () => {
    const referencedPaths = new Set<string>();
    const uncertainUids = new Set<string>();
    const users = await getFirestore().collection('users').get();
    users.docs.forEach(user => {
      const photoURL = user.data().photoURL;
      if (!photoURL) return;
      const path = typeof photoURL === 'string' ? storagePathFromDownloadURL(photoURL) : null;
      if (path) referencedPaths.add(path);
      else uncertainUids.add(user.id);
    });

    const bucket = getStorage().bucket();
    const [files] = await bucket.getFiles({ prefix: PHOTO_FOLDER });
    const orphans = selectOrphanPhotos(
      files.map(file => ({ name: file.name, timeCreated: file.metadata.timeCreated })),
      referencedPaths,
      uncertainUids,
      Date.now(),
    );

    const results = await Promise.allSettled(orphans.map(name => bucket.file(name).delete({ ignoreNotFound: true })));
    const failed = results.filter(result => result.status === 'rejected').length;
    functions.logger.info('Limpieza de fotos de perfil', { reviewed: files.length, deleted: orphans.length - failed, failed });
    return null;
  });
