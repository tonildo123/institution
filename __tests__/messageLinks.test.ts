import { normalizeMessageLink } from '../src/utils/messageLinks';

test.each([
  [' https://www.instagram.com/escuela/?igsh=abc ', 'https://www.instagram.com/escuela/?igsh=abc'],
  ['www.escuela.com', 'https://www.escuela.com'],
  ['escuela.com/noticias#hoy', 'https://escuela.com/noticias#hoy'],
  ['HTTP://ESCUELA.COM:8080/info', 'http://escuela.com:8080/info'],
  ['https://example.com/a%20b?x=1&y=2', 'https://example.com/a%20b?x=1&y=2'],
])('normaliza %s', (input, expected) => {
  expect(normalizeMessageLink(input)).toBe(expected);
});
test.each(['', 'texto suelto', 'javascript:alert(1)', 'file:///data/test', 'intent://app',
  'https://user:password@example.com', 'https://example..com', 'https://-bad.com',
  'https://example.com:99999', 'https://example.com/\npath', 'https://example.com/\\test',
  `https://example.com/${'a'.repeat(1500)}`])('rechaza %s', input => {
  expect(() => normalizeMessageLink(input)).toThrow('enlace web válido');
});
