import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AttachmentSheet } from '@/components/AttachmentSheet';
import { DraftAttachments } from '@/components/DraftAttachments';
import { BookIcon } from '@/components/BookIcon';
import { waitForSheetDismiss } from '@/utils/attachmentPicker';
import { normalizeMessageLink } from '@/utils/messageLinks';
import { pickMessageImage, captureMessageImage, MessageImage } from '@/services/messageImages';
import { pickMessageDocument, documentMessageData, MessageDocumentFile } from '@/services/messageDocuments';
import { pickMessageAudio, audioMessageData, MessageAudioFile } from '@/services/messageAudio';
import { pickMessageVideo, videoMessageData, MessageVideoFile } from '@/services/messageVideo';
import { LinkPreview, linkPreviewData } from '@/services/linkPreview';
import { MAX_DOCUMENT_SIZE } from '@/services/documentTypes';
import {
  submitClassroomTask, uploadSubmissionFile, validateSubmissionAudio, validateSubmissionVideo,
} from '@/services/firebase/classroomSubmissions';
import { MAX_VIDEO_SIZE } from '@/services/messageVideo';
import { MAX_AUDIO_SIZE } from '@/services/audioTypes';
import { classroomStyles, classroomColors } from './classroomStyles';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Entrega de un alumno: una respuesta y sus adjuntos, con los mismos selectores de Mensajes.
 * Los archivos se suben a su carpeta; la función valida plazo, cupo y pertenencia.
 */
