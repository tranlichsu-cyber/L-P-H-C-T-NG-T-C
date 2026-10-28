import React, { useState, useEffect } from 'react';
import { SAMPLE_MEMORY_PAIRS } from './classroomGamesData';
import { playCorrectSound, playWrongSound, playFanfareSound, playTickSound, playStartSound } from '../../utils/audio';
import { triggerConfetti } from '../../utils/confetti';
import { RotateCcw, Trophy, Clock, Zap, Play, Pause, Plus, Minus } from 'lucide-react';

interface CardItem {
  uid: string;
  pairId: string;
  text: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  customPairs?: Array<{ id: string; front: string; back: string }>;
  onExit?: () => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  customPairs,
  onExit,
}) => {
  const sourcePairs = customPairs && customPairs.length >= 4 ? customPairs.slice(0, 8) : SAMPLE_MEMORY_PAIRS;

  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isTimeOut, setIsTimeOut] = useState(false);

  // Timer settings
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [timeMode, setTimeMode] = useState<'COUNTUP' | 'COUNTDOWN'>('COUNTUP');
  const [countdownDuration, setCountdownDuration] = useState(60);
  const [seconds, setSeconds] = useState(0);

  // Initialize and shuffle cards
  const initCards = () => {
    const rawCards: CardItem[] = [];
    sourcePairs.forEach((p) => {
      rawCards.push({
        uid: `${p.id}-front`,
        pairId: p.id,
        text: p.front,
        isFlipped: false,
        isMatched: false,
      });
      rawCards.push({
        uid: `${p.id}-back`,
        pairId: p.id,
        text: p.back,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Fisher-Yates shuffle
    const shuffled = [...rawCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedUids([]);
    setMoves(0);
    setMatchesCount(0);
    setIsLocked(false);
    setIsWon(false);
    setIsTimeOut(false);
    setIsGameStarted(false);
    setIsTimerPaused(false);
    setSeconds(timeMode === 'COUNTDOWN' ? countdownDuration : 0);
  };

  useEffect(() => {
    initCards();
  }, [customPairs]);

  // Start game & timer
  const handleStartGame = () => {
    playStartSound();
    setIsGameStarted(true);
    setIsTimerPaused(false);
  };

  const handleSetTimeMode = (mode: 'COUNTUP' | 'COUNTDOWN', dur: number = 60) => {
    setTimeMode(mode);
    setCountdownDuration(dur);
    setSeconds(mode === 'COUNTDOWN' ? dur : 0);
    setIsGameStarted(false);
    setIsTimerPaused(false);
    setIsTimeOut(false);
  };

  const handleAdjustSeconds = (amount: number) => {
    setSeconds((prev) => Math.max(1, prev + amount));
  };

  // Timer effect
  useEffect(() => {
    if (!isGameStarted || isTimerPaused || isWon || isTimeOut) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (timeMode === 'COUNTDOWN') {
          if (prev <= 1) {
            clearInterval(interval);
            playWrongSound();
            setIsTimeOut(true);
            return 0;
          }
          if (prev <= 6) {
            playTickSound();
          }
          return prev - 1;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameStarted, isTimerPaused, isWon, isTimeOut, timeMode]);

  const handleCardClick = (uid: string) => {
    if (!isGameStarted || isLocked || isWon || isTimeOut) return;

    const clickedCard = cards.find((c) => c.uid === uid);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    playTickSound();

    const newCards = cards.map((c) => (c.uid === uid ? { ...c, isFlipped: true } : c));
    const nextFlipped = [...flippedUids, uid];

    setCards(newCards);
    setFlippedUids(nextFlipped);

    // If 2 cards are flipped
    if (nextFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsLocked(true);

      const [firstUid, secondUid] = nextFlipped;
      const firstCard = newCards.find((c) => c.uid === firstUid);
      const secondCard = newCards.find((c) => c.uid === secondUid);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Matched!
        setTimeout(() => {
          playCorrectSound();
          setCards((prev) =>
            prev.map((c) =>
              c.uid === firstUid || c.uid === secondUid
                ? { ...c, isMatched: true }
                : c
            )
          );
          setFlippedUids([]);
          setIsLocked(false);
          setMatchesCount((prev) => {
            const nextCount = prev + 1;
            if (nextCount === sourcePairs.length) {
              setIsWon(true);
              playFanfareSound();
              triggerConfetti(3500);
            }
            return nextCount;
          });
        }, 500);
      } else {
        // Mismatch - flip back
        setTimeout(() => {
          playWrongSound();
          setCards((prev) =>
            prev.map((c) =>
              c.uid === firstUid || c.uid === secondUid
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedUids([]);
          setIsLocked(false);
        }, 1200);
      }
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30 text-xl border-2 border-emerald-300">
            🃏
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-300 tracking-tight flex items-center gap-2">
              LẬT THẺ TÌM CẶP (MEMORY MATCH)
            </h1>
            <p className="text-xs text-emerald-400 font-medium">
              Tìm các cặp thông tin tương ứng • Rèn luyện trí nhớ và phản xạ
            </p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700 text-xs font-bold text-emerald-200">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Đã tìm: <strong className="text-white text-sm">{matchesCount} / {sourcePairs.length}</strong> cặp</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700 text-xs font-bold text-emerald-200">
            <Zap className="w-4 h-4 text-sky-400" />
            <span>Số lượt lật: <strong className="text-white text-sm">{moves}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700 text-xs font-bold text-emerald-200">
            <Clock className="w-4 h-4 text-rose-400" />
            <span>Thời gian: <strong className="text-white text-sm">{formatTime(seconds)}</strong></span>
          </div>

          <button
            type="button"
            onClick={initCards}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs border border-amber-300 shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Trộn lại
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

      {/* Teacher Timer Control Bar (Start & Adjust) */}
      <div className="bg-slate-900/90 border-2 border-emerald-700/80 rounded-2xl p-3.5 my-4 max-w-5xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Clock className="w-4 h-4 text-emerald-400" /> THỜI GIAN:
          </span>

          {!isGameStarted ? (
            <button
              type="button"
              onClick={handleStartGame}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-400/30 border-2 border-emerald-200 cursor-pointer active:scale-95 flex items-center gap-1.5 animate-pulse"
            >
              <Play className="w-4 h-4 fill-slate-950" /> BẮT ĐẦU CHƠI
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs border-2 flex items-center gap-1.5 transition-all ${
                isTimerPaused
                  ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-300 text-slate-950'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400 text-emerald-300'
              }`}
            >
              {isTimerPaused ? <Play className="w-4 h-4 fill-slate-950" /> : <Pause className="w-4 h-4" />}
              {isTimerPaused ? 'TIẾP TỤC GIỜ' : 'TẠM DỪNG'}
            </button>
          )}

          {/* Quick +/- buttons */}
          {timeMode === 'COUNTDOWN' && (
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={() => handleAdjustSeconds(-15)}
                className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-800 border border-emerald-700 text-[11px] font-bold text-emerald-300 flex items-center"
                title="Giảm 15 giây"
              >
                <Minus className="w-3 h-3 mr-0.5" /> 15s
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSeconds(15)}
                className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-800 border border-emerald-700 text-[11px] font-bold text-amber-300 flex items-center"
                title="Cộng thêm 15 giây"
              >
                <Plus className="w-3 h-3 mr-0.5" /> 15s
              </button>
            </div>
          )}
        </div>

        {/* Mode & presets duration selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Chế độ:</span>
          <button
            type="button"
            onClick={() => handleSetTimeMode('COUNTUP')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
              timeMode === 'COUNTUP'
                ? 'bg-emerald-400 text-slate-950 border border-emerald-200 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            ⏱ Tự do
          </button>
          {[30, 60, 90, 120].map((sec) => (
            <button
              type="button"
              key={sec}
              onClick={() => handleSetTimeMode('COUNTDOWN', sec)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                timeMode === 'COUNTDOWN' && countdownDuration === sec
                  ? 'bg-amber-400 text-slate-950 border border-amber-200 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              ⏳ {sec}s
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="my-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, idx) => {
            const isShown = card.isFlipped || card.isMatched;

            return (
              <button
                type="button"
                key={card.uid}
                disabled={card.isMatched || isLocked}
                onClick={() => handleCardClick(card.uid)}
                className={`aspect-[4/3] sm:aspect-square rounded-2xl p-4 transition-all duration-300 transform perspective-1000 border-3 cursor-pointer flex flex-col items-center justify-center text-center shadow-lg relative ${
                  card.isMatched
                    ? 'bg-emerald-600/90 border-emerald-300 text-white shadow-emerald-500/30 scale-95 opacity-80'
                    : isShown
                    ? 'bg-gradient-to-br from-amber-400 to-orange-400 border-amber-200 text-slate-950 font-black shadow-xl scale-102'
                    : 'bg-gradient-to-br from-slate-800 to-indigo-950 border-indigo-700 hover:border-emerald-400 hover:bg-slate-800 text-indigo-300 hover:scale-102'
                }`}
              >
                {isShown ? (
                  <div className="animate-fade-in flex flex-col items-center justify-center p-2">
                    <span className="text-base sm:text-lg font-black leading-snug">
                      {card.text}
                    </span>
                    {card.isMatched && (
                      <span className="text-xs text-emerald-200 mt-2 font-bold flex items-center gap-1">
                        ✓ Đã khớp
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <span className="text-3xl sm:text-4xl opacity-50">❓</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Ô số {idx + 1}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-emerald-500 to-teal-700 p-8 sm:p-10 rounded-3xl text-center max-w-lg border-4 border-emerald-200 shadow-2xl text-white space-y-4">
            <div className="text-6xl animate-bounce">🎉</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              HOÀN THÀNH XUẤT SẮC!
            </h2>
            <p className="text-base font-medium text-emerald-100">
              Lớp học đã tìm thấy toàn bộ <strong>{sourcePairs.length}</strong> cặp thẻ trong <strong>{moves}</strong> lượt lật và <strong>{formatTime(seconds)}</strong>!
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={initCards}
                className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-black hover:bg-emerald-50 border-2 border-emerald-300"
              >
                Chơi lại ván mới
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
    </div>
  );
};
