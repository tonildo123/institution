jest.mock('../src/services/firebase/firebaseConfig', () => ({ auth: {
  authStateReady: jest.fn().mockResolvedValue(undefined),
  currentUser: { getIdToken: jest.fn().mockResolvedValue('token') }, app: { options: { projectId: 'project' } },
} }));
import { getLinkPreview, linkPreviewData } from '../src/services/linkPreview';
const originalFetch = global.fetch;
beforeEach(() => { global.fetch = jest.fn(); });
afterEach(() => { global.fetch = originalFetch; });
test('obtiene título, descripción e imagen y genera campos string para Firestore', async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ result: {
    title: ' Noticia ', description: 'Texto', imageUrl: 'https://example.com/image.jpg', domain: 'falso.com',
  } }) });
  const result = await getLinkPreview('https://example.com/noticia');
  expect(result.domain).toBe('example.com');
  expect(linkPreviewData(result)).toEqual({ linkDomain: 'example.com', linkTitle: 'Noticia', linkDescription: 'Texto', linkImageUrl: 'https://example.com/image.jpg' });
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/getLinkPreview'), expect.objectContaining({
    headers: expect.objectContaining({ Authorization: 'Bearer token' }),
  }));
});
test('si falla la consulta conserva un enlace que puede abrirse', async () => {
  (fetch as jest.Mock).mockRejectedValue(new Error('offline'));
  expect(await getLinkPreview('https://example.com')).toEqual({ url: 'https://example.com', domain: 'example.com' });
});
test('admite una Function todavía no publicada sin bloquear el envío', async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: false });
  expect((await getLinkPreview('https://example.com')).title).toBeUndefined();
});
test('descarta esquemas de imagen inválidos y limita los textos', async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ result: { title: 'a'.repeat(300), description: 123, imageUrl: 'file:///private/image' } }) });
  const preview = await getLinkPreview('https://example.com');
  expect(preview.title).toHaveLength(180);
  expect(preview.description).toBe(''); expect(preview.imageUrl).toBe('');
});
