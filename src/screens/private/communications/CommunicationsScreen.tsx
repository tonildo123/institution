import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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

  if (type === 'send') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Nueva Comunicación</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Aviso importante"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
            />
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
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adjunto (opcional)</Text>
            <TouchableOpacity style={styles.attachButton}>
              <Text style={styles.attachButtonText}>📎 Seleccionar archivo</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Enviar</Text>
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

