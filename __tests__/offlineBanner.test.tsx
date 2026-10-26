import React from 'react';
import { act, create } from 'react-test-renderer';
import { Text } from 'react-native';

let listener: ((state: any) => void) | undefined;
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { addEventListener: (cb: (state: any) => void) => { listener = cb; return () => { listener = undefined; }; } },
}));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));

import { OfflineBanner } from '../src/components/OfflineBanner';

const message = 'Sin conexión. Verificá tu conexión para cargar y enviar.';

test('muestra el aviso sin conexión y lo oculta al recuperarla', async () => {
  let tree: any;
  await act(async () => { tree = create(<OfflineBanner />); });
  expect(tree.root.findAllByType(Text)).toHaveLength(0);

  await act(async () => { listener?.({ isConnected: false, isInternetReachable: false }); });
  expect(tree.root.findAllByType(Text).map((t: any) => t.props.children)).toContain(message);

  await act(async () => { listener?.({ isConnected: true, isInternetReachable: true }); });
  expect(tree.root.findAllByType(Text)).toHaveLength(0);
});
