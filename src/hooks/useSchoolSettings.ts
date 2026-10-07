import { useState, useEffect } from 'react';
import { SchoolService } from '../services/school/SchoolService';
import type { SchoolSettings } from '../services/school/types';
import { INITIAL_SCHOOL_SETTINGS } from '../services/school/mockSchoolData';

/**
 * Hook chuyên dùng để lắng nghe thông tin trường tại settings/school theo thời gian thực (realtime onSnapshot).
 * Tự động cập nhật schoolName, displayName, campusName, schoolYear, logoUrl khi dữ liệu Firestore thay đổi.
 * Tự động cleanup listener (unsubscribe) khi unmount. Fallback an toàn nếu Firebase chưa cấu hình.
 */
export function useSchoolSettings() {
  const [settings, setSettings] = useState<SchoolSettings>(INITIAL_SCHOOL_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Lấy dữ liệu ban đầu
    SchoolService.getSchoolSettings()
      .then((s) => {
        setSettings(s);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 2. Đăng ký lắng nghe onSnapshot doc(db, 'settings', 'school')
    const unsubscribe = SchoolService.subscribeSchoolSettings((updatedSettings) => {
      setSettings(updatedSettings);
      setIsLoading(false);
    });

    // 3. Hủy lắng nghe khi component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    settings,
    schoolName: settings.schoolName,
    displayName: settings.displayName,
    campusName: settings.campusName,
    schoolYear: settings.schoolYear,
    logoUrl: settings.logoUrl || '',
    isLoading,
  };
}
