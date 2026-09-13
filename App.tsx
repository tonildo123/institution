/**
 * Institución App
 * React Native + Firebase + Redux + Navigation
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import RootNavigator from '@/navigation/RootNavigator';
import { NotificationProvider } from '@/components/NotificationProvider';

/**
 * App Principal
 *
 * Estructura:
 * 1. Provider (Redux)
 * 2. SafeAreaProvider (React Native Safe Area)
 * 3. RootNavigator (Navegación con lógica de autenticación)
 * 4. NotificationProvider (Manejo de notificaciones FCM)
 */

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <NotificationProvider>
          <RootNavigator />
        </NotificationProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
