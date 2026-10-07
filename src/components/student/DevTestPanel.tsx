import React, { useState } from 'react';
import { useStudentSession } from '../../context/StudentSessionContext';
import { Sliders, RefreshCw, Play, Lock, Eye, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

export const DevTestPanel: React.FC = () => {
  const { devControls, resetSession, session } = useStudentSession();
  const [isExpanded, setIsExpanded] = useState(true);

  // Render ONLY in dev mode
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed top-2 right-2 z-50 max-w-sm w-full font-sans shadow-2xl rounded-2xl bg-slate-900/95 text-white border border-slate-700 backdrop-blur-md transition-all text-xs">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2.5 flex items-center justify-between cursor-pointer bg-amber-500/20 text-amber-300 rounded-t-2xl font-bold border-b border-slate-800 select-none"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>DEV TEST ONLY (Mô phỏng Giáo viên)</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Status info */}
          <div className="p-2 bg-slate-800/80 rounded-xl space-y-1 text-[11px] font-mono border border-slate-700">
            <div>📌 Room: <strong className="text-amber-400">{session.roomCode || 'Chưa tham gia'}</strong></div>
            <div>🎒 Học sinh: <strong className="text-sky-400">{session.studentName || 'Chưa chọn'}</strong></div>
            <div>❓ Câu hỏi: <strong className="text-emerald-400">{session.currentQuestionId || 'None'}</strong></div>
            <div>🔄 Trạng thái: <strong className="text-purple-300">{session.liveQuestion?.status || 'WAITING'}</strong></div>
            <div>📝 Đã nộp: <strong className={session.hasSubmitted ? 'text-emerald-400' : 'text-slate-400'}>{session.hasSubmitted ? `Có (${session.submittedAnswer})` : 'Chưa'}</strong></div>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">1. Điều khiển Phòng:</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={devControls.setWaiting}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold flex items-center justify-center gap-1 text-slate-200"
              >
                <RotateCcw className="w-3 h-3 text-sky-400" /> Trở về WAITING
              </button>
              <button
                onClick={resetSession}
                className="p-2 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg font-bold flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset Session
              </button>
            </div>
          </div>

          {/* Question 1 Controls */}
          <div className="space-y-1.5 p-2 bg-slate-800/50 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-sky-300 block">Câu 1: 125 × 4 = ? (Trắc nghiệm)</span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => devControls.openQuestion('q1')}
                className="p-1.5 bg-emerald-700 hover:bg-emerald-600 rounded font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" /> OPEN
              </button>
              <button
                onClick={devControls.closeQuestion}
                className="p-1.5 bg-amber-700 hover:bg-amber-600 rounded font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <Lock className="w-3 h-3" /> CLOSE
              </button>
              <button
                onClick={devControls.showResult}
                className="p-1.5 bg-sky-700 hover:bg-sky-600 rounded font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" /> RESULT
              </button>
            </div>
          </div>

          {/* Question 2 Controls */}
          <div className="space-y-1.5 p-2 bg-slate-800/50 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-emerald-300 block">Câu 2: 1000m = 1km (Đúng / Sai)</span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => devControls.openQuestion('q2')}
                className="p-1.5 bg-emerald-700 hover:bg-emerald-600 rounded font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" /> OPEN
              </button>
              <button
                onClick={devControls.closeQuestion}
                className="p-1.5 bg-amber-700 hover:bg-amber-600 rounded font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <Lock className="w-3 h-3" /> CLOSE
              </button>
              <button
                onClick={devControls.showResult}
                className="p-1.5 bg-sky-700 hover:bg-sky-600 rounded font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" /> RESULT
              </button>
            </div>
          </div>

          {/* Question 3 Controls */}
          <div className="space-y-1.5 p-2 bg-slate-800/50 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-amber-300 block">Câu 3: Thủ đô VN (Trả lời ngắn)</span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => devControls.openQuestion('q3')}
                className="p-1.5 bg-emerald-700 hover:bg-emerald-600 rounded font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" /> OPEN
              </button>
              <button
                onClick={devControls.closeQuestion}
                className="p-1.5 bg-amber-700 hover:bg-amber-600 rounded font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <Lock className="w-3 h-3" /> CLOSE
              </button>
              <button
                onClick={devControls.showResult}
                className="p-1.5 bg-sky-700 hover:bg-sky-600 rounded font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" /> RESULT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
