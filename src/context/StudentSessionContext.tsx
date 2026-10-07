import React, { createContext, useContext, useState } from 'react';
import type { StudentSession, LiveQuestionPublic } from '../types/student';
import { MOCK_ROOM_839201, MOCK_STUDENT_QUESTIONS } from '../data/mockRooms';
import { normalizeVietnameseText } from '../utils/normalizeVietnamese';

interface StudentSessionContextType {
  session: StudentSession;
  joinRoom: (pin: string) => { success: boolean; message?: string };
  selectStudent: (id: string, name: string) => void;
  resetStudent: () => void;
  resetSession: () => void;
  setSelectedAnswer: (answer: string) => void;
  submitAnswer: () => boolean;

  // Dev Test Controls
  devControls: {
    setWaiting: () => void;
    openQuestion: (qId: 'q1' | 'q2' | 'q3') => void;
    closeQuestion: () => void;
    showResult: () => void;
    nextQuestion: (qId: 'q1' | 'q2' | 'q3') => void;
  };
}

const StudentSessionContext = createContext<StudentSessionContextType | undefined>(undefined);

const INITIAL_SESSION: StudentSession = {
  roomCode: null,
  roomId: null,
  className: null,
  subject: null,
  studentId: null,
  studentName: null,
  currentQuestionId: null,
  liveQuestion: null,
  selectedAnswer: null,
  hasSubmitted: false,
  submittedAnswer: null,
  isCorrect: null,
};

export const StudentSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<StudentSession>(INITIAL_SESSION);

  // 1. Join Room
  const joinRoom = (pin: string) => {
    const trimmedPin = pin.trim();
    if (!trimmedPin) {
      return { success: false, message: 'Vui lòng nhập mã phòng.' };
    }
    if (trimmedPin.length !== 6) {
      return { success: false, message: 'Mã phòng gồm 6 chữ số.' };
    }
    if (trimmedPin !== MOCK_ROOM_839201.roomCode) {
      return { success: false, message: 'Không tìm thấy phòng học. Hãy kiểm tra lại mã.' };
    }

    setSession((prev) => ({
      ...prev,
      roomCode: MOCK_ROOM_839201.roomCode,
      roomId: MOCK_ROOM_839201.roomId,
      className: MOCK_ROOM_839201.className,
      subject: MOCK_ROOM_839201.subject,
    }));

    return { success: true };
  };

  // 2. Select Student Name
  const selectStudent = (id: string, name: string) => {
    setSession((prev) => ({
      ...prev,
      studentId: id,
      studentName: name,
    }));
  };

  // 3. Reset Student Name
  const resetStudent = () => {
    setSession((prev) => ({
      ...prev,
      studentId: null,
      studentName: null,
      hasSubmitted: false,
      selectedAnswer: null,
    }));
  };

  // 4. Reset Session
  const resetSession = () => {
    setSession(INITIAL_SESSION);
  };

  // 5. Select Answer
  const setSelectedAnswer = (answer: string) => {
    if (session.hasSubmitted) return; // Locked if already submitted
    setSession((prev) => ({
      ...prev,
      selectedAnswer: answer,
    }));
  };

  // 6. Submit Answer
  const submitAnswer = (): boolean => {
    if (!session.selectedAnswer || session.hasSubmitted) return false;
    if (!session.liveQuestion || session.liveQuestion.status !== 'OPEN') return false;

    setSession((prev) => ({
      ...prev,
      hasSubmitted: true,
      submittedAnswer: prev.selectedAnswer,
    }));
    return true;
  };

  // --- DEV CONTROLS FOR TESTING STAGES ---
  const devControls = {
    setWaiting: () => {
      setSession((prev) => ({
        ...prev,
        currentQuestionId: null,
        liveQuestion: null,
        selectedAnswer: null,
        hasSubmitted: false,
        submittedAnswer: null,
        isCorrect: null,
      }));
    },

    openQuestion: (qId: 'q1' | 'q2' | 'q3') => {
      const q = MOCK_STUDENT_QUESTIONS[qId];
      if (!q) return;

      // Privacy: omit correctAnswer & explanation during OPEN
      const publicQ: LiveQuestionPublic = {
        id: q.id,
        type: q.type,
        content: q.content,
        options: q.options ? [...q.options] : undefined,
        status: 'OPEN',
        startedAt: new Date().toISOString(),
      };

      setSession((prev) => ({
        ...prev,
        currentQuestionId: q.id,
        liveQuestion: publicQ,
        selectedAnswer: null,
        hasSubmitted: false,
        submittedAnswer: null,
        isCorrect: null,
      }));
    },

    closeQuestion: () => {
      setSession((prev) => {
        if (!prev.liveQuestion) return prev;
        return {
          ...prev,
          liveQuestion: {
            ...prev.liveQuestion,
            status: 'CLOSED',
          },
        };
      });
    },

    showResult: () => {
      setSession((prev) => {
        if (!prev.liveQuestion || !prev.currentQuestionId) return prev;

        const q = MOCK_STUDENT_QUESTIONS[prev.currentQuestionId];
        if (!q) return prev;

        // Check correctness based on submitted answer vs correct answer
        let correct = false;
        if (prev.submittedAnswer) {
          const submittedNorm = normalizeVietnameseText(prev.submittedAnswer);
          const correctNorm = normalizeVietnameseText(q.correctAnswer);
          correct = submittedNorm === correctNorm;
        }

        // Attach correctAnswer & explanation now that status is RESULT
        const resultQ: LiveQuestionPublic = {
          ...prev.liveQuestion,
          status: 'RESULT',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        };

        return {
          ...prev,
          liveQuestion: resultQ,
          isCorrect: correct,
        };
      });
    },

    nextQuestion: (qId: 'q1' | 'q2' | 'q3') => {
      devControls.openQuestion(qId);
    },
  };

  return (
    <StudentSessionContext.Provider
      value={{
        session,
        joinRoom,
        selectStudent,
        resetStudent,
        resetSession,
        setSelectedAnswer,
        submitAnswer,
        devControls,
      }}
    >
      {children}
    </StudentSessionContext.Provider>
  );
};

export const useStudentSession = (): StudentSessionContextType => {
  const context = useContext(StudentSessionContext);
  if (!context) {
    throw new Error('useStudentSession must be used within a StudentSessionProvider');
  }
  return context;
};
