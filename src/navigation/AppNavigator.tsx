import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import DashboardScreen from '@/screens/private/dashboard/DashboardScreen';

/**
 * App Navigator
 * Pantallas protegidas (requieren autenticación)
 */

export type AppStackParamList = {
  MainApp: undefined;
  Profile: { userId: string };
  Settings: undefined;
  Post: { postId: string };
  Search: { query: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

// Pantalla temporal Profile
const ProfileScreen = ({ route }: any) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Perfil 👤</Text>
    <Text style={{ marginTop: 10 }}>Usuario ID: {route.params?.userId}</Text>
  </View>
);

// Pantalla temporal Settings
const SettingsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Configuración ⚙️</Text>
  </View>
);

/**
 * Tab Navigator
 * Barra de navegación inferior
 */
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * App Stack Navigator
 * Incluye el TabNavigator y pantallas adicionales
 */
export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        animationEnabled: true,
      }}
    >
      {/* Tab Navigator (Home, Settings) */}
      <Stack.Screen
        name="MainApp"
        component={TabNavigator}
        options={{
          headerShown: false,
          title: 'Inicio',
        }}
      />

      {/* Pantallas adicionales sin tab */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ route }: any) => ({
          title: `Perfil`,
          headerShown: true,
        })}
      />

      {/*
        Proximamente:
        <Stack.Screen name="Post" component={PostScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
      */}
    </Stack.Navigator>
  );
};
