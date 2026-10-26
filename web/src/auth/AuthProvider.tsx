import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as AuthUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebaseConfig';
import { ADMIN_ROLES, type User } from '@/types/index';

interface AuthState {
  /** Usuario de la app con rol administrativo, o null. */
  admin: User | null;
  /** true mientras se verifica la sesión al cargar la página. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Carga el perfil y verifica que la cuenta esté habilitada y tenga un rol administrativo. */
async function loadAdmin(account: AuthUser): Promise<User | null> {
  const snapshot = await getDoc(doc(db, 'users', account.uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (data.isEnabled !== true || !ADMIN_ROLES.includes(data.role)) return null;
  return { ...data, id: snapshot.id } as User;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async account => {
    try {
      setAdmin(account ? await loadAdmin(account) : null);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }), []);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const profile = await loadAdmin(credential.user);
    if (!profile) {
      await signOut(auth);
      throw new Error('Tu cuenta no tiene acceso al panel de administración.');
    }
    setAdmin(profile);
  };

  const logout = async () => {
    await signOut(auth);
    setAdmin(null);
  };

  return <AuthContext.Provider value={{ admin, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return value;
};
