import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getAllUsers } from '@/services/firebase/users';
import { getSalaTeachers, setTeacherInSala, addUserToSala, getSalaUsers, removeUserFromSala, getTransferCursos, updateUserInSala, SalaLevel } from '@/services/firebase/salas';
import { setFamilyPassword } from '@/services/firebase/createAccount';
import { User } from '@/types';
import { cursoDisplayLabel } from '@/utils/cursoDisplayLabel';
import { styles } from '@/screens/private/salas/styles';

interface Props {
  level: SalaLevel;
  cursoId?: string;
  label: string;
  onClose: () => void;
}

export const FamiliasModal = ({ level, cursoId, label, onClose }: Props) => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [teacherIds, setTeacherIds] = useState<string[]>([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [familias, setFamilias] = useState<User[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetLevel, setTargetLevel] = useState<SalaLevel>(level);
  const [targetCurso, setTargetCurso] = useState(cursoId || '');
  const [newPassword, setNewPassword] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', dni: '', email: '' });

  const openUser = (user: User, edit: boolean) => {
    setNewPassword('');
    setTargetLevel(level);
    setTargetCurso(cursoId || '');
    setSelectedUser(user);
    setEditing(edit);
    setForm({ displayName: user.displayName, dni: user.dni || '', email: user.email || '' });
  };

  const savePassword = async () => {
    if (saving || !selectedUser) return;
    if (newPassword.length < 6 || newPassword.length > 128) {
      Alert.alert('Contraseña inválida', 'Usá entre 6 y 128 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await setFamilyPassword(selectedUser.id, newPassword);
      setNewPassword('');
      Alert.alert('Contraseña establecida', 'La familia ya puede ingresar con su DNI y esta contraseña.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo establecer la contraseña.');
    } finally {
      setSaving(false);
    }
  };

  const saveUser = async () => {
    if (saving || !selectedUser) return;
    const updates = { displayName: form.displayName.trim(), dni: form.dni.trim(), email: form.email.trim() };
    if (!updates.displayName || !updates.dni) {
      Alert.alert('Datos incompletos', 'El nombre y el DNI son requeridos.');
      return;
    }
    if (!targetCurso) {
      Alert.alert('Sala requerida', 'Seleccioná una sala de destino.');
      return;
    }
    setSaving(true);
    try {
      await updateUserInSala(selectedUser.id, { level, cursoId }, { level: targetLevel, cursoId: targetCurso }, updates);
      if (targetLevel !== level || targetCurso !== cursoId) {
        setMembers(current => current.filter(id => id !== selectedUser.id));
      }
      setFamilias(current => current.map(user => user.id === selectedUser.id ? { ...user, ...updates } : user));
      setSelectedUser(null);
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios. Intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (user: User) => {
    if (saving) return;
    Alert.alert('Quitar del curso', `¿Querés quitar a ${user.displayName} de ${label}? Su usuario y las asignaciones a otros cursos se conservarán.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: async () => {
        setSaving(true);
        try {
          await removeUserFromSala(level, user.id, cursoId);
          setMembers(current => current.filter(id => id !== user.id));
        } catch {
          Alert.alert('Error', 'No se pudo quitar la familia del curso. Intentá nuevamente.');
        } finally {
          setSaving(false);
        }
      } },
    ]);
  };

  useEffect(() => {
    let active = true;
    Promise.all([getAllUsers(), getSalaUsers(level, cursoId), cursoId ? getSalaTeachers(level, cursoId) : Promise.resolve([])])
      .then(([users, ids, docentes]) => {
        if (!active) return;
        setTeachers(users.filter(user => user.role === 'preceptor'));
        setTeacherIds(docentes);
        setFamilias(users.filter(user => user.role === 'familia'));
        setMembers(ids);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [level, cursoId]);

  const add = async (userId: string) => {
    if (saving) return;
    setSaving(true);
    try {
      await addUserToSala(level, userId, cursoId);
      setMembers(current => [...new Set([...current, userId])]);
      setSearch('');
    } catch {
      Alert.alert('Error', 'No se pudo agregar la familia. Intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const assignTeacher = async (user: User, assigned: boolean) => {
    if (saving || !cursoId) return;
    setSaving(true);
    try {
      await setTeacherInSala(level, cursoId, user.id, assigned);
      setTeacherIds(current => assigned ? [...new Set([...current, user.id])] : current.filter(id => id !== user.id));
      setTeacherSearch('');
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la asignación del docente.');
    } finally { setSaving(false); }
  };

  const removeTeacher = (user: User) => Alert.alert('Quitar docente', `¿Querés quitar a ${user.displayName} de ${label}? Perderá el permiso para enviar a este curso.`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Quitar', style: 'destructive', onPress: () => { void assignTeacher(user, false); } },
  ]);

  const transferCursos = getTransferCursos(level, cursoId);
  const transferLevels = [...new Set(transferCursos.map(curso => curso.level))];
  const assigned = familias.filter(user => members.includes(user.id));
  const term = search.trim().toLowerCase();
  const results = term ? familias.filter(user => !members.includes(user.id) &&
    [user.displayName, user.email, user.dni].some(value => value?.toLowerCase().includes(term))) : [];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={() => { if (!saving) { if (selectedUser) setSelectedUser(null); else onClose(); } }}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedUser ? (editing ? 'Editar usuario' : 'Detalle del usuario') : label}</Text>
            <TouchableOpacity onPress={() => selectedUser ? setSelectedUser(null) : onClose()} disabled={saving} accessibilityLabel="Cerrar">
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {selectedUser ? (
            <ScrollView keyboardShouldPersistTaps="handled">
              {!editing && selectedUser.photoURL && (
                <Image source={{ uri: selectedUser.photoURL }} style={styles.userDetailPhoto}
                  resizeMode="cover" accessibilityLabel={`Foto de perfil de ${selectedUser.displayName}`} />
              )}
              {(['displayName', 'dni', 'email'] as const).map(field => (
                <View key={field}>
                  <Text style={styles.fieldLabel}>{field === 'displayName' ? 'Nombre completo' : field === 'dni' ? 'DNI' : 'Correo electrónico'}</Text>
                  {editing ? <TextInput
                    style={styles.searchInput} value={form[field]}
                    onChangeText={value => setForm(current => ({ ...current, [field]: value }))}
                    editable={!saving} autoCapitalize={field === 'displayName' ? 'words' : 'none'}
                    keyboardType={field === 'dni' ? 'numeric' : field === 'email' ? 'email-address' : 'default'}
                    accessibilityLabel={field === 'displayName' ? 'Nombre completo' : field === 'dni' ? 'DNI' : 'Correo electrónico'}
                  /> : <Text style={styles.fieldValue}>{selectedUser[field] || 'Sin informar'}</Text>}
                </View>
              ))}
              {!editing && <><Text style={styles.fieldLabel}>Estado</Text><Text style={styles.fieldValue}>{selectedUser.isEnabled ? 'Activo' : 'Inactivo'}</Text></>}
              {editing && (
                <View style={styles.salaSelector}>
                  <Text style={styles.fieldLabel}>Sala / curso</Text>
                  <Text style={styles.userEmail}>Actual: {label}. Podés elegir el mismo año o el siguiente, en cualquiera de sus turnos.</Text>
                  <View style={styles.levelOptions}>
                    {transferLevels.map(option => (
                      <TouchableOpacity key={option} disabled={saving} accessibilityRole="radio" accessibilityState={{ checked: targetLevel === option }}
                        style={[styles.levelOption, targetLevel === option && styles.selectedOption]}
                        onPress={() => { setTargetLevel(option); setTargetCurso(option === level ? cursoId || '' : transferCursos.find(curso => curso.level === option)?.id || ''); }}>
                        <Text style={styles.fieldLabel}>{option === 'inicial' ? 'Inicial' : option === 'primario' ? 'Primario' : 'Secundario'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {transferCursos.filter(curso => curso.level === targetLevel).map(curso => (
                    <TouchableOpacity key={curso.id} disabled={saving} accessibilityRole="radio" accessibilityState={{ checked: targetCurso === curso.id }}
                      style={[styles.courseOption, targetCurso === curso.id && styles.selectedOption]} onPress={() => setTargetCurso(curso.id)}>
                      <Text style={styles.userName}>{targetCurso === curso.id ? '●' : '○'} {cursoDisplayLabel(curso.label)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {editing && <TouchableOpacity style={styles.saveButton} onPress={saveUser} disabled={saving} accessibilityRole="button">
                <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
              </TouchableOpacity>}
              {editing && <View style={styles.passwordSection}>
                <Text style={styles.fieldLabel}>Contraseña de acceso de la familia</Text>
                <TextInput style={styles.searchInput} secureTextEntry autoCapitalize="none" autoCorrect={false}
                  value={newPassword} onChangeText={setNewPassword} editable={!saving} placeholder="Nueva contraseña (mínimo 6 caracteres)"
                  accessibilityLabel="Nueva contraseña de la familia" />
                <TouchableOpacity style={styles.saveButton} disabled={saving} onPress={savePassword} accessibilityRole="button">
                  <Text style={styles.saveButtonText}>Establecer contraseña</Text>
                </TouchableOpacity>
              </View>}
              <TouchableOpacity style={styles.backButton} onPress={() => setSelectedUser(null)} disabled={saving} accessibilityRole="button">
                <Text style={styles.fieldLabel}>Volver al curso</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : loading ? <ActivityIndicator size="large" /> : error ? (
            <Text style={styles.noResultsText}>No se pudieron cargar las familias. Cerrá y volvé a abrir el curso.</Text>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              {cursoId && <View style={styles.usersInSalaContainer}>
                <Text style={styles.usersInSalaTitle}>Docentes asignados ({teacherIds.length})</Text>
                {teachers.filter(user => teacherIds.includes(user.id)).map(user => (
                  <View key={user.id} style={styles.userSearchItem}>
                    <View style={styles.assignedUserInfo}><Text style={styles.userName}>{user.displayName}</Text><Text style={styles.userEmail}>{user.email}</Text></View>
                    <TouchableOpacity disabled={saving} accessibilityRole="button" accessibilityLabel={`Quitar docente ${user.displayName}`} onPress={() => removeTeacher(user)}><Text style={styles.addButton}>Quitar</Text></TouchableOpacity>
                  </View>
                ))}
                {teacherIds.length === 0 && <Text style={styles.userEmail}>No hay docentes asignados a este curso.</Text>}
                <TextInput style={styles.searchInput} value={teacherSearch} onChangeText={setTeacherSearch} editable={!saving}
                  placeholder="Buscar docente por nombre o email..." accessibilityLabel="Buscar docente" />
                {teacherSearch.trim() !== '' && teachers.filter(user => !teacherIds.includes(user.id) && user.isEnabled &&
                  [user.displayName, user.email].some(value => value?.toLowerCase().includes(teacherSearch.trim().toLowerCase()))).map(user => (
                  <TouchableOpacity key={user.id} style={styles.userSearchItem} disabled={saving} onPress={() => { void assignTeacher(user, true); }} accessibilityRole="button" accessibilityLabel={`Asignar docente ${user.displayName}`}>
                    <View style={styles.assignedUserInfo}><Text style={styles.userName}>{user.displayName}</Text><Text style={styles.userEmail}>{user.email}</Text></View><Text style={styles.addButton}>+</Text>
                  </TouchableOpacity>
                ))}
              </View>}
              <Text style={styles.usersInSalaTitle}>Agregar alumno/familia registrada</Text>
              <TextInput style={styles.searchInput} placeholder="Buscar por nombre, email o DNI..." placeholderTextColor="#999" value={search} onChangeText={setSearch} editable={!saving} />
              {saving && <ActivityIndicator />}
              {term !== '' && (
                <View>
                  <Text style={styles.searchResultsTitle}>Resultados ({results.length})</Text>
                  {results.length === 0 && <Text style={styles.noResultsText}>No hay resultados</Text>}
                  {results.map(user => (
                    <TouchableOpacity key={user.id} style={styles.userSearchItem} disabled={saving} onPress={() => add(user.id)}>
                      <View style={styles.userSearchInfo}>
                        <Text style={styles.userSearchName}>{user.displayName}</Text>
                        {user.dni && <Text style={styles.userSearchDni}>DNI: {user.dni}</Text>}
                        {user.email && <Text style={styles.userSearchEmail}>{user.email}</Text>}
                      </View>
                      <Text style={styles.addButton}>+</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={styles.usersInSalaTitle}>Familias asignadas ({assigned.length})</Text>
              {assigned.length === 0 && <Text style={styles.noResultsText}>Todavía no hay familias asignadas</Text>}
              <View style={styles.usersList}>
                {assigned.map(user => (
                  <View key={user.id} style={styles.userItem}>
                    <View style={styles.assignedUserInfo}>
                      <Text style={styles.userName}>{user.displayName}</Text>
                      {user.dni && <Text style={styles.userDni}>DNI: {user.dni}</Text>}
                      {user.email && <Text style={styles.userEmail}>{user.email}</Text>}
                    </View>
                    <View style={styles.userActions}>
                      <TouchableOpacity style={styles.userActionButton} onPress={() => openUser(user, false)} disabled={saving} accessibilityRole="button" accessibilityLabel={`Ver ${user.displayName}`}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#0c6b58" strokeWidth={1.8}><Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><Circle cx={12} cy={12} r={3} /></Svg>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.userActionButton} onPress={() => openUser(user, true)} disabled={saving} accessibilityRole="button" accessibilityLabel={`Editar ${user.displayName}`}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth={1.8}><Path d="m15 4 5 5M4 20l5-1L21 7a3.5 3.5 0 0 0-5-5L4 14Z" /></Svg>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.userActionButton} onPress={() => remove(user)} disabled={saving} accessibilityRole="button" accessibilityLabel={`Quitar a ${user.displayName} del curso`}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#d21f1a" strokeWidth={1.8}><Path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></Svg>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
