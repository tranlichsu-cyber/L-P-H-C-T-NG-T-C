import { QrMediaDetails } from './QrQuestionMedia';
import { useEffect, useRef, useState } from 'react';
import { QrCardsPrintButton } from './QrCardsPrintButton';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import type { MockRoomData } from '../../services/realtime/types';
import { choiceIndex, countChoices } from '../../services/realtime/choiceStatistics';
import {
  parseCard,
  cardChoice,
  canScanQuestion,
  qrQuestionSupported,
  type CardChoice,
} from '../../services/qr/cards';
import { activeRealtimeService } from '../../services/realtime/realtimeServiceSwitch';
import './qrCards.css';

const button =
  'inline-flex items-center justify-center rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-40';
const secondaryButton =
  'inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-800 hover:bg-indigo-100 disabled:opacity-40';

type Detected = { studentId: string; name: string; choice: CardChoice };
type OverlayTag = {
  studentId: string;
  name: string;
  choice: CardChoice;
  xPct: number;
  yPct: number;
  status: 'saved' | 'pending';
  at: number;
};

export default function QrCardsPanel({
  room,
  onClose,
}: {
  room: MockRoomData;
  onClose: () => void;
}) {
  const scannerUrl = `${location.origin}/teacher/qr-cards/${encodeURIComponent(room.id)}/scan`;
  const ids = (room.questionOrder || Object.keys(room.liveQuestions)).filter(
    id => room.liveQuestions[id]
  );
  const q = room.activeQuestionId
    ? room.liveQuestions[room.activeQuestionId]
    : room.liveQuestions[ids[0]];
  const index = q ? ids.indexOf(q.id) : -1;
  const finished = room.status === 'FINISHED';
  const nextId = [...ids.slice(index + 1), ...ids.slice(0, index)].find(
    id => room.liveQuestions[id]?.status === 'READY'
  );
  const prevId =
    index > 0
      ? [...ids.slice(0, index)].reverse().find(id => room.liveQuestions[id]?.status === 'READY')
      : undefined;

  const [ctrlBusy, setCtrlBusy] = useState(false);
  const [ctrlError, setCtrlError] = useState('');
  const [showGraph, setShowGraph] = useState(false);
  const ctrlLock = useRef(false);

  async function runControl(work: () => boolean | Promise<boolean>) {
    if (ctrlLock.current) return;
    ctrlLock.current = true;
    setCtrlBusy(true);
    setCtrlError('');
    try {
      if (!(await work())) {
        throw new Error('Chưa thực hiện được thao tác. Hãy kiểm tra trạng thái câu hỏi.');
      }
    } catch (e) {
      setCtrlError(e instanceof Error ? e.message : 'Chưa thực hiện được. Hãy thử lại.');
    } finally {
      ctrlLock.current = false;
      setCtrlBusy(false);
    }
  }

  // Smart Plickers-style transition: allows jumping to another question from ANY state
  // (automatically closes or finalizes current question if needed before opening targetQuestionId)
  async function jumpToQuestion(targetQuestionId: string) {
    if (!targetQuestionId || targetQuestionId === q?.id) return;
    await runControl(async () => {
      if (q) {
        if (q.status === 'OPEN') {
          const closed = await activeRealtimeService.closeQuestion(room.id, q.id);
          if (!closed) return false;
          const scored = await activeRealtimeService.showQuestionResult(room.id, q.id);
          if (!scored) return false;
        } else if (q.status === 'CLOSED') {
          const scored = await activeRealtimeService.showQuestionResult(room.id, q.id);
          if (!scored) return false;
        }
      }
      return await activeRealtimeService.openQuestion(room.id, targetQuestionId);
    });
  }

  // Smart Plickers-style "Hiện đáp án": if question is still OPEN, automatically closes it then shows result
  async function revealCurrentAnswer() {
    if (!q) return;
    await runControl(async () => {
      if (q.status === 'OPEN') {
        const closed = await activeRealtimeService.closeQuestion(room.id, q.id);
        if (!closed) return false;
      }
      return await activeRealtimeService.showQuestionResult(room.id, q.id);
    });
  }

  const submissions = Object.values(room.submissions).filter(s => s.questionId === q?.id);
  const counts = countChoices(
    q?.options || [],
    submissions,
    q?.type || 'MULTIPLE_CHOICE'
  );
  const isResult = q?.status === 'RESULT';
  const correctIdx = isResult
    ? choiceIndex(q?.options || [], q?.correctAnswer, q?.type || 'MULTIPLE_CHOICE')
    : -1;
  const displayGraph = showGraph || isResult;

  return (
    <section className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-white p-4 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">
            Quét thẻ & Điều khiển từ xa • {room.className}
          </h2>
          <p className="text-xs font-bold text-indigo-700">
            Câu {index + 1}/{ids.length} • Đã nhận {submissions.length}/{room.roster.length} em
          </p>
        </div>
        <button className={button} onClick={onClose}>
          Đóng màn quét
        </button>
      </div>

      {/* Plickers-style Remote Control Bar right on the phone */}
      <div className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
            Điều khiển màn chiếu từ điện thoại
          </span>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-extrabold text-indigo-700 shadow-2xs">
            {finished
              ? 'Đã kết thúc'
              : q?.status === 'OPEN'
                ? '🟢 Đang nhận đáp án'
                : q?.status === 'CLOSED'
                  ? '🟡 Đã đóng trả lời'
                  : q?.status === 'RESULT'
                    ? '🔵 Đã công bố đáp án'
                    : '⚪ Chờ phát câu hỏi'}
          </span>
        </div>

        {ctrlBusy && (
          <p role="status" className="text-xs font-bold text-indigo-700">
            Đang chuyển trạng thái trên màn chiếu…
          </p>
        )}

        {ctrlError && (
          <p role="alert" className="rounded-xl bg-rose-50 p-2.5 text-xs font-bold text-rose-900">
            {ctrlError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            className={button}
            disabled={ctrlBusy || finished || !q || !['READY', 'CLOSED'].includes(q.status)}
            onClick={() => void runControl(() => activeRealtimeService.openQuestion(room.id, q.id))}
          >
            Phát câu hỏi
          </button>
          <button
            type="button"
            className={button}
            disabled={ctrlBusy || finished || q?.status !== 'OPEN'}
            onClick={() => void runControl(() => activeRealtimeService.closeQuestion(room.id, q.id))}
          >
            Đóng trả lời
          </button>
          <button
            type="button"
            className={button}
            disabled={ctrlBusy || finished || !q || !['OPEN', 'CLOSED'].includes(q.status)}
            onClick={() => void revealCurrentAnswer()}
          >
            Hiện đáp án
          </button>
          <button
            type="button"
            className={button}
            disabled={ctrlBusy || finished || !nextId}
            onClick={() => void jumpToQuestion(nextId!)}
          >
            Câu tiếp theo →
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {prevId && (
            <button
              type="button"
              className={secondaryButton}
              disabled={ctrlBusy || finished}
              onClick={() => void jumpToQuestion(prevId)}
            >
              ← Câu trước
            </button>
          )}
          <label className="flex min-w-0 flex-1 items-center gap-2 text-xs font-bold text-slate-700">
            <span className="shrink-0">Đổi câu:</span>
            <select
              aria-label="Chọn nhanh câu hỏi trên điện thoại"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-900"
              value={q?.id || ''}
              disabled={ctrlBusy || finished}
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
                    Câu {i + 1} {st === 'RESULT' ? '(Đã chấm)' : ''}: {room.liveQuestions[id].content}
                  </option>
                );
              })}
            </select>
          </label>
          <button
            type="button"
            className={secondaryButton}
            aria-pressed={displayGraph}
            onClick={() => setShowGraph(v => !v)}
          >
            {displayGraph ? 'Ẩn biểu đồ A–D' : 'Xem biểu đồ A–D'}
          </button>
        </div>
      </div>

      {/* Question & Live Bar Graph on Remote */}
      <div className="rounded-xl bg-sky-50 p-4">
        <strong className="block text-base">
          Câu {index + 1}: {q?.content || 'Chưa chọn câu hỏi'}
        </strong>
        {q?.media && <QrMediaDetails key={q.id} media={q.media} />}
        <ol className="mt-2 space-y-1.5">
          {q?.options?.map((o, i) => {
            const letter = String.fromCharCode(65 + i);
            const cnt = counts[i] || 0;
            const pct = submissions.length > 0 ? Math.round((cnt / submissions.length) * 100) : 0;
            const isCorrectChoice = isResult && i === correctIdx;
            return (
              <li
                key={i}
                className={`relative overflow-hidden rounded-lg border px-3 py-2 text-sm font-semibold ${
                  isCorrectChoice
                    ? 'border-emerald-400 bg-emerald-100 text-emerald-950'
                    : 'border-sky-200 bg-white text-slate-800'
                }`}
              >
                {displayGraph && submissions.length > 0 && (
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-y-0 left-0 ${
                      isCorrectChoice ? 'bg-emerald-300/50' : 'bg-sky-200/60'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between gap-2">
                  <span>
                    <strong>{letter}.</strong> {o} {isCorrectChoice && '✓'}
                  </span>
                  {displayGraph && (
                    <span className="shrink-0 rounded bg-slate-900/10 px-2 py-0.5 text-xs font-black">
                      {cnt} ({pct}%)
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-sm font-bold text-indigo-900">
          {!qrQuestionSupported(q)
            ? 'Thẻ QR dùng cho câu trắc nghiệm có 2–4 lựa chọn.'
            : canScanQuestion(room, q)
              ? 'Đang nhận đáp án — đưa camera hướng về phía học sinh giơ thẻ.'
              : 'Bấm “Phát câu hỏi” ở trên để bắt đầu quét thẻ học sinh.'}
        </p>
      </div>

      <Scanner key={q?.id || 'none'} room={room} />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <QrCardsPrintButton classId={room.classId} className={room.className} roster={room.roster} />
        <details className="rounded-xl bg-indigo-50 p-3 text-sm">
          <summary className="cursor-pointer font-bold text-indigo-900">
            Mã QR mở màn quét trên điện thoại khác
          </summary>
          <p className="my-3 text-xs text-slate-600">
            Dùng camera điện thoại mở mã này, đăng nhập cùng tài khoản giáo viên. Giữ máy tính ở màn
            chiếu. Đây là đường dẫn điều khiển, không đưa cho học sinh.
          </p>
          <QRCodeSVG value={scannerUrl} size={140} marginSize={4} />
          <a className="mt-2 block break-all text-xs underline" href={scannerUrl}>
            {scannerUrl}
          </a>
        </details>
      </div>
    </section>
  );
}

function Scanner({ room }: { room: MockRoomData }) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const latest = useRef(room);
  useEffect(() => {
    latest.current = room;
  }, [room]);

  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<Record<string, Detected>>({});
  const [overlays, setOverlays] = useState<OverlayTag[]>([]);
  const [busy, setBusy] = useState(false);

  const autoSubmitRef = useRef(autoSubmit);
  useEffect(() => {
    autoSubmitRef.current = autoSubmit;
  }, [autoSubmit]);

  const busyRef = useRef(false);
  const inFlight = useRef(new Set<string>());
  const seen = useRef(new Map<string, { choice: CardChoice; count: number; at: number }>());

  const q = room.activeQuestionId ? room.liveQuestions[room.activeQuestionId] : undefined;
  const enabled = canScanQuestion(room, q);

  function stop() {
    generation.current++;
    stream.current?.getTracks().forEach(t => t.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setRunning(false);
    setStarting(false);
    setOverlays([]);
  }

  useEffect(() => {
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      generation.current++;
      stream.current?.getTracks().forEach(t => t.stop());
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);

  useEffect(() => {
    if (!enabled && (running || starting)) stop();
  }, [enabled, running, starting]);

  async function autoSendOne(
    roomId: string,
    questionId: string,
    studentId: string,
    studentName: string,
    choice: CardChoice
  ) {
    const key = `${questionId}_${studentId}`;
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    try {
      const result = await activeRealtimeService.submitQrAnswer(
        roomId,
        questionId,
        studentId,
        choice
      );
      if (result.success) {
        setNotice(`✓ Đã ghi nhận ${studentName}: ${choice}`);
        setPending(old => {
          if (!old[studentId]) return old;
          const next = { ...old };
          delete next[studentId];
          return next;
        });
      }
    } catch {
      // Fall back to pending queue if network hiccups so teacher can retry manually
      setPending(old => ({
        ...old,
        [studentId]: { studentId, name: studentName, choice },
      }));
    } finally {
      inFlight.current.delete(key);
    }
  }

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const tick = () => {
      if (cancelled) return;
      try {
        const v = video.current;
        const r = latest.current;
        const question = r.activeQuestionId ? r.liveQuestions[r.activeQuestionId] : undefined;
        const now = Date.now();

        if (v && v.readyState >= 2 && canScanQuestion(r, question) && !busyRef.current) {
          canvas.width = Math.min(v.videoWidth, 1280);
          canvas.height = Math.round((v.videoHeight * canvas.width) / v.videoWidth);
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

          // Overlapping tiles help jsQR separate several neighbouring symbols.
          const cols = canvas.width >= canvas.height ? 3 : 2;
          const rows = cols === 3 ? 2 : 3;
          const regions = [{ x: 0, y: 0, w: canvas.width, h: canvas.height }];
          const tw = Math.floor((canvas.width * 1.4) / cols);
          const th = Math.floor((canvas.height * 1.4) / rows);
          for (let row = 0; row < rows; row++)
            for (let col = 0; col < cols; col++)
              regions.push({
                x: Math.round(((canvas.width - tw) * col) / (cols - 1)),
                y: Math.round(((canvas.height - th) * row) / (rows - 1)),
                w: tw,
                h: th,
              });

          const frameOverlays = new Map<string, OverlayTag>();

          for (const region of regions) {
            const pixels = ctx.getImageData(region.x, region.y, region.w, region.h);
            const code = jsQR(pixels.data, pixels.width, pixels.height, {
              inversionAttempts: 'dontInvert',
            });
            if (!code) continue;

            const shift = (p: { x: number; y: number }) => ({
              x: p.x + region.x,
              y: p.y + region.y,
            });
            const tl = shift(code.location.topLeftCorner);
            const tr = shift(code.location.topRightCorner);
            const bl = shift(code.location.bottomLeftCorner);
            const br = shift(code.location.bottomRightCorner);

            const card = parseCard(code.data);
            const choice = cardChoice(tl, tr);
            const student = card && r.roster.find(p => p.studentId === card.studentId);

            if (card && card.classId === r.classId && student && choice) {
              const id = student.studentId;
              const prev = seen.current.get(id);
              const count = prev?.choice === choice && now - prev.at < 1800 ? prev.count + 1 : 1;
              seen.current.set(id, { choice, count, at: now });

              const existingSub = r.submissions[`${question!.id}_${id}`];
              const cx = (tl.x + tr.x + bl.x + br.x) / 4;
              const cy = (tl.y + tr.y + bl.y + br.y) / 4;
              frameOverlays.set(id, {
                studentId: id,
                name: student.name,
                choice: (existingSub?.answer as CardChoice) || choice,
                xPct: Math.max(8, Math.min(92, Math.round((cx / canvas.width) * 100))),
                yPct: Math.max(8, Math.min(92, Math.round((cy / canvas.height) * 100))),
                status: existingSub ? 'saved' : 'pending',
                at: now,
              });

              if (
                count >= 2 &&
                !existingSub &&
                choice.charCodeAt(0) - 65 < question!.options!.length
              ) {
                if (autoSubmitRef.current) {
                  void autoSendOne(r.id, question!.id, id, student.name, choice);
                } else {
                  setPending(p => ({
                    ...p,
                    [id]: { studentId: id, name: student.name, choice },
                  }));
                }
              }
            } else if (card && card.classId !== r.classId) {
              setNotice('Bỏ qua thẻ của lớp khác.');
            }

            // Mask this symbol so the same frame can reveal additional cards.
            const xs = [tl.x, tr.x, bl.x, br.x];
            const ys = [tl.y, tr.y, bl.y, br.y];
            ctx.fillStyle = 'white';
            ctx.fillRect(
              Math.min(...xs) - 3,
              Math.min(...ys) - 3,
              Math.max(...xs) - Math.min(...xs) + 6,
              Math.max(...ys) - Math.min(...ys) + 6
            );
          }

          setOverlays(prev => {
            const merged = new Map<string, OverlayTag>();
            for (const item of prev) {
              if (now - item.at < 1200) merged.set(item.studentId, item);
            }
            for (const [id, item] of frameOverlays) {
              merged.set(id, item);
            }
            return [...merged.values()];
          });
        }
      } catch {
        setError('Không đọc được khung hình. Hãy dừng rồi mở lại camera.');
      }
      timer = setTimeout(tick, 320);
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [running]);

  async function start() {
    if (starting || running) return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Camera cần trình duyệt hỗ trợ và kết nối HTTPS. Hãy mở bằng Safari hoặc Chrome trên điện thoại.'
      );
      return;
    }
    setStarting(true);
    const token = ++generation.current;
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      if (token !== generation.current) {
        media.getTracks().forEach(t => t.stop());
        return;
      }
      stream.current = media;
      if (video.current) {
        video.current.srcObject = media;
        await video.current.play();
      }
      if (token === generation.current) setRunning(true);
    } catch {
      if (token !== generation.current) return;
      stream.current?.getTracks().forEach(t => t.stop());
      stream.current = null;
      setError(
        'Chưa mở được camera. Hãy cấp quyền camera cho website, đóng ứng dụng đang dùng camera rồi thử lại.'
      );
    } finally {
      if (token === generation.current) setStarting(false);
    }
  }

  async function save() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    let sent = 0;
    try {
      for (const item of items) {
        const r = latest.current;
        if (!q || r.activeQuestionId !== q.id || !canScanQuestion(r, r.liveQuestions[q.id]))
          throw new Error('Câu hỏi đã đổi hoặc đóng. Các đáp án còn lại chưa được gửi.');
        const result = await activeRealtimeService.submitQrAnswer(
          r.id,
          q.id,
          item.studentId,
          item.choice
        );
        if (!result.success) throw new Error(result.error || 'Chưa gửi được đáp án.');
        sent++;
        setPending(p => {
          const next = { ...p };
          delete next[item.studentId];
          return next;
        });
      }
      setNotice(`Đã gửi ${sent} đáp án. Kết quả tự cập nhật trên máy tính.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mất kết nối. Hãy kiểm tra và thử gửi lại.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const items = Object.values(pending).filter(p => !room.submissions[`${q?.id}_${p.studentId}`]);
  const submissions = Object.values(room.submissions).filter(s => s.questionId === q?.id);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            className={button}
            disabled={running || starting || !enabled}
            onClick={() => void start()}
          >
            {starting ? 'Đang mở camera…' : 'Mở camera sau'}
          </button>
          <button className={button} disabled={!running && !starting} onClick={stop}>
            Dừng camera
          </button>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-600"
            checked={autoSubmit}
            onChange={e => setAutoSubmit(e.target.checked)}
          />
          <span>Tự động lưu ngay khi quét (như Plickers)</span>
        </label>
      </div>

      {/* Camera viewfinder with live Plickers-style AR Overlay */}
      <div className="relative overflow-hidden rounded-xl bg-slate-950">
        <video
          ref={video}
          playsInline
          muted
          className="max-h-[52vh] w-full object-contain"
          aria-label="Camera quét thẻ học sinh"
        />
        {running && overlays.length > 0 && (
          <div className="pointer-events-none absolute inset-0">
            {overlays.map(tag => {
              const isSaved =
                tag.status === 'saved' || Boolean(room.submissions[`${q?.id}_${tag.studentId}`]);
              return (
                <div
                  key={tag.studentId}
                  style={{ left: `${tag.xPct}%`, top: `${tag.yPct}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 px-3 py-1 text-xs font-black text-white shadow-lg transition-all ${
                    isSaved
                      ? 'border-emerald-300 bg-emerald-600/95'
                      : 'border-amber-300 bg-indigo-700/95'
                  }`}
                >
                  {tag.name} • {tag.choice} {isSaved ? '✓' : '…'}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-sm text-slate-600">
        Giữ điện thoại thẳng, không xoay ngang khi quét. Quét lần lượt từng nhóm học sinh; tên và đáp
        án của từng em sẽ hiện trực tiếp trên khung hình camera.
      </p>
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-900">
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900"
        >
          {notice}
        </p>
      )}

      {(!autoSubmit || items.length > 0) && (
        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
          <h3 className="font-black text-amber-950">Kiểm tra trước khi gửi ({items.length})</h3>
          <ul className="space-y-2">
            {items.map(p => (
              <li
                key={p.studentId}
                className="flex items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-2xs"
              >
                <strong>
                  {p.name}: {p.choice}
                </strong>
                <button
                  disabled={busy}
                  className="text-sm font-bold text-rose-700 underline"
                  onClick={() => {
                    seen.current.delete(p.studentId);
                    setPending(old => {
                      const next = { ...old };
                      delete next[p.studentId];
                      return next;
                    });
                  }}
                >
                  Bỏ kết quả này
                </button>
              </li>
            ))}
          </ul>
          <button
            className={button}
            disabled={busy || !enabled || !items.length}
            onClick={() => void save()}
          >
            {busy ? 'Đang gửi…' : 'Gửi các đáp án đã kiểm tra'}
          </button>
        </div>
      )}

      <details open className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <summary className="cursor-pointer font-bold">
          Đã nhận {submissions.length}/{room.roster.length} em
        </summary>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {room.roster.map((p, idx) => {
            const s = submissions.find(sub => sub.studentId === p.studentId);
            return (
              <li
                key={p.studentId}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm ${
                  s ? 'bg-emerald-100 font-bold text-emerald-900' : 'bg-white text-slate-500'
                }`}
              >
                <span className="truncate">
                  {idx + 1}. {p.name}
                </span>
                <span className="shrink-0 font-black">{s ? `Chọn ${s.answer} ✓` : 'Chưa nhận'}</span>
              </li>
            );
          })}
        </ul>
      </details>
    </div>
  );
}
