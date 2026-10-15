import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmailAuthProvider, reauthenticateWithCredential, signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { getUserData } from './firebase/auth';

const STORAGE_KEY = 'imep.biometric.device.v1';
export interface BiometricDevice { uid: string; deviceId: string; publicKey?: string }
const native = new ReactNativeBiometrics({ allowDeviceCredentials: false });
const listeners = new Set<() => void>();
let verifiedUid: string | null = null;
export const subscribeBiometrics = (callback: () => void) => { listeners.add(callback); return () => { listeners.delete(callback); }; };
export function allowSessionUnlock(uid: string) { verifiedUid = uid; }
export function consumeVerifiedUnlock(uid: string) { const verified = verifiedUid === uid; if (verified) verifiedUid = null; return verified; }
export async function getBiometricDevice(): Promise<BiometricDevice | null> {
  try {
    const stored = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY) || 'null');
    return stored && typeof stored.uid === 'string' && /^[a-f0-9]{64}$/.test(stored.deviceId) ? stored : null;
  } catch { return null; }
}
export async function biometricAvailability(): Promise<{ available: boolean; label: string }> {
  try {
    const result = await native.isSensorAvailable();
    return { available: result.available, label: result.biometryType === 'FaceID' ? 'Face ID' : result.biometryType === 'TouchID' ? 'Touch ID' : 'Huella digital' };
  } catch { return { available: false, label: 'Biometría no disponible' }; }
}
async function rpc(name: string, data: unknown, authenticated = true): Promise<any> {
  await auth.authStateReady();
  const token = authenticated ? await auth.currentUser?.getIdToken() : null;
  if (authenticated && !token) throw new Error('Volvé a iniciar sesión.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`https://us-central1-${auth.app.options.projectId}.cloudfunctions.net/${name}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ data }), signal: controller.signal,
    });
    const payload = await response.json();
    if (!response.ok || payload.error) throw new Error(payload.error?.message || 'No se pudo verificar la operación.');
    return payload.result ?? payload.data;
  } finally { clearTimeout(timeout); }
}
async function passwordConfirmation(password: string) {
  const account = auth.currentUser;
  if (!account?.email || !password) throw new Error('Ingresá tu contraseña actual.');
  try { await reauthenticateWithCredential(account, EmailAuthProvider.credential(account.email, password)); }
  catch { throw new Error('No se pudo confirmar tu contraseña actual.'); }
  await account.getIdToken(true);
  return account.uid;
}
export async function enableBiometrics(password: string) {
  const uid = await passwordConfirmation(password);
  const previous = await getBiometricDevice();
  if (previous && previous.uid !== uid) throw new Error('Este teléfono está vinculado a otra cuenta. Ingresá con esa cuenta y desactivá sus datos biométricos antes de cambiarla.');
  if (!(await biometricAvailability()).available) throw new Error('Configurá Face ID o una huella en los ajustes del teléfono y volvé a intentar. Si actualizaste la app, necesitás la nueva compilación nativa.');
  const existingKeys = previous ? await native.biometricKeysExist() : { keysExist: false };
  const publicKey = previous?.publicKey && existingKeys.keysExist ? previous.publicKey : (await native.createKeys()).publicKey;
  const proof = await native.createSignature({ promptMessage: 'Activar acceso biométrico', payload: `imep:enroll:${uid}:${publicKey}`, cancelButtonText: 'Cancelar' });
  if (!proof.success || !proof.signature) throw new Error('Activación cancelada.');
  const result = await rpc('enrollBiometrics', { publicKey, signature: proof.signature, ...(previous ? { previousDeviceId: previous.deviceId } : {}) });
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ uid, deviceId: result.deviceId, publicKey }));
  verifiedUid = uid;
  listeners.forEach(callback => callback());
}
export async function disableBiometrics(password: string) {
  const uid = await passwordConfirmation(password);
  await rpc('disableBiometrics', {});
  const stored = await getBiometricDevice();
  if (stored?.uid === uid) { await native.deleteKeys(); await AsyncStorage.removeItem(STORAGE_KEY); }
  verifiedUid = null;
  listeners.forEach(callback => callback());
}
async function signAction(action: 'login' | 'unlock' | 'send', message?: unknown) {
  const device = await getBiometricDevice();
  if (!device) throw new Error('Activá los datos biométricos desde tu perfil.');
  if (action !== 'login' && device.uid !== auth.currentUser?.uid) throw new Error('Este dispositivo biométrico pertenece a otra cuenta.');
  const keys = await native.biometricKeysExist();
  if (!keys.keysExist) throw new Error('Ingresá con contraseña y volvé a activar los datos biométricos.');
  const challenge = await rpc('biometricChallenge', { deviceId: device.deviceId, action, ...(message ? { message } : {}) }, action !== 'login');
  const signature = await native.createSignature({ promptMessage: action === 'send' ? 'Confirmar envío de mensaje' : 'Ingresar a IMEP', payload: challenge.payload, cancelButtonText: 'Cancelar' });
  if (!signature.success || !signature.signature) throw new Error(action === 'send' ? 'Envío cancelado.' : 'Autenticación cancelada.');
  return { deviceId: device.deviceId, challengeId: challenge.challengeId, signature: signature.signature };
}
export async function loginWithBiometrics() {
  const record = await getBiometricDevice();
  if (!record) throw new Error('Activá los datos biométricos después de ingresar con contraseña.');
  const result = await rpc('verifyBiometricLogin', await signAction('login'), false);
  verifiedUid = record.uid;
  const session = await signInWithCustomToken(auth, result.token);
  if (session.user.uid !== record.uid) throw new Error('No se pudo verificar la identidad de la cuenta.');
  const profile = await getUserData(session.user.uid);
  if (!profile?.isEnabled) throw new Error('La cuenta no está habilitada.');
  return profile;
}
export async function unlockWithBiometrics() {
  await rpc('verifyBiometricUnlock', await signAction('unlock'));
}
export async function authorizeBiometricMessage(message: Record<string, unknown>): Promise<Record<string, unknown>> {
  const record = await getBiometricDevice();
  if (record?.uid !== auth.currentUser?.uid) return message;
  const biometric = await signAction('send', message);
  return { ...message, biometric };
}
