import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { AppState, Modal, Text, TouchableOpacity } from 'react-native';
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({ useSelector: (fn: any) => fn({ auth: { user: { id: 'self' } } }), useDispatch: () => mockDispatch }));
jest.mock('../src/redux/slices/authSlice', () => ({ setUser: (payload: any) => ({ type: 'auth/setUser', payload }) }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: 'SafeAreaProvider', SafeAreaView: 'SafeAreaView' }));
jest.mock('@react-native-async-storage/async-storage', () => ({ removeItem: jest.fn() }));
jest.mock('../src/services/firebase/auth', () => ({ logout: jest.fn() }));
jest.mock('../src/services/biometrics', () => ({ getBiometricDevice: jest.fn(), consumeVerifiedUnlock: jest.fn(), subscribeBiometrics: () => () => {}, unlockWithBiometrics: jest.fn() }));
import { getBiometricDevice, consumeVerifiedUnlock, unlockWithBiometrics } from '../src/services/biometrics';
import { BiometricLock } from '../src/components/BiometricLock';
let tree: ReactTestRenderer;
let appState: (state: string) => void;
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, callback: any) => { appState = callback; return { remove: jest.fn() }; });
  (getBiometricDevice as jest.Mock).mockResolvedValue({ uid: 'self', deviceId: 'device' });
});
afterEach(async () => { await act(async () => { tree?.unmount(); }); jest.restoreAllMocks(); });
async function mount() { await act(async () => { tree = create(<BiometricLock><Text>Contenido privado</Text></BiometricLock>); }); }
const locked = () => tree.root.findByType(Modal).props.visible;
async function unlock() { await act(async () => { tree.root.findAllByType(TouchableOpacity)[0].props.onPress(); }); }
test('una sesión restaurada con biometría activa queda bloqueada hasta verificar', async () => {
  await mount(); expect(locked()).toBe(true);
  await unlock(); expect(unlockWithBiometrics).toHaveBeenCalledTimes(1); expect(locked()).toBe(false);
});
test('volver del fondo bloquea otra vez, pero el diálogo nativo inactive no lo hace', async () => {
  (consumeVerifiedUnlock as jest.Mock).mockReturnValueOnce(true).mockReturnValue(false);
  await mount(); expect(locked()).toBe(false);
  await act(async () => { appState('inactive'); }); expect(locked()).toBe(false);
  await act(async () => { appState('background'); }); expect(locked()).toBe(true);
});
test('una cuenta sin biometría activada conserva el acceso normal', async () => {
  (getBiometricDevice as jest.Mock).mockResolvedValue(null);
  await mount(); expect(locked()).toBe(false);
});
