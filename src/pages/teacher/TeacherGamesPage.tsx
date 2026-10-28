import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherData } from '../../context/TeacherDataContext';
import { MillionaireGame } from '../../components/games/MillionaireGame';
import { MemoryMatchGame } from '../../components/games/MemoryMatchGame';
import { DragDropGame } from '../../components/games/DragDropGame';
import { ObstacleRaceGame } from '../../components/games/ObstacleRaceGame';
import { CrosswordGame } from '../../components/games/CrosswordGame';
import { RandomWheelGame } from '../../components/games/RandomWheelGame';
import { MysteryDoorGame } from '../../components/games/MysteryDoorGame';
import { KnowledgeBoxGame } from '../../components/games/KnowledgeBoxGame';
import {
  adaptQuizQuestionsToGameItems,
  SAMPLE_MILLIONAIRE_QUESTIONS,
  SAMPLE_MEMORY_PAIRS,
  SAMPLE_DRAG_DROP_CATEGORIES,
  SAMPLE_CROSSWORD_DATA,
} from '../../components/games/classroomGamesData';
import { setSoundMuted, getSoundMuted } from '../../utils/audio';
import type { MockParticipant, MysteryDoorItem, KnowledgeBoxItem } from '../../services/realtime/types';
import {
  Gamepad2,
  Sparkles,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  ArrowLeft,
  BookOpen,
  Users,
  CheckCircle2,
} from 'lucide-react';

