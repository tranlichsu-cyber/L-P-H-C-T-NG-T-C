import { useMemo, useState } from 'react';
import { Button } from '../common/Button';
import { QUESTION_LABELS, type BankQuestion } from '../../services/questionBank/useQuestionBank';
import { normalizeVietnameseText } from '../../utils/normalizeVietnamese';

interface Props {
  items: BankQuestion[];
  selected: string[];
  onSelect: (id: string) => void;
  onEdit?: (item: BankQuestion) => void;
  onDelete?: (item: BankQuestion) => void;
}
export function QuestionBankBrowser({ items, selected, onSelect, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const filtered = useMemo(() => items.filter((item) =>
    (!grade || item.grade === grade) && (!subject || item.subject === subject)
    && (!type || item.question.type === type) && (!difficulty || item.question.difficulty === difficulty)
    && normalizeVietnameseText(`${item.question.content} ${item.topic}`).includes(normalizeVietnameseText(search))),
    [items, grade, subject, type, difficulty, search]);
  const field = 'rounded-xl border border-slate-300 p-2 text-sm text-slate-900 bg-white';
  return <div className="space-y-3">
    <input aria-label="Tìm câu hỏi hoặc chủ đề" className={`${field} w-full`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm nội dung câu hỏi hoặc chủ đề…" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <select aria-label="Lọc theo khối" className={field} value={grade} onChange={(e) => setGrade(e.target.value)}><option value="">Tất cả khối</option>{[...new Set(items.map((i) => i.grade))].sort().map((g) => <option key={g}>{g}</option>)}</select>
      <select aria-label="Lọc theo môn" className={field} value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">Tất cả môn</option>{[...new Set(items.map((i) => i.subject))].sort().map((s) => <option key={s}>{s}</option>)}</select>
      <select aria-label="Lọc dạng câu hỏi" className={field} value={type} onChange={(e) => setType(e.target.value)}><option value="">Tất cả dạng</option>{Object.entries(QUESTION_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <select aria-label="Lọc mức độ" className={field} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="">Tất cả mức độ</option><option value="KNOWLEDGE">Nhận biết</option><option value="UNDERSTANDING">Thông hiểu</option><option value="APPLICATION">Vận dụng</option></select>
    </div>
    <p className="text-sm text-slate-600">{filtered.length} câu phù hợp • Đã chọn {selected.length} câu</p>
    {filtered.length === 0 && <p className="p-6 text-center text-slate-500">Chưa có câu hỏi phù hợp. Lưu câu hỏi từ bộ đề vào kho để dùng lại.</p>}
    <div className="space-y-3">
      {filtered.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 p-4 bg-white">
        <label className="flex gap-3 cursor-pointer"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={selected.includes(item.id)} onChange={() => onSelect(item.id)} />
          <span><span className="block text-xs text-indigo-700 mb-1">{item.grade} • {item.subject} • {QUESTION_LABELS[item.question.type]}{item.topic ? ` • ${item.topic}` : ''}</span><strong className="text-slate-900 whitespace-pre-wrap">{item.question.content}</strong></span>
        </label>
        <details className="ml-8 mt-2 text-sm text-slate-700"><summary className="cursor-pointer">Xem lựa chọn, đáp án và giải thích</summary>
          {item.question.options?.map((opt, i) => <p key={i}>{String.fromCharCode(65 + i)}. {opt}</p>)}
          <p className="font-semibold text-emerald-800 mt-2">Đáp án: {item.question.correctAnswer}</p>{item.question.explanation && <p>{item.question.explanation}</p>}
        </details>
        {(onEdit || onDelete) && <div className="flex gap-2 ml-8 mt-2">{onEdit && <Button size="sm" variant="outline" onClick={() => onEdit(item)}>Sửa câu lưu</Button>}{onDelete && <Button size="sm" variant="secondary" onClick={() => onDelete(item)}>Xoá khỏi kho</Button>}</div>}
      </article>)}
    </div>
  </div>;
}
