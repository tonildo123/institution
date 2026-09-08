import React from 'react';
import type { User, UserRole } from '@/types/index';
import './UsersList.css';

interface UsersListProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  isLoading?: boolean;
  filter?: UserRole | 'all';
  onFilterChange?: (filter: UserRole | 'all') => void;
}

/**
 * Lista de usuarios
 * - Tabla con datos de usuarios
 * - Filtrado por rol
 * - Acciones: editar, eliminar
 */

const UsersList: React.FC<UsersListProps> = ({
  users,
  selectedUser,
  onSelectUser,
  onDeleteUser,
  isLoading = false,
  filter = 'all',
  onFilterChange,
}) => {
  const roles: Array<UserRole | 'all'> = ['all', 'admin', 'familia', 'preceptor'];

  const roleLabels: Record<UserRole | 'all', string> = {
    all: 'Todos',
    admin: 'Administrador',
    familia: 'Familia',
    preceptor: 'Preceptor',
  };

  const getRoleColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
      admin: '#e74c3c',
      familia: '#3498db',
      preceptor: '#f39c12',
    };
    return colors[role];
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCredentialDisplay = (user: User): string => {
    if (user.email) return user.email;
    if (user.dni) return user.dni;
    return 'N/A';
  };

  return (
    <div className="users-list-container">
      {/* Filtros */}
      <div className="users-filters">
        <div className="filter-buttons">
          {roles.map((role) => (
            <button
              key={role}
              className={`filter-btn ${filter === role ? 'active' : ''}`}
              onClick={() => onFilterChange?.(role)}
              disabled={isLoading}
            >
              {roleLabels[role]}
            </button>
          ))}
        </div>
        <div className="filter-info">
          {users.length} usuario(s) encontrado(s)
        </div>
      </div>

      {/* Tabla */}
      {users.length > 0 ? (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Credencial</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Actualizado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`user-row ${
                    selectedUser?.id === user.id ? 'selected' : ''
                  } ${!user.isEnabled ? 'disabled' : ''}`}
                  onClick={() => onSelectUser(user)}
                >
                  <td className="name-cell">
                    <div className="user-avatar">{user.displayName[0]}</div>
                    <div>
                      <div className="user-name">{user.displayName}</div>
                      <div className="user-id">{user.id}</div>
                    </div>
                  </td>
                  <td className="credential-cell">
                    {getCredentialDisplay(user)}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.isEnabled ? 'enabled' : 'disabled'
                      }`}
                    >
                      {user.isEnabled ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(user.createdAt)}</td>
                  <td className="date-cell">{formatDate(user.updatedAt)}</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectUser(user);
                      }}
                      disabled={isLoading}
                      title="Editar usuario"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `¿Estás seguro de que quieres eliminar a ${user.displayName}?`
                          )
                        ) {
                          onDeleteUser(user.id);
                        }
                      }}
                      disabled={isLoading}
                      title="Eliminar usuario"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No hay usuarios</h3>
          <p>No se encontraron usuarios que cumplan los criterios de búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default UsersList;
