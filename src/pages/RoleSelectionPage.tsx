import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  School,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentSession } from '../context/StudentSessionContext';
import { useSchool } from '../context/SchoolContext';
import { SchoolService } from '../services/school/SchoolService';
import { auth } from '../services/firebase/firebase';
import { SCHOOL_LOGO_SRC } from '../assets/schoolLogo';

type PortalTab = 'TEACHER' | 'STUDENT';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    signInTeacher,
    signInTeacherWithGoogle,
    resetPassword,
  } = useAuth();
  const { joinRoom } = useStudentSession();
  const { settings, logoUrl } = useSchool();

  const [tab, setTab] = useState<PortalTab>('TEACHER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [studentError, setStudentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schoolName =
    settings.displayName ||
    settings.schoolName ||
    'TRƯỜNG TIỂU HỌC SÔNG CÔNG';

  const currentLogo = logoUrl || SCHOOL_LOGO_SRC;

  const navigateAfterTeacherLogin = async () => {
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

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    try {
      const ok = await signInTeacher(email.trim(), password);
      if (ok) await navigateAfterTeacherLogin();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const ok = await signInTeacherWithGoogle();
      if (ok) await navigateAfterTeacherLogin();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = roomCode.trim();
    if (code.length !== 6) {
      setStudentError('Mã phòng gồm 6 chữ số.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await joinRoom(code);
      if (!result.success) {
        setStudentError(result.message || 'Không tìm thấy phòng học.');
        return;
      }

      setStudentError('');
      navigate('/student/select-name');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-1 flex-col justify-center">
          <header className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 sm:h-20 sm:w-20">
              <img
                src={currentLogo}
                alt="Logo trường"
                className="h-full w-full object-contain p-2"
              />
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {schoolName.toUpperCase()}
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              Lớp học tương tác • Hệ thống giáo dục nội bộ
            </p>
          </header>

          <div className="mt-5 rounded-2xl bg-slate-100 p-1.5 shadow-inner">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setTab('TEACHER')}
                className={`rounded-xl px-3 py-3 text-sm font-black tracking-wide transition-all sm:text-sm ${
                  tab === 'TEACHER'
                    ? 'bg-white text-sky-700 shadow-md ring-2 ring-slate-900'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                CỔNG GIÁO VIÊN
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('STUDENT');
                  setStudentError('');
                }}
                className={`rounded-xl px-3 py-3 text-sm font-black tracking-wide transition-all sm:text-sm ${
                  tab === 'STUDENT'
                    ? 'bg-white text-amber-700 shadow-md ring-2 ring-slate-900'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                CỔNG HỌC SINH
              </button>
            </div>
          </div>

          {tab === 'TEACHER' ? (
            <div className="mt-5">
              <form onSubmit={handleTeacherLogin} className="space-y-3">
                <label className="relative block">
                  <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Địa chỉ Email"
                    autoComplete="email"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-5 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    required
                  />
                </label>

                <label className="relative block">
                  <KeyRound className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-14 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 px-5 text-base font-black text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập giáo viên'}
                  {!isSubmitting && <ArrowRight className="h-6 w-6" />}
                </button>
              </form>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 text-base font-black text-slate-700 shadow-md shadow-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-base font-black text-sky-600">
                  G
                </span>
                Đăng nhập với Google
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSubmitting || !email.trim()}
                  className="text-sm font-black tracking-wide text-slate-500 hover:text-sky-700 disabled:text-slate-300"
                >
                  QUÊN MẬT KHẨU?
                </button>
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  Tài khoản giáo viên do nhà trường cấp
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <form onSubmit={handleStudentJoin} className="space-y-3">
                <div className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <h2 className="mt-3 text-xl font-black text-slate-950">
                    Tham gia lớp học
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Nhập mã phòng 6 chữ số do thầy/cô cung cấp
                  </p>
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.replace(/\D/g, ''));
                    setStudentError('');
                  }}
                  placeholder="000000"
                  className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-center font-mono text-3xl font-black tracking-[0.3em] text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  required
                />

                {studentError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-700">
                    {studentError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || roomCode.length !== 6}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 text-base font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang kết nối...' : 'Tham gia ngay'}
                  {!isSubmitting && <ArrowRight className="h-6 w-6" />}
                </button>
              </form>
            </div>
          )}
        </div>

        <footer className="mt-5 flex items-center justify-center gap-2 pb-2 text-center text-[11px] font-bold text-slate-300">
          <School className="h-4 w-4" />
          {settings.campusName || 'Phân hiệu Lý Tự Trọng'} • Năm học {settings.schoolYear}
        </footer>
      </div>
    </div>
  );
};
