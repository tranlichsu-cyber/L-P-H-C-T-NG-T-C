import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import { realtimeService } from '../../services/realtime/MockRealtimeService';
import { Users, BookOpen, Radio, Sparkles, Zap, Play, History } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, quizzes } = useTeacherData();
  const { showToast } = useToast();

  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id || '');

  // Last used settings for Quick Lesson Mode (v1.1)
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

  const totalClasses = classes.length;
  const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);
  const totalQuizzes = quizzes.length;

  const handleOpenCreateRoom = () => {
    if (classes.length === 0 || quizzes.length === 0) {
      showToast('Vui lòng tạo ít nhất 1 lớp học và 1 bộ câu hỏi trước!', 'error');
      return;
    }
    setSelectedClassId(lastClassId || classes[0].id);
    setSelectedQuizId(lastQuizId || quizzes[0].id);
    setIsCreateRoomOpen(true);
  };

  const createRoomWithSelection = (cId: string, qId: string) => {
    const cls = classes.find((c) => c.id === cId);
    const quiz = quizzes.find((q) => q.id === qId);

    if (!cls || !quiz) return;

    // Save as last used preference
    localStorage.setItem('lhtt_last_class_id', cId);
    localStorage.setItem('lhtt_last_quiz_id', qId);

    const newRoom = realtimeService.createRoom({
      teacherId: 'teacher-1',
      classId: cls.id,
      className: cls.name,
      subject: quiz.subject,
      quizId: quiz.id,
      quizTitle: quiz.title,
      questions: quiz.questions,
      roster: cls.students.map((s) => ({ id: s.id, name: s.name })),
    });

    showToast(`Khởi tạo phòng dạy cho ${cls.name} thành công! Mã PIN: ${newRoom.roomCode}`, 'success');
    navigate(`/teacher/room/${newRoom.id}`);
  };

  const handleQuickStartLesson = () => {
    if (!lastClassId || !lastQuizId) {
      handleOpenCreateRoom();
      return;
    }
    createRoomWithSelection(lastClassId, lastQuizId);
  };

  const lastClass = classes.find((c) => c.id === lastClassId);
  const lastQuiz = quizzes.find((q) => q.id === lastQuizId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="LỚP HỌC TƯƠNG TÁC v1.1"
        description="Xin chào, Cô Nguyễn Thị Hương 👋"
        action={
          <Button variant="primary" size="lg" onClick={handleOpenCreateRoom}>
            <Radio className="w-5 h-5 mr-2 animate-pulse text-amber-300" />
            Tạo phòng học Live mới
          </Button>
        }
      />

      {/* QUICK LESSON MODE BANNER (v1.1 IMP-01) */}
      {lastClass && lastQuiz && (
        <Card className="p-6 sm:p-7 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-950 text-white border-2 border-sky-400/50 shadow-glow-sky rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-400/30 border-2 border-amber-300">
              <Zap className="w-9 h-9 fill-slate-950 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-xs border border-amber-400/40">
                  ⚡ BẮT ĐẦU NHANH TIẾT GẦN NHẤT
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {lastClass.name} • {lastQuiz.title}
              </h2>
              <p className="text-xs sm:text-sm text-sky-200 mt-0.5 font-medium">
                Môn: <strong className="text-amber-300">{lastQuiz.subject}</strong> | {lastQuiz.questions.length} câu hỏi | {lastClass.students.length} học sinh
              </p>
            </div>
          </div>

          <Button
            variant="warning"
            size="lg"
            onClick={handleQuickStartLesson}
            className="font-black text-slate-950 text-base shadow-xl shrink-0 border-2 border-amber-300 relative z-10"
          >
            <Play className="w-5 h-5 mr-2 fill-slate-950" /> DẠY TIẾT NÀY NGAY
          </Button>
        </Card>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 bg-white border-l-4 border-l-sky-500 border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tổng số lớp</span>
            <span className="text-2xl font-black text-slate-900">{totalClasses} Lớp</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-white border-l-4 border-l-emerald-500 border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tổng số học sinh</span>
            <span className="text-2xl font-black text-slate-900">{totalStudents} Học sinh</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-white border-l-4 border-l-amber-500 border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Số bộ câu hỏi</span>
            <span className="text-2xl font-black text-slate-900">{totalQuizzes} Bộ đề</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-white border-l-4 border-l-purple-500 border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Radio className="w-6 h-6 animate-pulse text-purple-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Trạng thái phiên</span>
            <span className="text-xl font-black text-emerald-600">Sẵn sàng v1.1</span>
          </div>
        </Card>
      </div>

      {/* Core Action Cards */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wide">
          <Sparkles className="w-5 h-5 text-sky-600" /> Các chức năng giảng dạy chính
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className="p-6 border-2 border-slate-200 hover:border-sky-500 hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all space-y-3 bg-gradient-to-b from-white to-sky-50/30"
            onClick={handleOpenCreateRoom}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-600/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-black text-slate-900 text-base">BẮT ĐẦU TIẾT HỌC LIVE</h3>
            <p className="text-xs text-slate-500 font-medium">
              Khởi tạo phòng dạy tương tác trực tiếp, chiếu mã QR cho học sinh.
            </p>
          </Card>

          <Card
            className="p-6 border-2 border-slate-200 hover:border-emerald-500 hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all space-y-3 bg-gradient-to-b from-white to-emerald-50/30"
            onClick={() => navigate('/teacher/classes')}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">QUẢN LÝ LỚP HỌC</h3>
            <p className="text-xs text-slate-500 font-medium">
              Quản lý danh sách các lớp học và nhập danh sách học sinh.
            </p>
          </Card>

          <Card
            className="p-6 border-2 border-slate-200 hover:border-amber-500 hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all space-y-3 bg-gradient-to-b from-white to-amber-50/30"
            onClick={() => navigate('/teacher/quizzes')}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/30 border border-amber-300">
              <BookOpen className="w-6 h-6 fill-slate-950" />
            </div>
            <h3 className="font-black text-slate-900 text-base">NGÂN HÀNG CÂU HỎI</h3>
            <p className="text-xs text-slate-500 font-medium">
              Soạn bài tập thủ công, dùng trợ lý AI hoặc chia sẻ bộ đề nội bộ.
            </p>
          </Card>

          <Card
            className="p-6 border-2 border-slate-200 hover:border-indigo-500 hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all space-y-3 bg-gradient-to-b from-white to-indigo-50/30"
            onClick={() => navigate('/teacher/history')}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">LỊCH SỬ DẠY HỌC</h3>
            <p className="text-xs text-slate-500 font-medium">
              Xem lại kết quả tương tác từng buổi dạy và theo dõi tiến bộ.
            </p>
          </Card>
        </div>
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
              onClick={() => createRoomWithSelection(selectedClassId, selectedQuizId)}
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
