import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  unlink,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase/firebase';
import { useToast } from './ToastContext';
import { SchoolService } from '../services/school/SchoolService';

interface AuthContextType {
  currentUser: User | null;
  authReady: boolean;
  isTeacherAuthenticated: boolean;
  isAnonymousStudent: boolean;
  signInTeacher: (email: string, pass: string) => Promise<boolean>;
  signInTeacherWithGoogle: () => Promise<boolean>;
  linkGoogleAccount: () => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
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
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await SchoolService.getUser(credential.user.uid);

      if (!profile) {
        await signOut(auth);
        showToast('Tài khoản chưa được Quản trị trường cấp hồ sơ sử dụng.', 'error');
        return false;
      }

      if (profile.status !== 'ACTIVE') {
        await signOut(auth);
        showToast('Tài khoản đang bị khóa. Vui lòng liên hệ Quản trị trường.', 'error');
        return false;
      }

      showToast('Đăng nhập thành công!', 'success');
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

  const validateTeacherProfile = async (user: User): Promise<boolean> => {
    const profile = await SchoolService.getUser(user.uid);

    if (!profile) {
      if (auth) await signOut(auth);
      showToast(
        'Tài khoản Google này chưa được liên kết với tài khoản giáo viên của trường.',
        'error'
      );
      return false;
    }

    if (profile.status !== 'ACTIVE') {
      if (auth) await signOut(auth);
      showToast('Tài khoản đang bị khóa. Vui lòng liên hệ Quản trị trường.', 'error');
      return false;
    }

    return true;
  };

  const signInTeacherWithGoogle = async (): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth) {
      showToast('Google Sign-In chỉ hoạt động khi Firebase được cấu hình.', 'error');
      return false;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);

      const ok = await validateTeacherProfile(credential.user);
      if (!ok) return false;

      showToast('Đăng nhập bằng Google thành công!', 'success');
      return true;
    } catch (err: any) {
      const msg =
        err.code === 'auth/account-exists-with-different-credential'
          ? 'Email này đã có tài khoản bằng mật khẩu. Hãy đăng nhập bằng Email/Mật khẩu một lần, vào mục Tài khoản và chọn “Liên kết Google”.'
          : err.code === 'auth/popup-closed-by-user'
          ? 'Bạn đã đóng cửa sổ đăng nhập Google.'
          : err.code === 'auth/popup-blocked'
          ? 'Trình duyệt đang chặn cửa sổ Google. Hãy cho phép cửa sổ bật lên rồi thử lại.'
          : 'Không thể đăng nhập bằng Google: ' + (err.message || 'Lỗi không xác định.');
      showToast(msg, 'error');
      return false;
    }
  };

  const linkGoogleAccount = async (): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth?.currentUser || auth.currentUser.isAnonymous) {
      showToast('Cần đăng nhập tài khoản giáo viên trước khi liên kết Google.', 'error');
      return false;
    }

    const alreadyLinked = auth.currentUser.providerData.some(
      (provider) => provider.providerId === 'google.com'
    );
    if (alreadyLinked) {
      showToast('Tài khoản này đã được liên kết với Google.', 'info');
      return true;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
        login_hint: auth.currentUser.email || '',
      });
      const result = await linkWithPopup(auth.currentUser, provider);
      const googleProfile = result.user.providerData.find(
        (item) => item.providerId === 'google.com'
      );

      if (
        auth.currentUser.email &&
        googleProfile?.email &&
        googleProfile.email.toLowerCase() !== auth.currentUser.email.toLowerCase()
      ) {
        await unlink(auth.currentUser, 'google.com').catch(() => undefined);
        showToast(
          'Email Google phải trùng với email tài khoản giáo viên đang đăng nhập.',
          'error'
        );
        return false;
      }

      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
      showToast('Đã liên kết tài khoản Google thành công!', 'success');
      return true;
    } catch (err: any) {
      const msg =
        err.code === 'auth/credential-already-in-use' ||
        err.code === 'auth/email-already-in-use'
          ? 'Tài khoản Google này đang được liên kết với một tài khoản Firebase khác.'
          : err.code === 'auth/popup-closed-by-user'
          ? 'Bạn đã đóng cửa sổ liên kết Google.'
          : err.code === 'auth/popup-blocked'
          ? 'Trình duyệt đang chặn cửa sổ Google. Hãy cho phép cửa sổ bật lên rồi thử lại.'
          : 'Không thể liên kết Google: ' + (err.message || 'Lỗi không xác định.');
      showToast(msg, 'error');
      return false;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth?.currentUser || auth.currentUser.isAnonymous) {
      showToast('Cần đăng nhập tài khoản giáo viên trước khi đổi mật khẩu.', 'error');
      return false;
    }

    const user = auth.currentUser;
    const hasPasswordProvider = user.providerData.some(
      (provider) => provider.providerId === 'password'
    );

    if (!hasPasswordProvider || !user.email) {
      showToast('Tài khoản này chưa sử dụng đăng nhập bằng mật khẩu.', 'error');
      return false;
    }

    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
      return false;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      showToast('Đổi mật khẩu thành công!', 'success');
      return true;
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'
          ? 'Mật khẩu hiện tại không đúng.'
          : err.code === 'auth/weak-password'
          ? 'Mật khẩu mới chưa đủ mạnh.'
          : err.code === 'auth/requires-recent-login'
          ? 'Phiên đăng nhập đã quá lâu. Hãy đăng xuất, đăng nhập lại rồi đổi mật khẩu.'
          : 'Không thể đổi mật khẩu: ' + (err.message || 'Lỗi không xác định.');
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
        signInTeacherWithGoogle,
        linkGoogleAccount,
        changePassword,
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
