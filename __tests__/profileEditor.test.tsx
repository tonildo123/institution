import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Alert, TextInput, TouchableOpacity } from 'react-native';
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Path: 'Path', Circle: 'Circle', Line: 'Line' }));
jest.mock('../src/services/firebase/salas', () => ({ getCursos: (level: string) => level === 'primario' ? [{ id: 'grado-1-tt', label: '1° GRADO TT' }] : [] }));
const mockDispatch = jest.fn();
const mockLogout = jest.fn();
const mockUser = { id: 'self', role: 'familia', displayName: 'Familia', email: '', dni: '70000000', isEnabled: true, assignedCursos: ['grado-1-tt'] };
jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() }));
jest.mock('../src/redux/slices/authSlice', () => ({ setUser: (payload: unknown) => ({ type: 'auth/setUser', payload }) }));
jest.mock('react-redux', () => ({ useSelector: (selector: any) => selector({ auth: { user: mockUser } }), useDispatch: () => mockDispatch }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: 'SafeAreaProvider', SafeAreaView: 'SafeAreaView' }));
jest.mock('../src/services/profilePhotos', () => ({ pickProfilePhoto: jest.fn(), uploadProfilePhoto: jest.fn() }));
jest.mock('../src/hooks/useAuth', () => ({ useAuth: () => ({ logout: mockLogout }) }));
jest.mock('../src/services/biometrics', () => ({ biometricAvailability: jest.fn(), getBiometricDevice: jest.fn(), enableBiometrics: jest.fn(), disableBiometrics: jest.fn() }));
jest.mock('../src/services/firebase/profile', () => ({ saveOwnProfile: jest.fn(), deactivateOwnAccount: jest.fn() }));
import { pickProfilePhoto, uploadProfilePhoto } from '../src/services/profilePhotos';
import { saveOwnProfile, deactivateOwnAccount } from '../src/services/firebase/profile';
import { ProfileScreen } from '../src/screens/private/profile/ProfileScreen';
let tree: ReactTestRenderer;
beforeEach(() => { jest.clearAllMocks(); jest.spyOn(Alert, 'alert').mockImplementation(() => {}); (saveOwnProfile as jest.Mock).mockResolvedValue({ displayName: 'Nuevo', email: '' }); });
afterEach(async () => { await act(async () => { tree?.unmount(); }); jest.restoreAllMocks(); });
const button = (label: string) => tree.root.findAllByType(TouchableOpacity).find(item => item.props.accessibilityLabel === label)!;
async function field(label: string, value: string) { await act(async () => { tree.root.findAllByType(TextInput).find(item => item.props.accessibilityLabel === label)!.props.onChangeText(value); }); }
async function open() { await act(async () => { tree = create(<ProfileScreen />); }); await act(async () => { button('Editar perfil').props.onPress(); }); }
test('todos los perfiles ofrecen Datos biométricos y el guardado propio no envía rol ni DNI', async () => {
  await open(); expect(button('Datos biométricos')).toBeDefined();
  await field('Nombre completo', 'Nuevo');
  await act(async () => { await button('Guardar perfil').props.onPress(); });
  expect(saveOwnProfile).toHaveBeenCalledWith({ displayName: 'Nuevo', email: '' }, '', '');
  expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ displayName: 'Nuevo', dni: '70000000' }) }));
});
test('para correo o nueva contraseña exige confirmar la contraseña actual', async () => {
  await open(); await field('Correo electrónico', 'contact@example.com');
  await act(async () => { await button('Guardar perfil').props.onPress(); });
  expect(saveOwnProfile).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith('Confirmá tu identidad', expect.any(String));
});
test('no guarda contraseñas cuya confirmación sea diferente', async () => {
  await open(); await field('Nueva contraseña', 'new-secret'); await field('Confirmar nueva contraseña', 'another-secret');
  await act(async () => { await button('Guardar perfil').props.onPress(); });
  expect(saveOwnProfile).not.toHaveBeenCalled();
});


