const mockProfile = jest.fn();
const mockWrite = jest.fn();
const mockAccount = jest.fn();
const mockAuthUpdate = jest.fn();
const mockPhotoMetadata = jest.fn();
const mockPhotoURL = jest.fn();
const mockDoc = jest.fn(() => ({ get: mockProfile, update: mockWrite }));
jest.mock('firebase-functions', () => ({ https: {
  onCall: (fn: unknown) => fn,
  HttpsError: class extends Error { code: string; details: unknown; constructor(code: string, message: string, details?: unknown) { super(message); this.code = code; this.details = details; } },
}, logger: { error: jest.fn() } }), { virtual: true });
jest.mock('firebase-admin/storage', () => ({ getStorage: () => ({ bucket: () => ({ file: () => ({ getMetadata: mockPhotoMetadata }) }) }), getDownloadURL: (...args: any[]) => mockPhotoURL(...args) }), { virtual: true });
jest.mock('firebase-admin/auth', () => ({ getAuth: () => ({ getUser: mockAccount, updateUser: mockAuthUpdate }) }), { virtual: true });
jest.mock('firebase-admin/firestore', () => ({ Timestamp: { now: () => 'now' }, getFirestore: () => ({ collection: () => ({ doc: mockDoc }) }) }), { virtual: true });
import { updateOwnProfile } from '../functions/src/updateOwnProfile';
const call = updateOwnProfile as unknown as (data: unknown, context: unknown) => Promise<any>;
const context = () => ({ auth: { uid: 'self', token: { firebase: { sign_in_provider: 'password' }, auth_time: Date.now() / 1000 } } });
const input = { displayName: 'Nuevo nombre', email: 'new@example.com' };
beforeEach(() => {
  jest.resetAllMocks();
  mockDoc.mockReturnValue({ get: mockProfile, update: mockWrite });
  mockProfile.mockResolvedValue({ exists: true, data: () => ({ role: 'preceptor', email: 'old@example.com', isEnabled: true }) });
  mockAccount.mockResolvedValue({ email: 'old@example.com', displayName: 'Anterior', emailVerified: true });
  mockAuthUpdate.mockResolvedValue(undefined);
  mockWrite.mockResolvedValue(undefined);
  mockPhotoMetadata.mockResolvedValue([{ size: 1024, contentType: 'image/jpeg' }]);
  mockPhotoURL.mockResolvedValue('https://example.com/own-photo.jpg');
});
test('solo permite editar el perfil autenticado y nunca rol, estado o asignaciones', async () => {
  await expect(call(input, {})).rejects.toMatchObject({ code: 'unauthenticated' });
  for (const extra of [{ userId: 'other' }, { role: 'admin' }, { isEnabled: true }, { assignedCursos: ['sec-1'] }]) {
    await expect(call({ ...input, ...extra }, context())).rejects.toMatchObject({ code: 'invalid-argument' });
  }
  expect(mockWrite).not.toHaveBeenCalled();
});
test('sincroniza nombre y correo de acceso en Auth y Firestore con el mismo UID', async () => {
  expect(await call(input, context())).toMatchObject(input);
  expect(mockDoc).toHaveBeenCalledWith('self');
  expect(mockAuthUpdate).toHaveBeenCalledWith('self', { displayName: 'Nuevo nombre', email: 'new@example.com', emailVerified: false });
  expect(mockWrite).toHaveBeenCalledWith({ ...input, updatedAt: 'now' });
});
test('en familias el correo es de contacto y conserva el alias de acceso y el DNI', async () => {
  mockProfile.mockResolvedValue({ exists: true, data: () => ({ role: 'familia', dni: '70000000', isEnabled: true }) });
  mockAccount.mockResolvedValue({ email: 'self@familias.imep.invalid', displayName: 'Anterior' });
  const result = await call({ ...input, password: 'new-secret' }, context());
  expect(result.authEmail).toBe('self@familias.imep.invalid');
  expect(mockAuthUpdate).toHaveBeenNthCalledWith(1, 'self', { displayName: input.displayName });
  expect(mockAuthUpdate).toHaveBeenNthCalledWith(2, 'self', { password: 'new-secret' });
  expect(mockWrite.mock.calls[0][0]).not.toHaveProperty('password');
  expect(mockWrite.mock.calls[0][0]).not.toHaveProperty('dni');
});
test('exige autenticación reciente para cambiar correo o contraseña', async () => {
  await expect(call(input, { auth: { uid: 'self', token: { auth_time: 1 } } })).rejects.toMatchObject({ code: 'failed-precondition' });
  expect(mockAuthUpdate).not.toHaveBeenCalled();
});
test('no requiere reautenticación para editar solamente el nombre', async () => {
  await expect(call({ ...input, email: 'old@example.com' }, { auth: { uid: 'self', token: { auth_time: 1 } } })).resolves.toMatchObject({ displayName: input.displayName });
});
test('revierte cambios de Auth si falla Firestore y no modifica la contraseña', async () => {
  mockWrite.mockRejectedValue(new Error('offline'));
  await expect(call({ ...input, password: 'new-secret' }, context())).rejects.toMatchObject({ code: 'internal' });
  expect(mockAuthUpdate).toHaveBeenLastCalledWith('self', { displayName: 'Anterior', email: 'old@example.com', emailVerified: true });
  expect(mockAuthUpdate.mock.calls.some((call: any[]) => call[1].password)).toBe(false);
});
test('informa resultado parcial si no se puede actualizar la contraseña', async () => {
  mockAuthUpdate.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Auth unavailable'));
  await expect(call({ ...input, password: 'new-secret' }, context())).rejects.toMatchObject({ details: { profileSaved: true, email: input.email } });
});
test('rechaza cuentas deshabilitadas y correos duplicados', async () => {
  mockProfile.mockResolvedValueOnce({ exists: true, data: () => ({ isEnabled: false }) });
  await expect(call(input, context())).rejects.toMatchObject({ code: 'permission-denied' });
  mockAuthUpdate.mockRejectedValueOnce({ code: 'auth/email-already-exists' });
  await expect(call(input, context())).rejects.toMatchObject({ code: 'already-exists' });
});


