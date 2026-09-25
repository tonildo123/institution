import type { Communication } from '../services/firebase/communications';
import { getCursos, getDestinatarios, SalaLevel, UserSalasInfo } from '../services/firebase/salas';

export function isCommunicationForFamily(comm: Communication, userId: string, assigned: UserSalasInfo): boolean {
  if (comm.level === 'todos') return true;
  if (comm.targetUserIds?.includes(userId)) return true;
  if (!assigned.levels.includes(comm.level as SalaLevel)) return false;
  if (!comm.cursoId) return true;
  const levelCursos = getCursos(comm.level as SalaLevel);
  if (comm.cursoId === 'turno-tm' || comm.cursoId === 'turno-tt') {
    return levelCursos.some(curso => curso.id.endsWith(`-${comm.cursoId!.slice(-2)}`) && assigned.cursos.includes(curso.id));
  }
  return levelCursos.some(curso => curso.id === comm.cursoId && assigned.cursos.includes(curso.id));
}

export function getDestinationLabel(comm: Communication): string {
  if (comm.level === 'todos') return 'INSTITUCIONAL • TODOS';
  if (!['inicial', 'primario', 'secundario'].includes(comm.level)) return 'DESTINATARIOS ESPECÍFICOS';
  const curso = comm.cursoLabel || getDestinatarios(comm.level as SalaLevel).find(item => item.id === comm.cursoId)?.label;
  return `NIVEL ${comm.level.toUpperCase()} • ${curso || comm.cursoId || 'TODO EL NIVEL'}`;
}
