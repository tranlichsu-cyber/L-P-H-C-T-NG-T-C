import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { PresentationView } from '../../components/teacher/PresentationView';
import { useRoomRealtime } from '../../hooks/useRoomRealtime';
import { activeRealtimeService, isFirebaseActive } from '../../services/realtime/realtimeServiceSwitch';
import { loadMockDatabase } from '../../services/realtime/mockStorage';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { GameHubModal } from '../../components/games/GameHubModal';
import { RandomWheelGame } from '../../components/games/RandomWheelGame';
import { MysteryDoorGame } from '../../components/games/MysteryDoorGame';
import { QuickAnswerGame } from '../../components/games/QuickAnswerGame';
import { TeamRaceGame } from '../../components/games/TeamRaceGame';
import { KnowledgeBoxGame } from '../../components/games/KnowledgeBoxGame';
import type { GameType, GameSessionData } from '../../services/realtime/types';
import {
  Radio,
  Play,
  Lock,
  Eye,
  SkipForward,
  Users,
  AlertTriangle,
  Award,
  Maximize2,
  Search,
  CheckCircle2,
  Gamepad2,
  Pause,
} from 'lucide-react';

export const RoomControllerPage: React.FC = () => {
  const { roomId: paramRoomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const { quizzes, classes } = useTeacherData();
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'students' | 'scoreboard'>('overview');

  // Modals state
  const [isPresenting, setIsPresenting] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isManualScoreModalOpen, setIsManualScoreModalOpen] = useState(false);
  const [isGameHubOpen, setIsGameHubOpen] = useState(false);

  // Calling student state
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningName, setSpinningName] = useState('');
  const [prioritizeUncalled, setPrioritizeUncalled] = useState(true);

  // Manual score input state
  const [selectedStudentForScore, setSelectedStudentForScore] = useState<{ id: string; name: string } | null>(null);
  const [customPoints, setCustomPoints] = useState<number>(5);
  const [selectedReason, setSelectedReason] = useState('Phát biểu tốt');

  // Scoreboard search & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'score-desc' | 'score-asc' | 'name'>('score-desc');

  // Initialize room. Firestore createRoom is async; mock mode remains supported.
  useEffect(() => {
    let cancelled = false;

    const initializeRoom = async () => {
      if (paramRoomId) {
        setActiveRoomId(paramRoomId);
        return;
      }

      if (!isFirebaseActive) {
        const mockDb = loadMockDatabase();
        const active = Object.values(mockDb.rooms).find((r) => r.status !== 'FINISHED');
        if (active) {
          setActiveRoomId(active.id);
          return;
        }
      }

      const defaultQuiz = quizzes[0];
      const defaultClass = classes[0];
      if (!defaultQuiz || !defaultClass) return;

      try {
        const createdRoom = await Promise.resolve(
          activeRealtimeService.createRoom({
            teacherId: currentUser?.uid || 'teacher-current',
            classId: defaultClass.id,
            className: defaultClass.name,
            subject: defaultQuiz.subject,
            quizId: defaultQuiz.id,
            quizTitle: defaultQuiz.title,
            questions: defaultQuiz.questions,
            roster: defaultClass.students.map((s) => ({ id: s.id, name: s.name })),
          })
        );

        if (!cancelled) {
          setActiveRoomId(createdRoom.id);
        }
      } catch (error) {
        console.error('Không thể tạo phòng học Live', error);
        if (!cancelled) {
          showToast('Không thể tạo phòng học Live. Vui lòng thử lại.', 'error');
        }
      }
    };

    void initializeRoom();

    return () => {
      cancelled = true;
    };
  }, [paramRoomId, quizzes, classes, currentUser?.uid, showToast]);

  const room = useRoomRealtime(activeRoomId);

  if (!room) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Đang khởi tạo phòng học...</h2>
      </div>
    );
  }

  // Active question & submissions
  const currentQuestionId = room.activeQuestionId || Object.keys(room.liveQuestions)[0];
  const liveQ = room.liveQuestions[currentQuestionId];
  const questionIds = Object.keys(room.liveQuestions);
  const currentIndex = questionIds.indexOf(currentQuestionId);

  const participantsList = Object.values(room.participants || {});
  const rosterList = room.roster || [];
  const submissionsList = Object.values(room.submissions || {}).filter(
    (s) => s.questionId === currentQuestionId
  );
  const allSubmissionsList = Object.values(room.submissions || {});

  const submittedStudentIds = new Set(submissionsList.map((s) => s.studentId));
  const answeredParticipants = participantsList.filter((p) => submittedStudentIds.has(p.studentId));
  const unansweredParticipants = participantsList.filter((p) => !submittedStudentIds.has(p.studentId));

  const isRoomFinished = room.status === 'FINISHED';
  const qStatus = liveQ ? liveQ.status : 'READY';

  const canStartSession = room.status === 'WAITING';
  const canOpenQuestion = !isRoomFinished && (qStatus === 'READY' || qStatus === 'CLOSED');
  const canCloseQuestion = !isRoomFinished && qStatus === 'OPEN';
  const canShowResult = !isRoomFinished && qStatus === 'CLOSED';
  const canNextQuestion = !isRoomFinished && qStatus === 'RESULT';

  const joinUrl = `${window.location.origin}/student/join?room=${room.roomCode}`;

  // --- ACTIONS ---
  const handleStartSession = async () => {
    try {
      const ok = await Promise.resolve(activeRealtimeService.startRoomSession(room.id));
      if (!ok) throw new Error('Không thể bắt đầu buổi học.');
      showToast('Đã bắt đầu buổi học! Học sinh có thể nhận câu hỏi.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể bắt đầu buổi học.', 'error');
    }
  };

  const handleOpenQuestion = async () => {
    if (!currentQuestionId) return;
    try {
      const ok = await Promise.resolve(activeRealtimeService.openQuestion(room.id, currentQuestionId));
      if (!ok) throw new Error('Không thể mở câu hỏi.');
      showToast('Đã phát câu hỏi tới thiết bị học sinh!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể mở câu hỏi.', 'error');
    }
  };

  const handleCloseQuestion = async () => {
    if (!currentQuestionId) return;
    try {
      const ok = await Promise.resolve(activeRealtimeService.closeQuestion(room.id, currentQuestionId));
      if (!ok) throw new Error('Không thể đóng câu hỏi.');
      showToast('Đã đóng lượt nhận bài cho câu hỏi này!', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Không thể đóng câu hỏi.', 'error');
    }
  };

  const handleShowResult = async () => {
    if (!currentQuestionId) return;
    try {
      const ok = await Promise.resolve(activeRealtimeService.showQuestionResult(room.id, currentQuestionId));
      if (!ok) throw new Error('Không thể công bố đáp án.');
      showToast('Đã công bố đáp án và tự động cộng +10 điểm cho học sinh làm đúng!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể công bố đáp án.', 'error');
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questionIds.length - 1) {
      const nextId = questionIds[currentIndex + 1];
      try {
        const ok = await Promise.resolve(activeRealtimeService.openQuestion(room.id, nextId));
        if (!ok) throw new Error('Không thể chuyển câu hỏi.');
        showToast('Đã chuyển sang câu hỏi tiếp theo!', 'info');
      } catch (err: any) {
        showToast(err?.message || 'Không thể chuyển câu hỏi.', 'error');
      }
    } else {
      showToast('Đã hết danh sách câu hỏi trong bộ đề này!', 'info');
    }
  };

  const handleFinishRoom = async () => {
    try {
      const success = await Promise.resolve(activeRealtimeService.finishRoom(room.id));
      if (!success) {
        throw new Error('Không thể cập nhật trạng thái phòng học.');
      }

      setIsFinishModalOpen(false);
      setIsSummaryOpen(true);
      showToast('Buổi học đã kết thúc và được lưu vào hệ thống!', 'success');
    } catch (err: any) {
      console.error('Không thể kết thúc buổi học', err);
      showToast(err?.message || 'Không thể kết thúc buổi học. Vui lòng thử lại.', 'error');
    }
  };

  // --- STUDENT CALLING LOGIC ---
  const handleRandomCall = () => {
    if (participantsList.length === 0) {
      showToast('Chưa có học sinh nào tham gia phòng!', 'info');
      return;
    }

    setIsSpinning(true);
    const pool = prioritizeUncalled
      ? participantsList.filter((p) => !room.callHistory?.includes(p.studentId))
      : participantsList;

    const targetPool = pool.length > 0 ? pool : participantsList;
    const finalSelected = targetPool[Math.floor(Math.random() * targetPool.length)];

    // 1.5s spinning animation effect
    let count = 0;
    const interval = setInterval(() => {
      const randomTemp = participantsList[Math.floor(Math.random() * participantsList.length)];
      setSpinningName(randomTemp.name);
      count++;

      if (count >= 12) {
        clearInterval(interval);
        setSpinningName(finalSelected.name);
        setIsSpinning(false);
        void Promise.resolve(
          activeRealtimeService.callStudent(
            room.id,
            finalSelected.studentId,
            finalSelected.name,
            'Phát biểu ngẫu nhiên'
          )
        )
          .then((ok) => {
            if (!ok) throw new Error('Không thể gọi học sinh.');
            showToast(`Đã gọi học sinh ${finalSelected.name}!`, 'success');
          })
          .catch((err: any) => {
            showToast(err?.message || 'Không thể gọi học sinh.', 'error');
          });
      }
    }, 100);
  };

  const handleManualCall = async (studentId: string, name: string) => {
    try {
      const ok = await Promise.resolve(activeRealtimeService.callStudent(room.id, studentId, name, 'Mời phát biểu'));
      if (!ok) throw new Error('Không thể gọi học sinh.');
      setIsCallModalOpen(true);
      showToast(`Đã mời học sinh ${name} phát biểu!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể gọi học sinh.', 'error');
    }
  };

  const handleOralScore = async (points: number, reason: string) => {
    if (!room.calledStudent) return;

    try {
      if (points !== 0) {
        const ok = await Promise.resolve(
          activeRealtimeService.addManualScore(
            room.id,
            room.calledStudent.studentId,
            room.calledStudent.studentName,
            points,
            reason
          )
        );
        if (!ok) throw new Error('Không thể cập nhật điểm.');
        showToast(
          `Đã ghi nhận ${points > 0 ? `+${points}` : points} điểm cho ${room.calledStudent.studentName}!`,
          'success'
        );
      }

      await Promise.resolve(activeRealtimeService.clearCalledStudent(room.id));
    } catch (err: any) {
      showToast(err?.message || 'Không thể cập nhật lượt trả lời.', 'error');
    }
  };

  const handleTransferAnswer = async () => {
    try {
      await Promise.resolve(activeRealtimeService.clearCalledStudent(room.id));
      handleRandomCall();
    } catch (err: any) {
      showToast(err?.message || 'Không thể chuyển lượt trả lời.', 'error');
    }
  };

  // --- SCOREBOARD CALCS ---
  const studentScoresList = (room.roster || []).map((s) => {
    const scoreData = room.scores?.[s.id];
    return {
      studentId: s.id,
      name: s.name,
      score: scoreData ? scoreData.score : 0,
      updatedAt: scoreData ? scoreData.updatedAt : '',
    };
  });

  const filteredScores = studentScoresList
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'score-desc') return b.score - a.score;
      if (sortOrder === 'score-asc') return a.score - b.score;
      return a.name.localeCompare(b.name, 'vi');
    });

  const handleAddManualPoint = async (studentId: string, name: string, points: number, reason: string) => {
    try {
      const ok = await Promise.resolve(activeRealtimeService.addManualScore(room.id, studentId, name, points, reason));
      if (!ok) throw new Error('Không thể cập nhật điểm.');
      showToast(`Đã cập nhật ${points > 0 ? `+${points}` : points} điểm cho ${name}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể cập nhật điểm.', 'error');
    }
  };

  // --- GAME HANDLERS ---
  const handleStartGame = async (type: GameType, settings: GameSessionData['settings']) => {
    try {
      const game = await Promise.resolve(activeRealtimeService.createGameSession(room.id, type, settings, questionIds));
      if (!game) throw new Error('Không thể tạo trò chơi.');
      const started = await Promise.resolve(activeRealtimeService.startGameSession(room.id));
      if (!started) throw new Error('Không thể bắt đầu trò chơi.');
      showToast('Đã bắt đầu trò chơi!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể bắt đầu trò chơi.', 'error');
    }
  };

  const handlePauseGame = async () => {
    try {
      const ok = await Promise.resolve(activeRealtimeService.pauseGameSession(room.id));
      if (!ok) throw new Error('Không thể đổi trạng thái trò chơi.');
      showToast('Đã chuyển trạng thái Tạm dừng / Tiếp tục trò chơi', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Không thể đổi trạng thái trò chơi.', 'error');
    }
  };

  const handleFinishGame = async () => {
    try {
      const ok = await Promise.resolve(activeRealtimeService.finishGameSession(room.id));
      if (!ok) throw new Error('Không thể kết thúc trò chơi.');
      showToast('Đã kết thúc trò chơi! Phòng quay lại học bình thường.', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Không thể kết thúc trò chơi.', 'error');
    }
  };

  // Render Fullscreen Presentation if active
  if (isPresenting) {
    return (
      <PresentationView
        room={room}
        onClose={() => setIsPresenting(false)}
        onOpenQuestion={handleOpenQuestion}
        onCloseQuestion={handleCloseQuestion}
        onShowResult={handleShowResult}
        onNextQuestion={handleNextQuestion}
        onCallRandomStudent={() => {
          setIsCallModalOpen(true);
          handleRandomCall();
        }}
      />
    );
  }

  // --- SESSION SUMMARY CALCS ---
  const totalQuestionsCount = questionIds.length;
  const totalSubmissionsCount = allSubmissionsList.length;
  const correctSubmissionsCount = Object.values(room.scoreEvents || {}).filter(
    (e) => e.type === 'QUESTION_CORRECT'
  ).length;

  const avgAccuracy = totalSubmissionsCount > 0 ? Math.round((correctSubmissionsCount / totalSubmissionsCount) * 100) : 0;

  const activeGame = room.activeGame;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`ĐIỀU KHIỂN PHÒNG HỌC LIVE: ${room.className.toUpperCase()}`}
        description={`Bộ đề: ${room.quizTitle} • Môn ${room.subject}`}
        action={
          <div className="flex items-center gap-3">
            <Badge variant={room.status === 'FINISHED' ? 'neutral' : room.status === 'ACTIVE' ? 'success' : 'warning'}>
              <Radio className="w-4 h-4 mr-1 animate-pulse" />
              {room.status === 'FINISHED' ? 'Đã kết thúc' : room.status === 'ACTIVE' ? 'Đang Live' : 'Đang phòng chờ'}
            </Badge>

            <Button variant="warning" size="sm" onClick={() => setIsGameHubOpen(true)} className="font-bold text-slate-950">
              <Gamepad2 className="w-4 h-4 mr-1" /> GAME HUB TRÒ CHƠI
            </Button>

            <Button variant="outline" size="sm" onClick={() => setIsPresenting(true)}>
              <Maximize2 className="w-4 h-4 mr-1" /> Trình Chiếu Máy Chiếu
            </Button>

            {!isRoomFinished && (
              <Button variant="danger" size="sm" onClick={() => setIsFinishModalOpen(true)}>
                Kết thúc buổi học
              </Button>
            )}
          </div>
        }
      />

      {/* ACTIVE GAME VIEW OVERLAY IF RUNNING */}
      {activeGame && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl text-white flex items-center justify-between border border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold">🎮 GAME LIVE</span>
              <div>
                <h4 className="font-black text-lg text-amber-400">TRÒ CHƠI ĐANG DIỄN RA: {activeGame.type}</h4>
                <p className="text-xs text-slate-400">Trạng thái: {activeGame.status === 'PAUSED' ? '🟡 ĐÃ TẠM DỪNG' : '🟢 ĐANG CHẠY'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={handlePauseGame} className="font-bold">
                <Pause className="w-4 h-4 mr-1" /> {activeGame.status === 'PAUSED' ? 'TIẾP TỤC' : 'TẠM DỪNG'}
              </Button>
              <Button variant="danger" size="sm" onClick={handleFinishGame} className="font-bold">
                KẾT THÚC GAME
              </Button>
            </div>
          </div>

          {activeGame.type === 'RANDOM_WHEEL' && (
            <RandomWheelGame
              participants={participantsList}
              calledStudentIds={activeGame.calledStudentIds || []}
              onSpinFinish={(selected) => {
                activeRealtimeService.updateGamePayload(room.id, (g) => ({
                  ...g,
                  calledStudentIds: [...(g.calledStudentIds || []), selected.studentId],
                }));
              }}
              onAwardOralScore={handleAddManualPoint}
              onCloseGame={handleFinishGame}
            />
          )}

          {activeGame.type === 'MYSTERY_DOOR' && (
            <MysteryDoorGame
              doors={activeGame.doors || []}
              liveQuestions={room.liveQuestions}
              onOpenDoor={(doorId) => {
                const targetDoor = activeGame.doors?.find((d) => d.id === doorId);
                if (targetDoor) {
                  activeRealtimeService.openQuestion(room.id, targetDoor.questionId);
                  activeRealtimeService.updateGamePayload(room.id, (g) => ({
                    ...g,
                    doors: g.doors?.map((d) => (d.id === doorId ? { ...d, isOpened: true } : d)),
                  }));
                }
              }}
              onShowResult={handleShowResult}
              onCloseGame={handleFinishGame}
            />
          )}

          {activeGame.type === 'QUICK_ANSWER' && (
            <QuickAnswerGame
              question={liveQ}
              submissions={submissionsList}
              timerDuration={activeGame.settings.timerSeconds || 15}
              onOpenQuestion={handleOpenQuestion}
              onCloseQuestion={handleCloseQuestion}
              onShowResult={handleShowResult}
              onCloseGame={handleFinishGame}
            />
          )}

          {activeGame.type === 'TEAM_RACE' && (
            <TeamRaceGame
              teams={activeGame.teams || {}}
              question={liveQ}
              submissions={submissionsList}
              onOpenQuestion={handleOpenQuestion}
              onCloseQuestion={handleCloseQuestion}
              onShowResult={handleShowResult}
              onCloseGame={handleFinishGame}
            />
          )}

          {activeGame.type === 'KNOWLEDGE_BOX' && (
            <KnowledgeBoxGame
              boxes={activeGame.boxes || []}
              liveQuestions={room.liveQuestions}
              onOpenBox={(boxId) => {
                const targetBox = activeGame.boxes?.find((b) => b.id === boxId);
                if (targetBox) {
                  if (targetBox.type === 'QUESTION' && targetBox.questionId) {
                    activeRealtimeService.openQuestion(room.id, targetBox.questionId);
                  }
                  activeRealtimeService.updateGamePayload(room.id, (g) => ({
                    ...g,
                    boxes: g.boxes?.map((b) => (b.id === boxId ? { ...b, isOpened: true } : b)),
                  }));
                }
              }}
              onShowResult={handleShowResult}
              onCloseGame={handleFinishGame}
            />
          )}
        </div>
      )}

      {/* PIN & QR Section Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-slate-800">
        <div className="text-center sm:text-left space-y-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block">Mã Tham Gia Trực Tiếp</span>
          <div className="text-4xl sm:text-6xl font-black tracking-wider text-amber-400 font-mono">
            {room.roomCode}
          </div>
          <p className="text-xs text-slate-300">
            Học sinh tham gia: <strong className="text-emerald-400 font-extrabold">{participantsList.length}</strong> / {rosterList.length} em
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex items-center gap-6 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div className="bg-white p-2 rounded-xl text-slate-900 shadow-md">
            <QRCodeSVG value={joinUrl} size={100} level="H" />
          </div>
          <div className="text-left space-y-2">
            <span className="font-bold text-base block text-sky-300">QR CODE THAM GIA</span>
            <p className="text-xs text-slate-300 max-w-xs break-all font-mono">{joinUrl}</p>
            <Button variant="warning" size="xs" onClick={() => setIsPresenting(true)} className="font-bold text-slate-950">
              <Maximize2 className="w-3.5 h-3.5 mr-1" /> Mở Màn Máy Chiếu
            </Button>
          </div>
        </div>
      </div>

      {/* Start Session Banner if WAITING */}
      {canStartSession && (
        <div className="p-6 rounded-3xl bg-amber-500 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-amber-400 shadow-lg animate-fade-in">
          <div>
            <h3 className="font-black text-xl">PHÒNG HỌC ĐANG Ở TRẠNG THÁI PHÒNG CHỜ</h3>
            <p className="text-sm font-semibold opacity-90">Bấm "BẮT ĐẦU BUỔI HỌC" để bắt đầu tiết học tương tác trực tiếp.</p>
          </div>
          <Button variant="primary" size="lg" onClick={handleStartSession} className="font-bold">
            <Play className="w-5 h-5 mr-2 inline" /> BẮT ĐẦU BUỔI HỌC
          </Button>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'overview' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📊 TỔNG QUAN
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'questions' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ❓ BỘ CÂU HỎI ({questionIds.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'students' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            👥 HỌC SINH ({participantsList.length})
          </button>
          <button
            onClick={() => setActiveTab('scoreboard')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'scoreboard' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ⭐ BẢNG ĐIỂM LỚP
          </button>
        </div>

        {/* Random Call Trigger */}
        <Button variant="warning" size="sm" onClick={() => setIsCallModalOpen(true)} className="font-bold text-slate-950">
          <Award className="w-4 h-4 mr-1 inline" /> GỌI HỌC SINH PHÁT BIỂU
        </Button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <span className="text-xs font-bold text-sky-600 block uppercase">Câu hỏi phát sóng</span>
                  <h3 className="text-xl font-bold text-slate-900">{liveQ?.content || 'Chưa chọn câu hỏi'}</h3>
                </div>
                <Badge variant={qStatus === 'OPEN' ? 'success' : qStatus === 'CLOSED' ? 'warning' : qStatus === 'RESULT' ? 'info' : 'neutral'}>
                  {qStatus === 'OPEN' ? '🟢 Đang nhận bài' : qStatus === 'CLOSED' ? '🟡 Đã khóa bài' : qStatus === 'RESULT' ? '🔵 Đã hiện đáp án' : '⚪ Sẵn sàng'}
                </Badge>
              </div>

              {/* State Machine Action Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Button variant="primary" size="sm" onClick={handleOpenQuestion} disabled={!canOpenQuestion}>
                  <Play className="w-4 h-4 mr-1" /> Phát câu hỏi
                </Button>
                <Button variant="danger" size="sm" onClick={handleCloseQuestion} disabled={!canCloseQuestion}>
                  <Lock className="w-4 h-4 mr-1" /> Đóng trả lời
                </Button>
                <Button variant="success" size="sm" onClick={handleShowResult} disabled={!canShowResult}>
                  <Eye className="w-4 h-4 mr-1" /> Hiện đáp án
                </Button>
                <Button variant="secondary" size="sm" onClick={handleNextQuestion} disabled={!canNextQuestion}>
                  <SkipForward className="w-4 h-4 mr-1" /> Câu tiếp theo
                </Button>
              </div>

              {/* Options Breakdown Chart */}
              {liveQ?.options && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-bold text-slate-700">Thống kê lựa chọn ({submissionsList.length} lượt nộp)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {liveQ.options.map((opt, i) => {
                      const letter = String.fromCharCode(65 + i);
                      const count = submissionsList.filter((s) => s.answer.trim().toUpperCase() === letter || s.answer === opt).length;
                      const isCorrect = liveQ.status === 'RESULT' && liveQ.correctAnswer === letter;

                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            isCorrect ? 'bg-emerald-50 border-emerald-400 font-bold' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className="text-sm">
                            <strong className="text-sky-700 font-black mr-2">{letter}.</strong> {opt}
                          </span>
                          <span className="text-xs font-black bg-white px-2 py-1 rounded-lg border border-slate-200">
                            {count} lượt
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Roster & Attendance Status */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                Tiến độ nộp bài ({answeredParticipants.length}/{participantsList.length})
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-emerald-700 block mb-1">✓ Đã nộp ({answeredParticipants.length})</span>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {answeredParticipants.map((p) => (
                      <div key={p.studentId} className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-950 flex justify-between">
                        <span>{p.name}</span>
                        <span className="text-emerald-700 font-mono">Đã nộp</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-1">⏳ Chưa nộp ({unansweredParticipants.length})</span>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {unansweredParticipants.map((p) => (
                      <div key={p.studentId} className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS LIST */}
      {activeTab === 'questions' && (
        <Card>
          <h3 className="font-bold text-lg text-slate-900 mb-4">Danh sách câu hỏi trong bộ đề</h3>
          <div className="space-y-4">
            {questionIds.map((qId, idx) => {
              const q = room.liveQuestions[qId];
              const isCurrent = qId === currentQuestionId;

              return (
                <div
                  key={qId}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isCurrent ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-sky-700">Câu {idx + 1}</span>
                    <h4 className="font-bold text-slate-900 text-base">{q.content}</h4>
                  </div>

                  <Button
                    variant={isCurrent ? 'primary' : 'outline'}
                    size="sm"
                    onClick={async () => {
                      try {
                        const ok = await Promise.resolve(activeRealtimeService.openQuestion(room.id, qId));
                        if (!ok) throw new Error('Không thể phát câu hỏi.');
                        showToast(`Đã chuyển sang Câu ${idx + 1}`, 'info');
                      } catch (err: any) {
                        showToast(err?.message || 'Không thể phát câu hỏi.', 'error');
                      }
                    }}
                  >
                    {isCurrent ? 'Đang chọn' : 'Phát câu này'}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 3: STUDENTS LIST */}
      {activeTab === 'students' && (
        <Card>
          <h3 className="font-bold text-lg text-slate-900 mb-4">Danh sách học sinh tham gia tiết học ({participantsList.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {participantsList.map((p) => {
              const currentScore = room.scores?.[p.studentId]?.score || 0;

              return (
                <div key={p.studentId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base">{p.name}</h4>
                    <Badge variant="primary" className="font-bold">{currentScore} điểm</Badge>
                  </div>

                  {/* Manual point quick actions */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleAddManualPoint(p.studentId, p.name, 1, 'Phát biểu tốt')}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleAddManualPoint(p.studentId, p.name, 5, 'Phát biểu xuất sắc')}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleAddManualPoint(p.studentId, p.name, 10, 'Hoàn thành xuất sắc')}
                      className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-lg text-xs font-bold"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleAddManualPoint(p.studentId, p.name, -1, 'Nhắc nhở')}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleManualCall(p.studentId, p.name)}
                      className="ml-auto px-2.5 py-1 bg-sky-600 text-white rounded-lg text-xs font-bold"
                    >
                      Mời trả lời
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 4: SCOREBOARD */}
      {activeTab === 'scoreboard' && (
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h3 className="font-bold text-xl text-slate-900">Bảng Điểm Buổi Học</h3>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Tìm học sinh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                value={sortOrder}
                onChange={(e: any) => setSortOrder(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-none"
              >
                <option value="score-desc">Điểm cao → thấp</option>
                <option value="score-asc">Điểm thấp → cao</option>
                <option value="name">Theo tên A-Z</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-4 text-center">Điểm hiện tại</th>
                  <th className="py-3 px-4 text-right">Cộng/trừ điểm thủ công</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredScores.map((s) => (
                  <tr key={s.studentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-sky-100 text-sky-900 rounded-full font-black text-base">
                        {s.score}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleAddManualPoint(s.studentId, s.name, 1, 'Trả lời tốt')}
                        className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg text-xs"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleAddManualPoint(s.studentId, s.name, 5, 'Tích cực')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                      >
                        +5
                      </button>
                      <button
                        onClick={() => handleAddManualPoint(s.studentId, s.name, -1, 'Cần nhắc nhở')}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudentForScore({ id: s.studentId, name: s.name });
                          setIsManualScoreModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold rounded-lg text-xs"
                      >
                        TÙY CHỈNH
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL 1: GỌI HỌC SINH */}
      <Modal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        title="GỌI HỌC SINH PHÁT BIỂU"
      >
        <div className="space-y-6 text-center py-2">
          {/* Active Called Student Display */}
          {room.calledStudent ? (
            <div className="bg-amber-100 border-2 border-amber-400 p-6 rounded-3xl space-y-3">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-widest block">Đang được gọi:</span>
              <h2 className="text-3xl font-black text-amber-950 uppercase">{room.calledStudent.studentName}</h2>
              <p className="text-xs text-amber-800 font-medium">{room.calledStudent.reason}</p>

              {/* Quick oral score evaluation buttons */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-amber-300">
                <Button variant="success" size="sm" onClick={() => handleOralScore(10, 'Trả lời đúng oral')}>
                  +10 Trả lời đúng
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleOralScore(5, 'Có cố gắng')}>
                  +5 Có cố gắng
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOralScore(0, 'Chưa đúng')}>
                  0 Chưa đúng
                </Button>
                <Button variant="secondary" size="sm" onClick={handleTransferAnswer}>
                  CHUYỂN CHO BẠN KHÁC
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-amber-400 text-amber-950 flex items-center justify-center mx-auto font-black text-3xl shadow-lg border-2 border-amber-300">
                {isSpinning ? spinningName.charAt(0) || '?' : <Award className="w-10 h-10" />}
              </div>

              <h3 className="text-2xl font-black text-slate-900 min-h-[40px]">
                {isSpinning ? spinningName : 'Bấm nút để chọn ngẫu nhiên học sinh'}
              </h3>

              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  id="uncalled"
                  checked={prioritizeUncalled}
                  onChange={(e) => setPrioritizeUncalled(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="uncalled">Ưu tiên học sinh chưa được gọi trong tiết này</label>
              </div>

              <Button
                variant="warning"
                size="xl"
                fullWidth
                onClick={handleRandomCall}
                disabled={isSpinning}
                className="font-black text-slate-950"
              >
                {isSpinning ? 'ĐANG CHỌN NGẪU NHIÊN...' : '🎲 GỌI NGẪU NHIÊN'}
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 2: TÙY CHỈNH ĐIỂM THỦ CÔNG */}
      <Modal
        isOpen={isManualScoreModalOpen}
        onClose={() => setIsManualScoreModalOpen(false)}
        title={`CỘNG/TRỪ ĐIỂM: ${selectedStudentForScore?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsManualScoreModalOpen(false)}>Hủy</Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (selectedStudentForScore) {
                  await handleAddManualPoint(
                    selectedStudentForScore.id,
                    selectedStudentForScore.name,
                    customPoints,
                    selectedReason
                  );
                  setIsManualScoreModalOpen(false);
                }
              }}
            >
              CẬP NHẬT ĐIỂM
            </Button>
          </>
        }
      >
        <div className="space-y-4 p-2">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Số điểm cộng/trừ:</label>
            <Input
              type="number"
              value={customPoints}
              onChange={(e) => setCustomPoints(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Chọn nhanh lý do:</label>
            <div className="flex flex-wrap gap-2">
              {['Trả lời tốt', 'Tích cực', 'Giúp bạn', 'Hoàn thành nhiệm vụ', 'Cần nhắc nhở', 'Khác'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedReason(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedReason === r ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: BÁO CÁO TÓM TẮT BUỔI HỌC (SESSION SUMMARY) */}
      <Modal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        title="TÓM TẮT BUỔI HỌC THÀNH CÔNG"
        footer={
          <Button variant="primary" onClick={() => navigate('/teacher/classes')}>
            HOÀN TẤT & QUAY VỀ DANH SÁCH LỚP
          </Button>
        }
      >
        <div className="space-y-6 text-center p-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Số học sinh tham gia</span>
              <span className="text-2xl font-black text-slate-900">{participantsList.length}/{rosterList.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Số câu hỏi đã hoàn thành</span>
              <span className="text-2xl font-black text-slate-900">{totalQuestionsCount} câu</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Tổng lượt trả lời</span>
              <span className="text-2xl font-black text-slate-900">{totalSubmissionsCount} lượt</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Tỷ lệ chính xác TB</span>
              <span className="text-2xl font-black text-emerald-600">{avgAccuracy}%</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: FINISH ROOM CONFIRMATION */}
      <Modal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        title="Xác Nhận Kết Thúc Buổi Học"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFinishModalOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={handleFinishRoom}>KẾT THÚC BUỔI HỌC</Button>
          </>
        }
      >
        <div className="flex items-start gap-4 p-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              Bạn có chắc muốn kết thúc buổi học của {room.className}?
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Sau khi kết thúc, học sinh sẽ không thể gửi thêm bất kỳ câu trả lời nào nữa.
            </p>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: GAME HUB SELECTION */}
      <GameHubModal
        isOpen={isGameHubOpen}
        onClose={() => setIsGameHubOpen(false)}
        onStartGame={handleStartGame}
      />
    </div>
  );
};
