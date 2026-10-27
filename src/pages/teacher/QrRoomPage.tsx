import { QrProjector } from '../../components/qr/QrProjector';
import { QRCodeSVG } from 'qrcode.react';
import { QrQuestionContent } from '../../components/qr/QrQuestionContent';
import { choiceIndex } from '../../services/realtime/choiceStatistics';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useRoomRealtime } from '../../hooks/useRoomRealtime';
import { activeRealtimeService } from '../../services/realtime/realtimeServiceSwitch';
import { useAuth } from '../../context/AuthContext';
import { closeTeacherRoom, saveReturnTo, subscribeActiveTeacherRooms } from '../../services/qr/activeQrSession';
import { broadcastRoomState, requestRelaySync } from '../../services/qr/cloudRoomRelay';
import type { MockRoomData } from '../../services/realtime/types';

const QrCardsPanel = lazy(() => import('../../components/qr/QrCardsPanel'));
const button =
  'inline-flex items-center justify-center rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-40';
const secondaryButton =
  'inline-flex items-center justify-center rounded-xl border border-indigo-300 bg-indigo-900/60 px-3 py-2 text-xs font-bold text-indigo-100 hover:bg-indigo-800';

export function QrRoomPage({ screen = 'control' }: { screen?: 'control' | 'scan' | 'present' }) {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { currentUser, signOutTeacher } = useAuth();
  const questionStage = useRef<HTMLElement>(null);
  const { roomId } = useParams();
  const room = useRoomRealtime(roomId || null);
  const [activeRooms, setActiveRooms] = useState<MockRoomData[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showTopQr, setShowTopQr] = useState(true);
  const [showGraph, setShowGraph] = useState(false);
  const [revealAnswers, setRevealAnswers] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    if (room?.id) {
      void broadcastRoomState(room.id);
      return;
    }
    return subscribeActiveTeacherRooms(currentUser?.uid, setActiveRooms);
  }, [currentUser?.uid, room?.id]);

  if (!room) {
    const otherActive = activeRooms.find(r => r.responseMode === 'QR_CARD') || activeRooms[0] || null;
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
        <p className="font-bold text-slate-800">
          Đang đồng bộ tiết học dùng thẻ QR với máy tính… Hãy giữ màn hình chiếu mở trên máy tính hoặc bấm nút đồng bộ bên dưới.
        </p>
        {currentUser?.email && (
          <p className="rounded-xl bg-slate-100 p-3 text-xs font-bold text-slate-700">
            Tài khoản đang đăng nhập trên thiết bị này: <strong className="text-indigo-700">{currentUser.email}</strong>
          </p>
        )}
        {otherActive && otherActive.id !== roomId && (
          <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 space-y-2">
            <p className="text-xs font-extrabold uppercase text-emerald-800">
              🟢 Phát hiện tiết học đang chiếu trên tài khoản này:
            </p>
            <p className="text-base font-black text-emerald-950">
              Lớp {otherActive.className} • {otherActive.quizTitle || 'Bộ câu hỏi đang chiếu'}
            </p>
            <Link
              className={button}
              to={`/teacher/qr-cards/${encodeURIComponent(otherActive.id)}/scan`}
            >
              📱 Mở ngay bộ câu hỏi & lớp đang chiếu này
            </Link>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={button}
            onClick={() => requestRelaySync(roomId || undefined, currentUser?.uid)}
          >
            🔄 Đồng bộ lại ngay với máy tính
          </button>
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-900 hover:bg-indigo-100"
            to="/teacher/qr-cards"
          >
            Về mục thẻ QR (Chọn lớp & bắt đầu tiết mới)
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
            onClick={async () => {
              saveReturnTo(routerLocation.pathname + routerLocation.search);
              await signOutTeacher();
              navigate('/login', { state: { returnTo: routerLocation.pathname + routerLocation.search } });
            }}
          >
            Đổi tài khoản giáo viên trên điện thoại
          </button>
        </div>
      </div>
    );
  }

  const base = `/teacher/qr-cards/${encodeURIComponent(room.id)}`;
  const ids = (room.questionOrder || Object.keys(room.liveQuestions)).filter(
    id => room.liveQuestions[id]
  );
  const q = room.activeQuestionId
    ? room.liveQuestions[room.activeQuestionId]
    : room.liveQuestions[ids[0]];
  const index = q ? ids.indexOf(q.id) : -1;
  const finished = room.status === 'FINISHED';
  const nextId = [...ids.slice(index + 1), ...ids.slice(0, index)].find(
    id => room.liveQuestions[id].status === 'READY'
  );
  const currentSubmissions = Object.values(room.submissions).filter(s => s.questionId === q?.id);
  const isResult = q?.status === 'RESULT';
  const correctIdx = isResult
    ? choiceIndex(q?.options || [], q?.correctAnswer, q?.type || 'MULTIPLE_CHOICE')
    : -1;

  async function act(work: () => boolean | Promise<boolean>, reveal = false) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      if (!(await work()))
        throw new Error('Chưa thực hiện được thao tác. Hãy kiểm tra trạng thái câu hỏi.');
      if (reveal)
        questionStage.current?.scrollIntoView({
          block: 'start',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
        });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chưa thực hiện được. Hãy thử lại.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const currentRoom = room;

  async function jumpToQuestion(targetQuestionId: string) {
    if (!targetQuestionId || targetQuestionId === q?.id) return;
    await act(async () => {
      if (q) {
        if (q.status === 'OPEN') {
          const closed = await activeRealtimeService.closeQuestion(currentRoom.id, q.id);
          if (!closed) return false;
          const scored = await activeRealtimeService.showQuestionResult(currentRoom.id, q.id);
          if (!scored) return false;
        } else if (q.status === 'CLOSED') {
          const scored = await activeRealtimeService.showQuestionResult(currentRoom.id, q.id);
          if (!scored) return false;
        }
      }
      return await activeRealtimeService.openQuestion(currentRoom.id, targetQuestionId);
    }, true);
  }

  async function revealCurrentAnswer() {
    if (!q) return;
    await act(async () => {
      if (q.status === 'OPEN') {
        const closed = await activeRealtimeService.closeQuestion(currentRoom.id, q.id);
        if (!closed) return false;
      }
      return await activeRealtimeService.showQuestionResult(currentRoom.id, q.id);
    });
  }

  async function endRoomNow() {
    await act(async () => {
      if (q && (q.status === 'OPEN' || q.status === 'CLOSED')) {
        if (q.status === 'OPEN') {
          await Promise.resolve(activeRealtimeService.closeQuestion(currentRoom.id, q.id)).catch(() => false);
        }
        await Promise.resolve(activeRealtimeService.showQuestionResult(currentRoom.id, q.id)).catch(() => false);
      }
      return await closeTeacherRoom(currentRoom.id);
    });
    setConfirmEnd(false);
  }

  if (screen === 'present')
    return <QrProjector room={room} question={q} index={index} total={ids.length} />;

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/teacher/qr-cards" className="font-bold text-indigo-700">
            ← Trả lời bằng thẻ QR
          </Link>
          <h1 className="mt-2 text-2xl font-black">
            {room.className} • {room.quizTitle}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {screen === 'control' && (
            <>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border-2 border-indigo-600 bg-indigo-50 px-4 py-3 text-sm font-extrabold text-indigo-900 hover:bg-indigo-100"
                onClick={() => setShowTopQr(v => !v)}
              >
                {showTopQr ? 'Ẩn mã QR điện thoại' : '📱 Mã QR kết nối điện thoại'}
              </button>
              <Link className={button} to={`${base}/present`}>
                Mở màn chiếu toàn màn hình
              </Link>
            </>
          )}
          {screen === 'scan' && (
            <Link className={button} to={base}>
              Về màn điều khiển máy tính
            </Link>
          )}
        </div>
      </header>

      {screen === 'control' && showTopQr && (
        <section className="grid items-center gap-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/70 p-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-800">
              📱 Kết nối điện thoại làm máy quét & điều khiển từ xa (Như Plickers)
            </p>
            <h2 className="text-base font-black text-slate-900">
              Quét mã bên phải bằng điện thoại giáo viên để mở ngay Lớp {room.className} • Bộ câu hỏi: {room.quizTitle}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lưu ý: Trên điện thoại, hãy đăng nhập cùng tài khoản giáo viên{currentUser?.email ? ` (${currentUser.email})` : ''} đang dùng trên máy tính. Hoặc mở trực tiếp mục <strong>Trả lời bằng thẻ QR</strong> trên điện thoại, hệ thống sẽ tự động hiện tiết học đang chiếu này.
            </p>
          </div>
          <div className="w-fit rounded-xl border border-indigo-200 bg-white p-2 shadow-xs mx-auto sm:mx-0">
            <QRCodeSVG value={`${location.origin}${base}/scan`} size={124} marginSize={2} />
            <p className="mt-1 text-center text-[11px] font-black text-indigo-900">Quét bằng ĐT Giáo viên</p>
          </div>
        </section>
      )}

      {screen === 'control' && (
        <section
          ref={questionStage}
          aria-label="Câu hỏi và các lựa chọn"
          className="scroll-mt-36 space-y-5 rounded-3xl bg-slate-950 p-5 text-white sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-indigo-200">
              Câu {index + 1}/{ids.length} •{' '}
              {finished
                ? 'Tiết học đã kết thúc'
                : q?.status === 'OPEN'
                  ? 'Học sinh giơ thẻ để chọn đáp án'
                  : q?.status === 'RESULT'
                    ? 'Đáp án đã công bố'
                    : q?.status === 'CLOSED'
                      ? 'Đã đóng nhận đáp án'
                      : 'Xem trước • Bấm Phát câu hỏi để bắt đầu'}
            </p>
            <button
              type="button"
              className={secondaryButton}
              aria-pressed={showGraph || isResult}
              onClick={() => setShowGraph(v => !v)}
            >
              {showGraph || isResult ? 'Ẩn biểu đồ A–D' : 'Hiện biểu đồ A–D'}
            </button>
          </div>
          <QrQuestionContent
            question={q}
            submissions={currentSubmissions}
            showGraph={showGraph}
          />
          <p className="text-sm text-indigo-200">
            Xoay chữ A, B, C hoặc D lên trên thẻ để chọn đáp án.
          </p>
        </section>
      )}

      {screen === 'control' && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-bold text-indigo-700">TIẾN ĐỘ TIẾT HỌC</p>
            <p className="mt-2 text-lg font-black">
              Câu {index + 1} / {ids.length}
            </p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-xs font-bold text-sky-700">TRẠNG THÁI</p>
            <p className="mt-2 text-lg font-black">
              {finished
                ? 'Đã kết thúc'
                : q?.status === 'OPEN'
                  ? 'Đang nhận đáp án'
                  : q?.status === 'CLOSED'
                    ? 'Chờ chấm điểm'
                    : q?.status === 'RESULT'
                      ? 'Đã công bố đáp án'
                      : 'Sẵn sàng phát câu hỏi'}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-bold text-emerald-700">ĐÃ NHẬN CÂU NÀY</p>
            <p className="mt-2 text-lg font-black" aria-live="polite">
              {currentSubmissions.length} / {room.roster.length} học sinh
            </p>
          </div>
        </div>
      )}

      {screen === 'control' && (
        <section className="space-y-3 rounded-2xl border-2 border-indigo-200 bg-white p-4">
          <h2 className="font-black">
            Điều khiển câu hỏi • {index + 1}/{ids.length}
          </h2>
          {busy && (
            <p role="status" className="font-bold text-indigo-700">
              Đang xử lý, vui lòng chờ…
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-900">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              className={button}
              disabled={busy || finished || !q || !['READY', 'CLOSED'].includes(q.status)}
              onClick={() => void act(() => activeRealtimeService.openQuestion(room.id, q.id), true)}
            >
              Phát câu hỏi
            </button>
            <button
              className={button}
              disabled={busy || finished || q?.status !== 'OPEN'}
              onClick={() => void act(() => activeRealtimeService.closeQuestion(room.id, q.id))}
            >
              Đóng trả lời
            </button>
            <button
              className={button}
              disabled={busy || finished || !q || !['OPEN', 'CLOSED'].includes(q.status)}
              onClick={() => void revealCurrentAnswer()}
            >
              Hiện đáp án / Chấm điểm
            </button>
            <button
              className={button}
              disabled={busy || finished || !nextId}
              onClick={() => void jumpToQuestion(nextId!)}
            >
              Câu tiếp theo →
            </button>
          </div>
          <label className="block font-bold">
            Chọn và phát câu hỏi
            <select
              className="mt-2 block w-full rounded-xl border p-3 font-normal"
              value={q?.id || ''}
              disabled={busy || finished}
              onChange={e => void jumpToQuestion(e.target.value)}
            >
              {ids.map((id, i) => {
                const st = room.liveQuestions[id]?.status;
                return (
                  <option
                    key={id}
                    value={id}
                    disabled={st === 'RESULT' && id !== q?.id}
                  >
                    {i + 1}. {st === 'RESULT' ? '(Đã chấm) ' : ''}{room.liveQuestions[id].content}
                  </option>
                );
              })}
            </select>
          </label>
          <p className="text-sm">
            Có thể bấm <strong>Hiện đáp án</strong> hoặc <strong>Câu tiếp theo</strong> bất cứ lúc
            nào trên máy tính hoặc trên màn hình điện thoại (hệ thống tự động chốt & chấm điểm câu
            đang mở trước khi chuyển câu).
          </p>
          {!finished && !confirmEnd && (
            <button
              className="font-bold text-rose-800 underline"
              onClick={() => setConfirmEnd(true)}
            >
              Kết thúc tiết học…
            </button>
          )}
          {confirmEnd && !finished && (
            <div className="rounded-xl bg-amber-50 p-3">
              <p>
                Chốt tiết học và lưu kết quả của học sinh? Hãy đóng trả lời và chấm điểm câu đang mở
                trước khi kết thúc.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className={button}
                  disabled={busy}
                  onClick={() => void endRoomNow()}
                >
                  Xác nhận kết thúc
                </button>
                <button className={button} onClick={() => setConfirmEnd(false)}>
                  Tiếp tục dạy
                </button>
              </div>
            </div>
          )}
          {finished && <p className="font-bold">Tiết học đã kết thúc.</p>}
          <Link className="block font-bold text-indigo-700 underline" to={`/teacher/history/${room.id}`}>
            Xem báo cáo bài làm và điểm →
          </Link>
        </section>
      )}

      {screen === 'control' && (
        <details className="rounded-2xl border border-slate-200 bg-white p-5" open>
          <summary className="cursor-pointer font-black">
            Trạng thái trả lời của lớp • Câu {index + 1} ({currentSubmissions.length}/
            {room.roster.length})
          </summary>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Mặc định ẩn lựa chọn A/B/C/D khi đang quét để học sinh không nhìn theo nhau (như
              Plickers).
            </p>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
              onClick={() => setRevealAnswers(v => !v)}
            >
              {revealAnswers || isResult ? 'Ẩn lựa chọn cụ thể' : 'Hiện lựa chọn A/B/C/D'}
            </button>
          </div>
          <ul className="mt-3 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
            {room.roster.map((p, idx) => {
              const submission = currentSubmissions.find(s => s.studentId === p.studentId);
              const ansIdx = submission
                ? choiceIndex(
                    q?.options || [],
                    submission.answer,
                    q?.type || 'MULTIPLE_CHOICE'
                  )
                : -1;
              const isCorrect = isResult && submission && ansIdx === correctIdx;
              const showLetter = revealAnswers || isResult;
              return (
                <li
                  key={p.studentId}
                  className={`flex items-start justify-between gap-3 rounded-xl p-3 text-sm ${
                    !submission
                      ? 'bg-slate-50 text-slate-500'
                      : !isResult
                        ? 'bg-sky-50 text-sky-900 border border-sky-200'
                        : isCorrect
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <span className="min-w-0 break-words font-semibold">
                    {idx + 1}. {p.name}
                  </span>
                  <span className="shrink-0 font-bold">
                    {!submission
                      ? 'Chưa trả lời'
                      : showLetter
                        ? `Chọn ${submission.answer}${isResult ? (isCorrect ? ' ✓' : ' ✗') : ''}`
                        : 'Đã quét ✓'}
                  </span>
                </li>
              );
            })}
          </ul>
        </details>
      )}

      {screen === 'scan' && error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-900">
          {error}
        </p>
      )}

      {screen === 'control' && (
        <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <h2 className="text-lg font-black">
              Kết nối điện thoại làm máy quét & điều khiển từ xa (như Plickers)
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              Dùng camera điện thoại mở mã bên cạnh và đăng nhập cùng tài khoản giáo viên. Điện thoại
              vừa quét thẻ tự động, vừa có nút Phát câu hỏi / Đóng trả lời / Hiện đáp án / Câu tiếp
              theo để điều khiển màn chiếu từ xa.
            </p>
            <a className="inline-block font-bold text-indigo-700 underline" href={base + '/scan'}>
              Mở màn quét trên thiết bị này →
            </a>
            <div>
              <button
                type="button"
                className={button}
                aria-expanded={showScanner}
                aria-controls="qr-local-scanner"
                onClick={() => setShowScanner(v => !v)}
              >
                {showScanner ? 'Ẩn màn quét tại đây' : 'Quét ngay trên máy này'}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Đường dẫn dành cho giáo viên, không phát cho học sinh.
            </p>
          </div>
          <div className="w-fit rounded-xl border border-slate-100 p-2">
            <QRCodeSVG value={`${location.origin}${base}/scan`} size={148} marginSize={4} />
            <p className="text-center text-xs font-bold text-slate-600">Quét để mở điện thoại</p>
          </div>
        </section>
      )}

      {(screen === 'scan' || showScanner) && (
        <div id="qr-local-scanner">
          <Suspense fallback={<p>Đang mở màn thẻ QR…</p>}>
            <QrCardsPanel
              room={room}
              onClose={() => (screen === 'scan' ? navigate(base) : setShowScanner(false))}
            />
          </Suspense>
        </div>
      )}
    </section>
  );
}
