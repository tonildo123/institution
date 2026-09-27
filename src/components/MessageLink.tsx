import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AttachmentIcon } from './AttachmentIcon';
import { normalizeMessageLink } from '../utils/messageLinks';

export const MessageLink = ({ url }: { url: string }) => {
  const [opening, setOpening] = useState(false);
  const open = async () => {
    if (opening) return;
    setOpening(true);
    try { await Linking.openURL(normalizeMessageLink(url)); }
    catch { Alert.alert('Enlace', 'No se pudo abrir el enlace. Revisá la dirección e intentá nuevamente.'); }
    finally { setOpening(false); }
  };
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <AttachmentIcon name="enlace" />
        <Text style={styles.url} numberOfLines={2}>{url}</Text>
      </View>
      <TouchableOpacity style={styles.button} disabled={opening} accessibilityRole="link"
        accessibilityLabel={`Abrir enlace ${url}`} accessibilityState={{ disabled: opening, busy: opening }}
        onPress={event => { event.stopPropagation(); void open(); }}>
        {opening && <ActivityIndicator color="#fff" />}
        <Text style={styles.label}>{opening ? 'Abriendo…' : 'Abrir enlace'}</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  card: { backgroundColor: '#edf3ff', padding: 12, borderRadius: 12, marginVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  url: { flex: 1, color: '#295ba2', fontSize: 14 },
  button: { backgroundColor: '#3973d1', borderRadius: 8, minHeight: 44, padding: 12, marginTop: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' },
  label: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
