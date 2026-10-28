import React, { useState, useEffect, useRef } from 'react';
import type { GameQuestionItem } from './classroomGamesData';
import type { Student } from '../../types';
import {
  playSuspenseSound,
  playCorrectSound,
  playWrongSound,
  playLifelineSound,
  playFanfareSound,
  playTickSound,
} from '../../utils/audio';
import { triggerConfetti } from '../../utils/confetti';
import {
  HelpCircle,
  Users,
  UserCheck,
  RotateCcw,
  Play,
  Pause,
  Award,
} from 'lucide-react';

interface MillionaireGameProps {
  questions: GameQuestionItem[];
  students?: Student[];
  onExit?: () => void;
}

export const MillionaireGame: React.FC<MillionaireGameProps> = ({
  questions,
  students = [],
  onExit,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);

  // Lifelines
  const [used5050, setUsed5050] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [usedAudience, setUsedAudience] = useState(false);
  const [audienceStats, setAudienceStats] = useState<Record<string, number> | null>(null);
  const [usedFriend, setUsedFriend] = useState(false);
  const [chosenFriend, setChosenFriend] = useState<string | null>(null);

  // Timer
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQ = questions[currentIdx] || questions[0];
  const totalLevels = Math.min(questions.length, 15);

  const ladderScores = [
    '200', '400', '600', '1.000', '2.000',
    '3.000', '6.000', '10.000', '14.000', '22.000',
    '30.000', '40.000', '60.000', '85.000', '150.000',
  ].slice(0, totalLevels);

  // Reset for next question
  const resetQuestionState = (idx: number) => {
    setCurrentIdx(idx);
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setIsAnswerRevealed(false);
    setEliminatedOptions([]);
    setAudienceStats(null);
    setChosenFriend(null);
    setSecondsLeft(30);
    setIsTimerPaused(false);
  };

  // Timer ticking
  useEffect(() => {
    if (isAnswerRevealed || isGameOver || isWon || isTimerPaused) {
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
  }, [currentIdx, isAnswerRevealed, isGameOver, isWon, isTimerPaused]);

  const handleTimeOut = () => {
    setIsAnswerRevealed(true);
    setIsGameOver(true);
    playWrongSound();
  };

  // Select Option
  const handleSelectOption = (opt: string) => {
    if (isAnswerLocked || isAnswerRevealed || isGameOver) return;
    setSelectedOption(opt);
    playSuspenseSound();
  };

  // Confirm Answer
  const handleConfirmAnswer = () => {
    if (!selectedOption || isAnswerRevealed) return;
    setIsAnswerLocked(true);

    setTimeout(() => {
      setIsAnswerRevealed(true);
      const isCorrect = selectedOption.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        playCorrectSound();
        if (currentIdx + 1 >= totalLevels) {
          setIsWon(true);
          playFanfareSound();
          triggerConfetti(4000);
        }
      } else {
        playWrongSound();
        setIsGameOver(true);
      }
    }, 1200);
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentIdx + 1 < totalLevels) {
      resetQuestionState(currentIdx + 1);
    }
  };

  // Reset Game
  const handleRestart = () => {
    setCurrentIdx(0);
    setUsed5050(false);
    setUsedAudience(false);
    setUsedFriend(false);
    setIsGameOver(false);
    setIsWon(false);
    resetQuestionState(0);
  };

  // Lifeline 1: 50:50
  const handleUse5050 = () => {
    if (used5050 || isAnswerLocked || isAnswerRevealed) return;
    playLifelineSound();
    setUsed5050(true);

    const wrongOpts = currentQ.options.filter(
      (opt) => opt.trim().toLowerCase() !== currentQ.correctAnswer.trim().toLowerCase()
    );
    // Shuffle and pick 2 wrong options to eliminate
    const shuffledWrong = [...wrongOpts].sort(() => Math.random() - 0.5);
    setEliminatedOptions(shuffledWrong.slice(0, 2));
  };

  // Lifeline 2: Ask the audience (Class vote)
  const handleUseAudience = () => {
    if (usedAudience || isAnswerLocked || isAnswerRevealed) return;
    playLifelineSound();
    setUsedAudience(true);

    const correct = currentQ.correctAnswer;
    const stats: Record<string, number> = {};
    const remainingOpts = currentQ.options.filter((o) => !eliminatedOptions.includes(o));

    // Allocate higher percent to correct
    const correctPercent = Math.floor(Math.random() * 25) + 55; // 55% - 80%
    let remainingPercent = 100 - correctPercent;

    remainingOpts.forEach((opt) => {
      if (opt.trim().toLowerCase() === correct.trim().toLowerCase()) {
        stats[opt] = correctPercent;
      } else {
        stats[opt] = 0;
      }
    });

    const otherOpts = remainingOpts.filter((o) => o.trim().toLowerCase() !== correct.trim().toLowerCase());
    otherOpts.forEach((opt, idx) => {
      if (idx === otherOpts.length - 1) {
        stats[opt] = remainingPercent;
      } else {
        const share = Math.floor(Math.random() * (remainingPercent - 5));
        stats[opt] = share;
        remainingPercent -= share;
      }
    });

    setAudienceStats(stats);
  };

  // Lifeline 3: Call a friend / student in class
  const handleUseFriend = () => {
    if (usedFriend || isAnswerLocked || isAnswerRevealed) return;
    playLifelineSound();
    setUsedFriend(true);

    if (students && students.length > 0) {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      setChosenFriend(randomStudent.name);
    } else {
      setChosenFriend('Một bạn học sinh xung phong trong lớp');
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between select-none">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 text-xl border-2 border-amber-300">
            🔔
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight flex items-center gap-2">
              RUNG CHUÔNG VÀNG / AI LÀ TRIỆU PHÚ
            </h1>
            <p className="text-xs text-indigo-300 font-medium">
              Chiếu màn hình lớn • Giáo viên điều khiển • Cả lớp cùng tham gia
            </p>
          </div>
        </div>

        {/* Lifelines */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            disabled={used5050 || isAnswerLocked || isAnswerRevealed}
            onClick={handleUse5050}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black border-2 transition-all flex items-center gap-1.5 ${
              used5050
                ? 'bg-slate-800/60 border-slate-700 text-slate-500 line-through'
                : 'bg-amber-500 hover:bg-amber-400 border-amber-300 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
            }`}
            title="Quyền trợ giúp: Loại bỏ 2 phương án sai"
          >
            <HelpCircle className="w-4 h-4" /> 50 : 50
          </button>

          <button
            type="button"
            disabled={usedAudience || isAnswerLocked || isAnswerRevealed}
            onClick={handleUseAudience}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black border-2 transition-all flex items-center gap-1.5 ${
              usedAudience
                ? 'bg-slate-800/60 border-slate-700 text-slate-500 line-through'
                : 'bg-sky-500 hover:bg-sky-400 border-sky-300 text-slate-950 shadow-md shadow-sky-500/20 active:scale-95'
            }`}
            title="Hỏi ý kiến cả lớp (Biểu quyết)"
          >
            <Users className="w-4 h-4" /> Hỏi cả lớp
          </button>

          <button
            type="button"
            disabled={usedFriend || isAnswerLocked || isAnswerRevealed}
            onClick={handleUseFriend}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black border-2 transition-all flex items-center gap-1.5 ${
              usedFriend
                ? 'bg-slate-800/60 border-slate-700 text-slate-500 line-through'
                : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-300 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95'
            }`}
            title="Gọi một bạn trong lớp trợ giúp"
          >
            <UserCheck className="w-4 h-4" /> Gọi bạn trợ giúp
          </button>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
            >
              Thoát game
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 my-6 items-start">
        {/* Question & Options Column (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Lifeline Popups */}
          {audienceStats && (
            <div className="bg-sky-950/90 border-2 border-sky-400 rounded-3xl p-5 shadow-2xl animate-fade-in">
              <h4 className="text-sm font-bold text-sky-300 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" /> KẾT QUẢ BIỂU QUYẾT CỦA CẢ LỚP:
              </h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                {currentQ.options.map((opt, i) => (
                  <div key={opt} className="bg-sky-900/60 p-2.5 rounded-xl border border-sky-700">
                    <span className="text-xs font-bold text-sky-300 block">{optionLetters[i]}</span>
                    <div className="text-lg font-black text-white mt-1">
                      {audienceStats[opt] !== undefined ? `${audienceStats[opt]}%` : '0%'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chosenFriend && (
            <div className="bg-emerald-950/90 border-2 border-emerald-400 rounded-3xl p-5 shadow-2xl animate-fade-in flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl">
                  🙋
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-300 block uppercase">Học sinh được mời trợ giúp:</span>
                  <span className="text-xl sm:text-2xl font-black text-white">{chosenFriend}</span>
                </div>
              </div>
              <span className="text-xs text-emerald-300 bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-700">
                Mời bạn đứng dậy phát biểu đáp án!
              </span>
            </div>
          )}

          {/* Question Box */}
          <div className="relative bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950 border-4 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 text-center min-h-[160px] flex flex-col justify-center items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 text-xs font-black mb-3 uppercase tracking-wider">
              Câu số {currentIdx + 1} / {totalLevels} • Mức thưởng {ladderScores[currentIdx]} Điểm
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-relaxed">
              {currentQ.content}
            </h2>

            {/* Floating Timer Badge */}
            <div className="absolute -top-6 right-8">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl border-4 shadow-xl transition-all ${
                  secondsLeft <= 5
                    ? 'bg-rose-600 border-rose-300 text-white animate-bounce'
                    : 'bg-indigo-900 border-amber-400 text-amber-300'
                }`}
              >
                {secondsLeft}
              </div>
            </div>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => {
              const letter = optionLetters[idx];
              const isEliminated = eliminatedOptions.includes(opt);
              const isSelected = selectedOption === opt;
              const isCorrectAnswer =
                opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

              let cardStyles =
                'bg-slate-900/90 border-indigo-800 text-indigo-100 hover:border-amber-400 hover:bg-indigo-950/80';

              if (isEliminated) {
                cardStyles = 'opacity-20 pointer-events-none bg-slate-900 border-slate-800 text-slate-600';
              } else if (isAnswerRevealed) {
                if (isCorrectAnswer) {
                  cardStyles = 'bg-emerald-600 border-emerald-300 text-white shadow-xl shadow-emerald-500/30 animate-pulse';
                } else if (isSelected) {
                  cardStyles = 'bg-rose-600 border-rose-300 text-white';
                }
              } else if (isAnswerLocked && isSelected) {
                cardStyles = 'bg-amber-600 border-amber-300 text-white animate-pulse';
              } else if (isSelected) {
                cardStyles = 'bg-amber-500 border-amber-200 text-slate-950 shadow-lg shadow-amber-500/20';
              }

              return (
                <button
                  type="button"
                  key={opt}
                  disabled={isEliminated || isAnswerLocked || isAnswerRevealed}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 sm:border-3 text-left transition-all flex items-center gap-4 cursor-pointer active:scale-98 ${cardStyles}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 border ${
                      isSelected && !isAnswerRevealed
                        ? 'bg-slate-950 text-amber-300 border-amber-300'
                        : isAnswerRevealed && isCorrectAnswer
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

          {/* Explanation if revealed */}
          {isAnswerRevealed && currentQ.explanation && (
            <div className="bg-indigo-950/80 border border-indigo-700 rounded-2xl p-4 text-sm text-indigo-200">
              <strong className="text-amber-400 block mb-1">💡 Lời giải thích / Ghi nhớ:</strong>
              {currentQ.explanation}
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="px-3 py-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700 text-xs font-bold text-indigo-200 flex items-center gap-1.5"
              >
                {isTimerPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                {isTimerPaused ? 'Tiếp tục giờ' : 'Tạm dừng giờ'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {!isAnswerRevealed && !isGameOver && (
                <button
                  type="button"
                  disabled={!selectedOption || isAnswerLocked}
                  onClick={handleConfirmAnswer}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 border-2 border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  {isAnswerLocked ? 'ĐANG CHỐT ĐÁP ÁN...' : 'CHỐT ĐÁP ÁN NÀY'}
                </button>
              )}

              {isAnswerRevealed && !isGameOver && !isWon && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 border-2 border-emerald-300 cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  CÂU TIẾP THEO ➔
                </button>
              )}

              {(isGameOver || isWon) && (
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 border-2 border-amber-300 cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> CHƠI LẠI TỪ ĐẦU
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Score Ladder Sidebar (1 col) */}
        <div className="bg-slate-900/90 border-2 border-indigo-800 rounded-3xl p-4 shadow-xl space-y-1.5">
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider text-center border-b border-indigo-800 pb-2 mb-2 flex items-center justify-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> BẬC THANG ĐIỂM SỐ
          </h3>
          <div className="flex flex-col-reverse gap-1">
            {ladderScores.map((score, i) => {
              const isCurrent = i === currentIdx;
              const isPassed = i < currentIdx;
              const isMilestone = i === 4 || i === 9 || i === 14;

              let itemStyles = 'text-indigo-300 bg-transparent';
              if (isCurrent) {
                itemStyles = 'bg-amber-400 text-slate-950 font-black border-2 border-amber-200 shadow-md scale-102';
              } else if (isPassed) {
                itemStyles = 'text-emerald-400 bg-emerald-950/40 font-bold';
              } else if (isMilestone) {
                itemStyles = 'text-amber-300 font-extrabold bg-indigo-950/60';
              }

              return (
                <div
                  key={score}
                  className={`px-3 py-1.5 rounded-xl flex items-center justify-between text-xs transition-all ${itemStyles}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-right font-mono text-[11px] opacity-75">{i + 1}</span>
                    {isMilestone && <span>⭐</span>}
                  </span>
                  <span className="font-black">{score}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Win Banner Modal */}
      {isWon && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-amber-500 to-orange-600 p-8 sm:p-10 rounded-3xl text-center max-w-lg border-4 border-amber-200 shadow-2xl text-slate-950 space-y-4">
            <div className="text-6xl animate-bounce">🏆</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              XUẤT SẮC CHIẾN THẮNG!
            </h2>
            <p className="text-base font-bold text-amber-950">
              Lớp học đã cùng nhau vượt qua toàn bộ {totalLevels} câu hỏi của chương trình và nhận giải thưởng cao nhất!
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-3 rounded-2xl bg-slate-950 text-white font-black hover:bg-slate-900 border-2 border-amber-200"
              >
                Chơi lại lượt mới
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-black hover:bg-amber-100"
                >
                  Quay lại kho game
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
