import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
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
  const [selectedLevel, setSelectedLevel] = useState<string>('todos');
  const [title, setTitle] = useState('');

  const levels = [
    { id: 'inicial', label: 'NIVEL INICIAL', color: '#FF9500' },
    { id: 'primario', label: 'NIVEL PRIMARIO', color: '#25D366' },
    { id: 'secundario', label: 'NIVEL SECUNDARIO', color: '#007AFF' },
    { id: 'todos', label: 'TODOS', color: '#FF3B30' },
  ];

  const getLevelColor = (levelId: string) => {
    return levels.find(l => l.id === levelId)?.color || '#999';
  };

  if (type === 'send') {
    return (
      <View style={styles.chatContainer}>
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
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
          </View>
        </ScrollView>

        {/* Send Button Bar */}
        <View style={styles.sendButtonBar}>
          <TouchableOpacity style={styles.sendButtonChat}>
            <Text style={styles.sendButtonChatIcon}>✈️</Text>
            <Text style={styles.sendButtonChatText}>Enviar</Text>
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

