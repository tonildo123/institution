export const MAX_AUDIO_SIZE = 20 * 1024 * 1024;
export const MAX_RECORDING_MS = 5 * 60 * 1000;
export const AUDIO_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav',
};
export function validateAudio(name: string | null, size: number | null) {
  const contentType = AUDIO_TYPES[name?.split('.').pop()?.toLowerCase() || ''];
  if (!name || !contentType) throw new Error('Seleccioná un audio MP3, M4A, AAC o WAV.');
  if (size === null || !Number.isFinite(size) || size <= 0) throw new Error('El audio está vacío o no se pudo leer su tamaño.');
  if (size > MAX_AUDIO_SIZE) throw new Error('El audio debe pesar como máximo 20 MB.');
  return { name, size, contentType };
}
export function formatAudioTime(ms: number): string {
  const seconds = Number.isFinite(ms) ? Math.floor(Math.max(0, ms) / 1000) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
