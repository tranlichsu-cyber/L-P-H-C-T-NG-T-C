import React, { useState, useEffect, useRef } from 'react';
import {
  Map,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  ExternalLink,
  HelpCircle,
  Layers,
  Mountain,
  ArrowRight
} from 'lucide-react';
import { triggerConfetti } from '../../utils/confetti';
import { unlockBadge } from '../../utils/modelBadges';
import {
  VIETNAM_TERRAIN_REGIONS,
  VIETNAM_TERRAIN_QUIZ,
  type TerrainRegion
} from '../../data/models/vietnamTerrainData';

export const VietnamTerrainDiorama: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'3d' | 'regions' | 'comparison' | 'quiz'>('3d');
  const [selectedRegion, setSelectedRegion] = useState<TerrainRegion>(VIETNAM_TERRAIN_REGIONS[0]);
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
    VIETNAM_TERRAIN_QUIZ.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) correctCount++;
    });
    if (correctCount >= 4) {
      triggerConfetti();
      unlockBadge('badge-vietnam-terrain');
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const score = Object.entries(userAnswers).filter(
    ([qId, ans]) => VIETNAM_TERRAIN_QUIZ.find(q => q.id === Number(qId))?.correctIndex === ans
  ).length;

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900 rounded-3xl border border-emerald-900/50 shadow-2xl overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : ''}`}>
      {/* Control Bar */}
      <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-b border-emerald-900/40 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('3d'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === '3d'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="h-4 w-4" />
            <span>Sa bàn 3D 360°</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('regions'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'regions'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>6 Vùng địa hình</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('comparison'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'comparison'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mountain className="h-4 w-4" />
            <span>Đồi núi & Đồng bằng</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('quiz'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Thử tài trắc nghiệm</span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {activeTab === 'regions' && (
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  speakText(`${selectedRegion.name}. ${selectedRegion.elevation}. ${selectedRegion.features}. ${selectedRegion.climate}. ${selectedRegion.economic}`);
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
            href="/models/dia-hinh-viet-nam-3d.html"
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
            <iframe src="/models/dia-hinh-viet-nam-3d.html"
              title="Sa bàn 3D Địa hình các vùng miền Việt Nam"
              className="w-full h-full flex-1 border-0"
              allow="fullscreen; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
            />
          </div>
        )}

        {/* TAB 2: 6 REGIONS DEEP EXPLORATION */}
        {activeTab === 'regions' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {VIETNAM_TERRAIN_REGIONS.map(reg => {
                const isSelected = selectedRegion.id === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(reg);
                      stopSpeaking();
                    }}
                    className={`p-3 rounded-2xl border text-left transition relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xl mb-1">{reg.icon}</div>
                    <div className="text-xs font-bold leading-tight line-clamp-2">{reg.name}</div>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-950/60 rounded-3xl p-6 sm:p-8 border border-emerald-900/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
                    <Map className="h-3.5 w-3.5" />
                    <span>Khu vực {selectedRegion.order} / 6</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{selectedRegion.icon}</span>
                    <span>{selectedRegion.name}</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    ⛰️ Độ cao & Địa hình
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedRegion.elevation}
                  </p>
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    ❄️ Đặc điểm Khí hậu
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedRegion.climate}
                  </p>
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    🌲 Cảnh quan tự nhiên
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedRegion.features}
                  </p>
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    ⚡ Tiềm năng kinh tế & Đời sống
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedRegion.economic}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OVERVIEW RATIO COMPARISON */}
        {activeTab === 'comparison' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/80 rounded-3xl p-6 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⛰️</span>
                    <div>
                      <h3 className="text-base font-black text-white">Địa hình Đồi Núi</h3>
                      <p className="text-xs text-amber-400 font-bold">Chiếm 3/4 diện tích lãnh thổ đất liền</p>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-2xl border border-amber-500/30">
                    75%
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">✓</span>
                    <span>Chủ yếu là đồi núi thấp dưới 1.000m (chiếm 85%), núi cao trên 2.000m chỉ chiếm 1%.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">✓</span>
                    <span>Hai hướng núi chính: Hướng Tây Bắc – Đông Nam (Hoàng Liên Sơn, Trường Sơn Bắc) và hướng vòng cung (Đông Bắc).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">✓</span>
                    <span>Tài nguyên: Khoáng sản phong phú, rừng gỗ quý, tiềm năng thủy điện khổng lồ và cây công nghiệp.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950/80 rounded-3xl p-6 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌾</span>
                    <div>
                      <h3 className="text-base font-black text-white">Địa hình Đồng Bằng</h3>
                      <p className="text-xs text-emerald-400 font-bold">Chiếm 1/4 diện tích lãnh thổ đất liền</p>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-2xl border border-emerald-500/30">
                    25%
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Gồm Đồng bằng châu thổ sông Hồng (Bắc Bộ), Đồng bằng sông Cửu Long (Nam Bộ) và các dải đồng bằng Duyên hải miền Trung.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Đất phù sa màu mỡ phì nhiêu, địa hình bằng phẳng thuận lợi giao thông và canh tác lúa nước.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Nơi tập trung các đô thị sầm uất, các trung tâm kinh tế lớn và dân cư đông đúc nhất cả nước.</span>
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
                <h3 className="text-lg font-black text-white">Thử tài Địa lí: Các vùng miền Việt Nam</h3>
                <p className="text-xs text-slate-400">Trả lời đúng 4/5 câu để mở khóa Huy hiệu Nhà Địa Lý Trẻ Tuổi</p>
              </div>
              {quizSubmitted && (
                <div className="px-3.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                  Kết quả: {score}/{VIETNAM_TERRAIN_QUIZ.length} Điểm
                </div>
              )}
            </div>

            <div className="space-y-4">
              {VIETNAM_TERRAIN_QUIZ.map((q, idx) => {
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
                          btnStyle = 'bg-emerald-950/60 border-emerald-500 text-white font-bold';
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
                  disabled={Object.keys(userAnswers).length < VIETNAM_TERRAIN_QUIZ.length}
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
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
