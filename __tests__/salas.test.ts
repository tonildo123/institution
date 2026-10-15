jest.mock('firebase/firestore', () => ({
  Timestamp: { fromDate: jest.fn(() => 'timestamp') },
  collection: jest.fn((...args) => args.slice(1).join('/')),
  doc: jest.fn((...args) => args.slice(1).join('/')),
  getDoc: jest.fn(), getDocs: jest.fn(), setDoc: jest.fn(),
  updateDoc: jest.fn(), arrayUnion: jest.fn((id) => ({ union: id })),
  arrayRemove: jest.fn((...ids) => ({ remove: ids })),
  writeBatch: jest.fn(() => ({ set: require('firebase/firestore').setDoc, update: require('firebase/firestore').updateDoc, commit: jest.fn().mockResolvedValue(undefined) })),
}));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ db: {} }));

import { getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getCursos, getSalaUsers, addUserToSala } from '../src/services/firebase/salas';

beforeEach(() => {
  jest.clearAllMocks();
  (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
  (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
});

test('ofrece los grados y turnos en el orden solicitado', () => {
  const cursos = getCursos('primario');
  expect(cursos).toHaveLength(12);
  expect(cursos.slice(0, 2).map(c => c.label)).toEqual(['1° GRADO TM', '1° GRADO TT']);
  expect(cursos[11].label).toBe('6° GRADO TT');
  expect(getCursos('secundario').map(c => c.label)).toEqual([
    'SEC 1° AÑO', 'SEC 2° AÑO', 'SEC 3° AÑO', 'SEC 4° AÑO', 'SEC 5° AÑO', 'SEC 6° AÑO',
  ]);
});

test('el nivel incluye familias anteriores y de cursos sin duplicarlas', async () => {
  (getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => ({ users: ['anterior', 'compartida'] }) });
  (getDocs as jest.Mock).mockResolvedValue({ docs: [
    { data: () => ({ users: ['compartida', 'familia1'] }) },
    { data: () => ({ users: ['familia1', 'familia2'] }) },
  ] });
  expect(await getSalaUsers('primario')).toEqual(['anterior', 'compartida', 'familia1', 'familia2']);
});

test('consultar un curso no incluye familias de otros cursos', async () => {
  (getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => ({ users: ['familia1'] }) });
  expect(await getSalaUsers('primario', 'grado-1-tm')).toEqual(['familia1']);
  expect(getDoc).toHaveBeenCalledWith('salas/primario/cursos/grado-1-tm');
  expect(getDocs).not.toHaveBeenCalled();
});

test('crea la asignación con unión atómica en el curso seleccionado', async () => {
  await addUserToSala('secundario', 'familia1', 'sec-2');
  expect(setDoc).toHaveBeenCalledWith('salas/secundario/cursos/sec-2', {
    level: 'secundario', users: { union: 'familia1' },
  }, { merge: true });
  await expect(addUserToSala('primario', 'familia1', 'sec-2')).rejects.toThrow('El curso no pertenece');
});

test('inicial ofrece seis salas y los turnos completos solo como destinatarios', () => {
  const { getDestinatarios } = require('../src/services/firebase/salas');
  expect(getCursos('inicial').map(c => c.label)).toEqual([
    'INICIAL SALA DE 3 AÑOS TM', 'INICIAL SALA DE 3 AÑOS TT',
    'INICIAL SALA DE 4 AÑOS TM', 'INICIAL SALA DE 4 AÑOS TT',
    'INICIAL SALA DE 5 AÑOS TM', 'INICIAL SALA DE 5 AÑOS TT',
  ]);
  expect(getDestinatarios('inicial').slice(0, 2).map((c: { label: string }) => c.label))
    .toEqual(['TODO EL NIVEL TM', 'TODO EL NIVEL TT']);
});

test.each(['tm', 'tt'])('turno completo %s reúne solo sus salas sin repetir familias', async turno => {
  (getDoc as jest.Mock).mockImplementation(async (path: string) => ({
    exists: () => true,
    data: () => ({ users: ['compartida', path] }),
  }));
  expect(await getSalaUsers('inicial', `turno-${turno}`)).toEqual([
    'compartida', ...[3, 4, 5].map(edad => `salas/inicial/cursos/sala-${edad}-${turno}`),
  ]);
  expect(getDoc).toHaveBeenCalledTimes(3);
  await expect(addUserToSala('inicial', 'familia', `turno-${turno}`)).rejects.toThrow();
});


