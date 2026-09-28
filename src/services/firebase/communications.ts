import {
  collection,
  getDocsFromServer,
  limit,
  query,
  orderBy,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export const COMMUNICATIONS_LIMIT = 30;
export function communicationLoadError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (['unavailable', 'auth/network-request-failed', 'deadline-exceeded'].includes(code || '')) {
    return 'No se pudo conectar con Firebase. Revisá la conexión y tocá Reintentar.';
  }
  return 'No se pudieron cargar las comunicaciones. Intentá nuevamente.';
}

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
    videoUrl?: string;
    videoPath?: string;
    videoName?: string;
    videoSize?: string;
    videoContentType?: string;
    videoDurationMs?: string;
    audioUrl?: string;
    audioPath?: string;
    audioName?: string;
    audioSize?: string;
    audioContentType?: string;
    audioDurationMs?: string;
    linkUrl?: string;
    linkDomain?: string;
    linkTitle?: string;
    linkDescription?: string;
    linkImageUrl?: string;
    documentUrl?: string;
    documentPath?: string;
    documentName?: string;
    documentSize?: string;
    documentContentType?: string;
  };
}

/**
 * Obtener los últimos 30 comunicados, o hasta 100 al ampliar el listado.
 * Una caché vacía no confirma que no haya mensajes.
 */
export const getAllCommunications = async (maxMessages: 30 | 100 = COMMUNICATIONS_LIMIT): Promise<Communication[]> => {
  try {
    await auth.authStateReady();
    // El token puede necesitar renovarse tras restaurar la sesión.
    await auth.currentUser?.getIdToken();
    const q = query(
      collection(db, 'communications'),
      orderBy('createdAt', 'desc'),
      limit(maxMessages === 100 ? 100 : COMMUNICATIONS_LIMIT)
    );

    const snapshot = await getDocsFromServer(q);

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
