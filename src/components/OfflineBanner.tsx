import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Aviso fijo cuando el teléfono no tiene conexión. Se oculta solo al recuperarla. */
export const OfflineBanner = () => {
  const [offline, setOffline] = useState(false);
  useEffect(() => NetInfo.addEventListener(state => {
    setOffline(state.isConnected === false || state.isInternetReachable === false);
  }), []);
  if (!offline) return null;
  return (
    <SafeAreaView edges={['top']} style={styles.banner}>
      <View accessibilityRole="alert" style={styles.content}>
        <Text style={styles.text}>Sin conexión. Verificá tu conexión para cargar y enviar.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  banner: { backgroundColor: '#b42318' },
  content: { paddingHorizontal: 16, paddingVertical: 8 },
  text: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
