/**
 * Configuración de Variables de Entorno
 * Valores hardcodeados desde .env
 *
 * IMPORTANTE: En producción, estos valores deben venir de variables de entorno reales
 */

export const ENV = {
  // Firebase Configuration
  FIREBASE_API_KEY: 'AIzaSyAOJop1S-noRy3D6Gf8nuQft2vyx_rPDhc',
  FIREBASE_AUTH_DOMAIN: 'institucion-59d9a.firebaseapp.com',
  FIREBASE_PROJECT_ID: 'institucion-59d9a',
  FIREBASE_STORAGE_BUCKET: 'institucion-59d9a.firebasestorage.app',
  FIREBASE_MESSAGING_SENDER_ID: '5215855343',
  FIREBASE_APP_ID: '1:5215855343:web:6d9f94893106d87053711a',

  // App Configuration
  API_BASE_URL: 'http://localhost:3000',
  APP_NAME: 'Instituto',
};

console.log('✅ Environment loaded:', {
  projectId: ENV.FIREBASE_PROJECT_ID,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
});
