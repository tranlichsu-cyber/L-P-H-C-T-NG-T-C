import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase/firebase';
import { useToast } from './ToastContext';

interface AuthContextType {
  currentUser: User | null;
  authReady: boolean;
  isTeacherAuthenticated: boolean;
  isAnonymousStudent: boolean;
  signInTeacher: (email: string, pass: string) => Promise<boolean>;
  registerTeacher: (email: string, pass: string) => Promise<boolean>;
  signOutTeacher: () => Promise<void>;
  ensureStudentAnonymousAuth: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(!isFirebaseConfigured);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const signInTeacher = async (email: string, pass: string): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth) {
      showToast('Đăng nhập thành công (Chế độ Mock)!', 'success');
      return true;
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      showToast('Đăng nhập Giáo viên thành công!', 'success');
      return true;
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential'
          ? 'Email hoặc mật khẩu không đúng.'
          : err.code === 'auth/user-not-found'
          ? 'Không tìm thấy tài khoản.'
          : 'Lỗi đăng nhập: ' + err.message;
      showToast(msg, 'error');
      return false;
    }
  };

  const registerTeacher = async (email: string, pass: string): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth) return true;
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      showToast('Đăng ký tài khoản Giáo viên thành công!', 'success');
      return true;
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'Email này đã được đăng ký sử dụng.'
          : 'Lỗi đăng ký: ' + err.message;
      showToast(msg, 'error');
      return false;
    }
  };

  const signOutTeacher = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    showToast('Đã đăng xuất khỏi tài khoản.', 'info');
  };

  const ensureStudentAnonymousAuth = async (): Promise<User | null> => {
    if (!isFirebaseConfigured || !auth) return null;

    if (auth.currentUser && auth.currentUser.isAnonymous) {
      return auth.currentUser;
    }

    try {
      const credential = await signInAnonymously(auth);
      return credential.user;
    } catch (err: any) {
      console.error('Anonymous Auth error:', err);
      return null;
    }
  };

  const isTeacherAuthenticated = Boolean(currentUser && !currentUser.isAnonymous);
  const isAnonymousStudent = Boolean(currentUser && currentUser.isAnonymous);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authReady,
        isTeacherAuthenticated,
        isAnonymousStudent,
        signInTeacher,
        registerTeacher,
        signOutTeacher,
        ensureStudentAnonymousAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
