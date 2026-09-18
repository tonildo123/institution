import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export type SalaLevel = 'inicial' | 'primario' | 'secundario';

export interface Sala {
  id: string;
  level: SalaLevel;
  users: string[];
}

/**
 * Obtener usuarios en una sala
 */
export const getSalaUsers = async (level: SalaLevel): Promise<string[]> => {
  try {
    const docSnap = await getDoc(doc(db, 'salas', level));
    if (docSnap.exists()) {
      return docSnap.data().users || [];
    }
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching sala users:', error);
    throw error;
  }
};

/**
 * Agregar usuario a una sala
 */
export const addUserToSala = async (
  level: SalaLevel,
  userId: string
): Promise<void> => {
  try {
    const salaRef = doc(db, 'salas', level);
    const docSnap = await getDoc(salaRef);

    if (docSnap.exists()) {
      // La sala existe, agregar usuario al array
      await updateDoc(salaRef, {
        users: arrayUnion(userId),
      });
    } else {
      // La sala no existe, crearla
      await setDoc(salaRef, {
        level: level,
        users: [userId],
      });
    }
    console.log(`✅ Usuario ${userId} agregado a sala ${level}`);
  } catch (error: any) {
    console.error('❌ Error adding user to sala:', error);
    throw error;
  }
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
