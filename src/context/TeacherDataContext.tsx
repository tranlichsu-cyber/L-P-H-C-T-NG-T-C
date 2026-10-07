import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ClassGroup, Student, Quiz, Question } from '../types';
import { INITIAL_CLASSES } from '../data/mockClasses';
import { INITIAL_QUIZZES } from '../data/mockQuizzes';
import { normalizeVietnameseText } from '../utils/normalizeVietnamese';
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase/firebase';

interface BulkAddResult {
  addedCount: number;
  duplicateNames: string[];
}

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
  addQuiz: (title: string, subject: string, grade: string, visibility?: 'PRIVATE' | 'TEAM' | 'SCHOOL', teamId?: string) => Quiz;
  updateQuiz: (quizId: string, title: string, subject: string, grade: string, visibility?: 'PRIVATE' | 'TEAM' | 'SCHOOL', teamId?: string) => void;
  updateQuizVisibility: (quizId: string, visibility: 'PRIVATE' | 'TEAM' | 'SCHOOL', teamId?: string) => void;
  duplicateQuiz: (quizId: string) => Quiz;
  deleteQuiz: (quizId: string) => void;

  // Question Actions
  addQuestion: (quizId: string, questionData: Omit<Question, 'id'>) => void;
  updateQuestion: (quizId: string, questionId: string, questionData: Omit<Question, 'id'>) => void;
  duplicateQuestion: (quizId: string, questionId: string) => void;
  deleteQuestion: (quizId: string, questionId: string) => void;
  moveQuestion: (quizId: string, questionId: string, direction: 'up' | 'down') => void;
}

const TeacherDataContext = createContext<TeacherDataContextType | undefined>(undefined);

