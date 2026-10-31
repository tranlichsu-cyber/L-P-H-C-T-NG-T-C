import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  ExternalLink,
  HelpCircle,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { triggerConfetti } from '../../utils/confetti';
import { unlockBadge } from '../../utils/modelBadges';
import { BACH_DANG_STAGES, BACH_DANG_QUIZ, type BachDangStage } from '../../data/models/bachDangData';

export const BachDangDiorama: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'3d' | 'stages' | 'tactics' | 'quiz'>('3d');
  const [selectedStage, setSelectedStage] = useState<BachDangStage>(BACH_DANG_STAGES[0]);
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
    BACH_DANG_QUIZ.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) correctCount++;
    });
    if (correctCount >= 4) {
      triggerConfetti();
      unlockBadge('badge-bach-dang');
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const score = Object.entries(userAnswers).filter(
    ([qId, ans]) => BACH_DANG_QUIZ.find(q => q.id === Number(qId))?.correctIndex === ans
  ).length;

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900 rounded-3xl border border-red-900/50 shadow-2xl overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : ''}`}>
      {/* Control Bar */}
      <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-b border-red-900/40 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('3d'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === '3d'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="h-4 w-4" />
            <span>Sa bàn 3D 360°</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('stages'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'stages'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>4 Giai đoạn chiến dịch</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('tactics'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'tactics'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Nghệ thuật quân sự</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('quiz'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
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
                  speakText(`${selectedStage.title}. ${selectedStage.description} ${selectedStage.significance}`);
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
            href="/models/bach-dang-938-3d.html"
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
            <iframe src="/models/bach-dang-938-3d.html"
              title="Sa bàn 3D Chiến thắng Bạch Đằng năm 938"
              className="w-full h-full flex-1 border-0"
              allow="fullscreen; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
            />
          </div>
        )}

        {/* TAB 2: 4 STAGES EXPLORATION */}
        {activeTab === 'stages' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BACH_DANG_STAGES.map(stage => {
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
                        ? 'bg-red-950/70 border-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 text-xs font-black flex items-center justify-center">
                        {stage.order}
                      </span>
                      <span className="text-xs font-bold truncate text-white">{stage.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{stage.subtitle}</p>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-950/60 rounded-3xl p-6 sm:p-8 border border-red-900/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold mb-2">
                    <Swords className="h-3.5 w-3.5" />
                    <span>Giai đoạn {selectedStage.order}: {selectedStage.subtitle}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{selectedStage.title}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                      Diễn biến chính
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {selectedStage.description}
                    </p>
                  </div>

                  <div className="bg-red-950/30 rounded-2xl p-4 border border-red-500/30">
                    <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider mb-2">
                      ⚔️ Nghệ thuật quân sự
                    </h4>
                    <p className="text-xs text-red-200 leading-relaxed">
                      {selectedStage.tactics}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-amber-950/20 rounded-2xl p-4 border border-amber-500/30">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                      🌟 Ý nghĩa lịch sử
                    </h4>
                    <p className="text-xs text-amber-100 leading-relaxed">
                      {selectedStage.significance}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TACTICS & COMPARISON */}
        {activeTab === 'tactics' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dai Viet Army */}
              <div className="bg-slate-950/80 rounded-3xl p-6 border border-emerald-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    🇻🇳
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Quân Đội Đại Việt (Ngô Quyền)</h3>
                    <p className="text-xs text-emerald-400 font-bold">Chính nghĩa · Dũng cảm · Mưu trí</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>Thuyền nhẹ cơ động:</strong> Dễ luồn lách qua các bãi cạn và khiêu chiến linh hoạt.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>Trận địa cọc ngầm:</strong> Hàng nghìn thân gỗ lim vót nhọn bịt sắt cắm nghiêng xuôi dòng.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>Lợi dụng thủy triều:</strong> Hiểu rõ từng con nước triều lên và triều rút để xuất quân đúng thời cơ.</span>
                  </li>
                </ul>
              </div>

              {/* Han Invaders */}
              <div className="bg-slate-950/80 rounded-3xl p-6 border border-red-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                    ⚔️
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Quân Xâm Lược Nam Hán (Hoằng Tháo)</h3>
                    <p className="text-xs text-red-400 font-bold">Phi nghĩa · Kiêu ngạo · Mắc bẫy</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    <span><strong>Thuyền chiến cồng kềnh:</strong> Thuyền to lớn, chở nặng nề, xoay chuyển chậm chạp trên sông.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    <span><strong>Không thông thuộc địa hình:</strong> Hoàn toàn mù tịt về bãi cọc và quy luật thủy triều biển Đông.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    <span><strong>Chủ quan khinh địch:</strong> Thấy thuyền ta giả vờ chạy liền dốc toàn bộ hạm đội đuổi theo vào tử địa.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUIZ */}
        {activeTab === 'quiz' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">Thử tài Lịch sử: Chiến thắng Bạch Đằng 938</h3>
                <p className="text-xs text-slate-400">Hãy trả lời 5 câu hỏi để mở khóa Huy hiệu Anh hùng Bạch Đằng</p>
              </div>
              {quizSubmitted && (
                <div className="px-3.5 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-black">
                  Kết quả: {score}/{BACH_DANG_QUIZ.length} Điểm
                </div>
              )}
            </div>

            <div className="space-y-4">
              {BACH_DANG_QUIZ.map((q, idx) => {
                const selected = userAnswers[q.id];
                return (
                  <div key={q.id} className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3">
                    <div className="font-bold text-sm text-slate-200">
                      Câu {idx + 1}: {q.question}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                        if (selected === oIdx) {
                          btnStyle = 'bg-red-950/60 border-red-500 text-white font-bold';
                        }
                        if (quizSubmitted) {
                          if (oIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                          } else if (selected === oIdx) {
                            btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                          }
                        }
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(q.id, oIdx)}
                            className={`p-3 rounded-xl border text-left text-xs transition ${btnStyle}`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                        💡 <strong>Giải thích:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              {quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Làm lại bài</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={Object.keys(userAnswers).length < BACH_DANG_QUIZ.length}
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black shadow-lg shadow-red-600/30 transition flex items-center gap-2"
                >
                  <span>Nộp bài chấm điểm</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
