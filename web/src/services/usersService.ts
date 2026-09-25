import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import type { User, CreateUserCredentials, UpdateUserData } from '@/types/index';

/**
 * Servicio de Usuarios para Admin Panel
 * Gestión completa de usuarios en Firestore
 */

const USERS_COLLECTION = 'users';

/**
 * Crear nuevo usuario
 */
export const createUser = async (
  userId: string,
  credentials: CreateUserCredentials
): Promise<User> => {
  try {
    if (credentials.role !== 'familia') {
      await auth.authStateReady();
      if (!auth.currentUser) {
        throw new Error('Esta sesión es del acceso anterior. Para crear cuentas por email, ingresá con el administrador habilitado en Firebase Auth. Tu cuenta existente no se elimina al cerrar sesión.');
      }
      // La función crea Auth + Firestore sin cambiar la sesión del administrador.
      const createAccount = httpsCallable<CreateUserCredentials, User>(getFunctions(undefined, 'us-central1'), 'createManagedUser');
      const result = await createAccount(credentials);
      return result.data;
    }
    const now = new Date();

    const userData: User = {
      id: userId,
      displayName: credentials.displayName,
      role: credentials.role,
      email: credentials.email,
      dni: credentials.dni,
      createdAt: now,
      updatedAt: now,
      enabledAt: credentials.isEnabled ? now : undefined,
      pushTokens: [],
      isEnabled: credentials.isEnabled ?? true,
    };

    // Construir documento sin valores undefined
    const docData: any = {
      id: userId,
      displayName: credentials.displayName,
      role: credentials.role,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      pushTokens: [],
      isEnabled: credentials.isEnabled ?? true,
    };

    // Agregar email solo si existe
    if (credentials.email) {
      docData.email = credentials.email;
    }

    // Agregar DNI solo si existe
    if (credentials.dni) {
      docData.dni = credentials.dni;
    }

    // Agregar enabledAt solo si está habilitado
    if (credentials.isEnabled) {
      docData.enabledAt = Timestamp.fromDate(now);
    }

    await setDoc(doc(db, USERS_COLLECTION, userId), docData);

    return userData;
  } catch (error: any) {
    console.error('❌ Error creating user:', error);
    throw new Error(error.message || 'Error creating user');
  }
};

/**
 * Obtener usuario por ID
 */
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        id: userDoc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        enabledAt: data.enabledAt?.toDate(),
      } as User;
    }
    return null;
  } catch (error: any) {
    console.error('❌ Error getting user:', error);
    throw new Error(error.message || 'Error getting user');
  }
};

/**
 * Obtener todos los usuarios
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        enabledAt: data.enabledAt?.toDate(),
      } as User;
    });
  } catch (error: any) {
    console.error('❌ Error getting all users:', error);
    throw new Error(error.message || 'Error getting users');
  }
};

/**
 * Obtener usuarios por rol
 */
export const getUsersByRole = async (role: string): Promise<User[]> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', role)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        enabledAt: data.enabledAt?.toDate(),
      } as User;
    });
  } catch (error: any) {
    console.error('❌ Error getting users by role:', error);
    throw new Error(error.message || 'Error getting users');
  }
};

/**
 * Obtener usuario por email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      enabledAt: data.enabledAt?.toDate(),
    } as User;
  } catch (error: any) {
    console.error('❌ Error getting user by email:', error);
    throw new Error(error.message || 'Error getting user');
  }
};

/**
 * Obtener usuario por DNI
 */
export const getUserByDNI = async (dni: string): Promise<User | null> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('dni', '==', dni)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      enabledAt: data.enabledAt?.toDate(),
    } as User;
  } catch (error: any) {
    console.error('❌ Error getting user by DNI:', error);
    throw new Error(error.message || 'Error getting user');
  }
};

/**
 * Actualizar usuario
 */
export const updateUser = async (
  userId: string,
  data: UpdateUserData
): Promise<void> => {
  try {
    const updateData: any = {
      updatedAt: Timestamp.fromDate(new Date()),
    };

    // Agregar solo los campos que tienen valor
    if (data.displayName) {
      updateData.displayName = data.displayName;
    }
    if (data.email) {
      updateData.email = data.email;
    }
    if (data.dni) {
      updateData.dni = data.dni;
    }
    if (data.photoURL) {
      updateData.photoURL = data.photoURL;
    }
    if (data.isEnabled !== undefined) {
      updateData.isEnabled = data.isEnabled;
    }
    if (data.enabledAt) {
      updateData.enabledAt = Timestamp.fromDate(data.enabledAt);
    }

    await updateDoc(doc(db, USERS_COLLECTION, userId), updateData);
  } catch (error: any) {
    console.error('❌ Error updating user:', error);
    throw new Error(error.message || 'Error updating user');
  }
};

/**
 * Eliminar usuario
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (error: any) {
    console.error('❌ Error deleting user:', error);
    throw new Error(error.message || 'Error deleting user');
  }
};
