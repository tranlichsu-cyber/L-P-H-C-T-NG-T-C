import {SelfPracticeService} from '../services/selfPractice/SelfPracticeService';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {loadVisibleClasses,loadVisibleQuizzes} from '../services/data/teacherQueries';
import {useLocation} from 'react-router-dom';
import type { ClassGroup, Student, Quiz, Question } from '../types';
import { INITIAL_CLASSES } from '../data/mockClasses';
import { INITIAL_QUIZZES } from '../data/mockQuizzes';
import { normalizeVietnameseText } from '../utils/normalizeVietnamese';
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc, writeBatch, runTransaction } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase/firebase';
import { useAuth } from './AuthContext';
import { SchoolService } from '../services/school/SchoolService';
import {
  isFirestoreTemporarilyExhausted,
  isQuotaExceededError,
  markFirestoreQuotaExceeded,
} from '../services/qr/cloudRoomRelay';

interface BulkAddResult {
  addedCount: number;
  duplicateNames: string[];
}

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

interface TeacherDataContextType {
  classes: ClassGroup[];
  quizzes: Quiz[];
  
  // Class Actions
  addClass: (name: string, grade: string) => Promise<ClassGroup>;
  updateClass: (classId: string, name: string, grade: string) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;

  // Student Actions
  addStudent: (classId: string, studentName: string) => Promise<boolean>;
  bulkAddStudents: (classId: string, studentNames: string[]) => Promise<BulkAddResult>;
  updateStudent: (classId: string, studentId: string, newName: string) => Promise<void>;
  deleteStudent: (classId: string, studentId: string) => Promise<void>;

  // Quiz Actions
  addQuiz: (title: string, subject: string, grade: string, visibility?: 'PRIVATE' | 'TEAM' | 'SCHOOL', teamId?: string) => Promise<Quiz>;
  updateQuiz: (quizId: string, title: string, subject: string, grade: string, visibility?: 'PRIVATE' | 'TEAM' | 'SCHOOL', teamId?: string) => Promise<void>;
  updateQuizVisibility: (quizId: string, visibility: 'PRIVATE' | 'TEAM' | 'SCHOOL', teamId?: string) => Promise<void>;
  duplicateQuiz: (quizId: string) => Promise<Quiz>;
  deleteQuiz: (quizId: string) => Promise<void>;

  // Question Actions
  addQuestion: (quizId: string, questionData: Omit<Question, 'id'>) => Promise<void>;
  addQuestions: (quizId: string, questions: Omit<Question, 'id'>[]) => Promise<void>;
  updateQuestion: (quizId: string, questionId: string, questionData: Omit<Question, 'id'>) => Promise<void>;
  duplicateQuestion: (quizId: string, questionId: string) => Promise<void>;
  deleteQuestion: (quizId: string, questionId: string) => Promise<void>;
  moveQuestion: (quizId: string, questionId: string, direction: 'up' | 'down') => Promise<void>;
}

const TeacherDataContext = createContext<TeacherDataContextType | undefined>(undefined);

const CLASSES_CACHE_PREFIX = 'lhtt_teacher_classes_v1_';
const QUIZZES_CACHE_PREFIX = 'lhtt_teacher_quizzes_v1_';
const TEACHER_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function readCachedTeacherList<T>(prefix: string, uid: string): { items: T[]; savedAt: number } | null {
  if (!uid) return null;
  try {
    const raw = localStorage.getItem(prefix + uid);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { items?: T[]; savedAt?: number };
    if (Array.isArray(parsed?.items)) {
      return { items: parsed.items, savedAt: Number(parsed.savedAt) || 0 };
    }
  } catch {
    // Ignore
  }
  return null;
}

function writeCachedTeacherList<T>(prefix: string, uid: string, items: T[]): void {
  if (!uid) return;
  try {
    localStorage.setItem(prefix + uid, JSON.stringify({ items, savedAt: Date.now() }));
  } catch {
    // Ignore storage quota
  }
}

