import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { LoginCredentials, SignUpCredentials, User } from '@/types';

/**
 * Servicio de Autenticación con Firebase
 */

/**
 * Inicia sesión con email y contraseña
 */
export const loginWithEmail = async (
  credentials: LoginCredentials
): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    return userCredential.user;
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    };
  }
};

/**
 * Crea una nueva cuenta
 */
export const signUpWithEmail = async (
  credentials: SignUpCredentials
): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const user = userCredential.user;

    // Actualizar perfil
    await updateProfile(user, {
      displayName: credentials.displayName,
    });

    // Crear documento de usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: user.email,
      displayName: credentials.displayName,
      photoURL: null,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return user;
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    };
  }
};

/**
 * Cierra la sesión del usuario actual
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    };
  }
};

/**
 * Envía email de recuperación de contraseña
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    };
  }
};

/**
 * Obtiene los datos del usuario desde Firestore
 */
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    };
  }
};

/**
 * Actualiza los datos del usuario
 */
export const updateUserData = async (
  userId: string,
  data: Partial<User>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    };
  }
};
