import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const categories = [
  { label: 'Caritas', emojis: '😀 😃 😄 😁 😆 😅 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😋 😛 🤗 🤭 🤔 😎 🥳 😴 😢 😭 😮 😡 😷'.split(' ') },
  { label: 'Personas', emojis: '👋 🤚 ✋ 🖐️ 👌 ✌️ 🤞 🤟 👍 👎 👏 🙌 👐 🤝 🙏 💪 👶 🧒 👦 👧 🧑 👨 👩 👴 👵 👩‍🏫 👨‍🏫 🧑‍🎓 👨‍👩‍👧 👨‍👩‍👧‍👦'.split(' ') },
  { label: 'Símbolos', emojis: '❤️ 🧡 💛 💚 💙 💜 💕 💖 ⭐ 🌟 ✨ 🎉 🎊 🎈 🎂 🎁 🌈 ☀️ 🌸 🏫 📚 📖 📝 ✏️ 📅 📌 📢 🔔 ✅ ❌ ⚠️ 💯'.split(' ') },
];

export const EmojiPicker = ({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) => {
  const [category, setCategory] = useState(0);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar emojis" />
        <View style={[styles.panel, { paddingBottom: Math.max(16, insets.bottom), paddingLeft: Math.max(12, insets.left), paddingRight: Math.max(12, insets.right) }]}>
          <View style={styles.heading}>
            <Text style={styles.title}>Emojis</Text>
            <TouchableOpacity onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Cerrar emojis"><Text style={styles.title}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.tabs}>
            {categories.map((item, index) => <TouchableOpacity key={item.label} style={[styles.tab, category === index && styles.active]} onPress={() => setCategory(index)} accessibilityRole="tab" accessibilityState={{ selected: category === index }}><Text style={styles.label}>{item.label}</Text></TouchableOpacity>)}
          </View>
          <ScrollView><View style={styles.grid}>
            {categories[category].emojis.map(emoji => <TouchableOpacity key={emoji} style={styles.emojiButton} onPress={() => onSelect(emoji)} accessibilityRole="button" accessibilityLabel={`Insertar ${emoji}`}><Text style={styles.emoji}>{emoji}</Text></TouchableOpacity>)}
          </View></ScrollView>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  backdrop: { flex: 1 },
  panel: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '55%' },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 12 },
  title: { fontSize: 18, fontWeight: '600', color: '#0c6b58' },
  close: { padding: 16 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  active: { backgroundColor: '#DDEFE8' },
  label: { color: '#0c6b58', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  emojiButton: { width: '16.66%', minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28 },
});
