import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Award,
  CheckCircle2,
  Landmark,
  Flame,
  BookOpen,
  Info,
  Layers,
  RotateCcw,
  ExternalLink,
  Eye,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Compass,
} from 'lucide-react';
import {
  hungTempleData,
  type HungTempleStation,
} from '../../data/models/hungTempleData';
import { triggerConfetti } from '../../utils/confetti';
import { playCorrectSound } from '../../utils/audio';
import { unlockBadge } from '../../utils/modelBadges';

type ActiveTab = 'DIORAMA' | '3D_VIEW' | 'FESTIVAL' | 'QUIZ';
type DetailTab = 'CORE' | 'LEGEND' | 'ARCHITECTURE' | 'FUN_FACT';

export const HungTempleDiorama: React.FC = () => {
  // Open the real WebGL diorama first; the illustrated overview remains a reference.
  const [activeTab, setActiveTab] = useState<ActiveTab>('3D_VIEW');
  const [selectedStation, setSelectedStation] = useState<HungTempleStation>(
    hungTempleData.stations[0]
  );
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Diorama Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Station Detail Drawer state (allows collapsing so it never covers the sa bàn!)
  const [isDetailCollapsed, setIsDetailCollapsed] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('CORE');
  const [showMeaningModal, setShowMeaningModal] = useState<boolean>(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dioramaViewportRef = useRef<HTMLDivElement>(null);
  const tourTimerRef = useRef<number | null>(null);

  // Auto-tour step timer
  useEffect(() => {
    if (!isTourPlaying || activeTab !== 'DIORAMA') {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
      return;
    }

    tourTimerRef.current = window.setInterval(() => {
      setSelectedStation((prev) => {
        const currentIndex = hungTempleData.stations.findIndex((s) => s.id === prev.id);
        const nextIndex = (currentIndex + 1) % hungTempleData.stations.length;
        const nextStation = hungTempleData.stations[nextIndex];
        return nextStation;
      });
    }, 4500);

    return () => {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    };
  }, [isTourPlaying, activeTab]);

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

  // Text-To-Speech for historical storytelling
  const speakStationText = (station: HungTempleStation, mode: DetailTab = activeDetailTab) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    let textToRead = `${station.name}. Độ cao ${station.altitude} mét. `;
    if (mode === 'CORE') {
      textToRead += station.highlight;
    } else if (mode === 'LEGEND') {
      textToRead += station.legend;
    } else if (mode === 'ARCHITECTURE') {
      textToRead += station.architecture;
    } else if (mode === 'FUN_FACT') {
      textToRead += station.funFact;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) utterance.voice = viVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handlePrevStation = () => {
    const currentIndex = hungTempleData.stations.findIndex((s) => s.id === selectedStation.id);
    const prevIndex = (currentIndex - 1 + hungTempleData.stations.length) % hungTempleData.stations.length;
    setSelectedStation(hungTempleData.stations[prevIndex]);
  };

  const handleNextStation = () => {
    const currentIndex = hungTempleData.stations.findIndex((s) => s.id === selectedStation.id);
    const nextIndex = (currentIndex + 1) % hungTempleData.stations.length;
    setSelectedStation(hungTempleData.stations[nextIndex]);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(2.5, +(prev + 0.35).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(1, +(prev - 0.35).toFixed(2));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Drag to pan when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
              onClick={() => setActiveTab('DIORAMA')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'DIORAMA'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>🖼️ Ảnh tham khảo</span>
            </button>
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
        {/* TAB 1: SA BÀN TOÀN CẢNH ĐỀN HÙNG (IMAGE DIORAMA WITH INTERACTIVE HOTSPOTS) */}
        {activeTab === 'DIORAMA' && (
          <div className="flex-1 flex flex-col bg-slate-950 p-2 sm:p-4 gap-4">
            {/* Diorama Canvas Viewport */}
            <div
              ref={dioramaViewportRef}
              className="relative w-full aspect-[16/9] max-h-[72vh] rounded-2xl overflow-hidden bg-slate-950 border border-amber-900/50 shadow-2xl select-none group"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              {/* Zoom & Pan Container */}
              <div
                className="w-full h-full relative transition-transform duration-200 ease-out origin-center"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                }}
              >
                {/* User's 2.5D Illustrated Panoramic Artwork */}
                <img
                  src="/images/models/den-hung-panoramic-diorama.jpg"
                  alt="Sa bàn toàn cảnh Đền Hùng núi Nghĩa Lĩnh"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />

                {/* Interactive Station Hotspots positioned precisely on temples */}
                {hungTempleData.stations.map((station) => {
                  const isSelected = selectedStation?.id === station.id;
                  return (
                    <div
                      key={station.id}
                      style={{
                        left: `${station.xPercent}%`,
                        top: `${station.yPercent}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute group/pin z-20"
                    >
                      {/* Pulse Ring when selected */}
                      {isSelected && (
                        <span className="absolute -inset-3.5 rounded-full bg-amber-400/50 animate-ping pointer-events-none" />
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStation(station);
                          setIsTourPlaying(false);
                          setIsDetailCollapsed(false);
                        }}
                        className={`relative flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all duration-300 shadow-xl border ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-white scale-110 ring-4 ring-amber-400/50 font-black shadow-amber-500/50'
                            : 'bg-slate-900/90 hover:bg-slate-800 text-white border-amber-400/70 hover:scale-105'
                        }`}
                        title={`${station.name} (${station.altitude}m)`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected
                              ? 'bg-slate-950 text-amber-300'
                              : 'bg-gradient-to-tr from-amber-500 to-red-500 text-white'
                          }`}
                        >
                          {station.badgeNumber}
                        </span>
                        <span className="text-[11px] font-extrabold whitespace-nowrap drop-shadow-sm">
                          {station.name.split('(')[0].trim()}
                        </span>
                      </button>

                      {/* Tooltip on hover */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pin:flex flex-col items-center z-30">
                        <div className="bg-slate-950/95 text-slate-200 text-[11px] rounded-xl px-2.5 py-1.5 whitespace-nowrap border border-amber-500/50 shadow-2xl backdrop-blur-md">
                          <p className="font-bold text-amber-300">{station.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Độ cao: {station.altitude}m • {station.steps}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-slate-950 rotate-45 -mt-1 border-r border-b border-amber-500/50" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Top-Left Banner on Diorama Canvas */}
              <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
                <div className="bg-gradient-to-r from-amber-950/90 to-red-950/90 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-amber-600/50 shadow-xl flex items-center gap-2.5">
                  <div className="text-xl">🌸</div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-black text-amber-200 tracking-wide">
                      Khu di tích lịch sử ĐỀN HÙNG
                    </h2>
                    <p className="text-[10px] text-amber-300/80 font-bold">
                      (Núi Nghĩa Lĩnh - Phú Thọ)
                    </p>
                  </div>
                  <div className="text-xl">🌸</div>
                </div>
              </div>

              {/* Top-Right Info & Fullscreen Buttons */}
              <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailCollapsed(!isDetailCollapsed)}
                  className="px-3 py-1.5 rounded-xl bg-amber-900/90 hover:bg-amber-800/90 text-amber-200 border border-amber-500/50 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 shadow-lg transition"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{isDetailCollapsed ? 'Mở bài học' : 'Ẩn bài học'}</span>
                </button>
              </div>

              {/* Bottom On-Canvas Controls matching the artwork */}
              <div className="absolute bottom-3 inset-x-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                {/* Button: Xoay 360° -> switches to 3D View */}
                <div className="pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('3D_VIEW')}
                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-black flex items-center gap-2 shadow-xl border border-blue-400/50 transition transform hover:scale-105"
                  >
                    <Compass className="h-4 w-4 animate-spin-slow" />
                    <span>Xoay 360°</span>
                  </button>
                </div>

                {/* Center Controls: Phóng to / Thu nhỏ & Tham quan tự động */}
                <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
                  {/* Zoom In */}
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    title="Phóng to sa bàn"
                    disabled={zoomLevel >= 2.5}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 disabled:opacity-40 transition"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] font-bold text-slate-300 min-w-[36px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  {/* Zoom Out */}
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    title="Thu nhỏ sa bàn"
                    disabled={zoomLevel <= 1}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 disabled:opacity-40 transition"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  {zoomLevel > 1 && (
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      title="Đặt lại góc nhìn chuẩn"
                      className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition"
                    >
                      Đặt lại
                    </button>
                  )}

                  <div className="h-4 w-px bg-slate-700 mx-0.5" />

                  {/* Auto-tour button */}
                  <button
                    type="button"
                    onClick={() => setIsTourPlaying(!isTourPlaying)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md ${
                      isTourPlaying
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white'
                    }`}
                  >
                    {isTourPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    <span>{isTourPlaying ? 'Tạm dừng tour' : 'Tham quan tự động'}</span>
                  </button>
                </div>

                {/* Right button: Ý nghĩa note card */}
                <div className="pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => setShowMeaningModal(!showMeaningModal)}
                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-900/90 to-red-950/90 hover:from-amber-800 hover:to-red-900 text-amber-200 border border-amber-600/60 backdrop-blur-md text-xs font-black flex items-center gap-1.5 shadow-xl transition transform hover:scale-105"
                  >
                    <span>📜 Ý nghĩa</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Meaning Note Card Modal */}
              {showMeaningModal && (
                <div className="absolute inset-x-4 bottom-16 sm:bottom-14 max-w-lg mx-auto z-40 bg-gradient-to-br from-amber-950/95 via-slate-950/95 to-red-950/95 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-600/40">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      🌸 Ý nghĩa Lịch sử & Tâm linh Đền Hùng
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMeaningModal(false)}
                      className="text-amber-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-lg bg-amber-950/80 border border-amber-700/60"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100 font-semibold leading-relaxed">
                    “Đền Hùng là nơi thờ các vua Hùng, biểu tượng của cội nguồn dân tộc Việt Nam. Nơi đây nhắc nhở muôn đời con cháu về truyền thống uống nước nhớ nguồn và tinh thần đại đoàn kết dân tộc.”
                  </p>
                </div>
              )}
            </div>

            {/* Elevation & Step Route Bar */}
            <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <MapPin className="h-3.5 w-3.5" />
                  Độ cao hiện tại: {selectedStation.altitude} mét ({selectedStation.name.split('(')[0].trim()})
                </span>
                <span>Đỉnh Kính Thiên: 175 mét (Cao nhất)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(8, (selectedStation.altitude / 175) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center px-1">
                {hungTempleData.stations.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStation(s);
                      setIsTourPlaying(false);
                      setIsDetailCollapsed(false);
                    }}
                    className={`text-[10px] sm:text-xs font-bold transition flex items-center gap-1 ${
                      selectedStation?.id === s.id
                        ? 'text-amber-300 scale-110 font-black'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="hidden md:inline">{s.name.split('(')[0].trim()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pedagogical Station Detail Panel (Non-intrusive, collapsable) */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300 shadow-xl">
              {/* Header Bar of Detail Card */}
              <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                    {selectedStation.badgeNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        {selectedStation.theme}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • Độ cao: <strong className="text-amber-300">{selectedStation.altitude}m</strong>
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        • Bậc đá: <strong className="text-emerald-300">{selectedStation.steps}</strong>
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {selectedStation.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* TTS Voice Narrator */}
                  <button
                    type="button"
                    onClick={() => speakStationText(selectedStation, activeDetailTab)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                      isSpeaking
                        ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    <span>{isSpeaking ? 'Dừng đọc' : 'Nghe thuyết minh'}</span>
                  </button>

                  {/* Previous / Next Station */}
                  <button
                    type="button"
                    onClick={handlePrevStation}
                    title="Điểm trước"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStation}
                    title="Điểm kế tiếp"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Collapse / Expand Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsDetailCollapsed(!isDetailCollapsed)}
                    title={isDetailCollapsed ? 'Mở rộng bảng bài học' : 'Thu nhỏ bảng bài học'}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    {isDetailCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Body with 4 Pedagogical Tabs */}
              {!isDetailCollapsed && (
                <div className="p-4 sm:p-6 space-y-4">
                  {/* 4 Tabs: Kiến thức cốt lõi, Truyền thuyết, Kiến trúc/Ghi nhớ, Em có biết? */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('CORE')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        activeDetailTab === 'CORE'
                          ? 'bg-amber-600 text-white font-black shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>🌟 Kiến thức cốt lõi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('LEGEND')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        activeDetailTab === 'LEGEND'
                          ? 'bg-amber-600 text-white font-black shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>📜 Truyền thuyết</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('ARCHITECTURE')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        activeDetailTab === 'ARCHITECTURE'
                          ? 'bg-amber-600 text-white font-black shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>🏛️ Kiến trúc & Ghi nhớ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('FUN_FACT')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        activeDetailTab === 'FUN_FACT'
                          ? 'bg-emerald-600 text-white font-black shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>💡 Em có biết?</span>
                    </button>
                  </div>

                  {/* Tab Content Box */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800 min-h-[100px] flex flex-col justify-center">
                    {activeDetailTab === 'CORE' && (
                      <div className="space-y-2">
                        <p className="text-sm sm:text-base text-amber-100 font-semibold leading-relaxed">
                          {selectedStation.highlight}
                        </p>
                        <p className="text-xs text-slate-400">
                          {selectedStation.subtitle}
                        </p>
                      </div>
                    )}

                    {activeDetailTab === 'LEGEND' && (
                      <div className="space-y-2">
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                          {selectedStation.legend}
                        </p>
                      </div>
                    )}

                    {activeDetailTab === 'ARCHITECTURE' && (
                      <div className="space-y-2">
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                          {selectedStation.architecture}
                        </p>
                        {selectedStation.historicalQuote && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-950/50 border border-amber-700/50 text-xs font-bold text-amber-300 italic">
                            {selectedStation.historicalQuote}
                          </div>
                        )}
                      </div>
                    )}

                    {activeDetailTab === 'FUN_FACT' && (
                      <div className="space-y-2">
                        <p className="text-sm sm:text-base text-emerald-200 leading-relaxed">
                          {selectedStation.funFact}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