export const SubmissionComposer = ({ taskId, onSubmitted }: { taskId: string; onSubmitted: () => void }) => {
  const [body, setBody] = useState('');
  const [image, setImage] = useState<MessageImage | null>(null);
  const [cameraPhoto, setCameraPhoto] = useState<MessageImage | null>(null);
  const [document, setDocument] = useState<MessageDocumentFile | null>(null);
  const [audio, setAudio] = useState<MessageAudioFile | null>(null);
  const [video, setVideo] = useState<MessageVideoFile | null>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);

  const pick = async (action: () => Promise<void>) => {
    if (picking || busy) return;
    setShowAttachments(false);
    setPicking(true);
    try {
      await waitForSheetDismiss();
      await action();
    } catch (error: any) {
      Alert.alert('Adjuntar', error.message || 'No se pudo seleccionar el archivo.');
    } finally { setPicking(false); }
  };

  const submit = async () => {
    if (busy) return;
    const text = body.trim();
    const hasFile = Boolean(image || cameraPhoto || document || audio || video || linkUrl);
    if (!text && !hasFile) { Alert.alert('Entrega', 'Escribí una respuesta o adjuntá un archivo.'); return; }
    setBusy(true);
    try {
      const data: Record<string, string> = {};
      if (image) {
        const { url, file } = await uploadSubmissionFile(image, taskId, MAX_IMAGE_SIZE);
        Object.assign(data, { imageUrl: url, imagePath: file.path });
      }
      if (cameraPhoto) {
        const { url, file } = await uploadSubmissionFile(cameraPhoto, taskId, MAX_IMAGE_SIZE);
        Object.assign(data, { photoUrl: url, photoPath: file.path });
      }
      if (document) {
        const { url, file } = await uploadSubmissionFile(document, taskId, MAX_DOCUMENT_SIZE);
        Object.assign(data, documentMessageData(file as MessageDocumentFile, url));
      }
      if (audio) {
        validateSubmissionAudio(audio);
        const { url, file } = await uploadSubmissionFile(audio, taskId, MAX_AUDIO_SIZE);
        Object.assign(data, audioMessageData(file as MessageAudioFile, url));
      }
      if (video) {
        validateSubmissionVideo(video);
        const { url, file } = await uploadSubmissionFile(video, taskId, MAX_VIDEO_SIZE);
        Object.assign(data, videoMessageData(file as MessageVideoFile, url));
      }
      if (linkUrl) {
        Object.assign(data, { linkUrl: normalizeMessageLink(linkUrl), ...linkPreviewData(linkPreview?.url === linkUrl ? linkPreview : null) });
      }
      await submitClassroomTask(taskId, text, data);
      setBody('');
      setImage(null); setCameraPhoto(null); setDocument(null); setAudio(null); setVideo(null);
      setLinkUrl(null); setLinkPreview(null);
      Alert.alert('Entrega enviada', 'Tu tarea quedó registrada.');
      onSubmitted();
    } catch (error: any) {
      Alert.alert('No se pudo entregar', error.message || 'Intentá nuevamente.');
    } finally { setBusy(false); }
  };

  const items = [
    ...(image ? [{ id: image.path, name: 'Imagen adjunta', detail: image.contentType.replace('image/', '').toUpperCase(), imageUri: image.uri,
      onRemove: () => setImage(null) }] : []),
    ...(cameraPhoto ? [{ id: cameraPhoto.path, name: 'Foto de cámara', detail: cameraPhoto.contentType.replace('image/', '').toUpperCase(), imageUri: cameraPhoto.uri,
      onRemove: () => setCameraPhoto(null) }] : []),
    ...(document ? [{ id: document.path, name: document.name, detail: `${Math.ceil(document.size / 1024)} KB`, onRemove: () => setDocument(null) }] : []),
    ...(audio ? [{ id: audio.path, name: audio.durationMs ? 'Nota de voz' : audio.name, detail: `${Math.ceil(audio.size / 1024)} KB`,
      audioUri: audio.uri, durationMs: audio.durationMs, onRemove: () => setAudio(null) }] : []),
    ...(video ? [{ id: video.path, name: video.name, detail: 'Video', videoUri: video.uri, size: video.size, onRemove: () => setVideo(null) }] : []),
    ...(linkUrl ? [{ id: 'link', name: linkPreview?.title || 'Enlace', detail: linkUrl, kind: 'enlace' as const,
      imageUri: linkPreview?.imageUrl || undefined, onRemove: () => { setLinkUrl(null); setLinkPreview(null); } }] : []),
  ];

  return (
    <View style={{ marginHorizontal: 16, marginTop: 8 }}>
      <Text style={classroomStyles.pill}>Tu entrega</Text>
      <TextInput
        accessibilityLabel="Respuesta de la tarea"
        style={[classroomStyles.inputBox, classroomStyles.contentBox]}
        value={body}
        onChangeText={setBody}
        placeholder="Escribí tu respuesta..."
        placeholderTextColor="#8a86a8"
        multiline
        maxLength={4000}
        editable={!busy}
      />
      <DraftAttachments disabled={busy || picking} items={items} />
      <View style={classroomStyles.toolRow}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Adjuntar archivo" disabled={busy || picking}
          style={classroomStyles.toolButton} onPress={() => setShowAttachments(true)}>
          <Text style={classroomStyles.toolIcon}>+</Text>
        </TouchableOpacity>
        {picking && <ActivityIndicator color={classroomColors.primary} />}
      </View>

      {showAttachments && <AttachmentSheet
        onClose={() => setShowAttachments(false)}
        onGallery={() => pick(async () => { const p = await pickMessageImage(); if (p) setImage(p); })}
        onCamera={() => pick(async () => { const p = await captureMessageImage(); if (p) setCameraPhoto(p); })}
        onDocument={() => pick(async () => { const p = await pickMessageDocument(); if (p) setDocument(p); })}
        onPickAudio={() => pick(async () => { const p = await pickMessageAudio(); if (p) setAudio(p); })}
        onAudio={file => { setAudio(file); setShowAttachments(false); }}
        onVideo={() => pick(async () => { const p = await pickMessageVideo(); if (p) setVideo(p); })}
        onLink={(url, preview) => { setLinkUrl(url); setLinkPreview(preview); setShowAttachments(false); }}
      />}

      <TouchableOpacity
        accessibilityRole="button"
        style={[classroomStyles.publishButton, (busy || picking) && classroomStyles.disabled, { marginTop: 16 }]}
        onPress={submit}
        disabled={busy || picking}
      >
        <BookIcon color="#fff" />
        <Text style={classroomStyles.publishButtonText}>{busy ? 'Enviando entrega...' : 'Entregar tarea'}</Text>
      </TouchableOpacity>
    </View>
  );
};
