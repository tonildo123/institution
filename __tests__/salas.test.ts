jest.mock('firebase/firestore', () => ({
  collection: jest.fn((...args) => args.slice(1).join('/')),
  doc: jest.fn((...args) => args.slice(1).join('/')),
  getDoc: jest.fn(), getDocs: jest.fn(), setDoc: jest.fn(),
  updateDoc: jest.fn(), arrayUnion: jest.fn((id) => ({ union: id })),
  arrayRemove: jest.fn(),
}));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ db: {} }));

import { getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getCursos, getSalaUsers, addUserToSala } from '../src/services/firebase/salas';

beforeEach(() => jest.clearAllMocks());

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
