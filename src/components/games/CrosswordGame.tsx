import React, { useState, useEffect, useRef } from 'react';
import { SAMPLE_CROSSWORD_DATA } from './classroomGamesData';
import {
  playCorrectSound,
  playWrongSound,
  playFanfareSound,
  playTickSound,
  playStartSound,
} from '../../utils/audio';
import { triggerConfetti } from '../../utils/confetti';
import { RotateCcw, Eye, Key, Play, Pause, Clock, Plus, Minus, AlertCircle } from 'lucide-react';

interface CrosswordClue {
  row: number;
  word: string; // e.g. "TOAN"
  clue: string;
  keyIndex: number; // index of the letter that belongs to secret word
}

interface CrosswordGameProps {
  data?: {
    title: string;
    secretWord: string;
    clues: CrosswordClue[];
  };
  onExit?: () => void;
}

export const CrosswordGame: React.FC<CrosswordGameProps> = ({
  data = SAMPLE_CROSSWORD_DATA,
  onExit,
}) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  // Store which letters are revealed in each row: e.g. revealedLetters[rowIndex] = Set of char indices
  const [revealedCells, setRevealedCells] = useState<Record<number, boolean[]>>(() => {
    const init: Record<number, boolean[]> = {};
    data.clues.forEach((c, idx) => {
      init[idx] = new Array(c.word.replace(/\s+/g, '').length).fill(false);
    });
    return init;
  });

  const [isSecretWordRevealed, setIsSecretWordRevealed] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);

  // Timer controls for classroom interaction
  const [timerDuration, setTimerDuration] = useState<number>(30); // 0 = unlimited
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(false);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isTimeOut, setIsTimeOut] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const init: Record<number, boolean[]> = {};
    data.clues.forEach((c, idx) => {
      init[idx] = new Array(c.word.replace(/\s+/g, '').length).fill(false);
    });
    setRevealedCells(init);
    setSelectedRow(null);
    setIsSecretWordRevealed(false);
    setIsWon(false);
    setGuessInput('');
    setIsGuessModalOpen(false);
    setIsTimerStarted(false);
    setIsTimerPaused(false);
    setIsTimeOut(false);
    setSecondsLeft(timerDuration);
  };

  const handleSelectRow = (idx: number) => {
    setSelectedRow(idx);
    setIsTimerStarted(false);
    setIsTimerPaused(false);
    setIsTimeOut(false);
    setSecondsLeft(timerDuration);
    playTickSound();
  };

  const handleStartTimer = () => {
    playStartSound();
    setIsTimerStarted(true);
    setIsTimerPaused(false);
    setIsTimeOut(false);
  };

  const handleChangeDuration = (sec: number) => {
    setTimerDuration(sec);
    setSecondsLeft(sec);
    setIsTimerStarted(false);
    setIsTimerPaused(false);
    setIsTimeOut(false);
  };

  const handleAdjustSeconds = (amount: number) => {
    setSecondsLeft((prev) => Math.max(1, prev + amount));
    setIsTimeOut(false);
  };

  useEffect(() => {
    if (
      !isTimerStarted ||
      isTimerPaused ||
      isWon ||
      isTimeOut ||
      timerDuration === 0 ||
      selectedRow === null
    ) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsTimeOut(true);
          playWrongSound();
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
  }, [selectedRow, isTimerStarted, isTimerPaused, isWon, isTimeOut, timerDuration]);

  // Reveal a single cell
  const handleRevealCell = (rowIdx: number, charIdx: number) => {
    playTickSound();
    setRevealedCells((prev) => {
      const rowArr = [...(prev[rowIdx] || [])];
      rowArr[charIdx] = true;
      return { ...prev, [rowIdx]: rowArr };
    });
  };

  // Reveal entire row
  const handleRevealRow = (rowIdx: number) => {
    playCorrectSound();
    setRevealedCells((prev) => {
      const rowLen = data.clues[rowIdx].word.replace(/\s+/g, '').length;
      return { ...prev, [rowIdx]: new Array(rowLen).fill(true) };
    });

    // Check if all rows are now revealed
    setTimeout(checkFullCompletion, 300);
  };

  const checkFullCompletion = () => {
    let allDone = true;
    data.clues.forEach((c, idx) => {
      const len = c.word.replace(/\s+/g, '').length;
      const cells = revealedCells[idx] || [];
      const count = cells.filter(Boolean).length;
      if (count < len) allDone = false;
    });

    if (allDone) {
      setIsSecretWordRevealed(true);
      setIsWon(true);
      playFanfareSound();
      triggerConfetti(4000);
    }
  };

  // Guess Secret Word
  const handleCheckSecretWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanGuess = guessInput.trim().toUpperCase().replace(/\s+/g, '');
    const cleanTarget = data.secretWord.trim().toUpperCase().replace(/\s+/g, '');

    if (cleanGuess === cleanTarget) {
      // Correct secret word! Reveal all
      playCorrectSound();
      playFanfareSound();
      triggerConfetti(4500);
      setIsSecretWordRevealed(true);
      setIsWon(true);
      setIsGuessModalOpen(false);

      // Open all cells
      const full: Record<number, boolean[]> = {};
      data.clues.forEach((c, idx) => {
        full[idx] = new Array(c.word.replace(/\s+/g, '').length).fill(true);
      });
      setRevealedCells(full);
    } else {
      playWrongSound();
      alert('Chưa chính xác! Thầy cô và cả lớp hãy tiếp tục mở thêm các hàng ngang nhé!');
    }
  };

  const currentClue = selectedRow !== null ? data.clues[selectedRow] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between select-none">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-purple-500/30 text-xl border-2 border-purple-300">
            🔠
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-purple-300 tracking-tight flex items-center gap-2">
              ĐỐ CHỮ / Ô CHỮ TƯƠNG TÁC (CROSSWORD)
            </h1>
            <p className="text-xs text-purple-300 font-medium">
              {data.title} • Giải các hàng ngang để tìm ra Từ Khóa Vàng bí mật!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsGuessModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-amber-200 shadow-lg shadow-amber-400/20 active:scale-95 flex items-center gap-2"
          >
            <Key className="w-4 h-4" /> ĐOÁN TỪ KHÓA VÀNG
          </button>

          <button
            type="button"
            onClick={resetGame}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Đặt lại
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

      {/* Clue Prompt Display (Top spotlight) */}
      <div className="my-5 max-w-5xl mx-auto w-full space-y-3">
        {currentClue ? (
          <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-950 border-3 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl relative animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1 justify-center md:justify-start">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase border border-amber-400/40 inline-block">
                    Gợi ý Hàng ngang số {currentClue.row} ({currentClue.word.replace(/\s+/g, '').length} chữ cái)
                  </span>
                  {timerDuration > 0 && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border ${
                        !isTimerStarted
                          ? 'bg-slate-800 text-amber-300 border-amber-400/40'
                          : secondsLeft <= 5
                          ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
                          : isTimerPaused
                          ? 'bg-amber-600 text-white border-amber-300'
                          : 'bg-emerald-600 text-white border-emerald-300'
                      }`}
                    >
                      ⏱ {secondsLeft}s {isTimerPaused ? '(Tạm dừng)' : !isTimerStarted ? '(Chưa bấm bắt đầu)' : ''}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                  {currentClue.clue}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRevealRow(selectedRow!)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm border border-emerald-300 shadow-md flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> Mở toàn bộ hàng
                </button>
              </div>
            </div>

            {/* Time out warning banner */}
            {isTimeOut && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-600/90 border border-rose-300 text-white text-xs font-bold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>⏰ Hết thời gian suy nghĩ! Mời thầy cô gọi học sinh trả lời hoặc bấm "+10s" để thêm thời gian.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAdjustSeconds(10)}
                  className="px-2 py-1 bg-white text-slate-950 rounded-lg font-black text-xs hover:bg-amber-200"
                >
                  +10 giây nữa
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900/80 border-2 border-dashed border-purple-800/80 rounded-3xl p-6 text-center text-purple-300 text-sm font-medium">
            👉 Bấm vào bất kỳ hàng ngang nào bên dưới để hiển thị câu hỏi gợi ý cho cả lớp cùng giải!
          </div>
        )}

        {/* Teacher Timer Control Bar */}
        <div className="bg-slate-900/90 border-2 border-purple-800/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Clock className="w-4 h-4 text-amber-400" /> THỜI GIAN NGHĨ:
            </span>

            {selectedRow !== null ? (
              !isTimerStarted ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/30 border-2 border-amber-200 cursor-pointer active:scale-95 flex items-center gap-1.5 animate-pulse"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" /> BẮT ĐẦU TÍNH GIỜ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs border-2 flex items-center gap-1.5 transition-all ${
                    isTimerPaused
                      ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-300 text-slate-950'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400 text-amber-300'
                  }`}
                >
                  {isTimerPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5" /> TIẾP TỤC
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" /> TẠM DỪNG
                    </>
                  )}
                </button>
              )
            ) : (
              <span className="text-xs text-purple-300 italic">
                (Chọn một hàng ngang để bắt đầu tính giờ)
              </span>
            )}

            {/* Quick Adjust Buttons */}
            {selectedRow !== null && isTimerStarted && timerDuration > 0 && (
              <div className="flex items-center gap-1 ml-1">
                <button
                  type="button"
                  onClick={() => handleAdjustSeconds(-5)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-0.5"
                  title="Bớt 5 giây"
                >
                  <Minus className="w-3 h-3" />5s
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustSeconds(10)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-0.5"
                  title="Thêm 10 giây"
                >
                  <Plus className="w-3 h-3" />10s
                </button>
              </div>
            )}
          </div>

          {/* Preset Buttons for Teacher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">Mức thời gian:</span>
            {[
              { label: '15s', sec: 15 },
              { label: '30s', sec: 30 },
              { label: '45s', sec: 45 },
              { label: '60s', sec: 60 },
              { label: '∞', sec: 0 },
            ].map((preset) => (
              <button
                type="button"
                key={preset.sec}
                onClick={() => handleChangeDuration(preset.sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                  timerDuration === preset.sec
                    ? 'bg-purple-600 text-white border-purple-300 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crossword Grid Area */}
      <div className="my-4 max-w-4xl mx-auto w-full space-y-3">
        {data.clues.map((clueItem, rIdx) => {
          const cleanWord = clueItem.word.replace(/\s+/g, '').toUpperCase();
          const letters = cleanWord.split('');
          const isRowSelected = selectedRow === rIdx;
          const rowRevealed = revealedCells[rIdx] || [];

          return (
            <div
              key={clueItem.row}
              onClick={() => handleSelectRow(rIdx)}
              className={`p-3 sm:p-4 rounded-3xl border-2 transition-all flex flex-wrap items-center justify-between gap-3 cursor-pointer ${
                isRowSelected
                  ? 'bg-purple-900/60 border-amber-400 shadow-lg shadow-purple-900/50 scale-101'
                  : 'bg-slate-900/80 border-purple-900/60 hover:border-purple-600 hover:bg-slate-900'
              }`}
            >
              {/* Row Label */}
              <div className="flex items-center gap-2 w-28 shrink-0">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border ${
                    isRowSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-purple-950 text-purple-300 border-purple-800'
                  }`}
                >
                  {clueItem.row}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  Hàng {clueItem.row}
                </span>
              </div>

              {/* Letter Cells */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 justify-center">
                {letters.map((char, cIdx) => {
                  const isRevealed = rowRevealed[cIdx] || isSecretWordRevealed;
                  const isKeyCell = cIdx === clueItem.keyIndex;

                  let cellStyles = 'bg-slate-950 border-purple-800 text-slate-600';

                  if (isRevealed) {
                    if (isKeyCell) {
                      cellStyles =
                        'bg-amber-400 border-amber-200 text-slate-950 font-black shadow-lg shadow-amber-400/40 ring-2 ring-amber-300 animate-pulse';
                    } else {
                      cellStyles = 'bg-emerald-600 border-emerald-300 text-white font-black shadow-md';
                    }
                  } else if (isKeyCell) {
                    cellStyles =
                      'bg-amber-950/40 border-dashed border-amber-400 text-amber-400 font-bold';
                  }

                  return (
                    <button
                      type="button"
                      key={cIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevealCell(rIdx, cIdx);
                      }}
                      className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center text-base sm:text-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${cellStyles}`}
                      title={isKeyCell ? 'Ô thuộc từ khóa vàng hàng dọc!' : 'Bấm để lật mở chữ này'}
                    >
                      {isRevealed ? char : isKeyCell ? '★' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Status / Quick Action */}
              <div className="w-24 text-right shrink-0">
                <span className="text-[11px] font-bold text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-800">
                  {letters.length} chữ
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secret Word Revealed Banner */}
      {isSecretWordRevealed && (
        <div className="my-4 max-w-3xl mx-auto w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 p-6 rounded-3xl border-4 border-amber-200 shadow-2xl text-center space-y-2 animate-bounce">
          <span className="text-xs font-black uppercase tracking-widest text-amber-950">
            ⭐ TỪ KHÓA VÀNG BÍ MẬT ĐÃ ĐƯỢC MỞ:
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-wider text-slate-950 drop-shadow-sm">
            {data.secretWord}
          </h2>
        </div>
      )}

      {/* Guess Secret Word Modal */}
      {isGuessModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-4 border-amber-400 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl">
                🔑
              </div>
              <div>
                <h3 className="text-lg font-black text-white">ĐOÁN TỪ KHÓA VÀNG</h3>
                <p className="text-xs text-slate-400">Nhập từ khóa chủ điểm của toàn bài học</p>
              </div>
            </div>

            <form onSubmit={handleCheckSecretWord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Từ khóa gồm {data.secretWord.replace(/\s+/g, '').length} chữ cái:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder="Ví dụ: TRI AN..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border-2 border-indigo-700 text-amber-300 font-black text-xl tracking-wider text-center uppercase focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsGuessModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border border-amber-200 shadow-md"
                >
                  XÁC NHẬN ĐOÁN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Win Banner */}
      {isWon && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-purple-600 via-indigo-700 to-amber-500 p-8 sm:p-10 rounded-3xl text-center max-w-lg border-4 border-amber-300 shadow-2xl text-white space-y-4">
            <div className="text-6xl animate-bounce">🏆</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              GIẢI MÃ Ô CHỮ THÀNH CÔNG!
            </h2>
            <p className="text-base font-bold text-purple-100">
              Cả lớp đã xuất sắc tìm ra Từ Khóa Vàng: <strong className="text-amber-200 underline">{data.secretWord}</strong>!
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={resetGame}
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
