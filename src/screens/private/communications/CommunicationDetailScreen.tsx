import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getCommunication, deleteCommunication, Communication } from '@/services/firebase/communications';
import { styles } from './detailStyles';

/**
 * Pantalla de Detalle de Comunicación
 * Maquetado tipo chat con header rojo
 */

export const CommunicationDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector((state: RootState) => state.auth.user);
  const { communicationId } = route.params as { communicationId: string };

  const [communication, setCommunication] = useState<Communication | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [hasRead, setHasRead] = useState(false);

  useEffect(() => {
    loadCommunication();
  }, [communicationId]);

  const loadCommunication = async () => {
    try {
      setLoading(true);
      const data = await getCommunication(communicationId);
      setCommunication(data);
      setHasRead(true);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (user?.role !== 'admin') return;

    Alert.alert(
      '🗑️ Eliminar Comunicación',
      '¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteCommunication(communicationId);
              Alert.alert('✅ Éxito', 'Comunicación eliminada correctamente');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('❌ Error', error.message || 'Error al eliminar la comunicación');
            } finally {
              setDeleting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#d21f1a" />
      </View>
    );
  }

  if (!communication) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Comunicación no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerAvatar}>
          <View style={styles.avatarBadge}>
            <View style={styles.avatarBars}>
              <View style={[styles.avatarBar, { backgroundColor: '#e63946' }]} />
              <View style={[styles.avatarBar, { backgroundColor: '#f4a300' }]} />
              <View style={[styles.avatarBar, { backgroundColor: '#2a9d5c' }]} />
              <View style={[styles.avatarBar, { backgroundColor: '#2a4d9d' }]} />
            </View>
            <Text style={styles.avatarBadgeText}>IMEP</Text>
          </View>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>KIT IMEP</Text>
          <Text style={styles.headerSub}>Comunicación</Text>
        </View>

        {/* Delete button - solo para admin */}
        {user?.role === 'admin' && (
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            style={{ opacity: deleting ? 0.5 : 1 }}
          >
            <Text style={styles.menuDots}>{deleting ? '⏳' : '🗑️'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chat Content */}
      <ScrollView style={styles.chatArea}>
        {/* Notice Card */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeContent}>{communication.description}</Text>
          <Text style={styles.leerMas}>Leer mas..</Text>
        </View>

        {/* Read Confirmation */}
        {hasRead && (
          <View style={styles.confirmationRow}>
            <View style={styles.confirmationBubble}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.confirmationText}>Confirmación de lectura</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Stats */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          📊 Entregados: {communication.deliveredCount}/{communication.totalUsers}
        </Text>
      </View>
    </View>
  );
};

export default CommunicationDetailScreen;
