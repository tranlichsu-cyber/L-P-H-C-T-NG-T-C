import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  userType?: 'STUDENT' | 'TEACHER';
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ userType = 'STUDENT' }) => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div role="status" aria-live="polite" className="bg-amber-700 text-white px-4 py-3 shadow-md flex items-center justify-center gap-2 font-bold text-sm text-center z-50 sticky top-0">
      <WifiOff className="w-5 h-5 shrink-0" />
      <span>
        {userType === 'STUDENT'
          ? 'Thiết bị đang ngoại tuyến. Em hãy giữ nguyên màn hình và thử lại khi có mạng.'
          : 'Thiết bị đang ngoại tuyến. Vui lòng giữ nguyên trang để tránh gián đoạn thao tác.'}
      </span>
    </div>
  );
};
