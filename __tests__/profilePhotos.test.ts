jest.mock('react-native-image-picker', () => ({ launchImageLibrary: jest.fn(), launchCamera: jest.fn() }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), doc: jest.fn(() => ({ id: 'photo-id' })) }));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ db: {}, auth: { authStateReady: jest.fn(), currentUser: { uid: 'family' } } }));
jest.mock('../src/services/messageImages', () => ({ uploadMessageFile: jest.fn() }));
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pickProfilePhoto, uploadProfilePhoto } from '../src/services/profilePhotos';
import { uploadMessageFile } from '../src/services/messageImages';
beforeEach(() => { jest.clearAllMocks(); });
test('una familia selecciona su foto en su ruta propia', async () => {
  (launchImageLibrary as jest.Mock).mockResolvedValue({ assets: [{ uri: 'file://photo.jpg', type: 'image/jpeg', fileSize: 1024 }] });
  expect(await pickProfilePhoto()).toEqual({ uri: 'file://photo.jpg', contentType: 'image/jpeg', path: 'profile-photos/family/photo-id' });
});
test('la cámara usa el frente y cancelar conserva la foto actual', async () => {
  (launchCamera as jest.Mock).mockResolvedValue({ didCancel: true });
  expect(await pickProfilePhoto(true)).toBeNull();
  expect(launchCamera).toHaveBeenCalledWith(expect.objectContaining({ cameraType: 'front', saveToPhotos: false }));
  expect(uploadMessageFile).not.toHaveBeenCalled();
});
test('rechaza formatos no soportados y tamaños excesivos', async () => {
  (launchImageLibrary as jest.Mock).mockResolvedValueOnce({ assets: [{ uri: 'file://photo', type: 'application/pdf', fileSize: 1024 }] });
  await expect(pickProfilePhoto()).rejects.toThrow('JPG');
  (launchImageLibrary as jest.Mock).mockResolvedValueOnce({ assets: [{ uri: 'file://photo', type: 'image/jpeg', fileSize: 6 * 1024 * 1024 }] });
  await expect(pickProfilePhoto()).rejects.toThrow('5 MB');
});
test('sube únicamente a la carpeta de perfiles con límite de 5 MB', async () => {
  const photo = { uri: 'file://photo.jpg', contentType: 'image/jpeg', path: 'profile-photos/family/photo-id' };
  await uploadProfilePhoto(photo);
  expect(uploadMessageFile).toHaveBeenCalledWith(photo, 'profile-photos', 5 * 1024 * 1024);
});

test.each([false, true])('acepta JPEG de iOS y lo sube con MIME estándar (cámara: %s)', async camera => {
  const picker = camera ? launchCamera : launchImageLibrary;
  (picker as jest.Mock).mockResolvedValueOnce({ assets: [{ uri: 'file://ios-photo.jpg', type: 'image/jpg', fileSize: 1024 }] });
  const photo = await pickProfilePhoto(camera);
  expect(photo).toMatchObject({ contentType: 'image/jpeg', uri: 'file://ios-photo.jpg' });
  await uploadProfilePhoto(photo!);
  expect(uploadMessageFile).toHaveBeenCalledWith(expect.objectContaining({ contentType: 'image/jpeg' }), 'profile-photos', 5 * 1024 * 1024);
});
