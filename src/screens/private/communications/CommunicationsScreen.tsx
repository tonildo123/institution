import { MessageDocument } from '@/components/MessageDocument';
import { pickMessageDocument, uploadMessageDocument, documentMessageData, MessageDocumentFile } from '@/services/messageDocuments';
import { isCommunicationForFamily, getDestinationLabel } from '@/utils/communicationAudience';
import { MessageImage as ImagePreview } from '@/components/MessageImage';
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
  TextInput,
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
import { sendCommunicationToAll, sendCommunicationToUsers } from '@/services/communicationsService';
import { Communication } from '@/services/firebase/communications';
import { getSalaUsers, getDestinatarios, SalaLevel } from '@/services/firebase/salas';
import { FamiliasModal } from '@/components/salas/FamiliasModal';
import { styles } from './styles';

/**
 * Pantalla de Comunicaciones - Estilo Chat
 * Para Admin y Preceptor: Interfaz tipo chat para enviar
 * Para Familia: Mostrar lista de comunicaciones recibidas
 */

interface CommunicationsScreenProps {
  type: 'send' | 'receive';
}

export const CommunicationsScreen: React.FC<CommunicationsScreenProps> = ({
  type,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const messageInputRef = useRef<BoldMessageInputHandle>(null);
  const [showEmojis, setShowEmojis] = useState(false);
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
  const [selectedCurso, setSelectedCurso] = useState<string | undefined>();
  const [managingCourse, setManagingCourse] = useState(false);
  const cursos = selectedLevel === 'todos' ? [] : getDestinatarios(selectedLevel);
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

  const handleSend = async () => {
    if (loading || pickingImage) return;
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
      const messagePayload = {
        level: selectedLevel,
        cursoId: selectedCurso || null,
        cursoLabel: cursos.find(curso => curso.id === selectedCurso)?.label || null,
        title: title.trim(),
        body: description.trim(),
        description: description.trim(),
        data: {
          type: 'communication',
          ...documentData,
          ...(imageUrl ? { imageUrl, imagePath: attachment!.path } : {}),
          level: selectedLevel,
          ...(selectedCurso ? { cursoId: selectedCurso, cursoLabel: cursos.find(curso => curso.id === selectedCurso)!.label } : {}),
          timestamp: new Date().toISOString(),
        },
      };

      let result;
      if (selectedLevel === 'todos') {
        // Enviar a TODOS
        result = await sendCommunicationToAll(messagePayload, store);
      } else {
        // Enviar a usuarios específicos
        result = await sendCommunicationToUsers(messagePayload, store, targetUserIds!);
      }

      console.log('✅ Comunicación enviada:', result);

      Alert.alert(
        '✅ Enviado',
        `Mensaje enviado a ${result.delivered}/${result.totalUsers} usuarios`
      );

      // Limpiar campos
      setTitle('');
      setDescription('');
      setAttachment(null);
      setDocument(null);
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
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loadingCommunications, setLoadingCommunications] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCommunicationsData = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoadingCommunications(true);
      }

      if (!currentUser?.id) {
        setCommunications([]);
        return;
      }

      const { getAllCommunications } = await import('@/services/firebase/communications');
      const { getUserAssignedSalas } = await import('@/services/firebase/salas');

      const [allComms, assignedSalas] = await Promise.all([
        getAllCommunications(),
        currentUser?.role === 'familia' && currentUser.id ? getUserAssignedSalas(currentUser.id) : Promise.resolve({ levels: [], cursos: [] }),
      ]);

      if (currentUser?.role === 'familia') {
        const filtered = allComms.filter(comm =>
          isCommunicationForFamily(comm, currentUser.id, assignedSalas));

        setCommunications(filtered);
        console.log(`✅ Comunicaciones filtradas para familia (${currentUser?.displayName}):`, filtered.length, 'de', allComms.length);
      } else {
        // Para directivos, admin y preceptores se muestran todas
        setCommunications(allComms);
        console.log('✅ Todas las comunicaciones cargadas:', allComms.length);
      }
    } catch (error) {
      setCommunications([]);
      Alert.alert('Error', 'No se pudieron cargar las comunicaciones. Intentá nuevamente.');
      console.error('❌ Error loading communications:', error);
    } finally {
      setLoadingCommunications(false);
      setRefreshing(false);
    }
  }, [currentUser?.id, currentUser?.role, currentUser?.displayName]);

  useFocusEffect(useCallback(() => {
    if (type === 'receive') {
      loadCommunicationsData();
    }
  }, [type, loadCommunicationsData]));

  if (type === 'send') {
    return (
      <KeyboardAvoidingView
        style={styles.chatContainerWithHeader}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        {/* Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => {
            navigation.goBack();
          }}>
            <Text style={styles.headerBackArrow}>←</Text>
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
            <Text style={styles.headerSub}>last seen today at 13:25</Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.headerMenuDots}>⋮</Text>
          </TouchableOpacity>
        </View>

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

          {/* Level options */}
          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              disabled={loading}
              onPress={() => { setSelectedLevel(level.id); setSelectedCurso(undefined); }}
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
          ))}

          {cursos.length > 0 && (
            <View>
              {[{ id: undefined, label: 'TODO EL NIVEL' }, ...cursos].map(curso => (
                <TouchableOpacity key={curso.id || 'nivel'} disabled={loading} onPress={() => setSelectedCurso(curso.id)}>
                  <View style={styles.messageRow}>
                    <View style={[styles.chatBubble, styles.receivedBubble]}>
                      <Text style={styles.bubbleText}>{curso.label}</Text>
                      <Text style={styles.chevron}>{selectedCurso === curso.id ? '✓' : ''}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {selectedCurso && !selectedCurso.startsWith('turno-') && (
                <TouchableOpacity disabled={loading} onPress={() => setManagingCourse(true)}>
                  <View style={styles.messageRow}>
                    <View style={[styles.chatBubble, styles.receivedBubble]}>
                      <Text style={styles.bubbleText}>+ Agregar / ver alumnos y familias</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Input: Titulo del mensaje */}
          <View style={styles.messageRow}>
            <View style={[styles.chatBubble, styles.sentBubble]}>
              <Text style={styles.bubbleText}>Titulo del mensaje</Text>
            </View>
          </View>

          {/* Input Field: Title */}
          <View style={styles.messageRow}>
            <TextInput
              style={styles.titleInputBubble}
              placeholder="Escribe el titulo..."
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

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
          {document && (
            <View>
              <MessageDocument name={document.name} size={document.size} />
              <TouchableOpacity disabled={loading} onPress={() => { setDocument(null); uploadedDocumentRef.current = null; }} style={{ padding: 12 }}>
                <Text style={{ color: '#B42323' }}>Quitar documento</Text>
              </TouchableOpacity>
            </View>
          )}
          {attachment && (
            <View>
              <ImagePreview key={attachment.path} uri={attachment.uri} />
              <TouchableOpacity disabled={loading} onPress={() => { setAttachment(null); uploadedImageRef.current = null; }} style={{ padding: 12 }}>
                <Text style={{ color: '#B42323' }}>Quitar imagen</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {showAttachments && <AttachmentSheet onDocument={handlePickDocument} onGallery={() => handlePickImage('gallery')} onCamera={() => handlePickImage('camera')} onClose={() => setShowAttachments(false)} />}

        {showEmojis && <EmojiPicker onSelect={emoji => messageInputRef.current?.insertEmoji(emoji)} onClose={() => setShowEmojis(false)} />}

        {managingCourse && selectedLevel !== 'todos' && selectedCurso && (
          <FamiliasModal level={selectedLevel} cursoId={selectedCurso}
            label={cursos.find(curso => curso.id === selectedCurso)!.label}
            onClose={() => setManagingCourse(false)} />
        )}

        {/* Send Button Bar */}
        <View style={styles.sendButtonBar}>
          <TouchableOpacity
            style={[styles.sendButtonChat, loading && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={loading || pickingImage}
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


  if (loadingCommunications) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#25D366" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.receiveHeader}>
        <Text style={styles.receiveHeaderTitle}>IMEP</Text>
      </View>

      <FlatList
        data={communications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCommunicationsData(true)}
            colors={['#0c6b58']}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.levelRow}
            onPress={() => {
              navigation.navigate('CommunicationDetail' as any, {
                communicationId: item.id,
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
                <Text style={styles.levelName}>{item.title}</Text>
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
              {item.data?.documentUrl && (
                <MessageDocument name={item.data.documentName || 'Documento adjunto'}
                  size={Number(item.data.documentSize) || 0} url={item.data.documentUrl} />
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.levelListContent}
        ListEmptyComponent={
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

