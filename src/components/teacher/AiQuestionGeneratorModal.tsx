import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { aiService } from '../../services/ai/AIService';
import { DocumentExtractionService } from '../../services/ai/DocumentExtractionService';
import type { AIGenerationOptions, AIGeneratedQuestion } from '../../services/ai/types';
import { useToast } from '../../context/ToastContext';
import { Sparkles, FileText, Upload, RefreshCw, CheckCircle2, AlertCircle, Trash2, ShieldCheck } from 'lucide-react';

interface AiQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestionsToQuiz: (
    questions: AIGeneratedQuestion[],
    meta: { subject: string; grade: string; sourceName?: string }
  ) => void | Promise<void>;
  initialSubject?: string;
  initialGrade?: string;
  initialSourceMode?: 'topic' | 'text' | 'file';
  autoOpenFilePicker?: boolean;
}

export const AiQuestionGeneratorModal: React.FC<AiQuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  onAddQuestionsToQuiz,
  initialSubject = 'Toán',
  initialGrade = '4',
  initialSourceMode = 'topic',
  autoOpenFilePicker = false,
}) => {
  const { showToast } = useToast();

  // Form State
  const [sourceMode, setSourceMode] = useState<'topic' | 'text' | 'file'>(initialSourceMode);
  const [grade, setGrade] = useState(initialGrade);
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [isSourceGroundedOnly, setIsSourceGroundedOnly] = useState(true);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [questionType, setQuestionType] = useState<'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MIXED'>('MIXED');
  const [difficulty, setDifficulty] = useState<'KNOWLEDGE' | 'UNDERSTANDING' | 'APPLICATION' | 'BALANCED'>('BALANCED');

  useEffect(() => {
    if (isOpen) {
      setSourceMode(initialSourceMode);
      setGrade(initialGrade);
      setSubject(initialSubject);
      setGeneratedQuestions([]);

      if (initialSourceMode === 'file' && autoOpenFilePicker) {
        window.setTimeout(() => {
          fileInputRef.current?.click();
        }, 150);
      }
    }
  }, [
    isOpen,
    initialSourceMode,
    initialGrade,
    initialSubject,
    autoOpenFilePicker,
  ]);

  // Document Upload State
  const [fileName, setFileName] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [extractError, setExtractError] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generation & Review State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<AIGeneratedQuestion[]>([]);

  // 1. Handle File Upload & Text Extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractError('');
    setIsExtracting(true);
    const res = await DocumentExtractionService.extractTextFromFile(file);
    setIsExtracting(false);

    if (res.error) {
      setExtractError(res.error);
      showToast(res.error, 'error');
    } else {
      setFileName(res.fileName);
      setCharCount(res.charCount);
      setSourceText(res.extractedText);
      showToast(`Đã trích xuất thành công ${res.charCount} ký tự từ file ${res.fileName}`, 'success');
    }
  };

  // 2. Generate Questions from AI Service
  const handleGenerate = async () => {
    if (sourceMode === 'topic' && !topic.trim()) {
      showToast('Vui lòng nhập tên bài học hoặc chủ đề!', 'info');
      return;
    }
    if ((sourceMode === 'text' || sourceMode === 'file') && !sourceText.trim()) {
      showToast('Vui lòng nhập hoặc tải nội dung văn bản nguồn!', 'info');
      return;
    }

    setIsGenerating(true);

    const options: AIGenerationOptions = {
      grade,
      subject,
      topic: sourceMode === 'topic' ? topic : undefined,
      sourceText: sourceMode !== 'topic' ? sourceText : undefined,
      isSourceGroundedOnly,
      questionCount,
      questionType,
      difficulty,
    };

    try {
      const result = await aiService.generateQuestions(options);
      setGeneratedQuestions(result);
      showToast(`AI đã đề xuất ${result.length} câu hỏi. Hãy kiểm tra trước khi lưu!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi gọi dịch vụ AI.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Single Question Action (Regen / Simplify / Increase Difficulty)
  const handleRefineSingleQuestion = async (qId: string, action: string) => {
    const targetQ = generatedQuestions.find((q) => q.id === qId);
    if (!targetQ) return;

    showToast('AI đang tinh chỉnh câu hỏi...', 'info');

    const options: AIGenerationOptions = {
      grade,
      subject,
      topic,
      sourceText,
      isSourceGroundedOnly,
      questionCount: 1,
      questionType: targetQ.type === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' : 'MIXED',
      difficulty: targetQ.difficulty,
    };

    const updatedQ = await aiService.refineQuestion(targetQ, action, options);

    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...updatedQ, selected: true } : q))
    );

    showToast('Đã tinh chỉnh câu hỏi thành công!', 'success');
  };

  // 4. Save Approved Questions to Quiz Bank
  const handleSaveToQuiz = async () => {
    const selectedList = generatedQuestions.filter((q) => q.selected);
    if (selectedList.length === 0) {
      showToast('Hãy chọn ít nhất 1 câu hỏi để lưu vào Ngân hàng!', 'info');
      return;
    }

    try {
      await Promise.resolve(
        onAddQuestionsToQuiz(selectedList, {
          subject,
          grade,
          sourceName: fileName || topic || undefined,
        })
      );
      showToast(`Đã thêm và lưu ${selectedList.length} câu hỏi vào Ngân hàng!`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Không thể lưu các câu hỏi đã chọn.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🤖 TRỢ LÝ AI TẠO CÂU HỎI & HỌC LIỆU">
      <div className="space-y-6">
        {/* Step 1: Input Form if not generated yet or re-generating */}
        {generatedQuestions.length === 0 ? (
          <div className="space-y-4">
            {/* Source Mode Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSourceMode('topic')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  sourceMode === 'topic' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Chủ đề bài học
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('text')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  sourceMode === 'text' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" /> Dán văn bản
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('file')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  sourceMode === 'file' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" /> Tải tài liệu
              </button>
            </div>

            {/* Subject & Grade selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Khối lớp:</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                >
                  <option value="1">Lớp 1</option>
                  <option value="2">Lớp 2</option>
                  <option value="3">Lớp 3</option>
                  <option value="4">Lớp 4</option>
                  <option value="5">Lớp 5</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Môn học:</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                >
                  <option value="Toán">Toán</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Khoa học">Khoa học</option>
                  <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
                  <option value="Tin học">Tin học</option>
                  <option value="Công nghệ">Công nghệ</option>
                  <option value="Đạo đức">Đạo đức</option>
                  <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            {/* Input Content based on Source Mode */}
            {sourceMode === 'topic' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chủ đề bài học:</label>
                <Input
                  placeholder="Ví dụ: Phép nhân với số có hai chữ số..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            )}

            {sourceMode === 'text' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dán nội dung bài học (Văn bản nguồn):</label>
                <textarea
                  rows={4}
                  placeholder="Dán đoạn văn bản SGK hoặc tài liệu dạy học..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-medium focus:border-sky-500 focus:outline-none"
                />
              </div>
            )}

            {sourceMode === 'file' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block mb-1">Tải file tài liệu (.TXT, .DOCX, .PDF):</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="w-full rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 px-5 py-6 text-center hover:border-violet-500 hover:bg-violet-100 transition disabled:opacity-60"
                >
                  <Upload className="w-8 h-8 mx-auto text-violet-700 mb-2" />
                  <div className="font-black text-violet-950">
                    {isExtracting ? 'ĐANG ĐỌC TÀI LIỆU...' : 'CHỌN TÀI LIỆU TỪ MÁY'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    PDF, DOCX hoặc TXT • tối đa 15 MB
                  </div>
                </button>
                {fileName && (
                  <div className="p-3 bg-slate-50 border rounded-xl text-xs flex justify-between items-center">
                    <span>📄 File: <strong>{fileName}</strong></span>
                    <span className="text-sky-700 font-bold">{charCount} ký tự</span>
                  </div>
                )}
                {extractError && <p className="text-xs text-rose-600 font-bold">{extractError}</p>}
              </div>
            )}

            {/* Source Grounded Only Checkbox */}
            {sourceMode !== 'topic' && (
              <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs font-bold text-sky-950">
                <input
                  type="checkbox"
                  id="grounded"
                  checked={isSourceGroundedOnly}
                  onChange={(e) => setIsSourceGroundedOnly(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="grounded">Chỉ tạo câu hỏi dựa trên nội dung tôi cung cấp (Source-Grounded)</label>
              </div>
            )}

            {/* Parameters: Count, Type, Difficulty */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Số lượng câu:</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value={3}>3 câu</option>
                  <option value={5}>5 câu</option>
                  <option value={10}>10 câu</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dạng câu hỏi:</label>
                <select
                  value={questionType}
                  onChange={(e: any) => setQuestionType(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="MIXED">Hỗn hợp</option>
                  <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                  <option value="TRUE_FALSE">Đúng / Sai</option>
                  <option value="SHORT_ANSWER">Trả lời ngắn</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mức độ tư duy:</label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="BALANCED">Cân bằng</option>
                  <option value="KNOWLEDGE">Nhận biết</option>
                  <option value="UNDERSTANDING">Thông hiểu</option>
                  <option value="APPLICATION">Vận dụng</option>
                </select>
              </div>
            </div>

            {/* Generate Action Button */}
            <Button
              variant="student"
              size="xl"
              fullWidth
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin inline" /> AI ĐANG TẠO CÂU HỎI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2 inline" /> TẠO CÂU HỎI VỚI AI
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Step 2: Teacher Review & Edit Screen */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> CÂU HỎI AI ĐỀ XUẤT ({generatedQuestions.length} CÂU)
                </h3>
                <p className="text-xs text-slate-500 font-medium">Tích chọn các câu muốn lưu vào Ngân hàng câu hỏi</p>
              </div>

              <Button variant="outline" size="sm" onClick={() => setGeneratedQuestions([])}>
                Tạo lại bộ mới
              </Button>
            </div>

            {/* Questions Proposal List */}
            <div className="max-h-[420px] overflow-y-auto space-y-4 pr-1">
              {generatedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                    q.selected ? 'bg-white border-sky-400 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={q.selected || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setGeneratedQuestions((prev) =>
                            prev.map((item) => (item.id === q.id ? { ...item, selected: checked } : item))
                          );
                        }}
                        className="w-4 h-4 rounded text-sky-600"
                      />
                      <span className="font-black text-sky-700 text-sm">Câu {idx + 1}</span>
                      <Badge variant="info" size="sm">{q.type}</Badge>
                      <Badge variant="neutral" size="sm">{q.difficulty}</Badge>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRefineSingleQuestion(q.id, 'SIMPLIFY')}
                        className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-xs"
                        title="Dễ hơn"
                      >
                        Dễ hơn
                      </button>
                      <button
                        onClick={() => handleRefineSingleQuestion(q.id, 'INCREASE_DIFFICULTY')}
                        className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-xs"
                        title="Khó hơn"
                      >
                        Khó hơn
                      </button>
                      <button
                        onClick={() =>
                          setGeneratedQuestions((prev) => prev.filter((item) => item.id !== q.id))
                        }
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        title="Xóa câu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <h4 className="font-bold text-slate-900 text-base">{q.content}</h4>

                  {/* Options */}
                  {q.options && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const isCorrect = q.correctAnswer === letter;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-xl border ${
                              isCorrect ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <strong>{letter}.</strong> {opt}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Correct Answer & Explanation */}
                  <div className="p-3 bg-sky-50 rounded-xl text-xs space-y-1 text-sky-950 border border-sky-200">
                    <div><strong>Đáp án đúng chuẩn:</strong> {q.correctAnswer}</div>
                    <div><strong>Giải thích chi tiết:</strong> {q.explanation}</div>
                  </div>

                  {/* Warnings if duplicate or invalid */}
                  {q.warnings && q.warnings.length > 0 && (
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>{q.warnings.join(' ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Approve Action */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Đã chọn: <strong className="text-sky-700 text-sm">{generatedQuestions.filter((q) => q.selected).length}</strong> câu
              </span>

              <Button variant="primary" size="lg" onClick={handleSaveToQuiz} className="font-bold">
                <CheckCircle2 className="w-5 h-5 mr-2" /> THÊM CÁC CÂU ĐÃ CHỌN VÀO NGÂN HÀNG
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
