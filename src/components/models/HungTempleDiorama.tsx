import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Award,
  CheckCircle2,
  Landmark,
  Flame,
  Info,
  RotateCcw,
  ExternalLink,
  Eye,
} from 'lucide-react';
import {
  hungTempleData,
} from '../../data/models/hungTempleData';
import { triggerConfetti } from '../../utils/confetti';
import { playCorrectSound } from '../../utils/audio';
import { unlockBadge } from '../../utils/modelBadges';

type ActiveTab = '3D_VIEW' | 'FESTIVAL' | 'QUIZ';

export const HungTempleDiorama: React.FC = () => {
  // The WebGL diorama is the primary experience.
  const [activeTab, setActiveTab] = useState<ActiveTab>('3D_VIEW');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Quiz evaluation
  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleGradeQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    hungTempleData.quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    if (correctCount >= 3) {
      playCorrectSound();
      triggerConfetti(3500);
      unlockBadge('badge-hung-temple');
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <div
      ref={containerRef}
      className={`hung-temple-diorama-root bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'min-h-[720px]'
      }`}
    >
      {/* Top Diorama Header */}
      <header className="bg-slate-950/95 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center text-white shadow-md shadow-amber-600/30">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {hungTempleData.subject} {hungTempleData.grade} • {hungTempleData.lessonTitle}
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400">
                Núi Nghĩa Lĩnh (175m), Phú Thọ
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-wide mt-0.5">
              Sa bàn Đền Hùng & Lễ Giỗ Tổ Mùng 10 Tháng 3
            </h1>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('3D_VIEW')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === '3D_VIEW'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>🌐 Sa bàn 3D tương tác</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FESTIVAL')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'FESTIVAL'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>🔥 Lễ Hội Mùng 10/3</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('QUIZ')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'QUIZ'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>🏆 Thử Tài</span>
            </button>
          </div>

          <a
            href="/models/den-hung-3d.html"
            target="_blank"
            rel="noopener noreferrer"
            title="Mở ứng dụng 3D độc lập"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white transition border border-slate-700 hidden sm:flex items-center gap-1.5 text-xs font-bold"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Cửa sổ 3D</span>
          </a>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Chiếu toàn màn hình lên TV/Máy chiếu'}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition transform hover:scale-105"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : '📺 Chiếu toàn màn hình'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Areas */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* TAB 2: SA BÀN 3D WEBGL TƯƠNG TÁC XOAY 360 ĐỘ */}
        {activeTab === '3D_VIEW' && (
          <div className="relative flex-1 w-full min-h-[620px] sm:min-h-[720px] h-[78vh] max-h-[860px] bg-slate-950 flex flex-col">
            <iframe
              src="/models/den-hung-3d.html?embed=1"
              title="Sa bàn 3D Đền Hùng WebGL"
              className="w-full flex-1 border-0 min-h-[620px] sm:min-h-[720px] h-full"
              allow="fullscreen"
            />
          </div>
        )}

        {/* TAB 3: KHÔNG GIAN LỄ HỘI MÙNG 10 THÁNG 3 */}
        {activeTab === 'FESTIVAL' && (
          <div className="p-5 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
            {/* Banner Ca Dao & Lời Bác Hồ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-3xl bg-gradient-to-br from-amber-900/60 via-slate-900 to-amber-950/60 p-6 border border-amber-600/40 shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                    Ca dao nguồn cội
                  </span>
                  <p className="text-base sm:text-lg font-black text-amber-200 leading-relaxed whitespace-pre-line italic">
                    {hungTempleData.folkVerses[0]}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-amber-600/30 text-xs text-slate-400">
                  Câu ca dao nhắc nhở mọi người con đất Việt luôn hướng về cội nguồn dân tộc.
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-red-950/60 via-slate-900 to-red-900/40 p-6 border border-red-600/40 shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-2">
                    Lời Bác Hồ căn dặn tại Đền Giếng (19/9/1954)
                  </span>
                  <p className="text-base sm:text-lg font-black text-red-200 leading-relaxed italic">
                    {hungTempleData.uncleHoQuote.quote}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-red-600/30 text-xs text-slate-400">
                  {hungTempleData.uncleHoQuote.context}
                </div>
              </div>
            </div>

            {/* Danh sách các hoạt động Phần Lễ & Phần Hội */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-400" />
                  Nghi Lễ & Hoạt Động Lễ Hội Đền Hùng
                </h3>
                <span className="text-xs text-slate-400">
                  Phần Lễ trang nghiêm • Phần Hội rộn rã
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hungTempleData.festival.map((item) => {
                  const isLe = item.category === 'LE';
                  return (
                    <article
                      key={item.id}
                      className="rounded-3xl bg-slate-950/80 border border-slate-800 p-5 space-y-3 hover:border-amber-500/50 transition duration-300 shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                              isLe
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                          <span className="text-xs text-slate-500">Giỗ Tổ 10/3</span>
                        </div>
                        <h4 className="text-base font-black text-white">{item.title}</h4>
                        <p className="text-xs font-semibold text-amber-300">{item.subtitle}</p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 bg-slate-900/50 -mx-5 -mb-5 p-4 rounded-b-3xl">
                        <p className="text-[11px] text-slate-400">
                          <strong className="text-amber-400 font-bold">Ý nghĩa: </strong>
                          {item.meaning}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Di sản văn hóa UNESCO */}
            <div className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4" />
                Di sản văn hóa đại diện nhân loại (UNESCO công nhận)
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hungTempleData.unescoHeritage.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 bg-slate-900 rounded-2xl p-4 border border-slate-800 text-xs text-slate-200 leading-relaxed font-semibold"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 4: THỬ TÀI HIỂU BIẾT (QUIZ CỦNG CỐ) */}
        {activeTab === 'QUIZ' && (
          <div className="p-5 sm:p-8 max-w-3xl mx-auto w-full space-y-6">
            <div className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Củng cố bài học
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Thử Tài Khám Phá Đền Hùng
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Trả lời 4 câu hỏi trắc nghiệm nhanh để kiểm tra độ hiểu bài của em!
                </p>
              </div>

              {quizSubmitted && (
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Làm lại từ đầu</span>
                </button>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {hungTempleData.quizQuestions.map((q, qIndex) => {
                const selectedOption = quizAnswers[q.id];
                const isAnswered = selectedOption !== undefined;
                const isCorrect = isAnswered && selectedOption === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="bg-slate-950/80 rounded-3xl p-5 border border-slate-800 space-y-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black flex items-center justify-center shrink-0">
                        {qIndex + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-relaxed pt-0.5">
                        {q.question}
                      </h4>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                      {q.options.map((option, optIndex) => {
                        const isChosen = selectedOption === optIndex;
                        const isThisCorrect = optIndex === q.correctIndex;

                        let buttonStyle = 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700';

                        if (quizSubmitted) {
                          if (isThisCorrect) {
                            buttonStyle = 'bg-emerald-950/70 text-emerald-200 border-emerald-500 font-bold';
                          } else if (isChosen) {
                            buttonStyle = 'bg-red-950/70 text-red-200 border-red-500 line-through';
                          }
                        } else if (isChosen) {
                          buttonStyle = 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md';
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(q.id, optIndex)}
                            className={`p-3 rounded-2xl border text-xs text-left transition flex items-center gap-2 ${buttonStyle}`}
                          >
                            <span className="w-5 h-5 rounded-lg bg-slate-800/80 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="flex-1">{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation after submitting */}
                    {quizSubmitted && (
                      <div
                        className={`mt-2 p-3.5 rounded-2xl text-xs leading-relaxed ml-10 flex items-start gap-2.5 ${
                          isCorrect
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                            : 'bg-amber-950/40 text-amber-200 border border-amber-800/60'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold">
                            {isCorrect ? 'Chính xác! ' : 'Giải thích: '}
                          </p>
                          <p className="mt-0.5 text-slate-300">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            {!quizSubmitted ? (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleGradeQuiz}
                  disabled={Object.keys(quizAnswers).length === 0}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
                >
                  Hoàn thành và chấm điểm
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 rounded-3xl p-6 border border-amber-500/40 text-center space-y-2">
                <p className="text-xl font-black text-amber-300">
                  🎉 Kết quả: {
                    Object.values(quizAnswers).filter(
                      (ans, idx) => ans === hungTempleData.quizQuestions[idx].correctIndex
                    ).length
                  } / {hungTempleData.quizQuestions.length} câu đúng!
                </p>
                <p className="text-xs text-slate-300">
                  Chúc mừng em đã hoàn thành xuất sắc chuyến khám phá lịch sử Đền Hùng!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