export const TeacherDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassGroup[]>(
    isFirebaseConfigured ? [] : INITIAL_CLASSES
  );
  const [quizzes, setQuizzes] = useState<Quiz[]>(
    isFirebaseConfigured ? [] : INITIAL_QUIZZES
  );

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const firestore = db;
    let cancelled = false;

    const loadRealTeacherData = async () => {
      try {
        const classSnap = await getDocs(collection(firestore, 'classes'));
        const legacyClassIds = new Set(['class-4a', 'class-4b', 'class-5a']);
        const realClasses = await Promise.all(
          classSnap.docs
            .filter((classDoc) => !legacyClassIds.has(classDoc.id))
            .map(async (classDoc) => {
            const data = classDoc.data() as Partial<ClassGroup> & { className?: string };
            const studentsSnap = await getDocs(collection(firestore, 'classes', classDoc.id, 'students'));
            const students = studentsSnap.docs.map((studentDoc) => ({
              id: studentDoc.id,
              ...(studentDoc.data() as Omit<Student, 'id'>),
            }));

            return {
              id: classDoc.id,
              name: data.name || data.className || 'Lớp chưa đặt tên',
              grade: data.grade || '',
              studentCount: students.length,
              students,
              createdAt: data.createdAt || '',
            } as ClassGroup;
          })
        );

        const quizSnap = await getDocs(collection(firestore, 'quizzes'));
        const legacyQuizIds = new Set(['quiz-1', 'quiz-2', 'quiz-3']);
        const realQuizzes = await Promise.all(
          quizSnap.docs
            .filter((quizDoc) => !legacyQuizIds.has(quizDoc.id))
            .map(async (quizDoc) => {
            const data = quizDoc.data() as Partial<Quiz>;
            const questionsSnap = await getDocs(collection(firestore, 'quizzes', quizDoc.id, 'questions'));
            const questions = questionsSnap.docs.map((questionDoc) => ({
              id: questionDoc.id,
              ...(questionDoc.data() as Omit<Question, 'id'>),
            }));

            return {
              id: quizDoc.id,
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
          setClasses(realClasses);
          setQuizzes(realQuizzes);
        }
      } catch (error) {
        console.error('Không thể tải dữ liệu lớp/bộ câu hỏi từ Firestore', error);
        if (!cancelled) {
          setClasses([]);
          setQuizzes([]);
        }
      }
    };

    void loadRealTeacherData();

    return () => {
      cancelled = true;
    };
  }, []);

  // --- CLASS ACTIONS ---
  const addClass = async (name: string, grade: string): Promise<ClassGroup> => {
    const now = new Date().toISOString();
    const newClass: ClassGroup = {
      id: `class-${Date.now()}`,
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
      const batch = writeBatch(db);
      newStudents.forEach((student) => {
        batch.set(doc(db, 'classes', classId, 'students', student.id), {
          ...student,
          createdAt: new Date().toISOString(),
        });
      });
      batch.update(doc(db, 'classes', classId), {
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

  // Quiz Actions
  const addQuiz = (title: string, subject: string, grade: string, visibility: 'PRIVATE' | 'TEAM' | 'SCHOOL' = 'PRIVATE', teamId?: string): Quiz => {
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: title.trim(),
      subject,
      grade,
      questionCount: 0,
      questions: [],
      createdAt: new Date().toISOString().split('T')[0],
      visibility,
      teamId,
    };
    setQuizzes((prev) => [newQuiz, ...prev]);
    return newQuiz;
  };

  const updateQuiz = (quizId: string, title: string, subject: string, grade: string, visibility?: 'PRIVATE' | 'TEAM' | 'SCHOOL', teamId?: string) => {
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? {
              ...q,
              title: title.trim(),
              subject,
              grade,
              visibility: visibility || q.visibility || 'PRIVATE',
              teamId: teamId !== undefined ? teamId : q.teamId,
            }
          : q
      )
    );
  };

  const updateQuizVisibility = (quizId: string, visibility: 'PRIVATE' | 'TEAM' | 'SCHOOL', teamId?: string) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, visibility, teamId } : q))
    );
  };

  const duplicateQuiz = (quizId: string): Quiz => {
    const original = quizzes.find((q) => q.id === quizId);
    if (!original) throw new Error('Quiz not found');

    const copy: Quiz = {
      ...original,
      id: `quiz-${Date.now()}`,
      title: `${original.title} (Bản sao)`,
      createdAt: new Date().toISOString().split('T')[0],
      questions: original.questions.map((quest) => ({
        ...quest,
        id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      })),
    };

    setQuizzes((prev) => [copy, ...prev]);
    return copy;
  };

  const deleteQuiz = (quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  // --- QUESTION ACTIONS ---
  const addQuestion = (quizId: string, questionData: Omit<Question, 'id'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: `q-${Date.now()}`,
    };

    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id !== quizId) return quiz;
        const updated = [...quiz.questions, newQuestion];
        return { ...quiz, questions: updated, questionCount: updated.length };
      })
    );
  };

  const updateQuestion = (quizId: string, questionId: string, questionData: Omit<Question, 'id'>) => {
    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id !== quizId) return quiz;
        const updated = quiz.questions.map((q) => (q.id === questionId ? { ...questionData, id: questionId } : q));
        return { ...quiz, questions: updated };
      })
    );
  };

  const duplicateQuestion = (quizId: string, questionId: string) => {
    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id !== quizId) return quiz;
        const index = quiz.questions.findIndex((q) => q.id === questionId);
        if (index === -1) return quiz;

        const original = quiz.questions[index];
        const copy: Question = {
          ...original,
          id: `q-${Date.now()}`,
          content: `${original.content} (Bản sao)`,
        };

        const updated = [...quiz.questions];
        updated.splice(index + 1, 0, copy);
        return { ...quiz, questions: updated, questionCount: updated.length };
      })
    );
  };

  const deleteQuestion = (quizId: string, questionId: string) => {
    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id !== quizId) return quiz;
        const updated = quiz.questions.filter((q) => q.id !== questionId);
        return { ...quiz, questions: updated, questionCount: updated.length };
      })
    );
  };

  const moveQuestion = (quizId: string, questionId: string, direction: 'up' | 'down') => {
    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id !== quizId) return quiz;
        const index = quiz.questions.findIndex((q) => q.id === questionId);
        if (index === -1) return quiz;

        if (direction === 'up' && index === 0) return quiz;
        if (direction === 'down' && index === quiz.questions.length - 1) return quiz;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const updated = [...quiz.questions];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        return { ...quiz, questions: updated };
      })
    );
  };

  return (
    <TeacherDataContext.Provider
      value={{
        classes,
        quizzes,
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
