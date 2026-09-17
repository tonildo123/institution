import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { store } from '@/redux/store';
import { sendCommunicationToAll } from '@/services/communicationsService';
import { styles } from './styles';

/**
 * Pantalla de Comunicaciones
 * Para Admin y Preceptor: Mostrar form para enviar
 * Para Familia: Mostrar lista de comunicaciones recibidas
 */

interface Message {
  id: string;
  title: string;
  description: string;
  sender: string;
  date: string;
  attachment?: string;
}

interface CommunicationsScreenProps {
  type: 'send' | 'receive'; // send para admin/preceptor, receive para familia
}

export const CommunicationsScreen: React.FC<CommunicationsScreenProps> = ({
  type,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('todos');
  const [showDestinationConfirm, setShowDestinationConfirm] = useState(false);
  const [showMessageConfirm, setShowMessageConfirm] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      title: 'Aviso importante',
      description: 'Reunión de padres el viernes',
      sender: 'Directora María',
      date: '09:30',
      attachment: '📎',
    },
    {
      id: '2',
      title: 'Tarea de matemática',
      description: 'Ejercicios del capítulo 5',
      sender: 'Prof. Juan',
      date: 'ayer',
      attachment: '📄',
    },
  ]);

  const levels = [
    { id: 'inicial', label: 'NIVEL INICIAL', color: '#FF9500' },
    { id: 'primario', label: 'NIVEL PRIMARIO', color: '#25D366' },
    { id: 'secundario', label: 'NIVEL SECUNDARIO', color: '#007AFF' },
    { id: 'todos', label: 'TODOS', color: '#FF3B30' },
  ];

  const handleSend = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Título y descripción son requeridos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 Enviando comunicación...');

      const result = await sendCommunicationToAll(
        {
          title: title.trim(),
          body: description.trim(),
          description: description.trim(),
          data: {
            type: 'communication',
            timestamp: new Date().toISOString(),
          },
        },
        store
      );

      console.log('✅ Respuesta:', result);

      const newMessage: Message = {
        id: result.communicationId || Date.now().toString(),
        title,
        description,
        sender: user?.displayName || 'Yo',
        date: new Date().toLocaleString('es-AR'),
        attachment: undefined,
      };

      setMessages([newMessage, ...messages]);
      setSuccess(`✅ Enviado a ${result.delivered}/${result.totalUsers} usuarios`);

      setTitle('');
      setDescription('');

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Error al enviar la comunicación');
    } finally {
      setLoading(false);
    }
  };

  if (type === 'send') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.sendHeader}>
          <Text style={styles.sendHeaderTitle}>Elegir destinatario</Text>
        </View>

        <ScrollView style={styles.sendContent} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={[styles.alertBox, { backgroundColor: '#ffebee', borderLeftColor: '#ff3b30' }]}>
              <Text style={{ color: '#c62828' }}>❌ {error}</Text>
            </View>
          )}

          {success && (
            <View style={[styles.alertBox, { backgroundColor: '#f0f8f0', borderLeftColor: '#25d366' }]}>
              <Text style={{ color: '#25d366' }}>{success}</Text>
            </View>
          )}

          {/* Nivel Selector */}
          <View style={styles.selectorContainer}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelButton,
                  selectedLevel === level.id && styles.levelButtonActive,
                  { borderLeftColor: level.color },
                ]}
                onPress={() => setSelectedLevel(level.id)}
              >
                <View
                  style={[
                    styles.levelColorBox,
                    { backgroundColor: level.color },
                  ]}
                />
                <Text style={styles.levelText}>{level.label}</Text>
                <Text style={styles.levelCheckmark}>
                  {selectedLevel === level.id ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Titulo */}
          <View style={styles.headerBox}>
            <Text style={styles.headerBoxTitle}>Titulo del mensaje</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Escribe el título..."
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
              maxLength={100}
              editable={!loading}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Descripción */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Escribe el mensaje..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              placeholderTextColor="#999"
              maxLength={1000}
              editable={!loading}
            />
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>

          {/* Confirm Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.confirmButton, styles.confirmMessageButton]}
              onPress={() => setShowMessageConfirm(!showMessageConfirm)}
            >
              <Text style={styles.confirmButtonIcon}>✉️</Text>
              <Text style={styles.confirmButtonText}>Confirmar Mensaje</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, styles.confirmDestinationButton]}
              onPress={() => setShowDestinationConfirm(!showDestinationConfirm)}
            >
              <Text style={styles.confirmButtonIcon}>👥</Text>
              <Text style={styles.confirmButtonText}>Confirmar Destinatario</Text>
            </TouchableOpacity>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              loading && { opacity: 0.6 },
              { marginBottom: 20 },
            ]}
            onPress={handleSend}
            disabled={loading}
          >
            <Text style={styles.sendButtonIcon}>✈️</Text>
            <Text style={styles.sendButtonText}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
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

