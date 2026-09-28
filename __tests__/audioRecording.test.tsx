import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { AppState, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
const mockSound = {
  setSubscriptionDuration: jest.fn(), addRecordBackListener: jest.fn(), removeRecordBackListener: jest.fn(),
  startRecorder: jest.fn(), stopRecorder: jest.fn(), dispose: jest.fn(),
};
jest.mock('react-native-nitro-sound', () => ({ createSound: () => mockSound,
  AudioEncoderAndroidType: { AAC: 3 }, OutputFormatAndroidType: { MPEG_4: 2 } }));
jest.mock('../src/services/audioPlayback', () => ({ stopAudioPlayback: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../src/components/MessageAudio', () => ({ MessageAudio: () => null }));
jest.mock('../src/services/messageAudio', () => ({ recordedMessageAudio: jest.fn().mockResolvedValue({ uri: 'file://saved.m4a', name: 'Nota de voz', durationMs: 1000 }) }));
import { AudioAttachmentComposer } from '../src/components/AudioAttachmentComposer';
let tree: ReactTestRenderer;
const attach = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'android';
  AppState.currentState = 'active';
  jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  mockSound.startRecorder.mockResolvedValue('/cache/sound.mp4');
  mockSound.stopRecorder.mockResolvedValue('/cache/sound.mp4');
});
afterEach(async () => { if (tree!) await act(async () => { tree.unmount(); }); jest.restoreAllMocks(); });
async function mount() { await act(async () => { tree = create(<AudioAttachmentComposer onAttach={attach} onPick={jest.fn()} />); }); }
async function press(index = 0) { await act(async () => { tree.root.findAllByType(TouchableOpacity)[index].props.onPress(); }); }
test('pide permiso y no graba si se deniega', async () => {
  (PermissionsAndroid.request as jest.Mock).mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);
  await mount(); await press();
  expect(mockSound.startRecorder).not.toHaveBeenCalled();
  expect(attach).not.toHaveBeenCalled();
});
test('detiene, prepara y adjunta la nota solo al confirmar', async () => {
  await mount(); await press();
  expect(mockSound.startRecorder).toHaveBeenCalled();
  await act(async () => { mockSound.addRecordBackListener.mock.calls[0][0]({ currentPosition: 1000, isRecording: true }); });
  await press();
  expect(mockSound.stopRecorder).toHaveBeenCalled();
  expect(attach).not.toHaveBeenCalled();
  await press(1);
  expect(attach).toHaveBeenCalledWith(expect.objectContaining({ uri: 'file://saved.m4a' }));
});
test('cerrar el panel detiene el micrófono y descarta la nota', async () => {
  await mount(); await press();
  await act(async () => { tree.unmount(); });
  expect(mockSound.stopRecorder).toHaveBeenCalledTimes(1);
  expect(mockSound.dispose).toHaveBeenCalled();
  expect(attach).not.toHaveBeenCalled();
});
test('al llegar a cinco minutos detiene automáticamente la grabación', async () => {
  await mount(); await press();
  await act(async () => { mockSound.addRecordBackListener.mock.calls[0][0]({ currentPosition: 300000, isRecording: true }); });
  expect(mockSound.stopRecorder).toHaveBeenCalledTimes(1);
});
test('salir al fondo detiene la grabación', async () => {
  await mount(); await press();
  await act(async () => { (AppState.addEventListener as jest.Mock).mock.calls[0][1]('background'); });
  expect(mockSound.stopRecorder).toHaveBeenCalledTimes(1);
});

test('cerrar mientras el micrófono inicia también lo detiene al terminar', async () => {
  let resolve!: (uri: string) => void;
  mockSound.startRecorder.mockImplementationOnce(() => new Promise<string>(done => { resolve = done; }));
  await mount(); await press();
  await act(async () => { tree.unmount(); resolve('/cache/sound.mp4'); });
  expect(mockSound.stopRecorder).toHaveBeenCalledTimes(1);
  expect(mockSound.dispose).toHaveBeenCalled();
  expect(attach).not.toHaveBeenCalled();
});
