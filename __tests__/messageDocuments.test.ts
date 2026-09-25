jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(), keepLocalCopy: jest.fn(), types: {},
  isErrorWithCode: (error: any) => Boolean(error.code), errorCodes: { OPERATION_CANCELED: 'cancelled' },
}));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ auth: { currentUser: { uid: 'sender' } }, db: {} }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), doc: () => ({ id: 'document-id' }) }));
jest.mock('../src/services/messageImages', () => ({ uploadMessageFile: jest.fn().mockResolvedValue('https://example.com/file.pdf') }));
import { pick, keepLocalCopy } from '@react-native-documents/picker';
import { pickMessageDocument, uploadMessageDocument, documentMessageData } from '../src/services/messageDocuments';
import { MAX_DOCUMENT_SIZE, validateDocument } from '../src/services/documentTypes';
import { uploadMessageFile } from '../src/services/messageImages';
beforeEach(() => {
  jest.clearAllMocks();
  (pick as jest.Mock).mockResolvedValue([{ name: 'Informe.PDF', size: 1024, uri: 'content://document', hasRequestedType: true }]);
  (keepLocalCopy as jest.Mock).mockResolvedValue([{ status: 'success', localUri: 'file://copy.pdf' }]);
});
test('selecciona copia local y conserva nombre, tamaño y MIME', async () => {
  const file = await pickMessageDocument();
  expect(file).toEqual({ name: 'Informe.PDF', size: 1024, contentType: 'application/pdf', uri: 'file://copy.pdf',
    path: 'communication-documents/sender/document-id/Informe.PDF' });
  await uploadMessageDocument(file!);
  expect(uploadMessageFile).toHaveBeenCalledWith(file, 'communication-documents', MAX_DOCUMENT_SIZE);
});
test('cancelar no copia ni sube documentos', async () => {
  (pick as jest.Mock).mockRejectedValue({ code: 'cancelled' });
  expect(await pickMessageDocument()).toBeNull();
  expect(keepLocalCopy).not.toHaveBeenCalled();
});
test.each(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'])('admite %s hasta 20 MB', ext => {
  expect(validateDocument(`archivo.${ext}`, MAX_DOCUMENT_SIZE).contentType).toBeTruthy();
});
test.each([0, null, -1, NaN, MAX_DOCUMENT_SIZE + 1])('rechaza tamaño inválido %s', size => {
  expect(() => validateDocument('file.pdf', size)).toThrow();
});
test('rechaza formatos no admitidos', () => {
  expect(() => validateDocument('programa.exe', 100)).toThrow('Seleccioná');
});
test('informa errores al copiar', async () => {
  (keepLocalCopy as jest.Mock).mockResolvedValue([{ status: 'error', copyError: 'failed' }]);
  await expect(pickMessageDocument()).rejects.toThrow('No se pudo copiar');
});
test('rechaza proveedores que ignoran el filtro de tipos', async () => {
  (pick as jest.Mock).mockResolvedValue([{ name: 'file.pdf', size: 1024, hasRequestedType: false }]);
  await expect(pickMessageDocument()).rejects.toThrow('formato');
  expect(keepLocalCopy).not.toHaveBeenCalled();
});


test('el payload incluye todos los datos del documento seleccionado', async () => {
  const file = (await pickMessageDocument())!;
  const url = await uploadMessageDocument(file);
  expect(documentMessageData(file, url)).toEqual({
    documentUrl: url, documentPath: file.path, documentName: 'Informe.PDF',
    documentSize: '1024', documentContentType: 'application/pdf',
  });
});
test.each(['', undefined, null, 'file://copy.pdf'])('detiene el envío si la URL no es válida: %s', async url => {
  const file = (await pickMessageDocument())!;
  expect(() => documentMessageData(file, url as string)).toThrow('El mensaje no se envió');
});
