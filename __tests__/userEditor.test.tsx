import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Alert, FlatList, TextInput, TouchableOpacity, Text } from 'react-native';
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Path: 'Path', Circle: 'Circle', Line: 'Line' }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: 'SafeAreaProvider', SafeAreaView: 'SafeAreaView' }));
jest.mock('../src/services/firebase/users', () => ({ getAllUsers: jest.fn(), updateUser: jest.fn(), createUser: jest.fn(), deleteUser: jest.fn() }));
jest.mock('../src/services/firebase/createAccount', () => ({ setUserPassword: jest.fn() }));
import { getAllUsers, updateUser } from '../src/services/firebase/users';
import { setUserPassword } from '../src/services/firebase/createAccount';
import { UsersManagementScreen } from '../src/screens/private/users/UsersManagementScreen';
let tree: ReactTestRenderer;
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  (getAllUsers as jest.Mock).mockResolvedValue([{ id: 'family', role: 'familia', displayName: 'Familia', dni: '70000000', isEnabled: true }]);
  (updateUser as jest.Mock).mockResolvedValue(undefined);
  (setUserPassword as jest.Mock).mockResolvedValue(undefined);
});
afterEach(async () => { await act(async () => { tree?.unmount(); }); jest.restoreAllMocks(); });
async function open() {
  await act(async () => { tree = create(<UsersManagementScreen />); });
  await act(async () => { tree.root.findAllByType(TouchableOpacity).find(button => button.props.accessibilityLabel === 'Editar Familia')!.props.onPress(); });
}
async function password(value: string) {
  await act(async () => { tree.root.findAllByType(TextInput).find(input => input.props.placeholder === 'Ingresá una nueva contraseña')!.props.onChangeText(value); });
}
async function save() {
  const buttons = tree.root.findAllByType(TouchableOpacity).filter(button => button.findAllByType(Text).some(text => text.props.children === 'Guardar'));
  expect(buttons).toHaveLength(1);
  await act(async () => { await buttons[0].props.onPress(); });
}
test('un solo Guardar actualiza perfil y nueva contraseña', async () => {
  await open(); await password('new-password'); await save();
  expect(updateUser).toHaveBeenCalledWith('family', expect.objectContaining({ dni: '70000000' }));
  expect(setUserPassword).toHaveBeenCalledWith('family', 'new-password');
  expect(Alert.alert).toHaveBeenCalledWith('Éxito', 'Usuario actualizado');
});
test('dejar la contraseña vacía conserva la actual', async () => {
  await open(); await save();
  expect(updateUser).toHaveBeenCalled();
  expect(setUserPassword).not.toHaveBeenCalled();
});
test('una contraseña inválida no guarda cambios', async () => {
  await open(); await password('short'); await save();
  expect(updateUser).not.toHaveBeenCalled();
  expect(setUserPassword).not.toHaveBeenCalled();
});
test('informa el resultado parcial y conserva el formulario si falla Auth', async () => {
  (setUserPassword as jest.Mock).mockRejectedValue(new Error('Sin conexión'));
  await open(); await password('new-password'); await save();
  expect(Alert.alert).toHaveBeenCalledWith('Contraseña sin actualizar', expect.stringContaining('Los datos del usuario se guardaron'));
  expect(tree.root.findAllByType(TextInput).find(input => input.props.placeholder === 'Ingresá una nueva contraseña')!.props.value).toBe('new-password');
});


test('los contadores filtran por grupo, se combinan con búsqueda y Total restablece el rol', async () => {
  (getAllUsers as jest.Mock).mockResolvedValue([
    { id: 'admin', role: 'admin', displayName: 'Admin' },
    { id: 'director', role: 'equipo directivo', displayName: 'Dirección' },
    { id: 'legal', role: 'representante legal', displayName: 'Representante' },
    { id: 'teacher', role: 'preceptor', displayName: 'Docente' },
    { id: 'family', role: 'familia', displayName: 'Familia' },
  ]);
  await act(async () => { tree = create(<UsersManagementScreen />); });
  const ids = () => tree.root.findByType(FlatList).props.data.map((user: { id: string }) => user.id);
  const select = async (label: string) => { await act(async () => {
    tree.root.findAllByType(TouchableOpacity).find(button => button.props.accessibilityLabel === `Filtrar ${label}`)!.props.onPress();
  }); };
  await select('Admins'); expect(ids()).toEqual(['admin', 'director', 'legal']);
  await select('Docentes'); expect(ids()).toEqual(['teacher']);
  await select('Familias'); expect(ids()).toEqual(['family']);
  await select('Total'); expect(ids()).toHaveLength(5);
  await act(async () => { tree.root.findAllByType(TextInput).find(input => input.props.accessibilityLabel === 'Buscar usuario')!.props.onChangeText('Dirección'); });
  await select('Admins'); expect(ids()).toEqual(['director']);
  await select('Docentes'); expect(ids()).toEqual([]);
  await select('Total'); expect(ids()).toEqual(['director']);
});
