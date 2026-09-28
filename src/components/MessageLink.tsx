import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { normalizeMessageLink } from '../utils/messageLinks';
import { linkDomain, LinkPreview } from '../services/linkPreview';

export const MessageLink = ({ url, preview }: { url: string; preview?: Partial<LinkPreview> | null }) => {
  const [opening, setOpening] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [preview?.imageUrl]);
  const open = async () => {
    if (opening) return;
    setOpening(true);
    try { await Linking.openURL(normalizeMessageLink(url)); }
    catch { Alert.alert('Enlace', 'No se pudo abrir el enlace. Revisá la dirección e intentá nuevamente.'); }
    finally { setOpening(false); }
  };
  const hasPreview = Boolean(preview?.title || preview?.description || preview?.imageUrl);
  return (
    <TouchableOpacity style={styles.card} disabled={opening} accessibilityRole="link"
      accessibilityLabel={`Abrir enlace ${preview?.title || url}`} accessibilityState={{ disabled: opening, busy: opening }}
      onPress={event => { event.stopPropagation(); void open(); }}>
      {preview?.imageUrl?.startsWith('https://') && !imageFailed && (
        <Image source={{ uri: preview.imageUrl }} style={styles.image} resizeMode="cover"
          accessibilityLabel={preview.title || 'Vista previa del enlace'} onError={() => setImageFailed(true)} />
      )}
      <View style={styles.info}>
        {Boolean(preview?.title) && <Text style={styles.title} numberOfLines={3}>{preview?.title}</Text>}
        {Boolean(preview?.description) && <Text style={styles.description} numberOfLines={3}>{preview?.description}</Text>}
        <Text style={styles.domain} numberOfLines={1}>↗ {linkDomain(url)}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.url} numberOfLines={2}>{url}</Text>
        <View style={styles.action}>
          {opening && <ActivityIndicator color="#0c6b58" size="small" />}
          <Text style={styles.label}>{opening ? 'Abriendo…' : hasPreview ? 'Abrir enlace ↗' : 'Abrir enlace'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  card: { backgroundColor: '#e8f3ed', borderRadius: 14, marginVertical: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#d1e5da' },
  image: { width: '100%', aspectRatio: 1.91, backgroundColor: '#f2f2f2' },
  info: { padding: 14, gap: 8 },
  title: { color: '#183d32', fontWeight: '700', fontSize: 16, lineHeight: 22 },
  description: { color: '#5b746a', fontSize: 14, lineHeight: 20 },
  domain: { color: '#527468', fontSize: 12, marginTop: 2 },
  footer: { padding: 14, borderTopWidth: 1, borderTopColor: '#d1e5da', backgroundColor: '#f3faf6' },
  url: { color: '#167254', fontSize: 13, textDecorationLine: 'underline' },
  action: { minHeight: 32, marginTop: 6, flexDirection: 'row', gap: 8, alignItems: 'center' },
  label: { color: '#0c6b58', fontWeight: '700', fontSize: 13 },
});
