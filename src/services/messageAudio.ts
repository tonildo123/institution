import { pick, types, keepLocalCopy, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { collection, doc } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';
import { readFileBlob, uploadMessageFile } from './messageImages';
import { MAX_AUDIO_SIZE, validateAudio } from './audioTypes';

export interface MessageAudioFile {
  uri: string;
  name: string;
  size: number;
  contentType: string;
  path: string;
  durationMs?: number;
}

async function localAudio(uri: string, name: string) {
  const id = doc(collection(db, 'communications')).id;
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  const [copy] = await keepLocalCopy({ files: [{ uri, fileName: `${id}-${safeName}` }], destination: 'cachesDirectory' });
  if (copy.status !== 'success') throw new Error('No se pudo copiar el audio. Descargalo al dispositivo e intentá nuevamente.');
  return { uri: copy.localUri, path: `communication-audios/${auth.currentUser?.uid || 'pending'}/${id}/${safeName}` };
}

export async function pickMessageAudio(): Promise<MessageAudioFile | null> {
  try {
    const [file] = await pick({ type: [types.audio], allowMultiSelection: false });
    if (file.error || !file.hasRequestedType) throw new Error('No se pudo leer el archivo de audio.');
    const details = validateAudio(file.name, file.size);
    return { ...details, ...await localAudio(file.uri, details.name) };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return null;
    throw error;
  }
}

export async function recordedMessageAudio(uri: string, durationMs: number): Promise<MessageAudioFile> {
  if (!Number.isFinite(durationMs) || durationMs < 500) throw new Error('La nota de voz es demasiado corta. Grabá al menos un segundo.');
  const name = `Nota de voz ${new Date().toISOString().replace(/[:.]/g, '-')}.m4a`;
  const local = await localAudio(uri.startsWith('/') ? `file://${uri}` : uri, name);
  const blob = await readFileBlob(local.uri);
  try { return { ...local, ...validateAudio(name, blob.size), durationMs }; }
  finally { (blob as Blob & { close?: () => void }).close?.(); }
}

export function uploadMessageAudio(file: MessageAudioFile) {
  validateAudio(file.name, file.size);
  return uploadMessageFile(file, 'communication-audios', MAX_AUDIO_SIZE);
}
export function audioMessageData(file: MessageAudioFile, url: string): Record<string, string> {
  if (typeof url !== 'string' || !url.startsWith('https://')) throw new Error('No se obtuvo el enlace del audio. El mensaje no se envió.');
  return { audioUrl: url, audioPath: file.path, audioName: file.name, audioSize: String(file.size),
    audioContentType: file.contentType, ...(file.durationMs ? { audioDurationMs: String(file.durationMs) } : {}) };
}
