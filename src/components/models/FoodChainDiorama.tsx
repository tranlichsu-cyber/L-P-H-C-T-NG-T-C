import React, { useState, useRef, useEffect } from 'react';
import {
  FOOD_CHAIN_NODES,
  FOOD_CHAIN_QUIZ,
  type FoodChainNode,
} from '../../data/models/foodChainData';
import { unlockBadge, isBadgeUnlocked } from '../../utils/modelBadges';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  Minimize2,
  Check,
  HelpCircle,
  Sparkles,
  Zap,
  Award,
  CheckCircle2,
  XCircle,
  Sun,
  Layers,
} from 'lucide-react';

export const FoodChainDiorama: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'3d' | 'nodes' | 'energy' | 'quiz'>('3d');
  const [selectedNode, setSelectedNode] = useState<FoodChainNode>(FOOD_CHAIN_NODES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBadgeUnlocked(isBadgeUnlocked('badge-food-chain'));
  }, []);

  // Text to Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ đọc âm thanh tự động.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleReloadIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Quiz handlers
  const handleAnswerSelect = (optionIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);

    const isCorrect = optionIndex === FOOD_CHAIN_QUIZ[currentQuizIndex].correctAnswer;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < FOOD_CHAIN_QUIZ.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
      // Unlock badge if passed >= 3/5
      if (quizScore >= 3 || (selectedAnswer === FOOD_CHAIN_QUIZ[currentQuizIndex].correctAnswer && quizScore + 1 >= 3)) {
        const unlocked = unlockBadge('badge-food-chain');
        if (unlocked) {
          setBadgeUnlocked(true);
        }
      }
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  return (
    <div ref={containerRef} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => { setActiveTab('3d'); stopSpeaking(); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === '3d'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Sa bàn 3D Tuần hoàn</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('nodes'); stopSpeaking(); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'nodes'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>5 Bậc dinh dưỡng</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('energy'); stopSpeaking(); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'energy'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Dòng năng lượng</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('quiz'); stopSpeaking(); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'quiz'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Thử thách Trắc nghiệm</span>
          </button>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
          {badgeUnlocked && (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Award className="h-3.5 w-3.5" />
              <span>Đã đạt Huy hiệu</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleReloadIframe}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs border border-slate-700"
            title="Tải lại mô hình 3D"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs border border-slate-700"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      <div className="flex-1 min-h-[560px] flex flex-col">
        {/* Tab 1: 3D Canvas */}
        {activeTab === '3d' && (
          <div className="relative w-full h-[620px] bg-slate-950 flex flex-col">
            <iframe
              ref={iframeRef}
              src="/models/chuoi-thuc-an-3d.html"
              title="Sa bàn 3D Chuỗi thức ăn"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
            {/* Overlay hint banner */}
            <div className="absolute top-4 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Chạm / Kéo chuột để xoay 360° · Cuộn để phóng to · Bút vẽ ghi chú ở góc phải</span>
            </div>
          </div>
        )}

        {/* Tab 2: 5 Trophic Levels Detailed Explanation */}
        {activeTab === 'nodes' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/60">
            {/* Left list of nodes */}
            <div className="lg:col-span-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Chọn mắt xích trong chuỗi thức ăn:
              </h3>
              {FOOD_CHAIN_NODES.map((node, idx) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    setSelectedNode(node);
                    stopSpeaking();
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between ${
                    selectedNode.id === node.id
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full text-xs font-black flex items-center justify-center bg-slate-800 text-emerald-400 border border-slate-700">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-white">{node.name}</span>
                    </div>
                    <div className="text-xs text-slate-400 pl-7">{node.role}</div>
                  </div>
                  {selectedNode.id === node.id && (
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Right Detailed Node Card */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                      {selectedNode.role}
                    </span>
                    <h2 className="text-2xl font-black text-white">{selectedNode.name}</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        `${selectedNode.name}. ${selectedNode.role}. Nguồn thức ăn: ${selectedNode.foodSource}. ${selectedNode.roleDescription}. Ví dụ điển hình: ${selectedNode.examples.join(', ')}`
                      )
                    }
                    className={`p-3 rounded-2xl border transition flex items-center gap-2 text-xs font-bold ${
                      isSpeaking
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    <span>{isSpeaking ? 'Dừng đọc' : 'Nghe bài giảng'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                      🍽️ Nguồn thức ăn / Năng lượng
                    </span>
                    <p className="text-sm font-semibold text-emerald-300">{selectedNode.foodSource}</p>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                      ⚡ Mức năng lượng chuyển hóa
                    </span>
                    <p className="text-sm font-semibold text-amber-300">{selectedNode.energyRetained}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    📖 Vai trò sinh thái trong tự nhiên
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                    {selectedNode.roleDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    🌾 Các sinh vật đại diện
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.examples.map((ex, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    📝 Trọng tâm bài học
                  </span>
                  <ul className="space-y-2">
                    {selectedNode.lessonPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Em có biết?
                  </div>
                  <div className="text-xs text-emerald-100/90 leading-relaxed">
                    {selectedNode.funFact}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Energy Flow in Ecology */}
        {activeTab === 'energy' && (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sun className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Mặt Trời — Cội nguồn năng lượng của Trái Đất</h3>
                  <p className="text-xs text-slate-400">Từ quang năng đến năng lượng sống của muôn loài</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Hầu hết năng lượng cho sự sống trên Trái Đất đều bắt nguồn từ Mặt Trời. Cây xanh (sinh vật sản xuất) hấp thụ quang năng để tạo ra chất hữu cơ. Sau đó, năng lượng này được truyền qua các bậc dinh dưỡng: từ động vật ăn cỏ đến động vật ăn thịt, và cuối cùng trở về đất nhờ vi sinh vật phân giải.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Zap className="h-4 w-4" />
                  <span>Quy luật 10% năng lượng</span>
                </div>
                <h4 className="text-base font-bold text-white">Tại sao thú ăn thịt luôn ít nhất?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Khi chuyển từ bậc dinh dưỡng này sang bậc dinh dưỡng tiếp theo, khoảng 90% năng lượng bị tiêu hao qua hô hấp, bài tiết và tỏa nhiệt; chỉ có khoảng 10% năng lượng được tích lũy vào cơ thể của sinh vật bậc trên. Vì vậy, các loài ăn thịt đầu bảng (rắn hổ mang, đại bàng, hổ) luôn có số lượng cá thể ít nhất.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <RotateCcw className="h-4 w-4" />
                  <span>Vòng tuần hoàn vật chất khép kín</span>
                </div>
                <h4 className="text-base font-bold text-white">Xác sinh vật không bao giờ biến mất vô ích</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Khi các loài động vật hoặc thực vật chết đi, sinh vật phân giải (nấm rơm, vi khuẩn đất) sẽ biến xác của chúng thành mùn khoáng hữu cơ nuôi đất. Rễ cây trồng lại hút chất khoáng từ đất để tiếp tục vòng đời mới, tạo thành một chu trình tuần hoàn vĩnh cửu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Interactive Quiz */}
        {activeTab === 'quiz' && (
          <div className="p-6 max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
            {!quizCompleted ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400">
                      Câu {currentQuizIndex + 1} / {FOOD_CHAIN_QUIZ.length}
                    </span>
                    <span>Điểm: {quizScore}</span>
                  </div>
                  <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{
                        width: `${((currentQuizIndex + 1) / FOOD_CHAIN_QUIZ.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {FOOD_CHAIN_QUIZ[currentQuizIndex].question}
                </h3>

                <div className="space-y-3">
                  {FOOD_CHAIN_QUIZ[currentQuizIndex].options.map((option, idx) => {
                    let btnClass = 'bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-800/80';
                    if (selectedAnswer !== null) {
                      if (idx === FOOD_CHAIN_QUIZ[currentQuizIndex].correctAnswer) {
                        btnClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                      } else if (idx === selectedAnswer) {
                        btnClass = 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold';
                      } else {
                        btnClass = 'bg-slate-950/30 border-slate-900 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={selectedAnswer !== null}
                        onClick={() => handleAnswerSelect(idx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between text-xs sm:text-sm ${btnClass}`}
                      >
                        <span>{option}</span>
                        {selectedAnswer !== null && idx === FOOD_CHAIN_QUIZ[currentQuizIndex].correctAnswer && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        )}
                        {selectedAnswer === idx && idx !== FOOD_CHAIN_QUIZ[currentQuizIndex].correctAnswer && (
                          <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 leading-relaxed animate-fadeIn">
                    💡 <strong>Giải thích:</strong> {FOOD_CHAIN_QUIZ[currentQuizIndex].explanation}
                  </div>
                )}

                {selectedAnswer !== null && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextQuiz}
                      className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition transform hover:scale-105"
                    >
                      {currentQuizIndex < FOOD_CHAIN_QUIZ.length - 1 ? 'Câu hỏi kế tiếp ➔' : 'Xem kết quả & Nhận huy hiệu'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-scaleUp">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 mx-auto flex items-center justify-center text-4xl shadow-inner">
                  {quizScore >= 3 ? '🏆' : '🌱'}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">
                    {quizScore >= 3 ? 'Chúc mừng em đã hoàn thành xuất sắc!' : 'Em hãy cố gắng thêm một chút nhé!'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Kết quả của em: <span className="font-bold text-emerald-400">{quizScore}</span> / {FOOD_CHAIN_QUIZ.length} câu đúng
                  </p>
                </div>

                {quizScore >= 3 && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 max-w-md mx-auto text-left flex items-center gap-3">
                    <Award className="h-8 w-8 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        Đã mở khóa Huy hiệu
                      </div>
                      <div className="text-sm font-bold text-white">Hiệp Sĩ Cân Bằng Sinh Thái 🌿</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                  >
                    Làm lại bài kiểm tra
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('3d')}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
                  >
                    Khám phá lại Sa bàn 3D
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
