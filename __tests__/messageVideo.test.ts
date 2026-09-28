jest.mock('react-native-image-picker', () => ({ launchImageLibrary: jest.fn() }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), doc: () => ({ id: 'video-id' }) }));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ auth: { currentUser: { uid: 'sender' } }, db: {} }));
jest.mock('../src/services/messageImages', () => ({ readFileBlob: jest.fn(), uploadMessageFile: jest.fn() }));
import { launchImageLibrary } from 'react-native-image-picker';
import { readFileBlob, uploadMessageFile } from '../src/services/messageImages';
import { MAX_VIDEO_SIZE, pickMessageVideo, uploadMessageVideo, videoMessageData } from '../src/services/messageVideo';
const asset = { uri: 'file:///video.mp4', fileName: 'video.mp4', type: 'video/mp4', fileSize: 1024, duration: 12 };
beforeEach(() => { jest.clearAllMocks(); (launchImageLibrary as jest.Mock).mockResolvedValue({ assets: [asset] }); });
test('selecciona video y guarda duración, tamaño y ruta del emisor', async () => {
  const file = await pickMessageVideo();
  expect(file).toEqual({ uri: asset.uri, name: asset.fileName, contentType: asset.type, size: 1024, durationMs: 12000, path: 'communication-videos/sender/video-id/video.mp4' });
  expect(launchImageLibrary).toHaveBeenCalledWith(expect.objectContaining({ mediaType: 'video', selectionLimit: 1 }));
  expect(videoMessageData(file!, 'https://example.com/video')).toMatchObject({ videoUrl: 'https://example.com/video', videoDurationMs: '12000', videoSize: '1024' });
});
test('cancelación no sube ni lee archivos', async () => {
  (launchImageLibrary as jest.Mock).mockResolvedValue({ didCancel: true });
  expect(await pickMessageVideo()).toBeNull();
  expect(readFileBlob).not.toHaveBeenCalled(); expect(uploadMessageFile).not.toHaveBeenCalled();
});
test.each([{ ...asset, fileSize: MAX_VIDEO_SIZE + 1 }, { ...asset, type: 'image/jpeg' }])('rechaza tamaño o tipo inválido', async invalid => {
  (launchImageLibrary as jest.Mock).mockResolvedValue({ assets: [invalid] });
  await expect(pickMessageVideo()).rejects.toThrow();
});
test('consulta el tamaño real si no lo informa la galería y libera el blob', async () => {
  const close = jest.fn();
  (launchImageLibrary as jest.Mock).mockResolvedValue({ assets: [{ ...asset, fileSize: undefined }] });
  (readFileBlob as jest.Mock).mockResolvedValue({ size: 2048, close });
  expect((await pickMessageVideo())?.size).toBe(2048); expect(close).toHaveBeenCalled();
});
test('no envía el mensaje cuando falta la URL de subida', async () => {
  const file = (await pickMessageVideo())!;
  expect(() => videoMessageData(file, '')).toThrow('no se envió');
  await uploadMessageVideo(file);
  expect(uploadMessageFile).toHaveBeenCalledWith(file, 'communication-videos', MAX_VIDEO_SIZE);
});
test('rechaza video vacío aunque la galería no informe tamaño', async () => {
  (launchImageLibrary as jest.Mock).mockResolvedValue({ assets: [{ ...asset, fileSize: 0 }] });
  (readFileBlob as jest.Mock).mockResolvedValue({ size: 0 });
  await expect(pickMessageVideo()).rejects.toThrow('vacío');
});
