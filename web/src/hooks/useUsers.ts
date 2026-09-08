import { useState, useEffect, useCallback } from 'react';
import type { User, CreateUserCredentials, UserRole, UpdateUserData } from '@/types/index';
import * as usersService from '@/services/usersService';

/**
 * Hook de lógica para gestión de usuarios
 * Maneja: listar, crear, editar, eliminar usuarios
 */

interface UseUsersReturn {
  users: User[];
  filteredUsers: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  filter: UserRole | 'all';

  // Acciones
  loadUsers: () => Promise<void>;
  createUser: (credentials: CreateUserCredentials) => Promise<void>;
  updateUserData: (userId: string, data: UpdateUserData) => Promise<void>;
  deleteUserData: (userId: string) => Promise<void>;
  selectUser: (user: User | null) => void;
  setFilter: (filter: UserRole | 'all') => void;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserRole | 'all'>('all');

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuarios según el rol seleccionado
  const filteredUsers = filter === 'all'
    ? users
    : users.filter(u => u.role === filter);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await usersService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error loading users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(
    async (credentials: CreateUserCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        // Generar ID único (en producción, usar Firebase Admin SDK)
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Verificar si email/dni ya existe
        if (credentials.email) {
          const existingByEmail = await usersService.getUserByEmail(credentials.email);
          if (existingByEmail) {
            throw new Error('Email already exists');
          }
        }

        if (credentials.dni) {
          const existingByDNI = await usersService.getUserByDNI(credentials.dni);
          if (existingByDNI) {
            throw new Error('DNI already exists');
          }
        }

        // Crear usuario
        const newUser = await usersService.createUser(userId, credentials);
        setUsers([...users, newUser]);
        setSuccess(`Usuario "${credentials.displayName}" creado exitosamente`);

        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.message || 'Error creating user');
      } finally {
        setIsLoading(false);
      }
    },
    [users]
  );

  const updateUserData = useCallback(
    async (userId: string, data: UpdateUserData) => {
      try {
        setIsLoading(true);
        setError(null);

        // Validar si email/dni ya existe en otro usuario
        if (data.email) {
          const existingByEmail = await usersService.getUserByEmail(data.email);
          if (existingByEmail && existingByEmail.id !== userId) {
            throw new Error('Email already exists');
          }
        }

        if (data.dni) {
          const existingByDNI = await usersService.getUserByDNI(data.dni);
          if (existingByDNI && existingByDNI.id !== userId) {
            throw new Error('DNI already exists');
          }
        }

        await usersService.updateUser(userId, data);

        // Actualizar estado local
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, ...data } : u))
        );
        setSelectedUser(null);
        setSuccess('Usuario actualizado exitosamente');

        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.message || 'Error updating user');
      } finally {
        setIsLoading(false);
      }
    },
    [users]
  );

  const deleteUserData = useCallback(
    async (userId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const userToDelete = users.find(u => u.id === userId);
        await usersService.deleteUser(userId);

        setUsers(users.filter((u) => u.id !== userId));
        setSelectedUser(null);
        setSuccess(`Usuario "${userToDelete?.displayName}" eliminado exitosamente`);

        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.message || 'Error deleting user');
      } finally {
        setIsLoading(false);
      }
    },
    [users]
  );

  const selectUser = useCallback((user: User | null) => {
    setSelectedUser(user);
  }, []);

  return {
    users,
    filteredUsers,
    selectedUser,
    isLoading,
    error,
    success,
    filter,
    loadUsers,
    createUser,
    updateUserData,
    deleteUserData: deleteUserData,
    selectUser,
    setFilter,
    clearError,
    clearSuccess,
  };
};
