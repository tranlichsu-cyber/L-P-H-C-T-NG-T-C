import type { QuestionType, QuestionStatus } from './index';

export interface MockRoom {
  roomId: string;
  roomCode: string;
  className: string;
  subject: string;
  teacherName: string;
  status: 'WAITING' | 'ACTIVE' | 'FINISHED';
  expiresAt: string;
  students: { id: string; name: string }[];
}

export interface LiveQuestionPublic {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  status: QuestionStatus;
  startedAt?: string;
  // Note: correctAnswer and explanation are omitted when status is OPEN/CLOSED
  correctAnswer?: string;
  explanation?: string;
}

export interface StudentSession {
  roomCode: string | null;
  roomId: string | null;
  className: string | null;
  subject: string | null;
  studentId: string | null;
  studentName: string | null;
  currentQuestionId: string | null;
  liveQuestion: LiveQuestionPublic | null;
  selectedAnswer: string | null;
  hasSubmitted: boolean;
  submittedAnswer: string | null;
  isCorrect: boolean | null;
}
