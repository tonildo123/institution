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

  const roleLabel = user?.role === 'admin' || user?.role === 'equipo directivo' || user?.role === 'representante legal'
    ? 'Administrador' : user?.role === 'preceptor' ? 'Docente' : 'Familia';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerContainer}>
          <View style={styles.avatar} accessible={false}>
            <View style={styles.avatarHead} />
            <View style={styles.avatarShoulders} />
          </View>
          <Text style={styles.name}>{user?.displayName || 'Usuario'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.role}>{roleLabel.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nombre completo</Text>
              <Text style={styles.infoValue}>{user?.displayName}</Text>
            </View>
            {user?.email && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
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
              <Text style={styles.infoValue}>{roleLabel}</Text>
            </View>
            <View style={[styles.infoItem, styles.lastRow]}>
              <Text style={styles.infoLabel}>Estado</Text>
              <Text style={[styles.statusText, !user?.isEnabled && styles.dangerText]}>
                {user?.isEnabled ? '✓ Activo' : '✗ Inactivo'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUENTA</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} accessibilityRole="button">
              <Text style={styles.actionIcon} accessible={false}>✎</Text>
              <Text style={styles.actionText}>Editar perfil</Text>
              <Text style={styles.chevron} accessible={false}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} accessibilityRole="button">
              <Text style={styles.actionIcon} accessible={false}>⚿</Text>
              <Text style={styles.actionText}>Cambiar contraseña</Text>
              <Text style={styles.chevron} accessible={false}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionRow, styles.lastRow]} onPress={handleLogout} accessibilityRole="button">
              <Text style={[styles.actionIcon, styles.dangerText]} accessible={false}>↪</Text>
              <Text style={[styles.actionText, styles.dangerText]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
