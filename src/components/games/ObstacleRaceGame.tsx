import React, { useState, useEffect, useRef } from 'react';
import type { GameQuestionItem } from './classroomGamesData';
import { SAMPLE_MILLIONAIRE_QUESTIONS } from './classroomGamesData';
import {
  playCorrectSound,
  playWrongSound,
  playFanfareSound,
  playSuspenseSound,
  playStartSound,
  playTickSound,
} from '../../utils/audio';
import { triggerConfetti } from '../../utils/confetti';
import { RotateCcw, Shield, Clock, Play, Pause, Plus, Minus } from 'lucide-react';

interface ObstacleRaceGameProps {
  questions?: GameQuestionItem[];
  onExit?: () => void;
}

const OBSTACLE_STAGES = [
  { name: 'Vành đai Thiên thạch', icon: '☄️', desc: 'Thiên thạch che khuất tầm nhìn tàu' },
  { name: 'Bão Từ trường', icon: '⚡', desc: 'Sóng điện từ làm nhiễu la bàn định vị' },
  { name: 'Lực hút Hố đen', icon: '🌀', desc: 'Trọng trường cực mạnh cản trở lực đẩy' },
  { name: 'Tường lửa Plasma', icon: '🔥', desc: 'Hàng rào nhiệt độ cao chắn đường' },
  { name: 'Mật mã Động cơ', icon: '🔐', desc: 'Cần mở khóa nhiên liệu lượng tử' },
  { name: 'Cổng Siêu không gian', icon: '🌌', desc: 'Cổng dịch chuyển đưa tàu về đích an toàn' },
];

