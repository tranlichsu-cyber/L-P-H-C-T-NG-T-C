import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useStudentSession } from '../../context/StudentSessionContext';
import { activeRealtimeService } from '../../services/realtime/realtimeServiceSwitch';
import { matchVietnameseText } from '../../utils/normalizeVietnamese';
import { User, ArrowLeft, Search, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const SelectNamePage: React.FC = () => {
  const navigate = useNavigate();
  const { session, room: activeRoom, selectStudent, resetStudent } = useStudentSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [pendingStudent, setPendingStudent] = useState<{ id: string; name: string } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Student Device Memory (v1.1 IMP-03)
  const [rememberedStudent, setRememberedStudent] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!activeRoom) return;
    const savedId = localStorage.getItem('lhtt_last_student_id');
    const savedName = localStorage.getItem('lhtt_last_student_name');

    if (savedId && savedName) {
      const existsInRoster = activeRoom.roster.some((s) => s.id === savedId || s.name === savedName);
      if (existsInRoster) {
        setRememberedStudent({ id: savedId, name: savedName });
      }
    }
  }, [activeRoom]);

  // Filter students from ROOM ROSTER
  const filteredStudents = useMemo(() => {
    if (!activeRoom || !activeRoom.roster) return [];
    return activeRoom.roster.filter((std) =>
      matchVietnameseText(std.name, searchQuery)
    );
  }, [activeRoom, searchQuery]);

  // Active Participants List (for Name Conflict Detection)
  const activeParticipantNames = useMemo(() => {
    if (!activeRoom || !activeRoom.participants) return new Set<string>();
    return new Set(Object.values(activeRoom.participants).map((p: any) => p.name));
  }, [activeRoom]);

  // Route Guard: Require valid room code
  if (!session.roomCode || !activeRoom) {
    return <Navigate to="/student/join" replace />;
  }

  // Click Student Name Card
  const handleSelectCard = (std: { id: string; name: string }) => {
    setPendingStudent(std);
    setIsConfirmOpen(true);
  };

  // Confirm Name Choice -> Registers Participant & Saves to Device Memory
  const handleConfirmStudent = async (targetStudent?: { id: string; name: string }) => {
    const studentToJoin = targetStudent || pendingStudent;
    if (!studentToJoin || !activeRoom) return;

    // Save student identity in Device Memory for future fast join
    localStorage.setItem('lhtt_last_student_id', studentToJoin.id);
    localStorage.setItem('lhtt_last_student_name', studentToJoin.name);

    const mockAuthUid = `mock-user-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const result = await Promise.resolve(
      activeRealtimeService.joinParticipant(
        activeRoom.id,
        studentToJoin.id,
        studentToJoin.name,
        mockAuthUid
      )
    );

    if (!result.participant) {
      return;
    }

    selectStudent(studentToJoin.id, studentToJoin.name);
    setIsConfirmOpen(false);
    navigate('/student/waiting');
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Room Badge Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/join')}
          className="flex items-center gap-1 text-sky-700 font-bold text-sm bg-white/80 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Đổi mã phòng
        </button>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm">
          {activeRoom.className} • Môn {activeRoom.subject}
        </span>
      </div>

      {/* DEVICE MEMORY QUICK SUGGESTION (v1.1 IMP-03) */}
      {!session.studentName && rememberedStudent && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-3xl p-5 border-2 border-amber-300 shadow-lg text-slate-950 space-y-3">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide">
            <Sparkles className="w-4 h-4 fill-slate-950" /> GỢI Ý TÊN TRÊN THIẾT BỊ NÀY
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold text-slate-800">Có phải em là:</p>
              <h3 className="text-2xl font-black text-slate-950">{rememberedStudent.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleConfirmStudent(rememberedStudent)}
                className="font-black text-white shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" /> ĐÚNG, LÀ EM
              </Button>
              <button
                onClick={() => setRememberedStudent(null)}
                className="px-3 py-2 text-xs font-bold text-slate-800 hover:text-slate-950 underline"
              >
                Không phải em
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If Already Chosen Name */}
      {session.studentName ? (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-lg text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold text-2xl">
            <User className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Tên em đã chọn</span>
            <h2 className="text-2xl font-black text-slate-900">{session.studentName}</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="student" size="lg" fullWidth onClick={() => navigate('/student/waiting')}>
              VÀO PHÒNG CHỜ 🚀
            </Button>
            <Button variant="secondary" size="md" onClick={() => setIsResetConfirmOpen(true)}>
              <RefreshCw className="w-4 h-4 mr-1 text-slate-600" /> Đổi học sinh
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-sky-950 mb-1">CHỌN TÊN CỦA EM</h1>
            <p className="text-slate-600 text-sm font-medium">Hãy chọn đúng tên của em trong danh sách bên dưới</p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên của em..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-sky-200 bg-white text-base font-semibold text-slate-900 focus:border-sky-500 focus:outline-none shadow-sm"
            />
          </div>

          {/* Large Student Cards with Tap Target >= 48px */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-slate-400 font-bold bg-white rounded-2xl border border-slate-200">
                Không tìm thấy tên nào phù hợp với "{searchQuery}"
              </div>
            ) : (
              filteredStudents.map((std, idx) => {
                const isConflict = activeParticipantNames.has(std.name);
                const colorVariants = [
                  'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white',
                  'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white',
                  'bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 border border-amber-300',
                  'bg-gradient-to-tr from-purple-500 to-pink-600 text-white',
                  'bg-gradient-to-tr from-rose-500 to-red-600 text-white',
                ];
                const avatarStyle = colorVariants[idx % colorVariants.length];

                return (
                  <button
                    key={std.id}
                    type="button"
                    onClick={() => handleSelectCard(std)}
                    className="p-4 rounded-2xl border-2 border-slate-200/90 bg-white text-slate-900 font-bold hover:border-amber-400 hover:bg-amber-50/60 hover:shadow-md transition-all flex items-center justify-between min-h-[60px] text-left active:scale-[0.98] shadow-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${avatarStyle} font-black text-lg flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                        {std.name.substring(0, 1)}
                      </div>
                      <div>
                        <span className="text-lg block leading-snug font-black text-slate-900">{std.name}</span>
                        {isConflict && (
                          <span className="text-[11px] font-extrabold text-amber-700 block">
                            * Tên này đang mở trên thiết bị khác
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Xác Nhận Học Sinh"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>Chọn lại</Button>
            <Button variant="primary" onClick={() => handleConfirmStudent()}>Đúng, đây là em</Button>
          </>
        }
      >
        <div className="text-center py-4 space-y-3">
          <p className="text-sm font-semibold text-slate-500">Đây có phải là em không?</p>
          <div className="p-4 rounded-2xl bg-amber-100 text-amber-950 font-black text-2xl border-2 border-amber-300">
            {pendingStudent?.name}
          </div>
        </div>
      </Modal>

      {/* Reset Student Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Xác Nhận Đổi Học Sinh"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsResetConfirmOpen(false)}>Hủy</Button>
            <Button
              variant="danger"
              onClick={() => {
                resetStudent();
                setIsResetConfirmOpen(false);
              }}
            >
              Xác nhận đổi
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-2">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
          <p className="text-sm font-semibold text-slate-700">
            Em có chắc muốn chọn lại tên học sinh khác không?
          </p>
        </div>
      </Modal>
    </div>
  );
};
