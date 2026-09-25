const mockSet = jest.fn().mockResolvedValue(undefined);
const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockUsers = Array.from({ length: 35 }, (_, i) => ({ id: `family-${i}`, exists: true, data: () => ({ pushTokens: [] }) }));
const mockGetAll = jest.fn(async (...ids: string[]) => mockUsers.filter(user => ids.includes(user.id)));
const mockDb = { getAll: mockGetAll, collection: (name: string) => name === 'users'
  ? { get: async () => ({ docs: mockUsers, size: mockUsers.length }), doc: (id: string) => id }
  : { doc: () => ({ id: 'communication', set: mockSet, update: mockUpdate }) } };
jest.mock('firebase-functions', () => ({ https: { onRequest: (handler: unknown) => handler } }), { virtual: true });
jest.mock('firebase-admin', () => ({}), { virtual: true });
jest.mock('firebase-admin/app', () => ({ initializeApp: jest.fn() }), { virtual: true });
jest.mock('firebase-admin/firestore', () => ({ getFirestore: () => mockDb }), { virtual: true });
jest.mock('firebase-admin/messaging', () => ({ getMessaging: () => ({ send: jest.fn() }) }), { virtual: true });
jest.mock('../functions/src/createManagedUser.js', () => ({}), { virtual: true });
const { sendCommunicationToAll, sendCommunicationToUsers } = require('../functions/src/index');
const response = () => { const res: any = { set: jest.fn(), json: jest.fn(), send: jest.fn() }; res.status = jest.fn(() => res); return res; };
beforeEach(() => jest.clearAllMocks());

test('guarda destinatarios y segmentación antes de enviar a más de 30 familias', async () => {
  await sendCommunicationToUsers({ method: 'POST', body: { title: 'Título', body: 'Mensaje', userId: 'admin',
    userIds: mockUsers.map(user => user.id), level: 'inicial', cursoId: 'sala-4-tm', cursoLabel: 'SALA 4 TM' } }, response());
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ level: 'inicial', cursoId: 'sala-4-tm',
    cursoLabel: 'SALA 4 TM', targetUserIds: mockUsers.map(user => user.id) }));
  expect(mockGetAll).toHaveBeenCalledWith(...mockUsers.map(user => user.id));
});
test('compatibilidad con clientes que mandan segmentación dentro de data', async () => {
  await sendCommunicationToUsers({ method: 'POST', body: { title: 'Título', body: 'Mensaje', userId: 'admin',
    userIds: ['family-0'], data: { level: 'primario' } } }, response());
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ level: 'primario', cursoId: null, cursoLabel: null }));
});
test('institucional guarda todos los destinatarios sin depender del teléfono', async () => {
  await sendCommunicationToAll({ method: 'POST', body: { title: 'Título', body: 'Mensaje', userId: 'admin' } }, response());
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ level: 'todos', cursoId: null,
    targetUserIds: mockUsers.map(user => user.id) }));
});
test('rechaza un envío segmentado sin nivel antes de escribir', async () => {
  const res = response();
  await sendCommunicationToUsers({ method: 'POST', body: { title: 'Título', body: 'Mensaje', userId: 'admin', userIds: ['family-0'] } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(mockSet).not.toHaveBeenCalled();
});
