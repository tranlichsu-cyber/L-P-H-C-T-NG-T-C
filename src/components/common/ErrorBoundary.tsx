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
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
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
