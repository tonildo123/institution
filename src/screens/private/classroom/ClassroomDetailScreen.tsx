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
import { getClassroom, deleteClassroom, updateClassroom, Classroom } from '@/services/firebase/classroom';
import { ClassroomSubmission, getOwnSubmission, listSubmissions } from '@/services/firebase/classroomSubmissions';
import { SubmissionComposer } from './SubmissionComposer';
import { MessageAttachments } from '@/components/MessageAttachments';
import { BookIcon } from '@/components/BookIcon';
import { classroomStyles, classroomColors } from './classroomStyles';

/**
 * Pantalla de Detalle de publicación de Classroom
 * Encabezado morado y publicación en tarjeta
 */

// Mantener la edición implementada, pero oculta para todos los roles.
const SHOW_EDIT_ACTION = false;

export const ClassroomDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector((state: RootState) => state.auth.user);
  const { classroomId } = route.params as { classroomId: string };

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadClassroom();
    }, [classroomId, user?.id])
  );

  const [mySubmission, setMySubmission] = useState<ClassroomSubmission | null>(null);
  const [submissions, setSubmissions] = useState<ClassroomSubmission[]>([]);

  const loadSubmissions = async (task: Classroom) => {
    if (!user?.id) return;
    const manages = ['admin', 'equipo directivo', 'representante legal'].includes(user.role) || (user.role === 'preceptor' && task.sentBy === user.id);
    try {
      if (user.role === 'familia') setMySubmission(await getOwnSubmission(classroomId, user.id));
      else if (manages) setSubmissions(await listSubmissions(classroomId));
    } catch (error) {
      console.error('❌ Error al cargar entregas:', error);
    }
  };

  const loadClassroom = async () => {
    try {
      setLoading(true);
      setClassroom(null);
      if (!user?.id) return;
      const data = await getClassroom(classroomId, user?.id);
      setClassroom(data);
      if (data) await loadSubmissions(data);
    } catch (error) {
      setClassroom(null);
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if ((user?.role !== 'admin' && user?.role !== 'equipo directivo' && user?.role !== 'representante legal') || !classroom) return;
    setEditTitle(classroom.title);
    setEditDescription(classroom.description);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      Alert.alert('⚠️ Error', 'Título y descripción son requeridos');
      return;
    }

    try {
      setSaving(true);
      await updateClassroom(classroomId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        body: editDescription.trim(),
      });

      // Recargar la comunicación
      const updated = await getClassroom(classroomId, user?.id);
      setClassroom(updated);

      setShowEditModal(false);
      Alert.alert('✅ Éxito', 'Comunicación actualizada correctamente');
    } catch (error: any) {
      Alert.alert('❌ Error', error.message || 'Error al actualizar la comunicación');
    } finally {
      setSaving(false);
    }
  };

  const canDelete = Boolean(user && classroom && (
    ['admin', 'equipo directivo', 'representante legal'].includes(user.role) ||
    (user.role === 'preceptor' && classroom.sentBy === user.id)
  ));

  const handleDelete = () => {
    if (!canDelete) return;

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
              await deleteClassroom(classroomId);
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
      <View style={[classroomStyles.surface, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={classroomColors.primary} />
      </View>
    );
  }

  if (!classroom) {
    return (
      <View style={[classroomStyles.surface, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Comunicación no disponible o sin acceso</Text>
      </View>
    );
  }

  return (
    <View style={classroomStyles.surface}>
      {/* Header */}
      <View style={classroomStyles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Volver">
          <Text style={classroomStyles.detailBack}>←</Text>
        </TouchableOpacity>

        <View style={classroomStyles.detailBadge}>
          <BookIcon color="#fff" />
        </View>

        <View style={classroomStyles.detailHeaderText}>
          <Text style={classroomStyles.detailHeaderTitle}>Classroom</Text>
          <Text style={classroomStyles.detailHeaderSub}>Publicación</Text>
        </View>

        {/* Acciones disponibles según el rol; edición oculta. */}
        {canDelete && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {SHOW_EDIT_ACTION && (
            <TouchableOpacity
              onPress={handleEdit}
              disabled={saving}
              style={{ opacity: saving ? 0.5 : 1 }}
            >
              <Text style={classroomStyles.detailAction}>✏️</Text>
            </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDelete}
              accessibilityRole="button"
              accessibilityLabel="Eliminar publicación"
              disabled={deleting}
              style={{ opacity: deleting ? 0.5 : 1 }}
            >
              <Text style={classroomStyles.detailAction}>{deleting ? '⏳' : '🗑️'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Contenido */}
      <ScrollView style={classroomStyles.surface} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Tarjeta de la publicación */}
        <View style={classroomStyles.detailCard}>
          <MessageText style={classroomStyles.detailTitle}>{classroom.title}</MessageText>
          <Text style={classroomStyles.detailDate}>
            {new Date(classroom.createdAt).toLocaleDateString('es-AR')} · {new Date(classroom.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </Text>
          <MessageText style={classroomStyles.detailText}>{classroom.description || classroom.body}</MessageText>
          {classroom.dueDate && <Text style={classroomStyles.dueChipText}>Entrega hasta: {new Date(classroom.dueDate).toLocaleDateString('es-AR')}</Text>}
          <MessageAttachments data={classroom.data as Record<string, string> | undefined} />
        </View>

        {user?.role === 'familia' && (
          mySubmission ? (
            <View style={classroomStyles.detailCard}>
              <Text style={classroomStyles.pill}>Tu entrega</Text>
              <Text style={classroomStyles.detailDate}>Enviada el {new Date(mySubmission.createdAt).toLocaleDateString('es-AR')}</Text>
              {Boolean(mySubmission.body) && <MessageText style={classroomStyles.detailText}>{mySubmission.body}</MessageText>}
              <MessageAttachments data={mySubmission.data} />
            </View>
          ) : classroom.dueDate && Date.now() > Date.parse(classroom.dueDate) ? (
            <Text style={[classroomStyles.hint, { marginHorizontal: 16, marginTop: 16 }]}>El plazo para entregar esta tarea venció.</Text>
          ) : (
            <View style={classroomStyles.detailCard}>
              <SubmissionComposer taskId={classroomId} onSubmitted={() => { void loadClassroom(); }} />
            </View>
          )
        )}

        {submissions.length > 0 || (user?.role !== 'familia' && classroom.maxSubmissions !== undefined) ? (
          <View style={{ marginTop: 16 }}>
            <Text style={[classroomStyles.sectionLabel]}>ENTREGAS: {submissions.length} DE {classroom.maxSubmissions ?? submissions.length}</Text>
            {submissions.map(item => (
              <View key={item.id} style={classroomStyles.detailCard}>
                <Text style={classroomStyles.detailTitle}>{item.studentName}</Text>
                <Text style={classroomStyles.detailDate}>{new Date(item.createdAt).toLocaleDateString('es-AR')} · {new Date(item.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
                {Boolean(item.body) && <MessageText style={classroomStyles.detailText}>{item.body}</MessageText>}
                <MessageAttachments data={item.data} />
              </View>
            ))}
          </View>
        ) : null}
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

export default ClassroomDetailScreen;
