import React, { createContext, useContext, useState } from 'react';
import type { ClassGroup, Student, Quiz, Question } from '../types';
import { INITIAL_CLASSES } from '../data/mockClasses';
import { INITIAL_QUIZZES } from '../data/mockQuizzes';
import { normalizeVietnameseText } from '../utils/normalizeVietnamese';

interface BulkAddResult {
  addedCount: number;
  duplicateNames: string[];
}

interface TeacherDataContextType {
  classes: ClassGroup[];
  quizzes: Quiz[];
  
  // Class Actions
  addClass: (name: string, grade: string) => ClassGroup;
  updateClass: (classId: string, name: string, grade: string) => void;
  deleteClass: (classId: string) => void;

  // Student Actions
  addStudent: (classId: string, studentName: string) => boolean;
  bulkAddStudents: (classId: string, studentNames: string[]) => BulkAddResult;
  updateStudent: (classId: string, studentId: string, newName: string) => void;
  deleteStudent: (classId: string, studentId: string) => void;

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
  const [classes, setClasses] = useState<ClassGroup[]>(INITIAL_CLASSES);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);

  // --- CLASS ACTIONS ---
  const addClass = (name: string, grade: string): ClassGroup => {
    const newClass: ClassGroup = {
      id: `class-${Date.now()}`,
      name: name.trim(),
      grade,
      studentCount: 0,
      students: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClasses((prev) => [newClass, ...prev]);
    return newClass;
  };

  const updateClass = (classId: string, name: string, grade: string) => {
    setClasses((prev) =>
      prev.map((cls) => (cls.id === classId ? { ...cls, name: name.trim(), grade } : cls))
    );
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((cls) => cls.id !== classId));
  };

  // --- STUDENT ACTIONS ---
  const addStudent = (classId: string, studentName: string): boolean => {
    const trimmed = studentName.trim();
    if (!trimmed) return false;

    let isDuplicate = false;

    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id !== classId) return cls;

        const normalizedNew = normalizeVietnameseText(trimmed);
        const exists = cls.students.some(
          (s) => normalizeVietnameseText(s.name) === normalizedNew
        );

        if (exists) {
          isDuplicate = true;
          return cls;
        }

        const newStudent: Student = {
          id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: trimmed,
          studentCode: `${cls.name.replace(/\s+/g, '')}-${cls.students.length + 1}`,
        };

        const updatedStudents = [...cls.students, newStudent];
        return {
          ...cls,
          students: updatedStudents,
          studentCount: updatedStudents.length,
        };
      })
    );

    return !isDuplicate;
  };

  const bulkAddStudents = (classId: string, studentNames: string[]): BulkAddResult => {
    let addedCount = 0;
    const duplicateNames: string[] = [];

    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id !== classId) return cls;

        const currentStudents = [...cls.students];
        const existingNormalized = new Set(
          currentStudents.map((s) => normalizeVietnameseText(s.name))
        );

        studentNames.forEach((name) => {
          const trimmed = name.trim();
          if (!trimmed) return;

          const norm = normalizeVietnameseText(trimmed);
          if (existingNormalized.has(norm)) {
            duplicateNames.push(trimmed);
          } else {
            existingNormalized.add(norm);
            currentStudents.push({
              id: `std-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              name: trimmed,
              studentCode: `${cls.name.replace(/\s+/g, '')}-${currentStudents.length + 1}`,
            });
            addedCount++;
          }
        });

        return {
          ...cls,
          students: currentStudents,
          studentCount: currentStudents.length,
        };
      })
    );

    return { addedCount, duplicateNames };
  };

  const updateStudent = (classId: string, studentId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

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

  const deleteStudent = (classId: string, studentId: string) => {
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
