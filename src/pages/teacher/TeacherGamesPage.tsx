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
import { GRADE_4_MATH_QR_BANKS } from '../../data/qr/grade4MathQrBanks';
import { GRADE_4_HISTORY_GEO_QR_BANKS } from '../../data/qr/grade4HistoryGeoQrBanks';
import {
  adaptQuizQuestionsToGameItems,
  adaptToMemoryPairs,
  adaptToDragDropData,
  adaptToCrosswordData,
  resolveCorrectAnswerText,
  SAMPLE_MILLIONAIRE_QUESTIONS,
  SAMPLE_MEMORY_PAIRS,
  SAMPLE_DRAG_DROP_CATEGORIES,
  SAMPLE_CROSSWORD_DATA,
} from '../../components/games/classroomGamesData';
import { setSoundMuted, getSoundMuted } from '../../utils/audio';
import type { MockParticipant } from '../../services/realtime/types';
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
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  X,
  Layers,
  Sparkle,
} from 'lucide-react';

export const TeacherGamesPage: React.FC = () => {
  const { gameId } = useParams<{ gameId?: string }>();
  const navigate = useNavigate();
  const { classes, quizzes } = useTeacherData();

  // Selected Class
  const [selectedClassId, setSelectedClassId] = useState<string>(() => classes[0]?.id || '');
  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Bank Source Type: 'math4' | 'histgeo4' | 'quizzes' | 'sample'
  const [bankSource, setBankSource] = useState<'math4' | 'histgeo4' | 'quizzes' | 'sample'>('math4');
  const [selectedBankId, setSelectedBankId] = useState<string>(() => GRADE_4_MATH_QR_BANKS[0]?.id || '');

  // Teacher custom working questions (allows editing questions so they fit the game perfectly)
  const [workingQuestions, setWorkingQuestions] = useState<any[]>([]);
  const [activeBankTitle, setActiveBankTitle] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [tempQuestions, setTempQuestions] = useState<any[]>([]);

  const [activeGame, setActiveGame] = useState<string | null>(gameId || null);
  const [isMuted, setIsMuted] = useState<boolean>(() => getSoundMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Synchronize route param with active game
  useEffect(() => {
    if (gameId) {
      setActiveGame(gameId);
    }
  }, [gameId]);

  // Load questions when source or bankId changes
  useEffect(() => {
    let rawQuestions: any[] = [];
    let title = '';

    if (bankSource === 'math4') {
      const found = GRADE_4_MATH_QR_BANKS.find((b) => b.id === selectedBankId) || GRADE_4_MATH_QR_BANKS[0];
      if (found) {
        rawQuestions = found.questions;
        title = found.title;
      }
    } else if (bankSource === 'histgeo4') {
      const found = GRADE_4_HISTORY_GEO_QR_BANKS.find((b) => b.id === selectedBankId) || GRADE_4_HISTORY_GEO_QR_BANKS[0];
      if (found) {
        rawQuestions = found.questions;
        title = found.title;
      }
    } else if (bankSource === 'quizzes') {
      const found = quizzes.find((q) => q.id === selectedBankId) || quizzes[0];
      if (found) {
        rawQuestions = found.questions;
        title = found.title;
      }
    } else {
      rawQuestions = SAMPLE_MILLIONAIRE_QUESTIONS;
      title = 'Bộ câu hỏi kiến thức mẫu';
    }

    setWorkingQuestions(rawQuestions);
    setActiveBankTitle(title);
  }, [bankSource, selectedBankId, quizzes]);

  // Ensure selectedBankId is valid when bankSource changes
  const handleSelectSource = (src: 'math4' | 'histgeo4' | 'quizzes' | 'sample') => {
    setBankSource(src);
    if (src === 'math4') {
      setSelectedBankId(GRADE_4_MATH_QR_BANKS[0]?.id || '');
    } else if (src === 'histgeo4') {
      setSelectedBankId(GRADE_4_HISTORY_GEO_QR_BANKS[0]?.id || '');
    } else if (src === 'quizzes') {
      setSelectedBankId(quizzes[0]?.id || 'sample');
    } else {
      setSelectedBankId('sample');
    }
  };

  // Convert current working questions to Game formats
  const gameQuestions = useMemo(() => {
    if (workingQuestions && workingQuestions.length > 0) {
      return adaptQuizQuestionsToGameItems(workingQuestions);
    }
    return SAMPLE_MILLIONAIRE_QUESTIONS;
  }, [workingQuestions]);

  const memoryPairs = useMemo(() => {
    if (workingQuestions && workingQuestions.length > 0) {
      return adaptToMemoryPairs(workingQuestions, activeBankTitle);
    }
    return SAMPLE_MEMORY_PAIRS;
  }, [workingQuestions, activeBankTitle]);

  const dragDropData = useMemo(() => {
    if (workingQuestions && workingQuestions.length > 0) {
      return adaptToDragDropData(workingQuestions, activeBankTitle);
    }
    return SAMPLE_DRAG_DROP_CATEGORIES;
  }, [workingQuestions, activeBankTitle]);

  const crosswordData = useMemo(() => {
    if (workingQuestions && workingQuestions.length > 0) {
      return adaptToCrosswordData(workingQuestions, activeBankTitle);
    }
    return SAMPLE_CROSSWORD_DATA;
  }, [workingQuestions, activeBankTitle]);

  // Mystery Door & Knowledge Box states
  const [openedDoors, setOpenedDoors] = useState<Record<number, boolean>>({});
  const [openedBoxes, setOpenedBoxes] = useState<Record<number, boolean>>({});

  const liveQuestionsMap = useMemo(() => {
    const map: Record<string, any> = {};
    gameQuestions.slice(0, 6).forEach((q, idx) => {
      const qId = `live-q-${idx + 1}`;
      map[qId] = {
        id: qId,
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        status: 'RESULT',
      };
    });
    return map;
  }, [gameQuestions]);

  const mysteryDoors = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map((num) => ({
      id: num,
      questionId: `live-q-${num}`,
      isOpened: !!openedDoors[num],
    }));
  }, [openedDoors]);

  const knowledgeBoxes = useMemo(() => {
    const types: Array<'QUESTION' | 'SPECIAL_ACTION' | 'BONUS_POINTS'> = [
      'QUESTION',
      'SPECIAL_ACTION',
      'QUESTION',
      'BONUS_POINTS',
      'QUESTION',
      'SPECIAL_ACTION',
    ];
    return [1, 2, 3, 4, 5, 6].map((num, idx) => ({
      id: num,
      type: types[idx] || 'QUESTION',
      title:
        types[idx] === 'QUESTION'
          ? `Câu hỏi số ${num}`
          : types[idx] === 'BONUS_POINTS'
          ? 'Lời khen ngợi'
          : 'Thử thách vui',
      questionId: types[idx] === 'QUESTION' ? `live-q-${num}` : undefined,
      specialActionText:
        types[idx] === 'SPECIAL_ACTION'
          ? 'Cả lớp cùng vỗ tay tuyên dương bạn xung phong trả lời!'
          : undefined,
      bonusPoints: types[idx] === 'BONUS_POINTS' ? 10 : undefined,
      isOpened: !!openedBoxes[num],
    }));
  }, [openedBoxes]);

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

  // Edit Questions Modal Handlers
  const handleOpenEditModal = () => {
    setTempQuestions(
      workingQuestions.map((q, idx) => ({
        id: q.id || `temp-q-${idx}`,
        content: q.content || '',
        options:
          Array.isArray(q.options) && q.options.length >= 2
            ? [...q.options]
            : [resolveCorrectAnswerText(q), 'Phương án B', 'Phương án C', 'Phương án D'],
        correctAnswer: resolveCorrectAnswerText(q) || (q.options ? q.options[0] : 'Phương án A'),
      }))
    );
    setIsEditModalOpen(true);
  };

  const handleSaveEditedQuestions = () => {
    setWorkingQuestions(tempQuestions);
    setIsEditModalOpen(false);
  };

  const handleResetToSourceBank = () => {
    let rawQuestions: any[] = [];
    if (bankSource === 'math4') {
      const found = GRADE_4_MATH_QR_BANKS.find((b) => b.id === selectedBankId);
      if (found) rawQuestions = found.questions;
    } else if (bankSource === 'histgeo4') {
      const found = GRADE_4_HISTORY_GEO_QR_BANKS.find((b) => b.id === selectedBankId);
      if (found) rawQuestions = found.questions;
    } else if (bankSource === 'quizzes') {
      const found = quizzes.find((q) => q.id === selectedBankId);
      if (found) rawQuestions = found.questions;
    } else {
      rawQuestions = SAMPLE_MILLIONAIRE_QUESTIONS;
    }
    setWorkingQuestions(rawQuestions);
    setIsEditModalOpen(false);
  };

  const handleAddNewQuestion = () => {
    setTempQuestions((prev) => [
      ...prev,
      {
        id: `custom-q-${Date.now()}`,
        content: 'Nội dung câu hỏi mới...',
        options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
        correctAnswer: 'Đáp án A',
      },
    ]);
  };

  const handleDeleteQuestion = (idx: number) => {
    setTempQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

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
      title: 'Đố Chữ / Ô chữ Tương Tác (Crossword)',
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
        data={dragDropData}
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
        data={crosswordData}
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
          <span className="text-sky-300 font-bold text-xs">
            Bài học: {activeBankTitle} ({gameQuestions.length} câu hỏi)
          </span>
        </div>
        <MysteryDoorGame
          doors={mysteryDoors}
          liveQuestions={liveQuestionsMap}
          onOpenDoor={(doorId) => {
            setOpenedDoors((prev) => ({ ...prev, [doorId]: true }));
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
          <span className="text-purple-300 font-bold text-xs">
            Bài học: {activeBankTitle}
          </span>
        </div>
        <KnowledgeBoxGame
          boxes={knowledgeBoxes}
          liveQuestions={liveQuestionsMap}
          onOpenBox={(boxId) => {
            setOpenedBoxes((prev) => ({ ...prev, [boxId]: true }));
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
            Lấy câu hỏi trực tiếp từ các bộ đề trên web (SGK Toán 4, Lịch sử & Địa lí 4, Đề của giáo viên) và tự động tương thích hóa cho từng trò chơi!
          </p>
        </div>

        {/* Global Control Bar inside banner */}
        <div className="mt-6 pt-5 border-t border-slate-950/15 flex flex-wrap items-center justify-between gap-4 relative z-10">
          {/* Controls: Class, Source, Lesson, & Customize */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pick Class */}
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-2xl border border-amber-300 text-xs font-bold shadow-xs">
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

            {/* Source Category Picker */}
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-2xl border border-amber-300 text-xs font-bold shadow-xs">
              <Layers className="w-4 h-4 text-indigo-700 shrink-0" />
              <label htmlFor="select-source-game" className="text-slate-600">Nguồn:</label>
              <select
                id="select-source-game"
                value={bankSource}
                onChange={(e) => handleSelectSource(e.target.value as any)}
                className="bg-transparent font-black text-indigo-950 focus:outline-none cursor-pointer"
              >
                <option value="math4">📚 SGK Toán 4 (73 bài)</option>
                <option value="histgeo4">🏛️ SGK Lịch sử & Địa lí 4 (27 bài)</option>
                <option value="quizzes">📝 Bộ đề của tôi ({quizzes.length})</option>
                <option value="sample">⭐ Bộ câu hỏi mẫu</option>
              </select>
            </div>

            {/* Specific Quiz/Lesson Picker */}
            {bankSource !== 'sample' && (
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-2xl border border-amber-300 text-xs font-bold shadow-xs">
                <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                <label htmlFor="select-quiz-game" className="text-slate-600">Bài:</label>
                <select
                  id="select-quiz-game"
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer max-w-[220px] truncate"
                >
                  {bankSource === 'math4' &&
                    GRADE_4_MATH_QR_BANKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.questions.length} câu)
                      </option>
                    ))}
                  {bankSource === 'histgeo4' &&
                    GRADE_4_HISTORY_GEO_QR_BANKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.questions.length} câu)
                      </option>
                    ))}
                  {bankSource === 'quizzes' &&
                    quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title} ({q.questions.length} câu)
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Quick Edit / Customize Button */}
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="px-3 py-2 rounded-2xl bg-indigo-950 hover:bg-indigo-900 text-amber-300 font-black text-xs border border-indigo-800 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              title="Xem và chỉnh sửa lại nội dung câu hỏi cho phù hợp nhất với trò chơi"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Sửa câu hỏi ({workingQuestions.length})</span>
            </button>
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

      {/* Selected Lesson Status Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border-2 border-indigo-900 flex flex-wrap items-center justify-between gap-3 text-white text-xs">
        <div className="flex items-center gap-2">
          <Sparkle className="w-4 h-4 text-amber-400" />
          <span>
            Đang áp dụng: <strong className="text-amber-300 text-sm font-black">{activeBankTitle}</strong> ({workingQuestions.length} câu hỏi sẵn sàng)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Tự động tương thích:</span>
          <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
            4 lựa chọn A,B,C,D
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-bold">
            Thẻ cặp
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-400/20 text-blue-300 border border-blue-400/30 font-bold">
            Phân loại Đúng/Sai
          </span>
          <span className="px-2 py-0.5 rounded-md bg-purple-400/20 text-purple-300 border border-purple-400/30 font-bold">
            Ô chữ
          </span>
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

      {/* Edit & Customize Questions Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
          <div className="bg-slate-900 border-2 border-indigo-700 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-white">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-indigo-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-amber-300 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  CHỈNH SỬA & TÙY BIẾN CÂU HỎI TRÒ CHƠI
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đang sửa nội dung bài: <span className="text-indigo-300 font-bold">{activeBankTitle}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List scrollable */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 rounded-2xl bg-indigo-950/70 border border-indigo-800 text-xs text-indigo-200">
                💡 <strong>Gợi ý:</strong> Thầy/Cô có thể rút gọn câu hỏi cho ngắn gọn, sửa các đáp án A, B, C, D hoặc thêm bớt câu hỏi để hiển thị to rõ nhất trên máy chiếu lớp học.
              </div>

              {tempQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-900 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-amber-400 uppercase">
                      Câu hỏi {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(idx)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>

                  {/* Question content */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Nội dung câu hỏi:
                    </label>
                    <textarea
                      rows={2}
                      value={q.content}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTempQuestions((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, content: val } : item))
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 4 Options & Correct Answer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                      const optVal = q.options[optIdx] || '';
                      const isCorrect = q.correctAnswer === optVal;

                      return (
                        <div
                          key={letter}
                          className={`p-2 rounded-xl border flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-emerald-950/80 border-emerald-400'
                              : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setTempQuestions((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, correctAnswer: optVal } : item
                                )
                              );
                            }}
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                            title="Chọn làm đáp án đúng"
                          >
                            {letter}
                          </button>
                          <input
                            type="text"
                            value={optVal}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempQuestions((prev) =>
                                prev.map((item, i) => {
                                  if (i !== idx) return item;
                                  const newOpts = [...item.options];
                                  newOpts[optIdx] = val;
                                  const newCorrect = isCorrect ? val : item.correctAnswer;
                                  return { ...item, options: newOpts, correctAnswer: newCorrect };
                                })
                              );
                            }}
                            className="bg-transparent flex-1 text-xs text-white focus:outline-none"
                            placeholder={`Phương án ${letter}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddNewQuestion}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-indigo-700 hover:border-amber-400 text-indigo-300 hover:text-amber-300 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Thêm câu hỏi mới vào bài
              </button>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-indigo-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetToSourceBank}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Khôi phục theo SGK gốc
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedQuestions}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm border border-emerald-300 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" /> LƯU & ÁP DỤNG CHO TRÒ CHƠI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
