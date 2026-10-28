import { QrBankEditor } from '../../components/qr/QrBankEditor';
import { QrWordImport } from '../../components/qr/QrWordImport';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QrBankService } from '../../services/qrBank/QrBankService';
import type { QrBank } from '../../services/qrBank/content';
import { getStandardGrade4MathBanks } from '../../services/qrBank/standardBanks';
import { BookOpen, CheckCircle, Play, Search } from 'lucide-react';

const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 font-bold text-white hover:bg-indigo-800 disabled:opacity-40 text-sm transition';
const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 text-sm transition';

export function QrBankPage() {
  const { bankId } = useParams();
  return bankId ? <QrBankEditor key={bankId} /> : <BankList />;
}

function BankList() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid || '';
  const [items, setItems] = useState<QrBank[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  const [activeTab, setActiveTab] = useState<'all' | 'curriculum' | 'custom'>('curriculum');
  const [volumeFilter, setVolumeFilter] = useState<'all' | 'vol1' | 'vol2'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const standardBanks = useMemo(() => getStandardGrade4MathBanks(), []);

  useEffect(() => {
    let cancelled = false;
    setItems([]);
    setLoading(true);
    setError('');
    QrBankService.list(uid, reload > 0)
      .then(v => {
        if (!cancelled) setItems(v);
      })
      .catch(() => {
        if (!cancelled) setError('Chưa tải được kho câu hỏi. Hãy thử lại.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid, reload]);

  async function remove(id: string) {
    setBusy(true);
    setError('');
    try {
      await QrBankService.remove(uid, id);
      setItems(v => v.filter(b => b.id !== id));
      setDeleting('');
    } catch {
      setError('Chưa xóa được bộ câu hỏi. Hãy thử lại.');
    } finally {
      setBusy(false);
    }
  }

  // Filtered standard banks
  const filteredStandards = useMemo(() => {
    return standardBanks.filter(b => {
      // Volume filter
      const matchNumber = b.title.match(/Bài\s+(\d+)/i);
      const num = matchNumber ? parseInt(matchNumber[1], 10) : 0;
      if (volumeFilter === 'vol1' && num > 37) return false;
      if (volumeFilter === 'vol2' && (num < 38 || num > 73)) return false;

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        return b.title.toLowerCase().includes(term) || b.subject.toLowerCase().includes(term);
      }
      return true;
    });
  }, [standardBanks, volumeFilter, searchTerm]);

  // Filtered custom banks
  const filteredCustom = useMemo(() => {
    return items.filter(b => {
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        return b.title.toLowerCase().includes(term) || b.subject.toLowerCase().includes(term);
      }
      return true;
    });
  }, [items, searchTerm]);

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <Link to="/teacher/qr-cards" className="inline-flex items-center gap-1.5 font-bold text-indigo-700 hover:underline">
        ← Trở lại Trả lời bằng thẻ QR
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Kho câu hỏi thẻ QR</h1>
          <p className="mt-1 text-slate-600">
            Trọn bộ 73 bài Toán lớp 4 (SGK Kết nối tri thức - taphuan.nxbgd.vn) và các bộ câu hỏi riêng của thầy cô.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/teacher/qr-cards" className={button}>
            <Play className="h-4 w-4" /> Lên lớp bằng thẻ QR
          </Link>
          <Link to="/teacher/qr-cards/bank/new" className={secondaryButton}>
            + Soạn bộ câu hỏi mới
          </Link>
        </div>
      </header>

      <QrWordImport />

      {/* FILTER & TABS */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('curriculum')}
              className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                activeTab === 'curriculum'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📚 Toán lớp 4 - Chuẩn SGK (73 bài)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                activeTab === 'custom'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📝 Bộ tự soạn ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                activeTab === 'all'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất cả ({items.length + standardBanks.length})
            </button>
          </div>

          {(activeTab === 'curriculum' || activeTab === 'all') && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span>Lọc tập:</span>
              <button
                type="button"
                onClick={() => setVolumeFilter('all')}
                className={`rounded-lg px-2.5 py-1 ${volumeFilter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-slate-100'}`}
              >
                Cả năm (73 bài)
              </button>
              <button
                type="button"
                onClick={() => setVolumeFilter('vol1')}
                className={`rounded-lg px-2.5 py-1 ${volumeFilter === 'vol1' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-slate-100'}`}
              >
                Tập 1 (Bài 1–37)
              </button>
              <button
                type="button"
                onClick={() => setVolumeFilter('vol2')}
                className={`rounded-lg px-2.5 py-1 ${volumeFilter === 'vol2' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-slate-100'}`}
              >
                Tập 2 (Bài 38–73)
              </button>
            </div>
          )}
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-indigo-500"
            placeholder="Tìm theo tên bài học (vd: Bài 1, Phép cộng, Góc nhọn, Phân số, Yến tạ tấn...)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && <p className="text-slate-500">Đang tải kho câu hỏi…</p>}
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-900">
          {error}{' '}
          <button type="button" className="font-bold underline" disabled={loading} onClick={() => setReload(v => v + 1)}>
            Thử tải lại kho câu hỏi
          </button>
        </p>
      )}

      {/* CURRICULUM SECTION */}
      {(activeTab === 'curriculum' || activeTab === 'all') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Bộ câu hỏi chuẩn SGK Toán lớp 4 ({filteredStandards.length} bài)
            </h2>
            <span className="text-xs font-semibold text-slate-500">NXB Giáo dục Việt Nam • Kết nối tri thức</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredStandards.map(bank => (
              <article key={bank.id} className="flex flex-col justify-between space-y-3 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                      <CheckCircle className="h-3.5 w-3.5 text-indigo-600" /> Chuẩn SGK
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{bank.questions.length} câu trắc nghiệm</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{bank.title}</h3>
                  <p className="text-xs text-slate-600">
                    Môn: <strong className="text-indigo-900">{bank.subject}</strong> • {bank.grade} • Đáp án A–D chuẩn hóa
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/teacher/qr-cards?quizId=${encodeURIComponent(bank.id)}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    <Play className="h-3.5 w-3.5" /> Chiếu thẻ QR
                  </Link>
                  <Link
                    to={`/teacher/qr-cards/bank/${bank.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Xem & Tùy biến câu hỏi
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* CUSTOM SECTION */}
      {(activeTab === 'custom' || activeTab === 'all') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
              📝 Bộ câu hỏi tự soạn của thầy cô ({filteredCustom.length} bộ)
            </h2>
            <Link to="/teacher/qr-cards/bank/new" className="text-xs font-bold text-indigo-700 hover:underline">
              + Soạn thêm bộ mới
            </Link>
          </div>

          {!loading && !filteredCustom.length && (
            <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
              {searchTerm ? 'Không tìm thấy bộ tự soạn nào phù hợp từ khóa.' : 'Thầy cô chưa có bộ tự soạn nào. Thầy cô có thể chọn "Soạn bộ câu hỏi mới" hoặc xem bộ chuẩn SGK ở trên.'}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredCustom.map(bank => (
              <article key={bank.id} className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-xl font-black">{bank.title}</h3>
                <p className="text-sm text-slate-600">
                  {bank.subject} • {bank.grade} • {Array.isArray(bank.questions) ? bank.questions.length : 0} câu
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link to={`/teacher/qr-cards?quizId=${encodeURIComponent(bank.id)}`} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition">
                    <Play className="h-3.5 w-3.5" /> Chiếu thẻ QR
                  </Link>
                  <Link to={`/teacher/qr-cards/bank/${bank.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-700 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-800 transition">
                    Sửa câu hỏi / Ảnh / Video
                  </Link>
                  <button
                    type="button"
                    disabled={busy}
                    className="font-bold text-xs text-rose-800 underline disabled:opacity-40 ml-auto"
                    onClick={() => setDeleting(bank.id)}
                  >
                    Xóa bộ…
                  </button>
                </div>
                {deleting === bank.id && (
                  <div className="rounded-xl bg-amber-50 p-3 text-xs">
                    <p>Xóa bộ này khỏi kho? Các tiết đã tạo vẫn giữ nguyên câu hỏi và kết quả.</p>
                    <div className="mt-2 flex gap-2">
                      <button className="rounded-lg bg-rose-700 px-3 py-1 font-bold text-white" disabled={busy} onClick={() => void remove(bank.id)}>
                        Xác nhận xóa
                      </button>
                      <button className="underline" disabled={busy} onClick={() => setDeleting('')}>
                        Giữ lại
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
