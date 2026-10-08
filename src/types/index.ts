export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export type RoomStatus = 'WAITING' | 'ACTIVE' | 'FINISHED';

export type QuestionStatus = 'READY' | 'OPEN' | 'CLOSED' | 'RESULT';

export interface Student {
  id: string;
  name: string;
  studentCode?: string;
}

export interface ClassGroup {
  id: string;
  teacherId?: string;
  coTeacherIds?: string[];
  name: string;
  grade: string;
  studentCount: number;
  students: Student[];
  createdAt: string;
}

export type QuestionDifficulty = 'KNOWLEDGE' | 'UNDERSTANDING' | 'APPLICATION';

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  caseInsensitive?: boolean;
  trimWhitespace?: boolean;
  correctPoints?: number;
  wrongPenalty?: number;
  difficulty?: QuestionDifficulty;
  source?: 'MANUAL' | 'AI';
  aiReviewed?: boolean;
}

export interface Quiz {
  id: string;
  teacherId?: string;
  title: string;
  subject: string;
  grade: string;
  questionCount: number;
  questions: Question[];
  createdAt: string;
  visibility?: 'PRIVATE' | 'TEAM' | 'SCHOOL';
  teamId?: string;
}

export interface LiveQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  status: QuestionStatus;
  correctAnswer?: string;
  explanation?: string;
  startedAt?: string;
}

export interface Participant {
  studentId: string;
  name: string;
  authUid?: string;
  sessionToken: string;
  joinedAt: string;
  lastSeenAt: string;
}

export interface Submission {
  questionId: string;
  studentId: string;
  studentName: string;
  answer: string;
  isCorrect?: boolean;
  submittedAt: string;
}

export interface Room {
  id: string;
  roomCode: string;
  teacherId: string;
  classId: string;
  className: string;
  subject: string;
  status: RoomStatus;
  activeQuestionId?: string;
  createdAt: string;
  expiresAt: string;
}
