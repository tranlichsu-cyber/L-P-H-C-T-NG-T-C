import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import type { UserProfile } from '../school/types';
import type { MockRoomData } from '../realtime/types';
import type {
  RoomSummary,
  SessionDetailResult,
  HistoryFilters,
  StudentLongitudinalRecord,
} from './types';
import { SessionAnalysisService } from './SessionAnalysisService';
import { INITIAL_MOCK_SUMMARIES, MOCK_HISTORICAL_ROOM_DETAILS } from './mockHistoryData';
import { loadMockDatabase, saveMockDatabase } from '../realtime/mockStorage';

const LOCAL_SUMMARIES_KEY = 'lhtt_history_summaries';

export class HistoryService {
  // --- LOCAL MOCK STORAGE HANDLERS ---
  private static loadLocalSummaries(): RoomSummary[] {
    try {
      const raw = localStorage.getItem(LOCAL_SUMMARIES_KEY);
      if (!raw) {
        localStorage.setItem(LOCAL_SUMMARIES_KEY, JSON.stringify(INITIAL_MOCK_SUMMARIES));
        return INITIAL_MOCK_SUMMARIES;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_SUMMARIES;
    }
  }

  private static saveLocalSummaries(summaries: RoomSummary[]): void {
    try {
      localStorage.setItem(LOCAL_SUMMARIES_KEY, JSON.stringify(summaries));
    } catch (err) {
      console.error('Failed to save history summaries to localStorage', err);
    }
  }

  // 1. Save Session Summary (Idempotent: summary/main)
  public static async saveSessionSummary(
    room: MockRoomData,
    privateQuestions?: Record<string, { correctAnswer: string; explanation?: string }>
  ): Promise<RoomSummary> {
    const summary = SessionAnalysisService.generateSessionSummary(room, privateQuestions);

    if (db) {
      const roomRef = doc(db, 'rooms', room.id);
      const summaryRef = doc(db, 'rooms', room.id, 'summary', 'main');

      await setDoc(summaryRef, summary, { merge: true });
      await updateDoc(roomRef, {
        status: 'FINISHED',
        finishedAt: summary.endedAt,
        summaryReady: true,
        archived: false,
      });
      return summary;
    }

    // Mock/local mode only
    const mockDb = loadMockDatabase();
    mockDb.rooms[room.id] = {
      ...room,
      status: 'FINISHED',
      finishedAt: summary.endedAt,
    };
    saveMockDatabase(mockDb);

    const summaries = this.loadLocalSummaries();
    const existingIdx = summaries.findIndex((s) => s.roomId === room.id);
    if (existingIdx !== -1) summaries[existingIdx] = summary;
    else summaries.unshift(summary);
    this.saveLocalSummaries(summaries);
    return summary;
  }

  // 2. Get History List with Filtering & Sorting (getDocs, no onSnapshot)
  public static async getHistoryList(
    filters: HistoryFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ summaries: RoomSummary[]; totalCount: number }> {
    let summaries: RoomSummary[] = [];

    if (db) {
      try {
        const uid = auth?.currentUser?.uid;
        if (!uid || auth?.currentUser?.isAnonymous) {
          throw new Error('Phiên giáo viên không hợp lệ.');
        }

        const profileSnap = await getDoc(doc(db, 'users', uid));
        const profile = profileSnap.exists() ? (profileSnap.data() as UserProfile) : null;
        if (!profile || profile.status !== 'ACTIVE') {
          throw new Error('Tài khoản giáo viên không còn hoạt động.');
        }

        // Avoid composite-index dependencies: non-admin teachers query only their own rooms,
        // then all other filters are applied client-side below.
        const q =
          profile.role === 'SCHOOL_ADMIN'
            ? query(collection(db, 'rooms'), where('status', '==', 'FINISHED'))
            : query(collection(db, 'rooms'), where('teacherId', '==', uid));

        const snap = await getDocs(q);

        const list: RoomSummary[] = [];
        for (const docSnap of snap.docs) {
          const rData = docSnap.data();
          const sRef = doc(db, 'rooms', docSnap.id, 'summary', 'main');
          const sSnap = await getDoc(sRef);
          if (sSnap.exists()) {
            list.push(sSnap.data() as RoomSummary);
          } else {
            const [pSnap, qSnap, subSnap, scoreSnap, rosterSnap] = await Promise.all([
              getDocs(collection(db, 'rooms', docSnap.id, 'participants')),
              getDocs(collection(db, 'rooms', docSnap.id, 'liveQuestions')),
              getDocs(collection(db, 'rooms', docSnap.id, 'submissions')),
              getDocs(collection(db, 'rooms', docSnap.id, 'scores')),
              getDocs(collection(db, 'rooms', docSnap.id, 'roster')),
            ]);

            const participants: any = {};
            pSnap.docs.forEach((d) => (participants[d.id] = d.data()));
            const liveQuestions: any = {};
            qSnap.docs.forEach((d) => (liveQuestions[d.id] = d.data()));
            const submissions: any = {};
            subSnap.docs.forEach((d) => (submissions[d.id] = d.data()));
            const scores: any = {};
            scoreSnap.docs.forEach((d) => (scores[d.id] = d.data()));
            const roster = rosterSnap.docs.map((d) => d.data());

            const rawCreatedAt = rData.createdAt;
            const createdAt =
              typeof rawCreatedAt === 'string'
                ? rawCreatedAt
                : rawCreatedAt && typeof rawCreatedAt.toDate === 'function'
                  ? rawCreatedAt.toDate().toISOString()
                  : new Date().toISOString();

            list.push(
              SessionAnalysisService.generateSessionSummary({
                ...(rData as any),
                id: docSnap.id,
                createdAt,
                roster,
                participants,
                liveQuestions,
                submissions,
                scores,
              })
            );
          }
        }
        summaries = list;
      } catch (err) {
        console.error('Firestore history query failed', err);
        throw new Error('Không thể tải lịch sử dạy học từ Firestore.');
      }
    } else {
      summaries = this.loadLocalSummaries();
    }

    // Apply Client-Side Filters
    summaries = summaries.filter((s) => Boolean(s.endedAt));

    if (filters.classId) {
      summaries = summaries.filter((s) => s.classId === filters.classId);
    }
    if (filters.grade) {
      summaries = summaries.filter((s) => s.grade === filters.grade);
    }
    if (filters.subject && filters.subject !== 'ALL') {
      summaries = summaries.filter((s) => s.subject === filters.subject);
    }
    if (filters.searchTitle && filters.searchTitle.trim()) {
      const kw = filters.searchTitle.trim().toLowerCase();
      summaries = summaries.filter(
        (s) =>
          s.quizTitle?.toLowerCase().includes(kw) ||
          s.className.toLowerCase().includes(kw) ||
          s.subject.toLowerCase().includes(kw)
      );
    }
    if (filters.startDate) {
      summaries = summaries.filter((s) => s.startedAt >= filters.startDate!);
    }
    if (filters.endDate) {
      summaries = summaries.filter((s) => s.startedAt <= `${filters.endDate!}T23:59:59`);
    }
    if (!filters.showArchived) {
      summaries = summaries.filter((s) => !s.archived);
    }

    // Apply Sorting
    const sortBy = filters.sortBy || 'newest';
    summaries.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
      if (sortBy === 'oldest') return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
      if (sortBy === 'accuracy_high') return b.averageAccuracy - a.averageAccuracy;
      if (sortBy === 'accuracy_low') return a.averageAccuracy - b.averageAccuracy;
      return 0;
    });

