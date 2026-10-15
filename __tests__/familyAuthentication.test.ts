jest.mock('../src/services/firebase/firebaseConfig', () => ({ auth: {}, db: {} }));
jest.mock('../src/services/firebase/users', () => ({ getUserByDNI: jest.fn() }));
jest.mock('firebase/firestore', () => ({}));
jest.mock('firebase/auth', () => ({ signInWithEmailAndPassword: jest.fn(), signOut: jest.fn() }));
import { authenticateFamily } from '../src/services/firebase/auth';
import { getUserByDNI } from '../src/services/firebase/users';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
beforeEach(() => {
  jest.resetAllMocks();
  (getUserByDNI as jest.Mock).mockResolvedValue({ id: 'user_123', role: 'familia', isEnabled: true });
  (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: 'user_123' } });
});
test('verifica la contraseña con Auth y conserva el UID anterior de la familia', async () => {
  expect(await authenticateFamily(' 70000000 ', 'private-password')).toMatchObject({ id: 'user_123' });
  expect(getUserByDNI).toHaveBeenCalledWith('70000000');
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'user_123@familias.imep.invalid', 'private-password');
});
test.each([null, { id: 'x', role: 'familia', isEnabled: false }, { id: 'x', role: 'admin', isEnabled: true }])('no autentica perfiles inválidos: %j', async profile => {
  (getUserByDNI as jest.Mock).mockResolvedValue(profile);
  await expect(authenticateFamily('70000000', 'password')).rejects.toThrow();
  expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
});
test('una contraseña incorrecta no admite el ingreso y una identidad distinta se desconecta', async () => {
  (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error('invalid credential'));
  await expect(authenticateFamily('70000000', 'wrong')).rejects.toThrow('DNI o contraseña');
  (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: 'other' } });
  await expect(authenticateFamily('70000000', 'password')).rejects.toThrow();
  expect(signOut).toHaveBeenCalled();
});
