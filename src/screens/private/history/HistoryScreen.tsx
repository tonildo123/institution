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
 * Pantalla de Historial de Comunicaciones - Admin
 * Muestra TODOS los mensajes sin filtrar ni agrupar (como familia)
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

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      inicial: '#FF9500',
      primario: '#25D366',
      secundario: '#007AFF',
      todos: '#FF3B30',
    };
    return colors[level] || '#0c6b58';
  };

  const getLevelIcon = (level: string) => {
    const icons: { [key: string]: string } = {
      inicial: 'I',
      primario: 'P',
      secundario: 'S',
      todos: 'T',
    };
    return icons[level] || '•';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF3B30" />
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
            style={styles.levelRow}
            onPress={() => {
              navigation.navigate('CommunicationDetail' as any, {
                communicationId: item.id,
              });
            }}
          >
            {/* Avatar con icono de nivel */}
            <View
              style={[
                styles.levelAvatar,
                { backgroundColor: getLevelColor(item.level) },
              ]}
            >
              <Text style={styles.levelAvatarText}>{getLevelIcon(item.level)}</Text>
            </View>

            {/* Información del mensaje */}
            <View style={styles.levelInfo}>
              <View style={styles.levelTop}>
                <Text style={styles.levelName}>{item.title}</Text>
                <Text style={styles.levelTime}>
                  {new Date(item.createdAt).toLocaleDateString('es-AR')}
                </Text>
              </View>
              <View style={styles.levelBottom}>
                <Text style={styles.levelPreview} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.levelListContent}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#999' }}>No hay comunicaciones</Text>
          </View>
        }
      />
    </View>
  );
};
