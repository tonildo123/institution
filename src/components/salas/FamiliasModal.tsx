import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAllUsers } from '@/services/firebase/users';
import { addUserToSala, getSalaUsers, SalaLevel } from '@/services/firebase/salas';
import { User } from '@/types';
import { styles } from '@/screens/private/salas/styles';

interface Props {
  level: SalaLevel;
  cursoId?: string;
  label: string;
  onClose: () => void;
}

export const FamiliasModal = ({ level, cursoId, label, onClose }: Props) => {
  const [familias, setFamilias] = useState<User[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getAllUsers(), getSalaUsers(level, cursoId)])
      .then(([users, ids]) => {
        if (!active) return;
        setFamilias(users.filter(user => user.role === 'familia'));
        setMembers(ids);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [level, cursoId]);

  const add = async (userId: string) => {
    if (saving) return;
    setSaving(true);
    try {
      await addUserToSala(level, userId, cursoId);
      setMembers(current => [...new Set([...current, userId])]);
      setSearch('');
    } catch {
      Alert.alert('Error', 'No se pudo agregar la familia. Intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const assigned = familias.filter(user => members.includes(user.id));
  const term = search.trim().toLowerCase();
  const results = term ? familias.filter(user => !members.includes(user.id) &&
    [user.displayName, user.email, user.dni].some(value => value?.toLowerCase().includes(term))) : [];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={() => { if (!saving) onClose(); }}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <TouchableOpacity onPress={onClose} disabled={saving} accessibilityLabel="Cerrar">
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {loading ? <ActivityIndicator size="large" /> : error ? (
            <Text style={styles.noResultsText}>No se pudieron cargar las familias. Cerrá y volvé a abrir el curso.</Text>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.usersInSalaTitle}>Agregar alumno/familia registrada</Text>
              <TextInput style={styles.searchInput} placeholder="Buscar por nombre, email o DNI..." placeholderTextColor="#999" value={search} onChangeText={setSearch} editable={!saving} />
              {saving && <ActivityIndicator />}
              {term !== '' && (
                <View>
                  <Text style={styles.searchResultsTitle}>Resultados ({results.length})</Text>
                  {results.length === 0 && <Text style={styles.noResultsText}>No hay resultados</Text>}
                  {results.map(user => (
                    <TouchableOpacity key={user.id} style={styles.userSearchItem} disabled={saving} onPress={() => add(user.id)}>
                      <View style={styles.userSearchInfo}>
                        <Text style={styles.userSearchName}>{user.displayName}</Text>
                        {user.dni && <Text style={styles.userSearchDni}>DNI: {user.dni}</Text>}
                        {user.email && <Text style={styles.userSearchEmail}>{user.email}</Text>}
                      </View>
                      <Text style={styles.addButton}>+</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={styles.usersInSalaTitle}>Familias asignadas ({assigned.length})</Text>
              {assigned.length === 0 && <Text style={styles.noResultsText}>Todavía no hay familias asignadas</Text>}
              <View style={styles.usersList}>
                {assigned.map(user => (
                  <View key={user.id} style={styles.userItem}>
                    <Text style={styles.userName}>{user.displayName}</Text>
                    {user.dni && <Text style={styles.userDni}>DNI: {user.dni}</Text>}
                    {user.email && <Text style={styles.userEmail}>{user.email}</Text>}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};
