import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { AppState, TouchableOpacity } from 'react-native';
jest.mock('react-native-video', () => 'MockVideo');
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@react-navigation/native', () => ({ useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]) }));
jest.mock('../src/services/audioPlayback', () => ({ stopAudioPlayback: jest.fn().mockResolvedValue(undefined) }));
import Video from 'react-native-video';
import { stopAudioPlayback } from '../src/services/audioPlayback';
import { MessageVideo } from '../src/components/MessageVideo';
let tree: ReactTestRenderer;
beforeEach(() => { jest.clearAllMocks(); jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() }); });
afterEach(async () => { await act(async () => { tree?.unmount(); }); jest.restoreAllMocks(); });
async function mount() { await act(async () => { tree = create(<MessageVideo uri="https://example.com/video.mp4" />); }); }
async function play() { await act(async () => { tree.root.findAllByType(TouchableOpacity)[0].props.onPress(); }); }
test('no carga el video hasta tocar reproducir y detiene el audio anterior', async () => {
  await mount(); expect(tree.root.findAllByType(Video)).toHaveLength(0);
  await play(); expect(tree.root.findAllByType(Video)).toHaveLength(1);
  expect(stopAudioPlayback).toHaveBeenCalled();
});
test('pasar al fondo desmonta el reproductor', async () => {
  await mount(); await play();
  await act(async () => { (AppState.addEventListener as jest.Mock).mock.calls[0][1]('background'); });
  expect(tree.root.findAllByType(Video)).toHaveLength(0);
});
test('un error de reproducción muestra reintento en lugar de dejar un reproductor roto', async () => {
  await mount(); await play();
  await act(async () => { tree.root.findByType(Video).props.onError({ error: {} }); });
  expect(tree.root.findAllByType(Video)).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toContain('Reintentar');
});
