import { MessageAudio } from './MessageAudio';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AttachmentIcon } from './AttachmentIcon';

export interface DraftAttachment {
  id: string;
  name: string;
  detail: string;
  imageUri?: string;
  kind?: 'enlace';
  audioUri?: string;
  durationMs?: number;
  onRemove: () => void;
}

export const DraftAttachments = ({ items, disabled }: { items: DraftAttachment[]; disabled: boolean }) => {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>ARCHIVOS ADJUNTOS ({items.length})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}>
        {items.map(item => (
          <View key={item.id} style={styles.card}>
            {item.audioUri ? (
              <View style={styles.audioInfo}><MessageAudio compact uri={item.audioUri} name={item.name} durationMs={item.durationMs} /></View>
            ) : <>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.thumbnail} resizeMode="cover" accessibilityLabel={item.name} />
            ) : (
              <View style={[styles.documentIcon, item.kind === 'enlace' && styles.linkIcon]}><AttachmentIcon name={item.kind || "documento"} /></View>
            )}
            <View style={styles.info}>
              <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.detail}>{item.detail}</Text>
            </View>
            </>}
            <TouchableOpacity onPress={item.onRemove} disabled={disabled} hitSlop={10}
              accessibilityRole="button" accessibilityLabel={`Quitar ${item.name}`}
              accessibilityState={{ disabled }} style={[styles.remove, disabled && styles.disabled]}>
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  audioInfo: { flex: 1 },
  section: { marginTop: 12, marginBottom: 12 },
  heading: { color: '#8f9098', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 12 },
  card: { width: 200, minHeight: 80, borderRadius: 16, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  linkIcon: { backgroundColor: '#e2ebfc' },
  documentIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#fce4e3', alignItems: 'center', justifyContent: 'center' },
  thumbnail: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#ded6ca' },
  info: { flex: 1 },
  name: { color: '#202b3b', fontSize: 14, fontWeight: '700' },
  detail: { color: '#8f9098', fontSize: 12, marginTop: 3 },
  remove: { position: 'absolute', top: -5, right: -5, width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#fff', backgroundColor: '#252525', alignItems: 'center', justifyContent: 'center' },
  removeText: { color: '#fff', fontSize: 20, lineHeight: 21, fontWeight: '600' },
  disabled: { opacity: 0.45 },
});
