import { useState } from 'react';
import { Button } from '../common/Button';
import type { MockRoomData } from '../../services/realtime/types';
import type { Lesson } from '../../services/lessons/lessonLibrary';
import { downloadLesson } from '../../services/lessons/lessonLibrary';
import { useToast } from '../../context/ToastContext';
interface Props {
  room: MockRoomData; lessons: Lesson[]; spinning: boolean; spinningName: string;
  onExit: () => void; onProject: () => void;
  onStart: () => Promise<void>; onOpen: () => Promise<void>; onClose: () => Promise<void>;
  onResult: () => Promise<void>; onNext: () => Promise<void>;
  onCall: () => void; onScore: (points: number, reason: string) => Promise<void>;
}
export function PowerPointTeachingPanel({room,lessons,spinning,spinningName,onExit,onProject,onStart,onOpen,onClose,onResult,onNext,onCall,onScore}:Props) {
  const [busy,setBusy]=useState(false);const [pptId,setPptId]=useState('');const {showToast}=useToast();
  const ids=Object.keys(room.liveQuestions || {});const currentId=room.activeQuestionId || ids[0];const q=room.liveQuestions?.[currentId];
  const index=ids.indexOf(currentId);const students=Object.values(room.participants || {});
  const submissions=Object.values(room.submissions || {}).filter((s)=>s.questionId===currentId);
  const finished=room.status==='FINISHED';const waiting=room.status==='WAITING';
  const perform=async(action:()=>Promise<void>)=>{if(busy)return;setBusy(true);try{await action();}catch(err){showToast(err instanceof Error?err.message:'Không thực hiện được thao tác.','error');}finally{setBusy(false);}};
  return <div className="fixed inset-0 z-40 bg-slate-50 text-slate-900 flex flex-col h-[100dvh] overflow-hidden">
    <header className="bg-indigo-950 text-white p-3 shrink-0 flex items-center justify-between gap-2"><div><h1 className="font-bold">DẠY CÙNG POWERPOINT</h1><p className="text-xs text-indigo-200">{room.className} • Mã phòng <strong className="text-amber-300">{room.roomCode}</strong></p></div><Button size="sm" variant="secondary" disabled={busy} onClick={onExit}>Về phòng học</Button></header>
    <main className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
      <details className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-sm"><summary className="font-bold cursor-pointer">Cách dạy song song với PowerPoint</summary><p className="mt-2">Mở bài bằng PowerPoint trên máy. Đặt bảng điều khiển này bên cạnh PowerPoint hoặc trên màn hình giáo viên; màn hình lớp chiếu PowerPoint.</p><p className="mt-2">Chuyển slide và chạy hiệu ứng trong PowerPoint. Các nút bên dưới điều khiển phòng học và phát câu hỏi tới thiết bị học sinh.</p><p className="mt-2">Để cả lớp xem câu hỏi hoặc bài làm, bấm “Mở màn chiếu tương tác” rồi đưa cửa sổ đó lên màn hình lớp. Khi đóng màn chiếu, bảng điều khiển này vẫn giữ phòng hiện tại.</p></details>
      <div className="flex flex-wrap gap-2 text-sm"><span className="bg-white rounded-lg border px-3 py-2">{students.length} học sinh đã vào</span><span className="bg-white rounded-lg border px-3 py-2">{submissions.length} bài / {students.length} học sinh</span><span className="bg-white rounded-lg border px-3 py-2">{finished?'Đã kết thúc':waiting?'Phòng chờ':'Đang học'}</span></div>
      <section className="bg-white rounded-xl border p-3 space-y-2"><div className="flex justify-between gap-2 text-sm"><strong>Câu {Math.max(0,index+1)} / {ids.length}</strong><span>{q?.status==='OPEN'?'Đang nhận bài':q?.status==='CLOSED'?'Đã đóng trả lời':q?.status==='RESULT'?'Đã công bố':'Chưa phát'}</span></div><p className="font-semibold whitespace-pre-wrap text-base">{q?.content || 'Phòng này chưa có câu hỏi.'}</p>
        {q?.status==='RESULT' && <p className="text-sm text-emerald-800">Đáp án: {q.correctAnswer}</p>}
      </section>
      <section className="grid grid-cols-2 gap-2" aria-label="Điều khiển câu hỏi">
        {waiting && <Button size="sm" variant="success" disabled={busy || finished} onClick={()=>perform(onStart)}>Bắt đầu buổi học</Button>}
        <Button size="sm" variant="success" disabled={busy || finished || waiting || !q || !['READY','CLOSED'].includes(q.status)} onClick={()=>perform(onOpen)}>Phát câu hỏi</Button>
        <Button size="sm" variant="danger" disabled={busy || finished || q?.status!=='OPEN'} onClick={()=>perform(onClose)}>Đóng trả lời</Button>
        <Button size="sm" variant="primary" disabled={busy || finished || q?.status!=='CLOSED'} onClick={()=>perform(onResult)}>Công bố đáp án</Button>
        <Button size="sm" variant="primary" disabled={busy || finished || q?.status!=='RESULT' || index>=ids.length-1} onClick={()=>perform(onNext)}>Câu tiếp theo →</Button>
      </section>
      <section className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-2"><p className="font-bold text-amber-950">{spinning?`Đang chọn: ${spinningName}`:room.calledStudent?`Mời: ${room.calledStudent.studentName}`:'Gọi học sinh phát biểu'}</p><Button fullWidth size="sm" variant="warning" disabled={busy || spinning || finished || !students.length} onClick={onCall}>{spinning?'Đang chọn…':'Gọi học sinh ngẫu nhiên'}</Button>
        {room.calledStudent && <div className="grid grid-cols-2 gap-2"><Button size="sm" variant="success" disabled={busy || spinning || finished} onClick={()=>perform(()=>onScore(10,'Trả lời đúng khi dạy cùng PowerPoint'))}>+10 Trả lời đúng</Button><Button size="sm" variant="primary" disabled={busy || spinning || finished} onClick={()=>perform(()=>onScore(5,'Có cố gắng khi dạy cùng PowerPoint'))}>+5 Có cố gắng</Button></div>}
      </section>
      <details className="bg-white rounded-xl border p-3"><summary className="font-semibold cursor-pointer">Bài học sinh ({submissions.length})</summary>{!submissions.length?<p className="text-sm text-slate-500 mt-2">Chưa có bài cho câu này.</p>:submissions.map((s)=><div key={s.id || s.studentId} className="border-t mt-2 pt-2 text-sm"><strong>{s.studentName}</strong><p className="whitespace-pre-wrap">{s.answer}</p></div>)}</details>
      <details className="bg-white rounded-xl border p-3"><summary className="font-semibold cursor-pointer">Tải PPT gốc từ kho trên máy</summary><select aria-label="Chọn PPT gốc" className="border rounded-lg p-2 w-full text-sm my-2" value={pptId} onChange={(e)=>setPptId(e.target.value)}><option value="">Chọn bài PPT đã lưu</option>{lessons.filter((l)=>l.pptName).map((l)=><option key={l.id} value={l.id}>{l.title}</option>)}</select><Button size="sm" variant="outline" disabled={busy || !pptId} onClick={()=>perform(async()=>{const lesson=lessons.find((l)=>l.id===pptId);if(lesson)await downloadLesson(lesson,'ppt');})}>Tải PPT để mở bằng PowerPoint</Button><p className="text-xs text-slate-500 mt-2">Trình duyệt tải tệp về; thầy mở tệp bằng PowerPoint.</p></details>
    </main>
    <footer className="p-3 border-t bg-white shrink-0"><Button fullWidth size="sm" variant="primary" disabled={busy} onClick={onProject}>Mở màn chiếu tương tác / Bài học sinh</Button></footer>
  </div>;
}
