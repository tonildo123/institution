export function notificationURL(data?: { [key: string]: unknown }): string | null {
  const id = data?.communicationId;
  return typeof id === 'string' && id.length > 0 && !id.includes('/')
    ? `institucion://message/${encodeURIComponent(id)}` : null;
}

export function communicationIdFromURL(url: string): string | null {
  const match = /^institucion:\/\/message\/([^/?#]+)$/.exec(url);
  if (!match) return null;
  try {
    const id = decodeURIComponent(match[1]);
    return id && !id.includes('/') ? id : null;
  } catch { return null; }
}
