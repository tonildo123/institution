import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Communication {
  id: string;
  title: string;
  description: string;
  body: string;
  sentBy: string;
  sentAt: string;
  createdAt: string;
  status: string;
  level: string;
  cursoId?: string | null;
  cursoLabel?: string | null;
  targetUserIds?: string[];
  deliveredCount: number;
  failedCount: number;
  totalUsers: number;
  data?: {
    type: string;
    level: string;
    timestamp: string;
    imageUrl?: string;
    imagePath?: string;
    documentUrl?: string;
    documentPath?: string;
    documentName?: string;
    documentSize?: string;
    documentContentType?: string;
  };
}

/**
 * Obtener todas las comunicaciones ordenadas por fecha
 */
export const getAllCommunications = async (): Promise<Communication[]> => {
  try {
    const q = query(
      collection(db, 'communications'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        body: data.body || '',
        sentBy: data.sentBy || '',
        sentAt: data.sentAt || '',
        createdAt: data.createdAt || '',
        status: data.status || 'enviado',
        level: data.level || data.data?.level || '',
        cursoId: data.cursoId !== undefined ? data.cursoId : data.data?.cursoId || null,
        cursoLabel: data.cursoLabel !== undefined ? data.cursoLabel : data.data?.cursoLabel || null,
        targetUserIds: Array.isArray(data.targetUserIds) ? data.targetUserIds : [],
        deliveredCount: data.deliveredCount || 0,
        failedCount: data.failedCount || 0,
        totalUsers: data.totalUsers || 0,
        data: data.data,
      } as Communication;
    });
  } catch (error: any) {
    console.error('❌ Error fetching communications:', error);
    throw error;
  }
};

/**
 * Obtener una comunicación por ID
 */
export const getCommunication = async (id: string): Promise<Communication | null> => {
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const docSnap = await getDoc(doc(db, 'communications', id));

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title || '',
      description: data.description || '',
      body: data.body || '',
      sentBy: data.sentBy || '',
      sentAt: data.sentAt || '',
      createdAt: data.createdAt || '',
      status: data.status || 'enviado',
      level: data.level || data.data?.level || '',
      cursoId: data.cursoId !== undefined ? data.cursoId : data.data?.cursoId || null,
      cursoLabel: data.cursoLabel !== undefined ? data.cursoLabel : data.data?.cursoLabel || null,
      targetUserIds: Array.isArray(data.targetUserIds) ? data.targetUserIds : [],
      deliveredCount: data.deliveredCount || 0,
      failedCount: data.failedCount || 0,
      totalUsers: data.totalUsers || 0,
      data: data.data,
    } as Communication;
  } catch (error: any) {
    console.error('❌ Error fetching communication:', error);
    throw error;
  }
};

/**
 * Eliminar una comunicación por ID (solo admin)
 */
export const deleteCommunication = async (id: string): Promise<void> => {
  try {
    const { deleteDoc, doc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'communications', id));
    console.log('✅ Comunicación eliminada:', id);
  } catch (error: any) {
    console.error('❌ Error deleting communication:', error);
    throw error;
  }
};

/**
 * Actualizar una comunicación (solo admin)
 */
export const updateCommunication = async (
  id: string,
  updates: {
    title?: string;
    description?: string;
    body?: string;
  }
): Promise<void> => {
  try {
    const { updateDoc, doc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'communications', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Comunicación actualizada:', id);
  } catch (error: any) {
    console.error('❌ Error updating communication:', error);
    throw error;
  }
};
