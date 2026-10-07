import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PresentationView } from '../../components/teacher/PresentationView';
import { useRoomRealtime } from '../../hooks/useRoomRealtime';
import { activeRealtimeService } from '../../services/realtime/realtimeServiceSwitch';
import { loadMockDatabase } from '../../services/realtime/mockStorage';
import { useToast } from '../../context/ToastContext';

export const PresentationPage: React.FC = () => {
  const { roomId: paramRoomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (paramRoomId) {
      setActiveRoomId(paramRoomId);
    } else {
      const db = loadMockDatabase();
      const rooms = Object.values(db.rooms);
      const active = rooms.find((r) => r.status !== 'FINISHED');
      if (active) {
        setActiveRoomId(active.id);
      }
    }
  }, [paramRoomId]);

  const room = useRoomRealtime(activeRoomId);

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Đang tải phòng học...</h2>
          <button
            onClick={() => navigate('/teacher/room')}
            className="px-4 py-2 bg-sky-600 rounded-xl text-sm font-semibold"
          >
            Quay lại Điều khiển
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionId = room.activeQuestionId || Object.keys(room.liveQuestions)[0];
  const questionIds = Object.keys(room.liveQuestions);
  const currentIndex = questionIds.indexOf(currentQuestionId);

  const handleOpenQuestion = (qId: string) => {
    activeRealtimeService.openQuestion(room.id, qId);
  };

  const handleCloseQuestion = (qId: string) => {
    activeRealtimeService.closeQuestion(room.id, qId);
  };

  const handleShowResult = (qId: string) => {
    activeRealtimeService.showQuestionResult(room.id, qId);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questionIds.length - 1) {
      const nextId = questionIds[currentIndex + 1];
      activeRealtimeService.openQuestion(room.id, nextId);
    } else {
      showToast('Đã hết câu hỏi trong bộ đề này!', 'info');
    }
  };

  const handleCallRandomStudent = () => {
    const participantsList = Object.values(room.participants || {});
    if (participantsList.length === 0) {
      showToast('Chưa có học sinh nào tham gia phòng!', 'info');
      return;
    }

    // Priority for uncalled students
    const uncalled = participantsList.filter((p) => !room.callHistory?.includes(p.studentId));
    const pool = uncalled.length > 0 ? uncalled : participantsList;
    const selected = pool[Math.floor(Math.random() * pool.length)];

    activeRealtimeService.callStudent(room.id, selected.studentId, selected.name, 'Phát biểu ý kiến');
    showToast(`Đã mời học sinh ${selected.name} phát biểu!`, 'success');
  };

  return (
    <PresentationView
      room={room}
      onClose={() => navigate(`/teacher/room/${room.id}`)}
      onOpenQuestion={handleOpenQuestion}
      onCloseQuestion={handleCloseQuestion}
      onShowResult={handleShowResult}
      onNextQuestion={handleNextQuestion}
      onCallRandomStudent={handleCallRandomStudent}
    />
  );
};
