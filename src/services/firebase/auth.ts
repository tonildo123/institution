import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { getUserByDNI } from './users';
import { messageForError } from '@/utils/connectionErrors';
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
      return { ...userDoc.data(), id: userDoc.id } as User;
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

/** El DNI identifica el perfil; Firebase Auth verifica la contraseña. */
export const authenticateFamily = async (dni: string, password: string): Promise<User> => {
  let profile: User | null;
  try {
    profile = await getUserByDNI(dni.trim());
  } catch (error) {
    throw new Error(messageForError(error, 'No se pudo verificar la cuenta. Intentá nuevamente.'));
  }
  if (!profile || profile.role !== 'familia' || !profile.isEnabled) throw new Error('DNI o contraseña incorrectos, o cuenta no habilitada.');
  try {
    const result = await signInWithEmailAndPassword(auth, `${profile.id}@familias.imep.invalid`, password);
    if (result.user.uid !== profile.id) {
      await signOut(auth);
      throw new Error('Identidad no vinculada');
    }
    return profile;
  } catch {
    throw new Error('DNI o contraseña incorrectos. Si todavía no tenés contraseña, solicitála a la institución.');
  }
};

/** Resolver el perfil por UID evita confundir correos de contacto familiares con cuentas de acceso. */
export const authenticateEmailProfile = async (email: string, password: string): Promise<User> => {
  const account = await loginWithEmail({ email: email.trim().toLowerCase(), password });
  const profile = await getUserData(account.uid);
  if (!profile || !profile.isEnabled || !['admin', 'equipo directivo', 'representante legal', 'preceptor'].includes(profile.role)) {
    await logout();
    throw new Error('La cuenta no está habilitada para ingresar por correo.');
  }
  return profile;
};