export const TeacherGamesPage: React.FC = () => {
  const { gameId } = useParams<{ gameId?: string }>();
  const navigate = useNavigate();
  const { classes, quizzes } = useTeacherData();

  // Selected Class & Quiz to feed game data
  const [selectedClassId, setSelectedClassId] = useState<string>(() => classes[0]?.id || '');
  const [selectedQuizId, setSelectedQuizId] = useState<string>(() => quizzes[0]?.id || '');
  const [activeGame, setActiveGame] = useState<string | null>(gameId || null);
  const [isMuted, setIsMuted] = useState<boolean>(() => getSoundMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Synchronize route param with active game
  useEffect(() => {
    if (gameId) {
      setActiveGame(gameId);
    }
  }, [gameId]);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0];

  // Convert quiz questions to game format
  const gameQuestions = useMemo(() => {
    if (selectedQuiz && selectedQuiz.questions && selectedQuiz.questions.length > 0) {
      return adaptQuizQuestionsToGameItems(selectedQuiz.questions);
    }
    return SAMPLE_MILLIONAIRE_QUESTIONS;
  }, [selectedQuiz]);

  // Convert quiz questions to memory pairs
  const memoryPairs = useMemo(() => {
    if (selectedQuiz && selectedQuiz.questions && selectedQuiz.questions.length >= 4) {
      return selectedQuiz.questions.slice(0, 8).map((q, idx) => ({
        id: `mp-${idx}`,
        front: q.content.length > 40 ? q.content.slice(0, 37) + '...' : q.content,
        back: q.correctAnswer,
      }));
    }
    return SAMPLE_MEMORY_PAIRS;
  }, [selectedQuiz]);

  // Convert class students to MockParticipant for Wheel
  const wheelParticipants: MockParticipant[] = useMemo(() => {
    const now = new Date().toISOString();
    if (selectedClass && selectedClass.students.length > 0) {
      return selectedClass.students.map((st) => ({
        studentId: st.id,
        name: st.name,
        sessionToken: `token-${st.id}`,
        joinedAt: now,
        lastSeenAt: now,
      }));
    }
    return [
      { studentId: '1', name: 'Nguyễn Văn An', sessionToken: 't1', joinedAt: now, lastSeenAt: now },
      { studentId: '2', name: 'Trần Thị Bình', sessionToken: 't2', joinedAt: now, lastSeenAt: now },
      { studentId: '3', name: 'Lê Hoàng Cúc', sessionToken: 't3', joinedAt: now, lastSeenAt: now },
      { studentId: '4', name: 'Phạm Đức Dũng', sessionToken: 't4', joinedAt: now, lastSeenAt: now },
      { studentId: '5', name: 'Hoàng Minh Em', sessionToken: 't5', joinedAt: now, lastSeenAt: now },
      { studentId: '6', name: 'Đỗ Thùy Giang', sessionToken: 't6', joinedAt: now, lastSeenAt: now },
    ];
  }, [selectedClass]);

  // Mystery doors state for Mystery Door game
  const [mysteryDoors, setMysteryDoors] = useState<MysteryDoorItem[]>([
    { id: 1, questionId: 'q1', isOpened: false },
    { id: 2, questionId: 'q2', isOpened: false },
    { id: 3, questionId: 'q3', isOpened: false },
    { id: 4, questionId: 'q4', isOpened: false },
    { id: 5, questionId: 'q5', isOpened: false },
    { id: 6, questionId: 'q6', isOpened: false },
  ]);

  // Knowledge boxes state for Knowledge Box game
  const [knowledgeBoxes, setKnowledgeBoxes] = useState<KnowledgeBoxItem[]>([
    { id: 1, type: 'QUESTION', title: 'Câu hỏi tư duy', questionId: 'q1', isOpened: false },
    { id: 2, type: 'SPECIAL_ACTION', title: 'Lời khen ngợi', specialActionText: 'Tuyên dương học sinh chăm chú nhất lớp!', isOpened: false },
    { id: 3, type: 'SPECIAL_ACTION', title: 'Thử thách vui', specialActionText: 'Hát một bài hát hoặc đọc một bài thơ tặng thầy cô!', isOpened: false },
    { id: 4, type: 'BONUS_POINTS', title: 'Điểm thưởng may mắn', bonusPoints: 10, isOpened: false },
    { id: 5, type: 'SPECIAL_ACTION', title: 'Ngôi sao lớp học', specialActionText: 'Cộng 1 điểm rèn luyện tích cực cho bạn được chọn!', isOpened: false },
    { id: 6, type: 'SPECIAL_ACTION', title: 'Cùng đồng đội', specialActionText: 'Rủ bạn cùng bàn trả lời câu hỏi tiếp theo!', isOpened: false },
  ]);

  // Audio Toggle
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleLaunchGame = (id: string) => {
    setActiveGame(id);
    navigate(`/teacher/games/${id}`);
  };

  const handleExitGame = () => {
    setActiveGame(null);
    navigate('/teacher/games');
  };

  const gamesCatalog = [
    {
      id: 'millionaire',
      title: 'Rung Chuông Vàng / Ai Là Triệu Phú',
      desc: '15 câu hỏi leo thang kịch tính, 3 quyền trợ giúp lớp học (50:50, hỏi cả lớp, nhờ bạn), bậc thang điểm thưởng.',
      icon: '🔔',
      badge: 'YÊU THÍCH NHẤT',
      badgeColor: 'bg-amber-400 text-slate-950',
      themeColor: 'border-amber-300 hover:border-amber-500 bg-gradient-to-br from-amber-50 via-orange-50 to-white',
      textColor: 'text-amber-950',
    },
    {
      id: 'memory',
      title: 'Lật Thẻ Tìm Cặp (Memory Match)',
      desc: 'Lật tìm các cặp thông tin tương ứng (Từ vựng - Nghĩa, Phép tính - Kết quả, Mốc năm - Sự kiện lịch sử).',
      icon: '🃏',
      badge: 'RÈN TRÍ NHỚ',
      badgeColor: 'bg-emerald-500 text-white',
      themeColor: 'border-emerald-300 hover:border-emerald-500 bg-gradient-to-br from-emerald-50 via-teal-50 to-white',
      textColor: 'text-emerald-950',
    },
    {
      id: 'drag-drop',
      title: 'Ghép Nối & Phân Loại (Drag & Drop)',
      desc: 'Phân loại các thẻ nội dung vào đúng các nhóm/cột chủ đề tương ứng hoặc ghép nối cột A với cột B.',
      icon: '🧩',
      badge: 'TƯ DUY NHÓM',
      badgeColor: 'bg-blue-500 text-white',
      themeColor: 'border-blue-300 hover:border-blue-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-white',
      textColor: 'text-blue-950',
    },
    {
      id: 'obstacle',
      title: 'Vượt Chướng Ngại Vật: Giải Cứu Con Tàu',
      desc: 'Vượt qua 6 trạm thiên thạch, bão từ trường và lỗ đen vũ trụ để mở khóa nhiên liệu và giải cứu con tàu về đích.',
      icon: '🚀',
      badge: 'HÀNH ĐỘNG',
      badgeColor: 'bg-rose-500 text-white',
      themeColor: 'border-rose-300 hover:border-rose-500 bg-gradient-to-br from-rose-50 via-pink-50 to-white',
      textColor: 'text-rose-950',
    },
    {
      id: 'crossword',
      title: 'Đố Chữ / Ô Chữ Tương Tác (Crossword)',
      desc: 'Bảng ô chữ tiếng Việt với các hàng ngang gợi ý kiến thức và giải mã Từ Khóa Vàng bí mật của toàn tiết học.',
      icon: '🔠',
      badge: 'Ô CHỮ BÍ MẬT',
      badgeColor: 'bg-purple-500 text-white',
      themeColor: 'border-purple-300 hover:border-purple-500 bg-gradient-to-br from-purple-50 via-violet-50 to-white',
      textColor: 'text-purple-950',
    },
    {
      id: 'wheel',
      title: 'Vòng Quay Gọi Học Sinh (Lucky Wheel)',
      desc: 'Quay ngẫu nhiên tên học sinh trong lớp phát biểu, có cơ chế công bằng ưu tiên các em chưa được gọi.',
      icon: '🎯',
      badge: 'CÔNG CỤ GỌI TÊN',
      badgeColor: 'bg-amber-500 text-slate-950',
      themeColor: 'border-amber-200 hover:border-amber-400 bg-gradient-to-br from-amber-50/50 to-white',
      textColor: 'text-slate-900',
    },
    {
      id: 'mystery-door',
      title: 'Ô Cửa Bí Mật (Mystery Door)',
      desc: 'Mở từng cánh cửa số 1 - 6 để giải các câu hỏi bí mật bất ngờ đằng sau.',
      icon: '🚪',
      badge: 'KHỞI ĐỘNG',
      badgeColor: 'bg-sky-500 text-white',
      themeColor: 'border-sky-200 hover:border-sky-400 bg-gradient-to-br from-sky-50/50 to-white',
      textColor: 'text-slate-900',
    },
    {
      id: 'knowledge-box',
      title: 'Hộp Quà Kiến Thức (Knowledge Box)',
      desc: 'Mở các hộp quà may mắn nhận câu hỏi, lời khen ngợi hoặc thử thách tương tác vui nhộn.',
      icon: '🎁',
      badge: 'QUÀ BẤT NGỜ',
      badgeColor: 'bg-fuchsia-500 text-white',
      themeColor: 'border-fuchsia-200 hover:border-fuchsia-400 bg-gradient-to-br from-fuchsia-50/50 to-white',
      textColor: 'text-slate-900',
    },
  ];

  // Render active game
  if (activeGame === 'millionaire') {
    return (
      <MillionaireGame
        questions={gameQuestions}
        students={selectedClass?.students || []}
        onExit={handleExitGame}
      />
    );
  }

  if (activeGame === 'memory') {
    return (
      <MemoryMatchGame
        customPairs={memoryPairs}
        onExit={handleExitGame}
      />
    );
  }

  if (activeGame === 'drag-drop') {
    return (
      <DragDropGame
        data={SAMPLE_DRAG_DROP_CATEGORIES}
        onExit={handleExitGame}
      />
    );
  }

  if (activeGame === 'obstacle') {
    return (
      <ObstacleRaceGame
        questions={gameQuestions}
        onExit={handleExitGame}
      />
    );
  }

  if (activeGame === 'crossword') {
    return (
      <CrosswordGame
        data={SAMPLE_CROSSWORD_DATA}
        onExit={handleExitGame}
      />
    );
  }

  if (activeGame === 'wheel') {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            type="button"
            onClick={handleExitGame}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách game
          </button>
          <span className="text-amber-400 font-black text-sm">
            Lớp: {selectedClass?.name || 'Tất cả'} ({wheelParticipants.length} học sinh)
          </span>
        </div>
        <RandomWheelGame
          participants={wheelParticipants}
          calledStudentIds={[]}
          onSpinFinish={() => {}}
          onAwardOralScore={async () => {}}
          onCloseGame={handleExitGame}
        />
      </div>
    );
  }

  if (activeGame === 'mystery-door') {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            type="button"
            onClick={handleExitGame}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách game
          </button>
        </div>
        <MysteryDoorGame
          doors={mysteryDoors}
          liveQuestions={{}}
          onOpenDoor={(doorId) => {
            setMysteryDoors((prev) =>
              prev.map((d) => (d.id === doorId ? { ...d, isOpen: true } : d))
            );
          }}
          onCloseQuestion={() => {}}
          onShowResult={() => {}}
          onCloseGame={handleExitGame}
        />
      </div>
    );
  }

  if (activeGame === 'knowledge-box') {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            type="button"
            onClick={handleExitGame}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách game
          </button>
        </div>
        <KnowledgeBoxGame
          boxes={knowledgeBoxes}
          liveQuestions={{}}
          onOpenBox={(boxId) => {
            setKnowledgeBoxes((prev) =>
              prev.map((b) => (b.id === boxId ? { ...b, isOpened: true } : b))
            );
          }}
          onCloseQuestion={() => {}}
          onShowResult={() => {}}
          onCloseGame={handleExitGame}
        />
      </div>
    );
  }

  // Games Hub Main Selection View
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner / Spotlight */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-xl border-2 border-amber-300 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/20 text-slate-950 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> TRÌNH CHIẾU MÀN HÌNH LỚN / MÁY CHIẾU LỚP HỌC
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            KHO TRÒ CHƠI TƯƠNG TÁC LỚP HỌC 🎮
          </h1>
          <p className="text-sm sm:text-base font-semibold text-amber-950/90 leading-relaxed">
            Giáo viên điều khiển trên màn hình máy chiếu hoặc Smart TV — học sinh trong lớp trả lời miệng, giơ tay hoặc thảo luận nhóm sôi nổi, không cần thiết bị cá nhân!
          </p>
        </div>

        {/* Global Control Bar inside banner */}
        <div className="mt-6 pt-5 border-t border-slate-950/15 flex flex-wrap items-center justify-between gap-4 relative z-10">
          {/* Pick Class & Quiz */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3.5 py-2 rounded-2xl border border-amber-300 text-xs font-bold shadow-xs">
              <Users className="w-4 h-4 text-slate-700 shrink-0" />
              <label htmlFor="select-class-game" className="text-slate-600">Lớp:</label>
              <select
                id="select-class-game"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.students.length} HS)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3.5 py-2 rounded-2xl border border-amber-300 text-xs font-bold shadow-xs">
              <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
              <label htmlFor="select-quiz-game" className="text-slate-600">Bộ đề:</label>
              <select
                id="select-quiz-game"
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer max-w-xs truncate"
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.questions.length} câu)
                  </option>
                ))}
                <option value="sample">Bộ câu hỏi kiến thức mẫu (Mặc định)</option>
              </select>
            </div>
          </div>

          {/* Audio & Fullscreen Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              className="px-3.5 py-2 rounded-2xl bg-white/90 hover:bg-white text-slate-900 font-bold text-xs border border-amber-300 flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Bật / Tắt âm thanh hiệu ứng"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
              <span>{isMuted ? 'Đang tắt âm' : 'Âm thanh bật'}</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3.5 py-2 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs border border-amber-300 flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Bật / Thoát toàn màn hình để chiếu máy chiếu"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-300" /> : <Maximize2 className="w-4 h-4 text-amber-300" />}
              <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <Gamepad2 className="w-5 h-5 text-amber-600" /> DANH SÁCH CÁC TRÒ CHƠI LỚP HỌC ({gamesCatalog.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Chọn bất kỳ trò chơi nào để bắt đầu trình chiếu ngay
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gamesCatalog.map((game) => (
            <div
              key={game.id}
              className={`rounded-3xl border-2 p-6 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 ${game.themeColor}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{game.icon}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${game.badgeColor}`}>
                    {game.badge}
                  </span>
                </div>

                <h3 className={`text-xl font-black ${game.textColor} leading-snug`}>
                  {game.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {game.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sẵn sàng chiếu
                </span>

                <button
                  type="button"
                  onClick={() => handleLaunchGame(game.id)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs shadow-md shadow-slate-950/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white text-white" /> BẮT ĐẦU CHƠI
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
