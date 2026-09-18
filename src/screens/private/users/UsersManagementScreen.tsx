import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/services/firebase/users';
import { User, CreateUserCredentials } from '@/types';
import { styles } from './styles';

/**
 * Pantalla de Gestión de Usuarios (CRUD)
 * Solo disponible para Admin
 */

export const UsersManagementScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    dni: '',
    password: '',
    role: 'familia' as const,
    isEnabled: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#FF3B30';
      case 'preceptor':
        return '#007AFF';
      case 'familia':
        return '#25D366';
      case 'equipo directivo':
        return '#5856D6';
      case 'representante legal':
        return '#FF9500';
      default:
        return '#999';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'preceptor':
        return 'Docente';
      case 'familia':
        return 'Familia';
      case 'equipo directivo':
        return 'Equipo Dir.';
      case 'representante legal':
        return 'Rep. Legal';
      default:
        return role;
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      displayName: user.displayName,
      email: user.email || '',
      dni: user.dni || '',
      password: '',
      role: user.role,
      isEnabled: user.isEnabled,
    });
    setShowModal(true);
  };

  const handleDelete = (userId: string) => {
    Alert.alert('Eliminar usuario', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setSaving(true);
            await deleteUser(userId);
            setUsers(users.filter((u) => u.id !== userId));
            Alert.alert('Éxito', 'Usuario eliminado');
          } catch (err: any) {
            Alert.alert('Error', 'No se pudo eliminar el usuario');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const handleSaveUser = async () => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Nombre requerido');
      return;
    }

    if (formData.role !== 'familia' && !formData.email.trim()) {
      Alert.alert('Error', 'Email requerido para este rol');
      return;
    }

    if (formData.role === 'familia' && !formData.dni.trim()) {
      Alert.alert('Error', 'DNI requerido para familia');
      return;
    }

    try {
      setSaving(true);

      if (selectedUser) {
        // Editar
        await updateUser(selectedUser.id, {
          displayName: formData.displayName,
          email: formData.email || undefined,
          dni: formData.dni || undefined,
          isEnabled: formData.isEnabled,
        });

        setUsers(
          users.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  displayName: formData.displayName,
                  email: formData.email,
                  dni: formData.dni,
                  isEnabled: formData.isEnabled,
                }
              : u
          )
        );

        Alert.alert('Éxito', 'Usuario actualizado');
      } else {
        // Crear
        const userId = `user_${Date.now()}`;
        const credentials: CreateUserCredentials = {
          displayName: formData.displayName,
          role: formData.role,
          email: formData.email || undefined,
          dni: formData.dni || undefined,
          isEnabled: formData.isEnabled,
        };

        const newUser = await createUser(userId, credentials);
        setUsers([newUser, ...users]);
        Alert.alert('Éxito', 'Usuario creado');
      }

      setShowModal(false);
      setFormData({
        displayName: '',
        email: '',
        dni: '',
        password: '',
        role: 'familia',
        isEnabled: true,
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón agregar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedUser(null);
            setFormData({
              displayName: '',
              email: '',
              dni: '',
              password: '',
              role: 'familia',
              isEnabled: true,
            });
            setShowModal(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={{ backgroundColor: '#ffebee', padding: 10, margin: 10, borderRadius: 4 }}>
          <Text style={{ color: '#c62828' }}>❌ {error}</Text>
        </View>
      )}

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.filter((u) => u.role === 'admin' || u.role === 'equipo directivo' || u.role === 'representante legal').length}
          </Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.filter((u) => u.role === 'preceptor').length}
          </Text>
          <Text style={styles.statLabel}>Docentes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.filter((u) => u.role === 'familia').length}
          </Text>
          <Text style={styles.statLabel}>Familias</Text>
        </View>
      </View>

      {/* Lista de usuarios */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.displayName}</Text>
                <View style={styles.badgeContainer}>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: getRoleColor(item.role) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleBadgeText,
                        { color: getRoleColor(item.role) },
                      ]}
                    >
                      {getRoleLabel(item.role)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: item.isEnabled ? '#f0f8f0' : '#fff0f0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: item.isEnabled ? '#25D366' : '#FF3B30',
                        },
                      ]}
                    >
                      {item.isEnabled ? '✓ Activo' : '✗ Inactivo'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.actionButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.actionButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#999' }}>No hay usuarios</Text>
          </View>
        }
      />

      {/* Modal para crear/editar */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)} disabled={saving}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Juan Pérez"
                  placeholderTextColor="#999"
                  value={formData.displayName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, displayName: text })
                  }
                  editable={!saving}
                />
              </View>

              {!selectedUser && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Rol</Text>
                  <View style={styles.roleButtons}>
                    {['admin', 'preceptor', 'familia', 'equipo directivo', 'representante legal'].map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleButton,
                          formData.role === role &&
                            styles.roleButtonActive,
                        ]}
                        onPress={() =>
                          setFormData({ ...formData, role: role as any })
                        }
                      >
                        <Text
                          style={[
                            styles.roleButtonText,
                            formData.role === role &&
                              styles.roleButtonActiveText,
                          ]}
                        >
                          {getRoleLabel(role)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {formData.role !== 'familia' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="usuario@institucion.com"
                    placeholderTextColor="#999"
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                    editable={!saving}
                    keyboardType="email-address"
                  />
                </View>
              )}

              {formData.role === 'familia' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>DNI</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="12345678"
                    placeholderTextColor="#999"
                    value={formData.dni}
                    onChangeText={(text) =>
                      setFormData({ ...formData, dni: text })
                    }
                    editable={!saving}
                    keyboardType="numeric"
                  />
                </View>
              )}

              {!selectedUser && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData({ ...formData, password: text })
                    }
                    editable={!saving}
                    secureTextEntry
                  />
                </View>
              )}

              <View
                style={[
                  styles.inputGroup,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}
              >
                <Text style={styles.label}>Estado</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor: formData.isEnabled
                        ? '#25D366'
                        : '#ccc',
                    },
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      isEnabled: !formData.isEnabled,
                    })
                  }
                  disabled={saving}
                >
                  <Text style={styles.toggleButtonText}>
                    {formData.isEnabled ? 'Activo' : 'Inactivo'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.6 }]}
                onPress={handleSaveUser}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
