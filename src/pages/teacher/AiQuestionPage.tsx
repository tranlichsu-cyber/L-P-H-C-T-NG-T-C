import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AiQuestionGeneratorModal } from '../../components/teacher/AiQuestionGeneratorModal';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import type { AIGeneratedQuestion } from '../../services/ai/types';
import { Sparkles, Bot, FileText } from 'lucide-react';

export const AiQuestionPage: React.FC = () => {
  const { quizzes, addQuestion } = useTeacherData();
  const { showToast } = useToast();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string>(quizzes[0]?.id || '');

  const targetQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0];

  const handleAddAiQuestions = async (newQuestions: AIGeneratedQuestion[]) => {
    if (!targetQuiz) {
      showToast('Chưa có bộ đề nào để thêm câu hỏi!', 'error');
      return;
    }

    try {
      for (const q of newQuestions) {
        await addQuestion(targetQuiz.id, {
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

      showToast(`Đã thêm và lưu ${newQuestions.length} câu hỏi vào bộ đề "${targetQuiz.title}"!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể lưu các câu hỏi AI vào Firestore.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="TRỢ LÝ AI HỖ TRỢ GIÁO VIÊN"
        description="Tạo câu hỏi chuẩn tiểu học từ chủ đề, văn bản hoặc tài liệu SGK chỉ với vài nhấp chuột"
        action={
          <Button variant="warning" size="md" onClick={() => setIsAiModalOpen(true)} className="font-bold text-slate-950">
            <Sparkles className="w-5 h-5 mr-1" /> MỞ TRỢ LÝ AI
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Capabilities */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-sky-900 to-slate-900 text-white border-2 border-sky-700 p-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
                <Bot className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block">Tính năng trợ lý</span>
                <h2 className="text-2xl font-black text-amber-400">TẠO CÂU HỎI & HỌC LIỆU BẰNG AI</h2>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
              AI hoạt động như người trợ lý trung thành cho Thầy/Cô: tự động sinh câu hỏi trắc nghiệm, đúng/sai, trả lời ngắn kèm đáp án và lời giải chi tiết. Thầy/Cô hoàn toàn có quyền xem lại, chỉnh sửa trước khi đưa vào giảng dạy.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                <h4 className="font-bold text-base text-sky-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Tạo theo chủ đề & khối lớp
                </h4>
                <p className="text-xs text-slate-300">Nhập tên bài học bất kỳ trong chương trình Tiểu học từ Lớp 1-5.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                <h4 className="font-bold text-base text-sky-300 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" /> Bám sát văn bản tài liệu
                </h4>
                <p className="text-xs text-slate-300">Dán nội dung SGK hoặc tải file .TXT, .DOCX, .PDF bám sát nguồn.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Quiz Target Selector */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-slate-900 text-lg mb-4">Chọn Bộ Đề Cần Thêm Câu Hỏi</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Bộ đề mục tiêu:</label>
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 text-sm font-bold bg-white"
                >
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title} ({q.questions.length} câu - {q.subject})
                    </option>
                  ))}
                </select>
              </div>

              {targetQuiz && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{targetQuiz.title}</div>
                  <div className="text-slate-600">Khối: {targetQuiz.grade} • Môn: {targetQuiz.subject}</div>
                  <div className="text-sky-700 font-bold">Số câu hiện có: {targetQuiz.questions.length} câu</div>
                </div>
              )}

              <Button
                variant="student"
                size="lg"
                fullWidth
                onClick={() => setIsAiModalOpen(true)}
              >
                <Sparkles className="w-5 h-5 mr-2 inline" /> TẠO CÂU HỎI NGAY
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Generator Modal */}
      <AiQuestionGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAddQuestionsToQuiz={handleAddAiQuestions}
        initialSubject={targetQuiz?.subject || 'Toán'}
        initialGrade={targetQuiz?.grade || '4'}
      />
    </div>
  );
};
