import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MessageDocument = ({ name, size, url }: { name: string; size: number; url?: string }) => {
  const [opening, setOpening] = useState(false);
  const open = async () => {
    if (!url || opening) return;
    setOpening(true);
    try {
      if (!url.startsWith('https://')) throw new Error('Dirección del documento inválida.');
      await Linking.openURL(url);
    } catch {
      Alert.alert('Documento', 'No se pudo abrir el archivo. Revisá tu conexión e intentá nuevamente.');
    } finally { setOpening(false); }
  };
  const extension = name.split('.').pop()?.toUpperCase() || 'DOC';
  return (
    <View style={styles.card}>
      <View style={styles.summary}>
        <View style={styles.fileIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={styles.fold} />
          <Text style={styles.extension}>{extension.length <= 4 ? extension : 'DOC'}</Text>
        </View>
        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{size >= 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`}</Text>
        </View>
      </View>
      {url && (
        <TouchableOpacity style={[styles.download, opening && styles.disabled]} disabled={opening}
          onPress={event => { event.stopPropagation(); void open(); }}
          accessibilityRole="button" accessibilityLabel={`Descargar archivo ${name}`}
          accessibilityState={{ disabled: opening, busy: opening }}>
          {opening ? <ActivityIndicator color="#fff" /> : <Text style={styles.downloadIcon}>↓</Text>}
          <Text style={styles.downloadText}>{opening ? 'Abriendo archivo…' : 'Descargar archivo'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  card: { padding: 12, marginVertical: 10, borderRadius: 12, backgroundColor: '#fff3f2', borderWidth: 1, borderColor: '#f3cecc' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fileIcon: { width: 36, height: 44, borderWidth: 1.5, borderColor: '#c92329', borderRadius: 4, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 6, backgroundColor: '#fff' },
  fold: { position: 'absolute', right: 0, top: 0, width: 10, height: 10, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#c92329', backgroundColor: '#ffe1df' },
  extension: { fontSize: 10, fontWeight: '800', color: '#c92329' },
  info: { flex: 1 }, name: { color: '#542123', fontWeight: '600', fontSize: 14 },
  meta: { color: '#806367', fontSize: 12, marginTop: 4 },
  download: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#c92329', borderRadius: 8, minHeight: 44, padding: 10, marginTop: 12 },
  disabled: { opacity: 0.65 },
  downloadIcon: { color: '#fff', fontSize: 22, fontWeight: '700' },
  downloadText: { color: '#fff', fontSize: 14, fontWeight: '700', flexShrink: 1 },
});
