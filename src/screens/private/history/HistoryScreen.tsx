import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllCommunications, Communication } from '@/services/firebase/communications';
import { styles } from './styles';

/**
 * Pantalla de Historial de Comunicaciones
 * Carga mensajes reales desde Firestore
 */

export const HistoryScreen = () => {
  const navigation = useNavigation();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllCommunications();
      setCommunications(data);
      console.log('✅ Comunicaciones cargadas:', data.length);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError('Error al cargar comunicaciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={communications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.communicationItem}
            onPress={() => {
              navigation.navigate('CommunicationDetail' as any, {
                communicationId: item.id,
              });
            }}
          >
            <Text style={styles.communicationTitle}>{item.title}</Text>
            <Text style={styles.communicationDate}>
              {new Date(item.createdAt).toLocaleDateString('es-AR')}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#999' }}>No hay comunicaciones</Text>
          </View>
        }
      />
    </View>
  );
};
