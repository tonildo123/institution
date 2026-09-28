import React, { useCallback, useEffect, useSyncExternalStore } from 'react';
import { ActivityIndicator, Alert, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { audioPlaybackSnapshot, subscribeAudioPlayback, toggleAudioPlayback, stopAudioPlayback } from '../services/audioPlayback';
import { formatAudioTime } from '../services/audioTypes';

export const MessageAudio = ({ uri, name, durationMs = 0, compact = false }: { uri: string; name: string; durationMs?: number; compact?: boolean }) => {
  const state = useSyncExternalStore(subscribeAudioPlayback, audioPlaybackSnapshot);
  const active = state.uri === uri;
  const playing = active && state.playing;
  const position = active ? state.position : 0;
  const duration = active && state.duration > 0 ? state.duration : durationMs;
  useFocusEffect(useCallback(() => () => { void stopAudioPlayback(uri).catch(() => {}); }, [uri]));
  useEffect(() => {
    const listener = AppState.addEventListener('change', next => {
      if (next !== 'active') void stopAudioPlayback(uri).catch(() => {});
    });
    return () => listener.remove();
  }, [uri]);
  const toggle = async () => {
    try {
      if (!/^(https:\/\/|file:\/\/|\/)/.test(uri)) throw new Error('Audio inválido');
      await toggleAudioPlayback(uri);
    } catch { Alert.alert('Audio', 'No se pudo reproducir el audio. Revisá tu conexión y volvé a intentarlo.'); }
  };
  return (
    <View style={[styles.card, compact && styles.compact]}>
      <TouchableOpacity style={styles.play} disabled={state.busy} accessibilityRole="button"
        accessibilityLabel={`${playing ? 'Pausar' : 'Reproducir'} ${name}`} accessibilityState={{ disabled: state.busy }}
        onPress={event => { event.stopPropagation(); void toggle(); }}>
        {state.busy && active ? <ActivityIndicator color="#fff" /> : <Text style={styles.playText}>{playing ? 'Ⅱ' : '▶'}</Text>}
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.track}><View style={[styles.progress, { width: `${duration > 0 ? Math.min(100, position / duration * 100) : 0}%` }]} /></View>
        <Text style={styles.time}>{formatAudioTime(position)}{duration > 0 ? ` / ${formatAudioTime(duration)}` : ''}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  compact: { backgroundColor: 'transparent', marginVertical: 0, padding: 0 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#efe7fc', borderRadius: 14, padding: 12, gap: 12, marginVertical: 10 },
  play: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6424c7', justifyContent: 'center', alignItems: 'center' },
  playText: { color: '#fff', fontSize: 18, fontWeight: '700' }, info: { flex: 1 },
  name: { color: '#302044', fontSize: 14, fontWeight: '600' },
  track: { height: 4, borderRadius: 2, backgroundColor: '#d6c2f5', marginVertical: 8, overflow: 'hidden' },
  progress: { height: 4, backgroundColor: '#6424c7' }, time: { color: '#746386', fontSize: 12 },
});
