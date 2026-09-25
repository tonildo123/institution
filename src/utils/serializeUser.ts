// Normaliza también las fechas restauradas desde AsyncStorage.
export function serializeUser(user: any): any {
  if (user === null || user === undefined) return user;
  if (user instanceof Date) return user.toISOString();
  if (typeof user?.toDate === 'function') return user.toDate().toISOString();
  if (typeof user === 'object' && typeof user.seconds === 'number' && typeof user.nanoseconds === 'number') {
    return new Date(user.seconds * 1000 + user.nanoseconds / 1000000).toISOString();
  }
  if (Array.isArray(user)) return user.map(serializeUser);
  if (typeof user === 'object') {
    return Object.fromEntries(Object.entries(user).filter(([key]) => key !== 'password').map(([key, value]) => [key, serializeUser(value)]));
  }
  return user;
}
