import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SchoolService } from '../../services/school/SchoolService';
import { auth } from '../../services/firebase/firebase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInTeacher, signInTeacherWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigateAfterLogin = async () => {
    const uid = auth?.currentUser?.uid;
    const profile = uid ? await SchoolService.getUser(uid) : null;

    if (profile?.role === 'SCHOOL_ADMIN') {
      navigate('/admin');
    } else if (profile?.role === 'TEAM_LEADER') {
      navigate('/team');
    } else {
      navigate('/teacher');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ok = await signInTeacher(email.trim(), password);
      if (ok) await navigateAfterLogin();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const ok = await signInTeacherWithGoogle();
      if (ok) await navigateAfterLogin();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(cleanEmail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại chọn vai trò
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-600/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Đăng Nhập Giáo Viên</h1>
          <p className="text-sm text-slate-500 mt-1">Đăng nhập tài khoản giáo viên để bắt đầu tiết học</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              label="Địa chỉ Email"
              type="email"
              placeholder="nhap.email@giao-vien.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isSubmitting || !email.trim()}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 disabled:text-slate-300"
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập vào Dashboard'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold text-slate-400 uppercase">Hoặc</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          fullWidth
          size="lg"
          disabled={isSubmitting}
          onClick={handleGoogleLogin}
          className="gap-3"
        >
          <span className="w-7 h-7 rounded-full border border-slate-300 bg-white flex items-center justify-center font-black text-slate-700">
            G
          </span>
          Đăng nhập bằng Google
        </Button>

        <div className="mt-5 text-center space-y-1">
          <p className="text-xs text-slate-500">
            Tài khoản Google phải được liên kết với tài khoản giáo viên đã được nhà trường cấp.
          </p>
          <p className="text-[11px] text-slate-400">
            Lần đầu: đăng nhập bằng Email/Mật khẩu → Tài khoản → Liên kết Google.
          </p>
        </div>
      </div>
    </div>
  );
};
