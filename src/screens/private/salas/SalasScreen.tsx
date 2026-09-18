import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getAllUsers } from '@/services/firebase/users';
import { getSalaUsers, addUserToSala, SalaLevel } from '@/services/firebase/salas';
import { User } from '@/types';
import { styles } from './styles';

export const SalasScreen = ({ navigation }: any) => {
  const [selectedSala, setSelectedSala] = useState<SalaLevel | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [salaUsers, setSalaUsers] = useState<string[]>([]);
  const [familiaUsers, setFamiliaUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [salaUserDetails, setSalaUserDetails] = useState<User[]>([]);

  const salas = [
    {
      id: 'inicial',
      label: 'NIVEL INICIAL',
      color: '#FF9500',
    },
    {
      id: 'primario',
      label: 'NIVEL PRIMARIO',
      color: '#25D366',
    },
    {
      id: 'secundario',
      label: 'NIVEL SECUNDARIO',
      color: '#007AFF',
    },
  ];

  // Cargar usuarios familia al montar el componente
  useEffect(() => {
    loadFamiliaUsers();
  }, []);

  const loadFamiliaUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      const familia = allUsers.filter((u) => u.role === 'familia');
      setFamiliaUsers(familia);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadSalaUsers = async (level: SalaLevel) => {
    try {
      const userIds = await getSalaUsers(level);
      setSalaUsers(userIds);

      // Obtener detalles de los usuarios
      const details = familiaUsers.filter((u) => userIds.includes(u.id));
      setSalaUserDetails(details);
    } catch (error) {
      console.error('Error loading sala users:', error);
    }
  };

  const handleSalaPress = async (salaId: SalaLevel) => {
    setSelectedSala(salaId);
    await loadSalaUsers(salaId);
    setShowModal(true);
    setSearchText('');
    setFilteredUsers([]);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);

    if (text.trim() === '') {
      setFilteredUsers([]);
      return;
    }

    const searchLower = text.toLowerCase();
    const filtered = familiaUsers.filter((user) => {
      const inSala = salaUsers.includes(user.id);
      if (inSala) return false; // No mostrar si ya está en la sala

      return (
        user.displayName.toLowerCase().includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.dni && user.dni.includes(searchLower))
      );
    });

    setFilteredUsers(filtered);
  };

  const handleAddUser = async (userId: string) => {
    if (!selectedSala) return;

    try {
      setLoading(true);
      await addUserToSala(selectedSala, userId);
      Alert.alert('Éxito', 'Usuario agregado a la sala');

      // Recargar usuarios de la sala
      await loadSalaUsers(selectedSala);
      setSearchText('');
      setFilteredUsers([]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo agregar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const getSalaLabel = (id: SalaLevel) => {
    return salas.find((s) => s.id === id)?.label || '';
  };

  const getSalaColor = (id: SalaLevel) => {
    return salas.find((s) => s.id === id)?.color || '#999';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {salas.map((sala) => (
          <View key={sala.id}>
            <TouchableOpacity
              style={styles.salaButton}
              onPress={() => handleSalaPress(sala.id as SalaLevel)}
            >
              <View
                style={[
                  styles.colorBox,
                  { backgroundColor: sala.color },
                ]}
              />
              <Text style={styles.salaLabel}>{sala.label}</Text>
              <Text style={styles.dropdown}>▼</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modal para agregar usuarios */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Agregar a {selectedSala ? getSalaLabel(selectedSala as SalaLevel) : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Búsqueda */}
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, email o DNI..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearch}
              editable={!loading}
            />

            {/* Usuarios en la sala */}
            {salaUserDetails.length > 0 && (
              <View style={styles.usersInSalaContainer}>
                <Text style={styles.usersInSalaTitle}>
                  Usuarios en sala ({salaUserDetails.length})
                </Text>
                <View style={styles.usersList}>
                  {salaUserDetails.map((user) => (
                    <View key={user.id} style={styles.userItem}>
                      <Text style={styles.userName}>{user.displayName}</Text>
                      {user.email && (
                        <Text style={styles.userEmail}>{user.email}</Text>
                      )}
                      {user.dni && (
                        <Text style={styles.userDni}>DNI: {user.dni}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Resultados de búsqueda */}
            {searchText.trim() !== '' && (
              <View style={styles.searchResultsContainer}>
                <Text style={styles.searchResultsTitle}>
                  Resultados ({filteredUsers.length})
                </Text>
                {loading ? (
                  <ActivityIndicator size="large" color="#007AFF" />
                ) : filteredUsers.length === 0 ? (
                  <Text style={styles.noResultsText}>No hay resultados</Text>
                ) : (
                  <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.userSearchItem}
                        onPress={() => handleAddUser(item.id)}
                      >
                        <View style={styles.userSearchInfo}>
                          <Text style={styles.userSearchName}>
                            {item.displayName}
                          </Text>
                          {item.email && (
                            <Text style={styles.userSearchEmail}>
                              {item.email}
                            </Text>
                          )}
                          {item.dni && (
                            <Text style={styles.userSearchDni}>
                              DNI: {item.dni}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.addButton}>+</Text>
                      </TouchableOpacity>
                    )}
                    scrollEnabled={false}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
