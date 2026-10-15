import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Alert, TextInput, TouchableOpacity } from 'react-native';
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Path: 'Path', Circle: 'Circle' }));
jest.mock('../src/services/firebase/users', () => ({ getAllUsers: jest.fn() }));
jest.mock('../src/services/firebase/createAccount', () => ({ setFamilyPassword: jest.fn() }));
jest.mock('../src/services/firebase/salas', () => ({
  getSalaTeachers: jest.fn(), setTeacherInSala: jest.fn(), getSalaUsers: jest.fn(),
  addUserToSala: jest.fn(), removeUserFromSala: jest.fn(), getTransferCursos: () => [], updateUserInSala: jest.fn(),
}));
import { FamiliasModal } from '../src/components/salas/FamiliasModal';
import { getAllUsers } from '../src/services/firebase/users';
import { getSalaTeachers, getSalaUsers, setTeacherInSala, addUserToSala } from '../src/services/firebase/salas';
let tree: ReactTestRenderer;
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  (getAllUsers as jest.Mock).mockResolvedValue([
    { id: 'teacher', role: 'preceptor', displayName: 'Docente Uno', email: 'teacher@example.com', isEnabled: true },
    { id: 'family', role: 'familia', displayName: 'Familia', dni: '70000000', isEnabled: true },
  ]);
  (getSalaTeachers as jest.Mock).mockResolvedValue([]);
  (getSalaUsers as jest.Mock).mockResolvedValue(['family']);
  (setTeacherInSala as jest.Mock).mockResolvedValue(undefined);
});
afterEach(async () => { await act(async () => { tree?.unmount(); }); jest.restoreAllMocks(); });
async function mount() { await act(async () => { tree = create(<FamiliasModal level="primario" cursoId="grado-3-tt" label="3er grado turno tarde" onClose={jest.fn()} />); }); }
function button(label: string) { return tree.root.findAllByType(TouchableOpacity).find(item => item.props.accessibilityLabel === label)!; }
test('asigna un docente al curso exacto sin agregarlo a la lista de familias', async () => {
  await mount();
  await act(async () => { tree.root.findAllByType(TextInput).find(input => input.props.accessibilityLabel === 'Buscar docente')!.props.onChangeText('Docente'); });
  await act(async () => { button('Asignar docente Docente Uno').props.onPress(); });
  expect(setTeacherInSala).toHaveBeenCalledWith('primario', 'grado-3-tt', 'teacher', true);
  expect(addUserToSala).not.toHaveBeenCalled();
  expect(button('Quitar docente Docente Uno')).toBeDefined();
});
test('quitar docente exige confirmar antes de cambiar la asignación', async () => {
  (getSalaTeachers as jest.Mock).mockResolvedValue(['teacher']);
  await mount();
  await act(async () => { button('Quitar docente Docente Uno').props.onPress(); });
  expect(setTeacherInSala).not.toHaveBeenCalled();
  const actions = (Alert.alert as jest.Mock).mock.calls[0][2];
  await act(async () => { actions.find((item: { text: string }) => item.text === 'Quitar').onPress(); });
  expect(setTeacherInSala).toHaveBeenCalledWith('primario', 'grado-3-tt', 'teacher', false);
});
