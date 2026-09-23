import { updateBoldText } from '../src/components/BoldMessageInput';

test('oculta delimitadores y ajusta cursor al completar negrita', () => {
  const result = updateBoldText([], '*algo*');
  expect(result.chars.map(c => c.text).join('')).toBe('algo');
  expect(result.chars.every(c => c.bold)).toBe(true);
  expect(result.cursor).toBe(4);
});
test('conserva formato al editar antes y permite seguir escribiendo normal', () => {
  const first = updateBoldText([], '**algo**');
  const second = updateBoldText(first.chars, 'algo más');
  expect(second.chars.slice(0, 4).every(c => c.bold)).toBe(true);
  expect(second.chars.slice(4).every(c => !c.bold)).toBe(true);
  const third = updateBoldText(second.chars, 'Hola algo más');
  expect(third.chars.slice(5, 9).every(c => c.bold)).toBe(true);
});
