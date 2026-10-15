const mockActor = jest.fn();
const mockProfile = jest.fn();
const mockGetAuth = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
jest.mock('firebase-functions', () => ({ https: {
  onCall: (fn: unknown) => fn,
  HttpsError: class extends Error { code: string; constructor(code: string, message: string) { super(message); this.code = code; } },
} }), { virtual: true });
jest.mock('firebase-admin/auth', () => ({ getAuth: () => ({ getUser: mockGetAuth, createUser: mockCreate, updateUser: mockUpdate }) }), { virtual: true });
jest.mock('firebase-admin/firestore', () => ({ getFirestore: () => ({ collection: () => ({ doc: (id: string) => ({ get: id === 'admin' ? mockActor : mockProfile }) }) }) }), { virtual: true });
import { setFamilyPassword } from '../functions/src/setFamilyPassword';
const call = setFamilyPassword as unknown as (data: unknown, context: unknown) => Promise<unknown>;
const context = { auth: { uid: 'admin' } };
beforeEach(() => {
  jest.resetAllMocks();
  mockActor.mockResolvedValue({ exists: true, data: () => ({ role: 'admin', isEnabled: true }) });
  mockProfile.mockResolvedValue({ exists: true, data: () => ({ role: 'familia', isEnabled: true, displayName: 'Familia' }) });
  mockGetAuth.mockRejectedValue({ code: 'auth/user-not-found' });
});
test('solo administradores habilitados pueden establecer contraseñas', async () => {
  await expect(call({ userId: 'family', password: 'secret123' }, {})).rejects.toMatchObject({ code: 'unauthenticated' });
  mockActor.mockResolvedValue({ exists: true, data: () => ({ role: 'preceptor', isEnabled: true }) });
  await expect(call({ userId: 'family', password: 'secret123' }, context)).rejects.toMatchObject({ code: 'permission-denied' });
  expect(mockCreate).not.toHaveBeenCalled();
});
test('prepara Auth conservando el UID de la familia sin modificar su perfil', async () => {
  expect(await call({ userId: 'user_1', password: 'secret123' }, context)).toEqual({ success: true });
  expect(mockCreate).toHaveBeenCalledWith({ uid: 'user_1', email: 'user_1@familias.imep.invalid', password: 'secret123', displayName: 'Familia', disabled: false });
});
test('restablece solo una identidad previamente vinculada al alias esperado', async () => {
  mockGetAuth.mockResolvedValue({ email: 'user_1@familias.imep.invalid' });
  await call({ userId: 'user_1', password: 'secret123' }, context);
  expect(mockUpdate).toHaveBeenCalledWith('user_1', { password: 'secret123', disabled: false });
  mockGetAuth.mockResolvedValue({ email: 'another@example.com' });
  await expect(call({ userId: 'user_1', password: 'secret123' }, context)).rejects.toMatchObject({ code: 'failed-precondition' });
});
test('rechaza contraseñas débiles y perfiles que no son familia', async () => {
  await expect(call({ userId: 'family', password: 'a' }, context)).rejects.toMatchObject({ code: 'invalid-argument' });
  mockProfile.mockResolvedValue({ exists: true, data: () => ({ role: 'admin' }) });
  await expect(call({ userId: 'family', password: 'secret123' }, context)).rejects.toMatchObject({ code: 'not-found' });
  expect(mockCreate).not.toHaveBeenCalled();
});

test('permite actualizar contraseña de usuarios por email sin modificar el perfil ni la sesión administrativa', async () => {
  const { setUserPassword } = require('../functions/src/setFamilyPassword');
  mockProfile.mockResolvedValue({ exists: true, data: () => ({ role: 'preceptor', email: 'teacher@example.com', isEnabled: true }) });
  mockGetAuth.mockResolvedValue({ email: 'teacher@example.com' });
  expect(await setUserPassword({ userId: 'teacher', password: 'new-secret' }, context)).toEqual({ success: true });
  expect(mockUpdate).toHaveBeenCalledWith('teacher', { password: 'new-secret', disabled: false });
  expect(mockCreate).not.toHaveBeenCalled();
});

test('no crea identidades por email que todavía no están vinculadas', async () => {
  const { setUserPassword } = require('../functions/src/setFamilyPassword');
  mockProfile.mockResolvedValue({ exists: true, data: () => ({ role: 'preceptor', email: 'teacher@example.com', isEnabled: true }) });
  await expect(setUserPassword({ userId: 'teacher', password: 'new-secret' }, context)).rejects.toMatchObject({ code: 'failed-precondition' });
  expect(mockCreate).not.toHaveBeenCalled();
});
