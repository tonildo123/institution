jest.mock('../src/services/firebase/firebaseConfig', () => ({ auth: {}, db: {} }));
jest.mock('../src/services/firebase/users', () => ({ getUserByDNI: jest.fn() }));
jest.mock('firebase/firestore', () => ({ doc: jest.fn((_, collection, id) => `${collection}/${id}`), getDoc: jest.fn() }));
jest.mock('firebase/auth', () => ({ signInWithEmailAndPassword: jest.fn(), signOut: jest.fn() }));
import { authenticateEmailProfile } from '../src/services/firebase/auth';
import { getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
beforeEach(() => { jest.clearAllMocks(); (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: 'teacher' } }); });
test('resuelve el perfil del UID autenticado y no de un correo de contacto compartido', async () => {
  (getDoc as jest.Mock).mockResolvedValue({ id: 'teacher', exists: () => true, data: () => ({ role: 'preceptor', isEnabled: true }) });
  expect(await authenticateEmailProfile(' TEACHER@example.com ', 'password')).toMatchObject({ id: 'teacher' });
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'teacher@example.com', 'password');
  expect(getDoc).toHaveBeenCalledWith('users/teacher');
});
test.each([null, { role: 'familia', isEnabled: true }, { role: 'admin', isEnabled: false }])('cierra la sesión si el perfil no tiene acceso por email: %j', async profile => {
  (getDoc as jest.Mock).mockResolvedValue({ exists: () => Boolean(profile), data: () => profile });
  await expect(authenticateEmailProfile('test@example.com', 'password')).rejects.toThrow('habilitada');
  expect(signOut).toHaveBeenCalled();
});
