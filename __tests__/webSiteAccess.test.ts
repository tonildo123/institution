jest.mock('react-native-webview', () => ({ WebView: 'WebView' }));
import { isAllowedWebUrl } from '../src/components/WebSiteModal';
import { WEB_BASE_URL } from '../src/config/links';

test('permite páginas públicas del sitio', () => {
  expect(isAllowedWebUrl(`${WEB_BASE_URL}/`)).toBe(true);
  expect(isAllowedWebUrl(`${WEB_BASE_URL}/terminos`)).toBe(true);
  expect(isAllowedWebUrl(`${WEB_BASE_URL}/privacidad`)).toBe(true);
  expect(isAllowedWebUrl(`${WEB_BASE_URL}/nosotros?x=1`)).toBe(true);
});

test('bloquea el panel de administración y otros sitios', () => {
  expect(isAllowedWebUrl(`${WEB_BASE_URL}/admin`)).toBe(false);
  expect(isAllowedWebUrl(`${WEB_BASE_URL}/admin/`)).toBe(false);
  expect(isAllowedWebUrl(`${WEB_BASE_URL}/admin/usuarios`)).toBe(false);
  expect(isAllowedWebUrl(`${WEB_BASE_URL}/admin?x=1`)).toBe(false);
  expect(isAllowedWebUrl(`${WEB_BASE_URL}/administracion`)).toBe(true);
  expect(isAllowedWebUrl('https://example.com/')).toBe(false);
  expect(isAllowedWebUrl(`${WEB_BASE_URL}.evil.com/`)).toBe(false);
});
