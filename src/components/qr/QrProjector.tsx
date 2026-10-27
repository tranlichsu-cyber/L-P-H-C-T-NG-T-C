import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LiveQuestionPublic, MockRoomData } from '../../services/realtime/types';
import { choiceIndex } from '../../services/realtime/choiceStatistics';
import { QrQuestionContent } from './QrQuestionContent';
import './qrProjector.css';

export function QrProjector({
  room,
  question,
  index,
  total,
}: {
  room: MockRoomData;
  question?: LiveQuestionPublic;
  index: number;
  total: number;
}) {
  const root = useRef<HTMLElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const [showGraph, setShowGraph] = useState(false);
  const [showRoster, setShowRoster] = useState(true);

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  async function toggleFullscreen() {
    setNotice('');
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (root.current?.requestFullscreen) await root.current.requestFullscreen();
      else
        setNotice(
          'Trình duyệt này chưa hỗ trợ nút toàn màn hình. Thầy/cô có thể dùng chế độ toàn màn hình của trình duyệt.'
        );
    } catch {
      setNotice(
        'Chưa bật được toàn màn hình. Hãy thử lại hoặc dùng chế độ toàn màn hình của trình duyệt.'
      );
    }
  }

  const submissions = Object.values(room.submissions).filter(s => s.questionId === question?.id);
  const count = submissions.length;
  const isResult = question?.status === 'RESULT';
  const correctIdx = isResult
    ? choiceIndex(question.options || [], question.correctAnswer, question.type)
    : -1;
  const status =
    room.status === 'FINISHED'
      ? 'Tiết học đã kết thúc'
      : question?.status === 'OPEN'
        ? 'Giơ đáp án của em'
        : isResult
          ? 'Cùng xem kết quả'
          : question?.status === 'CLOSED'
            ? 'Đã đóng nhận đáp án'
            : 'Chuẩn bị trả lời';

  return (
    <section ref={root} aria-label="Màn chiếu câu hỏi" className="qr-projector">
      <div className="qr-projector-inner">
        <header className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-indigo-200">
          <p className="min-w-0 break-words">
            {room.className} • Câu {index + 1}/{total} • {status}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowGraph(v => !v)}
              aria-pressed={showGraph || isResult}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                showGraph || isResult
                  ? 'border-amber-300 bg-amber-400/20 text-amber-200'
                  : 'border-indigo-400 text-white hover:bg-indigo-900'
              }`}
            >
              {showGraph || isResult ? 'Đang hiện biểu đồ' : 'Hiện biểu đồ'}
            </button>
            <button
              type="button"
              onClick={() => setShowRoster(v => !v)}
              aria-pressed={showRoster}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                showRoster
                  ? 'border-sky-300 bg-sky-400/20 text-sky-200'
                  : 'border-indigo-400 text-white hover:bg-indigo-900'
              }`}
            >
              {showRoster ? 'Ẩn danh sách lớp' : 'Hiện danh sách lớp'}
            </button>
            <Link to={`/teacher/qr-cards/${encodeURIComponent(room.id)}`} className="underline">
              Về điều khiển tiết học
            </Link>
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="rounded-lg border border-indigo-400 px-3 py-2 text-white hover:bg-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            </button>
          </div>
        </header>
        {notice && (
          <p role="status" className="rounded-lg bg-slate-800 p-2 text-sm">
            {notice}
          </p>
        )}
        <div
          className={`grid flex-1 min-h-0 gap-4 ${
            showRoster ? 'lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]' : ''
          }`}
        >
          <div className="qr-projector-content min-w-0">
            <QrQuestionContent
              question={question}
              projector
              submissions={submissions}
              showGraph={showGraph}
            />
          </div>
          {showRoster && (
            <aside
              aria-label="Trạng thái trả lời của lớp"
              className="flex max-h-[38vh] flex-col rounded-2xl border border-indigo-500/40 bg-slate-900/90 p-3 lg:max-h-full"
            >
              <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  Danh sách lớp
                </h2>
                <span className="rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-xs font-black text-amber-300">
                  {count}/{room.roster.length}
                </span>
              </div>
              <ul className="grid flex-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1">
                {room.roster.map((p, idx) => {
                  const sub = submissions.find(s => s.studentId === p.studentId);
                  const ansIdx = sub
                    ? choiceIndex(
                        question?.options || [],
                        sub.answer,
                        question?.type || 'MULTIPLE_CHOICE'
                      )
                    : -1;
                  const isCorrect = isResult && sub && ansIdx === correctIdx;
                  return (
                    <li
                      key={p.studentId}
                      className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                        !sub
                          ? 'bg-slate-800/60 text-slate-400'
                          : !isResult
                            ? 'bg-sky-600 text-white shadow-xs'
                            : isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600/90 text-white'
                      }`}
                    >
                      <span className="min-w-0 truncate">
                        {idx + 1}. {p.name}
                      </span>
                      <span className="shrink-0 rounded bg-black/25 px-1.5 py-0.5 text-[11px] font-black">
                        {!sub ? '—' : isResult ? sub.answer : '✓'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </aside>
          )}
        </div>
        <footer className="flex flex-wrap justify-between gap-2 text-sm font-semibold text-indigo-200">
          <p>
            Đã nhận: {count}/{room.roster.length} em
          </p>
          <p>Đưa chữ em chọn lên trên • Esc để thoát toàn màn hình</p>
        </footer>
      </div>
    </section>
  );
}
