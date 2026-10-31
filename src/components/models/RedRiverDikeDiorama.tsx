import React, { useState } from 'react';
import {
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
  Shield,
  Sparkles,
  Waves,
  Calendar
} from 'lucide-react';
import { triggerConfetti } from '../../utils/confetti';
import { DIKE_STATIONS, DIKE_QUIZ, type DikeStation } from '../../data/models/redRiverDikeData';

export const RedRiverDikeDiorama: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'3d' | 'stations' | 'comparison' | 'quiz'>('3d');
  const [selectedStation, setSelectedStation] = useState<DikeStation>(DIKE_STATIONS[0]);
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
    DIKE_QUIZ.forEach(q => {
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
    ([qId, ans]) => DIKE_QUIZ.find(q => q.id === Number(qId))?.correctIndex === ans
  ).length;

  return (
    <div className="bg-slate-900 rounded-3xl border border-amber-900/50 shadow-2xl overflow-hidden flex flex-col">
      {/* Diorama Control Bar */}
      <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-b border-amber-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('3d'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === '3d'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="h-4 w-4" />
            <span>Sa bàn 3D 360°</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('stations'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'stations'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Cấu tạo & Lịch sử đê</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('comparison'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'comparison'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Mùa cạn & Mùa lũ</span>
          </button>

          <button
            type="button"
            onClick={() => { stopSpeaking(); setActiveTab('quiz'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Thử tài trắc nghiệm</span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {activeTab === 'stations' && (
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  speakText(`${selectedStation.title}. ${selectedStation.description} ${selectedStation.detail}`);
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
            href="/models/de-song-hong-3d.html"
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
        {/* TAB 1: 3D THREE.JS SIMULATION */}
        {activeTab === '3d' && (
          <div className="w-full h-full min-h-[580px] relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
            <iframe
              src="/models/de-song-hong-3d.html"
              title="Sa bàn 3D Mặt cắt Hệ thống Đê sông Hồng"
              className="w-full h-full min-h-[580px] border-0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {/* TAB 2: STATIONS & DETAILS */}
        {activeTab === 'stations' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIKE_STATIONS.map(st => {
                const isSelected = selectedStation.id === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setSelectedStation(st);
                      stopSpeaking();
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-400 text-white shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center">
                        {st.order}
                      </span>
                      <span className="text-xs font-bold truncate text-white">{st.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{st.description.slice(0, 35)}...</p>
                  </button>
                );
              })}
            </div>

            {/* Selected Station Detail */}
            <div className="bg-slate-950/60 rounded-3xl p-6 sm:p-8 border border-amber-900/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Trạm {selectedStation.order}: Kiến thức trọng tâm</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{selectedStation.title}</h2>
                </div>

                <button
                  type="button"
                  onClick={() => speakText(`${selectedStation.title}. ${selectedStation.description} ${selectedStation.detail}`)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/30 shrink-0 self-start sm:self-center transition"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Nghe thuyết minh</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Nội dung bài học
                    </h3>
                    <p className="text-sm text-slate-200 leading-relaxed">{selectedStation.description}</p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{selectedStation.detail}</p>
                  </div>

                  <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/30">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Sự thật lịch sử đáng tự hào</span>
                    </div>
                    <p className="text-xs text-amber-100 leading-relaxed">{selectedStation.keyFact}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cấu trúc các tầng con đê:</h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <strong className="text-amber-400">1. Mặt đê:</strong> Rộng 6 - 8m, trải nhựa hoặc bê tông, làm đường liên tỉnh, liên huyện.
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <strong className="text-emerald-400">2. Thân đê & Cơ đê:</strong> Đất sét nện chặt nhiều tầng, có mái dốc thoải và cơ đê chống trượt.
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <strong className="text-sky-400">3. Kè đá hộ đê:</strong> Xếp các khối đá tảng lớn phía bờ sông để chống sóng lớn xói lở chân đê.
                      </div>
                    </div>
                  </div>

                  {/* 3D Realistic Render Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-900 group shadow-xl">
                    <img
                      src="/images/models/de-song-hong-3d.jpg"
                      alt="Sa bàn 3D Mặt cắt Hệ thống Đê sông Hồng"
                      className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3 text-xs font-bold text-amber-200">
                      Sa bàn 3D chân thực: Mặt cắt địa chất đê sông Hồng, kè đá và làng xóm được bảo vệ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEASON COMPARISON */}
        {activeTab === 'comparison' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
              <h2 className="text-2xl font-black text-white">So Sánh Mùa Cạn & Mùa Lũ Sông Hồng</h2>
              <p className="text-xs text-slate-400">
                Sự tương phản rõ nét giữa hai mùa và vai trò không thể thay thế của hệ thống đê điều
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mùa cạn */}
              <div className="bg-slate-950/70 border border-emerald-800/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">☀️</span>
                  <div>
                    <h3 className="text-lg font-black text-white">Mùa Cạn (Tháng 11 – Tháng 4 năm sau)</h3>
                    <p className="text-xs text-emerald-400 font-semibold">Mực nước sông hạ thấp</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>• Dòng sông êm đềm, nước trong hơn, mực nước chỉ cao khoảng +2m so với đáy sông.</p>
                  <p>• Bãi bồi màu mỡ ngoài đê lộ ra rộng lớn, nhân dân tích cực gieo trồng ngô, khoai, dưa hấu, rau màu và dâu tằm xanh tốt.</p>
                  <p>• Đây là thời gian lý tưởng để các đội chuyên trách tổ chức nạo vét, đắp bồi và tu bổ gia cố thân đê trước khi mùa mưa lũ đến.</p>
                </div>
              </div>

              {/* Mùa lũ */}
              <div className="bg-slate-950/70 border border-rose-800/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌊</span>
                  <div>
                    <h3 className="text-lg font-black text-white">Mùa Lũ (Tháng 6 – Tháng 8)</h3>
                    <p className="text-xs text-rose-400 font-semibold">Mực nước sông dâng cao cuồn cuộn</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>• Mưa lớn liên tục ở thượng nguồn khiến mực nước sông Hồng dâng cao từ 6m đến 10m, dòng nước đỏ rực cuốn theo nhiều phù sa.</p>
                  <p>• Mực nước ngoài sông có thể <strong>cao hơn hẳn mặt sân, nóc nhà</strong> của người dân bên trong đồng ruộng trũng.</p>
                  <p>• Nhờ có con đê vững chắc giữ nước lũ ngoài sông, cuộc sống của hàng chục triệu người dân Đồng bằng Bắc Bộ vẫn được an toàn tuyệt đối.</p>
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
                <h2 className="text-xl font-black text-white">Thử Tài Lịch Sử & Địa Lí: Đê Sông Hồng</h2>
                <p className="text-xs text-slate-400 mt-0.5">Chọn đáp án đúng nhất theo kiến thức SGK Lớp 4 Bài 8</p>
              </div>

              {quizSubmitted && (
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-black text-sm border border-amber-500/40">
                    Đạt: {score} / {DIKE_QUIZ.length} điểm
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
              {DIKE_QUIZ.map((q, idx) => {
                const userChoice = userAnswers[q.id];
                const isAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">{q.question}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                        if (isAnswered && userChoice === optIdx) {
                          btnStyle = 'bg-amber-950 border-amber-400 text-amber-200';
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
                        <span className="font-bold text-amber-400">Giải thích: </span>
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
                  disabled={Object.keys(userAnswers).length < DIKE_QUIZ.length}
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition transform hover:scale-105"
                >
                  Nộp bài & Xem kết quả
                </button>
              </div>
            ) : (
              <div className="bg-amber-950/40 rounded-2xl p-6 border border-amber-500/30 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-white">
                  {score === DIKE_QUIZ.length
                    ? 'Xuất sắc! Em đã hiểu sâu sắc về Hệ thống Đê sông Hồng!'
                    : `Em đã đúng ${score}/${DIKE_QUIZ.length} câu. Hãy ôn tập lại nhé!`}
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
