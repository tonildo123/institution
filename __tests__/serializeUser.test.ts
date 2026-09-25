import { serializeUser } from '../src/utils/serializeUser';
test('normaliza Timestamp, Date y fechas restauradas sin guardar contraseñas', () => {
  const iso = '2026-09-25T00:00:00.000Z';
  const date = new Date(iso);
  const value = serializeUser({ id: 'user', password: 'secret', createdAt: { toDate: () => date }, updatedAt: date, enabledAt: { seconds: date.getTime() / 1000, nanoseconds: 0 }, nested: [{ savedAt: date }] });
  expect(value).toEqual({ id: 'user', createdAt: iso, updatedAt: iso, enabledAt: iso, nested: [{ savedAt: iso }] });
  expect(JSON.parse(JSON.stringify(value))).toEqual(value);
});
