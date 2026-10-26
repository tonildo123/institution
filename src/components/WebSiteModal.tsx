import React from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { WEB_BASE_URL } from '@/config/links';

/**
 * Solo se abren páginas públicas del sitio. El panel de administración (/admin) queda bloqueado
 * dentro de la app, aunque se intente llegar por un enlace.
 */
export function isAllowedWebUrl(url: string): boolean {
  if (!url.startsWith(WEB_BASE_URL)) return false;
  const path = url.slice(WEB_BASE_URL.length);
  // Evita dominios que solo empiezan igual, como institucion-59d9a.web.app.evil.com.
  if (path !== '' && !path.startsWith('/')) return false;
  return !/^\/admin(?:[/?#]|$)/.test(path);
}

export const WebSiteModal = ({ visible, path, title, onClose }: { visible: boolean; path: string; title: string; onClose: () => void }) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar sitio web">
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>
      <WebView
        source={{ uri: `${WEB_BASE_URL}${path}` }}
        originWhitelist={[WEB_BASE_URL]}
        onShouldStartLoadWithRequest={request => isAllowedWebUrl(request.url)}
        startInLoadingState
        renderLoading={() => <ActivityIndicator style={styles.loading} color="#0c6b58" />}
      />
    </SafeAreaView>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e3ebe8' },
  title: { fontSize: 16, fontWeight: '700', color: '#1d2a33', flex: 1, marginRight: 12 },
  close: { fontSize: 20, color: '#5b6b73', paddingHorizontal: 4 },
  loading: { position: 'absolute', top: '50%', alignSelf: 'center' },
});
