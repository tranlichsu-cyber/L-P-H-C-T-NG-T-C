import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '../firebase/firebase';
import type { PracticeSet, PracticeAssignment, PracticeSubmission } from './types';
import type { UserProfile } from '../school/types';
import { INITIAL_MOCK_PRACTICE_SETS } from './mockPracticeData';

const LOCAL_PRACTICE_KEY = 'lhtt_practice_sets';

type StudentProgress = PracticeAssignment & {
  authUid?: string | null;
};

const sanitizeFirestoreData = (value: unknown): any => {
  if (Array.isArray(value)) {
    return value.map((item) => (item === undefined ? null : sanitizeFirestoreData(item)));
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, sanitizeFirestoreData(item)])
    );
  }
  return value;
};

export class PracticeService {
  private static loadLocalPracticeSets(): PracticeSet[] {
    try {
      const raw = localStorage.getItem(LOCAL_PRACTICE_KEY);
      if (!raw) {
        localStorage.setItem(LOCAL_PRACTICE_KEY, JSON.stringify(INITIAL_MOCK_PRACTICE_SETS));
        return INITIAL_MOCK_PRACTICE_SETS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_PRACTICE_SETS;
    }
  }

  private static saveLocalPracticeSets(sets: PracticeSet[]): void {
    try {
      localStorage.setItem(LOCAL_PRACTICE_KEY, JSON.stringify(sets));
    } catch (err) {
      console.error('Failed to save practice sets to localStorage', err);
    }
  }

  private static async ensureStudentAuth(): Promise<string> {
    if (!auth) throw new Error('Firebase Auth chưa sẵn sàng.');
    if (auth.currentUser) return auth.currentUser.uid;
    const credential = await signInAnonymously(auth);
    return credential.user.uid;
  }

  private static async mergeProgress(setItem: PracticeSet): Promise<PracticeSet> {
    if (!db) return setItem;

    const [progressSnap, responsesSnap] = await Promise.all([
      getDocs(collection(db, 'practiceSets', setItem.id, 'studentProgress')),
      getDocs(collection(db, 'practiceSets', setItem.id, 'responses')),
    ]);

    const assignments = { ...(setItem.assignments || {}) };
    progressSnap.docs.forEach((progressDoc) => {
      const progress = progressDoc.data() as StudentProgress;
      const { authUid: _authUid, ...assignment } = progress;
      assignments[progress.studentId || progressDoc.id] = assignment;
    });

    const responses: Record<string, PracticeSubmission> = {};
    responsesSnap.docs.forEach((responseDoc) => {
      responses[responseDoc.id] = responseDoc.data() as PracticeSubmission;
    });

    return { ...setItem, assignments, responses };
  }

  // 1. Create Practice Set
  public static async createPracticeSet(
    params: Omit<PracticeSet, 'id' | 'createdAt' | 'assignments' | 'responses'>
  ): Promise<PracticeSet> {
    const id = `practice-${Date.now()}`;
    const now = new Date().toISOString();
    const newSet: PracticeSet = {
      ...params,
      id,
      createdAt: now,
      assignments: {},
      responses: {},
      archived: false,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'practiceSets', id), sanitizeFirestoreData(newSet));
      return newSet;
    }

