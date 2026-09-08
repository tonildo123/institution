import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase Configuration
 * Las credenciales se cargan desde variables de entorno (.env)
 */

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDemoKey123456789012345678901234567',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'institucion-demo.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'institucion-demo',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'institucion-demo.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890abcdef',
};

console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
