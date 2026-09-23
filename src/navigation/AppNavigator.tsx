import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { CommunicationsScreen } from '@/screens/private/communications/CommunicationsScreen';
import { ProfileScreen } from '@/screens/private/profile/ProfileScreen';
import { HistoryScreen } from '@/screens/private/history/HistoryScreen';
import { CommunicationDetailScreen } from '@/screens/private/communications/CommunicationDetailScreen';
import { UsersManagementScreen } from '@/screens/private/users/UsersManagementScreen';
import { SalasScreen } from '@/screens/private/salas/SalasScreen';
import { ScreenWrapper } from '@/components/ScreenWrapper';

/**
 * App Navigator
 * Pantallas protegidas (requieren autenticación)
 * Diferentes tabs según el rol del usuario
 */

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * History Stack Navigator
 * Contiene HistoryScreen y CommunicationDetailScreen
 */
const HistoryStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="HistoryList"
        component={() => (
          <ScreenWrapper>
            <HistoryScreen />
          </ScreenWrapper>
        )}
      />
      <Stack.Screen
        name="CommunicationDetail"
        component={() => (
          <ScreenWrapper>
            <CommunicationDetailScreen />
          </ScreenWrapper>
        )}
      />
    </Stack.Navigator>
  );
};

/**
 * Communications Stack Navigator
 * Para Familia: contiene CommunicationsScreen (receive) y CommunicationDetailScreen
 */
const CommunicationsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="CommunicationsList"
        component={() => (
          <ScreenWrapper>
            <CommunicationsScreen type="receive" />
          </ScreenWrapper>
        )}
      />
      <Stack.Screen
        name="CommunicationDetail"
        component={() => (
          <ScreenWrapper>
            <CommunicationDetailScreen />
          </ScreenWrapper>
        )}
      />
    </Stack.Navigator>
  );
};

/**
 * FAMILIA TABS (2 tabs)
 * - Mensajes (recibe)
 * - Perfil
 */
const FamiliaTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0c6b58',
        tabBarInactiveTintColor: '#9a9a9a',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e2e2e2',
          height: 65 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
          paddingBottom: 0,
        },
      }}
    >
      <Tab.Screen
        name="ComunicacionesRecibidas"
        component={CommunicationsStackNavigator}
        options={{
          title: 'Mensajes',
          tabBarLabel: '💬 Mensajes',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="PerfilFamilia"
        component={() => (
          <ScreenWrapper>
            <ProfileScreen />
          </ScreenWrapper>
        )}
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
 * ADMIN TABS (4 tabs)
 * - Comunicaciones (envía)
 * - Salas
 * - Historial
 * - Usuarios
 * - Perfil
 */
const AdminTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
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
          height: 65 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
        },
      }}
      initialRouteName="HistorialAdmin"
    >
      <Tab.Screen
        name="ComunicacionesAdmin"
        component={() => (
          <ScreenWrapper>
            <CommunicationsScreen type="send" />
          </ScreenWrapper>
        )}
        options={{
          title: 'Comunicaciones',
          tabBarLabel: '📤 Enviar',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Salas"
        component={() => (
          <ScreenWrapper>
            <SalasScreen />
          </ScreenWrapper>
        )}
        options={{
          title: 'Salas',
          tabBarLabel: '🏫 Salas',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="HistorialAdmin"
        component={HistoryStackNavigator}
        options={{
          title: 'Historial',
          tabBarLabel: '📜 Historial',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="UsersManagement"
        component={() => (
          <ScreenWrapper>
            <UsersManagementScreen />
          </ScreenWrapper>
        )}
        options={{
          title: 'Usuarios',
          tabBarLabel: '👥 Usuarios',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="PerfilAdmin"
        component={() => (
          <ScreenWrapper>
            <ProfileScreen />
          </ScreenWrapper>
        )}
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
 * PRECEPTOR TABS (3 tabs)
 * - Comunicaciones (envía)
 * - Historial
 * - Perfil
 */
const PreceptorTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
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
          height: 65 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
        },
      }}
      initialRouteName="HistorialPreceptor"
    >
      <Tab.Screen
        name="ComunicacionesPreceptor"
        component={() => (
          <ScreenWrapper>
            <CommunicationsScreen type="send" />
          </ScreenWrapper>
        )}
        options={{
          title: 'Comunicaciones',
          tabBarLabel: '📤 Enviar',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="HistorialPreceptor"
        component={HistoryStackNavigator}
        options={{
          title: 'Historial',
          tabBarLabel: '📜 Historial',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="PerfilPreceptor"
        component={() => (
          <ScreenWrapper>
            <ProfileScreen />
          </ScreenWrapper>
        )}
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
    case 'equipo directivo':
    case 'representante legal':
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
