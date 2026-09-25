import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const MessageImage = ({ uri }: { uri: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  return (
    <View>
      <TouchableOpacity onPress={() => {
        if (failed) { setFailed(false); setLoading(true); setRetry(retry + 1); }
        else setExpanded(true);
      }} accessibilityRole="button" accessibilityLabel={failed ? 'Reintentar cargar imagen' : 'Abrir imagen adjunta'}>
        <Image key={retry} source={{ uri }} style={styles.preview} resizeMode="contain" onLoadEnd={() => setLoading(false)} onError={() => setFailed(true)} />
        {loading && <ActivityIndicator style={styles.indicator} color="#0c6b58" />}
        {failed && <Text>No se pudo cargar la imagen. Tocá para reintentar.</Text>}
      </TouchableOpacity>
      <Modal visible={expanded} onRequestClose={() => setExpanded(false)} animationType="fade">
        <SafeAreaView style={styles.fullscreen}>
          <TouchableOpacity onPress={() => setExpanded(false)} style={styles.close} accessibilityRole="button"><Text style={styles.closeText}>✕ Cerrar</Text></TouchableOpacity>
          <Image source={{ uri }} style={styles.largeImage} resizeMode="contain" />
        </SafeAreaView>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  preview: { width: '100%', height: 200, borderRadius: 12, marginVertical: 10, backgroundColor: '#eee' },
  indicator: { position: 'absolute', alignSelf: 'center', top: 90 },
  fullscreen: { flex: 1, backgroundColor: '#111' },
  close: { padding: 18, alignSelf: 'flex-end' },
  closeText: { color: '#fff', fontSize: 17 },
  largeImage: { flex: 1, width: '100%' },
});
