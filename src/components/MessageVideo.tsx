import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Video from 'react-native-video';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { stopAudioPlayback } from '../services/audioPlayback';

export const MessageVideo = ({ uri, name = 'Video adjunto', size, compact = false }: { uri: string; name?: string; size?: number; compact?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  useFocusEffect(useCallback(() => () => setOpen(false), []));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { if (state !== 'active') setOpen(false); });
    return () => subscription.remove();
  }, []);
  return <>
    <TouchableOpacity style={[styles.card, compact && styles.compact]} accessibilityRole="button" accessibilityLabel={`Reproducir ${name}`}
      onPress={() => { void stopAudioPlayback().catch(() => {}); setFailed(false); setBusy(true); setOpen(true); }}>
      <Text style={styles.play}>▶</Text>
      <View style={styles.info}><Text numberOfLines={1} style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{size ? `${(size / 1024 / 1024).toFixed(1)} MB · ` : ''}Ver video</Text></View>
    </TouchableOpacity>
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={styles.screen}>
        <TouchableOpacity accessibilityRole="button" onPress={() => setOpen(false)} style={styles.close}><Text style={styles.white}>Cerrar ✕</Text></TouchableOpacity>
        <Text numberOfLines={2} style={styles.caption}>{name}</Text>
        {open && !failed && <Video source={{ uri }} style={styles.video} controls resizeMode="contain"
          playInBackground={false} playWhenInactive={false} ignoreSilentSwitch="ignore"
          onLoad={() => setBusy(false)} onBuffer={({ isBuffering }) => setBusy(isBuffering)}
          onError={() => { setBusy(false); setFailed(true); }} />}
        {busy && !failed && <ActivityIndicator color="#fff" style={styles.loading} />}
        {failed && <View style={styles.error}><Text style={styles.white}>No se pudo reproducir el video. Revisá la conexión o probá abrirlo con otra aplicación.</Text>
          <TouchableOpacity onPress={() => { setFailed(false); setBusy(true); }} style={styles.close}><Text style={styles.white}>Reintentar</Text></TouchableOpacity>
          {uri.startsWith('https://') && <TouchableOpacity style={styles.close} onPress={() => {
            void Linking.openURL(uri).catch(() => Alert.alert('Video', 'No se pudo abrir el video.'));
          }}><Text style={styles.white}>Abrir video</Text></TouchableOpacity>}
        </View>}
      </SafeAreaView>
    </Modal>
  </>;
};
const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 14, backgroundColor: '#e7eefb', flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 10 },
  compact: { padding: 0, marginVertical: 0, backgroundColor: 'transparent' },
  play: { color: '#3973d1', fontSize: 28 }, info: { flex: 1 }, name: { color: '#202b3b', fontWeight: '700' }, subtitle: { color: '#697386', fontSize: 12, marginTop: 4 },
  screen: { flex: 1, backgroundColor: '#111' }, close: { padding: 18, alignSelf: 'flex-end' }, white: { color: '#fff', fontSize: 16 }, caption: { color: '#fff', paddingHorizontal: 18 },
  video: { flex: 1 }, loading: { position: 'absolute', top: '50%', alignSelf: 'center' }, error: { flex: 1, padding: 24, justifyContent: 'center' },
});
