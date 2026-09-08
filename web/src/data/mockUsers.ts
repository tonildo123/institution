import type { User } from '@/types/index';

/**
 * Datos de ejemplo para testing
 * Usar solo en desarrollo
 */

export const mockUsers: User[] = [
  {
    id: 'user_admin_001',
    role: 'admin',
    displayName: 'Juan García López',
    email: 'juan@institucion.com',
    isEnabled: true,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-09-08'),
    enabledAt: new Date('2026-08-01'),
    pushTokens: ['token_1', 'token_2'],
    lastLogin: new Date('2026-09-08T10:30:00'),
  },
  {
    id: 'user_familia_001',
    role: 'familia',
    displayName: 'María Rodríguez',
    dni: '12345678A',
    isEnabled: true,
    createdAt: new Date('2026-08-15'),
    updatedAt: new Date('2026-09-05'),
    enabledAt: new Date('2026-08-15'),
    pushTokens: ['token_3'],
    lastLogin: new Date('2026-09-06T14:20:00'),
  },
  {
    id: 'user_familia_002',
    role: 'familia',
    displayName: 'Carlos Martínez',
    dni: '87654321B',
    isEnabled: true,
    createdAt: new Date('2026-08-20'),
    updatedAt: new Date('2026-09-08'),
    enabledAt: new Date('2026-08-20'),
    pushTokens: ['token_4', 'token_5'],
  },
  {
    id: 'user_preceptor_001',
    role: 'preceptor',
    displayName: 'Laura Pérez Gómez',
    email: 'laura@institucion.com',
    isEnabled: true,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-08'),
    enabledAt: new Date('2026-09-01'),
    pushTokens: [],
    lastLogin: new Date('2026-09-08T09:00:00'),
  },
  {
    id: 'user_preceptor_002',
    role: 'preceptor',
    displayName: 'Roberto Fernández',
    email: 'roberto@institucion.com',
    isEnabled: false,
    createdAt: new Date('2026-09-03'),
    updatedAt: new Date('2026-09-04'),
    enabledAt: undefined,
    pushTokens: [],
  },
  {
    id: 'user_admin_002',
    role: 'admin',
    displayName: 'Ana Sánchez',
    email: 'ana@institucion.com',
    isEnabled: true,
    createdAt: new Date('2026-07-15'),
    updatedAt: new Date('2026-09-07'),
    enabledAt: new Date('2026-07-15'),
    pushTokens: ['token_6', 'token_7', 'token_8'],
    lastLogin: new Date('2026-09-07T16:45:00'),
  },
  {
    id: 'user_familia_003',
    role: 'familia',
    displayName: 'Sofía Iglesias López',
    dni: '11223344C',
    isEnabled: true,
    createdAt: new Date('2026-09-05'),
    updatedAt: new Date('2026-09-08'),
    enabledAt: new Date('2026-09-05'),
    pushTokens: ['token_9'],
    lastLogin: new Date('2026-09-08T11:15:00'),
  },
];

/**
 * Estadísticas calculadas desde mock data
 */
export const calculateStats = (users: User[]) => {
  return {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    familia: users.filter(u => u.role === 'familia').length,
    preceptor: users.filter(u => u.role === 'preceptor').length,
    active: users.filter(u => u.isEnabled).length,
    inactive: users.filter(u => !u.isEnabled).length,
  };
};

// Ejemplo de uso:
// const stats = calculateStats(mockUsers);
// console.log(`Total usuarios: ${stats.total}`);
// console.log(`Administradores: ${stats.admin}`);
// console.log(`Familias: ${stats.familia}`);
// console.log(`Preceptores: ${stats.preceptor}`);
// console.log(`Activos: ${stats.active}`);
