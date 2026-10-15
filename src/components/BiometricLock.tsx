import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '@/redux/store';
import { setUser } from '@/redux/slices/authSlice';
import { logout } from '@/services/firebase/auth';
import { consumeVerifiedUnlock, getBiometricDevice, subscribeBiometrics, unlockWithBiometrics } from '@/services/biometrics';

export const BiometricLock = ({ children }: { children: React.ReactNode }) => {
  const uid = useSelector((state: RootState) => state.auth.user?.id);
  const dispatch = useDispatch();
  const backgroundVersion = useRef(0);
  const [checkedUid, setCheckedUid] = useState<string | undefined>();
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    const check = async () => {
      const device = await getBiometricDevice();
      if (!active) return;
      setCheckedUid(uid);
      setLocked(Boolean(uid && device?.uid === uid && !consumeVerifiedUnlock(uid)));
    };
    void check();
    const unsubscribe = subscribeBiometrics(() => { void check(); });
    const listener = AppState.addEventListener('change', state => {
      // Los diálogos de Face ID cambian a inactive: no bloquear por ese evento.
      if (state === 'background') { backgroundVersion.current += 1; void check(); }
    });
    return () => { active = false; unsubscribe(); listener.remove(); };
  }, [uid]);
  const unlock = async () => {
    if (busy) return;
    setBusy(true);
    const version = backgroundVersion.current;
    try { await unlockWithBiometrics(); if (version === backgroundVersion.current) setLocked(false); }
    catch (error: any) { Alert.alert('No se pudo desbloquear', error.message || 'Intentá nuevamente o ingresá con contraseña.'); }
    finally { setBusy(false); }
  };
  const passwordLogin = async () => {
    if (busy) return;
    setBusy(true);
    try { await logout(); dispatch(setUser(null)); await AsyncStorage.removeItem('user'); }
    catch { Alert.alert('Error', 'No se pudo cerrar la sesión. Intentá nuevamente.'); }
    finally { setBusy(false); }
  };
  const visible = Boolean(uid && (checkedUid !== uid || locked));
  return <>
    {children}
    <Modal visible={visible} animationType="fade" onRequestClose={() => {}}>
      <SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 20 }}>Desbloquear IMEP</Text>
        <Text style={{ textAlign: 'center', marginBottom: 24 }}>Confirmá tu identidad con Face ID o huella para continuar.</Text>
        {busy && <ActivityIndicator />}
        <TouchableOpacity onPress={unlock} disabled={busy || checkedUid !== uid} accessibilityRole="button" style={{ padding: 18, backgroundColor: '#0c6b58', borderRadius: 10 }}><Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Desbloquear</Text></TouchableOpacity>
        <TouchableOpacity onPress={passwordLogin} disabled={busy} accessibilityRole="button" style={{ padding: 18 }}><Text style={{ textAlign: 'center' }}>Ingresar con contraseña</Text></TouchableOpacity>
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  </>;
};
