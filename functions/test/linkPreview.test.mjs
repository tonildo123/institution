import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { extractLinkPreview, fetchLinkPreview, isPublicAddress, previewURL } from '../lib/linkPreview.js';

const html = Buffer.from(`<html><head><title>Fallback</title>
<meta content="Noticia &amp; novedades" property="og:title">
<meta name="description" content="Descripción común">
<meta property="og:description" content="Descripción de la noticia">
<meta property="og:image" content="/foto.jpg"></head></html>`);
test('extrae Open Graph, decodifica entidades y resuelve imágenes relativas', () => {
  assert.deepEqual(extractLinkPreview(html, 'https://example.com/noticia'), {
    url: 'https://example.com/noticia', domain: 'example.com', title: 'Noticia & novedades',
    description: 'Descripción de la noticia', imageUrl: 'https://example.com/foto.jpg',
  });
});
test('usa Twitter/title/description y limita textos extensos', () => {
  const preview = extractLinkPreview(Buffer.from(`<title>Título</title><meta name="twitter:title" content="Twitter">
    <meta name="description" content="${'x'.repeat(500)}"><meta name="twitter:image" content="https://cdn.example.com/image.png">`), 'https://example.com');
  assert.equal(preview.title, 'Twitter');
  assert.equal(preview.description.length, 350);
  assert.equal(preview.imageUrl, 'https://cdn.example.com/image.png');
  assert.equal(extractLinkPreview(Buffer.from('<title>Título común</title>'), 'https://example.com').title, 'Título común');
});
for (const address of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '192.168.1.1', '172.16.0.1', '100.64.0.1', '0.0.0.0', '::1', 'fc00::1', '::ffff:127.0.0.1', 'fe80::1']) {
  test(`rechaza IP interna/reservada ${address}`, () => assert.equal(isPublicAddress(address), false));
}
for (const url of ['file:///etc/passwd', 'http://127.1/', 'http://2130706433', 'http://0x7f000001', 'http://localhost', 'https://user:password@example.com', 'https://example.com:3000', 'https://a.internal']) {
  test(`rechaza URL ${url}`, () => assert.throws(() => previewURL(url)));
}
function network(pages, addresses = () => [{ address: '93.184.216.34', family: 4 }]) {
  const calls = [];
  return {
    calls, lookupAll: async hostname => addresses(hostname),
    request: (url, options, callback) => {
      calls.push(url);
      options.lookup('example.com', {}, (err, ip, family) => {
        assert.equal(err, null); assert.equal(ip, '93.184.216.34'); assert.equal(family, 4);
      });
      const req = new EventEmitter();
      req.end = () => queueMicrotask(() => {
        const page = pages[calls.length - 1];
        const response = new PassThrough();
        response.statusCode = page.status || 200;
        response.headers = { 'content-type': 'text/html', ...page.headers };
        callback(response);
        response.end(page.html || html);
      });
      return req;
    },
  };
}
test('sigue redirecciones públicas y mantiene la URL original de apertura', async () => {
  const net = network([{ status: 302, headers: { location: '/destino' } }, {}]);
  const preview = await fetchLinkPreview('https://example.com', net);
  assert.equal(net.calls.length, 2);
  assert.equal(preview.url, 'https://example.com/');
  assert.equal(preview.title, 'Noticia & novedades');
});
test('no conecta si DNS devuelve una IP privada', async () => {
  const net = network([], () => [{ address: '10.0.0.1', family: 4 }]);
  const preview = await fetchLinkPreview('https://example.com', net);
  assert.equal(net.calls.length, 0);
  assert.equal(preview.title, undefined);
});
test('revalida DNS en cada redirección', async () => {
  const net = network([{ status: 302, headers: { location: 'https://internal.example.com' } }],
    hostname => [{ address: hostname.startsWith('internal.') ? '10.0.0.1' : '93.184.216.34', family: 4 }]);
  assert.equal((await fetchLinkPreview('https://example.com', net)).title, undefined);
  assert.equal(net.calls.length, 1);
});
test('un documento no HTML o un bloqueo remoto conservan el enlace', async () => {
  for (const page of [{ status: 403 }, { headers: { 'content-type': 'application/pdf' } }]) {
    assert.deepEqual(await fetchLinkPreview('https://example.com', network([page])), { url: 'https://example.com/', domain: 'example.com' });
  }
});
test('limita las redirecciones y el HTML descargado', async () => {
  const net = network(Array(4).fill({ status: 302, headers: { location: '/loop' } }));
  assert.equal((await fetchLinkPreview('https://example.com', net)).title, undefined);
  assert.equal(net.calls.length, 4);
  const large = Buffer.from(' '.repeat(512 * 1024) + '<title>No leer</title>');
  assert.equal((await fetchLinkPreview('https://example.com', network([{ html: large }]))).title, undefined);
});