    const totalCount = summaries.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedSummaries = summaries.slice(startIndex, startIndex + pageSize);

    return { summaries: paginatedSummaries, totalCount };
  }

  // 3. Get Session Detail (Snapshot data preservation)
  public static async getSessionDetail(roomId: string): Promise<SessionDetailResult | null> {
    let roomData: MockRoomData | null = null;
    let privateQuestions: Record<string, { correctAnswer: string; explanation?: string }> | undefined;

    if (db) {
      try {
        const rRef = doc(db, 'rooms', roomId);
        const rSnap = await getDoc(rRef);
        if (rSnap.exists()) {
          const r = rSnap.data() as MockRoomData;
          const pSnap = await getDocs(collection(db, 'rooms', roomId, 'participants'));
          const qSnap = await getDocs(collection(db, 'rooms', roomId, 'liveQuestions'));
          const sSnap = await getDocs(collection(db, 'rooms', roomId, 'submissions'));
          const scoreSnap = await getDocs(collection(db, 'rooms', roomId, 'scores'));

          const participants: any = {};
          pSnap.docs.forEach((d) => (participants[d.id] = d.data()));

          const liveQuestions: any = {};
          qSnap.docs.forEach((d) => (liveQuestions[d.id] = d.data()));

          const submissions: any = {};
          sSnap.docs.forEach((d) => (submissions[d.id] = d.data()));

          const scores: any = {};
          scoreSnap.docs.forEach((d) => (scores[d.id] = d.data()));

          roomData = {
            ...r,
            id: rSnap.id,
            participants,
            liveQuestions,
            submissions,
            scores,
          };
        }
      } catch (err) {
        console.error('Firestore fetch session detail failed', err);
        throw new Error('Không thể tải chi tiết buổi học từ Firestore.');
      }
    } else {
      const mockDb = loadMockDatabase();
      roomData = mockDb.rooms[roomId] || MOCK_HISTORICAL_ROOM_DETAILS[roomId] || null;
      privateQuestions = mockDb.privateQuestions[roomId];
    }

    if (!roomData) return null;

    return SessionAnalysisService.analyzeSession(roomData, privateQuestions);
  }

  // 4. Archive / Unarchive Session (Soft delete)
  public static async archiveSession(roomId: string, archived: boolean): Promise<boolean> {
    if (db) {
      const roomRef = doc(db, 'rooms', roomId);
      const summaryRef = doc(db, 'rooms', roomId, 'summary', 'main');
      await updateDoc(roomRef, { archived });
      const summarySnap = await getDoc(summaryRef);
      if (summarySnap.exists()) {
        await updateDoc(summaryRef, { archived });
      }
      return true;
    }

    const summaries = this.loadLocalSummaries();
    const item = summaries.find((s) => s.roomId === roomId);
    if (item) {
      item.archived = archived;
      this.saveLocalSummaries(summaries);
    }

    return true;
  }

  // 5. Get Student Longitudinal History across sessions
  public static async getStudentLongitudinalHistory(
    classId: string,
    studentId: string,
    subjectFilter: string = 'ALL'
  ): Promise<{ studentName: string; records: StudentLongitudinalRecord[]; averageAccuracy: number }> {
    const { summaries } = await this.getHistoryList({ classId, showArchived: false, sortBy: 'oldest' }, 1, 100);

    const records: StudentLongitudinalRecord[] = [];
    let studentName = 'Học sinh';

    for (const summary of summaries) {
      if (subjectFilter !== 'ALL' && summary.subject !== subjectFilter) {
        continue;
      }

      const detail = await this.getSessionDetail(summary.roomId);
      if (!detail) continue;

      const studentRes = detail.studentResults.find((s) => s.studentId === studentId);
      if (studentRes) {
        studentName = studentRes.studentName;
        records.push({
          roomId: summary.roomId,
          date: new Date(summary.startedAt).toLocaleDateString('vi-VN'),
          subject: summary.subject,
          quizTitle: summary.quizTitle || 'Bài học',
          className: summary.className,
          correctCount: studentRes.correctCount,
          totalQuestions: summary.questionCount,
          accuracy: studentRes.accuracy,
          score: studentRes.score,
        });
      }
    }

    const totalAcc = records.reduce((acc, r) => acc + r.accuracy, 0);
    const averageAccuracy = records.length > 0 ? Math.round(totalAcc / records.length) : 0;

    return { studentName, records, averageAccuracy };
  }
}
