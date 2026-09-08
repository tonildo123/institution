import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screens/public/auth/login/LoginScreen';

/**
 * Auth Navigator
 * Pantallas públicas (sin autenticación requerida)
 */

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Iniciar Sesión',
        }}
      />

      {/*
        Proximamente:
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      */}
    </Stack.Navigator>
  );
};
