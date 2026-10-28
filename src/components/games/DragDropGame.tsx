import React, { useState, useEffect, useRef } from 'react';
import { SAMPLE_DRAG_DROP_CATEGORIES } from './classroomGamesData';
import {
  playCorrectSound,
  playWrongSound,
  playFanfareSound,
  playTickSound,
  playStartSound,
} from '../../utils/audio';
import { triggerConfetti } from '../../utils/confetti';
import {
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause,
  Clock,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Item {
  id: string;
  text: string;
  categoryId: string;
}

interface DragDropGameProps {
  data?: {
    title: string;
    categories: Category[];
    items: Item[];
  };
  onExit?: () => void;
}

export const DragDropGame: React.FC<DragDropGameProps> = ({
  data = SAMPLE_DRAG_DROP_CATEGORIES,
  onExit,
}) => {
  const [unassignedItems, setUnassignedItems] = useState<Item[]>([]);
  const [categorizedItems, setCategorizedItems] = useState<Record<string, Item[]>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isWon, setIsWon] = useState(false);

  // Timer controls for classroom interaction
  const [timerDuration, setTimerDuration] = useState<number>(60); // 0 = unlimited
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(false);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isTimeOut, setIsTimeOut] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize
  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Shuffle unassigned items
    const shuffled = [...data.items].sort(() => Math.random() - 0.5);
    setUnassignedItems(shuffled);

    const emptyCats: Record<string, Item[]> = {};
    data.categories.forEach((c) => {
      emptyCats[c.id] = [];
    });
    setCategorizedItems(emptyCats);
    setSelectedItemId(null);
    setIsChecked(false);
    setIsWon(false);
    setIsTimerStarted(false);
    setIsTimerPaused(false);
    setIsTimeOut(false);
    setSecondsLeft(timerDuration);
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

  // Timer tick effect
  useEffect(() => {
    if (!isTimerStarted || isTimerPaused || isWon || isTimeOut || timerDuration === 0) {
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
  }, [isTimerStarted, isTimerPaused, isWon, isTimeOut, timerDuration]);

  useEffect(() => {
    resetGame();
  }, [data]);

  // Handle click to select item
  const handleSelectItem = (id: string) => {
    if (isChecked) return;
    playTickSound();
    setSelectedItemId(selectedItemId === id ? null : id);
  };

  // Place selected item into category
  const handlePlaceIntoCategory = (catId: string) => {
    if (!selectedItemId || isChecked) return;

    // Find the item either in unassigned or another category
    let foundItem: Item | undefined = unassignedItems.find((i) => i.id === selectedItemId);
    let fromUnassigned = true;

    if (!foundItem) {
      fromUnassigned = false;
      for (const cid of Object.keys(categorizedItems)) {
        foundItem = categorizedItems[cid].find((i) => i.id === selectedItemId);
        if (foundItem) break;
      }
    }

    if (!foundItem) return;

    playTickSound();

    // Remove from previous location
    if (fromUnassigned) {
      setUnassignedItems((prev) => prev.filter((i) => i.id !== selectedItemId));
    } else {
      setCategorizedItems((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((cid) => {
          next[cid] = next[cid].filter((i) => i.id !== selectedItemId);
        });
        return next;
      });
    }

    // Add to target category
    setCategorizedItems((prev) => ({
      ...prev,
      [catId]: [...prev[catId], foundItem!],
    }));

    setSelectedItemId(null);
  };

  // Move item back to unassigned
  const handleMoveBackToUnassigned = (item: Item) => {
    if (isChecked) return;
    playTickSound();

    setCategorizedItems((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((cid) => {
        next[cid] = next[cid].filter((i) => i.id !== item.id);
      });
      return next;
    });

    setUnassignedItems((prev) => [...prev, item]);
  };

  // Check answers
  const handleCheck = () => {
    setIsChecked(true);
    setIsTimerPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Verify all items are in correct category
    let totalCorrect = 0;
    Object.keys(categorizedItems).forEach((catId) => {
      const itemsInCat = categorizedItems[catId];
      itemsInCat.forEach((item) => {
        if (item.categoryId === catId) totalCorrect++;
      });
    });

    const isAllCorrect = totalCorrect === data.items.length && unassignedItems.length === 0;

    if (isAllCorrect) {
      setIsWon(true);
      playCorrectSound();
      playFanfareSound();
      triggerConfetti(3500);
    } else {
      playWrongSound();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-blue-500/30 text-xl border-2 border-blue-300">
            🧩
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-blue-300 tracking-tight flex items-center gap-2">
              GHÉP NỐI & PHÂN LOẠI (DRAG & DROP)
            </h1>
            <p className="text-xs text-blue-400 font-medium">
              {data.title} • Chọn thẻ nội dung và đưa vào nhóm tương ứng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetGame}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs border border-amber-300 shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Làm lại từ đầu
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

      {/* Main Play Area */}
      <div className="my-6 space-y-4 max-w-6xl mx-auto w-full">
        {/* Teacher Timer Control Bar */}
        <div className="bg-slate-900/90 border-2 border-indigo-700/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Clock className="w-4 h-4 text-amber-400" /> THỜI GIAN LÀM BÀI:
            </span>

            {/* Countdown Badge */}
            {timerDuration > 0 && (
              <span
                className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black border transition-all ${
                  !isTimerStarted
                    ? 'bg-slate-800 text-amber-300 border-amber-400/40'
                    : secondsLeft <= 5
                    ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
                    : isTimerPaused
                    ? 'bg-amber-600 text-white border-amber-300'
                    : 'bg-emerald-600 text-white border-emerald-300'
                }`}
              >
                ⏱ {secondsLeft}s {isTimerPaused ? '(Tạm dừng)' : !isTimerStarted ? '(Chờ bấm bắt đầu)' : ''}
              </span>
            )}

            {!isTimerStarted ? (
              <button
                type="button"
                onClick={handleStartTimer}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/30 border-2 border-amber-200 cursor-pointer active:scale-95 flex items-center gap-1.5 animate-pulse ml-1"
              >
                <Play className="w-4 h-4 fill-slate-950" /> BẮT ĐẦU TÍNH GIỜ
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs border-2 flex items-center gap-1.5 transition-all ml-1 ${
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
            )}

            {/* Quick Adjust Buttons */}
            {isTimerStarted && timerDuration > 0 && (
              <div className="flex items-center gap-1 ml-1">
                <button
                  type="button"
                  onClick={() => handleAdjustSeconds(-15)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-0.5"
                  title="Bớt 15 giây"
                >
                  <Minus className="w-3 h-3" />15s
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustSeconds(15)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-0.5"
                  title="Thêm 15 giây"
                >
                  <Plus className="w-3 h-3" />15s
                </button>
              </div>
            )}
          </div>

          {/* Preset Buttons for Teacher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">Thời lượng:</span>
            {[
              { label: '30s', sec: 30 },
              { label: '60s', sec: 60 },
              { label: '90s', sec: 90 },
              { label: '120s', sec: 120 },
              { label: '∞', sec: 0 },
            ].map((preset) => (
              <button
                type="button"
                key={preset.sec}
                onClick={() => handleChangeDuration(preset.sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                  timerDuration === preset.sec
                    ? 'bg-blue-600 text-white border-blue-300 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time out warning banner */}
        {isTimeOut && (
          <div className="p-3 rounded-2xl bg-rose-600/90 border border-rose-300 text-white text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-fade-in shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>⏰ Hết thời gian phân loại! Thầy cô có thể cho thêm thời gian hoặc bấm "Kiểm tra đáp án" bên dưới.</span>
            </div>
            <button
              type="button"
              onClick={() => handleAdjustSeconds(30)}
              className="px-3 py-1.5 bg-white text-slate-950 rounded-xl font-black text-xs hover:bg-amber-200 shrink-0"
            >
              +30 giây nữa
            </button>
          </div>
        )}

        {/* Unassigned Items Pool */}
        <div className="bg-slate-900/80 border-2 border-indigo-700/80 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>🏷️</span> CÁC THẺ CẦN PHÂN LOẠI ({unassignedItems.length} thẻ còn lại):
            </span>
            <span className="text-xs text-slate-400">
              {selectedItemId ? '👉 Bấm vào nhóm bên dưới để xếp thẻ vào nhóm đó' : 'Bấm vào thẻ để chọn'}
            </span>
          </div>

          {unassignedItems.length === 0 ? (
            <div className="text-center py-4 text-emerald-400 font-bold text-sm">
              ✓ Toàn bộ thẻ đã được đưa vào các nhóm! Bấm "Kiểm tra kết quả" bên dưới.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {unassignedItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    disabled={isChecked}
                    onClick={() => handleSelectItem(item.id)}
                    className={`px-4 py-2.5 rounded-2xl font-black text-sm border-2 transition-all cursor-pointer active:scale-95 flex items-center gap-2 shadow-md ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-200 scale-105 shadow-amber-400/40 ring-4 ring-amber-400/30'
                        : 'bg-indigo-900/70 hover:bg-indigo-800 text-indigo-100 border-indigo-600 hover:border-amber-400'
                    }`}
                  >
                    <span>{item.text}</span>
                    {isSelected && <ArrowRight className="w-4 h-4 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Categories Columns */}
        <div className={`grid grid-cols-1 md:grid-cols-${data.categories.length} gap-4`}>
          {data.categories.map((cat) => {
            const itemsInCat = categorizedItems[cat.id] || [];

            return (
              <div
                key={cat.id}
                onClick={() => selectedItemId && handlePlaceIntoCategory(cat.id)}
                className={`rounded-3xl border-3 p-5 transition-all flex flex-col justify-between min-h-[260px] ${
                  selectedItemId
                    ? 'border-dashed border-amber-400 bg-indigo-950/40 hover:bg-indigo-900/50 cursor-pointer shadow-lg shadow-amber-400/10'
                    : 'border-slate-800 bg-slate-900/90'
                }`}
              >
                <div>
                  {/* Category Title */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <h3 className="font-black text-base sm:text-lg text-white">
                      {cat.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                      {itemsInCat.length} thẻ
                    </span>
                  </div>

                  {/* Items inside this Category */}
                  <div className="space-y-2 min-h-[120px]">
                    {itemsInCat.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500 py-8 italic text-center">
                        {selectedItemId ? '👉 Bấm vào đây để đặt thẻ vào nhóm này' : 'Chưa có thẻ nào trong nhóm này'}
                      </div>
                    ) : (
                      itemsInCat.map((item) => {
                        const isCorrect = item.categoryId === cat.id;
                        let itemStyles = 'bg-indigo-900/60 border-indigo-700 text-white';

                        if (isChecked) {
                          if (isCorrect) {
                            itemStyles = 'bg-emerald-900/80 border-emerald-400 text-emerald-200';
                          } else {
                            itemStyles = 'bg-rose-900/80 border-rose-400 text-rose-200 animate-shake';
                          }
                        }

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-2xl border-2 flex items-center justify-between font-bold text-sm shadow-sm transition-all ${itemStyles}`}
                          >
                            <span>{item.text}</span>
                            {!isChecked && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveBackToUnassigned(item);
                                }}
                                className="text-xs text-slate-400 hover:text-rose-400 p-1"
                                title="Chuyển lại về hàng chờ"
                              >
                                ✕
                              </button>
                            )}
                            {isChecked && (
                              <span className="text-xs font-black">
                                {isCorrect ? '✓ Đúng' : '✗ Sai'}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Drop hint when selected */}
                {selectedItemId && (
                  <div className="mt-3 pt-3 border-t border-amber-400/40 text-center text-xs font-black text-amber-300 animate-pulse">
                    + Bấm vào đây để xếp thẻ vào nhóm này
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Check & Result Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-indigo-800/60">
          <span className="text-xs text-indigo-300 font-medium">
            💡 Thầy cô có thể gọi học sinh lên bảng bấm chọn hoặc để cả lớp cùng giơ tay chỉ định nhóm.
          </span>

          <div className="flex items-center gap-3">
            {!isChecked ? (
              <button
                type="button"
                onClick={handleCheck}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 border-2 border-emerald-300 cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> KIỂM TRA ĐÁP ÁN
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsChecked(false)}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm border border-indigo-400 cursor-pointer active:scale-95"
              >
                Chỉnh sửa lại các câu sai
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-blue-600 to-indigo-800 p-8 sm:p-10 rounded-3xl text-center max-w-lg border-4 border-blue-300 shadow-2xl text-white space-y-4">
            <div className="text-6xl animate-bounce">🌟</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              CHÍNH XÁC 100%!
            </h2>
            <p className="text-base font-medium text-blue-100">
              Cả lớp đã phân loại chính xác toàn bộ các thẻ vào đúng các nhóm chủ đề!
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="px-6 py-3 rounded-2xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 border-2 border-amber-200"
              >
                Chơi lại lượt mới
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
