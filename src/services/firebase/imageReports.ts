import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { User } from '@/types';

// Imagen de un mensaje, entrega o publicación de Classroom que se puede reportar.
export type ImageField = 'imageUrl' | 'photoUrl';
export interface ImageReportTarget {
  sourcePath: string; // communications/{id} | classroom/{id} | classroom/{id}/submissions/{uid}
  ownerId: string; // quien envió la imagen (remitente o alumno)
  imageField: ImageField;
  imageURL: string;
  imagePath?: string;
}

const MAX_REASON_LENGTH = 500;

// Crea un reporte de imagen para administración. La revisión y las acciones se hacen desde el panel web.
export const createImageReport = async (user: User, target: ImageReportTarget, reason: string) => {
  const trimmed = reason.trim();
  if (trimmed.length > MAX_REASON_LENGTH) throw new Error(`El motivo no puede superar ${MAX_REASON_LENGTH} caracteres.`);
  await addDoc(collection(db, 'imageReports'), {
    reporterId: user.id,
    reporterName: user.displayName || 'Usuario',
    reporterRole: user.role,
    sourcePath: target.sourcePath,
    ownerId: target.ownerId,
    imageField: target.imageField,
    imageURL: target.imageURL,
    ...(target.imagePath ? { imagePath: target.imagePath } : {}),
    ...(trimmed ? { reason: trimmed } : {}),
    status: 'pendiente',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
