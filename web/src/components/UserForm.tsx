import React, { useState, useEffect } from 'react';
import type { User, CreateUserCredentials, UserRole, UpdateUserData } from '@/types/index';
import './UserForm.css';

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserCredentials | UpdateUserData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Formulario para crear/editar usuarios
 * - Dinámica según el rol seleccionado
 * - Validación de campos
 * - Separación entre crear (con password) y editar (sin password)
 */

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!user;

  // Estados del formulario
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'familia');
  const [email, setEmail] = useState(user?.email || '');
  const [dni, setDni] = useState(user?.dni || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEnabled, setIsEnabled] = useState(user?.isEnabled ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Validar campos
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Nombre requerido';
    }

    if (role === 'admin' || role === 'preceptor') {
      if (!email.trim()) {
        newErrors.email = 'Email requerido';
      } else if (!isValidEmail(email)) {
        newErrors.email = 'Email inválido';
      }
    }

    if (role === 'familia') {
      if (!dni.trim()) {
        newErrors.dni = 'DNI requerido';
      }
    }

    if (!isEditMode) {
      if (!password.trim()) {
        newErrors.password = 'Contraseña requerida';
      } else if (password.length < 6) {
        newErrors.password = 'Mínimo 6 caracteres';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditMode) {
        // Editar usuario
        const updateData: UpdateUserData = {
          displayName,
          isEnabled,
        };

        if (role === 'admin' || role === 'preceptor') {
          updateData.email = email;
        }

        if (role === 'familia') {
          updateData.dni = dni;
        }

        await onSubmit(updateData);
      } else {
        // Crear usuario
        const createData: CreateUserCredentials = {
          displayName,
          role,
          password,
          isEnabled,
        };

        if (role === 'admin' || role === 'preceptor') {
          createData.email = email;
        }

        if (role === 'familia') {
          createData.dni = dni;
        }

        await onSubmit(createData);
      }

      // Reset form
      setDisplayName('');
      setRole('familia');
      setEmail('');
      setDni('');
      setPassword('');
      setConfirmPassword('');
      setIsEnabled(true);
    } catch (err) {
      console.error('Error en handleSubmit:', err);
    }
  };

  return (
    <div className="user-form-container">
      <div className="user-form-card">
        <h2 className="user-form-title">
          {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h2>

        <form onSubmit={handleSubmit} className="user-form">
          {/* Display Name */}
          <div className="form-group">
            <label htmlFor="displayName">
              Nombre Completo <span className="required">*</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Juan Pérez"
              disabled={isLoading}
              className={errors.displayName ? 'error' : ''}
            />
            {errors.displayName && (
              <span className="error-message">{errors.displayName}</span>
            )}
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="role">
              Rol <span className="required">*</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isLoading || isEditMode}
              className={errors.role ? 'error' : ''}
            >
              <option value="familia">Familia (DNI + Contraseña)</option>
              <option value="admin">Administrador (Email + Contraseña)</option>
              <option value="preceptor">Preceptor (Email + Contraseña)</option>
            </select>
            {errors.role && (
              <span className="error-message">{errors.role}</span>
            )}
          </div>

          {/* Email - para admin y preceptor */}
          {(role === 'admin' || role === 'preceptor') && (
            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                disabled={isLoading}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          )}

          {/* DNI - para familia */}
          {role === 'familia' && (
            <div className="form-group">
              <label htmlFor="dni">
                DNI <span className="required">*</span>
              </label>
              <input
                id="dni"
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value.toUpperCase())}
                placeholder="12345678A"
                disabled={isLoading}
                className={errors.dni ? 'error' : ''}
              />
              {errors.dni && (
                <span className="error-message">{errors.dni}</span>
              )}
            </div>
          )}

          {/* Password - solo si es nuevo usuario */}
          {!isEditMode && (
            <>
              <div className="form-group">
                <label htmlFor="password">
                  Contraseña <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={errors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    disabled={isLoading}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirmar Contraseña <span className="required">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>
            </>
          )}

          {/* Enabled Toggle */}
          <div className="form-group checkbox">
            <label htmlFor="isEnabled">
              <input
                id="isEnabled"
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                disabled={isLoading}
              />
              <span>Cuenta Habilitada</span>
            </label>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '⏳ Guardando...' : isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