test('verifica la foto propia antes de actualizar Auth y Firestore y devuelve el avatar', async () => {
  const result = await call({ ...input, photoPath: 'profile-photos/self/photo-id' }, context());
  expect(result.photoURL).toBe('https://example.com/own-photo.jpg');
  expect(mockAuthUpdate).toHaveBeenCalledWith('self', expect.objectContaining({ photoURL: result.photoURL }));
  expect(mockWrite).toHaveBeenCalledWith(expect.objectContaining({ photoURL: result.photoURL }));
});
test('rechaza fotos ajenas y URLs arbitrarias', async () => {
  await expect(call({ ...input, photoPath: 'profile-photos/other/photo-id' }, context())).rejects.toMatchObject({ code: 'invalid-argument' });
  await expect(call({ ...input, photoURL: 'https://other.com/image' }, context())).rejects.toMatchObject({ code: 'invalid-argument' });
  expect(mockAuthUpdate).not.toHaveBeenCalled();
});
test('rechaza archivos que no son fotos o que superan el tamaño permitido', async () => {
  mockPhotoMetadata.mockResolvedValueOnce([{ contentType: 'application/pdf', size: 100 }]);
  await expect(call({ ...input, photoPath: 'profile-photos/self/photo-id' }, context())).rejects.toMatchObject({ code: 'invalid-argument' });
  mockPhotoMetadata.mockResolvedValueOnce([{ contentType: 'image/jpeg', size: 6 * 1024 * 1024 }]);
  await expect(call({ ...input, photoPath: 'profile-photos/self/photo-id' }, context())).rejects.toMatchObject({ code: 'invalid-argument' });
  expect(mockAuthUpdate).not.toHaveBeenCalled();
});
