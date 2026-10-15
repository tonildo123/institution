import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
jest.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: 'SafeAreaProvider', SafeAreaView: 'SafeAreaView' }));
import { MessageImage } from '../src/components/MessageImage';
let tree: ReactTestRenderer;
afterEach(async () => { await act(async () => { tree?.unmount(); }); });
test('el visor usa un área segura propia del modal y se cierra desde el botón', async () => {
  await act(async () => { tree = create(<MessageImage uri="https://example.com/image.jpg" />); });
  await act(async () => { tree.root.findAllByType(TouchableOpacity).find(button => button.props.accessibilityLabel === 'Abrir imagen adjunta')!.props.onPress(); });
  const provider = tree.root.findByType(SafeAreaProvider);
  expect(provider.findByType(SafeAreaView).props.edges).toContain('top');
  await act(async () => { provider.findAllByType(TouchableOpacity).find(button => button.props.accessibilityLabel === 'Cerrar imagen')!.props.onPress(); });
  expect(tree.root.findAllByType(SafeAreaProvider)).toHaveLength(0);
});
