import React from 'react';
import { Button } from '../common/Button';
import type { MysteryDoorItem, LiveQuestionPublic } from '../../services/realtime/types';
import { playCorrectSound } from '../../utils/audio';
import { DoorClosed, CheckCircle2 } from 'lucide-react';

interface MysteryDoorGameProps {
  doors: MysteryDoorItem[];
  liveQuestions: Record<string, LiveQuestionPublic>;
  onOpenDoor: (doorId: number) => void;
  onShowResult: (questionId: string) => void;
  onCloseGame: () => void;
}

export const MysteryDoorGame: React.FC<MysteryDoorGameProps> = ({
  doors,
  liveQuestions,
  onOpenDoor,
  onShowResult,
  onCloseGame,
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in border-2 border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-2xl font-black text-sky-400 flex items-center gap-2">
            🚪 Ô CỬA BÍ MẬT
          </h3>
          <p className="text-xs text-slate-400">Chọn một ô cửa bất kỳ để khám phá câu hỏi bí mật bên trong!</p>
        </div>

        <Button variant="outline" size="sm" onClick={onCloseGame} className="text-slate-300 border-slate-700">
          Đóng Trò Chơi
        </Button>
      </div>

      {/* Grid of Mystery Doors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-4">
        {doors.map((door) => {
          const q = liveQuestions[door.questionId];

          return (
            <div
              key={door.id}
              onClick={() => {
                if (!door.isOpened) {
                  playCorrectSound();
                  onOpenDoor(door.id);
                }
              }}
              className={`p-6 rounded-3xl border-4 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center min-h-[160px] text-center shadow-xl ${
                door.isOpened
                  ? 'bg-sky-950/80 border-sky-400 scale-[0.98]'
                  : 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 hover:scale-105 active:scale-95 text-slate-950'
              }`}
            >
              {door.isOpened ? (
                <div className="space-y-2">
                  <span className="text-xs font-black text-sky-400 uppercase">Ô CỬA #{door.id} DA MỞ</span>
                  <p className="text-sm font-bold text-white leading-snug">{q?.content || 'Câu hỏi bí mật'}</p>

                  {q?.status === 'OPEN' && (
                    <span className="inline-block px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-black rounded-full animate-pulse">
                      ĐANG NHẬN ĐÁP ÁN
                    </span>
                  )}

                  {q?.status === 'CLOSED' && (
                    <Button
                      variant="success"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowResult(q.id);
                      }}
                      className="font-bold"
                    >
                      Hiện đáp án
                    </Button>
                  )}

                  {q?.status === 'RESULT' && (
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đáp án: {q.correctAnswer}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950/20 flex items-center justify-center mx-auto text-slate-950">
                    <DoorClosed className="w-8 h-8" />
                  </div>
                  <h4 className="text-3xl font-black">Ô SỐ {door.id}</h4>
                  <span className="text-xs font-bold opacity-80">Bấm để mở ô cửa</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
