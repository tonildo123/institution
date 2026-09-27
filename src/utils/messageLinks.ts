/** Normaliza enlaces web; no admite esquemas que ejecuten acciones del dispositivo. */
export function normalizeMessageLink(value: string): string {
  const input = value.trim();
  const url = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const match = /^(https?):\/\/([a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)(?::([0-9]{1,5}))?([/?#][^\s]*)?$/i.exec(url);
  if (!match || url.length > 1500 || /[\s\\<>"\u0000-\u001f]/.test(url) ||
      !match[2].includes('.') || match[2].split('.').some(label => !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)) ||
      (match[3] && (Number(match[3]) < 1 || Number(match[3]) > 65535))) {
    throw new Error('Ingresá un enlace web válido, por ejemplo https://www.escuela.com');
  }
  return `${match[1].toLowerCase()}://${match[2].toLowerCase()}${match[3] ? `:${match[3]}` : ''}${match[4] || ''}`;
}
