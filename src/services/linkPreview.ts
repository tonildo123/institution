import { auth } from './firebase/firebaseConfig';

export interface LinkPreview {
  url: string;
  domain: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}
export const linkDomain = (url: string) => url.replace(/^https?:\/\//i, '').split(/[/?#]/)[0];

/** La falta de vista previa nunca impide adjuntar el enlace. */
export async function getLinkPreview(url: string): Promise<LinkPreview> {
  const fallback = { url, domain: linkDomain(url) };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    await auth.authStateReady();
    if (!auth.currentUser) return fallback;
    const token = await auth.currentUser.getIdToken();
    const response = await fetch(`https://us-central1-${auth.app.options.projectId}.cloudfunctions.net/getLinkPreview`, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: { url } }),
    });
    if (!response.ok) return fallback;
    const payload = await response.json();
    const preview = payload.result ?? payload.data;
    if (!preview || typeof preview !== 'object') return fallback;
    const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
    return { ...fallback,
      title: text(preview.title, 180), description: text(preview.description, 350),
      imageUrl: typeof preview.imageUrl === 'string' && /^https:\/\//i.test(preview.imageUrl) && preview.imageUrl.length <= 2000 ? preview.imageUrl : '',
    };
  } catch { return fallback; }
  finally { clearTimeout(timeout); }
}
export function linkPreviewData(preview: LinkPreview | null): Record<string, string> {
  if (!preview) return {};
  return {
    linkDomain: preview.domain,
    ...(preview.title ? { linkTitle: preview.title } : {}),
    ...(preview.description ? { linkDescription: preview.description } : {}),
    ...(preview.imageUrl ? { linkImageUrl: preview.imageUrl } : {}),
  };
}
