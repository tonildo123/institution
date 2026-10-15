// El selector nativo de iOS identifica los JPEG como image/jpg.
export function imageContentType(type?: string): string {
  const normalized = (type || '').trim().toLowerCase();
  return normalized === 'image/jpg' ? 'image/jpeg' : normalized;
}