export const TeacherDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, authReady, isTeacherAuthenticated } = useAuth();
  const [classes, setClasses] = useState<ClassGroup[]>(
    isFirebaseConfigured ? [] : INITIAL_CLASSES
  );
  const { pathname } = useLocation();
  const isLiveRoomRoute =
    /^\/teacher\/qr-cards\/(?!bank(?:\/|$))[^/]+/.test(pathname) ||
    /^\/teacher\/room\/[^/]+/.test(pathname);
  const needsTeacherData =
    (pathname === '/teacher' || pathname.startsWith('/teacher/')) && !isLiveRoomRoute;
  const loadedUid = useRef('');
  const [loadedForUid, setLoadedForUid] = useState<string>('');
  const loadedAt = useRef(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>(
    isFirebaseConfigured ? [] : INITIAL_QUIZZES
  );

  useEffect(() => {
    if (!isFirebaseConfigured || !currentUser?.uid || loadedUid.current !== currentUser.uid) return;
    if (classes.length > 0) writeCachedTeacherList(CLASSES_CACHE_PREFIX, currentUser.uid, classes);
  }, [classes, currentUser?.uid]);

  useEffect(() => {
    if (!isFirebaseConfigured || !currentUser?.uid || loadedUid.current !== currentUser.uid) return;
    if (quizzes.length > 0) writeCachedTeacherList(QUIZZES_CACHE_PREFIX, currentUser.uid, quizzes);
  }, [quizzes, currentUser?.uid]);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    if (!authReady) return;

    if (!isTeacherAuthenticated || !currentUser?.uid) {
      loadedUid.current = ''; setLoadedForUid('');
      setClasses([]);
      setQuizzes([]);
      return;
    }

    const uid = currentUser.uid;
    const cachedClasses = readCachedTeacherList<ClassGroup>(CLASSES_CACHE_PREFIX, uid);
    const cachedQuizzes = readCachedTeacherList<Quiz>(QUIZZES_CACHE_PREFIX, uid);

    // Hydrate immediately from localStorage cache if available
    if (loadedUid.current !== uid && (cachedClasses?.items.length || cachedQuizzes?.items.length)) {
      loadedUid.current = uid; setLoadedForUid(uid); setLoadedForUid(uid);
      loadedAt.current = Math.min(cachedClasses?.savedAt || 0, cachedQuizzes?.savedAt || 0);
      setClasses(cachedClasses?.items?.length ? cachedClasses.items : INITIAL_CLASSES);
      setQuizzes(cachedQuizzes?.items?.length ? cachedQuizzes.items : INITIAL_QUIZZES);
    }

    if (!needsTeacherData) return;

    const cacheFresh =
      loadedUid.current === uid &&
      Date.now() - loadedAt.current < TEACHER_CACHE_TTL_MS &&
      classes.length > 0;
    if (cacheFresh) return;

    if (isFirestoreTemporarilyExhausted()) {
      loadedUid.current = uid; setLoadedForUid(uid);
      loadedAt.current = Date.now();
      setClasses(cachedClasses?.items?.length ? cachedClasses.items : INITIAL_CLASSES);
      setQuizzes(cachedQuizzes?.items?.length ? cachedQuizzes.items : INITIAL_QUIZZES);
      return;
    }

    const firestore = db;
    let cancelled = false;

    const loadRealTeacherData = async () => {
      try {
        const profile = await SchoolService.getUser(uid);
        if (!profile || profile.status !== 'ACTIVE') {
          if (!cancelled) {
            setClasses(cachedClasses?.items?.length ? cachedClasses.items : INITIAL_CLASSES);
            setQuizzes(cachedQuizzes?.items?.length ? cachedQuizzes.items : INITIAL_QUIZZES);
          }
          return;
        }

        if (!sessionStorage.getItem(`lhtt_reward_banks_${uid}`)) {
          sessionStorage.setItem(`lhtt_reward_banks_${uid}`, '1');
          void SelfPracticeService.ensureRewardBanks().catch(error =>
            console.warn('Chưa khởi tạo được đề đối chiếu huy hiệu.', error)
          );
        }
        const isAdmin = profile.role === 'SCHOOL_ADMIN';

        const classSnap = await loadVisibleClasses(firestore, uid, isAdmin);
        const legacyClassIds = new Set(['class-4a', 'class-4b', 'class-5a']);
        const visibleClassDocs = classSnap.docs.filter((classDoc) => {
          if (legacyClassIds.has(classDoc.id)) return false;
          if (isAdmin) return true;
          const data = classDoc.data() as { teacherId?: string; coTeacherIds?: string[] };
          return data.teacherId === uid || (data.coTeacherIds || []).includes(uid);
        });

        const realClasses = await Promise.all(
          visibleClassDocs.map(async (classDoc) => {
            const data = classDoc.data() as Partial<ClassGroup> & { className?: string };
            const studentsSnap = await getDocs(
              collection(firestore, 'classes', classDoc.id, 'students')
            );
            const students = studentsSnap.docs.map((studentDoc) => ({
              id: studentDoc.id,
              ...(studentDoc.data() as Omit<Student, 'id'>),
            }));

            return {
              id: classDoc.id,
              teacherId: data.teacherId,
              coTeacherIds: data.coTeacherIds || [],
              name: data.name || data.className || 'Lớp chưa đặt tên',
              grade: data.grade || '',
              studentCount: students.length,
              students,
              createdAt: data.createdAt || '',
            } as ClassGroup;
          })
        );

        const quizSnap = await loadVisibleQuizzes(firestore, uid, isAdmin, profile.teamIds || []);
        const legacyQuizIds = new Set(['quiz-1', 'quiz-2', 'quiz-3']);
        const visibleQuizDocs = quizSnap.docs.filter((quizDoc) => {
          if (legacyQuizIds.has(quizDoc.id)) return false;
          if (isAdmin) return true;

          const data = quizDoc.data() as {
            teacherId?: string;
            visibility?: 'PRIVATE' | 'TEAM' | 'SCHOOL';
            teamId?: string;
          };

          if (data.teacherId === uid) return true;
          if (data.visibility === 'SCHOOL') return true;
          if (data.visibility === 'TEAM' && data.teamId) {
            return (profile.teamIds || []).includes(data.teamId);
          }
          return false;
        });

        const realQuizzes = await Promise.all(
          visibleQuizDocs.map(async (quizDoc) => {
            const data = quizDoc.data() as Partial<Quiz>;
            const questionsSnap = await getDocs(
              collection(firestore, 'quizzes', quizDoc.id, 'questions')
            );
            const questions = questionsSnap.docs
              .map((questionDoc) => ({
                id: questionDoc.id,
                ...(questionDoc.data() as Omit<Question, 'id'> & { order?: number }),
              }))
              .sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999));

            return {
              id: quizDoc.id,
              teacherId: data.teacherId,
              title: data.title || 'Bộ câu hỏi chưa đặt tên',
              subject: data.subject || '',
              grade: data.grade || '',
              questionCount: questions.length,
              questions,
              createdAt: data.createdAt || '',
              visibility: data.visibility || 'PRIVATE',
              teamId: data.teamId,
            } as Quiz;
          })
        );

        if (!cancelled) {
          loadedUid.current = uid; setLoadedForUid(uid);
          loadedAt.current = Date.now();
          const finalClasses = realClasses.length > 0 ? realClasses : cachedClasses?.items || [];
          const finalQuizzes = realQuizzes.length > 0 ? realQuizzes : cachedQuizzes?.items || [];
          setClasses(finalClasses);
          setQuizzes(finalQuizzes);
          if (finalClasses.length > 0) writeCachedTeacherList(CLASSES_CACHE_PREFIX, uid, finalClasses);
          if (finalQuizzes.length > 0) writeCachedTeacherList(QUIZZES_CACHE_PREFIX, uid, finalQuizzes);
        }
      } catch (error) {
        if (isQuotaExceededError(error)) {
          markFirestoreQuotaExceeded();
        }
        console.warn('Tạm dùng dữ liệu lớp/bộ câu hỏi đã lưu cục bộ:', error);
        if (!cancelled) {
          loadedUid.current = uid; setLoadedForUid(uid);
          loadedAt.current = Date.now();
          setClasses((prev) =>
            prev.length > 0
              ? prev
              : cachedClasses?.items?.length
                ? cachedClasses.items
                : INITIAL_CLASSES
          );
          setQuizzes((prev) =>
            prev.length > 0
              ? prev
              : cachedQuizzes?.items?.length
                ? cachedQuizzes.items
                : INITIAL_QUIZZES
          );
        }
      }
    };

    void loadRealTeacherData();

    return () => {
      cancelled = true;
    };
  }, [authReady, isTeacherAuthenticated, currentUser?.uid, needsTeacherData]);

  // --- CLASS ACTIONS ---
  const addClass = async (name: string, grade: string): Promise<ClassGroup> => {
    const now = new Date().toISOString();
    const newClass: ClassGroup = {
      id: `class-${Date.now()}`,
      teacherId: auth?.currentUser?.uid,
      coTeacherIds: [],
      name: name.trim(),
      grade,
      studentCount: 0,
      students: [],
      createdAt: now,
    };

    if (isFirebaseConfigured && db) {
      const teacherId = auth?.currentUser?.uid;
      if (!teacherId) {
        throw new Error('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại trước khi tạo lớp.');
      }

      await setDoc(doc(db, 'classes', newClass.id), {
        teacherId,
        coTeacherIds: [],
        className: newClass.name,
        name: newClass.name,
        grade: newClass.grade,
        studentCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    setClasses((prev) => [newClass, ...prev]);
    return newClass;
  };

  const updateClass = async (classId: string, name: string, grade: string): Promise<void> => {
    const cleanName = name.trim();
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'classes', classId), {
        className: cleanName,
        name: cleanName,
        grade,
        updatedAt: new Date().toISOString(),
      });
    }

    setClasses((prev) =>
      prev.map((cls) => (cls.id === classId ? { ...cls, name: cleanName, grade } : cls))
    );
  };

  const deleteClass = async (classId: string): Promise<void> => {
    if (isFirebaseConfigured && db) {
      const studentsSnap = await getDocs(collection(db, 'classes', classId, 'students'));
      const batch = writeBatch(db);
      studentsSnap.docs.forEach((studentDoc) => batch.delete(studentDoc.ref));
      batch.delete(doc(db, 'classes', classId));
      await batch.commit();
    }

    setClasses((prev) => prev.filter((cls) => cls.id !== classId));
  };

  // --- STUDENT ACTIONS ---
  const addStudent = async (classId: string, studentName: string): Promise<boolean> => {
    const trimmed = studentName.trim();
    if (!trimmed) return false;

    const targetClass = classes.find((cls) => cls.id === classId);
    if (!targetClass) throw new Error('Không tìm thấy lớp học.');

    const normalizedNew = normalizeVietnameseText(trimmed);
    const exists = targetClass.students.some(
      (s) => normalizeVietnameseText(s.name) === normalizedNew
    );
    if (exists) return false;

    const newStudent: Student = {
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: trimmed,
      studentCode: `${targetClass.name.replace(/\s+/g, '')}-${targetClass.students.length + 1}`,
    };
    const nextCount = targetClass.students.length + 1;

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'classes', classId, 'students', newStudent.id), {
        ...newStudent,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'classes', classId), {
        studentCount: nextCount,
        updatedAt: new Date().toISOString(),
      });
    }

    setClasses((prev) =>
      prev.map((cls) =>
        cls.id === classId
          ? { ...cls, students: [...cls.students, newStudent], studentCount: nextCount }
          : cls
      )
    );

    return true;
  };

  const bulkAddStudents = async (
    classId: string,
    studentNames: string[]
  ): Promise<BulkAddResult> => {
    const targetClass = classes.find((cls) => cls.id === classId);
    if (!targetClass) throw new Error('Không tìm thấy lớp học.');

    const existingNormalized = new Set(
      targetClass.students.map((s) => normalizeVietnameseText(s.name))
    );
    const duplicateNames: string[] = [];
    const newStudents: Student[] = [];

    studentNames.forEach((name, index) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const norm = normalizeVietnameseText(trimmed);
      if (existingNormalized.has(norm)) {
        duplicateNames.push(trimmed);
        return;
      }
      existingNormalized.add(norm);
      newStudents.push({
        id: `std-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`,
        name: trimmed,
        studentCode: `${targetClass.name.replace(/\s+/g, '')}-${targetClass.students.length + newStudents.length + 1}`,
      });
    });

    if (newStudents.length === 0) {
      return { addedCount: 0, duplicateNames };
    }

    const nextCount = targetClass.students.length + newStudents.length;

    if (isFirebaseConfigured && db) {
      const firestore = db;
      const batch = writeBatch(firestore);
      newStudents.forEach((student) => {
        batch.set(doc(firestore, 'classes', classId, 'students', student.id), {
          ...student,
          createdAt: new Date().toISOString(),
        });
      });
      batch.update(doc(firestore, 'classes', classId), {
        studentCount: nextCount,
        updatedAt: new Date().toISOString(),
      });
      await batch.commit();
    }

    setClasses((prev) =>
      prev.map((cls) =>
        cls.id === classId
          ? {
              ...cls,
              students: [...cls.students, ...newStudents],
              studentCount: nextCount,
            }
          : cls
      )
    );

    return { addedCount: newStudents.length, duplicateNames };
  };

  const updateStudent = async (
    classId: string,
    studentId: string,
    newName: string
  ): Promise<void> => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'classes', classId, 'students', studentId), {
        name: trimmed,
        updatedAt: new Date().toISOString(),
      });
    }

    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id !== classId) return cls;
        return {
          ...cls,
          students: cls.students.map((s) => (s.id === studentId ? { ...s, name: trimmed } : s)),
        };
      })
    );
  };

  const deleteStudent = async (classId: string, studentId: string): Promise<void> => {
    const targetClass = classes.find((cls) => cls.id === classId);
    if (!targetClass) throw new Error('Không tìm thấy lớp học.');
    const nextCount = Math.max(0, targetClass.students.length - 1);

    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'classes', classId, 'students', studentId));
      await updateDoc(doc(db, 'classes', classId), {
        studentCount: nextCount,
        updatedAt: new Date().toISOString(),
      });
    }

    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id !== classId) return cls;
        const updated = cls.students.filter((s) => s.id !== studentId);
        return { ...cls, students: updated, studentCount: updated.length };
      })
    );
  };

  // --- QUIZ ACTIONS ---
  const addQuiz = async (
    title: string,
    subject: string,
    grade: string,
    visibility: 'PRIVATE' | 'TEAM' | 'SCHOOL' = 'PRIVATE',
    teamId?: string
  ): Promise<Quiz> => {
    const teacherId = auth?.currentUser?.uid;
    if (isFirebaseConfigured && db && !teacherId) {
      throw new Error('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại trước khi tạo bộ câu hỏi.');
    }

    const now = new Date().toISOString();
    const newQuiz: Quiz = {
      id: `quiz-${crypto.randomUUID()}`,
      teacherId,
      title: title.trim(),
      subject,
      grade,
      questionCount: 0,
      questions: [],
      createdAt: now,
      visibility,
      teamId,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'quizzes', newQuiz.id), {
        teacherId,
        title: newQuiz.title,
        subject,
        grade,
        questionCount: 0,
        visibility,
        teamId: teamId || null,
        createdAt: now,
        updatedAt: now,
      });
    }

    setQuizzes((prev) => [newQuiz, ...prev]);
    return newQuiz;
  };

  const updateQuiz = async (
    quizId: string,
    title: string,
    subject: string,
    grade: string,
    visibility?: 'PRIVATE' | 'TEAM' | 'SCHOOL',
    teamId?: string
  ): Promise<void> => {
    const target = quizzes.find((q) => q.id === quizId);
    if (!target) throw new Error('Không tìm thấy bộ câu hỏi.');
    const nextVisibility = visibility || target.visibility || 'PRIVATE';
    const nextTeamId = teamId !== undefined ? teamId : target.teamId;

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'quizzes', quizId), {
        title: title.trim(),
        subject,
        grade,
        visibility: nextVisibility,
        teamId: nextTeamId || null,
        updatedAt: new Date().toISOString(),
      });
    }

    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? { ...q, title: title.trim(), subject, grade, visibility: nextVisibility, teamId: nextTeamId }
          : q
      )
    );
  };

  const updateQuizVisibility = async (
    quizId: string,
    visibility: 'PRIVATE' | 'TEAM' | 'SCHOOL',
    teamId?: string
  ): Promise<void> => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'quizzes', quizId), {
        visibility,
        teamId: teamId || null,
        updatedAt: new Date().toISOString(),
      });
    }
    setQuizzes((prev) => prev.map((q) => (q.id === quizId ? { ...q, visibility, teamId } : q)));
  };

  const duplicateQuiz = async (quizId: string): Promise<Quiz> => {
    const original = quizzes.find((q) => q.id === quizId);
    if (!original) throw new Error('Không tìm thấy bộ câu hỏi.');

    const teacherId = auth?.currentUser?.uid;
    if (isFirebaseConfigured && db && !teacherId) throw new Error('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.');

    const now = new Date().toISOString();
    const copy: Quiz = {
      ...original,
      id: `quiz-${Date.now()}`,
      teacherId,
      title: `${original.title} (Bản sao)`,
      createdAt: now,
      questions: original.questions.map((question, index) => ({
        ...question,
        id: `q-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`,
      })),
    };
    copy.questionCount = copy.questions.length;

    if (isFirebaseConfigured && db) {
      const firestore = db;
      const batch = writeBatch(firestore);
      batch.set(doc(firestore, 'quizzes', copy.id), {
        teacherId,
        title: copy.title,
        subject: copy.subject,
        grade: copy.grade,
        questionCount: copy.questionCount,
        visibility: copy.visibility || 'PRIVATE',
        teamId: copy.teamId || null,
        createdAt: now,
        updatedAt: now,
      });
      copy.questions.forEach((question, index) => {
        batch.set(
          doc(firestore, 'quizzes', copy.id, 'questions', question.id),
          sanitizeFirestoreData({
            ...question,
            order: index,
            createdAt: now,
            updatedAt: now,
          })
        );
      });
      await batch.commit();
    }

    setQuizzes((prev) => [copy, ...prev]);
    return copy;
  };

  const deleteQuiz = async (quizId: string): Promise<void> => {
    if (isFirebaseConfigured && db) {
      const firestore = db;
      const questionsSnap = await getDocs(collection(firestore, 'quizzes', quizId, 'questions'));
      const batch = writeBatch(firestore);
      questionsSnap.docs.forEach((questionDoc) => batch.delete(questionDoc.ref));
      batch.delete(doc(firestore, 'quizzes', quizId));
      await batch.commit();
    }
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  // --- QUESTION ACTIONS ---
  // Import copies in one atomic transaction; existing questions stay unchanged.
  const addQuestions = async (quizId: string, items: Omit<Question, 'id'>[]): Promise<void> => {
    if (!items.length) return;
    if (items.length > 400) throw new Error('Mỗi lần thêm tối đa 400 câu hỏi.');
    const now = new Date().toISOString();
    const added = items.map((item) => ({ ...item, id: crypto.randomUUID() }));
    if (isFirebaseConfigured && db) {
      const firestore = db;
      await runTransaction(firestore, async (transaction) => {
        const quizRef = doc(firestore, 'quizzes', quizId);
        const snapshot = await transaction.get(quizRef);
        if (!snapshot.exists()) throw new Error('Bộ câu hỏi đã bị xoá.');
        const count = snapshot.data().questionCount ?? 0;
        added.forEach((item, index) => transaction.set(
          doc(firestore, 'quizzes', quizId, 'questions', item.id),
          sanitizeFirestoreData({ ...item, order: count + index, createdAt: now, updatedAt: now })
        ));
        transaction.update(quizRef, { questionCount: count + added.length, updatedAt: now });
      });
    }
    setQuizzes((prev) => prev.map((quiz) => quiz.id === quizId
      ? { ...quiz, questions: [...quiz.questions, ...added], questionCount: quiz.questions.length + added.length }
      : quiz));
  };

  const addQuestion = (quizId: string, questionData: Omit<Question, 'id'>): Promise<void> =>
    addQuestions(quizId, [questionData]);

  const updateQuestion = async (
    quizId: string,
    questionId: string,
    questionData: Omit<Question, 'id'>
  ): Promise<void> => {
    if (isFirebaseConfigured && db) {
      await updateDoc(
        doc(db, 'quizzes', quizId, 'questions', questionId),
        sanitizeFirestoreData({
          ...questionData,
          updatedAt: new Date().toISOString(),
        })
      );
    }

    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id !== quizId) return quiz;
        return {
          ...quiz,
          questions: quiz.questions.map((q) =>
            q.id === questionId ? { ...questionData, id: questionId } : q
          ),
        };
      })
    );
  };

  const duplicateQuestion = async (quizId: string, questionId: string): Promise<void> => {
    const targetQuiz = quizzes.find((quiz) => quiz.id === quizId);
    if (!targetQuiz) throw new Error('Không tìm thấy bộ câu hỏi.');
    const index = targetQuiz.questions.findIndex((q) => q.id === questionId);
    if (index === -1) throw new Error('Không tìm thấy câu hỏi.');

    const now = new Date().toISOString();
    const copy: Question = {
      ...targetQuiz.questions[index],
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      content: `${targetQuiz.questions[index].content} (Bản sao)`,
    };
    const updated = [...targetQuiz.questions];
    updated.splice(index + 1, 0, copy);

    if (isFirebaseConfigured && db) {
      const firestore = db;
      const batch = writeBatch(firestore);
      updated.forEach((question, order) => {
        batch.set(
          doc(firestore, 'quizzes', quizId, 'questions', question.id),
          sanitizeFirestoreData({ ...question, order, updatedAt: now }),
          { merge: true }
        );
      });
      batch.update(doc(firestore, 'quizzes', quizId), {
        questionCount: updated.length,
        updatedAt: now,
      });
      await batch.commit();
    }

    setQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId ? { ...quiz, questions: updated, questionCount: updated.length } : quiz
      )
    );
  };

  const deleteQuestion = async (quizId: string, questionId: string): Promise<void> => {
    const targetQuiz = quizzes.find((quiz) => quiz.id === quizId);
    if (!targetQuiz) throw new Error('Không tìm thấy bộ câu hỏi.');

    const updated = targetQuiz.questions.filter((q) => q.id !== questionId);
    const now = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      const firestore = db;
      const batch = writeBatch(firestore);
      batch.delete(doc(firestore, 'quizzes', quizId, 'questions', questionId));
      updated.forEach((question, order) => {
        batch.set(
          doc(firestore, 'quizzes', quizId, 'questions', question.id),
          { order, updatedAt: now },
          { merge: true }
        );
      });
      batch.update(doc(firestore, 'quizzes', quizId), {
        questionCount: updated.length,
        updatedAt: now,
      });
      await batch.commit();
    }

    setQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId ? { ...quiz, questions: updated, questionCount: updated.length } : quiz
      )
    );
  };

  const moveQuestion = async (
    quizId: string,
    questionId: string,
    direction: 'up' | 'down'
  ): Promise<void> => {
    const targetQuiz = quizzes.find((quiz) => quiz.id === quizId);
    if (!targetQuiz) throw new Error('Không tìm thấy bộ câu hỏi.');

    const index = targetQuiz.questions.findIndex((q) => q.id === questionId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === targetQuiz.questions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...targetQuiz.questions];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];

    if (isFirebaseConfigured && db) {
      const firestore = db;
      const batch = writeBatch(firestore);
      updated.forEach((question, order) => {
        batch.set(
          doc(firestore, 'quizzes', quizId, 'questions', question.id),
          { order, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      });
      await batch.commit();
    }

    setQuizzes((prev) =>
      prev.map((quiz) => (quiz.id === quizId ? { ...quiz, questions: updated } : quiz))
    );
  };

  return (
    <TeacherDataContext.Provider
      value={{
        classes: isFirebaseConfigured && loadedForUid !== currentUser?.uid ? [] : classes,
        quizzes: isFirebaseConfigured && loadedForUid !== currentUser?.uid ? [] : quizzes,
        addClass,
        updateClass,
        deleteClass,
        addStudent,
        bulkAddStudents,
        updateStudent,
        deleteStudent,
        addQuiz,
        updateQuiz,
        updateQuizVisibility,
        duplicateQuiz,
        deleteQuiz,
        addQuestion,
        addQuestions,
        updateQuestion,
        duplicateQuestion,
        deleteQuestion,
        moveQuestion,
      }}
    >
      {children}
    </TeacherDataContext.Provider>
  );
};

export const useTeacherData = (): TeacherDataContextType => {
  const context = useContext(TeacherDataContext);
  if (!context) {
    throw new Error('useTeacherData must be used within a TeacherDataProvider');
  }
  return context;
};
