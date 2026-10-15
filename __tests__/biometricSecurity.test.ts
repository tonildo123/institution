import { generateKeyPairSync, sign } from 'node:crypto';
const mockStore = new Map<string, any>();
const mockAccount = jest.fn();
const mockToken = jest.fn();
const mockRef = (path: string): any => ({
  path, id: path.split('/').pop(),
  collection: (name: string) => mockCollection(`${path}/${name}`),
  get: async () => mockSnapshot(path),
});
const mockSnapshot = (path: string) => ({ exists: mockStore.has(path), data: () => mockStore.get(path), ref: mockRef(path) });
const mockCollection = (path: string): any => ({
  doc: (id: string) => mockRef(`${path}/${id}`),
  where: () => ({ where: () => ({ get: async () => ({ docs: [] }) }) }),
});
jest.mock('firebase-functions', () => ({ https: {
  onCall: (fn: unknown) => fn,
  HttpsError: class extends Error { code: string; constructor(code: string, message: string) { super(message); this.code = code; } },
} }), { virtual: true });
jest.mock('firebase-admin/auth', () => ({ getAuth: () => ({ getUser: mockAccount, createCustomToken: mockToken }) }), { virtual: true });
jest.mock('firebase-admin/firestore', () => ({
  Timestamp: { now: () => 'timestamp' },
  getFirestore: () => ({ collection: mockCollection, runTransaction: async (fn: any) => fn({
    get: (ref: any) => ref.get(),
    set: (ref: any, value: any) => mockStore.set(ref.path, value),
    update: (ref: any, value: any) => mockStore.set(ref.path, { ...mockStore.get(ref.path), ...value }),
    delete: (ref: any) => mockStore.delete(ref.path),
  }) }),
}), { virtual: true });
jest.mock('../functions/src/biometricCrypto.js', () => require('../functions/src/biometricCrypto'), { virtual: true });
import { biometricChallenge, enrollBiometrics, consumeBiometricProof, verifySendBiometrics, verifyBiometricLogin } from '../functions/src/biometrics';
import { deviceIdForKey, messageDigest, verifyBiometricSignature } from '../functions/src/biometricCrypto';
const keypair = generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicKey = keypair.publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
const deviceId = deviceIdForKey(publicKey);
const signed = (payload: string) => sign('RSA-SHA256', Buffer.from(payload), keypair.privateKey).toString('base64');
const callable = (fn: unknown) => fn as (data: any, context: any) => Promise<any>;
const context = () => ({ auth: { uid: 'self', token: { firebase: { sign_in_provider: 'password' }, auth_time: Date.now() / 1000 } } });
beforeEach(() => {
  jest.clearAllMocks(); mockStore.clear();
  mockStore.set('users/self', { role: 'preceptor', isEnabled: true });
  mockStore.set(`biometricDevices/${deviceId}`, { uid: 'self', publicKey, enabled: true, validAfter: 'original' });
  mockAccount.mockResolvedValue({ disabled: false, tokensValidAfterTime: 'original' });
  mockToken.mockResolvedValue('custom-token');
});
async function proof(action: string, message?: any) {
  const result = await callable(biometricChallenge)({ deviceId, action, message }, action === 'login' ? {} : context());
  return { deviceId, challengeId: result.challengeId, signature: signed(result.payload) };
}
test('firma RSA real: un payload o firma adulterados son rechazados', () => {
  expect(verifyBiometricSignature(publicKey, 'payload', signed('payload'))).toBe(true);
  expect(verifyBiometricSignature(publicKey, 'changed', signed('payload'))).toBe(false);
  expect(verifyBiometricSignature(publicKey, 'payload', 'invalid')).toBe(false);
});
test('la confirmación de envío se liga al mensaje y destinatarios y no puede reutilizarse', async () => {
  const message = { title: 'Aviso', body: 'Privado', userIds: ['family'], level: 'primario' };
  const p = await proof('send', message);
  await expect(consumeBiometricProof(p, 'send', 'self', { ...message, userIds: ['other'] })).rejects.toThrow();
  expect(await consumeBiometricProof(p, 'send', 'self', message)).toBe('self');
  await expect(consumeBiometricProof(p, 'send', 'self', message)).rejects.toThrow();
});
test('rechaza desafíos vencidos, de otra acción o de otra cuenta', async () => {
  const p = await proof('unlock');
  await expect(consumeBiometricProof(p, 'unlock', 'other')).rejects.toThrow();
  await expect(consumeBiometricProof(p, 'login')).rejects.toThrow();
  mockStore.get(`biometricChallenges/${p.challengeId}`).expiresAt = 1;
  await expect(consumeBiometricProof(p, 'unlock', 'self')).rejects.toThrow();
});
test('un dispositivo revocado no puede reutilizar un desafío ya emitido', async () => {
  const p = await proof('unlock');
  mockStore.get(`biometricDevices/${deviceId}`).enabled = false;
  await expect(consumeBiometricProof(p, 'unlock', 'self')).rejects.toThrow();
});
test('ingreso sin contraseña exige firma, dispositivo vigente y perfil habilitado', async () => {
  const result = await callable(verifyBiometricLogin)(await proof('login'), {});
  expect(result).toEqual({ token: 'custom-token' });
  expect(mockToken).toHaveBeenCalledWith('self');
});
test('cambiar la contraseña o deshabilitar la cuenta impide nuevos desafíos', async () => {
  mockAccount.mockResolvedValueOnce({ tokensValidAfterTime: 'changed' });
  await expect(proof('login')).rejects.toThrow('acceso cambió');
  mockStore.get('users/self').isEnabled = false;
  await expect(proof('login')).rejects.toThrow('habilitada');
});
test('para activar se necesita una contraseña reciente y posesión de la clave', async () => {
  const data = { publicKey, signature: signed(`imep:enroll:self:${publicKey}`) };
  await expect(callable(enrollBiometrics)(data, {})).rejects.toThrow();
  await expect(callable(enrollBiometrics)(data, { auth: { uid: 'self', token: { auth_time: Date.now() / 1000, firebase: { sign_in_provider: 'custom' } } } })).rejects.toThrow();
  expect(await callable(enrollBiometrics)(data, context())).toEqual({ deviceId });
  expect(mockStore.get('biometricAccounts/self')).toEqual({ requireSend: true });
});
test('el servidor exige confirmación para cuentas activadas aunque el cliente la omita', async () => {
  mockStore.set('biometricAccounts/self', { requireSend: true });
  await expect(verifySendBiometrics('self', { title: 'Mensaje' })).rejects.toThrow();
  mockStore.set('biometricAccounts/self', { requireSend: false });
  await expect(verifySendBiometrics('self', {})).resolves.toBeUndefined();
});
test('el resumen es estable ante orden de campos y cambia al modificar el contenido', () => {
  expect(messageDigest({ title: 'A', body: 'B', data: { a: '1', b: '2' } })).toBe(messageDigest({ data: { b: '2', a: '1' }, body: 'B', title: 'A' }));
  expect(messageDigest({ title: 'A' })).not.toBe(messageDigest({ title: 'B' }));
});
