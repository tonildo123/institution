import React, { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/useUsers';
import UserForm from '@/components/UserForm';
import UsersList from '@/components/UsersList';
import type { CreateUserCredentials, UpdateUserData, UserRole } from '@/types/index';
import './Users.css';

/**
 * Página de Gestión de Usuarios
 * - Crear nuevo usuario
 * - Listar usuarios con filtro por rol
 * - Editar usuario
 * - Eliminar usuario
 */

const Users = () => {
  const {
    users,
    filteredUsers,
    selectedUser,
    isLoading,
    error,
    success,
    filter,
    createUser,
    updateUserData,
    deleteUserData,
    selectUser,
    setFilter,
    clearError,
    clearSuccess,
  } = useUsers();

  const [showForm, setShowForm] = useState(false);

  // Auto-clear success message después de 3 segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => clearSuccess(), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearSuccess]);

  const handleFormSubmit = async (data: CreateUserCredentials | UpdateUserData) => {
    try {
      if (selectedUser) {
        // Editando
        await updateUserData(selectedUser.id, data as UpdateUserData);
        setShowForm(false);
        selectUser(null);
      } else {
        // Creando
        await createUser(data as CreateUserCredentials);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error en handleFormSubmit:', err);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    selectUser(null);
  };

  const handleSelectUser = (user: any) => {
    selectUser(user);
    setShowForm(true);
  };

  const handleNewUser = () => {
    selectUser(null);
    setShowForm(true);
  };

  return (
    <div className="users-page">
      {/* Header */}
      <div className="users-header">
        <div className="header-content">
          <h1>👥 Gestión de Usuarios</h1>
          <p>Crear, editar y eliminar usuarios del sistema</p>
        </div>
        <button
          className="btn-new-user"
          onClick={handleNewUser}
          disabled={isLoading}
        >
          ➕ Nuevo Usuario
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="alert alert-error">
          <span>❌ {error}</span>
          <button onClick={clearError} className="alert-close">✕</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✅ {success}</span>
          <button onClick={clearSuccess} className="alert-close">✕</button>
        </div>
      )}

      {/* Contenedor principal */}
      <div className="users-content">
        {/* Sección de formulario */}
        {showForm && (
          <div className="form-section">
            <UserForm
              user={selectedUser}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Sección de lista */}
        <div className="list-section">
          <UsersList
            users={filteredUsers}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            onDeleteUser={deleteUserData}
            isLoading={isLoading}
            filter={filter as UserRole | 'all'}
            onFilterChange={setFilter as (filter: UserRole | 'all') => void}
          />
        </div>
      </div>

      {/* Footer con estadísticas */}
      <div className="users-footer">
        <div className="stats">
          <div className="stat">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Usuarios</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {users.filter((u) => u.role === 'admin').length}
            </div>
            <div className="stat-label">Administradores</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {users.filter((u) => u.role === 'familia').length}
            </div>
            <div className="stat-label">Familias</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {users.filter((u) => u.role === 'preceptor').length}
            </div>
            <div className="stat-label">Preceptores</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {users.filter((u) => u.isEnabled).length}
            </div>
            <div className="stat-label">Activos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
