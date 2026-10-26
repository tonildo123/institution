jest.mock('../src/services/firebase/firebaseConfig', () => ({ db: {}, auth: {
  authStateReady: jest.fn().mockResolvedValue(undefined), currentUser: { uid: 'viewer', getIdToken: jest.fn().mockResolvedValue('token') },
} }));
jest.mock('firebase/firestore', () => ({ doc: jest.fn(), getDocFromServer: jest.fn(), where: jest.fn(), collection: jest.fn(), query: jest.fn(), orderBy: jest.fn(), limit: jest.fn(), getDocsFromServer: jest.fn() }));
import { auth } from '../src/services/firebase/firebaseConfig';
import { getDocsFromServer, orderBy, limit } from 'firebase/firestore';
import { getAllClassroom, classroomLoadError } from '../src/services/firebase/classroom';
beforeEach(() => { jest.clearAllMocks(); });
test('consulta al servidor los 30 más recientes tras preparar la sesión', async () => {
  (getDocsFromServer as jest.Mock).mockResolvedValue({ docs: [{ id: 'latest', data: () => ({ title: 'Último', sentBy: 'viewer' }) }] });
  expect(await getAllClassroom()).toEqual([expect.objectContaining({ id: 'latest', title: 'Último' })]);
  expect(auth.authStateReady).toHaveBeenCalled(); expect(auth.currentUser!.getIdToken).toHaveBeenCalled();
  expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc'); expect(limit).toHaveBeenCalledWith(30);
});
test('un fallo offline no devuelve un listado vacío exitoso', async () => {
  const error = { code: 'unavailable' };
  (getDocsFromServer as jest.Mock).mockRejectedValue(error);
  await expect(getAllClassroom()).rejects.toEqual(error);
  expect(classroomLoadError(error)).toContain('conexión');
});
test('si no se puede renovar el token conserva el error y no consulta Firestore', async () => {
  (auth.currentUser!.getIdToken as jest.Mock).mockRejectedValueOnce({ code: 'auth/network-request-failed' });
  await expect(getAllClassroom()).rejects.toEqual({ code: 'auth/network-request-failed' });
  expect(getDocsFromServer).not.toHaveBeenCalled();
});

test('Ver más amplía la consulta hasta 100, sin cargar toda la colección', async () => {
  (getDocsFromServer as jest.Mock).mockResolvedValue({ docs: [] });
  await getAllClassroom(100);
  expect(limit).toHaveBeenCalledWith(100);
});

test('consulta emisor y destinatario, sin duplicar mensajes ni incluir ajenos', async () => {
  const { where } = require('firebase/firestore');
  const message = (id: string, createdAt: string, sentBy: string, targetUserIds: string[] = []) => ({ id, data: () => ({ createdAt, sentBy, targetUserIds }) });
  (getDocsFromServer as jest.Mock)
    .mockResolvedValueOnce({ docs: [message('both', '2026-10-15', 'viewer', ['viewer']), message('old', '2026-10-13', 'viewer')] })
    .mockResolvedValueOnce({ docs: [message('both', '2026-10-15', 'viewer', ['viewer']), message('received', '2026-10-14', 'other', ['viewer']), message('private', '2026-10-16', 'other')] });
  expect((await getAllClassroom()).map(item => item.id)).toEqual(['both', 'received', 'old']);
  expect(where).toHaveBeenCalledWith('sentBy', '==', 'viewer');
  expect(where).toHaveBeenCalledWith('targetUserIds', 'array-contains', 'viewer');
});

test.each([
  [{ sentBy: 'viewer' }, true],
  [{ sentBy: 'other', targetUserIds: ['viewer'] }, true],
  [{ sentBy: 'other', level: 'todos' }, false],
  [{ sentBy: 'other', targetUserIds: ['someone'] }, false],
  [{}, false],
])('el detalle exige ser emisor o destinatario: %j', async (data, visible) => {
  const { getDocFromServer } = require('firebase/firestore');
  const { getClassroom } = require('../src/services/firebase/classroom');
  getDocFromServer.mockResolvedValue({ exists: () => true, id: 'message', data: () => data });
  const result = await getClassroom('message', 'viewer');
  expect(Boolean(result)).toBe(visible);
});

test('no permite consultar otra identidad indicada por el cliente', async () => {
  const { getClassroom } = require('../src/services/firebase/classroom');
  const { getDocFromServer } = require('firebase/firestore');
  expect(await getAllClassroom(30, 'another-user')).toEqual([]);
  expect(await getClassroom('message', 'another-user')).toBeNull();
  expect(getDocsFromServer).not.toHaveBeenCalled();
  expect(getDocFromServer).not.toHaveBeenCalled();
});
