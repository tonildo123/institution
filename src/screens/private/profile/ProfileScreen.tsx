import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAuth } from '@/hooks/useAuth';

/**
 * Pantalla de Perfil
 */

export const ProfileScreen = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      {
        text: 'Cancelar',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Cerrar Sesión',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar la sesión');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header con Avatar */}
      <View style={styles.headerContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>{user?.displayName || 'Usuario'}</Text>
        <Text style={styles.role}>
          {user?.role === 'admin'
            ? 'Administrador'
            : user?.role === 'preceptor'
            ? 'Docente'
            : 'Familia'}
        </Text>
      </View>

      {/* Información del Usuario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nombre Completo</Text>
          <Text style={styles.infoValue}>{user?.displayName}</Text>
        </View>

        {user?.email && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Correo Electrónico</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        )}

        {user?.dni && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>DNI</Text>
            <Text style={styles.infoValue}>{user.dni}</Text>
          </View>
        )}

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Rol</Text>
          <Text style={styles.infoValue}>
            {user?.role === 'admin'
              ? 'Administrador'
              : user?.role === 'preceptor'
              ? 'Docente'
              : 'Familia'}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Estado</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {user?.isEnabled ? '✓ Activo' : '✗ Inactivo'}
            </Text>
          </View>
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>✏️ Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonSecondary]}>
          <Text style={styles.buttonSecondaryText}>🔐 Cambiar Contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonDangerText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    backgroundColor: '#f0f0f0',
  },

  headerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 40,
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },

  role: {
    fontSize: 14,
    color: '#25D366',
    fontWeight: '600',
  },

  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },

  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },

  statusBadge: {
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },

  statusText: {
    fontSize: 13,
    color: '#25D366',
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#25D366',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  buttonSecondary: {
    backgroundColor: '#007AFF',
  },

  buttonSecondaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  buttonDanger: {
    backgroundColor: '#ff3b30',
  },

  buttonDangerText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
