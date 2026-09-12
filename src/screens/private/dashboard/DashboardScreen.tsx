import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAuth } from '@/hooks/useAuth';
import styles from './styles';

/**
 * DashboardScreen
 *
 * Pantalla de bienvenida personalizada según el rol del usuario
 * - Admin: Panel de administración
 * - Familia: Información del estudiante
 * - Preceptor: Información del grupo
 */

const DashboardScreen = ({ navigation }: any) => {
  // Obtener usuario del Redux
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout } = useAuth();

  // Manejo de logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // Mensaje de bienvenida personalizado por rol
  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'admin':
        return '¡Bienvenido Administrador! 👨‍💼';
      case 'familia':
        return '¡Bienvenido Padre/Tutor! 👨‍👩‍👧';
      case 'preceptor':
        return '¡Bienvenido Docente! 👨‍🏫';
      default:
        return '¡Bienvenido!';
    }
  };

  // Descripción según el rol
  const getDescription = () => {
    switch (user?.role) {
      case 'admin':
        return 'Panel de administración del Instituto. Gestiona usuarios, configuración y reportes.';
      case 'familia':
        return 'Panel de familia. Consulta información académica de tu hijo/a y comunicaciones.';
      case 'preceptor':
        return 'Panel de preceptor. Gestiona tu grupo de estudiantes y comunicaciones.';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header de Bienvenida */}
      <View style={styles.header}>
        <Text style={styles.welcomeTitle}>{getWelcomeMessage()}</Text>
        <Text style={styles.userName}>{user?.displayName}</Text>
        <Text style={styles.userRole}>
          {user?.role === 'admin'
            ? 'Administrador'
            : user?.role === 'familia'
            ? 'Familia'
            : 'Preceptor'}
        </Text>
      </View>

      {/* Descripción */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{getDescription()}</Text>
      </View>

      {/* Contenido según el rol */}
      <View style={styles.contentContainer}>
        {user?.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Panel de Administración</Text>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>📊 Gestionar Usuarios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>⚙️ Configuración</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>📈 Reportes</Text>
            </TouchableOpacity>
          </View>
        )}

        {user?.role === 'familia' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Académica</Text>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>📚 Calificaciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>📅 Horarios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>💬 Mensajes</Text>
            </TouchableOpacity>
          </View>
        )}

        {user?.role === 'preceptor' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mi Grupo</Text>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>👥 Estudiantes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>📋 Calificaciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>💬 Comunicaciones</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Botón de logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DashboardScreen;
