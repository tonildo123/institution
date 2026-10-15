jest.mock('../src/services/firebase/firebaseConfig', () => ({ db: {} }));
jest.mock('../src/services/firebase/createAccount', () => ({ createAccount: jest.fn() }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((_, collection, id) => `${collection}/${id}`),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  Timestamp: { fromDate: jest.fn((date: Date) => ({ date })) },
}));
import { updateUser } from '../src/services/firebase/users';
import { updateDoc } from 'firebase/firestore';
beforeEach(() => jest.clearAllMocks());
test('actualiza una familia sin enviar correo ni otros campos opcionales undefined', async () => {
  await updateUser('family', { displayName: 'Familia', dni: '70000000', email: undefined, enabledAt: undefined, isEnabled: true });
  const [path, data] = (updateDoc as jest.Mock).mock.calls[0];
  expect(path).toBe('users/family');
  expect(data).toMatchObject({ displayName: 'Familia', dni: '70000000', isEnabled: true, updatedAt: expect.anything() });
  expect(data).not.toHaveProperty('email');
  expect(data).not.toHaveProperty('enabledAt');
  expect(Object.values(data)).not.toContain(undefined);
});
test('conserva false, campos vacíos explícitos y convierte la fecha de habilitación', async () => {
  const enabledAt = new Date('2026-10-15T00:00:00Z');
  await updateUser('family', { email: '', isEnabled: false, enabledAt });
  expect(updateDoc).toHaveBeenCalledWith('users/family', expect.objectContaining({ email: '', isEnabled: false, enabledAt: { date: enabledAt } }));
});
