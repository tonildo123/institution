import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MessageVideo } from './MessageVideo';
import { MessageAudio } from './MessageAudio';
import { MessageLink } from './MessageLink';
import { MessageDocument } from './MessageDocument';
import { MessageImage } from './MessageImage';

type AttachmentData = Record<string, string | undefined>;

/**
 * Marcador que no carga el archivo hasta que la persona lo pide.
 * Así abrir un mensaje no consume datos ni lecturas de Firebase.
 */
export const LazyMedia = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const [shown, setShown] = useState(false);
  if (shown) return <>{children}</>;
  return (
    <TouchableOpacity style={styles.placeholder} accessibilityRole="button" accessibilityLabel={`Mostrar ${label}`} onPress={() => setShown(true)}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.action}>Toca para mostrar</Text>
    </TouchableOpacity>
  );
};

/** Adjuntos de un mensaje, entrega o publicación. Ninguno se carga sin que se pida. */
export const MessageAttachments = ({ data }: { data?: AttachmentData }) => (
  <>
    {data?.videoUrl && <LazyMedia label="Video"><MessageVideo uri={data.videoUrl} name={data.videoName} size={Number(data.videoSize) || undefined} /></LazyMedia>}
    {data?.audioUrl && <LazyMedia label="Audio"><MessageAudio uri={data.audioUrl} name={data.audioName || 'Audio adjunto'} durationMs={Number(data.audioDurationMs) || 0} /></LazyMedia>}
    {data?.linkUrl && <LazyMedia label="Enlace"><MessageLink url={data.linkUrl} preview={{ title: data.linkTitle, description: data.linkDescription, imageUrl: data.linkImageUrl }} /></LazyMedia>}
    {data?.documentUrl && <LazyMedia label="Documento"><MessageDocument name={data.documentName || 'Documento adjunto'} size={Number(data.documentSize) || 0} url={data.documentUrl} /></LazyMedia>}
    {data?.imageUrl && <LazyMedia label="Imagen"><MessageImage key={data.imageUrl} uri={data.imageUrl} /></LazyMedia>}
    {data?.photoUrl && <LazyMedia label="Foto"><MessageImage key={data.photoUrl} uri={data.photoUrl} /></LazyMedia>}
  </>
);

const styles = StyleSheet.create({
  placeholder: { padding: 14, borderRadius: 12, backgroundColor: '#f1f3f7', marginVertical: 8, borderWidth: 1, borderColor: '#e0e4ec' },
  label: { fontSize: 14, fontWeight: '700', color: '#3a3f4b' },
  action: { fontSize: 12, color: '#5b6474', marginTop: 4 },
});