test.each(['tm', 'tt'])('primaria permite enviar a todo el turno %s', async turno => {
  const { getDestinatarios } = require('../src/services/firebase/salas');
  expect(getDestinatarios('primario').slice(0, 2).map((c: { label: string }) => c.label))
    .toEqual(['TODO EL NIVEL TM', 'TODO EL NIVEL TT']);
  (getDoc as jest.Mock).mockImplementation(async (path: string) => ({
    exists: () => true,
    data: () => ({ users: ['compartida', path] }),
  }));
  expect(await getSalaUsers('primario', `turno-${turno}`)).toEqual([
    'compartida', ...[1, 2, 3, 4, 5, 6].map(grado => `salas/primario/cursos/grado-${grado}-${turno}`),
  ]);
  expect(getDoc).toHaveBeenCalledTimes(6);
  await expect(addUserToSala('primario', 'familia', `turno-${turno}`)).rejects.toThrow();
  expect(getDestinatarios('secundario')).toEqual(getCursos('secundario'));
});


test('resuelve una familia con hijos en dos niveles y asignación directa', async () => {
  const { getUserAssignedSalas } = require('../src/services/firebase/salas');
  (getDoc as jest.Mock).mockImplementation(async path => ({ exists: () => true,
    data: () => ({ users: path === 'salas/secundario' ? ['familia'] : [] }) }));
  (getDocs as jest.Mock).mockImplementation(async path => ({ docs: path.includes('inicial')
    ? [{ id: 'sala-4-tm', data: () => ({ users: ['familia'] }) }] : [] }));
  expect(await getUserAssignedSalas('familia')).toEqual({ levels: ['inicial', 'secundario'], cursos: ['sala-4-tm'] });
});

test('alta sincroniza el perfil dentro del mismo lote', async () => {
  const { updateDoc, writeBatch } = require('firebase/firestore');
  await addUserToSala('inicial', 'familia', 'sala-4-tm');
  expect(updateDoc).toHaveBeenCalledWith('users/familia', {
    assignedLevels: { union: 'inicial' }, assignedCursos: { union: 'sala-4-tm' },
  });
  expect(writeBatch.mock.results[0].value.commit).toHaveBeenCalled();
});

test.each([true, false])('baja conserva el nivel solo si quedan asignaciones: %s', async quedaOtro => {
  const { removeUserFromSala } = require('../src/services/firebase/salas');
  const { updateDoc } = require('firebase/firestore');
  (getDocs as jest.Mock).mockResolvedValue({ docs: [
    { id: 'sala-4-tm', data: () => ({ users: ['familia'] }) },
    ...(quedaOtro ? [{ id: 'sala-5-tm', data: () => ({ users: ['familia'] }) }] : []),
  ] });
  await removeUserFromSala('inicial', 'familia', 'sala-4-tm');
  expect(updateDoc).toHaveBeenCalledWith('users/familia', {
    assignedLevels: quedaOtro ? { union: 'inicial' } : { remove: ['inicial'] },
    assignedCursos: { remove: ['sala-4-tm'] },
  });
});


test.each([
  ['inicial', 'sala-3-tm', ['sala-3-tm', 'sala-3-tt', 'sala-4-tm', 'sala-4-tt']],
  ['inicial', 'sala-5-tt', ['sala-5-tm', 'sala-5-tt', 'grado-1-tm', 'grado-1-tt']],
  ['primario', 'grado-1-tm', ['grado-1-tm', 'grado-1-tt', 'grado-2-tm', 'grado-2-tt']],
  ['primario', 'grado-6-tt', ['grado-6-tm', 'grado-6-tt', 'sec-1']],
  ['secundario', 'sec-1', ['sec-1', 'sec-2']],
  ['secundario', 'sec-6', ['sec-6']],
])('desde %s %s permite solo el mismo año y el siguiente', (level, cursoId, expected) => {
  const { getTransferCursos } = require('../src/services/firebase/salas');
  expect(getTransferCursos(level, cursoId).map((curso: { id: string }) => curso.id)).toEqual(expected);
});

test.each([
  ['primario', 'grado-1-tm', 'inicial', 'sala-5-tm'],
  ['primario', 'grado-1-tm', 'primario', 'grado-3-tm'],
  ['inicial', 'sala-3-tm', 'primario', 'grado-1-tm'],
  ['secundario', 'sec-3', 'secundario', 'sec-2'],
])('rechaza retrocesos y saltos desde %s %s hacia %s %s sin escribir', async (level, cursoId, targetLevel, targetCurso) => {
  const { updateUserInSala } = require('../src/services/firebase/salas');
  const { writeBatch } = require('firebase/firestore');
  await expect(updateUserInSala('familia', { level, cursoId },
    { level: targetLevel, cursoId: targetCurso }, {})).rejects.toThrow('mismo año o al siguiente');
  expect(writeBatch).not.toHaveBeenCalled();
});

