import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleProp, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { createImageReport, ImageReportTarget } from '@/services/firebase/imageReports';

interface Props {
  target: ImageReportTarget;
  style?: StyleProp<ViewStyle>;
}

// Tres puntitos sobre una imagen. Abre un modal para reportarla a administración.
export const ReportImageButton: React.FC<Props> = ({ target, style }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const close = () => {
    setOpen(false);
    setReason('');
    setError('');
    setSent(false);
  };

  const send = async () => {
    if (!user || sending) return;
    setSending(true);
    setError('');
    try {
      await createImageReport(user, target, reason);
      setSent(true);
    } catch (err) {
      console.error('Error reporting image:', err);
      setError((err as Error).message || 'No se pudo enviar el reporte. Intentá de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Opciones de la imagen"
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={[styles.button, style]}
      >
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.card} onPress={() => {}}>
            {sent ? (
              <>
                <Text style={styles.title}>Gracias por avisarnos</Text>
                <Text style={styles.hint}>La administración revisará la imagen.</Text>
                <TouchableOpacity onPress={close} style={styles.primary}>
                  <Text style={styles.primaryText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>Reportar imagen</Text>
                <Text style={styles.hint}>Se enviará a administración para revisión.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Motivo (opcional)"
                  placeholderTextColor="#8a909c"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  maxLength={500}
                  editable={!sending}
                />
                {!!error && <Text style={styles.error}>{error}</Text>}
                <View style={styles.actions}>
                  <TouchableOpacity onPress={close} style={styles.cancel} disabled={sending}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={send} disabled={sending} style={styles.primary} accessibilityRole="button">
                    {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Reportar</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#1f2430' },
  hint: { fontSize: 14, color: '#5d6472' },
  input: {
    minHeight: 72,
    borderWidth: 1.5,
    borderColor: '#d9dee8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2430',
    textAlignVertical: 'top',
  },
  error: { fontSize: 14, color: '#b42318', padding: 10, backgroundColor: '#fef3f2', borderRadius: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancel: { flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#5d6472' },
  primary: { flex: 1, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#0c6b58' },
  primaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
