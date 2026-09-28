import { lookup } from 'node:dns/promises';
import type { LookupAddress } from 'node:dns';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { loadBuffer } from 'cheerio';
import ipaddr from 'ipaddr.js';

export interface LinkPreview {
  url: string;
  domain: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}
export interface PreviewNetwork {
  lookupAll: (hostname: string) => Promise<LookupAddress[]>;
  request: typeof httpsRequest;
}
const MAX_BYTES = 512 * 1024;

export function isPublicAddress(value: string): boolean {
  try { return ipaddr.process(value).range() === 'unicast'; }
  catch { return false; }
}
export function previewURL(value: string): URL {
  if (value.length > 2000 || /[\s\\\u0000-\u001f]/.test(value)) throw new Error('Invalid URL');
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port ||
      !url.hostname.includes('.') || url.hostname.endsWith('.') ||
      /(^|\.)(localhost|local|internal|test|invalid)$/.test(url.hostname)) throw new Error('Invalid URL');
  if (ipaddr.isValid(url.hostname) && !isPublicAddress(url.hostname)) throw new Error('Private address');
  return url;
}

async function beforeAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  let abort: () => void = () => {};
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      abort = () => reject(new Error('Preview timed out'));
      signal.addEventListener('abort', abort, { once: true });
    })]);
  } finally { signal.removeEventListener('abort', abort); }
}

async function fetchHTML(url: URL, signal: AbortSignal, network?: Partial<PreviewNetwork>): Promise<{ html?: Buffer; location?: string; encoding?: string }> {
  const addresses = await beforeAbort(network?.lookupAll ? network.lookupAll(url.hostname) : lookup(url.hostname, { all: true, verbatim: true }), signal);
  if (!addresses.length || addresses.some(address => !isPublicAddress(address.address))) throw new Error('Private address');
  const address = addresses[0];
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const request = (network?.request || (url.protocol === 'https:' ? httpsRequest : httpRequest))(url.href, {
      method: 'GET', agent: false, signal, family: address.family,
      // Fijar el IP validado: evita una segunda resolución DNS al conectar.
      lookup: (_hostname, _options, callback) => callback(null, address.address, address.family),
      headers: { Accept: 'text/html,application/xhtml+xml', 'Accept-Encoding': 'identity',
        'User-Agent': 'Mozilla/5.0 (compatible; InstitucionLinkPreview/1.0)' },
    }, response => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode || 0)) {
        resolve({ location: response.headers.location });
        response.destroy();
        return;
      }
      if (response.statusCode !== 200 || !/^(text\/html|application\/xhtml\+xml)/i.test(response.headers['content-type'] || '') ||
          (response.headers['content-encoding'] && response.headers['content-encoding'] !== 'identity')) {
        reject(new Error('No HTML preview'));
        response.destroy();
        return;
      }
      const encoding = /charset=["']?([^;"'\s]+)/i.exec(response.headers['content-type'] || '')?.[1];
      const chunks: Buffer[] = [];
      let size = 0;
      response.on('error', reject);
      response.on('data', (chunk: Buffer) => {
        const remaining = MAX_BYTES - size;
        chunks.push(chunk.subarray(0, remaining));
        size += Math.min(chunk.length, remaining);
        if (size >= MAX_BYTES) {
          resolve({ html: Buffer.concat(chunks), encoding });
          response.destroy();
        }
      });
      response.on('end', () => resolve({ html: Buffer.concat(chunks), encoding }));
    });
    request.on('error', reject);
    request.end();
  });
}

export function extractLinkPreview(html: Buffer, finalURL: string, originalURL = finalURL, encoding?: string): LinkPreview {
  const $ = loadBuffer(html, { encoding: { defaultEncoding: 'utf-8', transportLayerEncodingLabel: encoding } });
  const tags = new Map<string, string>();
  $('meta').each((_, element) => {
    const name = ($(element).attr('property') || $(element).attr('name') || '').toLowerCase();
    const value = $(element).attr('content')?.trim();
    if (value && !tags.has(name)) tags.set(name, value);
  });
  const clean = (value: string | undefined, max: number) => value?.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) || undefined;
  const result: LinkPreview = { url: originalURL, domain: new URL(originalURL).hostname };
  const title = clean(tags.get('og:title') || tags.get('twitter:title') || $('title').first().text(), 180);
  const description = clean(tags.get('og:description') || tags.get('twitter:description') || tags.get('description'), 350);
  if (title) result.title = title;
  if (description) result.description = description;
  const image = tags.get('og:image:secure_url') || tags.get('og:image') || tags.get('twitter:image');
  if (image) {
    try {
      const imageURL = previewURL(new URL(image, finalURL).href);
      // iOS y Android pueden bloquear imágenes HTTP; mantener el fallback textual.
      if (imageURL.protocol === 'https:') result.imageUrl = imageURL.href;
    } catch { /* Una imagen inválida no invalida el título ni el enlace. */ }
  }
  return result;
}

export async function fetchLinkPreview(value: string, network?: Partial<PreviewNetwork>): Promise<LinkPreview> {
  const original = previewURL(value);
  const fallback: LinkPreview = { url: original.href, domain: original.hostname };
  const signal = AbortSignal.timeout(6000);
  try {
    let current = original;
    for (let redirects = 0; redirects <= 3; redirects++) {
      const result = await fetchHTML(current, signal, network);
      if (result.location) { current = previewURL(new URL(result.location, current).href); continue; }
      if (!result.html) return fallback;
      const preview = extractLinkPreview(result.html, current.href, original.href, result.encoding);
      if (preview.imageUrl) {
        try {
          const addresses = await beforeAbort(network?.lookupAll ? network.lookupAll(new URL(preview.imageUrl).hostname) : lookup(new URL(preview.imageUrl).hostname, { all: true }), signal);
          if (!addresses.length || addresses.some(address => !isPublicAddress(address.address))) delete preview.imageUrl;
        } catch { delete preview.imageUrl; }
      }
      return preview;
    }
  } catch { /* Sitios bloqueados, lentos o sin HTML conservan el enlace. */ }
  return fallback;
}
