jest.mock('firebase-functions', () => ({
  pubsub: { schedule: () => ({ timeZone: () => ({ onRun: (fn: unknown) => fn }) }) },
  logger: { info: jest.fn() },
}), { virtual: true });
jest.mock('firebase-admin/storage', () => ({ getStorage: () => ({ bucket: () => ({}) }) }), { virtual: true });
jest.mock('firebase-admin/firestore', () => ({ getFirestore: () => ({ collection: () => ({}) }) }), { virtual: true });

import { selectOrphanPhotos, storagePathFromDownloadURL } from '../functions/src/cleanupProfilePhotos';

const NOW = Date.parse('2026-10-26T12:00:00Z');
const OLD = '2026-08-01T00:00:00Z';
const RECENT = '2026-10-25T12:00:00Z';

describe('storagePathFromDownloadURL', () => {
  it('extrae la ruta decodificada de una URL de descarga', () => {
    const url = 'https://firebasestorage.googleapis.com/v0/b/institucion-59d9a.appspot.com/o/profile-photos%2Fuid1%2Fabc.jpg?alt=media&token=t';
    expect(storagePathFromDownloadURL(url)).toBe('profile-photos/uid1/abc.jpg');
  });

  it('devuelve null si la URL no es de Storage', () => {
    expect(storagePathFromDownloadURL('https://example.com/foto.jpg')).toBeNull();
  });
});

describe('selectOrphanPhotos', () => {
  it('borra fotos viejas no referenciadas y conserva la foto actual', () => {
    const files = [
      { name: 'profile-photos/uid1/actual.jpg', timeCreated: OLD },
      { name: 'profile-photos/uid1/anterior.jpg', timeCreated: OLD },
    ];
    expect(selectOrphanPhotos(files, new Set(['profile-photos/uid1/actual.jpg']), new Set(), NOW))
      .toEqual(['profile-photos/uid1/anterior.jpg']);
  });

  it('respeta la ventana de gracia de archivos recientes', () => {
    const files = [{ name: 'profile-photos/uid1/subiendo.jpg', timeCreated: RECENT }];
    expect(selectOrphanPhotos(files, new Set(), new Set(), NOW)).toEqual([]);
  });

  it('no borra carpetas de usuarios cuya URL no se pudo verificar', () => {
    const files = [{ name: 'profile-photos/uid2/vieja.jpg', timeCreated: OLD }];
    expect(selectOrphanPhotos(files, new Set(), new Set(['uid2']), NOW)).toEqual([]);
  });

  it('ignora archivos fuera de profile-photos y sin fecha válida', () => {
    const files = [
      { name: 'problem-report-images/uid1/x.jpg', timeCreated: OLD },
      { name: 'profile-photos/uid1/sinfecha.jpg' },
    ];
    expect(selectOrphanPhotos(files, new Set(), new Set(), NOW)).toEqual([]);
  });
});
