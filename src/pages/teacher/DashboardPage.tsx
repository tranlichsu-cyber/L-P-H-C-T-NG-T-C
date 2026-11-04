import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { activeRealtimeService } from '../../services/realtime/realtimeServiceSwitch';
import { Radio } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, quizzes } = useTeacherData();
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id || '');
  const [lastClassId, setLastClassId] = useState<string>('');
  const [lastQuizId, setLastQuizId] = useState<string>('');

  useEffect(() => {
    const savedClass = localStorage.getItem('lhtt_last_class_id');
    const savedQuiz = localStorage.getItem('lhtt_last_quiz_id');

    if (savedClass && classes.some((c) => c.id === savedClass)) {
      setLastClassId(savedClass);
    } else if (classes.length > 0) {
      setLastClassId(classes[0].id);
    }

    if (savedQuiz && quizzes.some((q) => q.id === savedQuiz)) {
      setLastQuizId(savedQuiz);
    } else if (quizzes.length > 0) {
      setLastQuizId(quizzes[0].id);
    }
  }, [classes, quizzes]);

  const handleOpenCreateRoom = () => {
    if (classes.length === 0 || quizzes.length === 0) {
      showToast('Vui lòng tạo ít nhất 1 lớp học và 1 bộ câu hỏi trước!', 'error');
      return;
    }
    setSelectedClassId(lastClassId || classes[0].id);
    setSelectedQuizId(lastQuizId || quizzes[0].id);
    setIsCreateRoomOpen(true);
  };

  const createRoomWithSelection = async (cId: string, qId: string) => {
    const cls = classes.find((c) => c.id === cId);
    const quiz = quizzes.find((q) => q.id === qId);

    if (!cls || !quiz) return;

    // Save as last used preference
    localStorage.setItem('lhtt_last_class_id', cId);
    localStorage.setItem('lhtt_last_quiz_id', qId);

    try {
      const newRoom = await Promise.resolve(activeRealtimeService.createRoom({
      teacherId: currentUser?.uid || 'unknown-teacher',
      classId: cls.id,
      className: cls.name,
      subject: quiz.subject,
      quizId: quiz.id,
      quizTitle: quiz.title,
      questions: quiz.questions,
        roster: cls.students.map((s) => ({ id: s.id, name: s.name })),
      }));

      showToast(`Khởi tạo phòng dạy cho ${cls.name} thành công! Mã PIN: ${newRoom.roomCode}`, 'success');
      setIsCreateRoomOpen(false);
      navigate(`/teacher/room/${newRoom.id}`);
    } catch (err: any) {
      showToast(err?.message || 'Không thể tạo phòng học Live.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center py-8 sm:py-12">
        <Button variant="primary" size="lg" onClick={handleOpenCreateRoom}>
          <Radio className="w-5 h-5 mr-2 text-amber-300" />
          Tạo phòng học Live mới
        </Button>
      </div>

      {/* Modal Create Room */}
      <Modal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        title="Khởi Tạo Phòng Học Live Trực Tiếp"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateRoomOpen(false)}>Hủy</Button>
            <Button
              variant="primary"
              onClick={() => void createRoomWithSelection(selectedClassId, selectedQuizId)}
            >
              BẮT ĐẦU TẠO PHÒNG
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chọn Lớp Học</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 font-bold focus:border-sky-500 focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.students.length} học sinh)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chọn Bộ Câu Hỏi</label>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 font-bold focus:border-sky-500 focus:outline-none"
            >
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.subject} - {q.questions.length} câu)
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
