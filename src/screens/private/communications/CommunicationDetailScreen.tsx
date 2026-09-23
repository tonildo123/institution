import { MessageText } from '@/components/MessageText';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getCommunication, deleteCommunication, updateCommunication, Communication } from '@/services/firebase/communications';
import { styles } from './detailStyles';

/**
 * Pantalla de Detalle de Comunicación
 * Maquetado tipo chat con header verde
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadCommunication();
    }, [communicationId])
  );

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

  const handleEdit = () => {
    if ((user?.role !== 'admin' && user?.role !== 'equipo directivo' && user?.role !== 'representante legal') || !communication) return;
    setEditTitle(communication.title);
    setEditDescription(communication.description);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      Alert.alert('⚠️ Error', 'Título y descripción son requeridos');
      return;
    }

    try {
      setSaving(true);
      await updateCommunication(communicationId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        body: editDescription.trim(),
      });

      // Recargar la comunicación
      const updated = await getCommunication(communicationId);
      setCommunication(updated);

      setShowEditModal(false);
      Alert.alert('✅ Éxito', 'Comunicación actualizada correctamente');
    } catch (error: any) {
      Alert.alert('❌ Error', error.message || 'Error al actualizar la comunicación');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (user?.role !== 'admin' && user?.role !== 'equipo directivo' && user?.role !== 'representante legal') return;

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

        {/* Edit & Delete buttons - solo para admin */}
        {(user?.role === 'admin' || user?.role === 'equipo directivo' || user?.role === 'representante legal') && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={handleEdit}
              disabled={saving}
              style={{ opacity: saving ? 0.5 : 1 }}
            >
              <Text style={styles.menuDots}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              style={{ opacity: deleting ? 0.5 : 1 }}
            >
              <Text style={styles.menuDots}>{deleting ? '⏳' : '🗑️'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Chat Content */}
      <ScrollView style={styles.chatArea}>
        {/* Notice Card */}
        <View style={styles.noticeCard}>
          <MessageText style={styles.noticeContent}>{communication.description}</MessageText>
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

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !saving && setShowEditModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>✏️ Editar Comunicación</Text>
              <TouchableOpacity onPress={() => !saving && setShowEditModal(false)}>
                <Text style={{ fontSize: 24 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Título */}
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Título</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
              }}
              placeholder="Título del mensaje"
              value={editTitle}
              onChangeText={setEditTitle}
              maxLength={100}
              editable={!saving}
            />

            {/* Descripción */}
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Descripción</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                fontSize: 16,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              placeholder="Contenido del mensaje"
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              maxLength={1000}
              editable={!saving}
            />

            {/* Botones */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => !saving && setShowEditModal(false)}
                disabled={saving}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#666' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: saving ? '#ccc' : '#FF3B30',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                  {saving ? '⏳ Guardando...' : '💾 Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CommunicationDetailScreen;
