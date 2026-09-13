import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';

/**
 * Pantalla de Gestión de Usuarios (CRUD)
 * Solo disponible para Admin
 */

interface User {
  id: string;
  displayName: string;
  role: 'admin' | 'familia' | 'preceptor';
  email?: string;
  dni?: string;
  isEnabled: boolean;
}

export const UsersManagementScreen = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      displayName: 'Tony Diaz',
      role: 'admin',
      email: 'admin@institucion.com',
      isEnabled: true,
    },
    {
      id: '2',
      displayName: 'Diaz Baltazar',
      role: 'familia',
      dni: '70485085',
      isEnabled: true,
    },
    {
      id: '3',
      displayName: 'Prof. Juan',
      role: 'preceptor',
      email: 'juan@institucion.com',
      isEnabled: true,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#FF3B30';
      case 'preceptor':
        return '#007AFF';
      case 'familia':
        return '#25D366';
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
      default:
        return role;
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  return (
    <View style={styles.container}>
      {/* Header con botón agregar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedUser(null);
            setShowModal(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.filter((u) => u.role === 'familia').length}
          </Text>
          <Text style={styles.statLabel}>Familias</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.filter((u) => u.role === 'preceptor').length}
          </Text>
          <Text style={styles.statLabel}>Docentes</Text>
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
      />

      {/* Modal para crear/editar */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
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
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rol</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity style={styles.roleButton}>
                    <Text style={styles.roleButtonText}>Admin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.roleButton}>
                    <Text style={styles.roleButtonText}>Docente</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.roleButton}>
                    <Text style={styles.roleButtonText}>Familia</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="usuario@institucion.com"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },

  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  addButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },

  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 24,
  },

  userDetails: {
    flex: 1,
  },

  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },

  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },

  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteButton: {
    backgroundColor: '#fff0f0',
  },

  actionButtonText: {
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  closeButton: {
    fontSize: 24,
    color: '#999',
  },

  formContainer: {
    maxHeight: '80%',
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
  },

  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },

  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
