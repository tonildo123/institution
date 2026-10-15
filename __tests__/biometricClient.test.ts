const mockNative = { createSignature: jest.fn(), biometricKeysExist: jest.fn(), createKeys: jest.fn(), isSensorAvailable: jest.fn(), deleteKeys: jest.fn() };
const mockStorage = new Map<string, string>();
jest.mock('react-native-biometrics', () => ({ __esModule: true, default: jest.fn(() => ({ createSignature: (...args: any[]) => mockNative.createSignature(...args), biometricKeysExist: (...args: any[]) => mockNative.biometricKeysExist(...args), createKeys: (...args: any[]) => mockNative.createKeys(...args), isSensorAvailable: (...args: any[]) => mockNative.isSensorAvailable(...args), deleteKeys: (...args: any[]) => mockNative.deleteKeys(...args) })) }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async key => mockStorage.get(key) || null),
  setItem: jest.fn(async (key, value) => { mockStorage.set(key, value); }),
  removeItem: jest.fn(async key => { mockStorage.delete(key); }),
}));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ auth: {
  authStateReady: jest.fn(), app: { options: { projectId: 'test-project' } },
  currentUser: { uid: 'self', email: 'self@familias.imep.invalid', getIdToken: jest.fn().mockResolvedValue('token') },
} }));
jest.mock('firebase/auth', () => ({ EmailAuthProvider: { credential: jest.fn((email, password) => ({ email, password })) }, reauthenticateWithCredential: jest.fn(), signInWithCustomToken: jest.fn().mockResolvedValue({ user: { uid: 'self' } }) }));
jest.mock('../src/services/firebase/auth', () => ({ getUserData: jest.fn().mockResolvedValue({ id: 'self', role: 'familia', isEnabled: true }) }));
import { enableBiometrics, authorizeBiometricMessage, loginWithBiometrics } from '../src/services/biometrics';
import { sendCommunicationToUsers } from '../src/services/communicationsService';
import { signInWithCustomToken } from 'firebase/auth';
const originalFetch = global.fetch;
const deviceId = 'a'.repeat(64);
beforeEach(() => {
  jest.clearAllMocks(); mockStorage.clear();
  mockNative.biometricKeysExist.mockResolvedValue({ keysExist: true });
  mockNative.createSignature.mockResolvedValue({ success: true, signature: 'signature' });
  mockNative.isSensorAvailable.mockResolvedValue({ available: true, biometryType: 'FaceID' });
  mockNative.createKeys.mockResolvedValue({ publicKey: 'public-key' });
  global.fetch = jest.fn().mockImplementation(async url => ({ ok: true, json: async () => ({ result: url.includes('enrollBiometrics') ? { deviceId } : url.includes('verifyBiometricLogin') ? { token: 'custom-token' } : { challengeId: `${deviceId}_send`, payload: 'nonce' } }) }));
});
afterEach(() => { global.fetch = originalFetch; });
const enrolled = () => mockStorage.set('imep.biometric.device.v1', JSON.stringify({ uid: 'self', deviceId }));
test('la activación confirma posesión de clave y guarda solo IDs, sin contraseña', async () => {
  await enableBiometrics('current-password');
  expect(mockNative.createSignature).toHaveBeenCalledWith(expect.objectContaining({ payload: 'imep:enroll:self:public-key' }));
  expect([...mockStorage.values()]).toEqual([JSON.stringify({ uid: 'self', deviceId, publicKey: 'public-key' })]);
  expect(JSON.stringify((fetch as jest.Mock).mock.calls)).not.toContain('current-password');
});
test('cancelar la biometría impide llamar al endpoint de envío', async () => {
  enrolled(); mockNative.createSignature.mockResolvedValue({ success: false });
  const store = { getState: () => ({ auth: { user: { id: 'self' } } }) };
  await expect(sendCommunicationToUsers({ title: 'Mensaje', body: 'Contenido' }, store, ['family'])).rejects.toThrow('cancelado');
  expect((fetch as jest.Mock).mock.calls.every(call => call[0].includes('biometricChallenge'))).toBe(true);
});
test('cada mensaje obtiene una confirmación nueva y agrega la firma al cuerpo', async () => {
  enrolled();
  const body = { title: 'Mensaje', body: 'Contenido', userIds: ['family'] };
  expect(await authorizeBiometricMessage(body)).toEqual({ ...body, biometric: { deviceId, challengeId: `${deviceId}_send`, signature: 'signature' } });
  const request = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
  expect(request.data.message).toEqual(body);
});
test('sin activación local no se simula una confirmación biométrica', async () => {
  const body = { title: 'Mensaje' };
  expect(await authorizeBiometricMessage(body)).toBe(body);
  expect(mockNative.createSignature).not.toHaveBeenCalled();
});
test('el ingreso biométrico verifica la firma antes de iniciar la sesión de Firebase', async () => {
  enrolled();
  await expect(loginWithBiometrics()).resolves.toMatchObject({ id: 'self' });
  expect(signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), 'custom-token');
  expect((fetch as jest.Mock).mock.calls[1][0]).toContain('verifyBiometricLogin');
});
