import {LearningIllustration} from '../components/learning/LearningIllustration';
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
  BookOpenCheck,
  MapPinned,
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

  const [tab, setTab] = useState<PortalTab>('STUDENT');
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
    <div className="learning-shell school-portal min-h-screen text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-1 flex-col">
          <header className="portal-school-header text-center">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <div className="relative top-1 flex h-12 w-12 shrink-0 items-center justify-center sm:top-1.5 sm:h-14 sm:w-14">
                <img src={currentLogo} alt="Logo trường" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 text-center">
                <h1 className="text-xl font-black leading-tight tracking-tight text-slate-950 sm:text-2xl">
                  {schoolName.toUpperCase()}
                </h1>
                <p className="mt-1 text-[10px] font-medium leading-snug text-slate-500 sm:text-xs">
                  Cùng học tập • Cùng khám phá • Cùng trưởng thành
                </p>
              </div>
            </div>
          </header>
          <main className="portal-grid"><section className="portal-discover" aria-labelledby="portal-welcome"><p className="portal-eyebrow">CHÀO MỪNG EM ĐẾN LỚP</p><h2 id="portal-welcome" className="portal-headline">Mỗi ngày đến lớp,<br/><span>thêm một điều hay.</span></h2><p className="portal-intro">Học cùng thầy cô, tự luyện thật vui và khám phá những câu chuyện của quê hương.</p><LearningIllustration/>
          <nav aria-label="Khám phá nội dung học tập" className="portal-learning-links grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={()=>navigate('/tu-luyen')} className="min-h-24 flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50 px-4 py-4 text-left text-sky-950 shadow-sm transition hover:bg-sky-100 focus-visible:outline-4 focus-visible:outline-sky-600">
              <span className="shrink-0 rounded-xl bg-sky-700 p-3 text-white"><BookOpenCheck size={27} aria-hidden="true"/></span>
              <span><strong className="block text-base font-black">Tự luyện</strong><span className="block text-xs font-semibold text-sky-800">Vào bằng mã học sinh</span></span>
            </button>
            <button type="button" onClick={()=>navigate('/goc-truyen-thong')} className="min-h-24 flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-4 text-left text-emerald-950 shadow-sm transition hover:bg-emerald-100 focus-visible:outline-4 focus-visible:outline-emerald-700">
              <span className="shrink-0 rounded-xl bg-emerald-700 p-3 text-white"><MapPinned size={27} aria-hidden="true"/></span>
              <span><strong className="block text-base font-black">Góc truyền thống số</strong><span className="block text-xs font-semibold text-emerald-800">Khám phá quê hương Thái Nguyên</span></span>
            </button>
          </nav>
          <button type="button" onClick={()=>navigate('/hoc-lieu/khai-thac-tu-nhien-phia-bac')} className="mt-3 w-full rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-left font-bold text-amber-950 hover:bg-amber-100">📖 Sơ đồ bài học • Lịch sử và Địa lí 4<br/><span className="text-sm font-medium">Khám phá cách khai thác tự nhiên ở miền núi phía Bắc →</span></button>

          </section><section className="portal-entry" aria-label="Cổng lớp học"><p className="portal-eyebrow">LỚP HỌC CỦA CHÚNG MÌNH</p><h2 className="text-2xl font-black text-slate-950 mt-2">Sẵn sàng học nhé!</h2><p className="mt-2 text-sm leading-6 text-slate-600">Chọn cổng của em hoặc thầy cô để bắt đầu.</p>
          <div className="mt-5 rounded-2xl bg-slate-100 p-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                aria-pressed={tab === 'TEACHER'} onClick={() => setTab('TEACHER')}
                className={`rounded-xl px-3 py-3 text-sm font-black tracking-wide transition-all sm:text-sm ${
                  tab === 'TEACHER'
                    ? 'bg-white text-sky-800 shadow-sm ring-1 ring-sky-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CỔNG GIÁO VIÊN
              </button>

              <button
                type="button"
                aria-pressed={tab === 'STUDENT'} onClick={() => {
                  setTab('STUDENT');
                  setStudentError('');
                }}
                className={`rounded-xl px-3 py-3 text-sm font-black tracking-wide transition-all sm:text-sm ${
                  tab === 'STUDENT'
                    ? 'bg-white text-sky-800 shadow-sm ring-1 ring-sky-200'
                    : 'text-slate-600 hover:text-slate-900'
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
                    aria-label="Địa chỉ Email"
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
                    aria-label="Mật khẩu" type={showPassword ? 'text' : 'password'}
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
                  aria-label="Mã phòng lớp học" placeholder="000000"
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
          </section></main>
        </div>

        <footer className="mt-5 flex items-center justify-center gap-2 pb-2 text-center text-xs font-medium text-slate-600">
          <School className="h-4 w-4" />
          {settings.campusName || 'Phân hiệu Lý Tự Trọng'} • Năm học {settings.schoolYear}
        </footer>
      </div>
    </div>
  );
};
