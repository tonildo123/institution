import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from './firebaseConfig';

/** Reportes de imágenes enviados desde la app (colección imageReports). */

export type ImageReportStatus = 'pendiente' | 'en_revision' | 'resuelto';

export const REPORT_STATUS_LABEL: Record<ImageReportStatus, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  resuelto: 'Resuelto',
};

export const SOURCE_LABEL: Record<string, string> = {
  communications: 'Mensaje',
  classroom: 'Classroom',
};

export interface ImageReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: string;
  sourcePath: string;
  ownerId: string;
  imageField: 'imageUrl' | 'photoUrl';
  imageURL: string;
  reason?: string;
  status: ImageReportStatus;
  createdAt?: unknown;
  imageRemovedAt?: unknown;
}

export interface ReportOwner {
  displayName: string;
  role: string;
  isEnabled: boolean;
}

const functions = () => getFunctions(undefined, 'us-central1');
const call = <Input, Output = { ok: boolean }>(name: string) => httpsCallable<Input, Output>(functions(), name);

export const sourceKind = (sourcePath: string): string => {
  if (sourcePath.includes('/submissions/')) return 'Entrega de Classroom';
  return SOURCE_LABEL[sourcePath.split('/')[0]] ?? 'Imagen';
};

export const listImageReports = async (): Promise<ImageReport[]> => {
  const snapshot = await getDocs(query(collection(db, 'imageReports'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ImageReport));
};

export const setImageReportStatus = (reportId: string, status: ImageReportStatus) =>
  updateDoc(doc(db, 'imageReports', reportId), { status, updatedAt: serverTimestamp() });

export const getReportOwner = async (uid: string): Promise<ReportOwner | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { displayName: data.displayName ?? 'Sin nombre', role: data.role ?? '', isEnabled: data.isEnabled === true };
};

export const deleteReportedImage = (reportId: string) => call<{ reportId: string }>('adminDeleteReportedImage')({ reportId });

export const setUserEnabled = (uid: string, enabled: boolean) => call<{ uid: string; enabled: boolean }>('adminSetUserEnabled')({ uid, enabled });

/** Fecha legible de un Timestamp de Firestore o de una cadena ISO. */
export const formatWhen = (value: unknown): string => {
  if (!value) return '—';
  const date = typeof (value as { toDate?: () => Date }).toDate === 'function'
    ? (value as { toDate: () => Date }).toDate()
    : new Date(value as string);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
};
