import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { styles } from './styles';

/**
 * Pantalla de Historial de Comunicaciones
 */

interface HistoryItem {
  id: string;
  title: string;
  recipient: string;
  date: string;
  status: 'enviado' | 'leído' | 'pendiente';
  description: string;
}

export const HistoryScreen = () => {
  const [history] = useState<HistoryItem[]>([
    {
      id: '1',
      title: 'Aviso: Reunión de padres',
      recipient: 'Familias de 5to A',
      date: '13 sep, 10:30',
      status: 'leído',
      description: 'Se realizará el viernes a las 18:00',
    },
    {
      id: '2',
      title: 'Tareas de Matemática',
      recipient: '5to A',
      date: '12 sep, 14:15',
      status: 'leído',
      description: 'Ejercicios del capítulo 5 - Entrega mañana',
    },
    {
      id: '3',
      title: 'Actividad cultural',
      recipient: 'Todos',
      date: '11 sep, 09:00',
      status: 'leído',
      description: 'Se realizará próxima semana',
    },
    {
      id: '4',
      title: 'Comunicado importante',
      recipient: 'Familias',
      date: '10 sep, 16:45',
      status: 'pendiente',
      description: 'Cambio de horario del colegio',
    },
    {
      id: '5',
      title: 'Recuperatorio de prueba',
      recipient: '5to A',
      date: '09 sep, 11:20',
      status: 'leído',
      description: 'Será el próximo jueves',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'leído':
        return '#25D366';
      case 'enviado':
        return '#007AFF';
      case 'pendiente':
        return '#FF9500';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'leído':
        return '✓✓ Leído';
      case 'enviado':
        return '✓ Enviado';
      case 'pendiente':
        return '⏱ Pendiente';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.historyItem}>
            <View style={styles.itemHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemRecipient}>{item.recipient}</Text>
              </View>
              <Text style={styles.itemDate}>{item.date}</Text>
            </View>

            <Text style={styles.itemDescription}>{item.description}</Text>

            <View style={styles.itemFooter}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusLabel,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {getStatusLabel(item.status)}
                </Text>
              </View>
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Ver detalles →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

