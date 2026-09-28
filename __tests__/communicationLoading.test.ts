jest.mock('../src/services/firebase/firebaseConfig', () => ({ db: {}, auth: {
  authStateReady: jest.fn().mockResolvedValue(undefined), currentUser: { getIdToken: jest.fn().mockResolvedValue('token') },
} }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), query: jest.fn(), orderBy: jest.fn(), limit: jest.fn(), getDocsFromServer: jest.fn() }));
import { auth } from '../src/services/firebase/firebaseConfig';
import { getDocsFromServer, orderBy, limit } from 'firebase/firestore';
import { getAllCommunications, communicationLoadError } from '../src/services/firebase/communications';
beforeEach(() => { jest.clearAllMocks(); });
test('consulta al servidor los 30 más recientes tras preparar la sesión', async () => {
  (getDocsFromServer as jest.Mock).mockResolvedValue({ docs: [{ id: 'latest', data: () => ({ title: 'Último' }) }] });
  expect(await getAllCommunications()).toEqual([expect.objectContaining({ id: 'latest', title: 'Último' })]);
  expect(auth.authStateReady).toHaveBeenCalled(); expect(auth.currentUser!.getIdToken).toHaveBeenCalled();
  expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc'); expect(limit).toHaveBeenCalledWith(30);
});
test('un fallo offline no devuelve un listado vacío exitoso', async () => {
  const error = { code: 'unavailable' };
  (getDocsFromServer as jest.Mock).mockRejectedValue(error);
  await expect(getAllCommunications()).rejects.toEqual(error);
  expect(communicationLoadError(error)).toContain('conexión');
});
test('si no se puede renovar el token conserva el error y no consulta Firestore', async () => {
  (auth.currentUser!.getIdToken as jest.Mock).mockRejectedValueOnce({ code: 'auth/network-request-failed' });
  await expect(getAllCommunications()).rejects.toEqual({ code: 'auth/network-request-failed' });
  expect(getDocsFromServer).not.toHaveBeenCalled();
});

test('Ver más amplía la consulta hasta 100, sin cargar toda la colección', async () => {
  (getDocsFromServer as jest.Mock).mockResolvedValue({ docs: [] });
  await getAllCommunications(100);
  expect(limit).toHaveBeenCalledWith(100);
});
