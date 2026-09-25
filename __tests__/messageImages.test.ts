import { auth } from '../src/services/firebase/firebaseConfig';
jest.mock('react-native-image-picker', () => ({ launchImageLibrary: jest.fn(), launchCamera: jest.fn() }));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ auth: { currentUser: { uid: 'sender', getIdToken: jest.fn().mockResolvedValue('token') }, authStateReady: jest.fn().mockResolvedValue(undefined) }, db: {}, storage: {} }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), doc: jest.fn(() => ({ id: 'image-id' })) }));
jest.mock('firebase/storage', () => ({ ref: jest.fn((_, path) => ({ bucket: 'bucket', fullPath: path })), getDownloadURL: jest.fn().mockResolvedValue('https://example.com/image') }));
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { getDownloadURL } from 'firebase/storage';
import { pickMessageImage, captureMessageImage, uploadMessageImage } from '../src/services/messageImages';
const originalFetch = global.fetch;
const originalXHR = global.XMLHttpRequest;
const blob = { close: jest.fn() };
const selected = { uri: 'file://photo.jpg', contentType: 'image/jpeg', path: 'communication-images/sender/image-id' };
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn().mockResolvedValue({ ok: true });
  global.XMLHttpRequest = class {
    status = 200; response = blob; onload = () => {};
    open() {} send() { this.onload(); }
  } as any;
});
afterEach(() => { global.fetch = originalFetch; global.XMLHttpRequest = originalXHR; });
test('cancelar no crea un adjunto', async () => {
  (launchImageLibrary as jest.Mock).mockResolvedValue({ didCancel: true });
  expect(await pickMessageImage()).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});
test('envía blob nativo autenticado sin convertirlo a ArrayBuffer', async () => {
  expect(await uploadMessageImage(selected)).toBe('https://example.com/image');
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('communication-images%2Fsender%2Fimage-id'), expect.objectContaining({ body: blob, headers: { Authorization: 'Firebase token', 'Content-Type': 'image/jpeg' } }));
  expect(blob.close).toHaveBeenCalled();
});
test('libera blob y no obtiene URL cuando Storage rechaza la subida', async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 403 });
  await expect(uploadMessageImage(selected)).rejects.toThrow('permiso');
  expect(getDownloadURL).not.toHaveBeenCalled();
  expect(blob.close).toHaveBeenCalled();
});
test('bloquea la subida sin sesión', async () => {
  const user = auth.currentUser;
  Object.defineProperty(auth, 'currentUser', { value: null, writable: true });
  try {
    await expect(uploadMessageImage(selected)).rejects.toThrow('Cerrá sesión');
    expect(fetch).not.toHaveBeenCalled();
  } finally { Object.defineProperty(auth, 'currentUser', { value: user, writable: true }); }
});

test('cámara devuelve una foto compatible con el flujo de envío', async () => {
  (launchCamera as jest.Mock).mockResolvedValue({ assets: [{ uri: 'file://camera.jpg', type: 'image/jpeg', fileSize: 1024 }] });
  expect(await captureMessageImage()).toEqual({ ...selected, uri: 'file://camera.jpg' });
  expect(launchCamera).toHaveBeenCalledWith(expect.objectContaining({ mediaType: 'photo', saveToPhotos: false }));
});
test('cancelación de cámara conserva el borrador sin subir archivos', async () => {
  (launchCamera as jest.Mock).mockResolvedValue({ didCancel: true });
  expect(await captureMessageImage()).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});
test('explica permiso denegado o cámara no disponible', async () => {
  (launchCamera as jest.Mock).mockResolvedValue({ errorCode: 'permission' });
  await expect(captureMessageImage()).rejects.toThrow('Ajustes');
  (launchCamera as jest.Mock).mockResolvedValue({ errorCode: 'camera_unavailable' });
  await expect(captureMessageImage()).rejects.toThrow('No hay una cámara');
});
