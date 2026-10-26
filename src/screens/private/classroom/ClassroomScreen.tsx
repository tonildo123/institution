import { cursoDisplayLabel } from '@/utils/cursoDisplayLabel';
import { classroomLoadError } from '@/services/firebase/classroom';
import { pickMessageVideo, uploadMessageVideo, videoMessageData, MessageVideoFile } from '@/services/messageVideo';
import { LinkPreview, linkPreviewData } from '@/services/linkPreview';
import { pickMessageAudio, uploadMessageAudio, audioMessageData, MessageAudioFile } from '@/services/messageAudio';
import { stopAudioPlayback } from '@/services/audioPlayback';
import { normalizeMessageLink } from '@/utils/messageLinks';
import { pickMessageDocument, uploadMessageDocument, documentMessageData, MessageDocumentFile } from '@/services/messageDocuments';
import { getDestinationLabel } from '@/utils/communicationAudience';
import { DraftAttachments } from '@/components/DraftAttachments';
import { pickMessageImage, captureMessageImage, uploadMessageImage, MessageImage } from '@/services/messageImages';
import { AttachmentSheet } from '@/components/AttachmentSheet';
import { EmojiPicker } from '@/components/EmojiPicker';
import { BoldMessageInput, BoldMessageInputHandle } from '@/components/BoldMessageInput';
import { MessageText } from '@/components/MessageText';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootState } from '@/redux/store';
import { store } from '@/redux/store';
import { sendClassroomToAll, sendClassroomToUsers } from '@/services/classroomService';
import { Classroom } from '@/services/firebase/classroom';
import { getTeacherCursos, TeacherCurso, getSalaUsers, getDestinatarios, SalaLevel } from '@/services/firebase/salas';
import { FamiliasModal } from '@/components/salas/FamiliasModal';
import { styles } from './styles';

/**
 * Pantalla de Comunicaciones - Estilo Chat
 * Para Admin y Preceptor: Interfaz tipo chat para enviar
 * Para Familia: Mostrar lista de comunicaciones recibidas
 */

interface ClassroomScreenProps {
  type: 'send' | 'receive';
}

