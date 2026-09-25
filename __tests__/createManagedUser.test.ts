const mockActor = jest.fn();
const mockExisting = jest.fn();
const mockCreateProfile = jest.fn();
const mockCreateAuth = jest.fn();
const mockDeleteAuth = jest.fn();
jest.mock('firebase-functions', () => ({
  https: {
    onCall: (handler: unknown) => handler,
    HttpsError: class extends Error { code: string; constructor(code: string, message: string) { super(message); this.code = code; } },
  }, logger: { error: jest.fn() },
}), { virtual: true });
jest.mock('firebase-admin/auth', () => ({ getAuth: () => ({ createUser: mockCreateAuth, deleteUser: mockDeleteAuth }) }), { virtual: true });
jest.mock('firebase-admin/firestore', () => ({
  Timestamp: { now: () => ({ toDate: () => new Date('2026-09-23T00:00:00Z') }) },
  getFirestore: () => ({ collection: () => ({
    doc: () => ({ get: mockActor, create: mockCreateProfile }),
    where: () => ({ limit: () => ({ get: mockExisting }) }),
  }) }),
}), { virtual: true });
import { createManagedUser } from '../functions/src/createManagedUser';
const call = createManagedUser as unknown as (data: unknown, context: unknown) => Promise<any>;
const input = { displayName: 'Docente', email: 'teacher@example.com', password: 'password-test', role: 'preceptor', isEnabled: true };
const context = { auth: { uid: 'admin-id' } };
beforeEach(() => {
  jest.resetAllMocks();
  mockActor.mockResolvedValue({ exists: true, data: () => ({ role: 'admin', isEnabled: true }) });
  mockExisting.mockResolvedValue({ empty: true });
  mockCreateAuth.mockResolvedValue({ uid: 'new-uid' });
  mockCreateProfile.mockResolvedValue(undefined);
});
test('rechaza solicitudes sin autenticación o sin rol administrador', async () => {
  await expect(call(input, {})).rejects.toMatchObject({ code: 'unauthenticated' });
  mockActor.mockResolvedValue({ exists: true, data: () => ({ role: 'familia', isEnabled: true }) });
  await expect(call(input, context)).rejects.toMatchObject({ code: 'permission-denied' });
  expect(mockCreateAuth).not.toHaveBeenCalled();
});
test('crea mismo UID sin guardar ni devolver la contraseña', async () => {
  const result = await call(input, context);
  expect(result.id).toBe('new-uid');
  expect(result.password).toBeUndefined();
  expect(mockCreateProfile.mock.calls[0][0].password).toBeUndefined();
  expect(mockCreateProfile.mock.calls[0][0].id).toBe('new-uid');
});
test('rechaza email duplicado antes de crear Auth', async () => {
  mockExisting.mockResolvedValue({ empty: false });
  await expect(call(input, context)).rejects.toMatchObject({ code: 'already-exists' });
  expect(mockCreateAuth).not.toHaveBeenCalled();
});
test('revierte Auth si falla la escritura del perfil', async () => {
  mockCreateProfile.mockRejectedValue(new Error('Firestore unavailable'));
  await expect(call(input, context)).rejects.toMatchObject({ code: 'internal' });
  expect(mockDeleteAuth).toHaveBeenCalledWith('new-uid');
});
test('rechaza contraseña inválida y crea deshabilitados en ambos servicios', async () => {
  await expect(call({ ...input, password: '1' }, context)).rejects.toMatchObject({ code: 'invalid-argument' });
  const result = await call({ ...input, isEnabled: false }, context);
  expect(mockCreateAuth).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
  expect(result.isEnabled).toBe(false);
});
