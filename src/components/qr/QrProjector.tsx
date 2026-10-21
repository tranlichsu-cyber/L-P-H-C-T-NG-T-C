import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LiveQuestionPublic, MockRoomData } from '../../services/realtime/types';
import { QrQuestionContent } from './QrQuestionContent';
import './qrProjector.css';

export function QrProjector({ room, question, index, total }: { room: MockRoomData; question?: LiveQuestionPublic; index: number; total: number }) {
  const root = useRef<HTMLElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
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
      else setNotice('Trình duyệt này chưa hỗ trợ nút toàn màn hình. Thầy/cô có thể dùng chế độ toàn màn hình của trình duyệt.');
    } catch {
      setNotice('Chưa bật được toàn màn hình. Hãy thử lại hoặc dùng chế độ toàn màn hình của trình duyệt.');
    }
  }
  const count = Object.values(room.submissions).filter(s => s.questionId === question?.id).length;
  const status = room.status === 'FINISHED' ? 'Tiết học đã kết thúc' : question?.status === 'OPEN' ? 'Giơ đáp án của em' : question?.status === 'RESULT' ? 'Cùng xem kết quả' : question?.status === 'CLOSED' ? 'Đã đóng nhận đáp án' : 'Chuẩn bị trả lời';
  return <section ref={root} aria-label="Màn chiếu câu hỏi" className="qr-projector">
    <div className="qr-projector-inner">
      <header className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-indigo-200">
        <p className="min-w-0 break-words">{room.className} • Câu {index + 1}/{total} • {status}</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link to={`/teacher/qr-cards/${encodeURIComponent(room.id)}`} className="underline">Về điều khiển tiết học</Link>
          <button type="button" onClick={() => void toggleFullscreen()} className="rounded-lg border border-indigo-400 px-3 py-2 text-white hover:bg-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}</button>
        </div>
      </header>
      {notice && <p role="status" className="rounded-lg bg-slate-800 p-2 text-sm">{notice}</p>}
      <div className="qr-projector-content"><QrQuestionContent question={question} projector /></div>
      <footer className="flex flex-wrap justify-between gap-2 text-sm font-semibold text-indigo-200"><p>Đã nhận: {count}/{room.roster.length} em</p><p>Đưa chữ em chọn lên trên • Esc để thoát toàn màn hình</p></footer>
    </div>
  </section>;
}