export const ObstacleRaceGame: React.FC<ObstacleRaceGameProps> = ({
  questions = SAMPLE_MILLIONAIRE_QUESTIONS,
  onExit,
}) => {
  const stageQuestions = questions.slice(0, OBSTACLE_STAGES.length);

  const [currentStage, setCurrentStage] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [shields, setShields] = useState(3);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Timer controls
  const [timerDuration, setTimerDuration] = useState<number>(30); // 0 = unlimited
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(false);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQ = stageQuestions[currentStage] || stageQuestions[0];
  const stageInfo = OBSTACLE_STAGES[currentStage] || OBSTACLE_STAGES[0];

  const handleStartTimer = () => {
    playStartSound();
    setIsTimerStarted(true);
    setIsTimerPaused(false);
  };

  const handleChangeDuration = (sec: number) => {
    setTimerDuration(sec);
    setSecondsLeft(sec);
  };

  const handleAdjustSeconds = (amount: number) => {
    setSecondsLeft((prev) => Math.max(1, prev + amount));
  };

  const handleTimeOut = () => {
    setIsRevealed(true);
    playWrongSound();
    setShields((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setIsGameOver(true);
      }
      return next;
    });
  };

  // Timer effect
  useEffect(() => {
    if (
      !isTimerStarted ||
      isTimerPaused ||
      isRevealed ||
      isGameOver ||
      isWon ||
      timerDuration === 0
    ) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 6) {
          playTickSound();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStage, isTimerStarted, isTimerPaused, isRevealed, isGameOver, isWon, timerDuration]);

  const handleSelectOption = (opt: string) => {
    if (isRevealed || isWon || isGameOver) return;
    playSuspenseSound();
    setSelectedOption(opt);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || isRevealed) return;
    setIsRevealed(true);

    const isCorrect = selectedOption.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      playCorrectSound();
      if (currentStage + 1 >= stageQuestions.length) {
        setIsWon(true);
        playFanfareSound();
        triggerConfetti(4000);
      }
    } else {
      playWrongSound();
      setShields((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setIsGameOver(true);
        }
        return next;
      });
    }
  };

  const handleNextStage = () => {
    if (currentStage + 1 < stageQuestions.length) {
      setCurrentStage((prev) => prev + 1);
      setSelectedOption(null);
      setIsRevealed(false);
      setIsTimerStarted(false);
      setIsTimerPaused(false);
      setSecondsLeft(timerDuration);
    }
  };

  const handleRestart = () => {
    setCurrentStage(0);
    setSelectedOption(null);
    setIsRevealed(false);
    setShields(3);
    setIsWon(false);
    setIsGameOver(false);
    setIsTimerStarted(false);
    setIsTimerPaused(false);
    setSecondsLeft(timerDuration);
  };

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-lg shadow-rose-500/30 text-xl border-2 border-rose-300">
            🚀
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-rose-300 tracking-tight flex items-center gap-2">
              VƯỢT CHƯỚNG NGẠI VẬT: GIẢI CỨU CON TÀU
            </h1>
            <p className="text-xs text-indigo-300 font-medium">
              Vượt qua {stageQuestions.length} chướng ngại vật vũ trụ để đưa phi thuyền về đích an toàn
            </p>
          </div>
        </div>

        {/* Status / Shields */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-900/60 border border-indigo-700 text-xs font-bold text-indigo-200">
            <Shield className="w-4 h-4 text-sky-400" />
            <span>Khiên năng lượng:</span>
            <div className="flex gap-1 ml-1">
              {[1, 2, 3].map((s) => (
                <span key={s} className="text-sm">
                  {s <= shields ? '🛡️' : '💔'}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs border border-amber-300 shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Bắt đầu lại
          </button>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
            >
              Thoát
            </button>
          )}
        </div>
      </div>

      {/* Progress Map of Obstacles */}
      <div className="my-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {stageQuestions.map((_, idx) => {
            const st = OBSTACLE_STAGES[idx];
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;

            return (
              <div
                key={st.name}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center relative ${
                  isCompleted
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                    : isCurrent
                    ? 'bg-amber-500 text-slate-950 border-amber-200 shadow-lg shadow-amber-500/30 font-black scale-105'
                    : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <span className="text-2xl mb-1">{isCompleted ? '✅' : isCurrent ? '🚀' : st.icon}</span>
                <span className="text-xs font-black truncate max-w-full">
                  Trạm {idx + 1}
                </span>
                <span className="text-[10px] font-bold opacity-80 truncate max-w-full">
                  {st.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Obstacle & Question */}
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Stage Alert Banner */}
        <div className="bg-gradient-to-r from-rose-950 via-indigo-950 to-rose-950 border-2 border-rose-500/80 rounded-3xl p-5 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{stageInfo.icon}</span>
            <div>
              <span className="text-xs font-black text-rose-400 uppercase tracking-wider block">
                Chướng ngại vật {currentStage + 1} / {stageQuestions.length}:
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {stageInfo.name}
              </h3>
              <p className="text-xs text-rose-200 mt-0.5">{stageInfo.desc}</p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/40">
            Trả lời đúng để giải cứu
          </span>
        </div>

        {/* Question Content */}
        <div className="relative bg-slate-900/90 border-2 border-indigo-700 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
            {currentQ.content}
          </h2>

          {/* Floating Timer Badge */}
          <div className="absolute -top-5 right-6">
            <div
              className={`min-w-12 h-12 px-3 rounded-2xl flex items-center justify-center font-black text-xl border-3 shadow-xl transition-all ${
                timerDuration === 0
                  ? 'bg-indigo-900 border-amber-400 text-amber-300'
                  : !isTimerStarted
                  ? 'bg-slate-900 border-amber-400 text-amber-300'
                  : secondsLeft <= 5
                  ? 'bg-rose-600 border-rose-300 text-white animate-bounce'
                  : isTimerPaused
                  ? 'bg-amber-600 border-amber-300 text-white'
                  : 'bg-indigo-900 border-amber-400 text-amber-300'
              }`}
            >
              {timerDuration === 0 ? '∞' : `${secondsLeft}s`}
            </div>
          </div>
        </div>

        {/* Teacher Timer Control Bar (Start & Adjust) */}
        <div className="bg-slate-900/90 border-2 border-indigo-700/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Clock className="w-4 h-4 text-amber-400" /> THỜI GIAN:
            </span>

            {!isTimerStarted ? (
              <button
                type="button"
                onClick={handleStartTimer}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/30 border-2 border-amber-200 cursor-pointer active:scale-95 flex items-center gap-1.5 animate-pulse"
              >
                <Play className="w-4 h-4 fill-slate-950" /> BẮT ĐẦU TÍNH GIỜ
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs border-2 flex items-center gap-1.5 transition-all ${
                  isTimerPaused
                    ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-300 text-slate-950'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400 text-amber-300'
                }`}
              >
                {isTimerPaused ? <Play className="w-4 h-4 fill-slate-950" /> : <Pause className="w-4 h-4" />}
                {isTimerPaused ? 'TIẾP TỤC GIỜ' : 'TẠM DỪNG'}
              </button>
            )}

            {timerDuration !== 0 && (
              <div className="flex items-center gap-1 ml-1">
                <button
                  type="button"
                  onClick={() => handleAdjustSeconds(-5)}
                  className="px-2 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-800 border border-indigo-700 text-[11px] font-bold text-indigo-300 flex items-center"
                  title="Giảm 5 giây"
                >
                  <Minus className="w-3 h-3 mr-0.5" /> 5s
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustSeconds(10)}
                  className="px-2 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-800 border border-indigo-700 text-[11px] font-bold text-amber-300 flex items-center"
                  title="Cộng thêm 10 giây"
                >
                  <Plus className="w-3 h-3 mr-0.5" /> 10s
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Đặt mức:</span>
            {[15, 30, 45, 60, 0].map((sec) => (
              <button
                type="button"
                key={sec}
                onClick={() => handleChangeDuration(sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  timerDuration === sec
                    ? 'bg-amber-400 text-slate-950 border border-amber-200 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {sec === 0 ? '∞ Vô hạn' : `${sec}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt, idx) => {
            const letter = letters[idx];
            const isSelected = selectedOption === opt;
            const isCorrect = opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

            let styles =
              'bg-slate-900/90 border-indigo-800 text-indigo-100 hover:border-amber-400 hover:bg-indigo-950/80';

            if (isRevealed) {
              if (isCorrect) {
                styles = 'bg-emerald-600 border-emerald-300 text-white shadow-xl shadow-emerald-500/30';
              } else if (isSelected) {
                styles = 'bg-rose-600 border-rose-300 text-white';
              }
            } else if (isSelected) {
              styles = 'bg-amber-500 border-amber-200 text-slate-950 shadow-lg shadow-amber-500/20';
            }

            return (
              <button
                type="button"
                key={opt}
                disabled={isRevealed}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 cursor-pointer active:scale-98 ${styles}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 border ${
                    isSelected && !isRevealed
                      ? 'bg-slate-950 text-amber-300 border-amber-300'
                      : isRevealed && isCorrect
                      ? 'bg-emerald-800 text-white border-emerald-300'
                      : 'bg-indigo-950 text-amber-400 border-indigo-700'
                  }`}
                >
                  {letter}
                </div>
                <span className="text-base sm:text-lg font-bold flex-1 leading-snug">
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {isRevealed && currentQ.explanation && (
            <div className="text-xs text-indigo-300">
              <strong className="text-amber-400">Giải thích: </strong>
              {currentQ.explanation}
            </div>
          )}

          <div className="ml-auto flex items-center gap-3">
            {!isRevealed && (
              <button
                type="button"
                disabled={!selectedOption}
                onClick={handleConfirmAnswer}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 border-2 border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                XÁC NHẬN ĐÁP ÁN
              </button>
            )}

            {isRevealed && !isWon && !isGameOver && (
              <button
                type="button"
                onClick={handleNextStage}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 border-2 border-emerald-300 cursor-pointer active:scale-95 flex items-center gap-2"
              >
                TIẾP TỤC HÀNH TRÌNH ➔
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Win Modal */}
      {isWon && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-rose-600 via-indigo-700 to-purple-800 p-8 sm:p-10 rounded-3xl text-center max-w-lg border-4 border-rose-300 shadow-2xl text-white space-y-4">
            <div className="text-6xl animate-bounce">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              GIẢI CỨU THÀNH CÔNG!
            </h2>
            <p className="text-base font-medium text-rose-100">
              Con tàu vũ trụ đã an toàn vượt qua mọi chướng ngại vật và trở về căn cứ trong sự reo hò của cả lớp!
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-black hover:bg-rose-50 border-2 border-rose-300"
              >
                Chơi lại màn mới
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-6 py-3 rounded-2xl bg-slate-950 text-white font-black hover:bg-slate-900 border border-slate-700"
                >
                  Quay lại kho game
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 p-8 sm:p-10 rounded-3xl text-center max-w-lg border-4 border-rose-600 shadow-2xl text-white space-y-4">
            <div className="text-6xl">💥</div>
            <h2 className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
              KHIÊN NĂNG LƯỢNG ĐÃ CẠN
            </h2>
            <p className="text-sm font-medium text-slate-300">
              Con tàu gặp nạn giữa các chướng ngại vật. Hãy nạp lại năng lượng và thử lại cùng cả lớp!
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400"
              >
                Thử lại lần nữa
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-6 py-3 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700"
                >
                  Thoát
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
