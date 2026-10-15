jest.mock('../src/services/firebase/firebaseConfig', () => ({ auth: { authStateReady: jest.fn(), app: { options: { projectId: 'test-project' } }, currentUser: { uid: 'self', email: 'self@familias.imep.invalid', getIdToken: jest.fn().mockResolvedValue('token') } } }));
jest.mock('firebase/auth', () => ({ EmailAuthProvider: { credential: jest.fn((email, password) => ({ email, password })) }, reauthenticateWithCredential: jest.fn(), signInWithEmailAndPassword: jest.fn() }));
import { reauthenticateWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { saveOwnProfile, deactivateOwnAccount } from '../src/services/firebase/profile';
const originalFetch = global.fetch;
beforeEach(() => { jest.clearAllMocks(); global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result: { displayName: 'Familia', email: 'contact@example.com', authEmail: 'self@familias.imep.invalid' } }) }); (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: 'self' } }); });
afterEach(() => { global.fetch = originalFetch; });
test('verifica la contraseña del alias familiar y renueva la sesión al cambiar sus datos', async () => {
  await saveOwnProfile({ displayName: 'Familia', email: 'contact@example.com', password: 'new-secret' }, 'old-secret', '');
  expect(reauthenticateWithCredential).toHaveBeenCalledWith(expect.anything(), { email: 'self@familias.imep.invalid', password: 'old-secret' });
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'self@familias.imep.invalid', 'new-secret');
  const sent = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
  expect(sent.data).not.toHaveProperty('currentPassword');
});
test('contraseña incorrecta detiene la operación antes de guardar', async () => {
  (reauthenticateWithCredential as jest.Mock).mockRejectedValueOnce(new Error('wrong'));
  await expect(saveOwnProfile({ displayName: 'Familia', email: 'contact@example.com' }, 'wrong', '')).rejects.toThrow('contraseña actual');
  expect(fetch).not.toHaveBeenCalled();
});


test('devuelve la foto guardada para actualizar el avatar junto con el nombre', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result: { displayName: 'Familia', email: '', photoURL: 'https://example.com/photo.jpg' } }) });
  expect(await saveOwnProfile({ displayName: 'Familia', email: '', photoPath: 'profile-photos/self/id' }, '', '')).toEqual({ displayName: 'Familia', email: '', photoURL: 'https://example.com/photo.jpg' });
});

test('la baja envía una solicitud autenticada sin permitir elegir otro usuario', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result: { isEnabled: false } }) });
  await deactivateOwnAccount();
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/deactivateOwnAccount'), expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token' }), body: JSON.stringify({ data: {} }) }));
});
test('la baja rechazada por Firebase no se informa como exitosa', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ error: { message: 'No autorizado' } }) });
  await expect(deactivateOwnAccount()).rejects.toThrow('No autorizado');
});
