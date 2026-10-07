import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Radio, LogOut, GraduationCap, Sparkles, History, HeartHandshake, Building2, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TeacherLayout: React.FC = () => {
  const location = useLocation();
  const { currentUser, signOutTeacher } = useAuth();
  const accountLabel = currentUser?.displayName || currentUser?.email || 'Trần Lịch Sử';

  const navItems = [
    { path: '/teacher', label: 'Tổng quan', icon: LayoutDashboard, idle: 'bg-sky-50 text-sky-700 border-sky-200', active: 'bg-sky-600 text-white border-sky-600 shadow-sky-200' },
    { path: '/teacher/classes', label: 'Quản lý lớp', icon: Users, idle: 'bg-emerald-50 text-emerald-700 border-emerald-200', active: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200' },
    { path: '/teacher/quizzes', label: 'Ngân hàng câu hỏi', icon: BookOpen, idle: 'bg-violet-50 text-violet-700 border-violet-200', active: 'bg-violet-600 text-white border-violet-600 shadow-violet-200' },
    { path: '/teacher/ai', label: 'Trợ lý AI', icon: Sparkles, idle: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200', active: 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-fuchsia-200' },
    { path: '/teacher/remediation', label: 'Ôn tập & Củng cố', icon: HeartHandshake, idle: 'bg-amber-50 text-amber-800 border-amber-200', active: 'bg-amber-500 text-slate-950 border-amber-500 shadow-amber-200' },
    { path: '/teacher/room', label: 'Phòng học Live', icon: Radio, idle: 'bg-rose-50 text-rose-700 border-rose-200', active: 'bg-rose-600 text-white border-rose-600 shadow-rose-200' },
    { path: '/teacher/history', label: 'Lịch sử dạy học', icon: History, idle: 'bg-cyan-50 text-cyan-700 border-cyan-200', active: 'bg-cyan-600 text-white border-cyan-600 shadow-cyan-200' },
    { path: '/team', label: 'Tổ chuyên môn', icon: Crown, idle: 'bg-orange-50 text-orange-700 border-orange-200', active: 'bg-orange-500 text-white border-orange-500 shadow-orange-200' },
    { path: '/admin', label: 'Quản trị trường', icon: Building2, idle: 'bg-indigo-50 text-indigo-700 border-indigo-200', active: 'bg-indigo-700 text-white border-indigo-700 shadow-indigo-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/teacher" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-sky-600/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-lg text-slate-900 leading-tight block tracking-tight">Lớp Học Tương Tác</span>
                <span className="text-[11px] font-extrabold text-sky-600 uppercase tracking-wider block">Giao diện Giáo viên v1.1</span>
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

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 text-xs font-bold border border-emerald-200/80 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              {accountLabel}
            </div>
            <button
              type="button"
              onClick={async () => { await signOutTeacher(); window.location.href = '/'; }}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
              title="Đổi vai trò / Đăng xuất"
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Lớp Học Tương Tác © 2026 - Dành cho Giáo viên Tiểu học Việt Nam
      </footer>
    </div>
  );
};
