import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { parseMessage } from '@/utils/messageFormatting';

export const MessageText = ({ children, ...props }: Omit<TextProps, 'children'> & { children: string }) => (
  <Text {...props}>
    {parseMessage(children).map((part, index) => (
      <Text key={index} style={part.bold ? styles.bold : undefined}>{part.text}</Text>
    ))}
  </Text>
);
const styles = StyleSheet.create({ bold: { fontWeight: '700' } });
