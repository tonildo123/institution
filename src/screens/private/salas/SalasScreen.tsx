import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { getCursos, SalaLevel } from '@/services/firebase/salas';
import { FamiliasModal } from '@/components/salas/FamiliasModal';
import { styles } from './styles';

const salas: { id: SalaLevel; label: string; color: string }[] = [
  { id: 'inicial', label: 'NIVEL INICIAL', color: '#FF9500' },
  { id: 'primario', label: 'NIVEL PRIMARIO', color: '#25D366' },
  { id: 'secundario', label: 'NIVEL SECUNDARIO', color: '#007AFF' },
];

export const SalasScreen = () => {
  const [expanded, setExpanded] = useState<SalaLevel | null>(null);
  const [target, setTarget] = useState<{ level: SalaLevel; cursoId?: string; label: string } | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Salas</Text>
        <Text style={styles.headerSubtitle}>Seleccioná una sala o curso para agregar alumnos y familias</Text>
      </View>
      <ScrollView>
      <View style={styles.content}>
        {salas.map(sala => (
          <View key={sala.id}>
            <TouchableOpacity style={styles.salaButton} onPress={() => {
              setExpanded(expanded === sala.id ? null : sala.id);
            }}>
              <View style={[styles.colorBox, { backgroundColor: sala.color }]} />
              <Text style={styles.salaLabel}>{sala.label}</Text>
              <Text style={styles.dropdown}>{expanded === sala.id ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {expanded === sala.id && getCursos(sala.id).map(curso => (
              <TouchableOpacity key={curso.id} style={styles.cursoButton} onPress={() => setTarget({ level: sala.id, cursoId: curso.id, label: curso.label })}>
                <Text style={styles.salaLabel}>{curso.label}</Text>
                <Text style={styles.addButton}>+</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      </ScrollView>
      {target && <FamiliasModal {...target} onClose={() => setTarget(null)} />}
    </View>
  );
};
