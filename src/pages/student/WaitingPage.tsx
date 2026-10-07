import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStudentSession } from '../../context/StudentSessionContext';
import { Clock, Sparkles, CheckCircle2 } from 'lucide-react';

export const WaitingPage: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useStudentSession();

  // Automatic Navigation when status changes via devControls or Teacher
  useEffect(() => {
    if (session.liveQuestion) {
      if (session.liveQuestion.status === 'OPEN' || session.liveQuestion.status === 'CLOSED') {
        navigate('/student/quiz');
      } else if (session.liveQuestion.status === 'RESULT') {
        navigate('/student/result');
      }
    }
  }, [session.liveQuestion, navigate]);

  // Route Guards
  if (!session.roomCode) {
    return <Navigate to="/student/join" replace />;
  }

  if (!session.studentName) {
    return <Navigate to="/student/select-name" replace />;
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 border-2 border-sky-200 shadow-xl text-center space-y-6 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto border-4 border-sky-200 animate-pulse">
        <Clock className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Em đã vào phòng thành công
        </div>

        <h1 className="text-2xl font-black text-sky-950">Xin chào, {session.studentName}! 🎉</h1>
        <p className="text-sm font-bold text-slate-500">
          {session.className || 'Lớp 4A'} • Môn {session.subject || 'Toán'}
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-sky-50 border-2 border-sky-100 space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-sky-900 font-extrabold text-lg">
          <span>Đang chờ thầy/cô phát câu hỏi</span>
          <span className="flex gap-1">
            <span className="animate-ping">.</span>
            <span className="animate-ping delay-150">.</span>
            <span className="animate-ping delay-300">.</span>
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Hãy giữ nguyên màn hình. Màn hình sẽ tự động chuyển khi câu hỏi xuất hiện!
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        Sẵn sàng tinh thần chọn đáp án thật chính xác nhé!
      </div>
    </div>
  );
};
