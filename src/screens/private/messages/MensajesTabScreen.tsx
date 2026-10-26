import React, { useState } from 'react';
import { View } from 'react-native';
import { CommunicationsScreen } from '@/screens/private/communications/CommunicationsScreen';
import { ClassroomScreen } from '@/screens/private/classroom/ClassroomScreen';
import { SourceTabs } from '@/components/SourceTabs';

type MessageSource = 'mensajes' | 'classroom';

const sources: { id: MessageSource; label: string }[] = [
  { id: 'mensajes', label: 'Mensajes' },
  { id: 'classroom', label: 'Classroom' },
];

/**
 * Pestaña Mensajes: alterna entre Mensajes y Classroom.
 * Ambas pantallas quedan montadas para conservar borradores y listas al cambiar.
 */
export const MensajesTabScreen = ({ type }: { type: 'send' | 'receive' }) => {
  const [source, setSource] = useState<MessageSource>('mensajes');
  return (
    <View style={{ flex: 1 }}>
      <SourceTabs options={sources} selected={source} onSelect={setSource} />
      <View style={{ flex: 1, display: source === 'mensajes' ? 'flex' : 'none' }}>
        <CommunicationsScreen type={type} />
      </View>
      <View style={{ flex: 1, display: source === 'classroom' ? 'flex' : 'none' }}>
        <ClassroomScreen type={type} />
      </View>
    </View>
  );
};
