jest.mock('firebase/firestore', () => ({}));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ db: {} }));
import { isCommunicationForFamily, getDestinationLabel } from '../src/utils/communicationAudience';
import type { Communication } from '../src/services/firebase/communications';
import type { UserSalasInfo } from '../src/services/firebase/salas';
const assigned: UserSalasInfo = { levels: ['inicial', 'primario'], cursos: ['sala-4-tm', 'grado-1-tt'] };
const communication = (value: Partial<Communication>) => value as Communication;
test.each([
  [{ level: 'todos' }, false],
  [{ level: 'inicial', cursoId: 'sala-4-tm' }, false],
  [{ level: 'primario', cursoId: 'turno-tt' }, false],
  [{ sentBy: 'familia' }, true],
  [{ level: 'secundario', targetUserIds: ['familia'] }, true],
  [{ level: 'todos', targetUserIds: ['otra-familia'] }, false],
  [{ level: '', targetUserIds: [] }, false],
] as [Partial<Communication>, boolean][])('filtra por participantes originales %j: %s', (comm, expected) => {
  expect(isCommunicationForFamily(communication(comm), 'familia', assigned)).toBe(expected);
});
test('etiquetas identifican nivel y curso, incluso en mensajes antiguos', () => {
  expect(getDestinationLabel(communication({ level: 'todos' }))).toBe('INSTITUCIONAL • TODOS');
  expect(getDestinationLabel(communication({ level: 'primario', cursoId: 'grado-1-tt' }))).toBe('NIVEL PRIMARIO • 1° GRADO TT');
});
