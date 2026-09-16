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
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Nueva Comunicación</Text>

          {error && (
            <View style={[styles.inputGroup, { backgroundColor: '#ffebee', borderLeftColor: '#ff3b30', borderLeftWidth: 4, padding: 10, borderRadius: 4 }]}>
              <Text style={{ color: '#c62828' }}>❌ {error}</Text>
            </View>
          )}

          {success && (
            <View style={[styles.inputGroup, { backgroundColor: '#f0f8f0', borderLeftColor: '#25d366', borderLeftWidth: 4, padding: 10, borderRadius: 4 }]}>
              <Text style={{ color: '#25d366' }}>{success}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Aviso importante"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
              maxLength={100}
              editable={!loading}
            />
            <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {title.length}/100
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escribe el mensaje..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              placeholderTextColor="#999"
              maxLength={1000}
              editable={!loading}
            />
            <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {description.length}/1000
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, loading && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>
              {loading ? '⏳ Enviando...' : '📤 Enviar a Todos'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

