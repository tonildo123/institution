const mockSound = {
  setSubscriptionDuration: jest.fn(), addPlayBackListener: jest.fn(), addPlaybackEndListener: jest.fn(),
  startPlayer: jest.fn().mockResolvedValue('ok'), stopPlayer: jest.fn().mockResolvedValue('ok'),
  pausePlayer: jest.fn().mockResolvedValue('ok'), resumePlayer: jest.fn().mockResolvedValue('ok'),
};
jest.mock('react-native-nitro-sound', () => ({ createSound: () => mockSound }));
import { toggleAudioPlayback, stopAudioPlayback, audioPlaybackSnapshot } from '../src/services/audioPlayback';
beforeEach(async () => { await stopAudioPlayback(); jest.clearAllMocks(); });
test('alterna reproducción, pausa y reanudación', async () => {
  await toggleAudioPlayback('https://example.com/a.mp3');
  expect(audioPlaybackSnapshot().playing).toBe(true);
  await toggleAudioPlayback('https://example.com/a.mp3');
  expect(mockSound.pausePlayer).toHaveBeenCalledTimes(1);
  expect(audioPlaybackSnapshot().paused).toBe(true);
  await toggleAudioPlayback('https://example.com/a.mp3');
  expect(mockSound.resumePlayer).toHaveBeenCalledTimes(1);
});
test('detiene el audio anterior antes de reproducir otro', async () => {
  await toggleAudioPlayback('a');
  await toggleAudioPlayback('b');
  expect(mockSound.stopPlayer).toHaveBeenCalledTimes(1);
  expect(audioPlaybackSnapshot().uri).toBe('b');
  await stopAudioPlayback('a');
  expect(audioPlaybackSnapshot().uri).toBe('b');
  await stopAudioPlayback('b');
  expect(audioPlaybackSnapshot().playing).toBe(false);
});
test('serializa salir de pantalla durante la carga del audio', async () => {
  let resolve!: (value: string) => void;
  mockSound.startPlayer.mockImplementationOnce(() => new Promise<string>(done => { resolve = done; }));
  const play = toggleAudioPlayback('a');
  await Promise.resolve();
  const stop = stopAudioPlayback('a');
  resolve('ok');
  await Promise.all([play, stop]);
  expect(audioPlaybackSnapshot().playing).toBe(false);
});
test('un error de reproducción permite reintentar', async () => {
  mockSound.startPlayer.mockRejectedValueOnce(new Error('offline'));
  await expect(toggleAudioPlayback('a')).rejects.toThrow('offline');
  expect(audioPlaybackSnapshot().busy).toBe(false);
  await toggleAudioPlayback('a');
  expect(audioPlaybackSnapshot().playing).toBe(true);
});
