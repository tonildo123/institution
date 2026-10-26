import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export interface SourceOption<T extends string> { id: T; label: string }

/** Selector superior "Mensajes | Classroom" compartido por Mensajes e Historial. */
export function SourceTabs<T extends string>({ options, selected, onSelect }: {
  options: SourceOption<T>[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map(option => {
        const active = option.id === selected;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.tab, active && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onSelect(option.id)}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: '#0c6b58', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: { flex: 1, minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: '#fff', borderColor: '#fff' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  tabTextActive: { color: '#0c6b58' },
});
