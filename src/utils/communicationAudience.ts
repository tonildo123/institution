import { canReadCommunication } from '../services/firebase/communications';
import type { Communication } from '../services/firebase/communications';
import { getDestinatarios, SalaLevel, UserSalasInfo } from '../services/firebase/salas';

/** Compatibilidad: la pertenencia actual a una sala no concede acceso a mensajes anteriores. */
export function isCommunicationForFamily(comm: Communication, userId: string, _assigned?: UserSalasInfo): boolean {
  return canReadCommunication(comm, userId);
}

export function getDestinationLabel(comm: Communication): string {
  if (comm.level === 'todos') return 'INSTITUCIONAL • TODOS';
  if (!['inicial', 'primario', 'secundario'].includes(comm.level)) return 'DESTINATARIOS ESPECÍFICOS';
  const curso = comm.cursoLabel || getDestinatarios(comm.level as SalaLevel).find(item => item.id === comm.cursoId)?.label;
  return `NIVEL ${comm.level.toUpperCase()} • ${curso || comm.cursoId || 'TODO EL NIVEL'}`;
}
