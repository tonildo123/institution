const mockSend = jest.fn().mockResolvedValue('message-id');
const mockSet = jest.fn().mockResolvedValue(undefined);
const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockUsers = Array.from({ length: 35 }, (_, i) => ({ id: `family-${i}`, exists: true, data: () => ({ pushTokens: [] }) }));
const mockVerifyToken = jest.fn().mockResolvedValue({ uid: 'admin' });
const mockActor = jest.fn().mockResolvedValue({ exists: true, data: () => ({ role: 'admin', isEnabled: true }) });
const mockCourse = jest.fn();
const mockGetAll = jest.fn(async (...ids: string[]) => mockUsers.filter(user => ids.includes(user.id)));
const mockDb = { getAll: mockGetAll, collection: (name: string) => name === 'salas' ? { doc: () => ({ collection: () => ({ doc: () => ({ get: mockCourse }) }) }) } : name === 'users'
  ? { get: async () => ({ docs: mockUsers, size: mockUsers.length }), doc: (id: string) => id === 'admin' ? { get: mockActor } : id }
  : { doc: () => ({ id: 'classroom', set: mockSet, update: mockUpdate }) } };
jest.mock('firebase-functions', () => ({ https: { onRequest: (handler: unknown) => handler } }), { virtual: true });
jest.mock('firebase-admin/auth', () => ({ getAuth: () => ({ verifyIdToken: mockVerifyToken }) }), { virtual: true });
jest.mock('firebase-admin', () => ({}), { virtual: true });
jest.mock('firebase-admin/app', () => ({ initializeApp: jest.fn() }), { virtual: true });
jest.mock('firebase-admin/firestore', () => ({ getFirestore: () => mockDb }), { virtual: true });
jest.mock('firebase-admin/messaging', () => ({ getMessaging: () => ({ send: mockSend }) }), { virtual: true });
jest.mock('../functions/src/getLinkPreview.js', () => ({}), { virtual: true });
jest.mock('../functions/src/createManagedUser.js', () => ({}), { virtual: true });
jest.mock('../functions/src/setFamilyPassword.js', () => ({}), { virtual: true });
jest.mock('../functions/src/biometrics.js', () => ({ verifySendBiometrics: jest.fn().mockResolvedValue(undefined) }), { virtual: true });
jest.mock('../functions/src/deactivateOwnAccount.js', () => ({}), { virtual: true });
jest.mock('../functions/src/updateOwnProfile.js', () => ({}), { virtual: true });
jest.mock('../functions/src/cleanupProfilePhotos.js', () => ({}), { virtual: true });
const { sendClassroomToAll, sendClassroomToUsers } = require('../functions/src/index');
const response = () => { const res: any = { set: jest.fn(), json: jest.fn(), send: jest.fn() }; res.status = jest.fn(() => res); return res; };
beforeEach(() => { jest.clearAllMocks(); mockActor.mockResolvedValue({ exists: true, data: () => ({ role: 'admin', isEnabled: true }) }); });

test('guarda destinatarios y segmentación antes de enviar a más de 30 familias', async () => {
  await sendClassroomToUsers({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { title: 'Título', body: 'Mensaje', userId: 'admin',
    userIds: mockUsers.map(user => user.id), level: 'inicial', cursoId: 'sala-4-tm', cursoLabel: 'SALA 4 TM' } }, response());
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ level: 'inicial', cursoId: 'sala-4-tm',
    cursoLabel: 'SALA 4 TM', targetUserIds: mockUsers.map(user => user.id) }));
  expect(mockGetAll).toHaveBeenCalledWith(...mockUsers.map(user => user.id));
});
test('compatibilidad con clientes que mandan segmentación dentro de data', async () => {
  await sendClassroomToUsers({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { title: 'Título', body: 'Mensaje', userId: 'admin',
    userIds: ['family-0'], data: { level: 'primario' } } }, response());
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ level: 'primario', cursoId: null, cursoLabel: null }));
});
test('institucional guarda todos los destinatarios sin depender del teléfono', async () => {
  await sendClassroomToAll({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { title: 'Título', body: 'Mensaje', userId: 'admin' } }, response());
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ level: 'todos', cursoId: null,
    targetUserIds: mockUsers.map(user => user.id) }));
});
test('rechaza un envío segmentado sin nivel antes de escribir', async () => {
  const res = response();
  await sendClassroomToUsers({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { title: 'Título', body: 'Mensaje', userId: 'admin', userIds: ['family-0'] } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(mockSet).not.toHaveBeenCalled();
});

test.each([
  ['todos', sendClassroomToAll],
  ['inicial', sendClassroomToUsers],
])('conserva URL y metadatos del PDF en el envío a %s', async (level, send) => {
  const data = {
    type: 'classroom', level, documentUrl: 'https://example.com/test.pdf',
    documentPath: 'classroom-documents/admin/id/test.pdf', documentName: 'test.pdf',
    documentSize: '1024', documentContentType: 'application/pdf',
  };
  const res = response();
  await send({ method: 'POST', headers: { authorization: 'Bearer test' }, body: {
    title: 'Test pdf', body: 'Pdf test', userId: 'admin', userIds: ['family-0'], level, data,
  } }, res);
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ data }));
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
});

