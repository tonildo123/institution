import React from 'react';
import { View, StyleSheet } from 'react-native';

type IconName = 'mail' | 'home' | 'clock' | 'users' | 'profile';

/** Íconos de trazo nativos, con el color activo del navegador. */
export const TabIcon = ({ name, color }: { name: IconName; color: string }) => {
  const stroke = { borderColor: color };
  const line = { backgroundColor: color };
  const person = (left: number, top: number) => (
    <View style={{ position: 'absolute', left, top }}>
      <View style={[styles.head, stroke]} />
      <View style={[styles.shoulders, stroke]} />
    </View>
  );

  return (
    <View style={styles.canvas} accessible={false}>
      {name === 'mail' && <>
        <View style={[styles.envelope, stroke]} />
        <View style={[styles.flap, stroke]} />
      </>}
      {name === 'home' && <>
        <View style={[styles.house, stroke]} />
        <View style={[styles.roof, stroke]} />
        <View style={[styles.door, stroke]} />
      </>}
      {name === 'clock' && <>
        <View style={[styles.circle, stroke]} />
        <View style={[styles.hour, line]} />
        <View style={[styles.minute, line]} />
      </>}
      {name === 'profile' && <>
        <View style={[styles.circle, stroke]} />
        {person(6, 5)}
      </>}
      {name === 'users' && <>
        {person(1, 3)}
        {person(12, 5)}
      </>}
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: { width: 24, height: 24 },
  circle: { position: 'absolute', left: 2, top: 2, width: 20, height: 20, borderWidth: 1.7, borderRadius: 10 },
  envelope: { position: 'absolute', left: 2, top: 5, width: 20, height: 14, borderWidth: 1.7, borderRadius: 2 },
  flap: { position: 'absolute', left: 6, top: 2, width: 12, height: 12, borderRightWidth: 1.7, borderBottomWidth: 1.7, transform: [{ rotate: '45deg' }] },
  house: { position: 'absolute', left: 5, top: 10, width: 14, height: 11, borderWidth: 1.7, borderTopWidth: 0 },
  roof: { position: 'absolute', left: 5, top: 5, width: 14, height: 14, borderLeftWidth: 1.7, borderTopWidth: 1.7, transform: [{ rotate: '45deg' }] },
  door: { position: 'absolute', left: 10, top: 14, width: 4, height: 7, borderWidth: 1.5, borderBottomWidth: 0 },
  hour: { position: 'absolute', left: 11, top: 6, width: 1.7, height: 7, borderRadius: 1 },
  minute: { position: 'absolute', left: 11, top: 11, width: 6, height: 1.7, transform: [{ rotate: '25deg' }] },
  head: { width: 6, height: 6, borderWidth: 1.5, borderRadius: 3, marginLeft: 3 },
  shoulders: { width: 12, height: 7, borderWidth: 1.5, borderBottomWidth: 0, borderTopLeftRadius: 6, borderTopRightRadius: 6, marginTop: 2 },
});
