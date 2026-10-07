import React from 'react';
import { Button } from '../common/Button';
import type { TeamData, LiveQuestionPublic, MockSubmission } from '../../services/realtime/types';
import { playCorrectSound } from '../../utils/audio';
// TeamRaceGame Component

interface TeamRaceGameProps {
  teams: Record<string, TeamData>;
  question: LiveQuestionPublic | null;
  submissions: MockSubmission[];
  onOpenQuestion: () => void;
  onCloseQuestion: () => void;
  onShowResult: () => void;
  onCloseGame: () => void;
}

export const TeamRaceGame: React.FC<TeamRaceGameProps> = ({
  teams,
  question,
  submissions,
  onOpenQuestion,
  onCloseQuestion,
  onShowResult,
  onCloseGame,
}) => {
  const teamsList = Object.values(teams || {}).sort((a, b) => a.displayOrder - b.displayOrder);
  const maxScore = Math.max(10, ...teamsList.map((t) => t.score));

  const qStatus = question?.status || 'READY';

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in border-2 border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-2xl font-black text-rose-400 flex items-center gap-2">
            🏎️ ĐUA XE THEO ĐỘI
          </h3>
          <p className="text-xs text-slate-400">Mỗi câu trả lời đúng của các thành viên sẽ đẩy xe đội tiến lên phía trước!</p>
        </div>

        <Button variant="outline" size="sm" onClick={onCloseGame} className="text-slate-300 border-slate-700">
          Đóng Trò Chơi
        </Button>
      </div>

      {/* Race Tracks Container */}
      <div className="space-y-4 my-6 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        {teamsList.map((team) => {
          const progressPct = Math.min(100, Math.max(5, (team.score / maxScore) * 100));

          return (
            <div key={team.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-extrabold">
                <span style={{ color: team.color }}>{team.name} ({team.memberIds.length} thành viên)</span>
                <span className="font-mono text-amber-400 text-sm">{team.score} Điểm</span>
              </div>

              {/* Race Track */}
              <div className="relative h-12 bg-slate-900 rounded-2xl border-2 border-slate-800 flex items-center px-2 overflow-hidden">
                {/* Finish Line */}
                <div className="absolute right-2 top-0 bottom-0 w-3 bg-gradient-to-b from-white via-slate-900 to-white opacity-80" />

                {/* Car Marker */}
                <div
                  className="absolute transition-all duration-700 ease-out flex items-center space-x-1"
                  style={{ left: `${progressPct}%`, transform: 'translateX(-100%)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white"
                    style={{ backgroundColor: team.color }}
                  >
                    🚗
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Question Panel */}
      {question && (
        <div className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-rose-400 uppercase">CÂU HỎI THI ĐẤU ĐỘI</span>
            <span className="text-xs font-bold text-slate-400">Lượt nộp: <strong className="text-amber-400 text-base">{submissions.length}</strong></span>
          </div>
          <h2 className="text-2xl font-black text-white">{question.content}</h2>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {qStatus === 'READY' && (
          <Button variant="success" size="lg" onClick={onOpenQuestion} className="font-bold">
            🏎️ BẮT ĐẦU VÒNG ĐUA
          </Button>
        )}

        {qStatus === 'OPEN' && (
          <Button variant="danger" size="lg" onClick={onCloseQuestion} className="font-bold">
            🔒 ĐÓNG VÒNG ĐUA
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
            🏆 CÔNG BỐ KẾT QUẢ & TIẾN XE
          </Button>
        )}
      </div>
    </div>
  );
};
