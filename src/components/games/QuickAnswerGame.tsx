import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import type { LiveQuestionPublic, MockSubmission } from '../../services/realtime/types';
import { playStartSound, playCorrectSound } from '../../utils/audio';
import { Clock, Trophy } from 'lucide-react';

interface QuickAnswerGameProps {
  question: LiveQuestionPublic | null;
  submissions: MockSubmission[];
  timerDuration: number;
  onOpenQuestion: () => void;
  onCloseQuestion: () => void;
  onShowResult: () => void;
  onCloseGame: () => void;
}

export const QuickAnswerGame: React.FC<QuickAnswerGameProps> = ({
  question,
  submissions,
  timerDuration,
  onOpenQuestion,
  onCloseQuestion,
  onShowResult,
  onCloseGame,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(timerDuration);

  // Client-side timer countdown logic (Zero Firestore writes per second!)
  useEffect(() => {
    if (!question || question.status !== 'OPEN' || timerDuration === 0) return;

    setTimeLeft(timerDuration);
    playStartSound();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCloseQuestion(); // Auto close on timer expiration
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [question?.status, timerDuration]);

  const qStatus = question?.status || 'READY';

  // Fast responders ranking list
  const fastResponders = [...submissions].sort((a, b) =>
    a.submittedAt.localeCompare(b.submittedAt)
  );

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in border-2 border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-2xl font-black text-emerald-400 flex items-center gap-2">
            ⚡ NHANH TAY CHỌN ĐÁP ÁN
          </h3>
          <p className="text-xs text-slate-400">Thi đấu tốc độ toàn lớp! Trả lời đúng và nhanh nhất để tích điểm.</p>
        </div>

        <Button variant="outline" size="sm" onClick={onCloseGame} className="text-slate-300 border-slate-700">
          Đóng Trò Chơi
        </Button>
      </div>

      {/* Timer Bar */}
      {timerDuration > 0 && qStatus === 'OPEN' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-bold text-amber-400">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Thời gian còn lại</span>
            <span className="text-2xl font-black font-mono">{timeLeft}s</span>
          </div>
          <div className="h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Question Display */}
      {question && (
        <div className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400 uppercase">CÂU HỎI TỐC ĐỘ</span>
            <span className="text-xs font-bold text-slate-400">Đã nộp: <strong className="text-amber-400 text-base">{submissions.length}</strong> lượt</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">{question.content}</h2>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {qStatus === 'READY' && (
          <Button variant="success" size="lg" onClick={onOpenQuestion} className="font-bold">
            ⚡ BẮT ĐẦU THI ĐẤU
          </Button>
        )}

        {qStatus === 'OPEN' && (
          <Button variant="danger" size="lg" onClick={onCloseQuestion} className="font-bold">
            🔒 ĐÓNG NHẬN BÀI
          </Button>
        )}

        {qStatus === 'CLOSED' && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              playCorrectSound();
              onShowResult();
            }}
            className="font-bold"
          >
            🏆 CÔNG BỐ KẾT QUẢ & CỘNG ĐIỂM
          </Button>
        )}
      </div>

      {/* Fast Responders Table */}
      {submissions.length > 0 && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Danh sách học sinh nộp bài nhanh nhất:
          </h4>
          <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs">
            {fastResponders.map((sub, idx) => (
              <div key={sub.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="font-bold text-white">
                  #{idx + 1} {sub.studentName}
                </span>
                <span className="font-mono text-emerald-400 font-bold">{sub.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
