import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { AiQuestionGeneratorModal } from '../../components/teacher/AiQuestionGeneratorModal';
import { PracticeService } from '../../services/practice/PracticeService';
import type { PracticeQuestion, PracticeType, PracticeFeedbackMode } from '../../services/practice/types';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  BookOpen,
  Trash2,
  Users,
  ArrowLeft,
  Send,
} from 'lucide-react';

export const PracticeEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { practiceSetId } = useParams<{ practiceSetId?: string }>();
  const { classes, quizzes } = useTeacherData();
  const { showToast } = useToast();

  const stateData = location.state || {};

  // Form State
  const [title, setTitle] = useState<string>(stateData.topic ? `Bài ôn tập: ${stateData.topic}` : '');
  const [selectedClassId, setSelectedClassId] = useState<string>(stateData.classId || classes[0]?.id || '');
  const [subject, setSubject] = useState<string>(stateData.subject || 'Toán');
  const [grade, setGrade] = useState<string>(stateData.grade || '4');
  const [type, setType] = useState<PracticeType>(stateData.type || 'REMEDIATION');
  const [dueAt, setDueAt] = useState<string>('');
  const [allowRetry, setAllowRetry] = useState<boolean>(false);
  const [feedbackMode, setFeedbackMode] = useState<PracticeFeedbackMode>('AFTER_FINISH');

  // Questions State
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isQuizBankModalOpen, setIsQuizBankModalOpen] = useState<boolean>(false);

  // Student Assignment Target State
  const [assignTarget, setAssignTarget] = useState<'WHOLE_CLASS' | 'SELECTED_STUDENTS'>('SELECTED_STUDENTS');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(stateData.suggestedStudentIds || []);

  // Modal Confirm Assign State
  const [isAssignConfirmOpen, setIsAssignConfirmOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const targetClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  useEffect(() => {
    if (practiceSetId) {
      PracticeService.getPracticeSetDetail(practiceSetId).then((set) => {
        if (set) {
          setTitle(set.title);
          setSelectedClassId(set.classId);
          setSubject(set.subject);
          setGrade(set.grade);
          setType(set.type);
          setDueAt(set.dueAt ? set.dueAt.substring(0, 10) : '');
          setAllowRetry(set.allowRetry || false);
          setFeedbackMode(set.feedbackMode || 'AFTER_FINISH');
          setQuestions(set.questions);
          setSelectedStudentIds(Object.keys(set.assignments || {}));
          if (Object.keys(set.assignments || {}).length === targetClass?.students.length) {
            setAssignTarget('WHOLE_CLASS');
          }
        }
      });
    }
  }, [practiceSetId]);

  // Handle AI question proposals addition
  const handleAddAiQuestions = (aiQuestions: any[]) => {
    const formatted: PracticeQuestion[] = aiQuestions.map((q, idx) => ({
      id: `pq-${Date.now()}-${idx}`,
      type: q.type,
      content: q.content,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

    setQuestions((prev) => [...prev, ...formatted]);
    showToast(`Đã thêm ${formatted.length} câu hỏi AI đề xuất vào bài ôn!`, 'success');
  };

  // Handle Quiz Bank question selection
  const handleImportQuizQuestions = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz || quiz.questions.length === 0) {
      showToast('Bộ đề này không có câu hỏi!', 'info');
      return;
    }

    const imported: PracticeQuestion[] = quiz.questions.map((q, idx) => ({
      id: `pq-bank-${Date.now()}-${idx}`,
      type: q.type,
      content: q.content,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

    setQuestions((prev) => [...prev, ...imported]);
    setIsQuizBankModalOpen(false);
    showToast(`Đã thêm ${imported.length} câu hỏi từ bộ đề "${quiz.title}"!`, 'success');
  };

  const handleToggleStudentSelection = (sId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(sId) ? prev.filter((id) => id !== sId) : [...prev, sId]
    );
  };

  // Save / Assign Action
  const handleConfirmAssign = async () => {
    if (!title.trim()) {
      showToast('Vui lòng nhập tên bài ôn tập!', 'info');
      return;
    }
    if (questions.length === 0) {
      showToast('Hãy thêm ít nhất 1 câu hỏi vào bài ôn tập!', 'info');
      return;
    }

    const finalStudentList = assignTarget === 'WHOLE_CLASS'
      ? (targetClass?.students || []).map((s) => ({ id: s.id, name: s.name }))
      : (targetClass?.students || [])
          .filter((s) => selectedStudentIds.includes(s.id))
          .map((s) => ({ id: s.id, name: s.name }));

    if (finalStudentList.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 học sinh để giao bài!', 'info');
      return;
    }

    setIsSaving(true);
    try {
      const practiceSet = await PracticeService.createPracticeSet({
        teacherId: 'teacher-1',
        classId: targetClass.id,
        className: targetClass.name,
        subject,
        grade,
        title: title.trim(),
        type,
        status: 'ASSIGNED',
        dueAt: dueAt ? `${dueAt}T23:59:59.000Z` : undefined,
        allowRetry,
        maxAttempts: allowRetry ? 2 : 1,
        feedbackMode,
        createdBy: 'Thầy Hương',
        source: stateData.topic ? 'HISTORY_REMEDIATION' : 'QUESTION_BANK',
        questions,
      });

      await PracticeService.assignPracticeSet(practiceSet.id, finalStudentList, practiceSet.dueAt);

      showToast(`Đã giao thành công bài ôn cho ${finalStudentList.length} học sinh lớp ${targetClass.name}!`, 'success');
      setIsAssignConfirmOpen(false);
      navigate('/teacher/practice');
    } catch {
      showToast('Lỗi khi giao bài ôn tập. Hãy thử lại.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <button
          onClick={() => navigate('/teacher/remediation')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title="Quay lại Hub Ôn tập"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">
            {practiceSetId ? 'CHỈNH SỬA BÀI ÔN TẬP' : 'TẠO BÀI ÔN TẬP PHÂN HÓA MỚI'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Biên soạn câu hỏi và giao nhiệm vụ cho cả lớp hoặc từng nhóm học sinh
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Question Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Metadata */}
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b pb-2">1. THÔNG TIN BÀI ÔN TẬP</h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên bài ôn tập / Nhiệm vụ:</label>
              <Input
                placeholder="Ví dụ: Củng cố phép chia có dư..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-bold">
              <div>
                <label className="text-slate-700 block mb-1">Lớp học mục tiêu:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Môn học:</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Toán">Toán</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Khoa học">Khoa học</option>
                  <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
                  <option value="Tin học">Tin học</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Loại nhiệm vụ:</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="REMEDIATION">Củng cố</option>
                  <option value="PRACTICE">Luyện tập</option>
                  <option value="ADVANCED">Nâng cao</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Question List Editor */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">2. DANH SÁCH CÂU HỎI ({questions.length} CÂU)</h3>
                <p className="text-xs text-slate-500 font-medium">Thêm câu hỏi từ AI hoặc Ngân hàng câu hỏi</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsQuizBankModalOpen(true)}>
                  <BookOpen className="w-4 h-4 mr-1 text-sky-600" /> Ngân hàng câu hỏi
                </Button>
                <Button variant="warning" size="sm" onClick={() => setIsAiModalOpen(true)} className="text-slate-950 font-bold">
                  <Sparkles className="w-4 h-4 mr-1" /> AI đề xuất
                </Button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                <p className="text-xs text-slate-500 font-medium">
                  Chưa có câu hỏi nào trong bài ôn tập này.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => setIsQuizBankModalOpen(true)}>
                    <BookOpen className="w-4 h-4 mr-1" /> Dùng câu hỏi có sẵn
                  </Button>
                  <Button variant="warning" size="sm" onClick={() => setIsAiModalOpen(true)} className="text-slate-950">
                    <Sparkles className="w-4 h-4 mr-1" /> AI sinh câu hỏi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sky-700 text-xs">Câu {idx + 1}</span>
                        <Badge variant="info" size="sm">{q.type}</Badge>
                      </div>

                      <button
                        onClick={() => setQuestions((prev) => prev.filter((item) => item.id !== q.id))}
                        className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                        title="Xóa câu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{q.content}</h4>

                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, oIdx) => {
                          const letter = String.fromCharCode(65 + oIdx);
                          const isCorrect = q.correctAnswer === letter;
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-xl border ${
                                isCorrect ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-950' : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <strong>{letter}.</strong> {opt}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Student Assignment Target & Settings */}
        <div className="space-y-6">
          {/* Target Student Selection */}
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" /> 3. ĐỐI TƯỢNG GIAO BÀI
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs font-bold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="assignTarget"
                    checked={assignTarget === 'WHOLE_CLASS'}
                    onChange={() => setAssignTarget('WHOLE_CLASS')}
                    className="text-sky-600"
                  />
                  <span>Giao cho CẢ LỚP ({targetClass?.students.length} HS)</span>
                </label>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="assignTarget"
                    checked={assignTarget === 'SELECTED_STUDENTS'}
                    onChange={() => setAssignTarget('SELECTED_STUDENTS')}
                    className="text-sky-600"
                  />
                  <span>CHỌN HỌC SINH NHÓM ÔN ({selectedStudentIds.length} em)</span>
                </label>
              </div>

              {assignTarget === 'SELECTED_STUDENTS' && (
                <div className="max-h-[220px] overflow-y-auto space-y-1.5 border rounded-xl p-2 bg-slate-50 text-xs">
                  {targetClass?.students.map((s) => {
                    const isChecked = selectedStudentIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-sky-100 font-bold text-sky-950' : 'bg-white text-slate-700'
                        }`}
                      >
                        <span>{s.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStudentSelection(s.id)}
                          className="rounded text-sky-600"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Settings Card */}
          <Card className="p-5 space-y-4 text-xs font-bold">
            <h3 className="font-bold text-slate-900 text-base border-b pb-2">4. CÀI ĐẶT NHIỆM VỤ</h3>

            <div>
              <label className="text-slate-700 block mb-1">Hạn nộp bài (Due Date):</label>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowRetry}
                  onChange={(e) => setAllowRetry(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <span>Cho phép làm lại 1 lần nếu kết quả chưa đạt</span>
              </label>

              <div>
                <label className="text-slate-700 block mb-1">Chế độ hiển thị đáp án:</label>
                <select
                  value={feedbackMode}
                  onChange={(e: any) => setFeedbackMode(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="AFTER_FINISH">Xem kết quả sau khi nộp toàn bộ bài</option>
                  <option value="TEACHER_ONLY">Chỉ Giáo viên xem kết quả</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setIsAssignConfirmOpen(true)}
              className="font-bold pt-3"
            >
              <Send className="w-5 h-5 mr-2 inline" /> XÁC NHẬN & GIAO BÀI ÔN TẬP
            </Button>
          </Card>
        </div>
      </div>

      {/* MODAL: QUIZ BANK SELECTION */}
      <Modal
        isOpen={isQuizBankModalOpen}
        onClose={() => setIsQuizBankModalOpen(false)}
        title="Chọn Bộ Đề Từ Ngân Hàng Câu Hỏi"
      >
        <div className="space-y-3 max-h-[350px] overflow-y-auto text-xs">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-3 border rounded-xl flex justify-between items-center bg-slate-50 hover:bg-sky-50 transition-colors"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{quiz.title}</h4>
                <p className="text-slate-500">
                  {quiz.subject} • Khối {quiz.grade} • {quiz.questions.length} câu
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleImportQuizQuestions(quiz.id)}>
                Lấy câu hỏi
              </Button>
            </div>
          ))}
        </div>
      </Modal>

      {/* MODAL: AI QUESTION GENERATOR */}
      <AiQuestionGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAddQuestionsToQuiz={handleAddAiQuestions}
        initialSubject={subject}
        initialGrade={grade}
      />

      {/* MODAL: CONFIRM ASSIGNMENT */}
      <Modal
        isOpen={isAssignConfirmOpen}
        onClose={() => setIsAssignConfirmOpen(false)}
        title="Xác Nhận Giao Nhiệm Vụ Ôn Tập"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAssignConfirmOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleConfirmAssign} disabled={isSaving}>
              {isSaving ? 'Đang giao...' : 'XÁC NHẬN GIAO BÀI'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="font-bold text-slate-900 text-sm">
            Bạn sắp giao bài ôn tập <strong>"{title}"</strong> cho{' '}
            <strong className="text-sky-700">
              {assignTarget === 'WHOLE_CLASS' ? targetClass?.students.length : selectedStudentIds.length} học sinh
            </strong>{' '}
            lớp {targetClass?.name}.
          </p>
          <p className="text-slate-600">
            Học sinh sẽ nhìn thấy nhiệm vụ này khi mở ứng dụng phía Học sinh.
          </p>
        </div>
      </Modal>
    </div>
  );
};
