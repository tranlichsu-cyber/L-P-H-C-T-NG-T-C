import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Camera, CheckCircle2, Monitor, QrCode, Radio, Smartphone, Trash2, Users, X } from 'lucide-react';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useAuth } from '../../context/AuthContext';
import { activeRealtimeService } from '../../services/realtime/realtimeServiceSwitch';
import { QrCardsPrintButton } from '../../components/qr/QrCardsPrintButton';
import { QrBankService } from '../../services/qrBank/QrBankService';
import type { QrBank } from '../../services/qrBank/content';
import type { MockRoomData } from '../../services/realtime/types';
import {
  closeMultipleTeacherRooms,
  closeTeacherRoom,
  subscribeActiveTeacherRooms,
} from '../../services/qr/activeQrSession';

const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-40';
const input = 'mt-2 block w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-indigo-500';
const card = 'min-w-0 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';

export function QrCardsPage() {
  const { classes } = useTeacherData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [classId, setClassId] = useState('');
  const [quizId, setQuizId] = useState('');
  const [subject, setSubject] = useState('');
  const [selection, setSelection] = useState<{ bankId: string; ids: string[] } | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [busy, setBusy] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState<QrBank[]>([]);
  const [activeRooms, setActiveRooms] = useState<MockRoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const lock = useRef(false);
  const key = `qr-last-room-${currentUser?.uid || 'teacher'}`;

  useEffect(() => {
    return subscribeActiveTeacherRooms(currentUser?.uid, rooms => {
      setActiveRooms(rooms);
    });
  }, [currentUser?.uid]);

  const activeQrRoom = activeRooms.find(r => r.responseMode === 'QR_CARD') || activeRooms[0] || null;
  const otherActiveRooms = activeQrRoom
    ? activeRooms.filter(r => r.id !== activeQrRoom.id)
    : [];

  const cls =
    classes.find(c => c.id === classId) ||
    (activeQrRoom ? classes.find(c => c.id === activeQrRoom.classId) : undefined) ||
    classes[0];
  const filtered = available.filter(q => !subject || q.subject === subject);
  const quiz =
    filtered.find(q => q.id === quizId) ||
    (activeQrRoom ? filtered.find(q => q.id === activeQrRoom.quizId) : undefined) ||
    filtered[0];
  const questions = quiz?.questions || [];
  const selectedIds = selection && quiz && selection.bankId === quiz.id ? selection.ids : questions.map(q => q.id);
  const selected = questions.filter(q => selectedIds.includes(q.id));
  const totalPoints = selected.reduce((sum, q) => sum + (q.correctPoints ?? 10), 0);

  useEffect(() => {
    let cancelled = false;
    setAvailable([]);
    setLoading(true);
    setError('');
    QrBankService.list(currentUser?.uid || '', reload > 0)
      .then(items => { if (!cancelled) setAvailable(items); })
      .catch(() => { if (!cancelled) setError('Chưa tải được kho câu hỏi thẻ QR. Hãy thử lại.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentUser?.uid, reload]);

  let last = '';
  try { last = localStorage.getItem(key) || ''; } catch { /* Storage is optional. */ }
  const resumeRoomId = activeQrRoom?.id || last;

  async function handleCloseSingleRoom(roomId: string) {
    if (closingId) return;
    setClosingId(roomId);
    try {
      await closeTeacherRoom(roomId);
      if (last === roomId) {
        try { localStorage.removeItem(key); } catch { /* Ignore */ }
      }
      setActiveRooms(prev => prev.filter(r => r.id !== roomId));
    } finally {
      setClosingId(null);
    }
  }

  async function handleCloseRoomList(roomIds: string[]) {
    if (!roomIds.length || closingId) return;
    setClosingId('all');
    try {
      await closeMultipleTeacherRooms(roomIds);
      if (roomIds.includes(last)) {
        try { localStorage.removeItem(key); } catch { /* Ignore */ }
      }
      const closedSet = new Set(roomIds);
      setActiveRooms(prev => prev.filter(r => !closedSet.has(r.id)));
    } finally {
      setClosingId(null);
    }
  }

  async function start() {
    if (lock.current || !currentUser || !cls || !quiz || !selected.length || !cls.students.length) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      // Automatically close previous unfinished QR_CARD rooms so only the newly started room is active
      const oldQrRoomIds = activeRooms
        .filter(r => r.responseMode === 'QR_CARD')
        .map(r => r.id);
      if (oldQrRoomIds.length > 0) {
        await closeMultipleTeacherRooms(oldQrRoomIds);
      }

      const lessonQuestions = [...selected];
      if (shuffle) {
        for (let i = lessonQuestions.length - 1; i > 0; i--) {
          const j = Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * (i + 1));
          [lessonQuestions[i], lessonQuestions[j]] = [lessonQuestions[j], lessonQuestions[i]];
        }
      }
      const room = await activeRealtimeService.createRoom({
        teacherId: currentUser.uid, classId: cls.id, className: cls.name,
        subject: quiz.subject, quizId: quiz.id, quizTitle: quiz.title,
        responseMode: 'QR_CARD', questionSource: 'QR_BANK', questions: lessonQuestions,
        roster: cls.students.map(s => ({ id: s.id, name: s.name })),
      });
      if (lessonQuestions[0]?.id) {
        await Promise.resolve(activeRealtimeService.openQuestion(room.id, lessonQuestions[0].id)).catch(() => undefined);
      }
      try { localStorage.setItem(key, room.id); } catch { /* Starting does not depend on storage. */ }
      navigate(`/teacher/qr-cards/${encodeURIComponent(room.id)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chưa tạo được tiết học. Hãy thử lại.');
    } finally { lock.current = false; setBusy(false); }
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 text-slate-900">
      {/* ACTIVE ROOM SYNC BANNER FOR PHONE & PC */}
      {activeQrRoom && (
        <section
          aria-label="Tiết học đang chiếu trên máy tính"
          className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 p-5 text-white shadow-xl sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-400/40">
                <Radio className="h-4 w-4 animate-pulse text-emerald-400" />
                Đang chiếu trên máy tính • Kết nối đồng bộ
              </div>
              <h2 className="text-xl font-black sm:text-2xl">
                Lớp {activeQrRoom.className} • {activeQrRoom.quizTitle || 'Bộ câu hỏi đang chiếu'}
              </h2>
              <p className="text-xs font-semibold text-emerald-200 sm:text-sm">
                Môn: {activeQrRoom.subject || 'Chung'} • Bấm nút bên dưới để mở bộ câu hỏi, danh sách lớp, điều khiển câu hỏi và quét thẻ từ điện thoại.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                to={`/teacher/qr-cards/${encodeURIComponent(activeQrRoom.id)}/scan`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg transition hover:bg-amber-300"
              >
                <Smartphone className="h-5 w-5" />
                Mở màn quét & điều khiển trên điện thoại
              </Link>
              <Link
                to={`/teacher/qr-cards/${encodeURIComponent(activeQrRoom.id)}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/60 bg-emerald-900/50 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800/60"
              >
                <Monitor className="h-4 w-4" />
                Màn điều khiển máy tính
              </Link>
              <button
                type="button"
                disabled={Boolean(closingId)}
                onClick={() => void handleCloseSingleRoom(activeQrRoom.id)}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-rose-400/60 bg-rose-950/70 px-4 py-3 text-xs font-bold text-rose-200 transition hover:bg-rose-900 disabled:opacity-40"
                title="Kết thúc và đóng phòng đang mở này"
              >
                <X className="h-4 w-4" />
                {closingId === activeQrRoom.id ? 'Đang đóng…' : 'Đóng phòng này'}
              </button>
            </div>
          </div>

          {otherActiveRooms.length > 0 && (
            <div className="mt-4 border-t border-emerald-800/70 pt-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-emerald-300">
                  Các phòng đang mở khác của thầy/cô ({otherActiveRooms.length} phòng):
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={Boolean(closingId)}
                    onClick={() => void handleCloseRoomList(otherActiveRooms.map(r => r.id))}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-rose-500 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {closingId === 'all'
                      ? 'Đang đóng các phòng…'
                      : `Đóng tất cả ${otherActiveRooms.length} phòng khác`}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(closingId)}
                    onClick={() => void handleCloseRoomList(activeRooms.map(r => r.id))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/50 bg-rose-950/60 px-3 py-1.5 text-xs font-bold text-rose-200 transition hover:bg-rose-900 disabled:opacity-40"
                  >
                    Đóng tất cả các phòng ({activeRooms.length})
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                {otherActiveRooms.map(r => (
                  <div
                    key={r.id}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 pl-3 pr-1.5 py-1 text-xs font-bold text-white"
                  >
                    <Link
                      to={`/teacher/qr-cards/${encodeURIComponent(r.id)}/scan`}
                      className="hover:underline py-0.5"
                    >
                      📱 {r.className} • {r.quizTitle || r.subject || 'Phòng học'}
                    </Link>
                    <button
                      type="button"
                      disabled={Boolean(closingId)}
                      onClick={() => void handleCloseSingleRoom(r.id)}
                      className="ml-1 inline-flex items-center gap-0.5 rounded-lg bg-rose-600/90 px-2 py-1 text-[11px] font-black text-white hover:bg-rose-500 disabled:opacity-40"
                      title={`Đóng phòng ${r.className}`}
                    >
                      <X className="h-3 w-3" />
                      {closingId === r.id ? '...' : 'Đóng'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-800 via-indigo-700 to-violet-600 p-6 text-white sm:p-8">
        <QrCode className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 rotate-12 text-white/5" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-100">Lớp học tương tác • Thẻ giấy thông minh</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Trả lời bằng thẻ QR</h1>
          <p className="mt-3 leading-relaxed text-indigo-100">Cả lớp cùng trả lời, thầy cô quét bằng điện thoại và xem đáp án của từng em. Học sinh không cần thiết bị.</p>
        </div>
        <ol className="relative mt-6 grid gap-3 text-sm font-bold sm:grid-cols-3">
          {[{ icon: Users, text: 'Chọn lớp & in thẻ' }, { icon: BookOpen, text: 'Chọn câu hỏi' }, { icon: Camera, text: 'Chiếu & quét đáp án' }].map(({ icon: Icon, text }, i) => <li key={text} className="flex items-center gap-3 rounded-xl bg-white/10 p-3"><Icon className="h-5 w-5 shrink-0 text-amber-200" />{i + 1}. {text}</li>)}
        </ol>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div><h2 className="font-extrabold">Kho câu hỏi của thầy cô</h2><p className="mt-1 text-sm text-slate-600">Soạn câu có ảnh, video hoặc tải mẫu Word để nhập bộ đề.</p></div>
        <Link className={button} to="/teacher/qr-cards/bank">Mở kho câu hỏi QR <ArrowRight className="h-4 w-4" /></Link>
      </div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-900">{error}{!available.length && <button type="button" className="ml-2 font-bold underline" disabled={loading} onClick={() => setReload(v => v + 1)}>Thử tải lại kho câu hỏi</button>}</p>}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <section className={card}>
            <h2 className="flex items-center gap-3 text-lg font-black"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">1</span>Lớp học & thẻ học sinh</h2>
            <label className="block font-bold">Lớp học<select className={input} value={cls?.id || ''} onChange={e => setClassId(e.target.value)} disabled={busy || !classes.length}>{!classes.length && <option value="">Chưa có lớp học</option>}{classes.map(c => <option key={c.id} value={c.id}>{c.name} • {c.students.length} học sinh</option>)}</select></label>
            {cls && <QrCardsPrintButton key={cls.id} classId={cls.id} className={cls.name} roster={cls.students.map(s => ({ studentId: s.id, name: s.name }))} />}
            <p className="text-sm leading-relaxed text-slate-600">In thẻ một lần, dùng lại cho các tiết của cùng lớp. Phát đúng tên; học sinh xoay chữ A, B, C hoặc D lên trên để chọn đáp án.</p>
            {!classes.length && <Link className="font-bold text-indigo-700 underline" to="/teacher/classes">Tạo lớp và thêm học sinh →</Link>}
            {cls && !cls.students.length && <Link className="font-bold text-indigo-700 underline" to={`/teacher/classes/${cls.id}`}>Thêm học sinh cho lớp →</Link>}
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-3 text-lg font-black"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">2</span>Cấu hình câu hỏi cho tiết học</h2>
            <fieldset disabled={busy || loading} className="min-w-0 space-y-4 disabled:opacity-60">
              <label className="block font-bold">Lọc theo môn<select className={input} value={subject} onChange={e => { setSubject(e.target.value); setQuizId(''); setSelection(null); }}><option value="">Tất cả môn học</option>{[...new Set(available.map(q => q.subject))].sort((a, b) => a.localeCompare(b, 'vi')).map(s => <option key={s}>{s}</option>)}</select></label>
              <label className="block font-bold">Bộ câu hỏi QR riêng<select className={input} value={quiz?.id || ''} onChange={e => { setQuizId(e.target.value); setSelection(null); }}>{!filtered.length && <option value="">{loading ? 'Đang tải kho câu hỏi…' : 'Chưa có bộ câu hỏi'}</option>}{filtered.map(q => <option key={q.id} value={q.id}>{q.title} • {q.subject} • {q.grade}</option>)}</select></label>
              {quiz && <>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><p className="font-bold" aria-live="polite">Đã chọn {selected.length}/{questions.length} câu</p><div className="flex gap-4"><button type="button" className="font-bold text-indigo-700 underline" onClick={() => setSelection({ bankId: quiz.id, ids: questions.map(q => q.id) })}>Chọn tất cả</button><button type="button" className="font-bold text-slate-600 underline" onClick={() => setSelection({ bankId: quiz.id, ids: [] })}>Bỏ chọn</button></div></div>
                <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">{questions.map((q, i) => <label key={q.id} className="flex cursor-pointer items-start gap-3 p-3 hover:bg-indigo-50"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-indigo-700" checked={selectedIds.includes(q.id)} onChange={e => setSelection({ bankId: quiz.id, ids: e.target.checked ? [...selectedIds, q.id] : selectedIds.filter(id => id !== q.id) })} /><span className="min-w-0"><span className="block break-words text-sm font-semibold">{i + 1}. {q.content}</span><span className="mt-1 block text-xs text-slate-500">{q.options.length} lựa chọn • Đúng +{q.correctPoints ?? 10} điểm • Sai {(q.wrongPenalty ?? 0) ? `−${q.wrongPenalty}` : '0'} điểm{q.media?.imageUrl ? ' • Có ảnh' : ''}{q.media?.videoUrl ? ' • Có video' : ''}</span></span></label>)}</div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-indigo-700" checked={shuffle} onChange={e => setShuffle(e.target.checked)} /><span><strong className="block text-sm">Trộn thứ tự câu hỏi</strong><span className="text-xs text-slate-600">Chỉ trộn khi tạo tiết học; giữ nguyên thứ tự các đáp án A–D.</span></span></label>
              </>}
            </fieldset>
            {!loading && !available.length && <Link className="block font-bold text-indigo-700 underline" to="/teacher/qr-cards/bank/new">+ Tạo bộ câu hỏi QR có ảnh, video →</Link>}
          </section>
        </div>

        <aside className="min-w-0 space-y-5 lg:sticky lg:top-36">
          <section className={card}>
            <h2 className="flex items-center gap-2 text-lg font-black"><CheckCircle2 className="h-5 w-5 text-emerald-600" />Sẵn sàng lên lớp</h2>
            <dl className="space-y-3 text-sm"><div><dt className="text-slate-500">Lớp học</dt><dd className="mt-1 break-words font-bold">{cls ? `${cls.name} • ${cls.students.length} học sinh` : 'Chưa có lớp'}</dd></div><div><dt className="text-slate-500">Bộ câu hỏi</dt><dd className="mt-1 break-words font-bold">{quiz?.title || 'Chưa có bộ câu hỏi'}</dd></div><div><dt className="text-slate-500">Nội dung tiết học</dt><dd className="mt-1 font-bold">{selected.length} câu • Tối đa {totalPoints} điểm</dd></div><div><dt className="text-slate-500">Thứ tự</dt><dd className="mt-1 font-bold">{shuffle ? 'Trộn câu hỏi' : 'Theo bộ câu hỏi'}</dd></div></dl>
            <p className="text-xs leading-relaxed text-slate-500">Điểm đúng và điểm trừ theo từng câu trong kho. Mỗi em được ghi nhận đáp án đầu tiên cho mỗi câu.</p>
            <button className={`${button} w-full`} disabled={busy || loading || !currentUser || !cls?.students.length || !selected.length} onClick={() => void start()}>{busy ? 'Đang tạo tiết học…' : 'Bắt đầu tiết học bằng thẻ QR'}</button>
            {!selected.length && quiz && <p className="text-sm text-amber-800" role="status">Chọn ít nhất một câu hỏi để bắt đầu.</p>}
          </section>
          {resumeRoomId && (
            <Link className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-white p-4 text-sm font-bold text-indigo-700 hover:bg-indigo-50" to={`/teacher/qr-cards/${encodeURIComponent(resumeRoomId)}/scan`}>
              <Monitor className="h-5 w-5 shrink-0" />
              Tiếp tục tiết dùng thẻ đang mở (Màn quét & điều khiển)
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          )}
        </aside>
      </div>
      <details className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><summary className="cursor-pointer font-bold text-sky-900">Cách chiếu trên máy tính và quét bằng điện thoại</summary><ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700"><li>Bắt đầu tiết học, mở màn chiếu trên máy tính.</li><li>Dùng điện thoại quét mã mở màn quét và đăng nhập cùng tài khoản giáo viên.</li><li>Phát câu hỏi, yêu cầu học sinh giơ thẻ; quét từng nhóm nhỏ.</li><li>Kiểm tra tên và đáp án trước khi gửi. Đóng trả lời, công bố đáp án rồi chuyển câu.</li></ol></details>
    </section>
  );
}
