import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export type SalaLevel = 'inicial' | 'primario' | 'secundario';

export interface Curso {
  id: string;
  label: string;
}

export const getCursos = (level: SalaLevel): Curso[] => {
  if (level === 'inicial') {
    return [3, 4, 5].flatMap(edad =>
      ['TM', 'TT'].map(turno => ({
        id: `sala-${edad}-${turno.toLowerCase()}`,
        label: `INICIAL SALA DE ${edad} AÑOS ${turno}`,
      })),
    );
  }
  if (level === 'primario') {
    return Array.from({ length: 6 }, (_, i) => i + 1).flatMap(grado =>
      ['TM', 'TT'].map(turno => ({
        id: `grado-${grado}-${turno.toLowerCase()}`,
        label: `${grado}° GRADO ${turno}`,
      })),
    );
  }
  if (level === 'secundario') {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `sec-${i + 1}`,
      label: `SEC ${i + 1}° AÑO`,
    }));
  }
  return [];
};

export const getDestinatarios = (level: SalaLevel): Curso[] => [
  ...(['inicial', 'primario'].includes(level) ? [
    { id: 'turno-tm', label: 'TODO EL NIVEL TM' },
    { id: 'turno-tt', label: 'TODO EL NIVEL TT' },
  ] : []),
  ...getCursos(level),
];

const getSalaRef = (level: SalaLevel, cursoId?: string) => {
  if (cursoId && !getCursos(level).some(curso => curso.id === cursoId)) {
    throw new Error('El curso no pertenece al nivel seleccionado');
  }
  return cursoId
    ? doc(db, 'salas', level, 'cursos', cursoId)
    : doc(db, 'salas', level);
};

export interface Sala {
  id: string;
  level: SalaLevel;
  users: string[];
}

/**
 * Obtener usuarios en una sala
 */
export const getSalaUsers = async (level: SalaLevel, cursoId?: string): Promise<string[]> => {
  if (['inicial', 'primario'].includes(level) && (cursoId === 'turno-tm' || cursoId === 'turno-tt')) {
    const turno = cursoId.slice(-2);
    const usersByCurso = await Promise.all(
      getCursos(level).filter(curso => curso.id.endsWith(`-${turno}`))
        .map(curso => getSalaUsers(level, curso.id)),
    );
    return [...new Set(usersByCurso.flat())];
  }
  const snapshot = await getDoc(getSalaRef(level, cursoId));
  const users: string[] = snapshot.exists() ? snapshot.data().users || [] : [];
  if (cursoId || getCursos(level).length === 0) return users;

  // Incluir las asignaciones anteriores al nivel y las de todos sus cursos.
  const cursos = await getDocs(collection(db, 'salas', level, 'cursos'));
  return [...new Set<string>([
    ...users,
    ...cursos.docs.flatMap(curso => curso.data().users || []),
  ])];
};

/**
 * Agregar usuario a una sala
 */
export const addUserToSala = async (
  level: SalaLevel,
  userId: string,
  cursoId?: string,
): Promise<void> => {
  await setDoc(getSalaRef(level, cursoId), {
    level,
    users: arrayUnion(userId),
  }, { merge: true });
};

/**
 * Remover usuario de una sala
 */
export const removeUserFromSala = async (
  level: SalaLevel,
  userId: string
): Promise<void> => {
  try {
    const salaRef = doc(db, 'salas', level);
    await updateDoc(salaRef, {
      users: arrayRemove(userId),
    });
    console.log(`✅ Usuario ${userId} removido de sala ${level}`);
  } catch (error: any) {
    console.error('❌ Error removing user from sala:', error);
    throw error;
  }
};

/**
 * Obtener todas las salas
 */
export const getAllSalas = async (): Promise<Sala[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'salas'));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      level: doc.data().level,
      users: doc.data().users || [],
    }));
  } catch (error: any) {
    console.error('❌ Error fetching salas:', error);
    throw error;
  }
};
