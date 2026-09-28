import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createSound, AudioEncoderAndroidType, OutputFormatAndroidType } from 'react-native-nitro-sound';
import { recordedMessageAudio, MessageAudioFile } from '../services/messageAudio';
import { MAX_RECORDING_MS, formatAudioTime } from '../services/audioTypes';
import { stopAudioPlayback } from '../services/audioPlayback';
import { MessageAudio } from './MessageAudio';

type Session = { sound: ReturnType<typeof createSound>; alive: boolean; recording: boolean; pending: Promise<void> };
export const AudioAttachmentComposer = ({ onAttach, onPick }: { onAttach: (file: MessageAudioFile) => void; onPick: () => void }) => {
  const session = useRef<Session | null>(null);
  const duration = useRef(0);
  const stopping = useRef(false);
  const stopRef = useRef<() => void>(() => {});
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [file, setFile] = useState<MessageAudioFile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const current: Session = { sound: createSound(), alive: true, recording: false, pending: Promise.resolve() };
    session.current = current;
    current.sound.setSubscriptionDuration(0.25);
    current.sound.addRecordBackListener(event => {
      if (!current.alive || !current.recording) return;
      if (event.currentPosition > 0) {
        duration.current = event.currentPosition;
        setElapsed(event.currentPosition);
      }
      if (event.currentPosition >= MAX_RECORDING_MS || event.isRecording === false) stopRef.current();
    });
    const listener = AppState.addEventListener('change', next => {
      if (next !== 'active' && current.recording) stopRef.current();
    });
    return () => {
      current.alive = false;
      listener.remove();
      current.sound.removeRecordBackListener();
      void current.pending.finally(async () => {
        try { if (current.recording) await current.sound.stopRecorder(); }
        catch {} finally { current.sound.dispose(); }
      });
    };
  }, []);

  const run = (action: (current: Session) => Promise<void>) => {
    const current = session.current;
    if (!current) return;
    setBusy(true);
    setError('');
    current.pending = current.pending.then(async () => {
      if (current.alive) await action(current);
    }).catch(err => {
      if (current.alive) {
        const message = err instanceof Error ? err.message : 'No se pudo grabar el audio.';
        setError(/permission|microphone access/i.test(message)
          ? 'Permití el acceso al micrófono en Ajustes para grabar una nota de voz.' : message);
      }
    }).finally(() => { if (current.alive) setBusy(false); });
  };
  const start = () => run(async current => {
    if (current.recording) return;
    if (Platform.OS === 'android') {
      const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (permission !== PermissionsAndroid.RESULTS.GRANTED) throw new Error('Permití el acceso al micrófono en Ajustes para grabar una nota de voz.');
    }
    if (!current.alive || AppState.currentState !== 'active') return;
    await stopAudioPlayback();
    duration.current = 0;
    stopping.current = false;
    setElapsed(0);
    setFile(null);
    await current.sound.startRecorder(undefined, {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
      AVFormatIDKeyIOS: 'aac', AVNumberOfChannelsKeyIOS: 1,
      AudioChannels: 1, AudioSamplingRate: 44100, AudioEncodingBitRate: 64000,
    });
    current.recording = true;
    if (current.alive) {
      setRecording(true);
      if (AppState.currentState !== 'active') stopRef.current();
    }
  });
  const stop = () => {
    if (stopping.current || !session.current?.recording) return;
    stopping.current = true;
    run(async current => {
      try {
        const uri = await current.sound.stopRecorder();
        current.recording = false;
        const audio = await recordedMessageAudio(uri, duration.current);
        if (current.alive) setFile(audio);
      } finally {
        stopping.current = false;
        if (current.alive) setRecording(current.recording);
      }
    });
  };
  stopRef.current = stop;

  return (
    <View>
      <Text style={styles.hint}>Nota de voz de hasta 5 minutos o archivo MP3, M4A, AAC o WAV de hasta 20 MB.</Text>
      {(recording || elapsed > 0) && <Text style={styles.timer}>{recording ? '● Grabando ' : ''}{formatAudioTime(elapsed)}</Text>}
      {busy && <ActivityIndicator color="#6424c7" />}
      {Boolean(error) && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
      {file && <MessageAudio uri={file.uri} name="Nota de voz" durationMs={file.durationMs} />}
      <TouchableOpacity style={styles.primary} disabled={busy} onPress={recording ? stop : start} accessibilityRole="button">
        <Text style={styles.primaryText}>{recording ? 'Detener grabación' : file ? 'Grabar de nuevo' : 'Grabar nota de voz'}</Text>
      </TouchableOpacity>
      {file && !recording && <TouchableOpacity style={styles.primary} disabled={busy} onPress={() => onAttach(file)} accessibilityRole="button">
        <Text style={styles.primaryText}>Adjuntar nota de voz</Text>
      </TouchableOpacity>}
      {!recording && <TouchableOpacity style={styles.secondary} disabled={busy} onPress={onPick} accessibilityRole="button">
        <Text style={styles.secondaryText}>Elegir archivo de audio</Text>
      </TouchableOpacity>}
    </View>
  );
};
const styles = StyleSheet.create({
  hint: { color: '#777', fontSize: 13, lineHeight: 19, marginBottom: 12 },
  timer: { color: '#6424c7', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  error: { color: '#b42323', marginVertical: 8 },
  primary: { backgroundColor: '#6424c7', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondary: { padding: 14, alignItems: 'center' }, secondaryText: { color: '#6424c7', fontWeight: '700' },
});
