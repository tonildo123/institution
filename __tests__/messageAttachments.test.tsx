import React from 'react';
import { act, create } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';

const mounted: string[] = [];
const probe = (name: string) => () => { mounted.push(name); return null; };
jest.mock('../src/components/MessageVideo', () => ({ MessageVideo: probe('video') }));
jest.mock('../src/components/MessageAudio', () => ({ MessageAudio: probe('audio') }));
jest.mock('../src/components/MessageLink', () => ({ MessageLink: probe('link') }));
jest.mock('../src/components/MessageDocument', () => ({ MessageDocument: probe('document') }));
jest.mock('../src/components/MessageImage', () => ({ MessageImage: probe('image') }));

import { MessageAttachments } from '../src/components/MessageAttachments';

beforeEach(() => { mounted.length = 0; });

test('no descarga ningún adjunto hasta que la persona lo pide', async () => {
  let tree: any;
  await act(async () => { tree = create(<MessageAttachments data={{ imageUrl: 'https://x/a.jpg', videoUrl: 'https://x/v.mp4' }} />); });
  expect(mounted).toEqual([]);
  const placeholders = tree.root.findAllByType(TouchableOpacity);
  expect(placeholders.map((p: any) => p.props.accessibilityLabel)).toEqual(['Mostrar Video', 'Mostrar Imagen']);

  await act(async () => { placeholders[1].props.onPress(); });
  expect(mounted).toEqual(['image']);
});
