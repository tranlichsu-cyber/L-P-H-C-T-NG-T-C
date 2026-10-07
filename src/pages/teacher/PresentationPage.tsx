import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PresentationView } from '../../components/teacher/PresentationView';
import { useRoomRealtime } from '../../hooks/useRoomRealtime';
import { activeRealtimeService, isFirebaseActive } from '../../services/realtime/realtimeServiceSwitch';
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
    } else if (!isFirebaseActive) {
      const db = loadMockDatabase();
      const rooms = Object.values(db.rooms);
      const active = rooms.find((r) => r.status !== 'FINISHED');
      if (active) {
        setActiveRoomId(active.id);
      }
    } else {
      navigate('/teacher/room', { replace: true });
    }
  }, [paramRoomId, navigate]);

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

  const handleOpenQuestion = async (qId: string) => {
    try {
      await Promise.resolve(activeRealtimeService.openQuestion(room.id, qId));
    } catch (err: any) {
      showToast(err?.message || 'Không thể mở câu hỏi.', 'error');
    }
  };

  const handleCloseQuestion = async (qId: string) => {
    try {
      await Promise.resolve(activeRealtimeService.closeQuestion(room.id, qId));
    } catch (err: any) {
      showToast(err?.message || 'Không thể đóng câu hỏi.', 'error');
    }
  };

  const handleShowResult = async (qId: string) => {
    try {
      await Promise.resolve(activeRealtimeService.showQuestionResult(room.id, qId));
    } catch (err: any) {
      showToast(err?.message || 'Không thể công bố kết quả.', 'error');
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questionIds.length - 1) {
      const nextId = questionIds[currentIndex + 1];
      try {
        await Promise.resolve(activeRealtimeService.openQuestion(room.id, nextId));
      } catch (err: any) {
        showToast(err?.message || 'Không thể chuyển câu hỏi.', 'error');
      }
    } else {
      showToast('Đã hết câu hỏi trong bộ đề này!', 'info');
    }
  };

  const handleCallRandomStudent = async () => {
    const participantsList = Object.values(room.participants || {});
    if (participantsList.length === 0) {
      showToast('Chưa có học sinh nào tham gia phòng!', 'info');
      return;
    }

    // Priority for uncalled students
    const uncalled = participantsList.filter((p) => !room.callHistory?.includes(p.studentId));
    const pool = uncalled.length > 0 ? uncalled : participantsList;
    const selected = pool[Math.floor(Math.random() * pool.length)];

    try {
      await Promise.resolve(
        activeRealtimeService.callStudent(room.id, selected.studentId, selected.name, 'Phát biểu ý kiến')
      );
      showToast(`Đã mời học sinh ${selected.name} phát biểu!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể gọi học sinh.', 'error');
    }
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
