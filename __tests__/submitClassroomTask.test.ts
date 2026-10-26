let db: Record<string, any> = {};
const writes: { op: string; path: string; value?: any }[] = [];

jest.mock('firebase-functions', () => ({
  https: {
    onCall: (fn: unknown) => fn,
    HttpsError: class extends Error { code: string; constructor(code: string, message: string) { super(message); this.code = code; } },
  },
  logger: { error: jest.fn(), info: jest.fn() },
}), { virtual: true });

jest.mock('firebase-admin/firestore', () => {
  const snapshot = (path: string) => ({ exists: path in (global as any).__db, data: () => (global as any).__db[path] });
  const ref = (path: string): any => ({
    path,
    get: async () => snapshot(path),
    collection: (sub: string) => ({ doc: (id: string) => ref(`${path}/${sub}/${id}`) }),
  });
  const tx = {
    get: async (r: any) => snapshot(r.path),
    set: (r: any, value: any) => { (global as any).__writes.push({ op: 'set', path: r.path, value }); },
    update: (r: any, value: any) => { (global as any).__writes.push({ op: 'update', path: r.path, value }); },
  };
  return {
    getFirestore: () => ({
      collection: (name: string) => ({ doc: (id: string) => ref(`${name}/${id}`) }),
      runTransaction: async (fn: (t: any) => Promise<void>) => fn(tx),
    }),
  };
}, { virtual: true });

import { submitClassroomTask, validateSubmissionData } from '../functions/src/submitClassroomTask';
const call = (payload: any, context: any) => (submitClassroomTask as any)(payload, context);

const future = () => new Date(Date.now() + 86400000).toISOString();
const past = () => new Date(Date.now() - 86400000).toISOString();
const ctx = (uid = 'uid1') => ({ auth: { uid } }) as any;
const baseTask = (over: Record<string, unknown> = {}) => ({ targetUserIds: ['uid1', 'uid2'], dueDate: future(), submissionsCount: 0, maxSubmissions: 2, ...over });

beforeEach(() => {
  (global as any).__writes = [];
  (global as any).__db = {
    'users/uid1': { isEnabled: true, role: 'familia', displayName: 'Familia Uno' },
    'users/uid2': { isEnabled: true, role: 'familia', displayName: 'Familia Dos' },
    'classroom/t1': baseTask(),
  };
  db = (global as any).__db;
});

test('registra una entrega, una sola vez por alumno, y suma al contador', async () => {
  const res = await call({ taskId: 't1', body: 'Mi respuesta' }, ctx('uid1'));
  expect(res).toEqual({ success: true });
  const writes = (global as any).__writes;
  expect(writes).toContainEqual(expect.objectContaining({ op: 'set', path: 'classroom/t1/submissions/uid1' }));
  expect(writes).toContainEqual({ op: 'update', path: 'classroom/t1', value: { submissionsCount: 1 } });
});

test('rechaza sin sesión y tareas inválidas', async () => {
  await expect(call({ taskId: 't1', body: 'x' }, { auth: undefined } as any)).rejects.toMatchObject({ code: 'unauthenticated' });
  await expect(call({ taskId: 'a/b', body: 'x' }, ctx())).rejects.toMatchObject({ code: 'invalid-argument' });
});

test('rechaza una entrega vacía', async () => {
  await expect(call({ taskId: 't1', body: '   ' }, ctx())).rejects.toMatchObject({ code: 'invalid-argument' });
});

test('no deja entregar a un alumno que no está asignado', async () => {
  (global as any).__db['users/uid3'] = { isEnabled: true, role: 'familia' };
  await expect(call({ taskId: 't1', body: 'x' }, ctx('uid3'))).rejects.toMatchObject({ code: 'permission-denied' });
});

test('solo familias habilitadas pueden entregar', async () => {
  (global as any).__db['users/uid1'] = { isEnabled: true, role: 'preceptor' };
  await expect(call({ taskId: 't1', body: 'x' }, ctx('uid1'))).rejects.toMatchObject({ code: 'permission-denied' });
  (global as any).__db['users/uid1'] = { isEnabled: false, role: 'familia' };
  await expect(call({ taskId: 't1', body: 'x' }, ctx('uid1'))).rejects.toMatchObject({ code: 'permission-denied' });
});

test('no acepta entregas después del plazo', async () => {
  (global as any).__db['classroom/t1'] = baseTask({ dueDate: past() });
  await expect(call({ taskId: 't1', body: 'x' }, ctx())).rejects.toMatchObject({ code: 'failed-precondition' });
});

test('impide una segunda entrega del mismo alumno', async () => {
  (global as any).__db['classroom/t1/submissions/uid1'] = { body: 'primera' };
  await expect(call({ taskId: 't1', body: 'segunda' }, ctx())).rejects.toMatchObject({ code: 'already-exists' });
});

test('respeta el cupo máximo de entregas', async () => {
  (global as any).__db['classroom/t1'] = baseTask({ submissionsCount: 2, maxSubmissions: 2 });
  await expect(call({ taskId: 't1', body: 'x' }, ctx())).rejects.toMatchObject({ code: 'resource-exhausted' });
});

test('solo acepta archivos dentro de la carpeta del alumno y de esta tarea', () => {
  const ok = validateSubmissionData({ imagePath: 'classroom-submissions/uid1/t1/a.jpg', imageUrl: 'https://x/a.jpg' }, 't1', 'uid1');
  expect(ok).toEqual({ imagePath: 'classroom-submissions/uid1/t1/a.jpg', imageUrl: 'https://x/a.jpg' });
  expect(() => validateSubmissionData({ imagePath: 'classroom-submissions/otro/t1/a.jpg' }, 't1', 'uid1')).toThrow();
  expect(() => validateSubmissionData({ imagePath: 'classroom-submissions/uid1/t1/../../x' }, 't1', 'uid1')).toThrow();
  expect(() => validateSubmissionData({ imageUrl: 'http://x/a.jpg' }, 't1', 'uid1')).toThrow();
  expect(() => validateSubmissionData({ campoRaro: 'x' }, 't1', 'uid1')).toThrow();
});
