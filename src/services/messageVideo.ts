import { launchImageLibrary } from 'react-native-image-picker';
import { collection, doc } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';
import { readFileBlob, uploadMessageFile } from './messageImages';

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
export interface MessageVideoFile {
  uri: string; name: string; size: number; contentType: string; path: string; durationMs?: number;
}
export function validateVideo(contentType: string, size: number) {
  if (!['video/mp4', 'video/quicktime', 'video/x-m4v'].includes(contentType)) {
    throw new Error('Seleccioná un video MP4, MOV o M4V.');
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_VIDEO_SIZE) {
    throw new Error('El video está vacío o supera los 50 MB.');
  }
}
export async function pickMessageVideo(): Promise<MessageVideoFile | null> {
  const result = await launchImageLibrary({ mediaType: 'video', selectionLimit: 1, assetRepresentationMode: 'compatible' });
  if (result.didCancel) return null;
  if (result.errorCode) throw new Error('No se pudo seleccionar el video. Revisá el acceso a la galería.');
  const asset = result.assets?.[0];
  if (!asset?.uri) throw new Error('No se pudo leer el video.');
  const extension = asset.fileName?.split('.').pop()?.toLowerCase();
  const contentType = asset.type || (extension === 'mov' ? 'video/quicktime' : extension === 'm4v' ? 'video/x-m4v' : extension === 'mp4' ? 'video/mp4' : '');
  // Comprobar también el tamaño real cuando la galería no lo informa.
  let size = asset.fileSize || 0;
  if (!size) {
    const blob = await readFileBlob(asset.uri);
    try { size = blob.size; } finally { (blob as Blob & { close?: () => void }).close?.(); }
  }
  validateVideo(contentType, size);
  const name = asset.fileName || `Video.${contentType === 'video/quicktime' ? 'mov' : 'mp4'}`;
  const id = doc(collection(db, 'communications')).id;
  return { uri: asset.uri, name, size, contentType,
    path: `communication-videos/${auth.currentUser?.uid || 'pending'}/${id}/${name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120)}`,
    ...(asset.duration && Number.isFinite(asset.duration) ? { durationMs: Math.round(asset.duration * 1000) } : {}),
  };
}
export function uploadMessageVideo(file: MessageVideoFile) {
  validateVideo(file.contentType, file.size);
  return uploadMessageFile(file, 'communication-videos', MAX_VIDEO_SIZE);
}
export function videoMessageData(file: MessageVideoFile, url: string): Record<string, string> {
  if (!url?.startsWith('https://')) throw new Error('No se obtuvo el enlace del video. El mensaje no se envió.');
  return { videoUrl: url, videoPath: file.path, videoName: file.name, videoSize: String(file.size),
    videoContentType: file.contentType, ...(file.durationMs ? { videoDurationMs: String(file.durationMs) } : {}) };
}
