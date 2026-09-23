import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const term = search.trim().toLocaleLowerCase();
  const filteredCommunications = communications.filter(item =>
    [item.title, item.description].some(value => value?.toLocaleLowerCase().includes(term)),
  );

  // Recargar cuando la screen obtiene el foco (después de volver del detalle)
  useFocusEffect(
    React.useCallback(() => {
      loadCommunications();
    }, [])
  );

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <TouchableOpacity
          style={styles.searchButton}
          accessibilityRole="button"
          accessibilityLabel={showSearch ? 'Cerrar búsqueda' : 'Buscar en historial'}
          onPress={() => {
            setShowSearch(!showSearch);
            setSearch('');
          }}
        >
          {showSearch ? <Text style={styles.closeSearch}>×</Text> : (
            <View style={styles.searchIcon} accessible={false}>
              <View style={styles.searchCircle} />
              <View style={styles.searchHandle} />
            </View>
          )}
        </TouchableOpacity>
      </View>
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por título o mensaje"
            placeholderTextColor="#949BA5"
            accessibilityLabel="Buscar por título o mensaje"
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0c6b58" />
        </View>
      ) : <FlatList
        keyboardShouldPersistTaps="handled"
        data={filteredCommunications}
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
            <Text style={{ color: '#999' }}>{term ? 'No se encontraron comunicaciones' : 'No hay comunicaciones'}</Text>
          </View>
        }
      />}
    </View>
  );
};
