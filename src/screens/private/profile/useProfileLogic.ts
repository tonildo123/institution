import { useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import type { MessageImage } from '@/services/messageImages';
import { biometricAvailability, getBiometricDevice, enableBiometrics, disableBiometrics } from '@/services/biometrics';
import { pickProfilePhoto, uploadProfilePhoto } from '@/services/profilePhotos';
import { saveOwnProfile, deactivateOwnAccount } from '@/services/firebase/profile';
import { setUser } from '@/redux/slices/authSlice';
import { RootState } from '@/redux/store';
import { useAuth } from '@/hooks/useAuth';
import { getCursos } from '@/services/firebase/salas';
import { cursoDisplayLabel } from '@/utils/cursoDisplayLabel';

const emptyForm = { displayName: '', email: '', password: '', confirmation: '', currentPassword: '' };

export const useProfileLogic = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout } = useAuth();
  const dispatch = useDispatch();
  const [reportsOpen, setReportsOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [biometricOpen, setBiometricOpen] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [biometricPassword, setBiometricPassword] = useState('');
  const [biometricStatus, setBiometricStatus] = useState({ available: false, label: 'Comprobando...', enabled: false });
  const [photo, setPhoto] = useState<MessageImage | null>(null);
  const [pickingPhoto, setPickingPhoto] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({ password: false, confirmation: false, currentPassword: false });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const confirmDeactivation = () => {
    if (deactivating) return;
    Alert.alert('Dar de baja mi cuenta', 'Tu cuenta quedará deshabilitada y se cerrará la sesión. Para volver a ingresar, la institución deberá habilitarla nuevamente. ¿Querés continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Dar de baja', style: 'destructive', onPress: async () => {
        setDeactivating(true);
        try {
          await deactivateOwnAccount();
        } catch (error: any) {
          Alert.alert('No se pudo dar de baja la cuenta', error.message || 'Intentá nuevamente.');
          setDeactivating(false);
          return;
        }
        try { await logout(); }
        catch { Alert.alert('Cuenta deshabilitada', 'La baja se guardó, pero no se pudo cerrar la sesión. Intentá cerrar sesión nuevamente.'); }
        finally { setDeactivating(false); }
      } },
    ]);
  };

  const openBiometrics = async () => {
    setBiometricPassword('');
    setBiometricOpen(true);
    const [sensor, device] = await Promise.all([biometricAvailability(), getBiometricDevice()]);
    setBiometricStatus({ ...sensor, enabled: Boolean(user && device?.uid === user.id) });
  };

  const configureBiometrics = async (enable: boolean) => {
    if (biometricBusy) return;
    setBiometricBusy(true);
    try {
      if (enable) await enableBiometrics(biometricPassword);
      else await disableBiometrics(biometricPassword);
      setBiometricStatus(current => ({ ...current, enabled: enable }));
      setBiometricPassword('');
      Alert.alert('Datos biométricos', enable ? 'Activados para iniciar sesión desde este teléfono.' : 'Desactivados en tus dispositivos. Podés seguir ingresando con contraseña.');
    } catch (error: any) { Alert.alert('Datos biométricos', error.message || 'No se pudo completar la configuración.'); }
    finally { setBiometricBusy(false); }
  };

  const openEditor = () => {
    setPasswordVisibility({ password: false, confirmation: false, currentPassword: false });
    setPhoto(null);
    setForm({ displayName: user?.displayName || '', email: user?.email || '', password: '', confirmation: '', currentPassword: '' });
    setEditing(true);
  };

  const choosePhoto = async (camera: boolean) => {
    if (saving || pickingPhoto) return;
    setPickingPhoto(true);
    try { const picked = await pickProfilePhoto(camera); if (picked) setPhoto(picked); }
    catch (error: any) { Alert.alert('Foto de perfil', error.message || 'No se pudo seleccionar la foto.'); }
    finally { setPickingPhoto(false); }
  };

  const photoOptions = () => Alert.alert('Foto de perfil', 'Elegí cómo agregar tu foto', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Elegir de la galería', onPress: () => { void choosePhoto(false); } },
    { text: 'Tomar foto', onPress: () => { void choosePhoto(true); } },
  ]);

  const save = async () => {
    if (!user || saving || pickingPhoto) return;
    const displayName = form.displayName.trim();
    const email = form.email.trim().toLowerCase();
    if (!displayName || displayName.length > 120) { Alert.alert('Nombre inválido', 'Ingresá tu nombre (hasta 120 caracteres).'); return; }
    if ((user.role !== 'familia' && !email) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      Alert.alert('Correo inválido', 'Ingresá un correo electrónico válido.'); return;
    }
    if (form.password && (form.password.length < 6 || form.password.length > 128)) {
      Alert.alert('Contraseña inválida', 'Usá entre 6 y 128 caracteres.'); return;
    }
    if (form.password !== form.confirmation) { Alert.alert('Contraseñas diferentes', 'La confirmación debe coincidir con la nueva contraseña.'); return; }
    if ((email !== (user.email || '') || form.password) && !form.currentPassword) {
      Alert.alert('Confirmá tu identidad', 'Ingresá tu contraseña actual para guardar el correo o una nueva contraseña.'); return;
    }
    setSaving(true);
    try {
      if (photo) await uploadProfilePhoto(photo);
      const changes = await saveOwnProfile({ displayName, email, ...(photo ? { photoPath: photo.path } : {}), ...(form.password ? { password: form.password } : {}) }, form.currentPassword, user.email || '');
      const updated = { ...user, ...changes };
      dispatch(setUser(updated));
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      setEditing(false);
      setForm(emptyForm);
      Alert.alert('Perfil actualizado', 'Tus cambios se guardaron correctamente.');
    } catch (error: any) {
      if (error.profileChanges) {
        const updated = { ...user, ...error.profileChanges };
        dispatch(setUser(updated));
        await AsyncStorage.setItem('user', JSON.stringify(updated));
      }
      Alert.alert('No se pudo completar el guardado', error.message || 'Intentá nuevamente.');
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      {
        text: 'Cancelar',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Cerrar Sesión',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar la sesión');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const roleLabel = user?.role === 'admin' || user?.role === 'equipo directivo' || user?.role === 'representante legal'
    ? 'Administrador' : user?.role === 'preceptor' ? 'Docente' : 'Familia';
  const familyCourses = user?.role === 'familia'
    ? (['inicial', 'primario', 'secundario'] as const).flatMap(level =>
      getCursos(level).filter(course => user.assignedCursos?.includes(course.id))
        .map(course => `${level === 'inicial' ? 'Inicial' : level === 'primario' ? 'Primario' : 'Secundario'} · ${cursoDisplayLabel(course.label)}`))
    : [];

  return {
    user, roleLabel, familyCourses,
    reportsOpen, setReportsOpen,
    deactivating, confirmDeactivation,
    biometricOpen, setBiometricOpen, biometricBusy, biometricPassword, setBiometricPassword, biometricStatus, openBiometrics, configureBiometrics,
    photo, pickingPhoto, photoOptions,
    passwordVisibility, setPasswordVisibility,
    editing, setEditing, saving, form, setForm, openEditor, save,
    handleLogout,
  };
};
