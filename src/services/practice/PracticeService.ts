import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { PracticeSet, PracticeAssignment, PracticeSubmission } from './types';
import { INITIAL_MOCK_PRACTICE_SETS } from './mockPracticeData';

const LOCAL_PRACTICE_KEY = 'lhtt_practice_sets';

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

  // 1. Create Practice Set (Draft / Ready)
  public static async createPracticeSet(params: Omit<PracticeSet, 'id' | 'createdAt' | 'assignments' | 'responses'>): Promise<PracticeSet> {
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

    if (db) {
      try {
        const pRef = doc(db, 'practiceSets', id);
        await setDoc(pRef, newSet);
      } catch (err) {
        console.warn('Firestore practice save failed, using local storage', err);
      }
    }

    const sets = this.loadLocalPracticeSets();
    sets.unshift(newSet);
    this.saveLocalPracticeSets(sets);

    return newSet;
  }

  // 2. Assign Practice Set to selected Students / Whole Class
  public static async assignPracticeSet(
    practiceSetId: string,
    targetStudents: { id: string; name: string }[],
    dueAt?: string
  ): Promise<boolean> {
    const sets = this.loadLocalPracticeSets();
    const setItem = sets.find((s) => s.id === practiceSetId);
    if (!setItem) return false;

    const now = new Date().toISOString();
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

    if (db) {
      try {
        const pRef = doc(db, 'practiceSets', practiceSetId);
        await updateDoc(pRef, {
          status: 'ASSIGNED',
          assignedAt: now,
          dueAt: dueAt || null,
          assignments: setItem.assignments,
        });
      } catch (err) {
        console.warn('Firestore assignment update failed', err);
      }
    }

    this.saveLocalPracticeSets(sets);
    return true;
  }

  // 3. Get Teacher Practice List
  public static async getTeacherPracticeSets(
    classId?: string,
    subject?: string,
    showArchived: boolean = false
  ): Promise<PracticeSet[]> {
    let sets: PracticeSet[] = [];

    if (db) {
      try {
        const q = query(collection(db, 'practiceSets'));
        const snap = await getDocs(q);
        sets = snap.docs.map((d) => d.data() as PracticeSet);
      } catch {
        sets = this.loadLocalPracticeSets();
      }
    } else {
      sets = this.loadLocalPracticeSets();
    }

    if (classId) sets = sets.filter((s) => s.classId === classId);
    if (subject && subject !== 'ALL') sets = sets.filter((s) => s.subject === subject);
    if (!showArchived) sets = sets.filter((s) => !s.archived);

    sets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sets;
  }

  // 4. Get Practice Set Detail (For Teacher Monitor & Editor)
  public static async getPracticeSetDetail(practiceSetId: string): Promise<PracticeSet | null> {
    if (db) {
      try {
        const pRef = doc(db, 'practiceSets', practiceSetId);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          return pSnap.data() as PracticeSet;
        }
      } catch {
        // Fallback to local
      }
    }

    const sets = this.loadLocalPracticeSets();
    return sets.find((s) => s.id === practiceSetId) || null;
  }

  // 5. Get Assigned Tasks for Student (Secured Payload - Hides Answer Key before Finish)
  public static async getStudentAssignments(studentId: string): Promise<{
    activeTasks: { practiceSet: PracticeSet; assignment: PracticeAssignment }[];
    completedTasks: { practiceSet: PracticeSet; assignment: PracticeAssignment }[];
  }> {
    const sets = await this.getTeacherPracticeSets(undefined, undefined, false);
    const activeTasks: { practiceSet: PracticeSet; assignment: PracticeAssignment }[] = [];
    const completedTasks: { practiceSet: PracticeSet; assignment: PracticeAssignment }[] = [];

    const now = new Date().toISOString();

    sets.forEach((setItem) => {
      const assignment = setItem.assignments?.[studentId];
      if (!assignment) return;

      // Check Expiration
      let currentAssignmentStatus = assignment.status;
      if (setItem.dueAt && now > setItem.dueAt && currentAssignmentStatus !== 'COMPLETED') {
        currentAssignmentStatus = 'EXPIRED';
      }

      // Hide private answers during active test taking
      const sanitizedQuestions = setItem.questions.map((q) => {
        if (currentAssignmentStatus === 'COMPLETED' && setItem.feedbackMode !== 'TEACHER_ONLY') {
          return q;
        }
        const { correctAnswer, explanation, ...publicQ } = q;
        return publicQ as any;
      });

      const sanitizedSet: PracticeSet = {
        ...setItem,
        questions: sanitizedQuestions,
      };

      const updatedAssignment = { ...assignment, status: currentAssignmentStatus };

      if (currentAssignmentStatus === 'COMPLETED') {
        completedTasks.push({ practiceSet: sanitizedSet, assignment: updatedAssignment });
      } else {
        activeTasks.push({ practiceSet: sanitizedSet, assignment: updatedAssignment });
      }
    });

    return { activeTasks, completedTasks };
  }

  // 6. Submit Answer for Student (One Question / Step)
  public static async submitStudentAnswer(
    practiceSetId: string,
    studentId: string,
    questionId: string,
    answer: string
  ): Promise<boolean> {
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
    const submission: PracticeSubmission = {
      id: subId,
      questionId,
      studentId,
      answer: answer.trim(),
      submittedAt: new Date().toISOString(),
      attemptNumber: (assignment.attemptCount || 0) + 1,
    };

    setItem.responses[subId] = submission;

    if (db) {
      try {
        const pRef = doc(db, 'practiceSets', practiceSetId);
        await updateDoc(pRef, {
          [`assignments.${studentId}`]: assignment,
          [`responses.${subId}`]: submission,
        });
      } catch (err) {
        console.warn('Firestore answer submit failed', err);
      }
    }

    this.saveLocalPracticeSets(sets);
    return true;
  }

  // 7. Complete Student Practice Assignment
  public static async completeStudentAssignment(
    practiceSetId: string,
    studentId: string
  ): Promise<{ score: number; correctCount: number; totalCount: number }> {
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

    const score = Math.round((correctCount / totalCount) * 100);
    const now = new Date().toISOString();

    assignment.status = 'COMPLETED';
    assignment.completedAt = now;
    assignment.score = score;
    assignment.correctCount = correctCount;
    assignment.totalQuestions = totalCount;
    assignment.attemptCount = (assignment.attemptCount || 0) + 1;

    if (db) {
      try {
        const pRef = doc(db, 'practiceSets', practiceSetId);
        await updateDoc(pRef, {
          [`assignments.${studentId}`]: assignment,
          responses: setItem.responses,
        });
      } catch (err) {
        console.warn('Firestore assignment complete update failed', err);
      }
    }

    this.saveLocalPracticeSets(sets);
    return { score, correctCount, totalCount };
  }

  // 8. Archive Practice Set
  public static async archivePracticeSet(practiceSetId: string, archived: boolean): Promise<boolean> {
    const sets = this.loadLocalPracticeSets();
    const item = sets.find((s) => s.id === practiceSetId);
    if (item) {
      item.archived = archived;
      this.saveLocalPracticeSets(sets);
    }

    if (db) {
      try {
        const pRef = doc(db, 'practiceSets', practiceSetId);
        await updateDoc(pRef, { archived });
      } catch {}
    }

    return true;
  }
}
