import { parseMessage } from '../src/utils/messageFormatting';

test('admite asteriscos simples y dobles en una frase', () => {
  expect(parseMessage('Hola *familias*, **mañana hay clases**.')).toEqual([
    { text: 'Hola ', bold: false }, { text: 'familias', bold: true },
    { text: ', ', bold: false }, { text: 'mañana hay clases', bold: true },
    { text: '.', bold: false },
  ]);
});
test('conserva texto incompleto y saltos de línea', () => {
  expect(parseMessage('Hola\n*pendiente')).toEqual([{ text: 'Hola\n*pendiente', bold: false }]);
  expect(parseMessage('')).toEqual([]);
});
