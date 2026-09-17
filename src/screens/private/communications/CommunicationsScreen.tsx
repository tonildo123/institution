import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '@/redux/store';
import { store } from '@/redux/store';
import { sendCommunicationToAll } from '@/services/communicationsService';
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
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation();
  const [selectedLevel, setSelectedLevel] = useState<string>('todos');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Ocultar tabs cuando es type='send'
  useEffect(() => {
    const parent = navigation.getParent();

    if (type === 'send' && parent) {
      console.log('🔍 Ocultando tabs para CommunicationsScreen');
      parent.setOptions({
        tabBarStyle: { height: 0 },
      });
    } else if (parent) {
      console.log('🔍 Mostrando tabs');
      parent.setOptions({
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
        },
      });
    }
  }, [type, navigation]);

  // Determinar pantalla de historial según rol
  const getHistorialRouteName = () => {
    if (user?.role === 'admin') return 'HistorialAdmin';
    if (user?.role === 'preceptor') return 'HistorialPreceptor';
    return 'HistorialFamilia';
  };

  const levels = [
    { id: 'inicial', label: 'NIVEL INICIAL', color: '#FF9500' },
    { id: 'primario', label: 'NIVEL PRIMARIO', color: '#25D366' },
    { id: 'secundario', label: 'NIVEL SECUNDARIO', color: '#007AFF' },
    { id: 'todos', label: 'TODOS', color: '#FF3B30' },
  ];

  const handleSend = async () => {
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

      const result = await sendCommunicationToAll(
        {
          title: title.trim(),
          body: description.trim(),
          description: description.trim(),
          data: {
            type: 'communication',
            level: selectedLevel,
            timestamp: new Date().toISOString(),
          },
        },
        store
      );

      console.log('✅ Comunicación enviada:', result);

      Alert.alert(
        '✅ Enviado',
        `Mensaje enviado a ${result.delivered}/${result.totalUsers} usuarios`
      );

      // Limpiar campos
      setTitle('');
      setDescription('');
      setSelectedLevel('todos');
    } catch (error: any) {
      console.error('❌ Error:', error);
      Alert.alert('Error', error.message || 'Error al enviar la comunicación');
    } finally {
      setLoading(false);
    }
  };

  if (type === 'send') {
    return (
      <View style={styles.chatContainerWithHeader}>
        {/* Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => {
            const parent = navigation.getParent();

            // Restaurar tabs
            if (parent) {
              parent.setOptions({
                tabBarStyle: {
                  backgroundColor: '#fff',
                  borderTopWidth: 1,
                  borderTopColor: '#eee',
                  display: 'flex',
                },
              });
            }

            // Navegar a Historial según rol
            parent?.navigate(getHistorialRouteName() as any);
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
        <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
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
              onPress={() => setSelectedLevel(level.id)}
            >
              <View style={styles.messageRow}>
                <View style={[styles.chatBubble, styles.receivedBubble, { width: '90%' }]}>
                  <View
                    style={[styles.levelSwatch, { backgroundColor: level.color }]}
                  />
                  <Text style={styles.bubbleText}>{level.label}</Text>
                  <Text style={styles.chevron}>▼</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

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
          <View style={styles.messageRow}>
            <TextInput
              style={styles.descriptionInputBubble}
              placeholder="Contenido del mensaje..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={1000}
              editable={!loading}
            />
          </View>
        </ScrollView>

        {/* Send Button Bar */}
        <View style={styles.sendButtonBar}>
          <TouchableOpacity
            style={[styles.sendButtonChat, loading && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={loading}
          >
            <Text style={styles.sendButtonChatIcon}>✈️</Text>
            <Text style={styles.sendButtonChatText}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Receive - Estilo WhatsApp
  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageSender}>{item.sender}</Text>
              <Text style={styles.messageTime}>{item.date}</Text>
            </View>
            <Text style={styles.messageTitle}>{item.title}</Text>
            <Text style={styles.messageDescription}>{item.description}</Text>
            {item.attachment && (
              <Text style={styles.attachment}>{item.attachment}</Text>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

