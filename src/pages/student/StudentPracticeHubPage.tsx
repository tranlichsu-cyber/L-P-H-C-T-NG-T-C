import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PracticeService } from '../../services/practice/PracticeService';
import type { PracticeSet, PracticeAssignment, PracticeQuestion } from '../../services/practice/types';
import { useToast } from '../../context/ToastContext';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export const StudentPracticeHubPage: React.FC = () => {
  const { showToast } = useToast();

  // Mock active student identity (e.g. std-3 Lê Thu Cúc or student in session)
  const studentId = localStorage.getItem('student_id') || 'std-3';
  const studentName = localStorage.getItem('student_name') || 'Lê Thu Cúc';

  const [activeTasks, setActiveTasks] = useState<{ practiceSet: PracticeSet; assignment: PracticeAssignment }[]>([]);
  const [completedTasks, setCompletedTasks] = useState<{ practiceSet: PracticeSet; assignment: PracticeAssignment }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active Practice Taking State
  const [takingSet, setTakingSet] = useState<PracticeSet | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ score: number; correctCount: number; totalCount: number } | null>(null);

  const fetchStudentTasks = async () => {
    setIsLoading(true);
    try {
      const res = await PracticeService.getStudentAssignments(studentId);
      setActiveTasks(res.activeTasks);
      setCompletedTasks(res.completedTasks);
    } catch {
      showToast('Lỗi khi tải bài ôn tập của em.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentTasks();
  }, [studentId]);

  // Start taking a practice set
  const handleStartTask = (task: { practiceSet: PracticeSet; assignment: PracticeAssignment }) => {
    setTakingSet(task.practiceSet);
    setCurrentQuestionIndex(0);
    setStudentAnswers({});
    setTestResult(null);
  };

  // Submit single question answer
  const handleSelectAnswer = (qId: string, ans: string) => {
    setStudentAnswers((prev) => ({ ...prev, [qId]: ans }));
    if (takingSet) {
      PracticeService.submitStudentAnswer(takingSet.id, studentId, qId, ans);
    }
  };

  // Complete test
  const handleFinishTest = async () => {
    if (!takingSet) return;

    setIsSubmitting(true);
    try {
      const res = await PracticeService.completeStudentAssignment(takingSet.id, studentId);
      setTestResult(res);
      showToast('Chúc mừng em đã hoàn thành bài ôn tập!', 'success');
      fetchStudentTasks();
    } catch {
      showToast('Lỗi khi gửi bài làm.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center text-slate-500 space-y-2">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600" />
        <p className="font-bold text-sm">Đang tải danh sách bài ôn tập của em...</p>
      </Card>
    );
  }

  // TEST TAKING SCREEN (1 Question at a time)
  if (takingSet) {
    const currentQ: PracticeQuestion = takingSet.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === takingSet.questions.length - 1;
    const selectedAns = studentAnswers[currentQ?.id] || '';

    if (testResult) {
      // RESULT SCREEN
      return (
        <Card className="max-w-xl mx-auto p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">EM ĐÃ HOÀN THÀNH BÀI ÔN TẬP!</h2>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Bài: <strong>{takingSet.title}</strong>
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border space-y-2">
            <span className="text-xs text-slate-500 font-bold block">Kết quả đạt được</span>
            <span className="text-4xl font-black text-emerald-600 block">
              {testResult.correctCount}/{testResult.totalCount} CÂU ĐÚNG
            </span>
            <span className="text-sm font-bold text-sky-700 block">Tỷ lệ chính xác: {testResult.score}%</span>
          </div>

          <div className="p-4 bg-sky-50 rounded-xl text-xs font-semibold text-sky-950">
            💡 Em hãy xem lại nội dung cần củng cố và duy trì kết quả học tập tốt nhé!
          </div>

          <Button variant="primary" size="lg" fullWidth onClick={() => setTakingSet(null)}>
            QUAY LẠI TRANG BÀI ÔN TẬP
          </Button>
        </Card>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
          <div>
            <Badge variant="primary">Môn {takingSet.subject}</Badge>
            <h3 className="font-black text-base text-slate-900 mt-1">{takingSet.title}</h3>
          </div>
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
            Câu {currentQuestionIndex + 1} / {takingSet.questions.length}
          </span>
        </div>

        {/* Question Card */}
        <Card className="p-6 space-y-6 border-2 border-slate-200 shadow-md">
          <div className="space-y-2">
            <Badge variant="info" size="sm">{currentQ.type}</Badge>
            <h2 className="text-lg font-bold text-slate-900 leading-relaxed">{currentQ.content}</h2>
          </div>

          {/* Multiple Choice / True False Options */}
          {currentQ.options && (
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedAns === letter;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAnswer(currentQ.id, letter)}
                    className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    <span><strong>{letter}.</strong> {opt}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'TRUE_FALSE' && (
            <div className="grid grid-cols-2 gap-4">
              {['Đúng', 'Sai'].map((val) => {
                const isSelected = selectedAns === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectAnswer(currentQ.id, val)}
                    className={`p-4 rounded-2xl border-2 text-center text-base font-black transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'SHORT_ANSWER' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nhập câu trả lời của em:</label>
              <input
                type="text"
                value={selectedAns}
                onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                placeholder="Ví dụ: 25..."
                className="w-full p-3 rounded-xl border border-slate-300 text-base font-bold bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              size="md"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((i) => i - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> QUAY LẠI
            </Button>

            {isLastQuestion ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleFinishTest}
                disabled={isSubmitting}
                className="font-bold"
              >
                {isSubmitting ? 'ĐANG NỘP BÀI...' : 'NỘP BÀI TẤT CẢ'}
              </Button>
            ) : (
              <Button
                variant="student"
                size="md"
                onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                className="font-bold"
              >
                CÂU TIẾP THEO <ArrowRight className="w-4 h-4 ml-1 inline" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg space-y-2">
        <Badge variant="warning">Học sinh: {studentName}</Badge>
        <h1 className="text-2xl font-black">BÀI ÔN TẬP & NHIỆM VỤ CỦA EM</h1>
        <p className="text-xs text-sky-100 font-medium">
          Tự do làm bài ôn tập theo tiến độ của em để củng cố kiến thức các môn học
        </p>
      </div>

      {/* ACTIVE UNFINISHED TASKS */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" /> BÀI CẦN LÀM ({activeTasks.length})
        </h2>

        {activeTasks.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500 font-medium">
            🎉 Em hiện không có bài ôn tập nào cần làm!
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeTasks.map((t) => (
              <Card key={t.practiceSet.id} className="p-5 border-2 border-slate-200 space-y-3 bg-white">
                <div className="flex justify-between items-start">
                  <Badge variant="primary">Môn {t.practiceSet.subject}</Badge>
                  <Badge variant={t.assignment.status === 'IN_PROGRESS' ? 'warning' : 'info'} size="sm">
                    {t.assignment.status === 'IN_PROGRESS' ? 'Đang làm dở' : 'Chưa làm'}
                  </Badge>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{t.practiceSet.title}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t.practiceSet.questions.length} câu hỏi • Giao bởi {t.practiceSet.createdBy}
                </p>

                <Button
                  variant="student"
                  size="md"
                  fullWidth
                  onClick={() => handleStartTask(t)}
                  className="font-bold"
                >
                  <Sparkles className="w-4 h-4 mr-1 inline" /> BẮT ĐẦU LÀM BÀI
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED TASKS */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> BÀI ĐÃ HOÀN THÀNH ({completedTasks.length})
        </h2>

        {completedTasks.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-400">
            Chưa có bài ôn tập nào đã hoàn thành.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completedTasks.map((t) => (
              <Card key={t.practiceSet.id} className="p-5 border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant="neutral">Môn {t.practiceSet.subject}</Badge>
                  <span className="text-sm font-black text-emerald-600">{t.assignment.score}% đúng</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{t.practiceSet.title}</h3>
                <p className="text-xs text-slate-500">
                  Làm đúng {t.assignment.correctCount}/{t.practiceSet.questions.length} câu
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
