jest.mock('firebase/firestore', () => ({}));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ db: {} }));
import { isCommunicationForFamily, getDestinationLabel } from '../src/utils/communicationAudience';
import type { Communication } from '../src/services/firebase/communications';
import type { UserSalasInfo } from '../src/services/firebase/salas';
const assigned: UserSalasInfo = { levels: ['inicial', 'primario'], cursos: ['sala-4-tm', 'grado-1-tt'] };
const communication = (value: Partial<Communication>) => value as Communication;
test.each([
  [{ level: 'todos' }, true],
  [{ level: 'inicial' }, true],
  [{ level: 'secundario' }, false],
  [{ level: 'inicial', cursoId: 'sala-4-tm' }, true],
  [{ level: 'inicial', cursoId: 'sala-3-tm' }, false],
  [{ level: 'inicial', cursoId: 'turno-tm' }, true],
  [{ level: 'inicial', cursoId: 'turno-tt' }, false],
  [{ level: 'primario', cursoId: 'turno-tm' }, false],
  [{ level: 'primario', cursoId: 'turno-tt' }, true],
  [{ level: 'secundario', targetUserIds: ['familia'] }, true],
  [{ level: '', targetUserIds: [] }, false],
] as [Partial<Communication>, boolean][])('filtra %j: %s', (comm, expected) => {
  expect(isCommunicationForFamily(communication(comm), 'familia', assigned)).toBe(expected);
});
test('etiquetas identifican nivel y curso, incluso en mensajes antiguos', () => {
  expect(getDestinationLabel(communication({ level: 'todos' }))).toBe('INSTITUCIONAL • TODOS');
  expect(getDestinationLabel(communication({ level: 'primario', cursoId: 'grado-1-tt' }))).toBe('NIVEL PRIMARIO • 1° GRADO TT');
});
