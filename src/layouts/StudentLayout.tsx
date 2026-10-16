import {StudentLearningSignal} from '../components/activities/LearningSignals';
import {SCHOOL_LOGO_SRC} from '../assets/schoolLogo';
import React,{useEffect,useRef} from 'react';
import {useWorksheetState} from '../hooks/useWorksheet';
import { Outlet, Link,useNavigate } from 'react-router-dom';
import { Sparkles, Home, UserCheck } from 'lucide-react';
import { useStudentSession } from '../context/StudentSessionContext';
import { DevTestPanel } from '../components/student/DevTestPanel';
import { isFirebaseActive } from '../services/realtime/realtimeServiceSwitch';

const StudentLayoutInner: React.FC = () => {
  const { session,room } = useStudentSession();
  const {state}=useWorksheetState(session.studentId?session.roomId:null);
  const navigate=useNavigate(),lastWorksheet=useRef('');
  useEffect(()=>{const key=[session.roomId,session.studentId,state.worksheetId].join(':');if(state.worksheetId&&session.studentId&&room?.status!=='FINISHED'&&lastWorksheet.current!==key){lastWorksheet.current=key;navigate('/student/worksheet');}},[session.roomId,session.studentId,state.worksheetId,room?.status,navigate]);

  return (
    <div className="learning-shell min-h-screen flex flex-col justify-between select-none">
      {/* Dev Test Panel for simulation */}
      {!isFirebaseActive && <DevTestPanel />}

      {/* Student Top Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-sky-200/90 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={SCHOOL_LOGO_SRC} alt="Logo Trường Tiểu học Sông Công" className="w-11 h-11 object-contain shrink-0"/>
            <div>
              <span className="font-black text-base sm:text-lg text-sky-950 tracking-tight block">TIỂU HỌC SÔNG CÔNG</span>
              <span className="text-xs font-black text-amber-700 block">Góc học tập của em</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/student/practice"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 text-amber-950 font-black text-xs sm:text-sm border border-amber-300/90 hover:from-amber-200 hover:to-orange-200 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              Bài tập & Kiểm tra
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
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {session.studentId&&<Link to="/student/worksheet" className="mb-4 rounded-xl bg-emerald-700 text-white font-bold p-3 text-center">Phiếu / Hoạt động và bài đã trả</Link>}
        {session.studentId&&session.roomId&&<StudentLearningSignal key={session.roomId+session.studentId} roomId={session.roomId} studentId={session.studentId} finished={room?.status==='FINISHED'}/>}
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
    <StudentLayoutInner />
  );
};
