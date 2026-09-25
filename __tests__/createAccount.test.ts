jest.mock('../src/services/firebase/firebaseConfig', () => ({ auth: {
  authStateReady: jest.fn().mockResolvedValue(undefined),
  currentUser: { getIdToken: jest.fn().mockResolvedValue('test-token') },
  app: { options: { projectId: 'test-project' } },
} }));
import { createAccount } from '../src/services/firebase/createAccount';
const originalFetch = global.fetch;
const credentials = { displayName: 'Admin', email: 'test@example.com', password: 'example123', role: 'admin' as const };
afterEach(() => { global.fetch = originalFetch; });
test('envía token y protocolo callable sin reemplazar la sesión', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result: { id: 'new-id' } }) });
  expect(await createAccount(credentials)).toEqual({ id: 'new-id' });
  expect(global.fetch).toHaveBeenCalledWith('https://us-central1-test-project.cloudfunctions.net/createManagedUser', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }), body: JSON.stringify({ data: credentials }) }));
});
test('distingue falta de respuesta de un rechazo del servidor', async () => {
  global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
  await expect(createAccount(credentials)).rejects.toThrow('conexión del teléfono');
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: { message: 'Email existente' } }) });
  await expect(createAccount(credentials)).rejects.toThrow('Email existente');
});
