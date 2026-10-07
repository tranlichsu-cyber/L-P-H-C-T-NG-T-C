import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SchoolService } from '../services/school/SchoolService';
import type { SchoolSettings, School } from '../services/school/types';
import { INITIAL_SCHOOL_SETTINGS } from '../services/school/mockSchoolData';

interface SchoolContextType {
  settings: SchoolSettings;
  school: School;
  logoUrl: string;
  updateLogo: (newLogoUrl: string, actor?: { uid: string; name: string }) => Promise<void>;
  updateSettings: (newSettings: Partial<SchoolSettings>, actor?: { uid: string; name: string }) => Promise<void>;
  isLoading: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SchoolSettings>(INITIAL_SCHOOL_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initial fetch
    SchoolService.getSchoolSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });

    // Real-time listener via Firestore onSnapshot / local events
    const unsubscribe = SchoolService.subscribeSchoolSettings((updatedSettings) => {
      setSettings(updatedSettings);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateLogo = useCallback(
    async (newLogoUrl: string, actor?: { uid: string; name: string }) => {
      const updated = await SchoolService.updateSchoolSettings({ logoUrl: newLogoUrl }, actor);
      // Immediately update state after await
      setSettings(updated);
    },
    []
  );

  const updateSettings = useCallback(
    async (newSettings: Partial<SchoolSettings>, actor?: { uid: string; name: string }) => {
      const updated = await SchoolService.updateSchoolSettings(newSettings, actor);
      setSettings(updated);
    },
    []
  );

  const school: School = {
    id: 'school-default',
    name: settings.schoolName,
    code: 'SC2026',
    status: 'ACTIVE',
    academicYear: settings.schoolYear,
    logoUrl: settings.logoUrl,
    createdAt: settings.createdAt,
  };

  return (
    <SchoolContext.Provider
      value={{
        settings,
        school,
        logoUrl: settings.logoUrl || '',
        updateLogo,
        updateSettings,
        isLoading,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
