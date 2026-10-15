const mockRead = jest.fn();
const mockUpdate = jest.fn();
const mockDoc = jest.fn(() => ({ get: mockRead, update: mockUpdate }));
jest.mock('firebase-functions', () => ({ https: {
  onCall: (handler: unknown) => handler,
  HttpsError: class extends Error { code: string; constructor(code: string, message: string) { super(message); this.code = code; } },
} }), { virtual: true });
jest.mock('firebase-admin/firestore', () => ({ Timestamp: { now: () => 'now' }, getFirestore: () => ({ collection: () => ({ doc: mockDoc }) }) }), { virtual: true });
import { deactivateOwnAccount } from '../functions/src/deactivateOwnAccount';
const call = deactivateOwnAccount as unknown as (data: unknown, context: unknown) => Promise<any>;
beforeEach(() => { jest.clearAllMocks(); mockRead.mockResolvedValue({ exists: true }); });
test('solo deshabilita el UID autenticado sin borrar datos', async () => {
  expect(await call({}, { auth: { uid: 'self' } })).toEqual({ isEnabled: false });
  expect(mockDoc).toHaveBeenCalledWith('self');
  expect(mockUpdate).toHaveBeenCalledWith({ isEnabled: false, updatedAt: 'now' });
});
test('rechaza llamadas anónimas o intentos de modificar otra cuenta', async () => {
  await expect(call({}, {})).rejects.toMatchObject({ code: 'unauthenticated' });
  await expect(call({ uid: 'other' }, { auth: { uid: 'self' } })).rejects.toMatchObject({ code: 'invalid-argument' });
  expect(mockUpdate).not.toHaveBeenCalled();
});
test('una cuenta inexistente no se crea y un fallo no informa éxito', async () => {
  mockRead.mockResolvedValueOnce({ exists: false });
  await expect(call({}, { auth: { uid: 'self' } })).rejects.toMatchObject({ code: 'not-found' });
  expect(mockUpdate).not.toHaveBeenCalled();
  mockUpdate.mockRejectedValueOnce(new Error('offline'));
  await expect(call({}, { auth: { uid: 'self' } })).rejects.toThrow('offline');
});
