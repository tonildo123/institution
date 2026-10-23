import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type { User } from '@/types';
import { canManageReports, pickReportImage, createProblemReport, watchProblemReports, watchReportComments, changeReportStatus, commentOnReport, reportStatuses } from '@/services/firebase/problemReports';
import type { ProblemReport, ReportComment, ReportStatus } from '@/services/firebase/problemReports';
import type { MessageImage } from '@/services/messageImages';
import { styles } from './styles';

export const ProblemReportsModal = ({ user, onClose }: { user: User; onClose: () => void }) => {
  const manager = canManageReports(user.role);
  const [creating, setCreating] = useState(false);
  const [image, setImage] = useState<MessageImage | null>(null);
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = reports.find(item => item.id === selectedId);
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    setLoading(true); setError('');
    return watchProblemReports(user, items => { setReports(items); setLoading(false); }, () => { setError('No se pudieron cargar los reportes.'); setLoading(false); });
  }, [user.id, user.role, retry]);
  useEffect(() => {
    setComments([]); setComment('');
    if (!selectedId) return;
    return watchReportComments(selectedId, setComments, () => setError('No se pudieron cargar los comentarios.'));
  }, [selectedId, manager, retry]);
  const run = async (action: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    try { await action(); } catch (failure: any) { Alert.alert('Reportes', failure.message || 'No se pudo guardar. Intentá nuevamente.'); }
    finally { setBusy(false); }
  };
  const button = (label: string, action: () => void, disabled = false) => <TouchableOpacity accessibilityRole="button" style={[styles.saveButton, (busy || disabled) && { opacity: 0.5 }]} disabled={busy || disabled} onPress={action}><Text style={styles.saveText}>{label}</Text></TouchableOpacity>;
  return <Modal visible animationType="slide" onRequestClose={() => { if (!busy) onClose(); }}>
    <SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView style={{ flex: 1, padding: 20 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalHeader}><Text style={styles.modalTitle}>{manager ? 'Reportes de problemas' : 'Reportar problema'}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar reportes" disabled={busy} onPress={onClose}><Text style={styles.chevron}>✕</Text></TouchableOpacity></View>
        <ScrollView keyboardShouldPersistTaps="handled">
          {error ? <><Text accessibilityRole="alert" style={styles.dangerText}>{error}</Text>{button('Reintentar', () => { setError(''); setRetry(value => value + 1); })}</> : null}
          {!manager && creating ? <>
            {button('Volver a mis reportes', () => setCreating(false))}
            <Text style={styles.helpText}>Describí el problema. Podrás consultar el estado y las respuestas en Mis reportes. Administración y equipo directivo gestionarán tu reporte. No incluyas contraseñas.</Text>
            <Text style={styles.infoLabel}>Título</Text><TextInput accessibilityLabel="Título del problema" style={styles.input} value={title} onChangeText={setTitle} maxLength={120} editable={!busy} />
            <Text style={styles.infoLabel}>Descripción</Text><TextInput accessibilityLabel="Descripción del problema" style={[styles.input, { minHeight: 130, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} maxLength={4000} multiline editable={!busy} />
            {image && <Image source={{ uri: image.uri }} accessibilityLabel="Imagen seleccionada" style={{ width: '100%', height: 220 }} resizeMode="contain" />}
            {button(image ? 'Cambiar imagen' : 'Adjuntar imagen (opcional)', () => { void run(async () => { const picked = await pickReportImage(); if (picked) setImage(picked); }); })}
            {image && button('Quitar imagen', () => setImage(null))}
            {button(busy ? 'Enviando...' : 'Enviar reporte', () => { void run(async () => { await createProblemReport(user, title, description, image); setTitle(''); setDescription(''); setImage(null); setCreating(false); Alert.alert('Reporte enviado', 'Podés seguir su estado en Mis reportes.'); }); }, !title.trim() || !description.trim())}
          </> : selected ? <>
            {button('Volver a la lista', () => setSelectedId(null))}
            <Text style={styles.name}>{selected.title}</Text><Text style={styles.helpText}>{selected.reporterName} · {selected.reporterRole}</Text>
            <Text selectable style={styles.infoValue}>{selected.description}</Text>
            <Text style={[styles.infoLabel, { marginTop: 20 }]}>Estado: {reportStatuses[selected.status]}</Text>
            {selected.imageURL && <Image source={{ uri: selected.imageURL }} accessibilityLabel="Imagen del problema" style={{ width: '100%', height: 300 }} resizeMode="contain" />}
            {manager && (Object.keys(reportStatuses) as ReportStatus[]).map(status => <View key={status}>{button(reportStatuses[status], () => { void run(() => changeReportStatus(selected.id, status)); }, status === selected.status)}</View>)}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>COMENTARIOS</Text>
            {comments.map(item => <View key={item.id} style={styles.infoItem}><Text style={styles.infoLabel}>{item.authorName}</Text><Text selectable style={styles.infoValue}>{item.body}</Text></View>)}
            {manager && <>
            <Text style={styles.helpText}>El comentario será visible para quien reportó el problema.</Text>
            <TextInput accessibilityLabel="Comentario del reporte" style={styles.input} value={comment} onChangeText={setComment} maxLength={2000} multiline editable={!busy} placeholder="Agregar comentario" placeholderTextColor="#666" />
            {button(busy ? 'Guardando...' : 'Comentar', () => { void run(async () => { await commentOnReport(selected.id, user, comment); setComment(''); }); }, !comment.trim())}
            </>}
          </> : <>
            {!manager && <><Text style={styles.sectionTitle}>MIS REPORTES</Text>{button('Reportar un nuevo problema', () => setCreating(true))}</>}
            {loading && <Text style={styles.helpText}>Cargando reportes...</Text>}
            {!loading && !error && !reports.length && <Text style={styles.helpText}>Todavía no hay reportes.</Text>}
            {reports.map(item => <TouchableOpacity accessibilityRole="button" key={item.id} style={styles.infoItem} onPress={() => setSelectedId(item.id)}><Text style={styles.infoValue}>{item.title}</Text><Text style={styles.helpText}>{item.reporterName} · {reportStatuses[item.status]}</Text></TouchableOpacity>)}
          </>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView></SafeAreaProvider>
  </Modal>;
};
