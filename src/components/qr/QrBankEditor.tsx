import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Check, Copy, Eye, FileText, ImagePlus, Pencil, Plus, Save, Trash2, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { QrBankService } from '../../services/qrBank/QrBankService';
import { newQrQuestion, validateQrBank, type QrBank, type QrQuestion } from '../../services/qrBank/content';
import { prepareQrImage } from '../../services/qrBank/imageUpload';
import { QrQuestionContent } from './QrQuestionContent';

const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-40';
const secondary = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-40';
const input = 'mt-2 block w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-950 focus:border-indigo-500 focus:outline-indigo-500';

export function QrBankEditor() {
  const { bankId } = useParams();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid || '';
  const navigate = useNavigate();
  const [bank, setBank] = useState<QrBank>(() => {
    const now = new Date().toISOString();
    return { id: crypto.randomUUID(), teacherId: uid, title: '', subject: 'Toán', grade: 'Khối 4', questions: [newQrQuestion()], createdAt: now, updatedAt: now };
  });
  const [activeId, setActiveId] = useState('');
  const [loading, setLoading] = useState(bankId !== 'new');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(bankId === 'new');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const imageJob = useRef(0);
  const contentInput = useRef<HTMLTextAreaElement>(null);
  const question = bank.questions.find(q => q.id === activeId) || bank.questions[0];
  const index = bank.questions.indexOf(question);

  useEffect(() => {
    if (!bankId || bankId === 'new') return;
    let cancelled = false;
    QrBankService.get(uid, bankId).then(value => {
      if (cancelled) return;
      if (!value) throw new Error('Không tìm thấy bộ câu hỏi.');
      setBank(value);
      setDirty(false);
    }).catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Chưa tải được bộ câu hỏi.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [bankId, uid]);
  useEffect(() => () => { imageJob.current++; }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function change(fn: (value: QrBank) => QrBank) { setBank(fn); setDirty(true); setNotice(''); setError(''); }
  function edit(fn: (value: QrQuestion) => QrQuestion) {
    change(value => ({ ...value, questions: value.questions.map(q => q.id === question.id ? fn(q) : q) }));
  }
  function select(id: string) { setActiveId(id); setConfirmDelete(''); setMediaOpen(false); }
  function add(copy = false) {
    if (bank.questions.length >= 80) return;
    const next = copy ? { ...structuredClone(question), id: crypto.randomUUID() } : newQrQuestion();
    change(value => {
      const questions = [...value.questions];
      questions.splice(index + 1, 0, next);
      return { ...value, questions };
    });
    select(next.id);
    setPreview(false);
    requestAnimationFrame(() => contentInput.current?.focus());
  }
  function move(by: number) {
    const target = index + by;
    if (target < 0 || target >= bank.questions.length) return;
    setActiveId(question.id);
    change(value => {
      const questions = [...value.questions];
      [questions[index], questions[target]] = [questions[target], questions[index]];
      return { ...value, questions };
    });
  }
  function remove() {
    if (bank.questions.length <= 1) return;
    const next = bank.questions[index + 1] || bank.questions[index - 1];
    change(value => ({ ...value, questions: value.questions.filter(q => q.id !== question.id) }));
    select(next.id);
  }
  async function image(file: File) {
    const id = question.id, token = ++imageJob.current;
    setBusy(true); setError('');
    try {
      const data = await prepareQrImage(file);
      if (token === imageJob.current) change(value => ({ ...value, questions: value.questions.map(q => q.id === id ? { ...q, media: { ...q.media, imageUrl: data } } : q) }));
    } catch (e) { setError(e instanceof Error ? e.message : 'Chưa xử lý được ảnh.'); }
    finally { if (token === imageJob.current) setBusy(false); }
  }
  async function save() {
    setBusy(true); setError('');
    try {
      // Bring the first incomplete question into view instead of leaving the error off-screen.
      for (const q of bank.questions) {
        try { validateQrBank({ ...bank, title: bank.title.trim() || 'Bộ câu hỏi', questions: [q] }); }
        catch { select(q.id); setPreview(false); break; }
      }
      const saved = await QrBankService.save(uid, bank);
      setBank(saved); setDirty(false); setNotice('Đã lưu bộ câu hỏi vào kho thẻ QR.');
      if (bankId === 'new') navigate(`/teacher/qr-cards/bank/${saved.id}`, { replace: true });
    } catch (e) { setError(e instanceof Error ? e.message : 'Chưa lưu được. Nội dung đang soạn vẫn được giữ trên trang.'); }
    finally { setBusy(false); }
  }
  function leave(event: React.MouseEvent<HTMLAnchorElement>) {
    if (busy) { event.preventDefault(); return; }
    if (dirty && !window.confirm('Bộ câu hỏi có thay đổi chưa lưu. Thầy/cô muốn rời trang?')) event.preventDefault();
  }

  if (loading) return <p>Đang tải bộ câu hỏi…</p>;
  if (bankId !== 'new' && bank.id !== bankId) return <section><p role="alert">{error || 'Không tìm thấy bộ câu hỏi.'}</p><Link to="/teacher/qr-cards/bank">Về kho câu hỏi QR</Link></section>;
  if (!question) return <section className="space-y-3 rounded-2xl bg-white p-6"><p>Bộ này chưa có câu hỏi.</p><button className={button} onClick={() => change(value => ({ ...value, questions: [newQrQuestion()] }))}>Thêm câu hỏi đầu tiên</button></section>;

  return <section className="space-y-5 text-slate-900">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><Link to="/teacher/qr-cards/bank" onClick={leave} className="text-sm font-bold text-indigo-700">← Kho câu hỏi thẻ QR</Link><h1 className="mt-2 text-2xl font-black">Soạn bộ câu hỏi thẻ QR</h1><p className="mt-1 text-sm text-slate-500">{bank.questions.length} câu • {dirty ? 'Có thay đổi chưa lưu.' : 'Đã lưu.'}</p></div>
      <button className={button} disabled={busy} onClick={() => void save()}><Save className="h-4 w-4" />{busy ? 'Đang xử lý…' : 'Lưu bộ câu hỏi QR'}</button>
    </header>
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-emerald-900">{notice}</p>}
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-900">{error}</p>}
    <fieldset disabled={busy} className="grid min-w-0 gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_140px]">
      <label className="min-w-0 text-sm font-bold sm:col-span-2 lg:col-span-1">Tên bộ câu hỏi<input className={input} value={bank.title} placeholder="Ví dụ: Khoa học 4 – Ánh sáng" maxLength={200} onChange={e => change(value => ({ ...value, title: e.target.value }))} /></label>
      <label className="min-w-0 text-sm font-bold">Môn học<input className={input} value={bank.subject} maxLength={100} onChange={e => change(value => ({ ...value, subject: e.target.value }))} /></label>
      <label className="min-w-0 text-sm font-bold">Khối lớp<input className={input} value={bank.grade} maxLength={30} onChange={e => change(value => ({ ...value, grade: e.target.value }))} /></label>
    </fieldset>

    <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 lg:sticky lg:top-32">
        <div className="mb-3 flex items-center justify-between px-1"><h2 className="text-sm font-black">Danh sách câu hỏi</h2><span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">{bank.questions.length}/80</span></div>
        <nav aria-label="Danh sách câu hỏi" className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[55vh] lg:flex-col lg:overflow-y-auto">
          {bank.questions.map((q, i) => <button key={q.id} type="button" disabled={busy} aria-current={q.id === question.id ? 'step' : undefined} onClick={() => select(q.id)} className={`w-44 shrink-0 rounded-xl border-2 p-3 text-left transition-colors lg:w-full ${q.id === question.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}>
            <span className="flex items-center justify-between gap-2 text-xs font-extrabold"><span>Câu {i + 1}</span><span className="rounded bg-white px-2 py-0.5 text-emerald-700">{q.correctAnswer}</span></span>
            <span className="mt-2 block line-clamp-2 break-words text-sm font-semibold text-slate-700">{q.content || 'Chưa nhập câu hỏi'}</span>
            <span className="mt-2 flex gap-2 text-xs text-slate-500">{q.options.length} lựa chọn{q.media?.imageUrl && <ImagePlus className="h-3.5 w-3.5" aria-label="Có ảnh" />}{q.media?.videoUrl && <Video className="h-3.5 w-3.5" aria-label="Có video" />}</span>
          </button>)}
        </nav>
        <button type="button" className={`${button} mt-3 w-full`} disabled={busy || bank.questions.length >= 80} onClick={() => add()}><Plus className="h-4 w-4" />Thêm câu hỏi</button>
      </aside>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap gap-2"><button type="button" className={`${secondary} aria-pressed:border-indigo-300 aria-pressed:bg-indigo-50 aria-pressed:text-indigo-700`} aria-pressed={!preview} onClick={() => setPreview(false)}><Pencil className="h-4 w-4" />Soạn câu</button><button type="button" className={`${secondary} aria-pressed:border-indigo-300 aria-pressed:bg-indigo-50 aria-pressed:text-indigo-700`} aria-pressed={preview} onClick={() => setPreview(value => !value)}><Eye className="h-4 w-4" />{preview ? 'Đóng xem trước' : 'Xem trước câu hỏi'}</button></div>
          <div className="flex flex-wrap gap-2"><button type="button" className={secondary} aria-label="Di chuyển câu lên" disabled={busy || index === 0} onClick={() => move(-1)}><ArrowUp className="h-4 w-4" /></button><button type="button" className={secondary} aria-label="Di chuyển câu xuống" disabled={busy || index === bank.questions.length - 1} onClick={() => move(1)}><ArrowDown className="h-4 w-4" /></button><button type="button" className={secondary} disabled={busy || bank.questions.length >= 80} onClick={() => add(true)}><Copy className="h-4 w-4" />Nhân đôi</button><button type="button" className={secondary} disabled={busy || bank.questions.length <= 1} onClick={() => setConfirmDelete(question.id)} aria-label="Xóa câu hỏi"><Trash2 className="h-4 w-4 text-rose-700" /></button></div>
        </div>
        {confirmDelete === question.id && <div className="space-y-3 rounded-xl bg-amber-50 p-4"><p>Xóa câu {index + 1} khỏi bộ đang soạn?</p><button type="button" className={button} disabled={busy} onClick={remove}>Xác nhận xóa câu</button> <button type="button" className={secondary} onClick={() => setConfirmDelete('')}>Giữ lại</button></div>}
        {preview ? <section aria-label="Xem trước màn chiếu" className="space-y-5 rounded-2xl bg-slate-950 p-5 text-white sm:p-8"><p className="text-sm font-bold text-indigo-200">Câu {index + 1}/{bank.questions.length} • Học sinh sẽ nhìn thấy</p><QrQuestionContent question={{ ...question, status: 'READY' }} /><p className="text-sm text-indigo-200">Đáp án đúng không được đánh dấu khi đang nhận câu trả lời.</p></section> : <fieldset disabled={busy} className="min-w-0 space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-black text-indigo-700">Câu {index + 1}</h2><label className="flex items-center gap-2 text-xs font-bold text-slate-600">Số lựa chọn<select aria-label="Số lựa chọn" className="rounded-lg border border-slate-200 p-2 text-sm" value={question.options.length} onChange={e => { const count = Number(e.target.value); edit(q => ({ ...q, options: Array.from({ length: count }, (_, i) => q.options[i] || ''), correctAnswer: q.correctAnswer.charCodeAt(0) - 65 < count ? q.correctAnswer : 'A' })); }}>{[2, 3, 4].map(count => <option key={count}>{count}</option>)}</select></label></div>
          <label className="block text-sm font-bold text-slate-600">Nội dung câu {index + 1}<textarea aria-label={`Nội dung câu ${index + 1}`} ref={contentInput} className="mt-3 block min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-xl font-bold leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-indigo-500 sm:text-2xl" rows={3} value={question.content} maxLength={5000} placeholder="Nhập câu hỏi của thầy/cô tại đây…" onChange={e => edit(q => ({ ...q, content: e.target.value }))} /></label>
          <p className="text-sm text-slate-500">Bấm vào chữ A, B, C hoặc D để chọn đáp án đúng.</p>
          <div role="radiogroup" aria-label="Chọn đáp án đúng" className="grid gap-3 sm:grid-cols-2">{question.options.map((option, i) => {
            const letter = String.fromCharCode(65 + i), correct = question.correctAnswer === letter;
            return <div key={letter} className={`flex min-w-0 items-start gap-3 rounded-2xl border-2 p-3 ${correct ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
              <button type="button" role="radio" aria-checked={correct} tabIndex={correct ? 0 : -1} onKeyDown={event => {
                let next = i;
                if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (i + 1) % question.options.length;
                else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (i + question.options.length - 1) % question.options.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = question.options.length - 1;
                else return;
                event.preventDefault();
                edit(q => ({ ...q, correctAnswer: String.fromCharCode(65 + next) }));
                event.currentTarget.closest('[role="radiogroup"]')?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
              }} aria-label={`Chọn ${letter} làm đáp án đúng`} onClick={() => edit(q => ({ ...q, correctAnswer: letter }))} className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${correct ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{letter}</button>
              <label className="min-w-0 flex-1"><span className="flex items-center gap-1 text-xs font-bold text-slate-500">Đáp án {letter}{correct && <Check className="h-3.5 w-3.5 text-emerald-700" aria-label="Đáp án đúng" />}</span><textarea aria-label={`Đáp án ${letter}`} className="mt-1 block min-h-20 w-full resize-y border-0 bg-transparent p-1 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-indigo-500" rows={2} maxLength={2000} value={option} placeholder={`Nhập lựa chọn ${letter}`} onChange={e => edit(q => ({ ...q, options: q.options.map((value, n) => n === i ? e.target.value : value) }))} /></label>
            </div>;
          })}</div>
          <button type="button" className={secondary} aria-expanded={mediaOpen} aria-controls="qr-editor-media" onClick={() => setMediaOpen(value => !value)}><ImagePlus className="h-4 w-4" /><Video className="h-4 w-4" />Ảnh / Video{question.media?.imageUrl || question.media?.videoUrl ? ' • Đã chèn' : ''}</button>
          <div id="qr-editor-media" hidden={!mediaOpen} className="space-y-3 rounded-xl border border-sky-100 bg-sky-50 p-4">
            <h3 className="font-black">Ảnh và video cho câu {index + 1}</h3><label className="block text-sm font-bold">Chọn ảnh từ máy<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block max-w-full text-sm" onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void image(file); }} /></label>
            {question.media?.imageUrl?.startsWith('data:') ? <div className="flex flex-wrap gap-3 text-sm"><span>Đã chèn ảnh từ máy.</span><button type="button" className="font-bold text-rose-700 underline" onClick={() => edit(q => ({ ...q, media: { ...q.media, imageUrl: '' } }))}>Gỡ ảnh</button></div> : <label className="block text-sm font-bold">Hoặc liên kết ảnh HTTPS<input className={input} type="url" value={question.media?.imageUrl || ''} placeholder="https://…/hinh-anh.jpg" onChange={e => edit(q => ({ ...q, media: { ...q.media, imageUrl: e.target.value } }))} /></label>}
            <label className="block text-sm font-bold">Mô tả ảnh<input className={input} maxLength={300} value={question.media?.imageAlt || ''} onChange={e => edit(q => ({ ...q, media: { ...q.media, imageAlt: e.target.value } }))} /></label>
            <label className="block text-sm font-bold">Liên kết video YouTube / MP4 / WebM<input className={input} type="url" value={question.media?.videoUrl || ''} placeholder="https://www.youtube.com/watch?v=…" onChange={e => edit(q => ({ ...q, media: { ...q.media, videoUrl: e.target.value } }))} /></label><p className="text-xs leading-relaxed text-slate-500">Ảnh JPG/PNG/WebP được thu gọn khi tải lên. Video phát khi giáo viên bấm; cần liên kết cho phép xem công khai.</p>
          </div>
          <details className="rounded-xl border border-slate-200 p-4"><summary className="flex cursor-pointer items-center gap-2 text-sm font-bold"><FileText className="h-4 w-4" />Điểm số và giải thích</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Điểm đúng<input type="number" min={0} max={100} className={input} value={question.correctPoints ?? 10} onChange={e => edit(q => ({ ...q, correctPoints: Number(e.target.value) }))} /></label><label className="text-sm font-bold">Điểm trừ khi sai<input type="number" min={0} max={100} className={input} value={question.wrongPenalty ?? 0} onChange={e => edit(q => ({ ...q, wrongPenalty: Number(e.target.value) }))} /></label><label className="text-sm font-bold sm:col-span-2">Giải thích khi công bố đáp án<textarea rows={2} maxLength={5000} className={input} value={question.explanation || ''} onChange={e => edit(q => ({ ...q, explanation: e.target.value }))} /></label></div></details>
        </fieldset>}
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">Chọn câu ở danh sách để chuyển câu. Nội dung chỉ được lưu khi bấm Lưu bộ câu hỏi.</p><Link className="text-sm font-bold text-indigo-700 underline" onClick={leave} to="/teacher/qr-cards">Về chọn lớp và dạy bằng thẻ →</Link></div>
      </div>
    </div>
  </section>;
}
