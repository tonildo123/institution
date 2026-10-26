import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MensajesTabScreen } from '@/screens/private/messages/MensajesTabScreen';
import { ProfileScreen } from '@/screens/private/profile/ProfileScreen';
import { HistoryScreen } from '@/screens/private/history/HistoryScreen';
import { CommunicationDetailScreen } from '@/screens/private/communications/CommunicationDetailScreen';
import { ClassroomDetailScreen } from '@/screens/private/classroom/ClassroomDetailScreen';
import { UsersManagementScreen } from '@/screens/private/users/UsersManagementScreen';
import { SalasScreen } from '@/screens/private/salas/SalasScreen';
import { TabIcon } from '@/components/TabIcon';
import { ScreenWrapper } from '@/components/ScreenWrapper';

/**
 * App Navigator
 * Pantallas protegidas (requieren autenticación)
 * Diferentes tabs según el rol del usuario
 */

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Mantener el ícono encima del texto en todos los tamaños de pantalla.
const centeredTabOptions: BottomTabNavigationOptions = {
  tabBarLabelPosition: 'below-icon',
  tabBarIconStyle: { width: 24, height: 24 },
  tabBarItemStyle: { justifyContent: 'center', alignItems: 'center' },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    margin: 0,
  },
};

/**
 * History Stack Navigator
 * Contiene HistoryScreen y los detalles de Mensajes y Classroom
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
        children={() => (
          <ScreenWrapper>
            <HistoryScreen />
          </ScreenWrapper>
        )}
      />
      <Stack.Screen
        name="CommunicationDetail"
        children={() => (
          <ScreenWrapper>
            <CommunicationDetailScreen />
          </ScreenWrapper>
        )}
      />
      <Stack.Screen
        name="ClassroomDetail"
        children={() => (
          <ScreenWrapper>
            <ClassroomDetailScreen />
          </ScreenWrapper>
        )}
      />
    </Stack.Navigator>
  );
};

/**
 * Mensajes Stack Navigator
 * Pestaña Mensajes (Mensajes | Classroom) y los detalles de cada uno
 */
const MensajesStackNavigator = ({ type }: { type: 'send' | 'receive' }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MensajesList"
        children={() => <MensajesTabScreen type={type} />}
      />
      <Stack.Screen
        name="CommunicationDetail"
        children={() => (
          <ScreenWrapper>
            <CommunicationDetailScreen />
          </ScreenWrapper>
        )}
      />
      <Stack.Screen
        name="ClassroomDetail"
        children={() => (
          <ScreenWrapper>
            <ClassroomDetailScreen />
          </ScreenWrapper>
        )}
      />
    </Stack.Navigator>
  );
};

// Componentes estables: pasarlos a component= evita que el stack se reinicie en cada render.
const MensajesReceiveStack = () => <MensajesStackNavigator type="receive" />;
const MensajesSendStack = () => <MensajesStackNavigator type="send" />;

/**
 * FAMILIA TABS (2 tabs)
 * - Mensajes (recibe; incluye Classroom)
 * - Perfil
 */
const FamiliaTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        ...centeredTabOptions,
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
      }}
    >
      <Tab.Screen
        name="ComunicacionesRecibidas"
        component={MensajesReceiveStack}
        options={{
          title: 'Mensajes',
          tabBarLabel: 'Mensajes',
          tabBarIcon: ({ color }) => <TabIcon name="mail" color={color} />,
        }}
      />
      <Tab.Screen
        name="PerfilFamilia"
        children={() => (
          <ScreenWrapper>
            <ProfileScreen />
          </ScreenWrapper>
        )}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * ADMIN TABS (5 tabs)
 * - Mensajes (envía; incluye Classroom)
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
        ...centeredTabOptions,
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
        component={MensajesSendStack}
        options={{
          title: 'Mensajes',
          tabBarLabel: 'Mensaje',
          tabBarIcon: ({ color }) => <TabIcon name="mail" color={color} />,
        }}
      />
      <Tab.Screen
        name="Salas"
        children={() => (
          <ScreenWrapper>
            <SalasScreen />
          </ScreenWrapper>
        )}
        options={{
          title: 'Salas',
          tabBarLabel: 'Salas',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tab.Screen
        name="HistorialAdmin"
        component={HistoryStackNavigator}
        options={{
          title: 'Historial',
          tabBarLabel: 'Historial',
          tabBarIcon: ({ color }) => <TabIcon name="clock" color={color} />,
        }}
      />
      <Tab.Screen
        name="UsersManagement"
        children={() => (
          <ScreenWrapper>
            <UsersManagementScreen />
          </ScreenWrapper>
        )}
        options={{
          title: 'Usuarios',
          tabBarLabel: 'Usuarios',
          tabBarIcon: ({ color }) => <TabIcon name="users" color={color} />,
        }}
      />
      <Tab.Screen
        name="PerfilAdmin"
        children={() => (
          <ScreenWrapper>
            <ProfileScreen />
          </ScreenWrapper>
        )}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * PRECEPTOR TABS (3 tabs)
 * - Mensajes (envía; incluye Classroom)
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
        ...centeredTabOptions,
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
        component={MensajesSendStack}
        options={{
          title: 'Mensajes',
          tabBarLabel: 'Mensaje',
          tabBarIcon: ({ color }) => <TabIcon name="mail" color={color} />,
        }}
      />
      <Tab.Screen
        name="HistorialPreceptor"
        component={HistoryStackNavigator}
        options={{
          title: 'Historial',
          tabBarLabel: 'Historial',
          tabBarIcon: ({ color }) => <TabIcon name="clock" color={color} />,
        }}
      />
      <Tab.Screen
        name="PerfilPreceptor"
        children={() => (
          <ScreenWrapper>
            <ProfileScreen />
          </ScreenWrapper>
        )}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} />,
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
      <Stack.Screen name="NotificationDetail">
        {() => <ScreenWrapper><CommunicationDetailScreen /></ScreenWrapper>}
      </Stack.Screen>
      <Stack.Screen name="ClassroomNotificationDetail">
        {() => <ScreenWrapper><ClassroomDetailScreen /></ScreenWrapper>}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