export const ClassroomScreen: React.FC<ClassroomScreenProps> = ({
  type,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const messageInputRef = useRef<BoldMessageInputHandle>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [video, setVideo] = useState<MessageVideoFile | null>(null);
  const uploadedVideoRef = useRef<{ path: string; url: string } | null>(null);
  const [audio, setAudio] = useState<MessageAudioFile | null>(null);
  const uploadedAudioRef = useRef<{ path: string; url: string } | null>(null);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [document, setDocument] = useState<MessageDocumentFile | null>(null);
  const uploadedDocumentRef = useRef<{ path: string; url: string } | null>(null);
  const [attachment, setAttachment] = useState<MessageImage | null>(null);
  const [pickingImage, setPickingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const uploadedImageRef = useRef<{ path: string; url: string } | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const messageScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const descriptionFocused = useRef(false);
  const keepMessageVisible = useCallback(() => {
    if (descriptionFocused.current) {
      messageScrollRef.current?.scrollToEnd({ animated: true });
    }
  }, []);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', keepMessageVisible);
    return () => subscription.remove();
  }, [keepMessageVisible]);

  const [selectedLevel, setSelectedLevel] = useState<SalaLevel | 'todos'>('todos');
  const [expandedLevel, setExpandedLevel] = useState<SalaLevel | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<string | undefined>();
  const [managingCourse, setManagingCourse] = useState(false);
  const isTeacher = currentUser?.role === 'preceptor';
  const [teacherCursos, setTeacherCursos] = useState<TeacherCurso[]>([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState(false);
  useFocusEffect(useCallback(() => {
    if (!isTeacher || !currentUser?.id) return;
    let active = true;
    setTeacherLoading(true);
    setTeacherError(false);
    setTeacherCursos([]);
    setSelectedLevel('todos');
    setExpandedLevel(null);
    setSelectedCurso(undefined);
    getTeacherCursos(currentUser.id).then(assigned => {
      if (!active) return;
      setTeacherCursos(assigned);
      if (assigned[0]) { setSelectedLevel(assigned[0].level); setExpandedLevel(assigned[0].level); setSelectedCurso(assigned[0].id); }
    }).catch(() => { if (active) setTeacherError(true); })
      .finally(() => { if (active) setTeacherLoading(false); });
    return () => { active = false; };
  }, [isTeacher, currentUser?.id]));
  const cursos = selectedLevel === 'todos' ? [] : isTeacher ? teacherCursos.filter(curso => curso.level === selectedLevel) : getDestinatarios(selectedLevel);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [messageInputKey, setMessageInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
 

 
  const levels: { id: SalaLevel | 'todos'; label: string; color: string }[] = [
    { id: 'inicial', label: 'NIVEL INICIAL', color: '#FF9500' },
    { id: 'primario', label: 'NIVEL PRIMARIO', color: '#25D366' },
    { id: 'secundario', label: 'NIVEL SECUNDARIO', color: '#007AFF' },
    { id: 'todos', label: 'TODOS', color: '#FF3B30' },
  ];

  const handlePickImage = async (source: 'gallery' | 'camera' = 'gallery') => {
    if (pickingImage || loading) return;
    setShowAttachments(false);
    setPickingImage(true);
    try {
      const picked = await (source === 'camera' ? captureMessageImage() : pickMessageImage());
      if (picked) { setAttachment(picked); uploadedImageRef.current = null; }
    } catch (error: any) {
      Alert.alert('Imagen', error.message || 'No se pudo seleccionar la imagen');
    } finally { setPickingImage(false); }
  };

  const handlePickDocument = async () => {
    if (pickingImage || loading) return;
    setShowAttachments(false);
    setPickingImage(true);
    try {
      const picked = await pickMessageDocument();
      if (picked) { setDocument(picked); uploadedDocumentRef.current = null; }
    } catch (error: any) {
      Alert.alert('Documento', error.message || 'No se pudo seleccionar el documento.');
    } finally { setPickingImage(false); }
  };

  const handlePickAudio = async () => {
    if (pickingImage || loading) return;
    setShowAttachments(false);
    setPickingImage(true);
    try {
      const picked = await pickMessageAudio();
      if (picked) { setAudio(picked); uploadedAudioRef.current = null; }
    } catch (error: any) {
      Alert.alert('Audio', error.message || 'No se pudo seleccionar el audio.');
    } finally { setPickingImage(false); }
  };

  const handlePickVideo = async () => {
    if (pickingImage || loading) return;
    setShowAttachments(false);
    setPickingImage(true);
    try {
      const picked = await pickMessageVideo();
      if (picked) { setVideo(picked); uploadedVideoRef.current = null; }
    } catch (error: any) {
      Alert.alert('Video', error.message || 'No se pudo seleccionar el video.');
    } finally { setPickingImage(false); }
  };

  const handleSend = async () => {
    if (loading || pickingImage) return;
    if (isTeacher && (teacherLoading || !teacherCursos.some(curso => curso.level === selectedLevel && curso.id === selectedCurso))) {
      Alert.alert('Sala no habilitada', 'Solo podés enviar mensajes a los cursos que tenés asignados.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Por favor ingresa un mensaje');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Enviando comunicación a nivel:', selectedLevel);

      let targetUserIds: string[] | undefined;

      // Si es nivel específico (no 'todos'), obtener usuarios de esa sala
      if (selectedLevel !== 'todos') {
        const salaUserIds = await getSalaUsers(selectedLevel, selectedCurso);
        if (salaUserIds.length === 0) {
          Alert.alert('Sin destinatarios', 'Agregá familias al curso o nivel antes de enviar.');
          return;
        }
        targetUserIds = salaUserIds;
        console.log(`📍 Usuarios en sala ${selectedLevel}:`, salaUserIds);
        console.log(`📊 Total usuarios en sala: ${salaUserIds.length}`);
      } else {
        console.log('📡 Enviando a TODOS los usuarios');
      }

      console.log('🔹 targetUserIds que se enviará:', targetUserIds);

      let imageUrl: string | undefined;
      if (attachment) {
        setUploadingImage(true);
        try {
          imageUrl = uploadedImageRef.current?.path === attachment.path
            ? uploadedImageRef.current.url : await uploadMessageImage(attachment);
          uploadedImageRef.current = { path: attachment.path, url: imageUrl };
        } finally { setUploadingImage(false); }
      }
      let documentData: Record<string, string> = {};
      if (document) {
        setUploadingImage(true);
        try {
          const documentUrl = uploadedDocumentRef.current?.path === document.path
            ? uploadedDocumentRef.current.url : await uploadMessageDocument(document);
          documentData = documentMessageData(document, documentUrl);
          uploadedDocumentRef.current = { path: document.path, url: documentUrl };
        } finally { setUploadingImage(false); }
      }
      let audioData: Record<string, string> = {};
      if (audio) {
        setUploadingImage(true);
        try {
          await stopAudioPlayback();
          const audioUrl = uploadedAudioRef.current?.path === audio.path
            ? uploadedAudioRef.current.url : await uploadMessageAudio(audio);
          audioData = audioMessageData(audio, audioUrl);
          uploadedAudioRef.current = { path: audio.path, url: audioUrl };
        } finally { setUploadingImage(false); }
      }
      let videoData: Record<string, string> = {};
      if (video) {
        setUploadingImage(true);
        try {
          const videoUrl = uploadedVideoRef.current?.path === video.path
            ? uploadedVideoRef.current.url : await uploadMessageVideo(video);
          videoData = videoMessageData(video, videoUrl);
          uploadedVideoRef.current = { path: video.path, url: videoUrl };
        } finally { setUploadingImage(false); }
      }
      const messagePayload = {
        level: selectedLevel,
        cursoId: selectedCurso || null,
        cursoLabel: cursos.find(curso => curso.id === selectedCurso)?.label || null,
        title: title.trim(),
        body: description.trim(),
        description: description.trim(),
        data: {
          type: 'classroom',
          ...documentData,
          ...audioData,
          ...videoData,
          ...(linkUrl ? { linkUrl: normalizeMessageLink(linkUrl), ...linkPreviewData(linkPreview?.url === linkUrl ? linkPreview : null) } : {}),
          ...(imageUrl ? { imageUrl, imagePath: attachment!.path } : {}),
          level: selectedLevel,
          ...(selectedCurso ? { cursoId: selectedCurso, cursoLabel: cursos.find(curso => curso.id === selectedCurso)!.label } : {}),
          timestamp: new Date().toISOString(),
        },
      };

      let result;
      if (selectedLevel === 'todos') {
        // Enviar a TODOS
        result = await sendClassroomToAll(messagePayload, store);
      } else {
        // Enviar a usuarios específicos
        result = await sendClassroomToUsers(messagePayload, store, targetUserIds!);
      }

      console.log('✅ Comunicación enviada:', result);

      Alert.alert('Mensaje enviado');

      // Limpiar campos
      setTitle('');
      setDescription('');
      setAttachment(null);
      setDocument(null);
      setVideo(null);
      uploadedVideoRef.current = null;
      setAudio(null);
      uploadedAudioRef.current = null;
      setLinkUrl(null);
      setLinkPreview(null);
      uploadedDocumentRef.current = null;
      uploadedImageRef.current = null;
      setMessageInputKey(key => key + 1);
      setSelectedLevel('todos');
      setSelectedCurso(undefined);
    } catch (error: any) {
      console.error('❌ Error:', error);
      Alert.alert('Error', error.message || 'Error al enviar la comunicación');
    } finally {
      setLoading(false);
    }
  };

  // Receive - Cargar desde Firestore con filtrado segmentado
  const [classroom, setClassroom] = useState<Classroom[]>([]);
  const [loadingClassroom, setLoadingClassroom] = useState(true);
  const [messageLimit, setMessageLimit] = useState<30 | 100>(30);
  const [loadError, setLoadError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadClassroomData = useCallback(async (isRefreshing = false) => {
    setLoadError('');
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoadingClassroom(true);
      }

      if (!currentUser?.id) {
        setClassroom([]);
        return;
      }

      const { getAllClassroom } = await import('@/services/firebase/classroom');
      const visible = await getAllClassroom(messageLimit, currentUser.id);
      setClassroom(visible);
    } catch (error) {
      setLoadError(classroomLoadError(error));
      console.error('❌ Error loading classroom:', error);
    } finally {
      setLoadingClassroom(false);
      setRefreshing(false);
    }
  }, [currentUser?.id, currentUser?.role, currentUser?.displayName, messageLimit]);

  useFocusEffect(useCallback(() => {
    if (type === 'receive') {
      loadClassroomData();
    }
  }, [type, loadClassroomData]));

  if (type === 'send') {
    return (
      <KeyboardAvoidingView
        style={styles.chatContainerWithHeader}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        {/* Chat Area */}
        <ScrollView
          ref={messageScrollRef}
          style={styles.chatMessages}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onLayout={keepMessageVisible}
          onContentSizeChange={keepMessageVisible}
        >
          {/* User message: Elegir destinatario */}
          <View style={styles.messageRow}>
            <View style={[styles.chatBubble, styles.sentBubble]}>
              <Text style={styles.bubbleText}>Elegir destinatario</Text>
            </View>
          </View>

          {isTeacher && <Text style={styles.bubbleText}>{teacherLoading ? 'Cargando tus salas...' : teacherError ? 'No se pudieron cargar tus salas. Volvé a abrir esta pantalla.' : teacherCursos.length === 0 ? 'No tenés salas asignadas. Solicitá la asignación a la institución.' : 'Elegí una de tus salas asignadas.'}</Text>}
          {/* Level options */}
          {levels.filter(level => !isTeacher || teacherCursos.some(curso => curso.level === level.id)).map((level) => (
            <View key={level.id}>
              <TouchableOpacity
                disabled={loading}
                accessibilityRole="button"
                accessibilityState={level.id !== 'todos' ? { expanded: expandedLevel === level.id } : undefined}
                onPress={() => {
                  setExpandedLevel(current => level.id === 'todos' || current === level.id ? null : level.id);
                  if (selectedLevel !== level.id) {
                    setSelectedLevel(level.id);
                    setSelectedCurso(isTeacher ? teacherCursos.find(curso => curso.level === level.id)?.id : undefined);
                  }
                }}
              >
                <View style={styles.messageRow}>
                  <View style={[styles.chatBubble, styles.receivedBubble, { width: '90%' }]}>
                    <View
                      style={[styles.levelSwatch, { backgroundColor: level.color }]}
                    />
                    <Text style={styles.bubbleText}>{level.label}</Text>
                    <Text style={styles.chevron}>{selectedLevel === level.id ? '✓' : ''}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {expandedLevel === level.id && cursos.length > 0 && (
                <View>
                  {(isTeacher ? cursos : [{ id: undefined, label: 'TODO EL NIVEL' }, ...cursos]).map(curso => (
                    <TouchableOpacity key={curso.id || 'nivel'} disabled={loading} onPress={() => setSelectedCurso(curso.id)}>
                      <View style={styles.messageRow}>
                        <View style={[styles.chatBubble, styles.receivedBubble]}>
                          <Text style={styles.bubbleText}>{cursoDisplayLabel(curso.label)}</Text>
                          <Text style={styles.chevron}>{selectedCurso === curso.id ? '✓' : ''}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {!isTeacher && selectedCurso && !selectedCurso.startsWith('turno-') && (
                    <TouchableOpacity disabled={loading} onPress={() => setManagingCourse(true)}>
                      <View style={styles.messageRow}>
                        <View style={[styles.chatBubble, styles.receivedBubble]}>
                          <Text style={styles.bubbleText}>+ Agregar / ver familias y docentes</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}

            </View>
          ))}

          {/* Input: Titulo del mensaje */}
          <View style={styles.messageRow}>
            <View style={[styles.chatBubble, styles.sentBubble]}>
              <Text style={styles.bubbleText}>Titulo del mensaje</Text>
            </View>
          </View>

          {/* Input Field: Title */}
          <View style={styles.messageRow}>
            <BoldMessageInput
              key={`title-${messageInputKey}`}
              style={styles.titleInputBubble}
              placeholder="Escribe el titulo..."
              placeholderTextColor="#999"
              onMessageChange={setTitle}
              editable={!loading}
              maxLength={100}
            />
          </View>

          <DraftAttachments disabled={loading || pickingImage} items={[
            ...(video ? [{ id: video.path, name: video.name, detail: 'Video', videoUri: video.uri, size: video.size,
              onRemove: () => { setVideo(null); uploadedVideoRef.current = null; } }] : []),
            ...(audio ? [{ id: audio.path, name: audio.durationMs ? 'Nota de voz' : audio.name,
              detail: `${Math.ceil(audio.size / 1024)} KB`, audioUri: audio.uri, durationMs: audio.durationMs,
              onRemove: () => { setAudio(null); uploadedAudioRef.current = null; } }] : []),
            ...(linkUrl ? [{ id: 'link', name: linkPreview?.title || 'Enlace', detail: linkUrl, kind: 'enlace' as const,
              imageUri: linkPreview?.imageUrl || undefined,
              onRemove: () => { setLinkUrl(null); setLinkPreview(null); } }] : []),
            ...(document ? [{
              id: document.path,
              name: document.name,
              detail: document.size >= 1024 * 1024
                ? `${(document.size / (1024 * 1024)).toFixed(1)} MB`
                : `${Math.ceil(document.size / 1024)} KB`,
              onRemove: () => { setDocument(null); uploadedDocumentRef.current = null; },
            }] : []),
            ...(attachment ? [{
              id: attachment.path,
              name: 'Imagen adjunta',
              detail: attachment.contentType.replace('image/', '').toUpperCase(),
              imageUri: attachment.uri,
              onRemove: () => { setAttachment(null); uploadedImageRef.current = null; },
            }] : []),
          ]} />

          {/* Message input label */}
          <View style={styles.messageRow}>
            <View style={[styles.chatBubble, styles.sentBubble]}>
              <Text style={styles.bubbleText}>Escribe el mensaje</Text>
            </View>
          </View>

          
          {/* Input Field: Description */}
          <View style={styles.messageComposer}>
            <TouchableOpacity
              accessibilityRole="button" accessibilityLabel="Agregar emoji"
              disabled={loading}
              style={styles.composerIconButton}
              onPress={() => { Keyboard.dismiss(); setShowEmojis(true); }}>
              <Text style={styles.composerIcon}>☺</Text>
            </TouchableOpacity>
            <BoldMessageInput
              ref={messageInputRef}
              key={messageInputKey}
              style={[styles.descriptionInputBubble, styles.composerInput]}
              onFocus={() => {
                descriptionFocused.current = true;
                keepMessageVisible();
              }}
              onBlur={() => { descriptionFocused.current = false; }}
              placeholder="Contenido del mensaje..."
              placeholderTextColor="#999"
              onMessageChange={setDescription}
              multiline
              numberOfLines={10}
              maxLength={2000}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.composerIconButton}
              accessibilityRole="button"
              accessibilityLabel="Adjuntar archivo"
              disabled={loading || pickingImage}
              onPress={() => { Keyboard.dismiss(); setShowAttachments(true); }}>
              <Text style={styles.composerIcon}>+</Text>
            </TouchableOpacity>
          </View>
          {pickingImage && <ActivityIndicator color="#0c6b58" />}

        </ScrollView>

        {showAttachments && <AttachmentSheet onVideo={handlePickVideo} onAudio={file => { setAudio(file); uploadedAudioRef.current = null; setShowAttachments(false); }} onPickAudio={handlePickAudio} onLink={(url, preview) => { setLinkUrl(url); setLinkPreview(preview); setShowAttachments(false); }} onDocument={handlePickDocument} onGallery={() => handlePickImage('gallery')} onCamera={() => handlePickImage('camera')} onClose={() => setShowAttachments(false)} />}

        {showEmojis && <EmojiPicker onSelect={emoji => messageInputRef.current?.insertEmoji(emoji)} onClose={() => setShowEmojis(false)} />}

        {!isTeacher && managingCourse && selectedLevel !== 'todos' && selectedCurso && (
          <FamiliasModal level={selectedLevel} cursoId={selectedCurso}
            label={cursoDisplayLabel(cursos.find(curso => curso.id === selectedCurso)!.label)}
            onClose={() => setManagingCourse(false)} />
        )}

        {/* Send Button Bar */}
        <View style={styles.sendButtonBar}>
          <TouchableOpacity
            style={[styles.sendButtonChat, (loading || (isTeacher && (teacherLoading || teacherCursos.length === 0))) && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={loading || pickingImage || (isTeacher && (teacherLoading || teacherCursos.length === 0))}
          >
            <Image source={require('../../../assets/icons/send-message.png')} style={styles.sendButtonChatIcon} resizeMode="contain" accessible={false} />
            <Text style={styles.sendButtonChatText}>
              {uploadingImage ? 'Subiendo adjunto...' : loading ? 'Enviando...' : 'Enviar'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

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


  if (loadingClassroom) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#25D366" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Boolean(loadError) && <View style={{ padding: 16 }}>
        <Text accessibilityRole="alert">{loadError}</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => loadClassroomData(true)}><Text>Reintentar</Text></TouchableOpacity>
      </View>}
      <FlatList
        ListFooterComponent={messageLimit === 30 && !loadError ? <TouchableOpacity
          accessibilityRole="button" style={{ padding: 20, alignItems: 'center' }} onPress={() => setMessageLimit(100)}>
          <Text style={{ color: '#0c6b58', fontWeight: '700' }}>Ver más</Text>
        </TouchableOpacity> : undefined}
        data={classroom}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadClassroomData(true)}
            colors={['#0c6b58']}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.levelRow}
            onPress={() => {
              navigation.navigate('ClassroomDetail' as any, {
                classroomId: item.id,
              });
            }}
          >
            <View
              style={[
                styles.levelAvatar,
                { backgroundColor: getLevelColor(item.level) },
              ]}
            >
              <Text style={styles.levelAvatarText}>{getLevelIcon(item.level)}</Text>
            </View>

            <View style={styles.levelInfo}>
              <View style={styles.levelTop}>
                <MessageText style={styles.levelName}>{item.title}</MessageText>
                <Text style={styles.levelTime}>
                  {new Date(item.createdAt).toLocaleDateString('es-AR')} · {new Date(item.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
              </View>

              <View style={styles.tagRow}>
                <View style={[styles.destinationTag, { borderColor: getLevelColor(item.level) }]}>
                  <Text style={[styles.destinationTagText, { color: getLevelColor(item.level) }]}>
                    {getDestinationLabel(item)}
                  </Text>
                </View>
              </View>

              <View style={styles.levelBottom}>
                <MessageText style={styles.levelPreview} numberOfLines={1}>
                  {item.description}
                </MessageText>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.levelListContent}
        ListEmptyComponent={loadError ? undefined :
          <View style={{ padding: 30, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 6 }}>
              Sin comunicaciones
            </Text>
            <Text style={{ fontSize: 13, color: '#999', textAlign: 'center' }}>
              {currentUser?.role === 'familia'
                ? 'No tenés nuevos comunicados para tu sala o nivel.'
                : 'No hay comunicaciones enviadas todavía.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};
