import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommunicationsScreen } from '@/screens/private/communications/CommunicationsScreen';
import { ClassroomScreen } from '@/screens/private/classroom/ClassroomScreen';
import { classroomColors } from '@/screens/private/classroom/classroomStyles';
import { SourceTabs } from '@/components/SourceTabs';
import { BookIcon } from '@/components/BookIcon';

type MessageSource = 'mensajes' | 'classroom';

const MENSAJES_COLOR = '#0c6b58';

const sources: { id: MessageSource; label: string; icon?: (active: boolean) => React.ReactNode }[] = [
  { id: 'mensajes', label: 'Mensajes' },
  { id: 'classroom', label: 'Classroom', icon: active => <BookIcon color={active ? classroomColors.primary : '#fff'} /> },
];

/**
 * Pestaña Mensajes: alterna entre Mensajes y Classroom.
 * Ambas pantallas quedan montadas para conservar borradores y listas al cambiar.
 * El encabezado cambia de color según la sección activa.
 */
export const MensajesTabScreen = ({ type }: { type: 'send' | 'receive' }) => {
  const [source, setSource] = useState<MessageSource>('mensajes');
  const onClassroom = source === 'classroom';
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: onClassroom ? classroomColors.primary : MENSAJES_COLOR }}>
      <StatusBar barStyle="light-content" />
      <SourceTabs
        options={sources}
        selected={source}
        onSelect={setSource}
        backgroundColor={onClassroom ? classroomColors.primary : MENSAJES_COLOR}
      />
      <View style={{ flex: 1, display: source === 'mensajes' ? 'flex' : 'none' }}>
        <CommunicationsScreen type={type} />
      </View>
      <View style={{ flex: 1, display: onClassroom ? 'flex' : 'none' }}>
        <ClassroomScreen type={type} />
      </View>
    </SafeAreaView>
  );
};
