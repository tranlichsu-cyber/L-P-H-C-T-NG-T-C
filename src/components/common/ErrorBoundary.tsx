import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRecoveringChunk: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isRecoveringChunk: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);

    const message = String(error?.message || error || '');
    const isChunkLoadError =
      /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
        message
      );

    if (isChunkLoadError) {
      const key = 'lhtt_chunk_recovery_once';
      const alreadyRetried = sessionStorage.getItem(key) === '1';

      if (!alreadyRetried) {
        sessionStorage.setItem(key, '1');
        this.setState({ isRecoveringChunk: true });

        navigator.serviceWorker?.getRegistrations?.()
          .then((registrations) => Promise.all(registrations.map((reg) => reg.update())))
          .catch(() => undefined)
          .finally(() => {
            window.location.reload();
          });
        return;
      }

      sessionStorage.removeItem(key);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.isRecoveringChunk) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800 border border-sky-500/30 p-8 rounded-3xl shadow-2xl space-y-4">
            <RefreshCw className="w-10 h-10 animate-spin text-sky-400 mx-auto" />
            <h1 className="text-xl font-black text-white">ĐANG CẬP NHẬT PHIÊN BẢN MỚI</h1>
            <p className="text-sm text-slate-300">Ứng dụng đang tự đồng bộ lại dữ liệu giao diện. Vui lòng chờ trong giây lát.</p>
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800 border-2 border-rose-500/30 p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-amber-400">ỨNG DỤNG GẶP SỰ CỐ TẠM THỜI</h1>
              <p className="text-xs text-slate-300">
                Đã xảy ra lỗi không mong muốn trong quá trình xử lý giao diện. Vui lòng tải lại trang để tiếp tục học tập.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="p-3 bg-slate-950 border border-slate-700 rounded-xl text-left text-xs font-mono text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <Button variant="warning" size="lg" onClick={this.handleReload} className="w-full font-bold text-slate-950">
              <RefreshCw className="w-5 h-5 mr-2" /> TẢI LẠI TRANG SẢN PHẨM
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