    const sets = this.loadLocalPracticeSets();
    sets.unshift(newSet);
    this.saveLocalPracticeSets(sets);
    return newSet;
  }

  // 2. Update Practice Set
  public static async updatePracticeSet(
    practiceSetId: string,
    params: Omit<PracticeSet, 'id' | 'createdAt' | 'assignments' | 'responses'>
  ): Promise<PracticeSet> {
    if (isFirebaseConfigured && db) {
      const ref = doc(db, 'practiceSets', practiceSetId);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('Không tìm thấy bài ôn tập.');

      const current = { ...(snap.data() as PracticeSet), id: snap.id };
      const updated: PracticeSet = {
        ...current,
        ...params,
        id: practiceSetId,
        createdAt: current.createdAt,
        assignments: current.assignments || {},
        responses: current.responses || {},
      };

      await updateDoc(
        ref,
        sanitizeFirestoreData({
          ...params,
          dueAt: params.dueAt || null,
          updatedAt: new Date().toISOString(),
        })
      );

      return updated;
    }

    const sets = this.loadLocalPracticeSets();
    const index = sets.findIndex((s) => s.id === practiceSetId);
    if (index === -1) throw new Error('Không tìm thấy bài ôn tập.');
    sets[index] = {
      ...sets[index],
      ...params,
      id: practiceSetId,
      createdAt: sets[index].createdAt,
      assignments: sets[index].assignments || {},
      responses: sets[index].responses || {},
    };
    this.saveLocalPracticeSets(sets);
    return sets[index];
  }

  // 2. Assign Practice Set
  public static async assignPracticeSet(
    practiceSetId: string,
    targetStudents: { id: string; name: string }[],
    dueAt?: string
  ): Promise<boolean> {
    const now = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      const pRef = doc(db, 'practiceSets', practiceSetId);
      const pSnap = await getDoc(pRef);
      if (!pSnap.exists()) throw new Error('Không tìm thấy bài ôn tập.');

      const setItem = pSnap.data() as PracticeSet;
      const assignments = { ...(setItem.assignments || {}) };
      const batch = writeBatch(db);

      targetStudents.forEach((std) => {
        const assignment: PracticeAssignment = {
          studentId: std.id,
          studentName: std.name,
          assignedAt: now,
          status: 'NOT_STARTED',
          attemptCount: 0,
        };
        assignments[std.id] = assignment;
        batch.set(
          doc(db!, 'practiceSets', practiceSetId, 'studentProgress', std.id),
          { ...assignment, authUid: null },
          { merge: true }
        );
      });

      batch.update(pRef, {
        status: 'ASSIGNED',
        assignedAt: now,
        dueAt: dueAt || null,
        assignments,
      });
      await batch.commit();
      return true;
    }

    const sets = this.loadLocalPracticeSets();
    const setItem = sets.find((s) => s.id === practiceSetId);
    if (!setItem) return false;
    setItem.status = 'ASSIGNED';
    setItem.assignedAt = now;
    if (dueAt) setItem.dueAt = dueAt;
    targetStudents.forEach((std) => {
      setItem.assignments[std.id] = {
        studentId: std.id,
        studentName: std.name,
        assignedAt: now,
        status: 'NOT_STARTED',
        attemptCount: 0,
      };
    });
    this.saveLocalPracticeSets(sets);
    return true;
  }

  // 3. Teacher list
  public static async getTeacherPracticeSets(
    classId?: string,
    subject?: string,
    showArchived: boolean = false
  ): Promise<PracticeSet[]> {
    let sets: PracticeSet[];

    if (isFirebaseConfigured && db) {
      const uid = auth?.currentUser?.uid;
      if (!uid || auth?.currentUser?.isAnonymous) {
        throw new Error('Phiên giáo viên không hợp lệ.');
      }

      const profileSnap = await getDoc(doc(db, 'users', uid));
      const profile = profileSnap.exists() ? (profileSnap.data() as UserProfile) : null;
      if (!profile || profile.status !== 'ACTIVE') {
        throw new Error('Tài khoản giáo viên không còn hoạt động.');
      }

      const snap =
        profile.role === 'SCHOOL_ADMIN'
          ? await getDocs(collection(db, 'practiceSets'))
          : await getDocs(query(collection(db, 'practiceSets'), where('teacherId', '==', uid)));

      sets = await Promise.all(
        snap.docs.map(async (d) => {
          const base = { ...(d.data() as PracticeSet), id: d.id };
          return this.mergeProgress(base);
        })
      );
    } else {
      sets = this.loadLocalPracticeSets();
    }

    if (classId) sets = sets.filter((s) => s.classId === classId);
    if (subject && subject !== 'ALL') sets = sets.filter((s) => s.subject === subject);
    if (!showArchived) sets = sets.filter((s) => !s.archived);
    sets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sets;
  }

  // 4. Detail
  public static async getPracticeSetDetail(practiceSetId: string): Promise<PracticeSet | null> {
    if (isFirebaseConfigured && db) {
      const pSnap = await getDoc(doc(db, 'practiceSets', practiceSetId));
      if (!pSnap.exists()) return null;
      return this.mergeProgress({ ...(pSnap.data() as PracticeSet), id: pSnap.id });
    }

    return this.loadLocalPracticeSets().find((s) => s.id === practiceSetId) || null;
  }

  // 5. Student assignments
  public static async getStudentAssignments(studentId: string): Promise<{
    activeTasks: { practiceSet: PracticeSet; assignment: PracticeAssignment }[];
    completedTasks: { practiceSet: PracticeSet; assignment: PracticeAssignment }[];
  }> {
    const activeTasks: { practiceSet: PracticeSet; assignment: PracticeAssignment }[] = [];
    const completedTasks: { practiceSet: PracticeSet; assignment: PracticeAssignment }[] = [];
    const now = new Date().toISOString();

    let sets: PracticeSet[] = [];

    if (isFirebaseConfigured && db) {
      const authUid = await this.ensureStudentAuth();
      const setSnap = await getDocs(collection(db, 'practiceSets'));

      for (const setDoc of setSnap.docs) {
        const setItem = { ...(setDoc.data() as PracticeSet), id: setDoc.id };
        if (setItem.archived) continue;

        const progressRef = doc(db, 'practiceSets', setDoc.id, 'studentProgress', studentId);
        const progressSnap = await getDoc(progressRef);
        if (!progressSnap.exists()) continue;

        const progress = progressSnap.data() as StudentProgress;
        if (progress.authUid && progress.authUid !== authUid) {
          continue;
        }

        if (!progress.authUid) {
          await updateDoc(progressRef, { authUid });
          progress.authUid = authUid;
        }

        const { authUid: _authUid, ...assignment } = progress;
        setItem.assignments = {
          ...(setItem.assignments || {}),
          [studentId]: assignment,
        };
        sets.push(setItem);
      }
    } else {
      sets = this.loadLocalPracticeSets();
    }

    sets.forEach((setItem) => {
      const assignment = setItem.assignments?.[studentId];
      if (!assignment) return;

      let currentAssignmentStatus = assignment.status;
      if (setItem.dueAt && now > setItem.dueAt && currentAssignmentStatus !== 'COMPLETED') {
        currentAssignmentStatus = 'EXPIRED';
      }

      const sanitizedQuestions = setItem.questions.map((q) => {
        if (currentAssignmentStatus === 'COMPLETED' && setItem.feedbackMode !== 'TEACHER_ONLY') {
          return q;
        }
        const { correctAnswer: _correctAnswer, explanation: _explanation, ...publicQ } = q;
        return publicQ as any;
      });

      const sanitizedSet: PracticeSet = { ...setItem, questions: sanitizedQuestions };
      const updatedAssignment = { ...assignment, status: currentAssignmentStatus };

      if (currentAssignmentStatus === 'COMPLETED') {
        completedTasks.push({ practiceSet: sanitizedSet, assignment: updatedAssignment });
      } else {
        activeTasks.push({ practiceSet: sanitizedSet, assignment: updatedAssignment });
      }
    });

    return { activeTasks, completedTasks };
  }

  // 6. Save one student answer
  public static async submitStudentAnswer(
    practiceSetId: string,
    studentId: string,
    questionId: string,
    answer: string
  ): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      const authUid = await this.ensureStudentAuth();
      const progressRef = doc(db, 'practiceSets', practiceSetId, 'studentProgress', studentId);
      const progressSnap = await getDoc(progressRef);
      if (!progressSnap.exists()) throw new Error('Không tìm thấy nhiệm vụ của học sinh.');

      const progress = progressSnap.data() as StudentProgress;
      if (progress.status === 'COMPLETED' || progress.status === 'EXPIRED') return false;
      if (progress.authUid && progress.authUid !== authUid) {
        throw new Error('Bài ôn này đang được gắn với một phiên học sinh khác.');
      }

      const now = new Date().toISOString();
      const nextProgress: StudentProgress = {
        ...progress,
        authUid,
        status: progress.status === 'NOT_STARTED' ? 'IN_PROGRESS' : progress.status,
        startedAt: progress.startedAt || now,
      };
      const subId = `${questionId}_${studentId}`;
      const submission: PracticeSubmission & { authUid: string } = {
        id: subId,
        questionId,
        studentId,
        authUid,
        answer: answer.trim(),
        submittedAt: now,
        attemptNumber: (progress.attemptCount || 0) + 1,
      };

      const batch = writeBatch(db);
      batch.set(progressRef, nextProgress, { merge: true });
      batch.set(doc(db, 'practiceSets', practiceSetId, 'responses', subId), submission, { merge: true });
      await batch.commit();
      return true;
    }

    const sets = this.loadLocalPracticeSets();
    const setItem = sets.find((s) => s.id === practiceSetId);
    if (!setItem) return false;
    const assignment = setItem.assignments?.[studentId];
    if (!assignment || assignment.status === 'COMPLETED') return false;
    if (assignment.status === 'NOT_STARTED') {
      assignment.status = 'IN_PROGRESS';
      assignment.startedAt = new Date().toISOString();
    }
    if (!setItem.responses) setItem.responses = {};
    const subId = `${questionId}_${studentId}`;
    setItem.responses[subId] = {
      id: subId,
      questionId,
      studentId,
      answer: answer.trim(),
      submittedAt: new Date().toISOString(),
      attemptNumber: (assignment.attemptCount || 0) + 1,
    };
    this.saveLocalPracticeSets(sets);
    return true;
  }

  // 7. Complete assignment
  public static async completeStudentAssignment(
    practiceSetId: string,
    studentId: string
  ): Promise<{ score: number; correctCount: number; totalCount: number }> {
    if (isFirebaseConfigured && db) {
      const authUid = await this.ensureStudentAuth();
      const [setSnap, progressSnap, responsesSnap] = await Promise.all([
        getDoc(doc(db, 'practiceSets', practiceSetId)),
        getDoc(doc(db, 'practiceSets', practiceSetId, 'studentProgress', studentId)),
        getDocs(
          query(
            collection(db, 'practiceSets', practiceSetId, 'responses'),
            where('authUid', '==', authUid)
          )
        ),
      ]);

      if (!setSnap.exists()) throw new Error('Bài ôn không tồn tại.');
      if (!progressSnap.exists()) throw new Error('Không tìm thấy nhiệm vụ của học sinh.');

      const setItem = { ...(setSnap.data() as PracticeSet), id: setSnap.id };
      const progress = progressSnap.data() as StudentProgress;
      if (progress.authUid && progress.authUid !== authUid) {
        throw new Error('Bài ôn này đang được gắn với một phiên học sinh khác.');
      }

      const ownResponses = responsesSnap.docs
        .map((d) => d.data() as PracticeSubmission & { authUid?: string })
        .filter((r) => r.studentId === studentId);

      let correctCount = 0;
      const batch = writeBatch(db);
      setItem.questions.forEach((q) => {
        const response = ownResponses.find((r) => r.questionId === q.id);
        if (!response) return;
        const isCorrect =
          response.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        if (isCorrect) correctCount++;
        batch.set(
          doc(db!, 'practiceSets', practiceSetId, 'responses', response.id),
          { isCorrect },
          { merge: true }
        );
      });

      const totalCount = setItem.questions.length;
      const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      const now = new Date().toISOString();
      batch.set(
        doc(db, 'practiceSets', practiceSetId, 'studentProgress', studentId),
        {
          authUid,
          status: 'COMPLETED',
          completedAt: now,
          score,
          correctCount,
          totalQuestions: totalCount,
          attemptCount: (progress.attemptCount || 0) + 1,
        },
        { merge: true }
      );
      await batch.commit();
      return { score, correctCount, totalCount };
    }

    const sets = this.loadLocalPracticeSets();
    const setItem = sets.find((s) => s.id === practiceSetId);
    if (!setItem) throw new Error('Bài ôn không tồn tại');
    const assignment = setItem.assignments?.[studentId];
    if (!assignment) throw new Error('Không tìm thấy nhiệm vụ của học sinh');

    let correctCount = 0;
    const totalCount = setItem.questions.length;
    setItem.questions.forEach((q) => {
      const subId = `${q.id}_${studentId}`;
      const sub = setItem.responses?.[subId];
      if (sub) {
        const isCorr = sub.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        sub.isCorrect = isCorr;
        if (isCorr) correctCount++;
      }
    });

    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    assignment.status = 'COMPLETED';
    assignment.completedAt = new Date().toISOString();
    assignment.score = score;
    assignment.correctCount = correctCount;
    assignment.totalQuestions = totalCount;
    assignment.attemptCount = (assignment.attemptCount || 0) + 1;
    this.saveLocalPracticeSets(sets);
    return { score, correctCount, totalCount };
  }

  // 8. Archive
  public static async archivePracticeSet(practiceSetId: string, archived: boolean): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'practiceSets', practiceSetId), { archived });
      return true;
    }

    const sets = this.loadLocalPracticeSets();
    const item = sets.find((s) => s.id === practiceSetId);
    if (!item) return false;
    item.archived = archived;
    this.saveLocalPracticeSets(sets);
    return true;
  }
}
