import React, { useEffect, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Radio, LogOut, HeartHandshake, Building2, Crown, GraduationCap, UserCircle, KeyRound, Link2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { SCHOOL_LOGO_SRC } from '../assets/schoolLogo';
import { SchoolService } from '../services/school/SchoolService';
import type { UserProfile } from '../services/school/types';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const TeacherLayout: React.FC = () => {
  const location = useLocation();
  const {
    currentUser,
    signOutTeacher,
    linkGoogleAccount,
    changePassword,
  } = useAuth();
  const { logoUrl, settings } = useSchool();
  const accountLabel = currentUser?.displayName || currentUser?.email || 'Giáo viên';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(
    Boolean(currentUser?.providerData.some((provider) => provider.providerId === 'google.com'))
  );

  useEffect(() => {
    let cancelled = false;
    if (!currentUser?.uid || currentUser.isAnonymous) {
      setProfile(null);
      return;
    }

    SchoolService.getUser(currentUser.uid)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid, currentUser?.isAnonymous]);

  useEffect(() => {
    setGoogleLinked(
      Boolean(currentUser?.providerData.some((provider) => provider.providerId === 'google.com'))
    );
  }, [currentUser]);

  const hasPasswordProvider = Boolean(
    currentUser?.providerData.some((provider) => provider.providerId === 'password')
  );

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    if (!currentPassword) return;
    if (newPassword.length < 6) return;
    if (newPassword !== confirmPassword) return;

    setIsChangingPassword(true);
    try {
      const ok = await changePassword(currentPassword, newPassword);
      if (ok) resetPasswordForm();
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLinkGoogle = async () => {
    setIsLinkingGoogle(true);
    try {
      const ok = await linkGoogleAccount();
      if (ok) setGoogleLinked(true);
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const allNavItems = [
    { path: '/teacher', label: 'Tổng quan', icon: LayoutDashboard, idle: 'bg-sky-50 text-sky-700 border-sky-200', active: 'bg-sky-600 text-white border-sky-600 shadow-sky-200' },
    { path: '/teacher/classes', label: 'Quản lý lớp', icon: Users, idle: 'bg-emerald-50 text-emerald-700 border-emerald-200', active: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200' },
    { path: '/teacher/quizzes', label: 'Ngân hàng câu hỏi', icon: BookOpen, idle: 'bg-violet-50 text-violet-700 border-violet-200', active: 'bg-violet-600 text-white border-violet-600 shadow-violet-200' },
    { path: '/teacher/remediation', label: 'Ôn tập & Củng cố', icon: HeartHandshake, idle: 'bg-amber-50 text-amber-800 border-amber-200', active: 'bg-amber-500 text-slate-950 border-amber-500 shadow-amber-200' },
    { path: '/teacher/room', label: 'Phòng học Live', icon: Radio, idle: 'bg-rose-50 text-rose-700 border-rose-200', active: 'bg-rose-600 text-white border-rose-600 shadow-rose-200' },
    { path: '/team', label: 'Tổ chuyên môn', icon: Crown, idle: 'bg-orange-50 text-orange-700 border-orange-200', active: 'bg-orange-500 text-white border-orange-500 shadow-orange-200' },
    { path: '/admin', label: 'Quản trị trường', icon: Building2, idle: 'bg-indigo-50 text-indigo-700 border-indigo-200', active: 'bg-indigo-700 text-white border-indigo-700 shadow-indigo-200' },
  ];

  const navItems = allNavItems.filter((item) => {
    if (item.path === '/admin') return profile?.role === 'SCHOOL_ADMIN';
    if (item.path === '/team') return profile?.role === 'TEAM_LEADER' || profile?.role === 'SCHOOL_ADMIN';
    return true;
  });

  const currentLogoSrc = logoUrl || SCHOOL_LOGO_SRC;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/teacher" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-sky-600/30 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                {currentLogoSrc ? (
                  <img src={currentLogoSrc} alt="Logo trường" className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="font-black text-lg text-slate-900 leading-tight block tracking-tight">
                  {settings.displayName || settings.schoolName || 'Lớp Học Tương Tác'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all duration-150 border ${
                      isActive
                        ? `${item.active} font-extrabold shadow-md`
                        : `${item.idle} font-bold hover:-translate-y-0.5 hover:shadow-sm`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 text-xs font-bold border border-emerald-200/80 shadow-xs hover:border-emerald-400 transition-colors"
              title="Tài khoản, đổi mật khẩu và liên kết Google"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              {accountLabel}
              <UserCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              className="sm:hidden p-2 text-sky-700 rounded-xl bg-sky-50 border border-sky-200"
              title="Tài khoản"
            >
              <UserCircle className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={async () => { await signOutTeacher(); window.location.href = '/'; }}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <nav className="lg:hidden flex border-t border-slate-100 bg-white px-2 py-1.5 overflow-x-auto justify-around gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all border ${
                  isActive ? `${item.active} font-bold shadow-sm` : `${item.idle} font-semibold`
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          resetPasswordForm();
        }}
        title="TÀI KHOẢN CỦA TÔI"
      >
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-black">
              <UserCircle className="w-5 h-5 text-sky-600" />
              {accountLabel}
            </div>
            <p className="text-sm text-slate-600">{currentUser?.email}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {hasPasswordProvider && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Email/Mật khẩu
                </span>
              )}
              {googleLinked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Google đã liên kết
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-black text-slate-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-emerald-600" /> Đăng nhập bằng Google
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Liên kết một lần để lần sau có thể đăng nhập bằng nút Google mà vẫn giữ nguyên dữ liệu và quyền hiện tại.
              </p>
            </div>

            {googleLinked ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-bold text-emerald-800">
                Google đã được liên kết với tài khoản này.
              </div>
            ) : (
              <Button
                variant="outline"
                fullWidth
                onClick={handleLinkGoogle}
                disabled={isLinkingGoogle}
                className="gap-2"
              >
                <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center font-black">G</span>
                {isLinkingGoogle ? 'Đang liên kết Google...' : 'Liên kết tài khoản Google'}
              </Button>
            )}
          </div>

          <div className="border-t border-slate-200 pt-5 space-y-3">
            <div>
              <h4 className="font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" /> Đổi mật khẩu
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Mật khẩu được đổi trực tiếp trong Firebase Authentication và không được lưu trong Firestore.
              </p>
            </div>

            {hasPasswordProvider ? (
              <>
                <Input
                  label="Mật khẩu hiện tại"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <Input
                  label="Mật khẩu mới"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                />
                <Input
                  label="Nhập lại mật khẩu mới"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />

                {newPassword && newPassword.length < 6 && (
                  <p className="text-xs font-semibold text-rose-600">
                    Mật khẩu mới phải có ít nhất 6 ký tự.
                  </p>
                )}
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs font-semibold text-rose-600">
                    Hai mật khẩu mới chưa trùng nhau.
                  </p>
                )}

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleChangePassword}
                  disabled={
                    isChangingPassword ||
                    !currentPassword ||
                    newPassword.length < 6 ||
                    newPassword !== confirmPassword
                  }
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  {isChangingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                </Button>
              </>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm font-semibold text-amber-900">
                Tài khoản này hiện không dùng đăng nhập bằng mật khẩu.
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Lớp Học Tương Tác © 2026 - Dành cho Giáo viên Tiểu học Việt Nam
      </footer>
    </div>
  );
};