test.each([true, false])('traslado guarda perfil y salas juntos y conserva otras asignaciones: %s', async remains => {
  const { updateUserInSala } = require('../src/services/firebase/salas');
  const { updateDoc, writeBatch } = require('firebase/firestore');
  (getDocs as jest.Mock).mockImplementation(async path => ({ docs:
    path.includes('inicial') ? [
      { id: 'sala-5-tm', data: () => ({ users: ['familia'] }) },
      ...(remains ? [{ id: 'sala-5-tt', data: () => ({ users: ['familia'] }) }] : []),
    ] : path.includes('secundario') ? [{ id: 'sec-2', data: () => ({ users: ['familia'] }) }] : [],
  }));
  await updateUserInSala('familia', { level: 'inicial', cursoId: 'sala-5-tm' },
    { level: 'primario', cursoId: 'grado-1-tm' }, { displayName: 'Nuevo nombre', dni: '70000000', email: '' });
  expect(updateDoc).toHaveBeenCalledWith('salas/inicial/cursos/sala-5-tm', { users: { remove: ['familia'] } });
  expect(setDoc).toHaveBeenCalledWith('salas/primario/cursos/grado-1-tm', {
    level: 'primario', users: { union: 'familia' },
  }, { merge: true });
  expect(updateDoc).toHaveBeenCalledWith('users/familia', {
    displayName: 'Nuevo nombre', dni: '70000000', email: '', updatedAt: 'timestamp',
    assignedLevels: [...(remains ? ['inicial'] : []), 'secundario', 'primario'],
    assignedCursos: [...(remains ? ['sala-5-tt'] : []), 'sec-2', 'grado-1-tm'],
  });
  expect(writeBatch).toHaveBeenCalledTimes(1);
  expect(writeBatch.mock.results[0].value.commit).toHaveBeenCalledTimes(1);
});

test('editar sin cambiar de curso solo actualiza los datos personales', async () => {
  const { updateUserInSala } = require('../src/services/firebase/salas');
  const { updateDoc } = require('firebase/firestore');
  await updateUserInSala('familia', { level: 'inicial', cursoId: 'sala-3-tm' },
    { level: 'inicial', cursoId: 'sala-3-tm' }, { displayName: 'Nombre' });
  expect(getDocs).not.toHaveBeenCalled();
  expect(setDoc).not.toHaveBeenCalled();
  expect(updateDoc).toHaveBeenCalledTimes(1);
  expect(updateDoc).toHaveBeenCalledWith('users/familia', { displayName: 'Nombre', updatedAt: 'timestamp' });
});


test('los cursos docentes se obtienen de teacherIds y no de los alumnos del curso', async () => {
  const { getTeacherCursos } = require('../src/services/firebase/salas');
  (getDocs as jest.Mock).mockImplementation(async path => ({ docs: path.includes('primario') ? [
    { id: 'grado-3-tt', data: () => ({ teacherIds: ['teacher'], users: ['family'] }) },
    { id: 'grado-3-tm', data: () => ({ teacherIds: ['other'], users: ['teacher'] }) },
  ] : [] }));
  expect(await getTeacherCursos('teacher')).toEqual([{ id: 'grado-3-tt', label: '3° GRADO TT', level: 'primario' }]);
});

test.each([true, false])('asignar o quitar docente solo modifica teacherIds: %s', async assigned => {
  const { setTeacherInSala } = require('../src/services/firebase/salas');
  (getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => ({ role: 'preceptor' }) });
  await setTeacherInSala('primario', 'grado-3-tt', 'teacher', assigned);
  expect(setDoc).toHaveBeenCalledWith('salas/primario/cursos/grado-3-tt', {
    level: 'primario', teacherIds: assigned ? { union: 'teacher' } : { remove: ['teacher'] },
  }, { merge: true });
});

test('no permite asignar familias como docentes', async () => {
  const { setTeacherInSala } = require('../src/services/firebase/salas');
  (getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => ({ role: 'familia' }) });
  await expect(setTeacherInSala('primario', 'grado-3-tt', 'family', true)).rejects.toThrow('rol docente');
  expect(setDoc).not.toHaveBeenCalled();
});
