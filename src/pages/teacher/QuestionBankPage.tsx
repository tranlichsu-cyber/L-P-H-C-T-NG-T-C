import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { QuestionBankBrowser } from '../../components/teacher/QuestionBankBrowser';
import { useQuestionBank, type BankQuestion } from '../../services/questionBank/useQuestionBank';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { QuestionDifficulty } from '../../types';

export function QuestionBankPage() {
  const bank = useQuestionBank();
  const { quizzes, addQuestions } = useTeacherData();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<BankQuestion | null>(null);
  const [deleting, setDeleting] = useState<BankQuestion | null>(null);
  const [optionsText, setOptionsText] = useState('');
  const ownQuizzes = quizzes.filter((q) => q.teacherId === currentUser?.uid);
  const run = async (action: () => Promise<void>, message: string) => {
    setBusy(true);
    try { await action(); showToast(message, 'success'); }
    catch (err) { showToast(err instanceof Error ? err.message : 'Không thể lưu. Vui lòng thử lại.', 'error'); }
    finally { setBusy(false); }
  };
  const openEdit = (item: BankQuestion) => {
    setEditing(structuredClone(item));
    setOptionsText((item.question.options || []).join('\n'));
  };
  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.question.content.trim() || !editing.question.correctAnswer.trim() || !editing.grade.trim() || !editing.subject.trim()) {
      showToast('Cần nhập khối, môn, nội dung và đáp án.', 'error'); return;
    }
    const question = { ...editing.question, content: editing.question.content.trim(), correctAnswer: editing.question.correctAnswer.trim() };
    if (question.type === 'MULTIPLE_CHOICE') {
      const options = optionsText.split('\n').map((x) => x.trim()).filter(Boolean);
      if (options.length !== 4 || new Set(options).size !== 4 || !options.includes(question.correctAnswer)) {
        showToast('Nhập 4 lựa chọn khác nhau; đáp án đúng phải trùng một lựa chọn.', 'error'); return;
      }
      question.options = options;
    }
    if (question.type === 'ORDERING') {
      const steps = question.correctAnswer.split(' → ').map((x) => x.trim()).filter(Boolean);
      if (steps.length < 2 || steps.length > 8 || new Set(steps).size !== steps.length) {
        showToast('Nhập 2–8 mục khác nhau, ngăn cách bằng dấu → có khoảng trắng hai bên.', 'error'); return;
      }
      question.correctAnswer = steps.join(' → ');
      question.options = [...steps].sort((a, b) => a.localeCompare(b, 'vi'));
    }
    if (question.type === 'TRUE_FALSE' && !['Đúng', 'Sai'].includes(question.correctAnswer)) {
      showToast('Đáp án phải là Đúng hoặc Sai.', 'error'); return;
    }
    await run(async () => {
      await bank.save({ ...editing, question, grade: editing.grade.trim(), subject: editing.subject.trim(), topic: editing.topic.trim() }, editing);
      setEditing(null);
    }, 'Đã cập nhật câu hỏi trong kho.');
  };
  const field = 'w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-900';
  return <div>
    <PageHeader title="KHO CÂU HỎI DÙNG LẠI" description="Kho riêng của giáo viên, lưu trên Firebase. Câu hỏi thêm vào bộ đề là một bản sao độc lập." />
    <p className="text-sm text-slate-600 mb-4">Để đưa câu hỏi vào kho: mở <Link className="font-bold text-indigo-700 underline" to="/teacher/quizzes">Ngân hàng câu hỏi</Link>, chọn bộ đề và bấm “Lưu vào kho” ở câu muốn giữ.</p>
    <div className="flex flex-wrap gap-3 items-center p-4 mb-4 rounded-xl bg-indigo-50">
      <select aria-label="Bộ đề nhận câu hỏi" className="border rounded-xl p-3 bg-white text-slate-900 max-w-full" value={target} onChange={(e) => setTarget(e.target.value)}><option value="">Chọn bộ đề để thêm câu hỏi</option>{ownQuizzes.map((q) => <option key={q.id} value={q.id}>{q.title} ({q.grade} • {q.subject})</option>)}</select>
      <Button variant="primary" disabled={!target || !selected.length || busy || !!bank.error} onClick={() => run(async () => {
        const items = bank.items.filter((i) => selected.includes(i.id));
        await addQuestions(target, items.map((i) => i.question)); setSelected([]);
      }, 'Đã sao chép câu hỏi vào bộ đề.')}>{busy ? 'Đang lưu…' : `Thêm ${selected.length} câu vào bộ đề`}</Button>
      <Button variant="secondary" disabled={busy || !selected.length} onClick={() => setSelected([])}>Bỏ chọn</Button>
    </div>
    {bank.loading ? <p>Đang tải kho…</p> : bank.error ? <p role="alert" className="text-rose-700">{bank.error}</p> : <QuestionBankBrowser items={bank.items} selected={selected} onSelect={(id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])} onEdit={openEdit} onDelete={setDeleting} />}
    <Modal isOpen={!!editing} onClose={() => { if (!busy) setEditing(null); }} title="Sửa câu hỏi trong kho" footer={<><Button variant="secondary" disabled={busy} onClick={() => setEditing(null)}>Hủy</Button><Button variant="primary" disabled={busy} onClick={saveEdit}>Lưu thay đổi</Button></>}>
      {editing && <div className="space-y-3">
        <p className="text-sm text-slate-600">Thay đổi chỉ áp dụng cho câu trong kho. Những bản đã thêm vào bộ đề giữ nguyên.</p>
        <label className="block">Khối<input className={field} value={editing.grade} onChange={(e) => setEditing({ ...editing, grade: e.target.value })} /></label>
        <label className="block">Môn<input className={field} value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} /></label>
        <label className="block">Chủ đề / Bài học<input className={field} value={editing.topic} onChange={(e) => setEditing({ ...editing, topic: e.target.value })} /></label>
        <label className="block">Mức độ<select className={field} value={editing.question.difficulty || ''} onChange={(e) => { const q = { ...editing.question }; if (e.target.value) q.difficulty = e.target.value as QuestionDifficulty; else delete q.difficulty; setEditing({ ...editing, question: q }); }}><option value="">Chưa phân loại</option><option value="KNOWLEDGE">Nhận biết</option><option value="UNDERSTANDING">Thông hiểu</option><option value="APPLICATION">Vận dụng</option></select></label>
        <label className="block">Nội dung<textarea rows={3} className={field} value={editing.question.content} onChange={(e) => setEditing({ ...editing, question: { ...editing.question, content: e.target.value } })} /></label>
        {editing.question.type === 'MULTIPLE_CHOICE' && <label className="block">4 lựa chọn, mỗi dòng một lựa chọn<textarea rows={4} className={field} value={optionsText} onChange={(e) => setOptionsText(e.target.value)} /></label>}
        <label className="block">{editing.question.type === 'ORDERING' ? 'Thứ tự đúng, ví dụ: Mục 1 → Mục 2 → Mục 3' : 'Đáp án đúng (nhập đầy đủ nội dung)'}<textarea rows={2} className={field} value={editing.question.correctAnswer} onChange={(e) => setEditing({ ...editing, question: { ...editing.question, correctAnswer: e.target.value } })} /></label>
        <label className="block">Giải thích<textarea className={field} value={editing.question.explanation || ''} onChange={(e) => setEditing({ ...editing, question: { ...editing.question, explanation: e.target.value } })} /></label>
      </div>}
    </Modal>
    <Modal isOpen={!!deleting} onClose={() => { if (!busy) setDeleting(null); }} title="Xoá câu hỏi khỏi kho" footer={<><Button variant="secondary" disabled={busy} onClick={() => setDeleting(null)}>Hủy</Button><Button variant="danger" disabled={busy} onClick={() => run(async () => { if (deleting) { await bank.remove(deleting.id); setSelected((prev) => prev.filter((id) => id !== deleting.id)); setDeleting(null); } }, 'Đã xoá câu hỏi khỏi kho.')}>Xoá khỏi kho</Button></>}><p>{deleting?.question.content}</p><p className="mt-3 text-slate-600">Các bản sao trong bộ đề không bị xoá.</p></Modal>
  </div>;
}
