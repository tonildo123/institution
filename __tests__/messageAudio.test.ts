jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(), keepLocalCopy: jest.fn(), types: { audio: 'audio/*' },
  isErrorWithCode: (error: any) => Boolean(error.code), errorCodes: { OPERATION_CANCELED: 'cancelled' },
}));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ auth: { currentUser: { uid: 'sender' } }, db: {} }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), doc: () => ({ id: 'audio-id' }) }));
jest.mock('../src/services/messageImages', () => ({ uploadMessageFile: jest.fn(), readFileBlob: jest.fn() }));
import { pick, keepLocalCopy } from '@react-native-documents/picker';
import { readFileBlob, uploadMessageFile } from '../src/services/messageImages';
import { pickMessageAudio, recordedMessageAudio, uploadMessageAudio, audioMessageData } from '../src/services/messageAudio';
import { MAX_AUDIO_SIZE, validateAudio, formatAudioTime } from '../src/services/audioTypes';
beforeEach(() => {
  jest.clearAllMocks();
  (pick as jest.Mock).mockResolvedValue([{ name: 'Circular.MP3', size: 1024, uri: 'content://audio', hasRequestedType: true }]);
  (keepLocalCopy as jest.Mock).mockResolvedValue([{ status: 'success', localUri: 'file://copy.m4a' }]);
  (uploadMessageFile as jest.Mock).mockResolvedValue('https://example.com/audio');
});
test('copia y sube un audio conservando metadatos para la familia', async () => {
  const file = (await pickMessageAudio())!;
  const url = await uploadMessageAudio(file);
  expect(uploadMessageFile).toHaveBeenCalledWith(file, 'communication-audios', MAX_AUDIO_SIZE);
  expect(audioMessageData(file, url)).toEqual({ audioUrl: url, audioPath: 'communication-audios/sender/audio-id/Circular.MP3',
    audioName: 'Circular.MP3', audioSize: '1024', audioContentType: 'audio/mpeg' });
});
test('cancelar el selector no agrega un adjunto', async () => {
  (pick as jest.Mock).mockRejectedValue({ code: 'cancelled' });
  expect(await pickMessageAudio()).toBeNull();
  expect(keepLocalCopy).not.toHaveBeenCalled();
});
test('la nota grabada conserva duración, copia propia y tamaño real', async () => {
  const close = jest.fn();
  (readFileBlob as jest.Mock).mockResolvedValue({ size: 2048, close });
  const file = await recordedMessageAudio('/cache/sound.mp4', 18200);
  expect(file).toEqual(expect.objectContaining({ uri: 'file://copy.m4a', contentType: 'audio/mp4', durationMs: 18200, size: 2048 }));
  expect(keepLocalCopy).toHaveBeenCalledWith(expect.objectContaining({ files: [expect.objectContaining({ uri: 'file:///cache/sound.mp4' })] }));
  expect(audioMessageData(file, 'https://example.com/audio').audioDurationMs).toBe('18200');
  expect(close).toHaveBeenCalled();
});
test('no acepta grabaciones vacías y libera el blob', async () => {
  const close = jest.fn();
  (readFileBlob as jest.Mock).mockResolvedValue({ size: 0, close });
  await expect(recordedMessageAudio('/cache/sound.mp4', 1000)).rejects.toThrow('vacío');
  expect(close).toHaveBeenCalled();
  await expect(recordedMessageAudio('/cache/sound.mp4', 0)).rejects.toThrow('corta');
});
test('no envía silenciosamente si falta la URL o falla la subida', async () => {
  const file = (await pickMessageAudio())!;
  expect(() => audioMessageData(file, '')).toThrow('no se envió');
  (uploadMessageFile as jest.Mock).mockRejectedValue(new Error('sin conexión'));
  await expect(uploadMessageAudio(file)).rejects.toThrow('sin conexión');
});
test.each(['mp3', 'm4a', 'aac', 'wav'])('admite %s', ext => {
  expect(validateAudio(`audio.${ext}`, MAX_AUDIO_SIZE).contentType).toMatch(/^audio\//);
});
test.each([0, null, -1, NaN, MAX_AUDIO_SIZE + 1])('rechaza tamaño %s', size => {
  expect(() => validateAudio('audio.mp3', size)).toThrow();
});
test('rechaza formato no reproducible', () => { expect(() => validateAudio('video.mp4', 100)).toThrow('Seleccioná'); });
test.each([[0, '0:00'], [18200, '0:18'], [300000, '5:00'], [NaN, '0:00']])('duración %s', (ms, expected) => {
  expect(formatAudioTime(ms as number)).toBe(expected);
});
