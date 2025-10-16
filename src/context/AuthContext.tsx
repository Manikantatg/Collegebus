import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  User,
  Auth,
  GoogleAuthProvider
} from 'firebase/auth';
import { handleFirebaseError } from '../utils/firebaseErrorHandler';
import { auth as firebaseAuth, googleProvider as firebaseGoogleProvider } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth) {
      console.error("Firebase auth is not initialized");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      if (!firebaseAuth) {
        throw new Error("Firebase auth is not initialized");
      }
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = handleFirebaseError(error);
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      if (!firebaseAuth || !firebaseGoogleProvider) {
        throw new Error("Firebase auth or Google provider is not initialized");
      }
      await signInWithPopup(firebaseAuth, firebaseGoogleProvider);
    } catch (error: any) {
      console.error('Google login failed:', error);
      const errorMessage = handleFirebaseError(error);
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      if (!firebaseAuth) {
        throw new Error("Firebase auth is not initialized");
      }
      await signOut(firebaseAuth);
    } catch (error: any) {
      console.error('Logout failed:', error);
      const errorMessage = handleFirebaseError(error);
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, authError }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};