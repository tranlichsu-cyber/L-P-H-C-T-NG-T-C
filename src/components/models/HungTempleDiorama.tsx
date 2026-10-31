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
  Sparkles,
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
} from 'lucide-react';
import {
  hungTempleData,
  type HungTempleStation,
} from '../../data/models/hungTempleData';
import { triggerConfetti } from '../../utils/confetti';
import { playCorrectSound } from '../../utils/audio';
import { unlockBadge } from '../../utils/modelBadges';

type ActiveTab = '3D_VIEW' | 'DIORAMA' | 'FESTIVAL' | 'QUIZ';

export const HungTempleDiorama: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('3D_VIEW');
  const [selectedStation, setSelectedStation] = useState<HungTempleStation | null>(
    hungTempleData.stations[0]
  );
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const tourTimerRef = useRef<number | null>(null);

  // Auto-tour step timer
  useEffect(() => {
    if (!isTourPlaying) {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
      return;
    }

    tourTimerRef.current = window.setInterval(() => {
      setSelectedStation((prev) => {
        if (!prev) return hungTempleData.stations[0];
        const currentIndex = hungTempleData.stations.findIndex((s) => s.id === prev.id);
        const nextIndex = (currentIndex + 1) % hungTempleData.stations.length;
        return hungTempleData.stations[nextIndex];
      });
    }, 4500);

    return () => {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    };
  }, [isTourPlaying]);

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
  const speakStationText = (station: HungTempleStation) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${station.name}. ${station.subtitle}. ${station.highlight} ${station.legend}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    // Pick a Vietnamese voice if available
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) utterance.voice = viVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handlePrevStation = () => {
    if (!selectedStation) return;
    const currentIndex = hungTempleData.stations.findIndex((s) => s.id === selectedStation.id);
    const prevIndex = (currentIndex - 1 + hungTempleData.stations.length) % hungTempleData.stations.length;
    setSelectedStation(hungTempleData.stations[prevIndex]);
  };

  const handleNextStation = () => {
    if (!selectedStation) return;
    const currentIndex = hungTempleData.stations.findIndex((s) => s.id === selectedStation.id);
    const nextIndex = (currentIndex + 1) % hungTempleData.stations.length;
    setSelectedStation(hungTempleData.stations[nextIndex]);
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
      <header className="bg-slate-950/90 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
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
              <span>Sa bàn 3D (360°)</span>
            </button>
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
              <span>Sơ đồ & Tư liệu</span>
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
              <span>Lễ Hội Mùng 10/3</span>
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
              <span>Thử Tài</span>
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
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình trình chiếu'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Areas */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* TAB 0: SA BÀN 3D WEBGL TƯƠNG TÁC XOAY 360 ĐỘ */}
        {activeTab === '3D_VIEW' && (
          <div className="relative flex-1 w-full min-h-[620px] sm:min-h-[700px] bg-slate-950 flex flex-col">
            <div className="absolute top-3 left-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-500/40 text-xs shadow-lg pointer-events-none">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-black text-amber-300">Sa bàn 3D tương tác:</span>
              <span className="text-slate-300 hidden sm:inline">Dùng chuột/tay kéo để xoay 360°, cuộn để phóng to, bấm vào đền để xem chi tiết</span>
            </div>

            <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
              <a
                href="/models/den-hung-3d.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg flex items-center gap-1.5 transition"
              >
                <span>Mở toàn màn hình 3D</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <iframe
              src="/models/den-hung-3d.html"
              title="Sa bàn 3D Đền Hùng WebGL"
              className="w-full flex-1 border-0 min-h-[620px] sm:min-h-[700px]"
              allow="fullscreen"
            />
          </div>
        )}
        {/* TAB 1: SA BÀN NÚI NGHĨA LĨNH */}
        {activeTab === 'DIORAMA' && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-[580px]">
            {/* Visual Diorama Landscape Canvas */}
            <div className="relative flex-1 bg-gradient-to-b from-sky-950 via-slate-900 to-emerald-950 p-4 sm:p-6 overflow-hidden flex flex-col justify-between select-none">
              {/* Background Atmospheric Visual Layers */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent" />
              
              {/* Stylized Mountain Profile SVG Backdrop */}
              <div className="absolute inset-x-0 bottom-0 top-12 pointer-events-none opacity-40">
                <svg
                  viewBox="0 0 1000 600"
                  className="w-full h-full object-fill preserve-3d"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="mountGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#064e3b" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Distant Mountain Ridges */}
                  <path
                    d="M 0 450 Q 200 300 450 380 T 1000 360 L 1000 600 L 0 600 Z"
                    fill="#0f3d32"
                    opacity="0.6"
                  />
                  {/* Mount Nghia Linh (Summit 175m at center-right) */}
                  <path
                    d="M 0 580 C 150 560 220 400 320 340 C 420 280 540 120 620 90 C 720 130 850 380 1000 540 L 1000 600 L 0 600 Z"
                    fill="url(#mountGrad)"
                  />
                  {/* Pilgrim Stone Path winding up the mountain */}
                  <path
                    d="M 120 500 Q 240 430 260 400 T 440 290 T 620 130 T 730 120 T 780 190 T 880 430"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    className="opacity-70 animate-pulse"
                  />
                  {/* Summit Clouds */}
                  <ellipse cx="620" cy="70" rx="140" ry="25" fill="url(#cloudGrad)" />
                  <ellipse cx="500" cy="110" rx="90" ry="18" fill="url(#cloudGrad)" />
                </svg>
              </div>

              {/* Top Banner inside Diorama */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl px-4 py-2 border border-slate-700/80 shadow-lg">
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Lộ trình hành hương Núi Nghĩa Lĩnh</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    Chân núi (15m) <span className="text-amber-400">⟶</span> Đỉnh Kính Thiên (175m)
                  </p>
                </div>

                {/* Tour Auto Play Controller */}
                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md rounded-2xl p-1.5 border border-slate-700/80 shadow-lg">
                  <button
                    type="button"
                    onClick={handlePrevStation}
                    title="Điểm trước"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTourPlaying(!isTourPlaying)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isTourPlaying
                        ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {isTourPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    <span>{isTourPlaying ? 'Tạm dừng' : 'Tự động dẫn đường'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStation}
                    title="Điểm tiếp theo"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Station Hotspots Placed on Mountain Canvas */}
              <div className="relative z-10 w-full h-[360px] sm:h-[420px] my-auto">
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
                      className="absolute group z-20"
                    >
                      {/* Pulse Ring when selected */}
                      {isSelected && (
                        <span className="absolute -inset-3 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStation(station);
                          setIsTourPlaying(false);
                        }}
                        className={`relative flex items-center gap-2 rounded-2xl px-2.5 py-1.5 transition-all duration-300 shadow-xl border ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-300 scale-110 ring-4 ring-amber-400/30 font-black'
                            : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700 hover:scale-105'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected
                              ? 'bg-slate-950 text-amber-400'
                              : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {station.badgeNumber}
                        </span>
                        <span className="text-xs font-bold whitespace-nowrap hidden sm:inline-block">
                          {station.name.split('(')[0]}
                        </span>
                      </button>

                      {/* Tooltip on hover */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30">
                        <div className="bg-slate-950/95 text-slate-200 text-[11px] rounded-xl px-2.5 py-1.5 whitespace-nowrap border border-slate-700 shadow-2xl">
                          <p className="font-bold text-amber-400">{station.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Độ cao: {station.altitude}m • {station.steps}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-slate-950 rotate-45 -mt-1 border-r border-b border-slate-700" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Elevation Progress Bar */}
              <div className="relative z-10 bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <MapPin className="h-3.5 w-3.5" />
                    Độ cao hiện tại: {selectedStation?.altitude} mét
                  </span>
                  <span>Đỉnh Nghĩa Lĩnh: 175 mét (Cao nhất)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(8, ((selectedStation?.altitude || 15) / 175) * 100)
                      )}%`,
                    }}
                  />
                </div>
                {/* Step indicators */}
                <div className="flex justify-between items-center px-1">
                  {hungTempleData.stations.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedStation(s);
                        setIsTourPlaying(false);
                      }}
                      className={`text-[10px] font-bold transition ${
                        selectedStation?.id === s.id
                          ? 'text-amber-400 scale-125'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Detail Panel for Selected Station */}
            {selectedStation && (
              <div className="w-full lg:w-[420px] bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 sm:p-6 flex flex-col justify-between shrink-0 overflow-y-auto">
                <div className="space-y-4">
                  {/* Station Badge & Elevation Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                          {selectedStation.badgeNumber}
                        </span>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          {selectedStation.theme}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-white leading-tight">
                        {selectedStation.name}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">
                        {selectedStation.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakStationText(selectedStation)}
                      title={isSpeaking ? 'Dừng đọc' : 'Nghe thuyết minh giọng đọc'}
                      className={`p-2.5 rounded-2xl border transition flex items-center gap-1.5 ${
                        isSpeaking
                          ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                          : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-700'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      <span className="text-xs font-bold hidden sm:inline">
                        {isSpeaking ? 'Dừng' : 'Nghe'}
                      </span>
                    </button>
                  </div>

                  {/* Station Location Info Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Độ cao vị trí:</span>
                      <strong className="text-amber-400 text-sm font-black">
                        {selectedStation.altitude}m
                      </strong>
                    </div>
                    <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Bậc đá hành hương:</span>
                      <strong className="text-emerald-400 text-xs font-bold truncate block">
                        {selectedStation.steps}
                      </strong>
                    </div>
                  </div>

                  {/* Station Visual Card / Image */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group">
                    <img
                      src={selectedStation.imageUrl}
                      alt={selectedStation.name}
                      className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-2 left-3 right-3 text-xs text-amber-200 font-semibold drop-shadow-md">
                      {selectedStation.highlight}
                    </div>
                  </div>

                  {/* Story & Legend Box */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      Sự tích & Lịch sử
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {selectedStation.legend}
                    </p>
                  </div>

                  {/* Historical Quote if any */}
                  {selectedStation.historicalQuote && (
                    <div className="bg-gradient-to-r from-red-950/60 to-amber-950/60 rounded-2xl p-3.5 border border-red-800/50">
                      <p className="text-xs font-black text-amber-300 leading-relaxed italic">
                        {selectedStation.historicalQuote}
                      </p>
                    </div>
                  )}

                  {/* Architecture & Fun Fact */}
                  <div className="bg-emerald-950/30 rounded-2xl p-3.5 border border-emerald-800/40 space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Em có biết?
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedStation.funFact}
                    </p>
                  </div>
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-800 mt-4">
                  <button
                    type="button"
                    onClick={handlePrevStation}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Điểm trước</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStation}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 border border-amber-400 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition"
                  >
                    <span>Điểm kế tiếp</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KHÔNG GIAN LỄ HỘI MÙNG 10 THÁNG 3 */}
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

        {/* TAB 3: THỬ TÀI HIỂU BIẾT (QUIZ CỦNG CỐ) */}
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
