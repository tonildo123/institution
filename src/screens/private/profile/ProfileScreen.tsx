import { ProblemReportsModal } from './ProblemReportsModal';
import { canManageReports } from '@/services/firebase/problemReports';
import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { TERMS_URL, PRIVACY_URL } from '@/config/links';
import { useProfileLogic } from './useProfileLogic';

/**
 * Pantalla de Perfil
 */

export const ProfileScreen = () => {
  const {
    user, roleLabel, familyCourses,
    reportsOpen, setReportsOpen,
    deactivating, confirmDeactivation,
    biometricOpen, setBiometricOpen, biometricBusy, biometricPassword, setBiometricPassword, biometricStatus, openBiometrics, configureBiometrics,
    photo, pickingPhoto, photoOptions,
    passwordVisibility, setPasswordVisibility,
    editing, setEditing, saving, form, setForm, openEditor, save,
    handleLogout,
  } = useProfileLogic();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.avatar} onPress={openEditor} accessibilityRole="button" accessibilityLabel="Editar foto de perfil">
            {user?.photoURL ? <Image source={{ uri: user.photoURL }} style={styles.avatarPhoto} /> : <><View style={styles.avatarHead} /><View style={styles.avatarShoulders} /></>}
          </TouchableOpacity>
          <Text style={styles.name}>{user?.displayName || 'Usuario'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.role}>{roleLabel.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nombre completo</Text>
              <Text style={styles.infoValue}>{user?.displayName}</Text>
            </View>
            {user?.email && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            )}
            {user?.dni && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>DNI</Text>
                <Text style={styles.infoValue}>{user.dni}</Text>
              </View>
            )}
            {user?.role === 'familia' && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{familyCourses.length > 1 ? 'Cursos' : 'Curso'}</Text>
                <Text style={styles.infoValue}>{familyCourses.length ? familyCourses.join('\n') : 'Sin curso asignado'}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rol</Text>
              <Text style={styles.infoValue}>{roleLabel}</Text>
            </View>
            <View style={[styles.infoItem, styles.lastRow]}>
              <Text style={styles.infoLabel}>Estado</Text>
              <Text style={[styles.statusText, !user?.isEnabled && styles.dangerText]}>
                {user?.isEnabled ? '✓ Activo' : '✗ Inactivo'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUENTA</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} accessibilityRole="button" accessibilityLabel="Editar perfil" onPress={openEditor}>
              <Text style={styles.actionIcon} accessible={false}>✎</Text>
              <Text style={styles.actionText}>Editar perfil</Text>
              <Text style={styles.chevron} accessible={false}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} accessibilityRole="button" accessibilityLabel="Cambiar contraseña" onPress={openEditor}>
              <Text style={styles.actionIcon} accessible={false}>⚿</Text>
              <Text style={styles.actionText}>Cambiar contraseña</Text>
              <Text style={styles.chevron} accessible={false}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} accessibilityRole="button" accessibilityLabel="Datos biométricos"
              onPress={() => { void openBiometrics(); }}>
              <Text style={styles.actionIcon} accessible={false}>◎</Text>
              <Text style={styles.actionText}>Datos biométricos</Text>
              <Text style={styles.chevron} accessible={false}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} accessibilityRole="button" onPress={() => setReportsOpen(true)}>
              <Text style={styles.actionIcon} accessible={false}>!</Text>
              <Text style={styles.actionText}>{canManageReports(user?.role) ? 'Reportes de problemas' : 'Reportar problema'}</Text>
              <Text style={styles.chevron} accessible={false}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} accessibilityRole="button" accessibilityLabel="Dar de baja mi cuenta" onPress={confirmDeactivation} disabled={deactivating}>
              <Text style={[styles.actionIcon, styles.dangerText]} accessible={false}>×</Text>
              <Text style={[styles.actionText, styles.dangerText]}>Dar de baja mi cuenta</Text>
              <Text style={styles.chevron} accessible={false}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionRow, styles.lastRow]} onPress={handleLogout} accessibilityRole="button">
              <Text style={[styles.actionIcon, styles.dangerText]} accessible={false}>↪</Text>
              <Text style={[styles.actionText, styles.dangerText]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LEGAL</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} accessibilityRole="link" accessibilityLabel="Conocé nuestros términos y condiciones" onPress={() => { void Linking.openURL(TERMS_URL); }}>
              <Text style={styles.actionText}>Conocé nuestros términos y condiciones</Text>
              <Text style={styles.chevron} accessible={false}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionRow, styles.lastRow]} accessibilityRole="link" accessibilityLabel="Conocé nuestra política de privacidad" onPress={() => { void Linking.openURL(PRIVACY_URL); }}>
              <Text style={styles.actionText}>Conocé nuestra política de privacidad</Text>
              <Text style={styles.chevron} accessible={false}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {reportsOpen && user && <ProblemReportsModal user={user} onClose={() => setReportsOpen(false)} />}
      <Modal visible={biometricOpen} animationType="slide" transparent onRequestClose={() => { if (!biometricBusy) setBiometricOpen(false); }}>
        <SafeAreaProvider><SafeAreaView style={styles.modalOverlay} edges={['top', 'left', 'right']}>
          <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <SafeAreaView style={styles.modalContent} edges={['bottom']}>
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>Datos biométricos</Text>
                <TouchableOpacity onPress={() => setBiometricOpen(false)} disabled={biometricBusy} accessibilityRole="button" accessibilityLabel="Cerrar datos biométricos"><Text style={styles.chevron}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.infoValue}>{biometricStatus.label} · {biometricStatus.enabled ? 'Activado en este teléfono' : 'Sin activar en este teléfono'}</Text>
                <Text style={styles.helpText}>Al activarlo podrás iniciar sesión con Face ID o huella, incluso después de cerrar sesión. Tu huella y los datos de Face ID permanecen en el teléfono.</Text>
                {!biometricStatus.available && <Text style={styles.helpText}>Necesitás un teléfono compatible con Face ID o huella configurada y la versión actualizada de la app.</Text>}
                <Text style={styles.infoLabel}>Contraseña actual</Text>
                <TextInput style={styles.input} value={biometricPassword} onChangeText={setBiometricPassword} secureTextEntry editable={!biometricBusy} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Contraseña para configurar biometría" />
                <TouchableOpacity style={[styles.saveButton, (!biometricStatus.available || biometricBusy) && { opacity: 0.5 }]} disabled={!biometricStatus.available || biometricBusy} onPress={() => { void configureBiometrics(true); }} accessibilityRole="button">
                  <Text style={styles.saveText}>{biometricBusy ? 'Verificando...' : biometricStatus.enabled ? 'Volver a vincular este teléfono' : 'Activar en este teléfono'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 18 }} disabled={biometricBusy} onPress={() => Alert.alert('Desactivar datos biométricos', 'Se desactivará el acceso biométrico de tu cuenta en todos tus dispositivos. Seguirás ingresando con contraseña.', [
                  { text: 'Cancelar', style: 'cancel' }, { text: 'Desactivar', style: 'destructive', onPress: () => { void configureBiometrics(false); } },
                ])} accessibilityRole="button"><Text style={styles.dangerText}>Desactivar en todos mis dispositivos</Text></TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </SafeAreaView></SafeAreaProvider>
      </Modal>
      <Modal visible={editing} animationType="slide" transparent onRequestClose={() => { if (!saving) setEditing(false); }}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.modalOverlay} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <SafeAreaView style={styles.modalContent} edges={['bottom']}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Editar perfil</Text>
                  <TouchableOpacity onPress={() => setEditing(false)} disabled={saving} accessibilityRole="button" accessibilityLabel="Cerrar edición de perfil"><Text style={styles.chevron}>✕</Text></TouchableOpacity>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled">
                  <TouchableOpacity style={styles.photoEditor} onPress={photoOptions} disabled={saving || pickingPhoto} accessibilityRole="button" accessibilityLabel="Elegir foto de perfil">
                    {photo?.uri || user?.photoURL ? <Image source={{ uri: photo?.uri || user?.photoURL }} style={styles.avatarPhoto} /> : <View style={styles.avatar}><View style={styles.avatarHead} /><View style={styles.avatarShoulders} /></View>}
                    <Text style={styles.helpText}>{pickingPhoto ? 'Abriendo fotos...' : photo || user?.photoURL ? 'Cambiar foto' : 'Agregar foto'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.infoLabel}>Nombre completo</Text>
                  <TextInput style={styles.input} value={form.displayName} onChangeText={displayName => setForm(current => ({ ...current, displayName }))} editable={!saving} maxLength={120} accessibilityLabel="Nombre completo" />
                  <Text style={styles.infoLabel}>{user?.role === 'familia' ? 'Correo de contacto' : 'Correo electrónico de acceso'}</Text>
                  <TextInput style={styles.input} value={form.email} onChangeText={email => setForm(current => ({ ...current, email }))} editable={!saving} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" accessibilityLabel="Correo electrónico" />
                  {user?.role === 'familia' && <Text style={styles.helpText}>Tu acceso sigue siendo con DNI y contraseña.</Text>}
                  <Text style={styles.infoLabel}>Nueva contraseña (opcional)</Text>
                  <View style={styles.passwordField}>
                    <TextInput style={[styles.input, styles.passwordInput]} value={form.password} onChangeText={password => setForm(current => ({ ...current, password }))} editable={!saving} secureTextEntry={!passwordVisibility.password} autoCapitalize="none" autoCorrect={false} maxLength={128} accessibilityLabel="Nueva contraseña" />
                    <TouchableOpacity style={styles.passwordToggle} disabled={saving} accessibilityRole="button"
                      accessibilityLabel={`${passwordVisibility.password ? 'Ocultar' : 'Mostrar'} nueva contraseña`}
                      onPress={() => setPasswordVisibility(current => ({ ...current, password: !current.password }))}>
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#536073" strokeWidth={1.8}>
                        <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <Circle cx={12} cy={12} r={3} />
                        {passwordVisibility.password && <Line x1={3} y1={3} x2={21} y2={21} />}
                      </Svg>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helpText}>Dejá este campo vacío para conservar tu contraseña.</Text>
                  {form.password !== '' && <>
                    <Text style={styles.infoLabel}>Confirmar nueva contraseña</Text>
                    <View style={styles.passwordField}>
                      <TextInput style={[styles.input, styles.passwordInput]} value={form.confirmation} onChangeText={confirmation => setForm(current => ({ ...current, confirmation }))} editable={!saving} secureTextEntry={!passwordVisibility.confirmation} autoCapitalize="none" autoCorrect={false} maxLength={128} accessibilityLabel="Confirmar nueva contraseña" />
                      <TouchableOpacity style={styles.passwordToggle} disabled={saving} accessibilityRole="button"
                        accessibilityLabel={`${passwordVisibility.confirmation ? 'Ocultar' : 'Mostrar'} confirmación de contraseña`}
                        onPress={() => setPasswordVisibility(current => ({ ...current, confirmation: !current.confirmation }))}>
                        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#536073" strokeWidth={1.8}>
                          <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <Circle cx={12} cy={12} r={3} />
                          {passwordVisibility.confirmation && <Line x1={3} y1={3} x2={21} y2={21} />}
                        </Svg>
                      </TouchableOpacity>
                    </View>
                  </>}
                  {(form.email.trim().toLowerCase() !== (user?.email || '') || form.password !== '') && <>
                    <Text style={styles.infoLabel}>Contraseña actual</Text>
                    <View style={styles.passwordField}>
                      <TextInput style={[styles.input, styles.passwordInput]} value={form.currentPassword} onChangeText={currentPassword => setForm(current => ({ ...current, currentPassword }))} editable={!saving} secureTextEntry={!passwordVisibility.currentPassword} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Contraseña actual" />
                      <TouchableOpacity style={styles.passwordToggle} disabled={saving} accessibilityRole="button"
                        accessibilityLabel={`${passwordVisibility.currentPassword ? 'Ocultar' : 'Mostrar'} contraseña actual`}
                        onPress={() => setPasswordVisibility(current => ({ ...current, currentPassword: !current.currentPassword }))}>
                        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#536073" strokeWidth={1.8}>
                          <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <Circle cx={12} cy={12} r={3} />
                          {passwordVisibility.currentPassword && <Line x1={3} y1={3} x2={21} y2={21} />}
                        </Svg>
                      </TouchableOpacity>
                    </View>
                  </>}
                </ScrollView>
                <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={save} disabled={saving || pickingPhoto} accessibilityRole="button" accessibilityLabel="Guardar perfil">
                  <Text style={styles.saveText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
                </TouchableOpacity>
              </SafeAreaView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};
