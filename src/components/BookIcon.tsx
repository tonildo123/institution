import React from 'react';
import { View, StyleSheet } from 'react-native';

/** Libro abierto de trazo (24 px), usado en Classroom. */
export const BookIcon = ({ color }: { color: string }) => (
  <View style={styles.canvas} accessible={false}>
    <View style={[styles.page, styles.left, { borderColor: color }]} />
    <View style={[styles.page, styles.right, { borderColor: color }]} />
  </View>
);

const styles = StyleSheet.create({
  canvas: { width: 24, height: 24 },
  page: { position: 'absolute', top: 4, width: 9, height: 16, borderWidth: 1.7, borderRadius: 1 },
  left: { left: 2 },
  right: { left: 13 },
});
