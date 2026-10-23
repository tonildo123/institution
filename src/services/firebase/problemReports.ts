import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { pickMessageImage, uploadMessageFile } from '../messageImages';
import type { MessageImage } from '../messageImages';
import type { User } from '@/types';

export const canManageReports = (role?: string) => role === 'admin' || role === 'equipo directivo';
export const reportStatuses = { pendiente: 'Pendiente', en_revision: 'En revisión', resuelto: 'Resuelto' };
export type ReportStatus = keyof typeof reportStatuses;
export interface ProblemReport { id: string; title: string; description: string; reporterName: string; reporterId: string; reporterRole: string; status: ReportStatus; imageURL?: string; imagePath?: string }
export interface ReportComment { id: string; body: string; authorName: string }
export const createProblemReport = async (user: User, title: string, description: string, image?: MessageImage | null) => {
  if (canManageReports(user.role)) throw new Error('Este rol administra los reportes.');
  if (!title.trim() || title.trim().length > 120 || !description.trim() || description.trim().length > 4000) throw new Error('Completá el título y la descripción.');
  // Una ruta nueva en cada intento evita sobrescribir adjuntos ya enviados.
  const attachment = image ? { ...image, path: `problem-report-images/${user.id}/${doc(collection(db, 'problemReports')).id}` } : null;
  const imageURL = attachment ? await uploadMessageFile(attachment, 'problem-report-images', 5 * 1024 * 1024) : undefined;
  await addDoc(collection(db, 'problemReports'), { title: title.trim(), description: description.trim(), reporterId: user.id, reporterName: user.displayName || 'Usuario', reporterRole: user.role, status: 'pendiente', ...(attachment ? { imageURL, imagePath: attachment.path } : {}), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
};
export const pickReportImage = async (): Promise<MessageImage | null> => {
  const image = await pickMessageImage();
  return image ? { ...image, path: image.path.replace('communication-images/', 'problem-report-images/') } : null;
};
export const watchProblemReports = (user: User, next: (reports: ProblemReport[]) => void, error: (error: Error) => void) => {
  const reports = collection(db, 'problemReports');
  // Filtrar por propietario en el servidor; ordenar localmente evita un índice compuesto.
  const source = canManageReports(user.role) ? query(reports, orderBy('createdAt', 'desc')) : query(reports, where('reporterId', '==', user.id));
  return onSnapshot(source, snapshot => next(snapshot.docs
    .sort((a, b) => (b.data().createdAt?.toMillis?.() || 0) - (a.data().createdAt?.toMillis?.() || 0))
    .map(item => ({ ...item.data(), id: item.id } as ProblemReport))), error);
};
export const changeReportStatus = (id: string, status: ReportStatus) => updateDoc(doc(db, 'problemReports', id), { status, updatedAt: serverTimestamp() });
export const watchReportComments = (id: string, next: (comments: ReportComment[]) => void, error: (error: Error) => void) =>
  onSnapshot(query(collection(db, 'problemReports', id, 'comments'), orderBy('createdAt')), snapshot => next(snapshot.docs.map(item => ({ ...item.data(), id: item.id } as ReportComment))), error);
export const commentOnReport = async (id: string, user: User, body: string) => {
  if (!body.trim() || body.trim().length > 2000) throw new Error('Escribí un comentario de hasta 2000 caracteres.');
  await addDoc(collection(db, 'problemReports', id, 'comments'), { body: body.trim(), authorId: user.id, authorName: user.displayName || 'Usuario', createdAt: serverTimestamp() });
};
