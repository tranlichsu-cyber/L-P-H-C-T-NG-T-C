import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, Home, UserCheck } from 'lucide-react';
import { useStudentSession, StudentSessionProvider } from '../context/StudentSessionContext';
import { DevTestPanel } from '../components/student/DevTestPanel';
import { isFirebaseActive } from '../services/realtime/realtimeServiceSwitch';

const StudentLayoutInner: React.FC = () => {
  const { session } = useStudentSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 flex flex-col justify-between select-none">
      {/* Dev Test Panel for simulation */}
      {!isFirebaseActive && <DevTestPanel />}

      {/* Student Top Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-sky-200/90 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-amber-300">
              <Sparkles className="w-6 h-6 animate-bounce text-slate-950" />
            </div>
            <div>
              <span className="font-black text-xl text-sky-950 tracking-tight block">LỚP HỌC TƯƠNG TÁC</span>
              <span className="text-xs font-black text-amber-700 block">Trang Dành Cho Học Sinh 🎈</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/student/practice"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 text-amber-950 font-black text-xs sm:text-sm border border-amber-300/90 hover:from-amber-200 hover:to-orange-200 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              Bài ôn tập
            </Link>

            {session.studentName ? (
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-950 border border-emerald-300 font-black text-xs sm:text-sm shadow-xs">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>{session.studentName}</span>
              </div>
            ) : (
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-sky-800 font-black text-xs sm:text-sm border border-sky-200 hover:bg-sky-50 transition-colors shadow-xs"
              >
                <Home className="w-4 h-4" />
                Trang chủ
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <Outlet />
      </main>

      {/* Student Friendly Footer */}
      <footer className="py-4 text-center text-xs font-black text-sky-800/70">
        🌟 Chúc các em học tập thật vui vẻ và đạt kết quả cao! 🌟
      </footer>
    </div>
  );
};

export const StudentLayout: React.FC = () => {
  return (
    <StudentSessionProvider>
      <StudentLayoutInner />
    </StudentSessionProvider>
  );
};
