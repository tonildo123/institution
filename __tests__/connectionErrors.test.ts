import { isConnectionError, messageForError, CONNECTION_MESSAGE } from '../src/utils/connectionErrors';

test('reconoce errores de red de Firebase y de fetch', () => {
  expect(isConnectionError({ code: 'unavailable' })).toBe(true);
  expect(isConnectionError({ code: 'auth/network-request-failed' })).toBe(true);
  expect(isConnectionError(new TypeError('Network request failed'))).toBe(true);
  expect(isConnectionError(new Error('Failed to get documents from server.'))).toBe(true);
});

test('no confunde errores de negocio con conexión', () => {
  expect(isConnectionError({ code: 'permission-denied' })).toBe(false);
  expect(isConnectionError(new Error('DNI o contraseña incorrectos'))).toBe(false);
});

test('devuelve el mensaje de conexión solo para errores de red', () => {
  expect(messageForError({ code: 'unavailable' }, 'otro')).toBe(CONNECTION_MESSAGE);
  expect(messageForError({ code: 'permission-denied' }, 'otro')).toBe('otro');
});
