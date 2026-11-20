import React from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';

// Ícono y nombre de la app sobre blanco. Es la continuación del splash nativo
// (LaunchScreen en iOS, AppTheme.Launch en Android): mismo fondo, tamaño y posición,
// así no se nota el paso del splash nativo a la app mientras se recupera la sesión.
const LOGO_SIZE = 256;

export const AppSplash: React.FC = () => (
  <View style={styles.container} accessibilityLabel="KIT IMEP">
    <StatusBar barStyle="dark-content" />
    <Image source={require('../../assets/images/splash_logo.png')} style={styles.logo} resizeMode="contain" />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
});
