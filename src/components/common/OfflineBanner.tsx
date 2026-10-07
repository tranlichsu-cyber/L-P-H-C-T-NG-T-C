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
    <div className="bg-amber-600 text-white px-4 py-2.5 shadow-lg flex items-center justify-center gap-2 font-bold text-xs sm:text-sm text-center z-50 sticky top-0 animate-bounce">
      <WifiOff className="w-5 h-5 shrink-0" />
      <span>
        {userType === 'STUDENT'
          ? 'MẤT KẾT NỐI MẠNG! Câu trả lời chưa được gửi. Vui lòng giữ nguyên màn hình.'
          : 'MẤT KẾT NỐI MẠNG! Đang tạm dừng đồng bộ Realtime. Đang thử kết nối lại...'}
      </span>
    </div>
  );
};
