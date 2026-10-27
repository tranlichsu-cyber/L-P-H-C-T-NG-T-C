import { useEffect } from 'react';
import { Smartphone, Maximize2, EyeOff, Eye } from 'lucide-react';
import { Button } from '../common/Button';

interface LessonSlideControlsProps {
  page: number;
  count: number;
  onPage: (page: number) => void;
  blackout?: boolean;
  onToggleBlackout?: () => void;
  onOpenPhoneQr?: () => void;
}

export function LessonSlideControls({
  page,
  count,
  onPage,
  blackout = false,
  onToggleBlackout,
  onOpenPhoneQr,
}: LessonSlideControlsProps) {
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(event.target.tagName)
      ) {
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault();
        onPage(Math.min(count, page + 1));
      }
      if (['ArrowLeft', 'PageUp'].includes(event.key)) {
        event.preventDefault();
        onPage(Math.max(1, page - 1));
      }
      if ((event.key === 'b' || event.key === 'B') && onToggleBlackout) {
        event.preventDefault();
        onToggleBlackout();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [page, count, onPage, onToggleBlackout]);

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center shrink-0 text-white bg-slate-900/95 border border-slate-800 rounded-xl p-2">
      <Button
        variant="primary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPage(Math.max(1, page - 1))}
      >
        ← Slide trước
      </Button>

      <label className="text-sm font-semibold flex items-center gap-1.5">
        Slide{' '}
        <select
          aria-label="Chuyển đến trang"
          className="bg-slate-800 text-white border border-slate-600 rounded-lg px-2.5 py-1.5 font-bold"
          value={Math.min(page, Math.max(1, count))}
          onChange={e => onPage(Number(e.target.value))}
        >
          {Array.from({ length: Math.max(1, count) }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>{' '}
        / {Math.max(1, count)}
      </label>

      <Button
        variant="primary"
        size="sm"
        disabled={page >= count}
        onClick={() => onPage(Math.min(count, page + 1))}
      >
        Slide sau →
      </Button>

      {onOpenPhoneQr && (
        <Button
          variant="outline"
          size="sm"
          className="text-emerald-300 border-emerald-500/60 hover:bg-emerald-950/60 gap-1.5"
          onClick={onOpenPhoneQr}
        >
          <Smartphone className="w-4 h-4" />
          Điều khiển bằng ĐT
        </Button>
      )}

      {onToggleBlackout && (
        <Button
          variant="outline"
          size="sm"
          className={
            blackout
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold gap-1.5'
              : 'text-slate-200 border-slate-600 hover:bg-slate-800 gap-1.5'
          }
          onClick={onToggleBlackout}
        >
          {blackout ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {blackout ? 'Hiện lại màn chiếu' : 'Màn hình đen'}
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        className="text-white border-slate-600 hover:bg-slate-800 gap-1.5"
        onClick={() => {
          if (document.fullscreenElement) void document.exitFullscreen();
          else void document.documentElement.requestFullscreen().catch(() => {});
        }}
      >
        <Maximize2 className="w-4 h-4" />
        Toàn màn hình
      </Button>
    </div>
  );
}
