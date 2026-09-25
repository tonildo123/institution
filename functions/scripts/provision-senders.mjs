// Ejecutar sin --apply para revisar. Usa credenciales administrativas locales.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
if (!projectId) throw new Error('Definí GOOGLE_CLOUD_PROJECT explícitamente');
initializeApp({ credential: applicationDefault(), projectId });
const apply = process.argv.includes('--apply');
const roles = ['admin', 'preceptor', 'equipo directivo', 'representante legal'];
const users = await getFirestore().collection('users').where('role', 'in', roles).get();
for (const doc of users.docs) {
  const user = doc.data();
  if (!user.email || !user.isEnabled) continue;
  try {
    const existing = await getAuth().getUserByEmail(user.email);
    console.log(doc.id, existing.uid === doc.id ? 'YA VINCULADO' : 'CONFLICTO: UID distinto; resolver manualmente');
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    // Crear sin contraseña: el titular establece la suya por restablecimiento.
    if (apply) await getAuth().createUser({ uid: doc.id, email: user.email, displayName: user.displayName });
    console.log(doc.id, apply ? 'CREADO: enviar restablecimiento desde Firebase Auth' : 'PENDIENTE DE CREACIÓN');
  }
}
