import { AttachmentIcon, AttachmentIconName } from './AttachmentIcon';
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const options: { title: string; description: string; icon: AttachmentIconName; color: string; background: string }[] = [
  { title: 'Documento', description: 'PDF, Word, Excel', icon: 'documento', color: '#C92329', background: '#FCE4E3' },
  { title: 'Galería', description: 'Fotos y videos', icon: 'galeria', color: '#F3A52B', background: '#FDF0DC' },
  { title: 'Cámara', description: 'Foto o video', icon: 'camara', color: '#31AB58', background: '#E0F1E5' },
  { title: 'Audio', description: 'Nota de voz o MP3', icon: 'audio', color: '#6424C7', background: '#EFE7FC' },
  { title: 'Enlace', description: 'Instagram, web', icon: 'enlace', color: '#3973D1', background: '#E2EBFC' },
];

export const AttachmentSheet = ({ onClose, onGallery }: { onClose: () => void; onGallery: () => void }) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar adjuntos" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16), paddingLeft: Math.max(insets.left, 16), paddingRight: Math.max(insets.right, 16) }]} accessibilityViewIsModal>
          <View style={styles.handle} />
          <Text style={styles.title}>Adjuntar archivo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
            {options.map(option => (
              <TouchableOpacity key={option.title} style={styles.option} disabled={option.icon !== 'galeria'} onPress={onGallery} accessibilityRole="button" accessibilityLabel={option.title}>
                <View style={[styles.iconBox, { backgroundColor: option.background }]}>
                  <AttachmentIcon name={option.icon} />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.description}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.cancel} onPress={onClose} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  backdrop: { flex: 1 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '75%' },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#DFDEDB', alignSelf: 'center', marginTop: 10, marginBottom: 18 },
  title: { fontSize: 23, fontWeight: '700', color: '#202B3B', marginBottom: 22, marginLeft: 4 },
  options: { flexGrow: 1, justifyContent: 'space-between', gap: 8 },
  option: { width: 76, alignItems: 'center' },
  iconBox: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  optionTitle: { fontSize: 12, fontWeight: '700', color: '#202B3B', textAlign: 'center' },
  description: { fontSize: 11, lineHeight: 16, color: '#8D8D95', textAlign: 'center', marginTop: 3 },
  cancel: { padding: 18, marginTop: 12, alignItems: 'center' },
  cancelText: { fontSize: 18, fontWeight: '700', color: '#8D8D95' },
});
