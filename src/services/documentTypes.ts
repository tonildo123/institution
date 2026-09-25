export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;
export const DOCUMENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
};
export function validateDocument(name: string | null, size: number | null): { name: string; contentType: string; size: number } {
  const contentType = DOCUMENT_TYPES[name?.split('.').pop()?.toLowerCase() || ''];
  if (!name || !contentType) throw new Error('Seleccioná un PDF, Word, Excel, PowerPoint o TXT.');
  if (size === null || !Number.isFinite(size) || size <= 0) throw new Error('No se pudo comprobar el tamaño del archivo o está vacío.');
  if (size > MAX_DOCUMENT_SIZE) throw new Error('El documento debe pesar como máximo 20 MB.');
  return { name, contentType, size };
}
