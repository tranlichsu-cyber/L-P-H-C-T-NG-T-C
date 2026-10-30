import { useState } from 'react';
import { StudentAccessService, type StudentAccess } from '../../services/selfPractice/studentAccess';
import { Sparkles } from 'lucide-react';

export function StudentEntry({ onEnter }: { onEnter: (student: StudentAccess) => void }) {
  const [code, setCode] = useState(() => {
    try {
      return localStorage.getItem('lhtt_self_practice_code') || '';
    } catch {
      return '';
    }
  });
  const [student, setStudent] = useState<StudentAccess | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSelectStudent = (std: StudentAccess) => {
    try {
      localStorage.setItem('lhtt_self_practice_code', std.code);
    } catch {}
    onEnter(std);
  };

  const handleClearCode = () => {
    try {
      localStorage.removeItem('lhtt_self_practice_code');
    } catch {}
    setStudent(null);
    setCode('');
  };

  return (
    <section className="max-w-lg mx-auto bg-white border-2 border-sky-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <h2 className="text-xl font-black">Vào tự luyện bằng mã học sinh</h2>
      {student ? (
        <>
          <p>Lớp: <strong>{student.className}</strong></p>
          <p>Em chọn tên của mình để bắt đầu:</p>
          <button
            type="button"
            className="w-full rounded-xl bg-sky-700 hover:bg-sky-800 text-white p-4 font-bold transition-colors shadow-sm"
            onClick={() => handleSelectStudent(student)}
          >
            {student.studentName}
          </button>
          <button
            type="button"
            className="text-sm underline text-slate-600 hover:text-slate-900 block mx-auto"
            onClick={handleClearCode}
          >
            Không phải tên em? Nhập mã khác
          </button>
        </>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              const res = await StudentAccessService.enter(code);
              setStudent(res);
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <label className="block font-bold">
              Mã tự luyện của em
              <input
                autoComplete="off"
                autoCapitalize="characters"
                required
                maxLength={20}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block w-full border rounded-xl p-3 mt-2 uppercase font-mono tracking-wider"
                placeholder="Nhập mã giáo viên đã cấp"
              />
            </label>
            {code.trim().length > 0 && (
              <div className="mt-2 flex items-center justify-between text-xs px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Đã lưu mã từ lần trước
                </span>
                <button
                  type="button"
                  onClick={handleClearCode}
                  className="text-xs text-rose-600 underline font-bold hover:text-rose-800"
                >
                  Đổi mã khác
                </button>
              </div>
            )}
          </div>
          <button
            disabled={busy || !code.trim()}
            className="w-full rounded-xl bg-sky-700 hover:bg-sky-800 text-white p-3 font-bold disabled:opacity-50 transition-colors"
          >
            {busy ? 'Đang kiểm tra…' : 'Tiếp tục'}
          </button>
        </form>
      )}
      {error && <p role="alert" className="text-red-800 text-sm font-semibold">{error}</p>}
      <p className="text-sm text-slate-600">Mỗi em có một mã riêng. Em chỉ dùng mã giáo viên cấp cho mình.</p>
    </section>
  );
}
