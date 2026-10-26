import { notificationURL, communicationIdFromURL, classroomIdFromURL } from '../src/navigation/notificationLinks';
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
test('las notificaciones de Classroom abren su propio detalle', () => {
  expect(classroomIdFromURL(notificationURL({ type: 'classroom', classroomId: 'room-7' })!)).toBe('room-7');
  expect(communicationIdFromURL(notificationURL({ type: 'classroom', classroomId: 'room-7' })!)).toBeNull();
});
test('ignora notificaciones de Classroom sin ID válido', () => {
  expect(notificationURL({ type: 'classroom' })).toBeNull();
  expect(notificationURL({ type: 'classroom', classroomId: '../users' })).toBeNull();
  expect(classroomIdFromURL('institucion://classroom/a%2Fb')).toBeNull();
  expect(classroomIdFromURL('institucion://message/room-7')).toBeNull();
});