test('seleccionar una foto y Guardar actualiza el avatar de la sesión', async () => {
  const photo = { uri: 'file://photo.jpg', contentType: 'image/jpeg', path: 'profile-photos/self/photo-id' };
  (pickProfilePhoto as jest.Mock).mockResolvedValue(photo);
  (uploadProfilePhoto as jest.Mock).mockResolvedValue(undefined);
  (saveOwnProfile as jest.Mock).mockResolvedValue({ displayName: 'Familia', email: '', photoURL: 'https://example.com/photo.jpg' });
  await open();
  await act(async () => { button('Elegir foto de perfil').props.onPress(); });
  const options = (Alert.alert as jest.Mock).mock.calls.at(-1)[2];
  await act(async () => { options.find((item: any) => item.text === 'Elegir de la galería').onPress(); });
  await act(async () => { await button('Guardar perfil').props.onPress(); });
  expect(uploadProfilePhoto).toHaveBeenCalledWith(photo);
  expect(saveOwnProfile).toHaveBeenCalledWith(expect.objectContaining({ photoPath: photo.path }), '', '');
  expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ photoURL: 'https://example.com/photo.jpg' }) }));
});

test('los ojitos muestran cada contraseña de forma independiente y se reinician al abrir el editor', async () => {
  await open();
  await field('Nueva contraseña', 'new-secret');
  const input = (label: string) => tree.root.findAllByType(TextInput).find(item => item.props.accessibilityLabel === label)!;
  expect(input('Nueva contraseña').props.secureTextEntry).toBe(true);
  expect(input('Confirmar nueva contraseña').props.secureTextEntry).toBe(true);
  expect(input('Contraseña actual').props.secureTextEntry).toBe(true);
  for (const [toggle, label] of [['nueva contraseña', 'Nueva contraseña'], ['confirmación de contraseña', 'Confirmar nueva contraseña'], ['contraseña actual', 'Contraseña actual']]) {
    await act(async () => { button(`Mostrar ${toggle}`).props.onPress(); });
    expect(input(label).props.secureTextEntry).toBe(false);
    await act(async () => { button(`Ocultar ${toggle}`).props.onPress(); });
    expect(input(label).props.secureTextEntry).toBe(true);
  }
  expect(input('Nueva contraseña').props.value).toBe('new-secret');
  await act(async () => { button('Mostrar nueva contraseña').props.onPress(); });
  expect(input('Contraseña actual').props.secureTextEntry).toBe(true);
  await act(async () => { button('Editar perfil').props.onPress(); });
  expect(input('Nueva contraseña').props.secureTextEntry).toBe(true);
});

test('dar de baja pide confirmación y cierra sesión solo después de guardar', async () => {
  await open();
  await act(async () => { button('Dar de baja mi cuenta').props.onPress(); });
  expect(deactivateOwnAccount).not.toHaveBeenCalled();
  expect(mockLogout).not.toHaveBeenCalled();
  const options = (Alert.alert as jest.Mock).mock.calls.at(-1)[2];
  expect(options.find((item: any) => item.text === 'Cancelar').style).toBe('cancel');
  (deactivateOwnAccount as jest.Mock).mockImplementation(async () => { expect(mockLogout).not.toHaveBeenCalled(); });
  await act(async () => { await options.find((item: any) => item.text === 'Dar de baja').onPress(); });
  expect(deactivateOwnAccount).toHaveBeenCalledTimes(1);
  expect(mockLogout).toHaveBeenCalledTimes(1);
});
test('si falla la baja conserva la sesión y muestra el error', async () => {
  await open();
  (deactivateOwnAccount as jest.Mock).mockRejectedValueOnce(new Error('Sin conexión'));
  await act(async () => { button('Dar de baja mi cuenta').props.onPress(); });
  const options = (Alert.alert as jest.Mock).mock.calls.at(-1)[2];
  await act(async () => { await options.find((item: any) => item.text === 'Dar de baja').onPress(); });
  expect(mockLogout).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith('No se pudo dar de baja la cuenta', 'Sin conexión');
});

test('el perfil familiar muestra el curso con su nivel y turno', async () => {
  await open();
  expect(JSON.stringify(tree.toJSON())).toContain('Primario · 1° Grado Turno Tarde');
});
