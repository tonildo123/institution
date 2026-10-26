import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';

jest.mock('react-redux', () => ({ useSelector: (selector: any) => selector({ auth: { user: { id: 'admin-1' } } }) }));
jest.mock('@/components/MessageText', () => ({ MessageText: 'MessageText' }));
jest.mock('@/utils/communicationAudience', () => ({ getDestinationLabel: () => 'Todos' }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  // Recarga cuando cambia el callback (que depende de la fuente elegida), como el foco real.
  useFocusEffect: (callback: () => void) => { const React = require('react'); React.useEffect(() => { callback(); }, [callback]); },
}));
jest.mock('@/services/firebase/communications', () => ({
  getAllCommunications: jest.fn(async () => [{ id: 'msg-1', title: 'Mensaje general', description: '', level: 'todos', createdAt: '2026-10-20T10:00:00Z' }]),
  communicationLoadError: () => 'error',
}));
jest.mock('@/services/firebase/classroom', () => ({
  getAllClassroom: jest.fn(async () => [{ id: 'cls-1', title: 'Tarea de Classroom', description: '', level: 'todos', createdAt: '2026-10-21T10:00:00Z' }]),
  classroomLoadError: () => 'error',
}));

import { HistoryScreen } from '../src/screens/private/history/HistoryScreen';
import { getAllCommunications } from '../src/services/firebase/communications';
import { getAllClassroom } from '../src/services/firebase/classroom';

let tree: ReactTestRenderer;
beforeEach(() => { jest.clearAllMocks(); });
afterEach(async () => { await act(async () => { tree?.unmount(); }); });

const tab = (label: string) => tree.root.findAllByType(TouchableOpacity).find(item => item.props.accessibilityLabel === label)!;
const texts = () => tree.root.findAllByType(Text).map(item => item.props.children);

test('muestra Mensajes por defecto y Classroom al elegir la otra pestaña', async () => {
  await act(async () => { tree = create(<HistoryScreen />); });
  expect(getAllCommunications).toHaveBeenCalledWith(30, 'admin-1');
  expect(getAllClassroom).not.toHaveBeenCalled();
  expect(texts()).toContain('Mensajes');
  expect(tab('Mensajes').props.accessibilityState).toEqual({ selected: true });

  await act(async () => { tab('Classroom').props.onPress(); });
  expect(getAllClassroom).toHaveBeenCalledWith(30, 'admin-1');
  expect(tab('Classroom').props.accessibilityState).toEqual({ selected: true });
  expect(tab('Mensajes').props.accessibilityState).toEqual({ selected: false });
});
