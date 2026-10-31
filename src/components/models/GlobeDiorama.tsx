import React, { useState } from 'react';
import {
  Globe,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  ExternalLink,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Compass,
  Map,
  Sparkles,
  Layers
} from 'lucide-react';
import { triggerConfetti } from '../../utils/confetti';
import { GLOBE_FEATURES, GLOBE_QUIZ, type GlobeFeature } from '../../data/models/globeData';

export const GlobeDiorama: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'3d' | 'components' | 'continents' | 'quiz'>('3d');
  const [selectedFeature, setSelectedFeature] = useState<GlobeFeature>(GLOBE_FEATURES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    GLOBE_QUIZ.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) correctCount++;
    });
    if (correctCount >= 4) {
      triggerConfetti();
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const score = Object.entries(userAnswers).filter(
    ([qId, ans]) => GLOBE_QUIZ.find(q => q.id === Number(qId))?.correctIndex === ans
  ).length;

  return (
    <div className="bg-slate-900 rounded-3xl border border-indigo-900/50 shadow-2xl overflow-hidden flex flex-col">
      {/* Control Bar */}
      <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-b border-indigo-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('3d'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === '3d'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Quả Địa Cầu 3D</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('components'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'components'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Trục, Cực & Kinh Vĩ tuyến</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('continents'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'continents'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="h-4 w-4" />
            <span>6 Châu Lục & Đại Dương</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('quiz'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Thử tài trắc nghiệm</span>
          </button>
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-2">
          {activeTab === 'components' && (
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  speakText(`${selectedFeature.name}. ${selectedFeature.definition} ${selectedFeature.role}`);
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
            href="/models/qua-dia-cau-3d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Mở tab mới toàn màn hình"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4' : 'min-h-[580px]'}`}>
        {/* TAB 1: 3D THREE.JS GLOBE */}
        {activeTab === '3d' && (
          <div className="w-full h-full min-h-[580px] relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
            <iframe
              src="/models/qua-dia-cau-3d.html"
              title="Mô hình 3D Quả Địa Cầu"
              className="w-full h-full min-h-[580px] border-0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {/* TAB 2: COMPONENTS & COORDINATES */}
        {activeTab === 'components' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GLOBE_FEATURES.slice(0, 4).map(feature => {
                const isSelected = selectedFeature.id === feature.id;
                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => {
                      setSelectedFeature(feature);
                      stopSpeaking();
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block truncate text-white mb-1">{feature.name}</span>
                    <p className="text-[11px] text-slate-400 truncate">{feature.role}</p>
                  </button>
                );
              })}
            </div>

            {/* Feature Card Detail */}
            <div className="bg-slate-950/60 rounded-3xl p-6 sm:p-8 border border-indigo-900/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
                    <Compass className="h-3.5 w-3.5" />
                    <span>Thành phần quan trọng trên quả địa cầu</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{selectedFeature.name}</h2>
                </div>

                <button
                  type="button"
                  onClick={() => speakText(`${selectedFeature.name}. ${selectedFeature.definition} ${selectedFeature.role}`)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 shrink-0 self-start sm:self-center transition"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Nghe thuyết minh</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Khái niệm & Định nghĩa
                    </h3>
                    <p className="text-sm text-slate-200 leading-relaxed">{selectedFeature.definition}</p>
                  </div>

                  <div className="bg-indigo-500/10 rounded-2xl p-5 border border-indigo-500/30">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-2">
                      <Layers className="h-4 w-4" />
                      <span>Vai trò và ý nghĩa học tập</span>
                    </div>
                    <p className="text-xs text-indigo-100 leading-relaxed">{selectedFeature.role}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/30">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Em có biết?</span>
                    </div>
                    <p className="text-xs text-amber-100 leading-relaxed">{selectedFeature.fact}</p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-300">Cách sử dụng Quả Địa Cầu:</h4>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                      <li>Đặt quả địa cầu trước mặt sao cho trục nghiêng đúng hướng.</li>
                      <li>Dùng tay xoay nhẹ quả cầu từ <strong>Tây sang Đông</strong> (ngược chiều kim đồng hồ).</li>
                      <li>Tìm các đường vĩ tuyến để xác định Bán cầu Bắc (trên Xích đạo) hay Bán cầu Nam (dưới Xích đạo).</li>
                    </ul>
                  </div>

                  {/* 3D Realistic Render Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-slate-900 group shadow-xl">
                    <img
                      src="/images/models/qua-dia-cau-3d.jpg"
                      alt="Mô hình 3D Quả Địa Cầu Tương Tác"
                      className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3 text-xs font-bold text-indigo-200">
                      Quả địa cầu 3D chân thực: Trục nghiêng 23,5°, 6 châu lục và dải đất Việt Nam
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTINENTS & OCEANS */}
        {activeTab === 'continents' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
              <h2 className="text-2xl font-black text-white">6 Châu Lục & 4 Đại Dương</h2>
              <p className="text-xs text-slate-400">
                Toàn cảnh bề mặt Trái Đất được thể hiện sinh động và chuẩn xác trên Quả Địa Cầu
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 6 Châu lục */}
              <div className="bg-slate-950/70 border border-emerald-800/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗺️</span>
                  <div>
                    <h3 className="text-lg font-black text-white">6 Châu Lục Lớn</h3>
                    <p className="text-xs text-emerald-400 font-semibold">Đất liền chiếm khoảng 29% diện tích bề mặt</p>
                  </div>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-emerald-300">1. Châu Á:</strong> Châu lục lớn nhất và đông dân nhất thế giới, nơi có Việt Nam chúng ta.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-emerald-300">2. Châu Âu:</strong> Nằm ở phía tây châu Á, tiếp giáp Đại Tây Dương.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-emerald-300">3. Châu Phi:</strong> Khí hậu nóng nhất thế giới, có sa mạc Sahara rộng lớn.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-emerald-300">4. Châu Mỹ:</strong> Trải dài từ Bắc Cực xuống gần Nam Cực (gồm Bắc Mỹ và Nam Mỹ).
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-emerald-300">5. Châu Đại Dương:</strong> Châu lục nhỏ nhất thế giới, gồm nước Úc và các đảo san hô.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-emerald-300">6. Châu Nam Cực:</strong> Lạnh nhất thế giới, quanh năm phủ một lớp băng tuyết dày.
                  </div>
                </div>
              </div>

              {/* 4 Đại dương */}
              <div className="bg-slate-950/70 border border-sky-800/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌊</span>
                  <div>
                    <h3 className="text-lg font-black text-white">4 Đại Dương Mênh Mông</h3>
                    <p className="text-xs text-sky-400 font-semibold">Đại dương bao phủ hơn 71% bề mặt Trái Đất</p>
                  </div>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-sky-300">1. Thái Bình Dương:</strong> Đại dương lớn nhất và sâu nhất Trái Đất, tiếp giáp bờ đông Việt Nam qua Biển Đông.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-sky-300">2. Đại Tây Dương:</strong> Đại dương lớn thứ hai, nằm giữa châu Mỹ và châu Âu, châu Phi.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-sky-300">3. Ấn Độ Dương:</strong> Nằm ở phía nam châu Á, giữa châu Phi và châu Đại Dương.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-sky-300">4. Bắc Băng Dương:</strong> Đại dương nhỏ nhất và lạnh nhất, bao quanh Cực Bắc và quanh năm đóng băng tuyết.
                  </div>
                </div>

                <div className="p-4 bg-indigo-950/50 rounded-2xl border border-indigo-500/30 text-xs text-indigo-200">
                  ⭐ <strong>Tổ quốc Việt Nam:</strong> Có bờ biển dài hơn 3.260 km tiếp giáp Biển Đông (một phần của Thái Bình Dương), với 2 quần đảo Hoàng Sa và Trường Sa giữ vị trí chiến lược quốc gia.
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
                <h2 className="text-xl font-black text-white">Thử Tài Lịch Sử & Địa Lí: Quả Địa Cầu</h2>
                <p className="text-xs text-slate-400 mt-0.5">Chọn đáp án đúng nhất theo kiến thức SGK Lớp 4</p>
              </div>

              {quizSubmitted && (
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 font-black text-sm border border-indigo-500/40">
                    Đạt: {score} / {GLOBE_QUIZ.length} điểm
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
              {GLOBE_QUIZ.map((q, idx) => {
                const userChoice = userAnswers[q.id];
                const isAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">{q.question}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                        if (isAnswered && userChoice === optIdx) {
                          btnStyle = 'bg-indigo-950 border-indigo-400 text-indigo-200';
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
                        <span className="font-bold text-indigo-400">Giải thích: </span>
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
                  disabled={Object.keys(userAnswers).length < GLOBE_QUIZ.length}
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm shadow-xl shadow-indigo-500/20 transition transform hover:scale-105"
                >
                  Nộp bài & Xem kết quả
                </button>
              </div>
            ) : (
              <div className="bg-indigo-950/40 rounded-2xl p-6 border border-indigo-500/30 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-white">
                  {score === GLOBE_QUIZ.length
                    ? 'Tuyệt vời! Em đã sử dụng thành thạo Quả Địa Cầu môn Địa lí 4!'
                    : `Em đã đúng ${score}/${GLOBE_QUIZ.length} câu. Hãy rèn luyện thêm nhé!`}
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
