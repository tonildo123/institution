import { createHash, createPublicKey, verify } from 'node:crypto';

function canonical(value: any): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).filter(key => value[key] !== undefined).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
export function messageDigest(body: Record<string, any>): string {
  const { biometric, userId, ...message } = body;
  return createHash('sha256').update(canonical(message)).digest('hex');
}
export function deviceIdForKey(key: string): string {
  return createHash('sha256').update(Buffer.from(key, 'base64')).digest('hex');
}
export function verifyBiometricSignature(key: string, payload: string, signature: string): boolean {
  try {
    const publicKey = createPublicKey({ key: Buffer.from(key, 'base64'), format: 'der', type: 'spki' });
    if (publicKey.asymmetricKeyType !== 'rsa' || (publicKey.asymmetricKeyDetails?.modulusLength || 0) < 2048) return false;
    return verify('RSA-SHA256', Buffer.from(payload, 'utf8'), publicKey, Buffer.from(signature, 'base64'));
  } catch { return false; }
}
