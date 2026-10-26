import {
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  limit,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export const CLASSROOM_LIMIT = 30;

export function canReadClassroom(message: Pick<Classroom, 'sentBy' | 'targetUserIds'>, userId?: string): boolean {
  return Boolean(userId && (message.sentBy === userId || message.targetUserIds?.includes(userId)));
}
export function classroomLoadError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (['unavailable', 'auth/network-request-failed', 'deadline-exceeded'].includes(code || '')) {
    return 'No se pudo conectar con Firebase. Revisá la conexión y tocá Reintentar.';
  }
  return 'No se pudieron cargar los mensajes de Classroom. Intentá nuevamente.';
}

export interface Classroom {
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
    photoUrl?: string;
    photoPath?: string;
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
export const getAllClassroom = async (maxMessages: 30 | 100 = CLASSROOM_LIMIT, userId?: string): Promise<Classroom[]> => {
  try {
    await auth.authStateReady();
    // El token puede necesitar renovarse tras restaurar la sesión.
    await auth.currentUser?.getIdToken();
    const viewerId = auth.currentUser?.uid;
    if (!viewerId || (userId && userId !== viewerId)) return [];
    const max = maxMessages === 100 ? 100 : CLASSROOM_LIMIT;
    const snapshots = await Promise.all([
      getDocsFromServer(query(collection(db, 'classroom'), where('sentBy', '==', viewerId), orderBy('createdAt', 'desc'), limit(max))),
      getDocsFromServer(query(collection(db, 'classroom'), where('targetUserIds', 'array-contains', viewerId), orderBy('createdAt', 'desc'), limit(max))),
    ]);
    const docs = [...new Map(snapshots.flatMap(snapshot => snapshot.docs).map(doc => [doc.id, doc])).values()];

    return docs.map((doc) => {
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
      } as Classroom;
    }).filter(message => canReadClassroom(message, viewerId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
      .slice(0, max);
  } catch (error: any) {
    console.error('❌ Error fetching classroom:', error);
    throw error;
  }
};

/**
 * Obtener una comunicación por ID
 */
export const getClassroom = async (id: string, userId?: string): Promise<Classroom | null> => {
  try {
    await auth.authStateReady();
    const viewerId = auth.currentUser?.uid;
    if (!viewerId || (userId && userId !== viewerId)) return null;
    const docSnap = await getDocFromServer(doc(db, 'classroom', id));

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    if (!canReadClassroom({ sentBy: data.sentBy, targetUserIds: Array.isArray(data.targetUserIds) ? data.targetUserIds : [] }, viewerId)) return null;
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
    } as Classroom;
  } catch (error: any) {
    console.error('❌ Error fetching classroom:', error);
    throw error;
  }
};

/**
 * Eliminar una comunicación por ID (solo admin)
 */
export const deleteClassroom = async (id: string): Promise<void> => {
  try {
    const { deleteDoc, doc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'classroom', id));
    console.log('✅ Comunicación eliminada:', id);
  } catch (error: any) {
    console.error('❌ Error deleting classroom:', error);
    throw error;
  }
};

/**
 * Actualizar una comunicación (solo admin)
 */
export const updateClassroom = async (
  id: string,
  updates: {
    title?: string;
    description?: string;
    body?: string;
  }
): Promise<void> => {
  try {
    const { updateDoc, doc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'classroom', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Comunicación actualizada:', id);
  } catch (error: any) {
    console.error('❌ Error updating classroom:', error);
    throw error;
  }
};
