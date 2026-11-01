import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { modelsCatalog } from '../../data/models/modelsCatalog';

const workshopIds = new Set([
  'thap-dinh-duong', 'co-the-nguoi-tuan-hoan', 'trong-dong-dong-son',
  'van-mieu-quoc-tu-giam', 'nha-rong-tay-nguyen', 'dia-dao-cu-chi',
]);

export function WorkshopModelPage() {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const model = modelsCatalog.find(item => item.id === modelId && workshopIds.has(item.id));

  if (!model) {
    return <main className="min-h-screen bg-slate-950 text-white p-8 space-y-4">
      <h1 className="text-2xl font-bold">Không tìm thấy mô hình</h1>
      <button type="button" onClick={() => navigate('/mo-hinh')} className="rounded-xl bg-amber-700 px-4 py-2">Về kho mô hình</button>
    </main>;
  }
  const source = `/models/${model.id}-3d.html`;
  return <div className="min-h-screen bg-slate-950 text-slate-100">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-4 py-3">
      <button type="button" onClick={() => navigate('/mo-hinh')} className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm font-bold">
        <ArrowLeft className="h-4 w-4" /> Kho mô hình
      </button>
      <span className="text-xs text-slate-400">{model.subject} {model.grade} · {model.lessonCode}</span>
      <a href={source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-amber-300">
        Mở cửa sổ 3D <ExternalLink className="h-4 w-4" />
      </a>
    </header>
    <main className="mx-auto max-w-[1800px] p-2 sm:p-4 space-y-3">
      <h1 className="text-xl sm:text-2xl font-black px-2">{model.title}</h1>
      <iframe key={model.id} src={source} title={model.title} allow="fullscreen" className="w-full h-[85svh] min-h-[650px] rounded-2xl border border-slate-700" />
    </main>
  </div>;
}
