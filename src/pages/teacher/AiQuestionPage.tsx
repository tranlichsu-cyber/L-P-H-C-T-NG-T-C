import React, { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { AiQuestionGeneratorModal } from '../../components/teacher/AiQuestionGeneratorModal';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import type { AIGeneratedQuestion } from '../../services/ai/types';
import {
  Sparkles,
  Bot,
  FileText,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Layers3,
} from 'lucide-react';
import { aiService } from '../../services/ai/AIService';

export const AiQuestionPage: React.FC = () => {
  const { quizzes, addQuiz, addQuestion } = useTeacherData();
  const { showToast } = useToast();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [initialSourceMode, setInitialSourceMode] = useState<'topic' | 'text' | 'file'>('topic');
  const [selectedQuizId, setSelectedQuizId] = useState('');

  useEffect(() => {
    if (!selectedQuizId && quizzes.length > 0) {
      setSelectedQuizId(quizzes[0].id);
      return;
    }

    if (selectedQuizId && !quizzes.some((quiz) => quiz.id === selectedQuizId)) {
      setSelectedQuizId(quizzes[0]?.id || '');
    }
  }, [quizzes, selectedQuizId]);

  const targetQuiz = useMemo(
    () => quizzes.find((quiz) => quiz.id === selectedQuizId) || quizzes[0],
    [quizzes, selectedQuizId]
  );

  const handleOpenAi = (mode: 'topic' | 'text' | 'file' = 'topic') => {
    setInitialSourceMode(mode);
    setIsAiModalOpen(true);
  };

  const handleAddAiQuestions = async (
    newQuestions: AIGeneratedQuestion[],
    meta: { subject: string; grade: string; sourceName?: string }
  ) => {
    try {
      const destinationQuiz =
        targetQuiz ||
        (await addQuiz(
          meta.sourceName
            ? `AI - ${meta.sourceName.replace(/\.[^.]+$/, '').slice(0, 60)}`
            : `Bộ câu hỏi AI - ${meta.subject} lớp ${meta.grade}`,
          meta.subject,
          meta.grade,
          'PRIVATE'
        ));

      if (!targetQuiz) {
        setSelectedQuizId(destinationQuiz.id);
      }

      for (const q of newQuestions) {
        await addQuestion(destinationQuiz.id, {
          type: q.type,
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          source: 'AI',
          aiReviewed: true,
        });
      }

      showToast(
        `Đã thêm và lưu ${newQuestions.length} câu hỏi vào bộ đề "${destinationQuiz.title}"!`,
        'success'
      );
    } catch (err: any) {
      showToast(
        err?.message || 'Không thể lưu các câu hỏi AI vào Firestore.',
        'error'
      );
      throw err;
    }
  };

  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        title="TRỢ LÝ AI HỖ TRỢ GIÁO VIÊN"
        description="Tạo câu hỏi phù hợp học sinh tiểu học từ chủ đề, văn bản hoặc tài liệu — sau đó duyệt trước khi lưu vào Ngân hàng câu hỏi."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)] gap-5 items-start">
        <div className="space-y-5">
          <Card className="overflow-hidden border-0 p-0 shadow-xl shadow-slate-900/10">
            <div className="relative bg-gradient-to-br from-sky-950 via-blue-950 to-slate-950 text-white p-4 lg:p-5">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-sky-500/10 blur-2xl" />
              <div className="absolute -bottom-20 left-1/3 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="flex items-start gap-4 max-w-2xl">
                    <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                      <Bot className="w-6 h-6 lg:w-7 lg:h-7" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
                          Trợ lý soạn câu hỏi
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black border ${
                            aiService.isConfigured
                              ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30'
                              : 'bg-rose-400/10 text-rose-300 border-rose-400/30'
                          }`}
                        >
                          {aiService.isConfigured ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {aiService.isRealMode
                            ? 'Gemini đang hoạt động'
                            : aiService.isConfigured
                            ? 'Chế độ thử nghiệm'
                            : 'Chưa cấu hình Gemini'}
                        </span>
                      </div>

                      <h2 className="text-xl lg:text-2xl font-black leading-tight text-white">
                        Tạo câu hỏi bằng AI,
                        <span className="text-amber-300"> giáo viên duyệt trước khi dùng</span>
                      </h2>

                      <p className="mt-2 text-xs lg:text-sm leading-5 text-slate-300 max-w-xl">
                        Chọn nguồn nội dung, khối lớp, môn học và mức độ. AI đề xuất câu hỏi,
                        đáp án và giải thích; Thầy/Cô xem lại rồi mới đưa vào bộ câu hỏi.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="warning"
                    size="lg"
                    onClick={() => handleOpenAi('topic')}
                    disabled={!targetQuiz}
                    className="shrink-0 font-black px-6"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    BẮT ĐẦU TẠO
                  </Button>
                </div>

              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleOpenAi('topic')}
              className="text-left rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-white to-sky-50 p-4 hover:border-sky-400 hover:shadow-md transition disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-900">Tạo theo chủ đề</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Nhập tên bài học/chủ đề rồi để Gemini đề xuất câu hỏi.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-sky-600" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAi('file')}
              className="text-left rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-white to-violet-50 p-4 hover:border-violet-500 hover:shadow-md transition disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-violet-950">TẢI TÀI LIỆU LÊN</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    PDF, DOCX hoặc TXT — AI tạo câu hỏi bám sát nội dung tài liệu.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-violet-700" />
              </div>
            </button>
          </div>
        </div>

        <div className="xl:sticky xl:top-24">
          <Card className="border-2 border-sky-100 shadow-lg shadow-sky-900/5 p-5">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2 text-sky-700">
                  <Layers3 className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wide">
                    Bộ câu hỏi đích
                  </span>
                </div>
                <h3 className="mt-1 text-xl font-black text-slate-900">
                  AI sẽ thêm câu vào đâu?
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Chọn đúng bộ trước khi mở Trợ lý AI.
                </p>
              </div>

              <Badge variant="info">{quizzes.length} bộ</Badge>
            </div>

            {quizzes.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1.5">
                    Chọn bộ câu hỏi
                  </label>
                  <select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  >
                    {quizzes.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </option>
                    ))}
                  </select>
                </div>

                {targetQuiz && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-black text-slate-900 leading-5">
                      {targetQuiz.title}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                        Khối {targetQuiz.grade}
                      </span>
                      <span className="rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                        {targetQuiz.subject}
                      </span>
                      <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-black text-sky-800">
                        {targetQuiz.questions.length} câu
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  variant="student"
                  size="lg"
                  fullWidth
                  onClick={() => handleOpenAi('topic')}
                  className="mt-1"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  TẠO CÂU HỎI VỚI AI
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs leading-5 text-emerald-900">
                    Câu hỏi AI <strong>không tự đưa vào sử dụng</strong>. Thầy/Cô luôn được xem,
                    chọn và kiểm tra trước khi lưu.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <BookOpen className="w-9 h-9 text-slate-300 mx-auto" />
                <h4 className="mt-3 font-black text-slate-800">Chưa có bộ câu hỏi</h4>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Chưa cần tạo bộ trước. Thầy/Cô có thể tải tài liệu hoặc tạo bằng AI ngay; khi lưu, hệ thống sẽ tự tạo một bộ câu hỏi cá nhân mới.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <AiQuestionGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAddQuestionsToQuiz={handleAddAiQuestions}
        initialSubject={targetQuiz?.subject || 'Toán'}
        initialGrade={targetQuiz?.grade || '4'}
        initialSourceMode={initialSourceMode}
        autoOpenFilePicker={initialSourceMode === 'file'}
      />
    </div>
  );
};
