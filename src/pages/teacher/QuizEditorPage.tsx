import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SchoolService } from '../../services/school/SchoolService';
import { useQuestionBank, copyQuestion, type BankQuestion } from '../../services/questionBank/useQuestionBank';
import { QuestionBankBrowser } from '../../components/teacher/QuestionBankBrowser';
import type { Question, QuestionDifficulty, QuestionType } from '../../types';
import {
  ArrowLeft,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const QuizEditorPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { quizzes, addQuestion, addQuestions, updateQuestion, duplicateQuestion, deleteQuestion, moveQuestion } =
    useTeacherData();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);

  const bank = useQuestionBank();
  const [bankOpen, setBankOpen] = useState(false);
  const [bankSelected, setBankSelected] = useState<string[]>([]);
  const [bankBusy, setBankBusy] = useState(false);
  const [savingToBank, setSavingToBank] = useState<Question | null>(null);
  const [bankTopic, setBankTopic] = useState('');
  const [bankDifficulty, setBankDifficulty] = useState<QuestionDifficulty | ''>('');

  const currentQuiz = quizzes.find((q) => q.id === quizId);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

  // Form Fields State
  const [qType, setQType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [qContent, setQContent] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctChoice, setCorrectChoice] = useState<string>('A'); // A, B, C, D or 'Đúng' / 'Sai' or string
  const [qExplanation, setQExplanation] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [correctPoints, setCorrectPoints] = useState(10);
  const [wrongPenalty, setWrongPenalty] = useState(5);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!currentUser?.uid) {
      setIsSchoolAdmin(false);
      return;
    }

    SchoolService.getUser(currentUser.uid)
      .then((profile) => {
        if (!cancelled) setIsSchoolAdmin(profile?.role === 'SCHOOL_ADMIN');
      })
      .catch(() => {
        if (!cancelled) setIsSchoolAdmin(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid]);

  const canEdit = Boolean(
    currentQuiz &&
    (currentQuiz.teacherId === currentUser?.uid || isSchoolAdmin)
  );

  if (!currentQuiz) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy bộ câu hỏi</h2>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/teacher/quizzes')}>
          Quay lại Ngân hàng câu hỏi
        </Button>
      </div>
    );
  }

  // --- OPEN ADD QUESTION FORM ---
  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setQType('MULTIPLE_CHOICE');
    setQContent('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectChoice('A');
    setQExplanation('');
    setCaseInsensitive(true);
    setTrimWhitespace(true);
    setCorrectPoints(10);
    setWrongPenalty(5);
    setFormError('');
    setIsFormOpen(true);
  };

  // --- OPEN EDIT QUESTION FORM ---
  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setQType(q.type);
    setQContent(q.content);
    setQExplanation(q.explanation || '');
    setCaseInsensitive(q.caseInsensitive ?? true);
    setTrimWhitespace(q.trimWhitespace ?? true);
    setCorrectPoints(q.correctPoints ?? 10);
    setWrongPenalty(q.wrongPenalty ?? 5);

    if (q.type === 'MULTIPLE_CHOICE' && q.options) {
      setOptA(q.options[0] || '');
      setOptB(q.options[1] || '');
      setOptC(q.options[2] || '');
      setOptD(q.options[3] || '');
      // Support both legacy A/B/C/D keys and newer stored option text.
      if (/^[A-D]$/i.test(q.correctAnswer.trim())) {
        setCorrectChoice(q.correctAnswer.trim().toUpperCase());
      } else {
        const foundIdx = q.options.indexOf(q.correctAnswer);
        setCorrectChoice(foundIdx !== -1 ? String.fromCharCode(65 + foundIdx) : 'A');
      }
    } else if (q.type === 'TRUE_FALSE') {
      setCorrectChoice(q.correctAnswer || 'Đúng');
    } else if (['SHORT_ANSWER', 'FILL_BLANK', 'ORDERING'].includes(q.type)) {
      setCorrectChoice(q.type === 'ORDERING' ? (q.correctAnswer || '').split(' → ').join('\n') : q.correctAnswer || '');
    }

    setFormError('');
    setIsFormOpen(true);
  };

  // --- SAVE QUESTION (CREATE / UPDATE) ---
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!qContent.trim()) {
      setFormError('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    let finalOptions: string[] | undefined = undefined;
    let finalCorrectAnswer = '';

    if (qType === 'MULTIPLE_CHOICE') {
      if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
        setFormError('Trắc nghiệm yêu cầu nhập đầy đủ 4 đáp án A, B, C, D!');
        return;
      }
      finalOptions = [optA.trim(), optB.trim(), optC.trim(), optD.trim()];
      const choiceMap: Record<string, string> = {
        A: optA.trim(),
        B: optB.trim(),
        C: optC.trim(),
        D: optD.trim(),
      };
      finalCorrectAnswer = choiceMap[correctChoice] || optA.trim();
    } else if (qType === 'TRUE_FALSE') {
      finalOptions = ['Đúng', 'Sai'];
      finalCorrectAnswer = correctChoice === 'Sai' ? 'Sai' : 'Đúng';
    } else if (['SHORT_ANSWER', 'FILL_BLANK', 'ORDERING'].includes(qType)) {
      if (!correctChoice.trim()) {
        setFormError('Vui lòng nhập đáp án đúng cho câu trả lời ngắn!');
        return;
      }
      finalCorrectAnswer = correctChoice.trim();
      if (qType === 'ORDERING') {
        const steps = correctChoice.split('\n').map((s) => s.trim()).filter(Boolean);
        if (steps.length < 2 || steps.length > 8 || new Set(steps).size !== steps.length) {
          setFormError('Sắp xếp cần 2–8 mục khác nhau, mỗi mục một dòng theo thứ tự đúng.');
          return;
        }
        finalOptions = [...steps].sort((a, b) => a.localeCompare(b, 'vi'));
        finalCorrectAnswer = steps.join(' → ');
      }
    }

    if (correctPoints < 0 || wrongPenalty < 0) {
      setFormError('Điểm cộng và điểm trừ phải là số từ 0 trở lên.');
      return;
    }

    const questionData: Omit<Question, 'id'> = {
      type: qType,
      content: qContent.trim(),
      options: finalOptions,
      correctAnswer: finalCorrectAnswer,
      explanation: qExplanation.trim() || undefined,
      correctPoints,
      wrongPenalty,
      ...(['SHORT_ANSWER', 'FILL_BLANK', 'ORDERING'].includes(qType)
        ? {
            caseInsensitive,
            trimWhitespace,
          }
        : {}),
    };

    try {
      if (editingQuestion) {
        await updateQuestion(currentQuiz.id, editingQuestion.id, questionData);
        showToast('Đã cập nhật và lưu câu hỏi!', 'success');
      } else {
        await addQuestion(currentQuiz.id, questionData);
        showToast('Đã thêm và lưu câu hỏi mới!', 'success');
      }

      setIsFormOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Không thể lưu câu hỏi.', 'error');
    }
  };

  // --- QUESTION ACTIONS ---
  const handleDuplicate = async (questionId: string) => {
    try {
      await duplicateQuestion(currentQuiz.id, questionId);
      showToast('Đã nhân bản và lưu câu hỏi!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể nhân bản câu hỏi.', 'error');
    }
  };

  const handleOpenDelete = (q: Question) => {
    setDeletingQuestion(q);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuestion) return;
    try {
      await deleteQuestion(currentQuiz.id, deletingQuestion.id);
      showToast('Đã xóa câu hỏi khỏi hệ thống!', 'info');
      setIsDeleteOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Không thể xóa câu hỏi.', 'error');
    }
  };

  const handleMove = async (questionId: string, direction: 'up' | 'down') => {
    try {
      await moveQuestion(currentQuiz.id, questionId, direction);
    } catch (err: any) {
      showToast(err?.message || 'Không thể thay đổi thứ tự câu hỏi.', 'error');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate('/teacher/quizzes')}
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Ngân hàng câu hỏi
        </button>
      </div>

      <PageHeader
        title={currentQuiz.title.toUpperCase()}
        description={`Môn: ${currentQuiz.subject} • Khối: ${currentQuiz.grade} • Tổng số: ${currentQuiz.questions.length} câu hỏi`}
        action={
          canEdit ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { setBankSelected([]); setBankOpen(true); }}>Lấy từ kho câu hỏi</Button>
              <Button variant="primary" size="lg" onClick={handleOpenAdd}><Plus className="w-5 h-5 mr-1" /> THÊM CÂU HỎI</Button>
            </div>
          ) : (
            <Badge variant="info">CHỈ XEM • Bộ câu hỏi được chia sẻ</Badge>
          )
        }
      />

      {/* Question List */}
      <div className="space-y-4">
        {currentQuiz.questions.length === 0 ? (
          <Card className="text-center py-12 text-slate-400 font-medium">
            {canEdit
              ? 'Bộ đề này chưa có câu hỏi nào. Bấm nút "+ THÊM CÂU HỎI" ở trên để tạo câu hỏi đầu tiên.'
              : 'Bộ câu hỏi được chia sẻ hiện chưa có câu hỏi.'}
          </Card>
        ) : (
          currentQuiz.questions.map((q, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === currentQuiz.questions.length - 1;

            return (
              <Card key={q.id} className="p-6">
                <div className="flex flex-wrap gap-3 items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-bold text-sm flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-900 text-base">Câu {idx + 1}</span>
                    <Badge
                      variant={
                        q.type === 'MULTIPLE_CHOICE'
                          ? 'info'
                          : q.type === 'TRUE_FALSE'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {q.type === 'MULTIPLE_CHOICE'
                        ? 'Trắc nghiệm A/B/C/D'
                        : q.type === 'TRUE_FALSE'
                        ? 'Đúng / Sai'
                        : q.type === 'ORDERING' ? 'Sắp xếp thứ tự' : q.type === 'FILL_BLANK' ? 'Điền chỗ trống' : 'Trả lời ngắn'}
                    </Badge>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      Đúng +{q.correctPoints ?? 10}
                    </span>
                    <span className="text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      Sai -{q.wrongPenalty ?? 5}
                    </span>
                  </div>

                  <Button variant="outline" size="sm" disabled={bankBusy} onClick={() => { setSavingToBank(q); setBankTopic(''); setBankDifficulty(q.difficulty || ''); }}>Lưu vào kho</Button>
                  {/* Move Up/Down & Action Buttons */}
                  {canEdit && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMove(q.id, 'up')}
                        disabled={isFirst}
                        title="Di chuyển lên"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMove(q.id, 'down')}
                        disabled={isLast}
                        title="Di chuyển xuống"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(q)}>
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Sửa
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleDuplicate(q.id)}>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Nhân bản
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenDelete(q)}
                        className="hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 mr-1" /> Xóa
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <h4 className="text-lg font-bold text-slate-900 mb-4">{q.content}</h4>

                {/* Options if MC */}
                {q.type === 'MULTIPLE_CHOICE' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    {q.options.map((opt, i) => {
                      const isCorrect =
                        opt === q.correctAnswer ||
                        q.correctAnswer.trim().toUpperCase() === String.fromCharCode(65 + i);
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-extrabold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>
                            <strong className="mr-1.5">{String.fromCharCode(65 + i)}.</strong> {opt}
                          </span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Answer if True/False or Short Answer */}
                {q.type === 'TRUE_FALSE' && (
                  <div className="mb-4">
                    <span className="text-xs text-slate-500 block mb-1">Đáp án chọn:</span>
                    <span className="inline-block px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-sm border border-emerald-300">
                      Đáp án đúng: {q.correctAnswer}
                    </span>
                  </div>
                )}

                {['SHORT_ANSWER', 'FILL_BLANK', 'ORDERING'].includes(q.type) && (
                  <div className="mb-4">
                    <span className="text-xs text-slate-500 block mb-1">Đáp án ngắn đúng:</span>
                    <span className="inline-block px-4 py-2 rounded-xl bg-amber-100 text-amber-900 font-bold text-sm border border-amber-300">
                      {q.correctAnswer}
                    </span>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3 rounded-xl bg-slate-100 text-xs text-slate-600">
                    <strong className="text-slate-800">Giải thích đáp án:</strong> {q.explanation}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <Modal isOpen={bankOpen} onClose={() => { if (!bankBusy) setBankOpen(false); }} title="Lấy câu hỏi từ kho" footer={<>
        <Button variant="secondary" disabled={bankBusy} onClick={() => setBankOpen(false)}>Đóng</Button>
        <Button variant="primary" disabled={bankBusy || !bankSelected.length || bank.loading || !!bank.error} onClick={async () => {
          setBankBusy(true);
          try {
            const chosen = bank.items.filter((item) => bankSelected.includes(item.id));
            await addQuestions(currentQuiz.id, chosen.map((item) => copyQuestion(item.question)));
            setBankOpen(false); setBankSelected([]); showToast(`Đã thêm ${chosen.length} câu từ kho!`, 'success');
          } catch (err) { showToast(err instanceof Error ? err.message : 'Không thể thêm câu hỏi.', 'error'); }
          finally { setBankBusy(false); }
        }}>{bankBusy ? 'Đang thêm…' : `Thêm ${bankSelected.length} câu`}</Button>
      </>}>
        <p className="text-sm text-slate-600 mb-3">Chọn câu hỏi để tạo bản sao vào bộ đề này. Sau đó thầy có thể sửa riêng từng câu.</p>
        {bank.loading ? <p>Đang tải kho…</p> : bank.error ? <p role="alert" className="text-rose-700">{bank.error}</p> : <QuestionBankBrowser items={bank.items} selected={bankSelected} onSelect={(id) => setBankSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])} />}
      </Modal>
      <Modal isOpen={!!savingToBank} onClose={() => { if (!bankBusy) setSavingToBank(null); }} title="Lưu câu hỏi để dùng lại" footer={<>
        <Button variant="secondary" disabled={bankBusy} onClick={() => setSavingToBank(null)}>Hủy</Button>
        <Button variant="primary" disabled={bankBusy || bank.loading || !!bank.error} onClick={async () => {
          if (!savingToBank) return;
          setBankBusy(true);
          try {
            const question = copyQuestion(savingToBank);
            if (question.type === 'MULTIPLE_CHOICE' && /^[A-D]$/i.test(question.correctAnswer.trim()) && question.options) {
              question.correctAnswer = question.options[question.correctAnswer.trim().toUpperCase().charCodeAt(0) - 65];
            }
            if (bankDifficulty) question.difficulty = bankDifficulty;
            const existing: BankQuestion | undefined = bank.items.find((item) => item.subject === currentQuiz.subject && item.grade === currentQuiz.grade && item.topic === bankTopic.trim() && JSON.stringify(copyQuestion(item.question)) === JSON.stringify(question));
            if (existing) { showToast('Câu hỏi này đã có trong kho cùng chủ đề.', 'info'); }
            else { await bank.save({ subject: currentQuiz.subject, grade: currentQuiz.grade, topic: bankTopic.trim(), question }); showToast('Đã lưu câu hỏi vào kho Firebase!', 'success'); }
            setSavingToBank(null);
          } catch (err) { showToast(err instanceof Error ? err.message : 'Không thể lưu vào kho.', 'error'); }
          finally { setBankBusy(false); }
        }}>{bankBusy ? 'Đang lưu…' : 'Lưu vào kho'}</Button>
      </>}>
        <p className="font-semibold text-slate-900 mb-3">{savingToBank?.content}</p>
        <p className="text-sm text-slate-600 mb-3">{currentQuiz.grade} • {currentQuiz.subject} • Kho riêng của thầy</p>
        <label className="block text-sm font-semibold">Chủ đề / Bài học<input value={bankTopic} onChange={(e) => setBankTopic(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 mt-1 mb-3" placeholder="Ví dụ: Phân số, Bài 5…" /></label>
        <label className="block text-sm font-semibold">Mức độ<select value={bankDifficulty} onChange={(e) => setBankDifficulty(e.target.value as QuestionDifficulty | '')} className="w-full border border-slate-300 rounded-xl p-3 mt-1"><option value="">Chưa phân loại</option><option value="KNOWLEDGE">Nhận biết</option><option value="UNDERSTANDING">Thông hiểu</option><option value="APPLICATION">Vận dụng</option></select></label>
        {bank.error && <p role="alert" className="text-rose-700">{bank.error}</p>}
      </Modal>
      {/* Modal Form Question Add/Edit */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveQuestion}>Lưu câu hỏi</Button>
          </>
        }
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          {/* Question Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại Câu Hỏi</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQType('MULTIPLE_CHOICE')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                  qType === 'MULTIPLE_CHOICE'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                A/B/C/D Trắc nghiệm
              </button>
              <button
                type="button"
                onClick={() => setQType('TRUE_FALSE')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                  qType === 'TRUE_FALSE'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Đúng / Sai
              </button>
              <button
                type="button"
                onClick={() => setQType('SHORT_ANSWER')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                  qType === 'SHORT_ANSWER'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Trả lời ngắn
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['FILL_BLANK', 'ORDERING'] as QuestionType[]).map((type) => (
              <button key={type} type="button" onClick={() => { setQType(type); setCorrectChoice(''); }} className={`px-4 py-3 rounded-xl border font-bold ${qType === type ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}>
                {type === 'FILL_BLANK' ? 'Điền chỗ trống' : 'Sắp xếp thứ tự'}
              </button>
            ))}
          </div>
          {/* Question Content */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nội Dung Câu Hỏi *</label>
            <textarea
              rows={3}
              placeholder="Nhập nội dung câu hỏi..."
              value={qContent}
              onChange={(e) => {
                setQContent(e.target.value);
                setFormError('');
              }}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 font-medium focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          {/* Type Specific Fields */}
          {qType === 'MULTIPLE_CHOICE' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h5 className="text-xs font-bold text-slate-600 uppercase">Các lựa chọn A, B, C, D:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Đáp án A"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Đáp án B"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Đáp án C"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Đáp án D"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Chọn Đáp Án Đúng *</label>
                <div className="flex gap-4">
                  {['A', 'B', 'C', 'D'].map((letter) => (
                    <label key={letter} className="flex items-center gap-1.5 cursor-pointer font-bold text-sm">
                      <input
                        type="radio"
                        name="correctChoice"
                        value={letter}
                        checked={correctChoice === letter}
                        onChange={(e) => setCorrectChoice(e.target.value)}
                        className="w-4 h-4 text-sky-600"
                      />
                      {letter}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {qType === 'TRUE_FALSE' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Đáp Án Đúng *</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-base text-emerald-800">
                  <input
                    type="radio"
                    name="tfChoice"
                    value="Đúng"
                    checked={correctChoice === 'Đúng'}
                    onChange={(e) => setCorrectChoice(e.target.value)}
                    className="w-5 h-5 text-emerald-600"
                  />
                  Đúng
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-base text-rose-800">
                  <input
                    type="radio"
                    name="tfChoice"
                    value="Sai"
                    checked={correctChoice === 'Sai'}
                    onChange={(e) => setCorrectChoice(e.target.value)}
                    className="w-5 h-5 text-rose-600"
                  />
                  Sai
                </label>
              </div>
            </div>
          )}

          {['SHORT_ANSWER', 'FILL_BLANK', 'ORDERING'].includes(qType) && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{qType === 'ORDERING' ? 'Thứ tự đúng: mỗi mục một dòng (2–8 mục)' : 'Đáp án đúng chuẩn *'}</label>
                <textarea
                  rows={qType === 'ORDERING' ? 5 : 2}
                  placeholder={qType === 'ORDERING' ? 'Mục thứ nhất\nMục thứ hai\nMục thứ ba' : 'Ví dụ: Hà Nội hoặc 150'}
                  value={correctChoice}
                  onChange={(e) => setCorrectChoice(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={caseInsensitive}
                    onChange={(e) => setCaseInsensitive(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  Không phân biệt chữ hoa / chữ thường
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trimWhitespace}
                    onChange={(e) => setTrimWhitespace(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  Bỏ qua khoảng trắng đầu / cuối
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1.5">
                Điểm cộng khi đúng
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={correctPoints}
                onChange={(e) => setCorrectPoints(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-emerald-300 px-3 py-2 text-base font-black text-emerald-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-rose-800 mb-1.5">
                Điểm trừ khi sai
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={wrongPenalty}
                onChange={(e) => setWrongPenalty(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-rose-300 px-3 py-2 text-base font-black text-rose-900"
              />
            </div>
            <p className="col-span-2 text-[11px] text-slate-600 font-semibold">
              Học sinh không trả lời sẽ không cộng hoặc trừ điểm.
            </p>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Giải Thích Đáp Án (Không bắt buộc)
            </label>
            <textarea
              rows={2}
              placeholder="Nhập giải thích cho học sinh sau khi hiện kết quả..."
              value={qExplanation}
              onChange={(e) => setQExplanation(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {formError && <p className="text-sm font-bold text-rose-600">{formError}</p>}
        </form>
      </Modal>

      {/* Modal Confirm Delete Question */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Câu Hỏi"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Xóa câu hỏi</Button>
          </>
        }
      >
        <div className="flex items-start gap-4 p-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Bạn có chắc muốn xóa câu hỏi này?</h4>
            <p className="mt-1 text-sm text-slate-500">{deletingQuestion?.content}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
