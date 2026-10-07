import { useSchool } from '../context/SchoolContext';

/**
 * Convenience hook for school settings.
 * Reuses SchoolContext so the app keeps a single Firestore onSnapshot listener
 * for settings/school instead of creating one listener per component.
 */
export function useSchoolSettings() {
  const { settings, isLoading } = useSchool();

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
