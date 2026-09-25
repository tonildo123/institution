import { createAccount } from './createAccount';
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
import { User, CreateUserCredentials, UpdateUserData } from '@/types';

/**
 * Servicio de Usuarios
 * Gestión de usuarios en Firestore
 */

const USERS_COLLECTION = 'users';

/**
 * Crear nuevo usuario en Firestore
 * (Admin panel - no crea en Firebase Auth, solo en Firestore)
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
      return await createAccount(credentials);
    }
    const now = new Date();

    const userData: User = {
      id: userId,
      displayName: credentials.displayName,
      role: credentials.role,
      email: credentials.email,
      dni: credentials.dni,
      photoURL: undefined,
      createdAt: now,
      updatedAt: now,
      enabledAt: credentials.isEnabled ? now : undefined,
      pushTokens: [],
      isEnabled: credentials.isEnabled ?? true,
    };

    const dataToSave: any = {
      displayName: userData.displayName,
      role: userData.role,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      pushTokens: [],
      isEnabled: userData.isEnabled,
    };

    // Solo agregar campos opcionales si existen
    if (credentials.email) {
      dataToSave.email = credentials.email;
    }
    if (credentials.dni) {
      dataToSave.dni = credentials.dni;
    }
    if (credentials.isEnabled) {
      dataToSave.enabledAt = Timestamp.fromDate(now);
    }

    await setDoc(doc(db, USERS_COLLECTION, userId), dataToSave);

    return userData;
  } catch (error: any) {
    console.error('❌ Error creating user:', error);
    throw {
      code: 'user/create-failed',
      message: error.message,
    };
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
    throw {
      code: 'user/get-failed',
      message: error.message,
    };
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
    throw {
      code: 'user/get-all-failed',
      message: error.message,
    };
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
    throw {
      code: 'user/get-by-role-failed',
      message: error.message,
    };
  }
};

/**
 * Obtener usuario por email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    console.log('🔍 Buscando usuario por email:', email);

    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email)
    );
    const snapshot = await getDocs(q);

    console.log('📊 Resultados encontrados:', snapshot.size);

    if (snapshot.empty) {
      console.log('❌ No hay documentos con email:', email);
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    console.log('✅ Usuario encontrado:', data);

    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      enabledAt: data.enabledAt?.toDate(),
    } as User;
  } catch (error: any) {
    console.error('❌ Error getting user by email:', error);
    throw {
      code: 'user/get-by-email-failed',
      message: error.message,
    };
  }
};

/**
 * Obtener usuario por DNI
 */
export const getUserByDNI = async (dni: string): Promise<User | null> => {
  try {
    console.log('🔍 Buscando usuario por DNI:', dni);

    const q = query(
      collection(db, USERS_COLLECTION),
      where('dni', '==', dni)
    );
    const snapshot = await getDocs(q);

    console.log('📊 Resultados encontrados:', snapshot.size);

    if (snapshot.empty) {
      console.log('❌ No hay documentos con DNI:', dni);
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    console.log('✅ Usuario encontrado:', data);

    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      enabledAt: data.enabledAt?.toDate(),
    } as User;
  } catch (error: any) {
    console.error('❌ Error getting user by DNI:', error);
    throw {
      code: 'user/get-by-dni-failed',
      message: error.message,
    };
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
      ...data,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (data.enabledAt) {
      updateData.enabledAt = Timestamp.fromDate(data.enabledAt);
    }

    await updateDoc(doc(db, USERS_COLLECTION, userId), updateData);
  } catch (error: any) {
    console.error('❌ Error updating user:', error);
    throw {
      code: 'user/update-failed',
      message: error.message,
    };
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
    throw {
      code: 'user/delete-failed',
      message: error.message,
    };
  }
};

/**
 * Agregar token push notification
 */
export const addPushToken = async (userId: string, token: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      pushTokens: [...(await getUser(userId))?.pushTokens || [], token],
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error: any) {
    console.error('❌ Error adding push token:', error);
    throw {
      code: 'user/add-token-failed',
      message: error.message,
    };
  }
};

/**
 * Remover token push notification
 */
export const removePushToken = async (userId: string, token: string): Promise<void> => {
  try {
    const user = await getUser(userId);
    if (!user) throw new Error('User not found');

    const updatedTokens = user.pushTokens.filter((t) => t !== token);

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      pushTokens: updatedTokens,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error: any) {
    console.error('❌ Error removing push token:', error);
    throw {
      code: 'user/remove-token-failed',
      message: error.message,
    };
  }
};
