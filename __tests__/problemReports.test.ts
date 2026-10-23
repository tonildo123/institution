jest.mock('../src/services/messageImages', () => ({ pickMessageImage: jest.fn(), uploadMessageFile: jest.fn().mockResolvedValue('https://example.com/image') }));
jest.mock('../src/services/firebase/firebaseConfig', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({ addDoc: jest.fn().mockResolvedValue({ id: 'report' }), collection: jest.fn(), doc: jest.fn(() => ({ id: 'image' })), onSnapshot: jest.fn(), orderBy: jest.fn(), query: jest.fn(), serverTimestamp: jest.fn(() => 'server-time'), updateDoc: jest.fn(), where: jest.fn() }));
import { addDoc } from 'firebase/firestore';
import { canManageReports, createProblemReport, commentOnReport } from '../src/services/firebase/problemReports';
import type { User } from '../src/types';
const user = { id: 'family', role: 'familia', displayName: 'Familia' } as User;
beforeEach(() => jest.clearAllMocks());
test.each(['admin', 'equipo directivo', 'representante legal', 'preceptor', 'familia'])('permisos de gestión para %s', role => {
  expect(canManageReports(role)).toBe(['admin', 'equipo directivo'].includes(role));
});
test('el reporte identifica al autor y comienza pendiente', async () => {
  await createProblemReport(user, ' Problema ', ' Descripción ');
  expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({ title: 'Problema', description: 'Descripción', reporterId: 'family', reporterRole: 'familia', status: 'pendiente', createdAt: 'server-time' }));
});
test('rechaza formularios vacíos y creación desde gestores', async () => {
  await expect(createProblemReport(user, ' ', 'algo')).rejects.toThrow();
  await expect(createProblemReport({ ...user, role: 'admin' }, 'Título', 'Descripción')).rejects.toThrow();
  expect(addDoc).not.toHaveBeenCalled();
});
test('rechaza comentarios vacíos o demasiado largos', async () => {
  await expect(commentOnReport('report', user, ' ')).rejects.toThrow();
  await expect(commentOnReport('report', user, 'a'.repeat(2001))).rejects.toThrow();
  expect(addDoc).not.toHaveBeenCalled();
});

test('adjunta una imagen al reporte y guarda su referencia', async () => {
  const { uploadMessageFile } = require('../src/services/messageImages');
  const image = { uri: 'file:///photo.jpg', path: 'problem-report-images/family/image', contentType: 'image/jpeg' };
  await createProblemReport(user, 'Problema', 'Descripción', image);
  expect(uploadMessageFile).toHaveBeenCalledWith(image, 'problem-report-images', 5 * 1024 * 1024);
  expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({ imageURL: 'https://example.com/image', imagePath: image.path }));
});
test('una subida fallida conserva el reporte sin enviar para reintentar', async () => {
  const { uploadMessageFile } = require('../src/services/messageImages');
  uploadMessageFile.mockRejectedValueOnce(new Error('upload failed'));
  await expect(createProblemReport(user, 'Problema', 'Descripción', { uri: 'photo', path: 'path', contentType: 'image/jpeg' })).rejects.toThrow('upload failed');
  expect(addDoc).not.toHaveBeenCalled();
});
