import { pick, types, keepLocalCopy, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { collection, doc } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';
import { uploadMessageFile } from './messageImages';
import { MAX_DOCUMENT_SIZE, validateDocument } from './documentTypes';

export interface MessageDocumentFile {
  uri: string;
  name: string;
  size: number;
  contentType: string;
  path: string;
}

export async function pickMessageDocument(): Promise<MessageDocumentFile | null> {
  try {
    const [file] = await pick({
      type: [types.pdf, types.doc, types.docx, types.xls, types.xlsx, types.ppt, types.pptx, types.plainText],
      allowMultiSelection: false,
    });
    if (file.error || !file.hasRequestedType) throw new Error('No se pudo leer el documento o su formato no está permitido.');
    const details = validateDocument(file.name, file.size);
    const safeName = details.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
    const [copy] = await keepLocalCopy({ files: [{ uri: file.uri, fileName: safeName }], destination: 'cachesDirectory' });
    if (copy.status !== 'success') throw new Error('No se pudo copiar el documento. Descargalo al dispositivo y volvé a seleccionarlo.');
    return { ...details, uri: copy.localUri,
      path: `communication-documents/${auth.currentUser?.uid || 'pending'}/${doc(collection(db, 'communications')).id}/${safeName}` };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return null;
    throw error;
  }
}

export function uploadMessageDocument(file: MessageDocumentFile): Promise<string> {
  validateDocument(file.name, file.size);
  return uploadMessageFile(file, 'communication-documents', MAX_DOCUMENT_SIZE);
}

/** Un documento seleccionado nunca debe convertirse silenciosamente en un mensaje de texto. */
export function documentMessageData(file: MessageDocumentFile, url: string): Record<string, string> {
  if (typeof url !== 'string' || !url.startsWith('https://')) {
    throw new Error('No se obtuvo el enlace del PDF/documento. El mensaje no se envió; volvé a intentar.');
  }
  return {
    documentUrl: url, documentPath: file.path, documentName: file.name,
    documentSize: String(file.size), documentContentType: file.contentType,
  };
}
