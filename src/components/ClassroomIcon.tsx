import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Pizarrón de aula de trazo (24 px), ícono de Aula Kit.
 * Mismo estilo que BookIcon: trazo de 1.7 px y un solo color.
 */
export const ClassroomIcon = ({ color }: { color: string }) => (
  <View style={styles.canvas} accessible={false}>
    {/* Pizarra */}
    <View style={[styles.board, { borderColor: color }]} />
    {/* Renglones escritos */}
    <View style={[styles.line, styles.lineTop, { backgroundColor: color }]} />
    <View style={[styles.line, styles.lineBottom, { backgroundColor: color }]} />
    {/* Patas */}
    <View style={[styles.leg, styles.legLeft, { backgroundColor: color }]} />
    <View style={[styles.leg, styles.legRight, { backgroundColor: color }]} />
  </View>
);

const STROKE = 1.7;

const styles = StyleSheet.create({
  canvas: { width: 24, height: 24 },
  board: { position: 'absolute', left: 2, top: 3, width: 20, height: 13, borderWidth: STROKE, borderRadius: 1.5 },
  line: { position: 'absolute', left: 6, height: STROKE, borderRadius: 1 },
  lineTop: { top: 7, width: 9 },
  lineBottom: { top: 10.5, width: 6 },
  leg: { position: 'absolute', top: 15.5, width: STROKE, height: 6, borderRadius: 1 },
  legLeft: { left: 7, transform: [{ rotate: '20deg' }] },
  legRight: { left: 15.3, transform: [{ rotate: '-20deg' }] },
});
