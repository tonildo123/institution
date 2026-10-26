import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export interface SourceOption<T extends string> {
  id: T;
  label: string;
  /** Icono opcional; recibe si la opción está activa para cambiar de color. */
  icon?: (active: boolean) => React.ReactNode;
}

/** Selector superior "Mensajes | Classroom" compartido por Mensajes e Historial. */
export function SourceTabs<T extends string>({ options, selected, onSelect, backgroundColor = '#0c6b58' }: {
  options: SourceOption<T>[];
  selected: T;
  onSelect: (id: T) => void;
  backgroundColor?: string;
}) {
  return (
    <View style={[styles.row, { backgroundColor }]} accessibilityRole="tablist">
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
            <View style={styles.content}>
              {option.icon?.(active)}
              <Text style={[styles.tabText, active && { color: backgroundColor }]}>{option.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: { flex: 1, minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: '#fff', borderColor: '#fff' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
