import * as functions from 'firebase-functions';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { randomBytes } from 'node:crypto';
import { deviceIdForKey, messageDigest, verifyBiometricSignature } from './biometricCrypto.js';

const error = (message: string) => new functions.https.HttpsError('permission-denied', message);
function recentPassword(context: functions.https.CallableContext) {
  const age = Date.now() / 1000 - Number(context.auth?.token.auth_time || 0);
  if (!context.auth || context.auth.token.firebase?.sign_in_provider !== 'password' || !Number.isFinite(age) || age < -60 || age > 300) {
    throw error('Confirmá tu contraseña actual para configurar los datos biométricos');
  }
  return context.auth.uid;
}
async function enabledProfile(uid: string) {
  const snapshot = await getFirestore().collection('users').doc(uid).get();
  if (!snapshot.exists || snapshot.data()?.isEnabled !== true) throw error('La cuenta no está habilitada');
  return snapshot.data()!;
}
function deviceRef(id: unknown) {
  if (typeof id !== 'string' || !/^[a-f0-9]{64}$/.test(id)) throw error('Dispositivo biométrico inválido');
  return getFirestore().collection('biometricDevices').doc(id);
}

export const enrollBiometrics = functions.https.onCall(async (data, context) => {
  const uid = recentPassword(context);
  await enabledProfile(uid);
  const key = data?.publicKey;
  if (typeof key !== 'string' || key.length > 4096 || typeof data?.signature !== 'string' ||
    !verifyBiometricSignature(key, `imep:enroll:${uid}:${key}`, data.signature)) throw error('No se pudo verificar la confirmación biométrica');
  const id = deviceIdForKey(key);
  const ref = deviceRef(id);
  const db = getFirestore();
  const account = await getAuth().getUser(uid);
  await db.runTransaction(async tx => {
    const existing = await tx.get(ref);
    const old = data.previousDeviceId ? await tx.get(deviceRef(data.previousDeviceId)) : null;
    if (existing.exists && existing.data()?.uid !== uid) throw error('El dispositivo pertenece a otra cuenta');
    if (old?.exists && old.data()?.uid !== uid) throw error('La vinculación anterior pertenece a otra cuenta');
    if (old?.exists) tx.update(old.ref, { enabled: false });
    tx.set(ref, { uid, publicKey: key, enabled: true, enrolledAt: Date.now(), validAfter: account.tokensValidAfterTime || '', createdAt: Timestamp.now() });
    tx.set(db.collection('biometricAccounts').doc(uid), { requireSend: true }, { merge: true });
  });
  return { deviceId: id };
});

export const disableBiometrics = functions.https.onCall(async (data, context) => {
  const uid = recentPassword(context);
  await enabledProfile(uid);
  const db = getFirestore();
  const devices = await db.collection('biometricDevices').where('uid', '==', uid).where('enabled', '==', true).get();
  const batch = db.batch();
  // Desactivar restablece el acceso por contraseña en todos los dispositivos de esta cuenta.
  devices.docs.forEach(doc => batch.update(doc.ref, { enabled: false }));
  batch.set(db.collection('biometricAccounts').doc(uid), { requireSend: false }, { merge: true });
  await batch.commit();
  return { success: true };
});

export const biometricChallenge = functions.https.onCall(async (data, context) => {
  const action = data?.action;
  if (!['login', 'unlock', 'send'].includes(action)) throw error('Acción biométrica inválida');
  const ref = deviceRef(data.deviceId);
  const db = getFirestore();
  const snapshot = await ref.get();
  const device = snapshot.data();
  if (!snapshot.exists || !device?.enabled) throw error('Activá nuevamente los datos biométricos desde tu perfil');
  if (action !== 'login' && context.auth?.uid !== device.uid) throw error('La sesión no corresponde a este dispositivo');
  await enabledProfile(device.uid);
  const account = await getAuth().getUser(device.uid);
  if (account.disabled || (account.tokensValidAfterTime || '') !== device.validAfter) throw error('Tu acceso cambió. Ingresá con contraseña y volvé a activar los datos biométricos');
  const payload = `imep:v1:${action}:${randomBytes(32).toString('hex')}`;
  const challengeId = `${data.deviceId}_${action}`;
  await db.runTransaction(async tx => {
    const challenge = db.collection('biometricChallenges').doc(challengeId);
    const old = await tx.get(challenge);
    if (old.exists && Date.now() - old.data()!.createdAt < 1000) throw new functions.https.HttpsError('resource-exhausted', 'Esperá un momento y volvé a intentar');
    tx.set(challenge, { uid: device.uid, deviceId: data.deviceId, action, payload,
      digest: action === 'send' ? messageDigest(data.message || {}) : '', createdAt: Date.now(), expiresAt: Date.now() + 120000 });
  });
  return { challengeId, payload };
});

export async function consumeBiometricProof(proof: any, action: string, uid?: string, message?: any): Promise<string> {
  if (!proof || typeof proof.challengeId !== 'string' || proof.challengeId !== `${proof.deviceId}_${action}` || typeof proof.signature !== 'string' || proof.signature.length > 4096) throw error('Confirmá la operación con tus datos biométricos');
  const db = getFirestore();
  const ref = deviceRef(proof.deviceId);
  const challengeRef = db.collection('biometricChallenges').doc(proof.challengeId);
  return db.runTransaction(async tx => {
    const [deviceSnap, challengeSnap] = await Promise.all([tx.get(ref), tx.get(challengeRef)]);
    const device = deviceSnap.data();
    const challenge = challengeSnap.data();
    if (!device?.enabled || !challenge || challenge.expiresAt < Date.now() || challenge.action !== action ||
      challenge.deviceId !== proof.deviceId || challenge.uid !== device.uid || (uid && uid !== device.uid) ||
      (action === 'send' && challenge.digest !== messageDigest(message || {})) ||
      !verifyBiometricSignature(device.publicKey, challenge.payload, proof.signature)) throw error('La confirmación biométrica venció o no es válida. Intentá nuevamente');
    tx.delete(challengeRef);
    return device.uid as string;
  });
}

export const verifyBiometricLogin = functions.https.onCall(async (data) => {
  const uid = await consumeBiometricProof(data, 'login');
  await enabledProfile(uid);
  const account = await getAuth().getUser(uid);
  const device = (await deviceRef(data.deviceId).get()).data();
  if (account.disabled || !device?.enabled || (account.tokensValidAfterTime || '') !== device.validAfter) throw error('Volvé a ingresar con contraseña');
  return { token: await getAuth().createCustomToken(uid) };
});

export const verifyBiometricUnlock = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw error('Iniciá sesión');
  await enabledProfile(context.auth.uid);
  await consumeBiometricProof(data, 'unlock', context.auth.uid);
  return { success: true };
});

export async function verifySendBiometrics(uid: string, body: any) {
  const settings = await getFirestore().collection('biometricAccounts').doc(uid).get();
  if (settings.data()?.requireSend === true) {
    await consumeBiometricProof(body.biometric, 'send', uid, body);
  }
}
