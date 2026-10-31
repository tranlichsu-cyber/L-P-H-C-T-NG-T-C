import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  ExternalLink,
  Droplets,
  CloudRain,
  Flame,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { triggerConfetti } from '../../utils/confetti';
import { unlockBadge } from '../../utils/modelBadges';
import { WATER_CYCLE_STAGES, WATER_QUIZ, type WaterCycleStage } from '../../data/models/waterCycleData';

export const WaterCycleDiorama: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'3d' | 'stages' | 'states' | 'quiz'>('3d');
  const [selectedStage, setSelectedStage] = useState<WaterCycleStage>(WATER_CYCLE_STAGES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => setIsFullscreen(true));
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // SpeechSynthesis
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSelectAnswer = (questionId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    WATER_QUIZ.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) correctCount++;
    });
    if (correctCount >= 4) {
      triggerConfetti();
      unlockBadge('badge-water-cycle');
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const score = Object.entries(userAnswers).filter(
    ([qId, ans]) => WATER_QUIZ.find(q => q.id === Number(qId))?.correctIndex === ans
  ).length;

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900 rounded-3xl border border-sky-900/50 shadow-2xl overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : ''}`}>
      {/* Diorama Control Bar */}
      <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-b border-sky-900/40 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('3d'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === '3d'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="h-4 w-4" />
            <span>Sa bàn 3D 360°</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('stages'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'stages'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="h-4 w-4" />
            <span>4 Giai đoạn Tuần hoàn</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('states'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'states'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>3 Thể của nước</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('quiz'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Thử tài trắc nghiệm</span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {activeTab === 'stages' && (
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  speakText(`${selectedStage.title}. ${selectedStage.description} ${selectedStage.detail}`);
                }
              }}
              className={`p-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isSpeaking
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title="Đọc thuyết minh giọng nói tiếng Việt"
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Dừng đọc' : 'Đọc bài'}</span>
            </button>
          )}

          <a
            href="/models/vong-tuan-hoan-nuoc-3d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Mở tab mới toàn màn hình"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30 transition transform hover:scale-105"
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Chiếu toàn màn hình lên TV/Máy chiếu'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : '📺 Chiếu toàn màn hình'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className={`relative flex-1 flex flex-col ${isFullscreen ? 'h-[calc(100vh-65px)] p-2' : 'min-h-[580px]'}`}>
        {/* TAB 1: 3D THREE.JS SIMULATION */}
        {activeTab === '3d' && (
          <div className="w-full flex-1 min-h-[580px] relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col">
            <iframe src="/models/vong-tuan-hoan-nuoc-3d.html"
              title="Mô hình 3D Vòng tuần hoàn của nước"
              className="w-full h-full flex-1 border-0"
              allow="fullscreen; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
            />
          </div>
        )}

        {/* TAB 2: 4 STAGES DEEP EXPLORATION */}
        {activeTab === 'stages' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Stage Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WATER_CYCLE_STAGES.map(stage => {
                const isSelected = selectedStage.id === stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      setSelectedStage(stage);
                      stopSpeaking();
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition relative overflow-hidden ${
                      isSelected
                        ? 'bg-sky-950/70 border-sky-400 text-white shadow-lg shadow-sky-500/20'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 text-xs font-black flex items-center justify-center">
                        {stage.order}
                      </span>
                      <span className="text-xs font-bold truncate text-white">{stage.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{stage.vietnameseTerm}</p>
                  </button>
                );
              })}
            </div>

            {/* Selected Stage Detail Card */}
            <div className="bg-slate-950/60 rounded-3xl p-6 sm:p-8 border border-sky-900/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold mb-2">
                    <Droplets className="h-3.5 w-3.5" />
                    <span>Giai đoạn {selectedStage.order}: {selectedStage.scientificTerm}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{selectedStage.title}</h2>
                  <p className="text-sm font-semibold text-sky-400 mt-1">{selectedStage.stateChange}</p>
                </div>

                <button
                  type="button"
                  onClick={() => speakText(`${selectedStage.title}. ${selectedStage.description} ${selectedStage.detail}`)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/30 shrink-0 self-start sm:self-center transition"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Nghe thuyết minh</span>
                </button>
              </div>

              {/* Textual Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Diễn biến khoa học
                    </h3>
                    <p className="text-sm text-slate-200 leading-relaxed">{selectedStage.description}</p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{selectedStage.detail}</p>
                  </div>

                  <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/30">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Sự thật khoa học thú vị</span>
                    </div>
                    <p className="text-xs text-amber-100 leading-relaxed">{selectedStage.keyFact}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
                      <Layers className="h-4 w-4" />
                      <span>Ví dụ trong đời sống thực tế</span>
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed">{selectedStage.realWorldExample}</p>
                  </div>

                  {/* Flow Summary Graphic */}
                  <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Vị trí trong toàn bộ chu trình
                    </h3>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span className={selectedStage.order === 1 ? 'text-amber-400' : ''}>1. Bay hơi</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                      <span className={selectedStage.order === 2 ? 'text-sky-400' : ''}>2. Ngưng tụ</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                      <span className={selectedStage.order === 3 ? 'text-blue-400' : ''}>3. Mưa rơi</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                      <span className={selectedStage.order === 4 ? 'text-emerald-400' : ''}>4. Nước ngầm</span>
                    </div>
                  </div>

                  {/* 3D Realistic Render Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-sky-500/30 bg-slate-900 group shadow-xl">
                    <img
                      src="/images/models/vong-tuan-hoan-nuoc-3d.jpg"
                      alt="Sa bàn 3D Vòng tuần hoàn của nước"
                      className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3 text-xs font-bold text-sky-200">
                      Sa bàn 3D chân thực: Bay hơi biển, mây ngưng tụ, mưa rơi và mạch nước ngầm
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 3 STATES OF WATER */}
        {activeTab === 'states' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
              <h2 className="text-2xl font-black text-white">Ba Thể Của Nước & Sự Chuyển Thể</h2>
              <p className="text-xs text-slate-400">
                Nước có thể biến đổi qua lại giữa 3 thể (Rắn, Lỏng, Khí) khi nhiệt độ môi trường thay đổi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Thể rắn */}
              <div className="bg-slate-950/70 border border-cyan-800/40 rounded-3xl p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl">
                  🧊
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Thể Rắn (Nước đá, Băng)</h3>
                  <p className="text-xs text-cyan-400 font-semibold">Dưới 0°C</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Có hình dạng xác định. Khi để ở nhiệt độ phòng trên 0°C, nước đá sẽ <strong>nóng chảy</strong> thành nước ở thể lỏng.
                </p>
                <div className="p-3 bg-slate-900 rounded-xl text-[11px] text-slate-400 border border-slate-800">
                  ❄️ Ví dụ: Kem que, đá lạnh trong tủ lạnh, băng tuyết trên đỉnh Fansipan.
                </div>
              </div>

              {/* Thể lỏng */}
              <div className="bg-slate-950/70 border border-sky-800/40 rounded-3xl p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 text-2xl">
                  💧
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Thể Lỏng (Nước uống, Sông, Biển)</h3>
                  <p className="text-xs text-sky-400 font-semibold">Từ 0°C đến 100°C</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Không có hình dạng nhất định (có hình dạng của vật chứa nó), chảy tràn lan từ cao xuống thấp và thấm qua một số chất.
                </p>
                <div className="p-3 bg-slate-900 rounded-xl text-[11px] text-slate-400 border border-slate-800">
                  🌊 Ví dụ: Nước mưa, dòng sông Hồng, đại dương bao la, nước uống hằng ngày.
                </div>
              </div>

              {/* Thể khí */}
              <div className="bg-slate-950/70 border border-amber-800/40 rounded-3xl p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
                  💨
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Thể Khí (Hơi nước)</h3>
                  <p className="text-xs text-amber-400 font-semibold">Khi sôi ở 100°C hoặc bay hơi tự nhiên</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Không màu, không mùi, không nhìn thấy được, lan tỏa chiếm toàn bộ thể tích không gian. Gặp lạnh sẽ <strong>ngưng tụ</strong> thành giọt nước li ti.
                </p>
                <div className="p-3 bg-slate-900 rounded-xl text-[11px] text-slate-400 border border-slate-800">
                  ☀️ Ví dụ: Nước bốc hơi từ ấm đun sôi, sương mù buổi sớm, mây trời.
                </div>
              </div>
            </div>

            {/* Sơ đồ chuyển thể */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-3 text-center">Tóm tắt các hiện tượng chuyển thể</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-400">Nóng chảy</span>
                  <p className="text-slate-400 mt-1">Thể rắn ➔ Thể lỏng</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-blue-400">Đông đặc</span>
                  <p className="text-slate-400 mt-1">Thể lỏng ➔ Thể rắn</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-yellow-400">Bay hơi</span>
                  <p className="text-slate-400 mt-1">Thể lỏng ➔ Thể khí</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-cyan-400">Ngưng tụ</span>
                  <p className="text-slate-400 mt-1">Thể khí ➔ Thể lỏng</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUIZ */}
        {activeTab === 'quiz' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">Thử Tài Kiến Thức: Vòng Tuần Hoàn Của Nước</h2>
                <p className="text-xs text-slate-400 mt-0.5">Chọn đáp án đúng nhất cho mỗi câu hỏi bên dưới</p>
              </div>

              {quizSubmitted && (
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 font-black text-sm border border-sky-500/40">
                    Đạt: {score} / {WATER_QUIZ.length} điểm
                  </span>
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    title="Làm lại bài"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {WATER_QUIZ.map((q, idx) => {
                const userChoice = userAnswers[q.id];
                const isAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">{q.question}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                        if (isAnswered && userChoice === optIdx) {
                          btnStyle = 'bg-sky-950 border-sky-400 text-sky-200';
                        }

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                          } else if (userChoice === optIdx && !isCorrect) {
                            btnStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between gap-2 ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            )}
                            {quizSubmitted && userChoice === optIdx && !isCorrect && (
                              <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                        <span className="font-bold text-sky-400">Giải thích: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={Object.keys(userAnswers).length < WATER_QUIZ.length}
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm shadow-xl shadow-sky-500/20 transition transform hover:scale-105"
                >
                  Nộp bài & Xem kết quả
                </button>
              </div>
            ) : (
              <div className="bg-sky-950/40 rounded-2xl p-6 border border-sky-500/30 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-white">
                  {score === WATER_QUIZ.length
                    ? 'Xuất sắc! Em đã nắm vững kiến thức về Vòng tuần hoàn của nước!'
                    : `Em đã đúng ${score}/${WATER_QUIZ.length} câu. Hãy ôn lại những phần chưa chính xác nhé!`}
                </h3>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                >
                  Làm lại lần nữa
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
