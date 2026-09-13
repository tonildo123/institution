import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAuth } from '@/hooks/useAuth';
import { styles } from './styles';

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

