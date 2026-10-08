import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useStudentSession } from '../../context/StudentSessionContext';
import { PartyPopper, Lightbulb, ArrowRight, HelpCircle } from 'lucide-react';

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, room, continueAfterResult } = useStudentSession();

  // Route Guards
  if (!session.roomCode) {
    return <Navigate to="/student/join" replace />;
  }
  if (!session.studentName) {
    return <Navigate to="/student/select-name" replace />;
  }
  if (!session.liveQuestion || session.liveQuestion.status !== 'RESULT') {
    return <Navigate to="/student/waiting" replace />;
  }

  const q = session.liveQuestion;
  const isCorrect = session.isCorrect;

  const displayCorrectAnswer = (() => {
    const raw = q.correctAnswer || '';
    if (
      q.type === 'MULTIPLE_CHOICE' &&
      /^[A-D]$/i.test(raw.trim()) &&
      q.options?.length
    ) {
      const index = raw.trim().toUpperCase().charCodeAt(0) - 65;
      return q.options[index] || raw;
    }

    if (q.type === 'TRUE_FALSE') {
      const normalized = raw
        .trim()
        .toLocaleLowerCase('vi-VN')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd');

      if (['dung', 'true', '1', 'yes'].includes(normalized)) return 'Đúng';
      if (['sai', 'false', '0', 'no'].includes(normalized)) return 'Sai';
    }

    return raw;
  })();
  const currentScore =
    session.studentId && room?.scores?.[session.studentId]
      ? room.scores[session.studentId].score
      : 0;
  const correctPoints = q.correctPoints ?? 10;
  const wrongPenalty = q.wrongPenalty ?? 5;

  const handleContinue = () => {
    continueAfterResult();
    navigate('/student/waiting');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center animate-fade-in">
      {/* Result Display Card */}
      <div
        className={`bg-white rounded-3xl p-8 border-4 shadow-xl transition-all ${
          isCorrect ? 'border-emerald-400 bg-emerald-50/20' : 'border-amber-400 bg-amber-50/20'
        }`}
      >
        {isCorrect ? (
          <div>
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-4 border-emerald-300 shadow-lg animate-bounce">
              <PartyPopper className="w-12 h-12" />
            </div>

            <h1 className="text-3xl font-black text-emerald-950 mb-1">CHÍNH XÁC! 🎉</h1>
            <p className="text-slate-600 font-bold text-base mb-2">
              Em đã trả lời đúng! Xuất sắc lắm! 🌟
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-600 text-white font-black text-lg mb-6">
              +{correctPoints} điểm
            </div>

            <div className="p-4 rounded-2xl bg-emerald-100/80 border-2 border-emerald-300 text-emerald-950 text-sm font-bold mb-6">
              <span className="text-xs text-emerald-800 block mb-1">Đáp án đúng chuẩn:</span>
              <span className="text-xl font-black">{displayCorrectAnswer}</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="w-24 h-24 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border-4 border-amber-300 shadow-lg">
              <Lightbulb className="w-12 h-12" />
            </div>

            <h1 className="text-3xl font-black text-amber-950 mb-1">TIẾC QUÁ 💡</h1>
            <p className="text-slate-600 font-bold text-base mb-2">
              Em chưa chọn đúng lần này, cố gắng hơn ở câu tiếp theo nhé!
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-rose-600 text-white font-black text-lg mb-6">
              -{wrongPenalty} điểm
            </div>

            <div className="p-4 rounded-2xl bg-amber-100/80 border-2 border-amber-300 text-amber-950 text-sm font-bold mb-6">
              <span className="text-xs text-amber-800 block mb-1">Đáp án đúng là:</span>
              <span className="text-xl font-black">{displayCorrectAnswer}</span>
              {session.submittedAnswer && (
                <div className="text-xs font-normal text-slate-600 mt-1 border-t border-amber-200/60 pt-1">
                  Câu trả lời của em: <span className="line-through">{session.submittedAnswer}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-950 mb-6">
          <span className="text-xs font-bold text-sky-700 uppercase block">Điểm hiện tại của em</span>
          <span className="text-3xl font-black">{currentScore} điểm</span>
        </div>

        {/* Explanation Section */}
        {q.explanation && (
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-left mb-6 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>Giải thích chi tiết:</span>
            </div>
            <p className="font-medium">{q.explanation}</p>
          </div>
        )}

        {/* Continue Button */}
        <Button variant="student" size="xl" fullWidth onClick={handleContinue}>
          TIẾP TỤC <ArrowRight className="w-6 h-6 ml-2 inline" />
        </Button>
      </div>
    </div>
  );
};
