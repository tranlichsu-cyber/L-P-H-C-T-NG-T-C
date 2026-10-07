import { SchoolService } from '../school/SchoolService';
import { HistoryService } from '../history/HistoryService';
import { INITIAL_CLASSES } from '../../data/mockClasses';
import { INITIAL_QUIZZES } from '../../data/mockQuizzes';

export interface BackupMetadata {
  exportedAt: string;
  version: string;
  type: 'BASIC' | 'FULL';
  schoolName: string;
}

export interface SchoolBackupData {
  metadata: BackupMetadata;
  settings: any;
  users: any[];
  teams: any[];
  classes: any[];
  quizzes: any[];
  historySummaries?: any[];
}

export class BackupService {
  public static async exportSchoolData(type: 'BASIC' | 'FULL' = 'BASIC'): Promise<{
    filename: string;
    jsonString: string;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const settings = await SchoolService.getSchoolSettings();
    const users = await SchoolService.getUsers();
    const teams = await SchoolService.getTeams();

    const data: SchoolBackupData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.1.0',
        type,
        schoolName: settings.schoolName,
      },
      settings,
      users: users.map((u) => ({
        uid: u.uid,
        displayName: u.displayName,
        email: u.email,
        role: u.role,
        teamIds: u.teamIds,
        status: u.status,
      })),
      teams,
      classes: INITIAL_CLASSES,
      quizzes: INITIAL_QUIZZES,
    };

    if (type === 'FULL') {
      try {
        const historyRes = await HistoryService.getHistoryList({});
        data.historySummaries = historyRes.summaries;
      } catch {
        data.historySummaries = [];
      }
    }

    const filename = `single-school-backup-${type.toLowerCase()}-${today}.json`;
    const jsonString = JSON.stringify(data, null, 2);

    return { filename, jsonString };
  }

  public static downloadBackupFile(filename: string, jsonString: string): void {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
