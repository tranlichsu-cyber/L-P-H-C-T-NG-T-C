import React, { createContext, useContext, useEffect, useState } from 'react';
import type { StudentSession, LiveQuestionPublic } from '../types/student';
import type { MockRoomData } from '../services/realtime/types';
import { MOCK_STUDENT_QUESTIONS } from '../data/mockRooms';
import { normalizeVietnameseText } from '../utils/normalizeVietnamese';
import { activeRealtimeService } from '../services/realtime/realtimeServiceSwitch';

interface StudentSessionContextType {
  session: StudentSession;
  room: MockRoomData | null;
  joinRoom: (pin: string) => Promise<{ success: boolean; message?: string }>;
  selectStudent: (id: string, name: string) => void;
  resetStudent: () => void;
  resetSession: () => void;
  setSelectedAnswer: (answer: string) => void;
  submitAnswer: () => boolean;

  // Dev Test Controls (used only by the development test panel)
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
  const [room, setRoom] = useState<MockRoomData | null>(null);

  // Keep student UI synchronized through the lightweight student-only listener.
  // Before a name is selected we keep the one-time room/roster data returned by joinRoomByCode.
  useEffect(() => {
    if (!session.roomId) {
      setRoom(null);
      return;
    }

    if (!session.studentId) {
      return;
    }

    const unsubscribe = activeRealtimeService.subscribeStudentRoom(
      session.roomId,
      session.studentId,
      (updatedRoom) => {
        setRoom(updatedRoom);

        setSession((prev) => {
          const questionId = updatedRoom.activeQuestionId || null;
          const liveQuestion = questionId
            ? (updatedRoom.liveQuestions?.[questionId] as LiveQuestionPublic | undefined) || null
            : null;
          const questionChanged = questionId !== prev.currentQuestionId;

          const realSubmission =
            prev.studentId && questionId
              ? Object.values(updatedRoom.submissions || {}).find(
                  (submission) =>
                    submission.studentId === prev.studentId &&
                    submission.questionId === questionId
                )
              : undefined;

          const submittedAnswer =
            realSubmission?.answer ?? (questionChanged ? null : prev.submittedAnswer);
          const hasSubmitted = Boolean(realSubmission) || (!questionChanged && prev.hasSubmitted);

          let isCorrect: boolean | null = null;
          if (
            liveQuestion?.status === 'RESULT' &&
            liveQuestion.correctAnswer &&
            submittedAnswer
          ) {
            const normalizeChoiceValue = (
              value: string,
              options?: string[]
            ): string => {
              const trimmed = value.trim();
              if (/^[A-D]$/i.test(trimmed) && options?.length) {
                const index = trimmed.toUpperCase().charCodeAt(0) - 65;
                if (index >= 0 && index < options.length) {
                  return normalizeVietnameseText(options[index]);
                }
              }
              return normalizeVietnameseText(trimmed);
            };

            const normalizeTrueFalse = (value: string): string => {
              const normalized = normalizeVietnameseText(value);
              if (['dung', 'true', '1', 'yes'].includes(normalized)) return 'true';
              if (['sai', 'false', '0', 'no'].includes(normalized)) return 'false';
              return normalized;
            };

            if (liveQuestion.type === 'MULTIPLE_CHOICE') {
              isCorrect =
                normalizeChoiceValue(submittedAnswer, liveQuestion.options) ===
                normalizeChoiceValue(liveQuestion.correctAnswer, liveQuestion.options);
            } else if (liveQuestion.type === 'TRUE_FALSE') {
              isCorrect =
                normalizeTrueFalse(submittedAnswer) ===
                normalizeTrueFalse(liveQuestion.correctAnswer);
            } else {
              isCorrect =
                normalizeVietnameseText(submittedAnswer) ===
                normalizeVietnameseText(liveQuestion.correctAnswer);
            }
          }

          return {
            ...prev,
            roomCode: updatedRoom.roomCode || prev.roomCode,
            className: updatedRoom.className || prev.className,
            subject: updatedRoom.subject || prev.subject,
            currentQuestionId: questionId,
            liveQuestion,
            selectedAnswer: questionChanged ? null : prev.selectedAnswer,
            hasSubmitted,
            submittedAnswer,
            isCorrect,
          };
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [session.roomId, session.studentId]);

  // 1. Join a real room by its current 6-digit code.
  const joinRoom = async (pin: string): Promise<{ success: boolean; message?: string }> => {
    const trimmedPin = pin.trim();
    if (!trimmedPin) {
      return { success: false, message: 'Vui lòng nhập mã phòng.' };
    }
    if (trimmedPin.length !== 6) {
      return { success: false, message: 'Mã phòng gồm 6 chữ số.' };
    }

    try {
      const result = await Promise.resolve(activeRealtimeService.joinRoomByCode(trimmedPin));
      if (!result.room) {
        return {
          success: false,
          message: result.error || 'Không tìm thấy phòng học. Hãy kiểm tra lại mã.',
        };
      }

      setRoom(result.room);
      setSession((prev) => ({
        ...prev,
        roomCode: result.room!.roomCode,
        roomId: result.room!.id,
        className: result.room!.className,
        subject: result.room!.subject,
        currentQuestionId: result.room!.activeQuestionId || null,
        liveQuestion:
          result.room!.activeQuestionId && result.room!.liveQuestions
            ? (result.room!.liveQuestions[result.room!.activeQuestionId] as LiveQuestionPublic | undefined) || null
            : null,
        selectedAnswer: null,
        hasSubmitted: false,
        submittedAnswer: null,
        isCorrect: null,
      }));

      return { success: true };
    } catch (error) {
      console.error('Không thể tham gia phòng học', error);
      return { success: false, message: 'Không thể kết nối phòng học. Vui lòng thử lại.' };
    }
  };

  // 2. Select Student Name
  const selectStudent = (id: string, name: string) => {
    localStorage.setItem('student_id', id);
    localStorage.setItem('student_name', name);
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
      submittedAnswer: null,
      isCorrect: null,
    }));
  };

  // 4. Reset Session
  const resetSession = () => {
    setRoom(null);
    setSession(INITIAL_SESSION);
  };

  // 5. Select Answer
  const setSelectedAnswer = (answer: string) => {
    if (session.hasSubmitted) return;
    setSession((prev) => ({
      ...prev,
      selectedAnswer: answer,
    }));
  };

  // 6. Mark the answer as submitted after Firestore accepts it.
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

  // --- DEV CONTROLS FOR LOCAL TESTING ONLY ---
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

        const correct = Boolean(
          prev.submittedAnswer &&
            normalizeVietnameseText(prev.submittedAnswer) ===
              normalizeVietnameseText(q.correctAnswer)
        );

        return {
          ...prev,
          liveQuestion: {
            ...prev.liveQuestion,
            status: 'RESULT',
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          },
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
        room,
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