test.each([
  ['todos', sendClassroomToAll], ['primario', sendClassroomToUsers],
])('guarda el enlace adjunto al enviar a %s', async (level, send) => {
  const data = { type: 'classroom', level, linkUrl: 'https://escuela.com/noticias' };
  const res = response();
  await send({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { title: 'Enlace', body: 'Información', userId: 'admin',
    userIds: ['family-0'], level, data } }, res);
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ data }));
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
});


test.each([
  ['todos', sendClassroomToAll], ['primario', sendClassroomToUsers],
])('conserva URL y duración del audio al enviar a %s', async (level, send) => {
  const data = { type: 'classroom', level, audioUrl: 'https://example.com/audio.m4a',
    audioPath: 'classroom-audios/admin/id/nota.m4a', audioName: 'Nota de voz',
    audioSize: '2048', audioContentType: 'audio/mp4', audioDurationMs: '18200' };
  const res = response();
  await send({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { title: 'Nota', body: 'Información', userId: 'admin',
    userIds: ['family-0'], level, data } }, res);
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ data }));
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
});


test('guarda la vista previa completa y mantiene pequeña la notificación push', async () => {
  const data = { type: 'classroom', linkUrl: 'https://example.com', linkTitle: 'Noticia',
    linkDescription: 'Descripción', linkImageUrl: 'https://example.com/foto.jpg' };
  const spy = jest.spyOn(mockUsers[0], 'data').mockReturnValue({ pushTokens: ['token'] } as any);
  try {
    await sendClassroomToAll({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { title: 'Aviso', body: 'Texto', userId: 'admin', data } }, response());
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ data }));
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ data: { type: 'classroom', classroomId: 'classroom' } }));
  } finally { spy.mockRestore(); }
});

test.each([
  ['todos', sendClassroomToAll], ['primario', sendClassroomToUsers],
])('conserva URL y metadatos del video al enviar a %s', async (level, send) => {
  const data = { type: 'classroom', level, videoUrl: 'https://example.com/video.mp4',
    videoPath: 'classroom-videos/admin/id/video.mp4', videoName: 'video.mp4',
    videoSize: '2048', videoContentType: 'video/mp4', videoDurationMs: '12000' };
  const res = response();
  await send({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { title: 'Video', body: 'Información', userId: 'admin',
    userIds: ['family-0'], level, data } }, res);
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ data }));
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
});

test('rechaza enviar sin token y obtiene el emisor del token aunque el cuerpo sea falsificado', async () => {
  const res = response();
  await sendClassroomToAll({ method: 'POST', headers: {}, body: { title: 'A', body: 'B', userId: 'victim' } }, res);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(mockSet).not.toHaveBeenCalled();
  await sendClassroomToAll({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { title: 'A', body: 'B', userId: 'victim' } }, response());
  expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ sentBy: 'admin' }));
});


test.each([null, 'turno-tt', 'other-course'])('docentes no envían a todos, turnos o cursos no asignados: %s', async cursoId => {
  mockActor.mockResolvedValue({ exists: true, data: () => ({ role: 'preceptor', isEnabled: true }) });
  mockCourse.mockResolvedValue({ exists: true, data: () => ({ teacherIds: [], users: ['family-0'] }) });
  const res = response();
  await sendClassroomToUsers({ method: 'POST', headers: { authorization: 'Bearer test' }, body: {
    title: 'T', body: 'B', level: 'primario', cursoId, userIds: ['family-0'],
  } }, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(mockSet).not.toHaveBeenCalled();
});

test('docente asignado puede enviar al curso y no puede ampliar los destinatarios ni enviar a todos', async () => {
  mockActor.mockResolvedValue({ exists: true, data: () => ({ role: 'preceptor', isEnabled: true }) });
  mockCourse.mockResolvedValue({ exists: true, data: () => ({ teacherIds: ['admin'], users: ['family-0'] }) });
  const req = { method: 'POST', headers: { authorization: 'Bearer test' }, body: {
    title: 'T', body: 'B', level: 'primario', cursoId: 'grado-3-tt', userIds: ['family-0'],
  } };
  await sendClassroomToUsers(req, response());
  expect(mockSet).toHaveBeenCalledTimes(1);
  mockSet.mockClear();
  const invalid = response();
  await sendClassroomToUsers({ ...req, body: { ...req.body, userIds: ['family-1'] } }, invalid);
  expect(invalid.status).toHaveBeenCalledWith(403);
  const all = response();
  await sendClassroomToAll(req, all);
  expect(all.status).toHaveBeenCalledWith(403);
  expect(mockSet).not.toHaveBeenCalled();
});
