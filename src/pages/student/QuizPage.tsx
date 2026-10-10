import { OrderingAnswer } from '../../components/student/OrderingAnswer';
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useStudentSession } from '../../context/StudentSessionContext';
import { activeRealtimeService } from '../../services/realtime/realtimeServiceSwitch';
import { useToast } from '../../context/ToastContext';
import { HelpCircle, CheckCircle2, Lock, Clock, Send } from 'lucide-react';

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, room, setSelectedAnswer, submitAnswer } = useStudentSession();
  const { showToast } = useToast();

  const [shortInput, setShortInput] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Automatic transition to Result Page when status becomes RESULT
  useEffect(() => {
    if (session.liveQuestion?.status === 'RESULT') {
      navigate('/student/result');
    }
  }, [session.liveQuestion?.status, navigate]);

  // Route Guards
  if (!session.roomCode) {
    return <Navigate to="/student/join" replace />;
  }
  if (!session.studentName) {
    return <Navigate to="/student/select-name" replace />;
  }
  if (!session.liveQuestion) {
    return <Navigate to="/student/waiting" replace />;
  }

  const q = session.liveQuestion;
  const isClosed = q.status === 'CLOSED';
  const isSubmitted = session.hasSubmitted;

  // Handle Short Answer input change
  const handleShortChange = (val: string) => {
    setShortInput(val);
    setSelectedAnswer(val);
  };

  // Open confirmation sheet before final submit
  const handleOpenSubmit = () => {
    if (!session.selectedAnswer || isSubmitted || isClosed) return;
    setIsConfirmOpen(true);
  };

  // Confirm Final Submission -> Send to Realtime Service!
  const handleConfirmSubmit = async () => {
    if (!session.roomId || !session.studentId || !session.selectedAnswer) return;

    const mockAuthUid = `mock-user-${session.studentId}`;

    const res = await Promise.resolve(activeRealtimeService.submitAnswer({
      roomId: session.roomId,
      questionId: q.id,
      studentId: session.studentId,
      studentName: session.studentName || 'Học sinh',
      mockAuthUid,
      answer: session.selectedAnswer,
    }));

    if (!res.success) {
      setSubmitError(res.error || 'Không thể gửi câu trả lời.');
      showToast(res.error || 'Không thể gửi câu trả lời.', 'error');
      setIsConfirmOpen(false);
      return;
    }

    submitAnswer();
    showToast('Đã gửi câu trả lời thành công!', 'success');
    setIsConfirmOpen(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-sky-200 shadow-sm">
        <span className="text-xs font-bold text-sky-800 uppercase">
          Môn {session.subject || 'Đang tải môn'} • {session.className || 'Đang tải lớp'}
        </span>
        <span className="text-xs font-extrabold px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
          🎒 {session.studentName}
        </span>
      </div>

      {/* Submitted Status Banner */}
      {isSubmitted && (
        <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h3 className="font-extrabold text-base">ĐÃ GỬI CÂU TRẢ LỜI!</h3>
            <p className="text-xs text-emerald-800">Em đã nộp bài. Hãy chờ thầy/cô công bố kết quả nhé.</p>
          </div>
        </div>
      )}

      {/* Time Expired Banner */}
      {!isSubmitted && isClosed && (
        <div className="p-4 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-950 flex items-center gap-3 animate-fade-in">
          <Clock className="w-6 h-6 text-amber-700 shrink-0" />
          <div>
            <h3 className="font-extrabold text-base">ĐÃ HẾT THỜI GIAN TRẢ LỜI</h3>
            <p className="text-xs text-amber-800">Thầy/cô đã khóa nhận bài cho câu hỏi này.</p>
          </div>
        </div>
      )}

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sky-200 shadow-lg text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
          <HelpCircle className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
          {q.content}
        </h1>

        {/* 1. MULTIPLE CHOICE UI */}
        {q.type === 'MULTIPLE_CHOICE' && q.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = session.selectedAnswer === opt;

              // Distinct option color themes (A: Sky, B: Emerald, C: Amber, D: Purple)
              const themes = [
                { bg: 'bg-sky-50/80 hover:bg-sky-100 border-sky-300 text-sky-950', badge: 'bg-sky-600 text-white', active: 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-sky-700 ring-4 ring-sky-300' },
                { bg: 'bg-emerald-50/80 hover:bg-emerald-100 border-emerald-300 text-emerald-950', badge: 'bg-emerald-600 text-white', active: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-700 ring-4 ring-emerald-300' },
                { bg: 'bg-amber-50/80 hover:bg-amber-100 border-amber-300 text-amber-950', badge: 'bg-amber-500 text-slate-950', active: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-amber-600 ring-4 ring-amber-300' },
                { bg: 'bg-purple-50/80 hover:bg-purple-100 border-purple-300 text-purple-950', badge: 'bg-purple-600 text-white', active: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-700 ring-4 ring-purple-300' },
              ];
              const theme = themes[i % themes.length];

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={isSubmitted || isClosed}
                  onClick={() => setSelectedAnswer(opt)}
                  className={`p-4 rounded-2xl border-2 font-black text-lg transition-all flex items-center justify-between select-none min-h-[60px] shadow-xs ${
                    isSelected
                      ? `${theme.active} shadow-lg scale-[1.02]`
                      : `${theme.bg}`
                  } ${isSubmitted || isClosed ? 'cursor-not-allowed opacity-80' : 'active:scale-[0.98]'}`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                      isSelected ? 'bg-white/20 text-white' : theme.badge
                    }`}>
                      {letter}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-6 h-6 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'ORDERING' && <OrderingAnswer key={q.id} options={q.options || []} value={session.selectedAnswer || ''} disabled={isSubmitted || isClosed} onChange={setSelectedAnswer} />}
        {/* 2. TRUE / FALSE UI */}
        {q.type === 'TRUE_FALSE' && (
          <div className="grid grid-cols-2 gap-4">
            {['Đúng', 'Sai'].map((val) => {
              const isSelected = session.selectedAnswer === val;
              const isTrue = val === 'Đúng';

              return (
                <button
                  key={val}
                  type="button"
                  disabled={isSubmitted || isClosed}
                  onClick={() => setSelectedAnswer(val)}
                  className={`p-6 rounded-3xl border-4 font-black text-2xl transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] ${
                    isSelected
                      ? isTrue
                        ? 'bg-emerald-600 text-white border-emerald-700 ring-4 ring-emerald-300 shadow-lg scale-[1.03]'
                        : 'bg-rose-600 text-white border-rose-700 ring-4 ring-rose-300 shadow-lg scale-[1.03]'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                  } ${isSubmitted || isClosed ? 'cursor-not-allowed opacity-80' : 'active:scale-[0.98]'}`}
                >
                  <span>{val.toUpperCase()}</span>
                  {isSelected && <CheckCircle2 className="w-7 h-7 text-white" />}
                </button>
              );
            })}
          </div>
        )}

        {room?.activeGame?.type === 'TEAM_RACE' && session.studentId && (() => {
          const teamId = room.activeGame.studentTeamMap?.[session.studentId];
          const team = teamId ? room.activeGame.teams?.[teamId] : null;
          return <p className="p-3 bg-indigo-50 rounded-xl text-indigo-900 font-bold">{team ? 'Nhóm của em: ' + team.name + ' • Thảo luận trước khi mỗi bạn nộp câu trả lời.' : 'Em chưa được phân nhóm. Báo thầy/cô để được hướng dẫn.'}</p>;
        })()}
        {/* 3. SHORT ANSWER UI */}
        {(q.type === 'SHORT_ANSWER' || q.type === 'FILL_BLANK') && (
          <div className="space-y-2">
            <textarea
              rows={3}
              disabled={isSubmitted || isClosed}
              placeholder="Nhập câu trả lời của em vào đây..."
              value={shortInput}
              onChange={(e) => handleShortChange(e.target.value)}
              maxLength={100}
              className={`w-full rounded-2xl border-2 p-4 text-xl font-bold text-center text-slate-900 transition-all ${
                isSubmitted || isClosed ? 'bg-slate-100 border-slate-300 text-slate-500' : 'bg-white border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10'
              }`}
            />
          </div>
        )}

        {submitError && (
          <p className="text-sm font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
            {submitError}
          </p>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <Button
            variant="student"
            size="xl"
            fullWidth
            disabled={!session.selectedAnswer || isClosed}
            onClick={handleOpenSubmit}
          >
            {isClosed ? (
              <>
                <Lock className="w-6 h-6 mr-2 inline" /> ĐÃ HẾT GIỜ
              </>
            ) : (
              <>
                <Send className="w-6 h-6 mr-2 inline" /> GỬI ĐÁP ÁN
              </>
            )}
          </Button>
        )}
      </div>

      {/* Confirmation Modal Before Submit */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Xác Nhận Nộp Bài"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>Chọn lại</Button>
            <Button variant="primary" onClick={handleConfirmSubmit}>Gửi câu trả lời</Button>
          </>
        }
      >
        <div className="text-center py-4 space-y-3">
          <p className="text-sm font-bold text-slate-600">Em muốn gửi câu trả lời này?</p>
          <div className="p-4 rounded-2xl bg-sky-100 text-sky-950 font-black text-2xl border-2 border-sky-300">
            {session.selectedAnswer}
          </div>
          <p className="text-xs text-slate-400">Sau khi nộp bài, em sẽ không thể thay đổi đáp án nữa.</p>
        </div>
      </Modal>
    </div>
  );
};
