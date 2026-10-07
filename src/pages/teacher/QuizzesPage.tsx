import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import type { Quiz } from '../../types';
import {
  Plus,
  Copy,
  Trash2,
  Edit3,
  AlertTriangle,
  Sparkles,
  Globe2,
  Lock,
  Building2,
  Share2,
} from 'lucide-react';

export const SUBJECT_OPTIONS = [
  'Toán',
  'Tiếng Việt',
  'Khoa học',
  'Lịch sử và Địa lí',
  'Tin học',
  'Công nghệ',
  'Đạo đức',
  'Hoạt động trải nghiệm',
  'Tiếng Anh',
  'Khác',
];

export const QuizzesPage: React.FC = () => {
  const navigate = useNavigate();
  const { quizzes, addQuiz, duplicateQuiz, deleteQuiz, updateQuizVisibility } = useTeacherData();
  const { showToast } = useToast();

  // Scope Tab filter
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PRIVATE' | 'TEAM' | 'SCHOOL'>('ALL');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Form States
  const [titleInput, setTitleInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('Toán');
  const [gradeInput, setGradeInput] = useState('Khối 4');
  const [visibilityInput, setVisibilityInput] = useState<'PRIVATE' | 'TEAM' | 'SCHOOL'>('PRIVATE');
  const [formError, setFormError] = useState('');

  // Handle Create Quiz
  const handleOpenCreate = () => {
    setTitleInput('');
    setSubjectInput('Toán');
    setGradeInput('Khối 4');
    setVisibilityInput('PRIVATE');
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      setFormError('Vui lòng nhập tên bài học!');
      return;
    }

    const newQuiz = addQuiz(titleInput, subjectInput, gradeInput, visibilityInput);
    showToast(`Đã tạo bộ câu hỏi "${newQuiz.title}"!`, 'success');
    setIsCreateOpen(false);
    navigate(`/teacher/quizzes/${newQuiz.id}`);
  };

  // Handle Duplicate / Copy to My Bank
  const handleDuplicate = (quizId: string, isCopyToMyBank: boolean = false) => {
    const copy = duplicateQuiz(quizId);
    if (isCopyToMyBank) {
      updateQuizVisibility(copy.id, 'PRIVATE');
      showToast(`Đã sao chép bộ câu hỏi về Ngân hàng cá nhân của bạn!`, 'success');
    } else {
      showToast(`Đã nhân bản thành "${copy.title}"!`, 'success');
    }
  };

  // Handle Delete Confirm
  const handleOpenDelete = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!activeQuiz) return;
    deleteQuiz(activeQuiz.id);
    showToast(`Đã xóa bộ câu hỏi "${activeQuiz.title}"!`, 'info');
    setIsDeleteOpen(false);
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const vis = q.visibility || 'PRIVATE';
    if (scopeFilter === 'ALL') return true;
    return vis === scopeFilter;
  });

  const getVisibilityBadge = (vis?: 'PRIVATE' | 'TEAM' | 'SCHOOL') => {
    switch (vis) {
      case 'SCHOOL':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Globe2 className="w-3 h-3" /> Toàn trường
          </Badge>
        );
      case 'TEAM':
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Nội bộ Tổ
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="flex items-center gap-1">
            <Lock className="w-3 h-3" /> Cá nhân
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ngân Hàng Câu Hỏi"
        description="Quản lý bộ câu hỏi cá nhân, chia sẻ nội bộ Tổ chuyên môn và toàn Trường"
        action={
          <div className="flex items-center gap-3">
            <Button variant="warning" size="lg" onClick={() => navigate('/teacher/ai')} className="font-bold text-slate-950">
              <Sparkles className="w-5 h-5 mr-1" /> TẠO CÂU HỎI VỚI AI
            </Button>
            <Button variant="primary" size="lg" onClick={handleOpenCreate}>
              <Plus className="w-5 h-5 mr-1" /> Tạo bộ câu hỏi thủ công
            </Button>
          </div>
        }
      />

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-3 flex-wrap">
        <button
          onClick={() => setScopeFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            scopeFilter === 'ALL'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          TẤT CẢ PHẠM VI ({quizzes.length})
        </button>
        <button
          onClick={() => setScopeFilter('PRIVATE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            scopeFilter === 'PRIVATE'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" /> CÁ NHÂN (PRIVATE)
        </button>
        <button
          onClick={() => setScopeFilter('TEAM')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            scopeFilter === 'TEAM'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> NỘI BỘ TỔ (TEAM)
        </button>
        <button
          onClick={() => setScopeFilter('SCHOOL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            scopeFilter === 'SCHOOL'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" /> TOÀN TRƯỜNG (SCHOOL)
        </button>
      </div>

      {/* Quiz List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="flex flex-col justify-between hover:shadow-md transition-shadow bg-white border-2 border-slate-200">
            <div>
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="warning">{quiz.subject}</Badge>
                  {getVisibilityBadge(quiz.visibility)}
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shrink-0">
                  {quiz.grade}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 mb-2 leading-snug">{quiz.title}</h3>
              <p className="text-xs text-slate-500 mb-4">
                Số lượng: <span className="font-bold text-amber-700">{quiz.questions.length} câu hỏi</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/teacher/quizzes/${quiz.id}`)}
                >
                  <Edit3 className="w-4 h-4 mr-1" /> Mở & Sửa
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(quiz.id, false)}
                  title="Nhân bản bộ câu hỏi"
                >
                  <Copy className="w-4 h-4 text-slate-600" />
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenDelete(quiz)}
                  title="Xóa bộ câu hỏi"
                  className="hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>

              {/* Copy to My Bank Button for Shared Quizzes */}
              {(quiz.visibility === 'TEAM' || quiz.visibility === 'SCHOOL') && (
                <Button
                  variant="warning"
                  size="sm"
                  className="w-full font-bold text-slate-950 text-xs"
                  onClick={() => handleDuplicate(quiz.id, true)}
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" /> Sao chép vào ngân hàng của tôi
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Create Quiz */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo Bộ Câu Hỏi Mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveCreate}>Tạo bộ câu hỏi</Button>
          </>
        }
      >
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <Input
            label="Tên Bài / Bộ Câu Hỏi"
            placeholder="Ví dụ: Phép nhân với số có hai chữ số..."
            value={titleInput}
            onChange={(e) => {
              setTitleInput(e.target.value);
              setFormError('');
            }}
            error={formError}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Môn Học</label>
            <select
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none"
            >
              {SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Khối</label>
            <select
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none"
            >
              <option value="Khối 1">Khối 1</option>
              <option value="Khối 2">Khối 2</option>
              <option value="Khối 3">Khối 3</option>
              <option value="Khối 4">Khối 4</option>
              <option value="Khối 5">Khối 5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phạm vi chia sẻ</label>
            <select
              value={visibilityInput}
              onChange={(e) => setVisibilityInput(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none font-bold"
            >
              <option value="PRIVATE">Cá nhân (Chỉ bạn nhìn thấy)</option>
              <option value="TEAM">Nội bộ Tổ chuyên môn</option>
              <option value="SCHOOL">Toàn trường (Chia sẻ với tất cả giáo viên)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Confirm Delete Quiz */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Bộ Câu Hỏi"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Xóa bộ đề</Button>
          </>
        }
      >
        <div className="flex items-start gap-4 p-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              Bạn có chắc muốn xóa bộ câu hỏi <span className="text-rose-600">{activeQuiz?.title}</span>?
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Mọi câu hỏi thuộc bộ đề này cũng sẽ bị xóa vĩnh viễn.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
