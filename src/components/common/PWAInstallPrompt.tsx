import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { Button } from './Button';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem('lhtt_pwa_dismissed');
    if (isDismissed) setDismissed(true);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone && !isDismissed) {
      setShowIOSPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('lhtt_pwa_dismissed', 'true');
  };

  if (dismissed) return null;

  if (deferredPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-sky-500 max-w-sm flex items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-sm text-amber-400">CÀI ỨNG DỤNG LỚP HỌC</h4>
            <p className="text-[11px] text-slate-300 font-medium">Cài lên màn hình chính để mở nhanh</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="warning" size="sm" onClick={handleInstallClick} className="font-bold text-slate-950 text-xs">
            Cài ngay
          </Button>
          <button onClick={handleDismiss} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-sky-500 max-w-md flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
          <Share2 className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-black text-sm text-amber-400">CÀI ỨNG DỤNG TRÊN IPAD / IPHONE</h4>
          <p className="text-xs text-slate-300">
            Bấm biểu tượng <strong>Chia sẻ</strong> (<Share2 className="inline w-3 h-3 text-sky-400" />) trên trình duyệt Safari, sau đó chọn <strong>"Thêm vào Màn hình chính"</strong> (<PlusSquare className="inline w-3 h-3 text-sky-400" />).
          </p>
        </div>
        <button onClick={handleDismiss} className="p-1 text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
};
