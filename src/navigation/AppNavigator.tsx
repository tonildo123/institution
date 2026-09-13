import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import DashboardScreen from '@/screens/private/dashboard/DashboardScreen';
import { CommunicationsScreen } from '@/screens/private/communications/CommunicationsScreen';
import { ProfileScreen } from '@/screens/private/profile/ProfileScreen';
import { HistoryScreen } from '@/screens/private/history/HistoryScreen';
import { UsersManagementScreen } from '@/screens/private/users/UsersManagementScreen';

/**
 * App Navigator
 * Pantallas protegidas (requieren autenticación)
 * Diferentes tabs según el rol del usuario
 */

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * FAMILIA TABS (2 tabs)
 * - Comunicaciones (recibe)
 * - Perfil
 */
const FamiliaTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#25D366',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
      }}
    >
      <Tab.Screen
        name="ComunicacionesRecibidas"
        component={() => <CommunicationsScreen type="receive" />}
        options={{
          title: 'Comunicaciones',
          tabBarLabel: '💬 Comunicaciones',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="PerfilFamilia"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarLabel: '👤 Perfil',
          tabBarIcon: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * ADMIN TABS (3 tabs)
 * - Comunicaciones (envía)
 * - Historial
 * - CRUD de Usuarios
 */
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF3B30',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
      }}
    >
      <Tab.Screen
        name="ComunicacionesAdmin"
        component={() => <CommunicationsScreen type="send" />}
        options={{
          title: 'Comunicaciones',
          tabBarLabel: '📤 Enviar',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="HistorialAdmin"
        component={HistoryScreen}
        options={{
          title: 'Historial',
          tabBarLabel: '📜 Historial',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="UsersManagement"
        component={UsersManagementScreen}
        options={{
          title: 'Usuarios',
          tabBarLabel: '👥 Usuarios',
          tabBarIcon: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * PRECEPTOR TABS (3 tabs)
 * - Comunicaciones (envía)
 * - Historial
 * - Perfil
 */
const PreceptorTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
      }}
    >
      <Tab.Screen
        name="ComunicacionesPreceptor"
        component={() => <CommunicationsScreen type="send" />}
        options={{
          title: 'Comunicaciones',
          tabBarLabel: '📤 Enviar',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="HistorialPreceptor"
        component={HistoryScreen}
        options={{
          title: 'Historial',
          tabBarLabel: '📜 Historial',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="PerfilPreceptor"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarLabel: '👤 Perfil',
          tabBarIcon: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * App Navigator Principal
 * Elige el TabNavigator según el rol del usuario
 */
export const AppNavigator = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;

  // Determinar qué TabNavigator mostrar según el rol
  let TabComponent;

  switch (role) {
    case 'familia':
      TabComponent = FamiliaTabNavigator;
      break;
    case 'admin':
      TabComponent = AdminTabNavigator;
      break;
    case 'preceptor':
      TabComponent = PreceptorTabNavigator;
      break;
    default:
      TabComponent = FamiliaTabNavigator;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        animationEnabled: true,
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainApp"
        component={TabComponent}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
