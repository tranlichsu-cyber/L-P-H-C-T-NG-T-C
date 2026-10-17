import React from 'react';
import { Button } from '../common/Button';
import type { KnowledgeBoxItem, LiveQuestionPublic } from '../../services/realtime/types';
import { playCorrectSound } from '../../utils/audio';
import { Gift, CheckCircle2 } from 'lucide-react';

interface KnowledgeBoxGameProps {
  boxes: KnowledgeBoxItem[];
  liveQuestions: Record<string, LiveQuestionPublic>;
  onOpenBox: (boxId: number) => void;
  onCloseQuestion: (questionId:string)=>void;
  onShowResult: (questionId: string) => void;
  onCloseGame: () => void;
}

export const KnowledgeBoxGame: React.FC<KnowledgeBoxGameProps> = ({
  boxes,
  liveQuestions,
  onOpenBox,
  onShowResult,
  onCloseQuestion,
  onCloseGame,
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in border-2 border-slate-800">
      <div className="flex flex-wrap gap-3 items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-2xl font-black text-purple-400 flex items-center gap-2">
            🎁 HỘP QUÀ KIẾN THỨC
          </h3>
          <p className="text-xs text-slate-400">Chọn một hộp quà bất ngờ để nhận câu hỏi, lời khen hoặc hoạt động cùng bạn. Không cộng điểm may mắn!</p>
        </div>

        <Button variant="outline" size="sm" onClick={onCloseGame} className="text-slate-300 border-slate-700">
          Đóng Trò Chơi
        </Button>
      </div>

      {/* Grid of Knowledge Gift Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-4">
        {boxes.map((box) => {
          const q = box.questionId ? liveQuestions[box.questionId] : null;

          return (
            <div
              key={box.id}
              className={`p-6 rounded-3xl border-4 transition-all duration-500 flex flex-col items-center justify-center min-h-[160px] text-center shadow-xl ${
                box.isOpened
                  ? 'bg-purple-950/80 border-purple-400 scale-[0.98]'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-300 hover:scale-105 active:scale-95 text-white'
              }`}
            >
              {box.isOpened ? (
                <div className="space-y-2">
                  <span className="text-xs font-black text-purple-300 uppercase">HỘP #{box.id} ĐÃ MỞ</span>

                  {box.type === 'BONUS_POINTS' && (
                    <div className="space-y-1">
                      <div className="text-3xl font-black text-amber-400">⭐ LỜI KHEN</div>
                      <p className="text-xs font-bold text-slate-200">Cả lớp cùng vỗ tay! Phần quà này không cộng điểm học tập.</p>
                    </div>
                  )}

                  {box.type === 'SPECIAL_ACTION' && (
                    <div className="space-y-1">
                      <div className="text-lg font-black text-amber-300">⭐ CÙNG CỐ GẮNG</div>
                      <p className="text-xs font-bold text-slate-200">{box.specialActionText}</p>
                    </div>
                  )}

                  {box.type === 'QUESTION' && q && (
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-white leading-snug">{q.content}</p>
                      {q.status === 'OPEN'&&<Button size="xs" onClick={()=>onCloseQuestion(q.id)}>Đóng nhận bài</Button>}{q.status === 'CLOSED' && (
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
                      {q.status === 'RESULT' && (
                        <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Đáp án: {q.correctAnswer}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" onClick={()=>{playCorrectSound();onOpenBox(box.id);}} className="w-full min-h-24 space-y-2 focus-visible:outline-4 focus-visible:outline-amber-300" aria-label={"Mở hộp quà "+box.id}>
                  <div className="w-14 h-14 rounded-2xl bg-slate-950/30 flex items-center justify-center mx-auto text-amber-300 shadow-md">
                    <Gift className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black">Hộp {box.id}</h4>
                  <span className="text-xs font-bold opacity-80">Bấm để nhận quà</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
