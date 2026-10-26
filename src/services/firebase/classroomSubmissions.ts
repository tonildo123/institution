import { collection, doc, getDocFromServer, getDocsFromServer } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { uploadMessageFile } from '../messageImages';
import { validateVideo, MAX_VIDEO_SIZE } from '../messageVideo';
import { validateAudio, MAX_AUDIO_SIZE } from '../audioTypes';
import { messageForError } from '@/utils/connectionErrors';

export interface ClassroomSubmission {
  id: string;
  studentName: string;
  body: string;
  data?: Record<string, string>;
  createdAt: string;
}

/** Ruta de Storage de un adjunto de entrega: classroom-submissions/{uid}/{taskId}/{archivo}. */
export function submissionPath(originalPath: string, taskId: string, uid: string): string {
  const name = originalPath.split('/').pop() || 'archivo';
  return `classroom-submissions/${uid}/${taskId}/${name}`;
}

/** Sube un adjunto ya seleccionado a la carpeta de la entrega y devuelve su URL y su nueva ruta. */
export async function uploadSubmissionFile<T extends { path: string; contentType: string; size?: number; name?: string }>(
  file: T, taskId: string, maxSize: number,
): Promise<{ url: string; file: T }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Iniciá sesión para entregar la tarea.');
  const moved = { ...file, path: submissionPath(file.path, taskId, uid) };
  const url = await uploadMessageFile(moved as any, 'classroom-submissions', maxSize);
  return { url, file: moved };
}

export function validateSubmissionVideo(file: { contentType: string; size: number }) {
  validateVideo(file.contentType, file.size);
  if (file.size > MAX_VIDEO_SIZE) throw new Error('El video supera los 50 MB.');
}

export function validateSubmissionAudio(file: { name: string; size: number }) {
  validateAudio(file.name, file.size);
  if (file.size > MAX_AUDIO_SIZE) throw new Error('El audio supera los 20 MB.');
}

/** Envía la entrega: una sola por alumno, dentro del plazo y del cupo (la validación final está en la función). */
export async function submitClassroomTask(taskId: string, body: string, data: Record<string, string>): Promise<void> {
  await auth.authStateReady();
  const account = auth.currentUser;
  if (!account) throw new Error('Iniciá sesión para entregar la tarea.');
  const token = await account.getIdToken();
  let response: Response;
  try {
    response = await fetch(`https://us-central1-${auth.app.options.projectId}.cloudfunctions.net/submitClassroomTask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: { taskId, body, data } }),
    });
  } catch (error) {
    throw new Error(messageForError(error, 'No se pudo enviar la entrega. Intentá nuevamente.'));
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || 'No se pudo enviar la entrega. Intentá nuevamente.');
  }
}

/** La entrega propia del alumno, o null si todavía no entregó. */
export async function getOwnSubmission(taskId: string, uid: string): Promise<ClassroomSubmission | null> {
  const snapshot = await getDocFromServer(doc(db, 'classroom', taskId, 'submissions', uid));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as Omit<ClassroomSubmission, 'id'>) };
}

/** Todas las entregas de una tarea (administración y docente que publicó). */
export async function listSubmissions(taskId: string): Promise<ClassroomSubmission[]> {
  const snapshot = await getDocsFromServer(collection(db, 'classroom', taskId, 'submissions'));
  return snapshot.docs
    .map(item => ({ id: item.id, ...(item.data() as Omit<ClassroomSubmission, 'id'>) }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
