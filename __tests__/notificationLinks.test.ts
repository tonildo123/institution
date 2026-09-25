import { notificationURL, communicationIdFromURL } from '../src/navigation/notificationLinks';
test('convierte el ID recibido por push en el detalle exacto', () => {
  expect(communicationIdFromURL(notificationURL({ communicationId: 'message-123' })!)).toBe('message-123');
});
test('ignora notificaciones sin ID y enlaces inválidos', () => {
  expect(notificationURL({})).toBeNull();
  expect(notificationURL({ communicationId: '../users' })).toBeNull();
  expect(communicationIdFromURL('https://example.com')).toBeNull();
  expect(communicationIdFromURL('institucion://message/%ZZ')).toBeNull();
  expect(communicationIdFromURL('institucion://message/a%2Fb')).toBeNull();
});
