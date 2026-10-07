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
      id: `quiz-${Date.now()}`,
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

    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, visibility, teamId } : q))
    );
  };

  const duplicateQuiz = async (quizId: string): Promise<Quiz> => {
    const original = quizzes.find((q) => q.id === quizId);
    if (!original) throw new Error('Không tìm thấy bộ câu hỏi.');

    const now = new Date().toISOString();
    const teacherId = auth?.currentUser?.uid;
    if (isFirebaseConfigured && db && !teacherId) {
      throw new Error('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.');
    }

    const copy: Quiz = {
      ...original,
      id: `quiz-${Date.now()}`,
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
        batch.set(doc(firestore, 'quizzes', copy.id, 'questions', question.id), {
          ...question,
          order: index,
          createdAt: now,
          updatedAt: now,
        });
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
  const addQuestion = async (
    quizId: string,
    questionData: Omit<Question, 'id'>
  ): Promise<void> => {
    const targetQuiz = quizzes.find((quiz) => quiz.id === quizId);
    if (!targetQuiz) throw new Error('Không tìm thấy bộ câu hỏi.');

    const now = new Date().toISOString();
    const newQuestion: Question = {
      ...questionData,
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    const nextCount = targetQuiz.questions.length + 1;

    if (isFirebaseConfigured && db) {
      const firestore = db;
      const batch = writeBatch(firestore);
      batch.set(doc(firestore, 'quizzes', quizId, 'questions', newQuestion.id), {
        ...newQuestion,
        order: targetQuiz.questions.length,
        createdAt: now,
        updatedAt: now,
      });
      batch.update(doc(firestore, 'quizzes', quizId), {
        questionCount: nextCount,
        updatedAt: now,
      });
      await batch.commit();
    }

    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id !== quizId) return quiz;
        const updated = [...quiz.questions, newQuestion];
        return { ...quiz, questions: updated, questionCount: updated.length };
      })
    );
  };

  const updateQuestion = async (
    quizId: string,
    questionId: string,
    questionData: Omit<Question, 'id'>
  ): Promise<void> => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'quizzes', quizId, 'questions', questionId), {
        ...questionData,
        updatedAt: new Date().toISOString(),
      });
    }

    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id !== quizId) return quiz;
        const updated = quiz.questions.map((q) =>
          q.id === questionId ? { ...questionData, id: questionId } : q
        );
        return { ...quiz, questions: updated };
      })
    );
  };

  const duplicateQuestion = async (quizId: string, questionId: string): Promise<void> => {
    const targetQuiz = quizzes.find((quiz) => quiz.id === quizId);
    if (!targetQuiz) throw new Error('Không tìm thấy bộ câu hỏi.');

    const index = targetQuiz.questions.findIndex((q) => q.id === questionId);
    if (index === -1) throw new Error('Không tìm thấy câu hỏi.');

    const now = new Date().toISOString();
    const original = targetQuiz.questions[index];
    const copy: Question = {
      ...original,
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      content: `${original.content} (Bản sao)`,
    };
    const updated = [...targetQuiz.questions];
    updated.splice(index + 1, 0, copy);

    if (isFirebaseConfigured && db) {
      const firestore = db;
      const batch = writeBatch(firestore);
      updated.forEach((question, order) => {
        batch.set(
          doc(firestore, 'quizzes', quizId, 'questions', question.id),
          { ...question, order, updatedAt: now },
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
