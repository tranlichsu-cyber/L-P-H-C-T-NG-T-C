import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { MockRoomData } from '../../services/realtime/types';
import { Users, X, Sparkles, CheckCircle2, Award, ArrowRight } from 'lucide-react';

interface PresentationViewProps {
  room: MockRoomData;
  onClose: () => void;
  onOpenQuestion?: (questionId: string) => void;
  onCloseQuestion?: (questionId: string) => void;
  onShowResult?: (questionId: string) => void;
  onNextQuestion?: () => void;
  onCallRandomStudent?: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  room,
  onClose,
  onOpenQuestion,
  onCloseQuestion,
  onShowResult,
  onNextQuestion,
  onCallRandomStudent,
}) => {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [showStudentName, setShowStudentName] = useState(true);
  const [showSubmissionPicker, setShowSubmissionPicker] = useState(false);
  const joinUrl = `${window.location.origin}/student/join?room=${room.roomCode}`;
  const participantsList = Object.values(room.participants || {});
  const totalRoster = room.roster?.length || 30;

  const currentQuestionId = room.activeQuestionId || Object.keys(room.liveQuestions || {})[0];
  const liveQ = room.liveQuestions ? room.liveQuestions[currentQuestionId] : null;

  const submissionsList = Object.values(room.submissions || {}).filter(
    (s) => s.questionId === currentQuestionId
  );
  const answeredCount = submissionsList.length;
  const selectedSubmission = submissionsList.find((s) => s.id === selectedSubmissionId);

  const qStatus = liveQ?.status || 'READY';

  // Calculate choices breakdown for Bar Chart when RESULT
  const choiceCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  if (liveQ?.options) {
    liveQ.options.forEach((_, idx) => {
      const label = String.fromCharCode(65 + idx);
      choiceCounts[label] = 0;
    });
    submissionsList.forEach((sub) => {
      const ansUpper = sub.answer.trim().toUpperCase();
      if (choiceCounts[ansUpper] !== undefined) {
        choiceCounts[ansUpper] += 1;
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-y-auto p-6 sm:p-10 select-none animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-400">
              LỚP HỌC TƯƠNG TÁC
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              {room.className} • {room.subject}
            </p>
          </div>
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center space-x-6">
          <div className="bg-slate-900 border-2 border-sky-500/40 rounded-2xl px-6 py-2.5 text-center shadow-xl">
            <div className="text-xs uppercase font-bold tracking-widest text-sky-400">MÃ THAM GIA</div>
            <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest">
              {room.roomCode}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Thoát Trình Chiếu"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-8">
        {/* Called Student Banner Overlay if Active */}
        {!selectedSubmission && room.calledStudent && (
          <div className="mb-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 p-8 rounded-3xl text-slate-950 shadow-2xl text-center border-4 border-amber-300 animate-bounce">
            <div className="inline-flex items-center space-x-2 bg-slate-950/20 text-slate-950 px-4 py-1.5 rounded-full text-lg font-black uppercase tracking-wider mb-2">
              <Award className="w-6 h-6" /> MỜI HỌC SINH PHÁT BIỂU
            </div>
            <h2 className="text-5xl sm:text-7xl font-black tracking-tight uppercase drop-shadow-md">
              {room.calledStudent.studentName}
            </h2>
            <p className="text-xl font-bold mt-2 opacity-90">
              {room.calledStudent.reason || 'Thầy/cô mời em trả lời câu hỏi!'}
            </p>
          </div>
        )}

        {selectedSubmission && room.status !== 'WAITING' && (
          <section className="max-w-6xl mx-auto space-y-6" aria-label="Bài làm học sinh đang trình chiếu">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-4xl font-black text-sky-300">BÀI LÀM HỌC SINH</h2>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-3 rounded-xl bg-slate-800 text-white" onClick={() => setShowStudentName((v) => !v)}>
                  {showStudentName ? 'Ẩn tên học sinh' : 'Hiện tên học sinh'}
                </button>
                <button className="px-4 py-3 rounded-xl bg-sky-700 text-white" onClick={() => setSelectedSubmissionId(null)}>Quay lại câu hỏi</button>
              </div>
            </div>
            <p className="text-xl sm:text-3xl text-amber-300 font-bold">{showStudentName ? selectedSubmission.studentName : 'Bài làm được chọn'}</p>
            <p className="text-lg sm:text-2xl text-slate-300 whitespace-pre-wrap">{liveQ?.content}</p>
            <div className="bg-white text-slate-950 rounded-3xl p-8 sm:p-12 shadow-2xl">
              <p className="text-3xl sm:text-5xl leading-relaxed whitespace-pre-wrap break-words select-text">
                {selectedSubmission.answer || '(Bài nộp không có nội dung)'}
              </p>
              {liveQ?.options && /^[A-Z]$/.test(selectedSubmission.answer.trim().toUpperCase()) && (
                <p className="mt-6 text-2xl sm:text-3xl text-slate-700 whitespace-pre-wrap">
                  {liveQ.options[selectedSubmission.answer.trim().toUpperCase().charCodeAt(0) - 65] || ''}
                </p>
              )}
            </div>
          </section>
        )}

        {showSubmissionPicker && (
          <section className="max-w-5xl mx-auto mb-8 bg-slate-900 border border-slate-700 rounded-2xl p-5" aria-label="Chọn bài học sinh">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold">Chọn bài đã nộp của câu hỏi hiện tại</h2>
              <button className="px-4 py-2 bg-slate-800 rounded-lg" onClick={() => setShowSubmissionPicker(false)}>Đóng danh sách</button>
            </div>
            {!submissionsList.length && <p className="text-slate-300">Chưa có học sinh nộp bài cho câu hỏi này.</p>}
            <div className="grid sm:grid-cols-2 gap-3">
              {submissionsList.map((submission) => (
                <button key={submission.id} className="text-left p-4 rounded-xl bg-slate-800 hover:bg-sky-900 border border-slate-600" onClick={() => {
                  setSelectedSubmissionId(submission.id);
                  setShowSubmissionPicker(false);
                }}>
                  <span className="block font-bold text-amber-300">{showStudentName ? submission.studentName : 'Bài ' + (submissionsList.indexOf(submission) + 1)}</span>
                  <span className="block text-white mt-2 whitespace-pre-wrap break-words line-clamp-2">{submission.answer}</span>
                  <span className="block text-sky-300 mt-2 font-bold">Chiếu bài này →</span>
                </button>
              ))}
            </div>
          </section>
        )}
        {/* State 1: WAITING */}
        {room.status === 'WAITING' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="text-left space-y-6">
              <Badge variant="warning" className="text-lg py-2 px-5 font-bold">
                PHÒNG CHỜ HỌC SINH
              </Badge>
              <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                Hãy quét mã QR hoặc nhập mã phòng
              </h2>
              <p className="text-2xl text-slate-300 leading-relaxed font-medium">
                Dùng máy tính bảng hoặc điện thoại để tham gia tiết học tương tác ngay bây giờ!
              </p>
              <div className="inline-flex items-center space-x-3 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-xl font-bold text-sky-300">
                <Users className="w-7 h-7 text-sky-400" />
                <span>Đã vào phòng: {participantsList.length} / {totalRoster} học sinh</span>
              </div>
            </div>

            {/* Large QR Code Container */}
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-sky-400 text-slate-900 flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
              <QRCodeSVG value={joinUrl} size={260} level="H" includeMargin />
              <div className="text-center font-mono text-2xl font-black text-sky-950 tracking-wider">
                PIN: {room.roomCode}
              </div>
              <div className="text-xs font-semibold text-slate-500 break-all text-center">
                {joinUrl}
              </div>
            </div>
          </div>
        )}

        {/* State 2 & 3: LIVE QUESTION (OPEN / CLOSED / RESULT) */}
        {room.status !== 'WAITING' && liveQ && !selectedSubmission && (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Question Header & Status */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xl sm:text-2xl font-black text-sky-400 uppercase tracking-widest">
                CÂU HỎI HIỆN TẠI
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-xl font-bold text-slate-300">
                  Đã trả lời: <strong className="text-amber-400 text-2xl">{answeredCount}</strong> / {participantsList.length || totalRoster}
                </span>
                {qStatus === 'OPEN' && <Badge variant="success" className="text-lg py-1.5 px-4 font-bold">ĐANG NHẬN ĐÁP ÁN</Badge>}
                {qStatus === 'CLOSED' && <Badge variant="neutral" className="text-lg py-1.5 px-4 font-bold">ĐÃ ĐÓNG</Badge>}
                {qStatus === 'RESULT' && <Badge variant="primary" className="text-lg py-1.5 px-4 font-bold">KẾT QUẢ</Badge>}
              </div>
            </div>

            {/* Question Content */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-snug">
                {liveQ.content}
              </h2>
            </div>

            {/* Options List */}
            {liveQ.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {liveQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isCorrect = qStatus === 'RESULT' && liveQ.correctAnswer === letter;
                  const count = choiceCounts[letter] || 0;

                  return (
                    <div
                      key={idx}
                      className={`p-6 rounded-2xl border-3 transition-all flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-emerald-900/50 shadow-2xl scale-102 ring-4 ring-emerald-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <span
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-md ${
                            isCorrect ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-sky-400'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-2xl font-bold">{opt}</span>
                      </div>

                      {/* Bar Chart count display when RESULT */}
                      {qStatus === 'RESULT' && (
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl font-black text-amber-400">{count} lượt</div>
                          {isCorrect && <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Result Explanation Card */}
            {qStatus === 'RESULT' && liveQ.explanation && (
              <div className="bg-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 text-emerald-200">
                <div className="font-bold text-xl mb-1 text-emerald-400 flex items-center space-x-2">
                  <Sparkles className="w-6 h-6" /> <span>Giải thích chi tiết:</span>
                </div>
                <p className="text-lg font-medium">{liveQ.explanation}</p>
              </div>
            )}

            {/* Pure CSS Bar Chart Visualizer for RESULT */}
            {qStatus === 'RESULT' && liveQ.options && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-slate-300">Thống kê đáp án học sinh</h3>
                <div className="space-y-3">
                  {liveQ.options.map((_, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const count = choiceCounts[letter] || 0;
                    const pct = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;
                    const isCorrect = liveQ.correctAnswer === letter;

                    return (
                      <div key={letter} className="flex items-center space-x-4 text-lg">
                        <span className="w-8 font-black text-sky-400 text-right">{letter}</span>
                        <div className="flex-1 bg-slate-950 rounded-full h-8 overflow-hidden p-1 border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-700 flex items-center justify-end px-3 text-xs font-bold text-slate-950 ${
                              isCorrect ? 'bg-emerald-400' : 'bg-sky-500'
                            }`}
                            style={{ width: `${Math.max(8, pct)}%` }}
                          >
                            {pct > 15 ? `${pct}% (${count})` : ''}
                          </div>
                        </div>
                        <span className="w-20 text-sm font-bold text-slate-400">{count} lượt</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar for Teacher */}
      <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 pt-4 pb-2 px-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-slate-400 font-semibold text-base">
          <Users className="w-6 h-6 text-sky-400" />
          <span>Học sinh tham gia: <strong className="text-white text-lg">{participantsList.length}</strong></span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {room.status !== 'WAITING' && liveQ && (
            <Button variant="primary" size="lg" onClick={() => setShowSubmissionPicker((v) => !v)}>
              CHIẾU BÀI HỌC SINH ({answeredCount})
            </Button>
          )}
          {onCallRandomStudent && (
            <Button variant="warning" size="lg" onClick={onCallRandomStudent} className="font-bold text-slate-950">
              <Award className="w-5 h-5 mr-2 inline" /> GỌI HỌC SINH
            </Button>
          )}

          {qStatus === 'READY' && onOpenQuestion && (
            <Button variant="success" size="lg" onClick={() => onOpenQuestion(currentQuestionId)} className="font-bold">
              PHÁT CÂU HỎI
            </Button>
          )}

          {qStatus === 'OPEN' && onCloseQuestion && (
            <Button variant="danger" size="lg" onClick={() => onCloseQuestion(currentQuestionId)} className="font-bold">
              ĐÓNG TRẢ LỜI
            </Button>
          )}

          {qStatus === 'CLOSED' && onShowResult && (
            <Button variant="primary" size="lg" onClick={() => onShowResult(currentQuestionId)} className="font-bold">
              HIỂN THỊ ĐÁP ÁN
            </Button>
          )}

          {qStatus === 'RESULT' && onNextQuestion && (
            <Button variant="primary" size="lg" onClick={onNextQuestion} className="font-bold">
              CÂU TIẾP THEO <ArrowRight className="w-5 h-5 ml-2 inline" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
