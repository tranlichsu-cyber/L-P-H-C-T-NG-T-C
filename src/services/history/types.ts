import type { QuestionType } from '../../types';

export interface RoomSummary {
  roomId: string;
  teacherId: string;
  classId: string;
  className: string;
  subject: string;
  grade: string;
  quizId?: string;
  quizTitle?: string;
  startedAt: string;
  endedAt: string;
  participantCount: number;
  questionCount: number;
  submissionCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  averageAccuracy: number; // 0 - 100%
  totalScoreAwarded: number;
  createdAt: string;
  archived?: boolean;
}

export type DifficultyTag = 'EXCELLENT' | 'REINFORCE' | 'NEEDS_SUPPORT';

export interface QuestionAnalysisStats {
  questionId: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  difficultyTag: DifficultyTag;
  difficultyTagLabel: string; // "Đã nắm tốt", "Cần củng cố", "Cần hỗ trợ thêm"
  optionDistribution: Record<string, number>;
}

export interface StudentSessionResult {
  studentId: string;
  studentName: string;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  score: number;
  answers: Record<
    string,
    {
      studentAnswer: string;
      isCorrect: boolean;
      correctAnswer: string;
    }
  >;
  needsSupport: boolean;
}

export interface SessionDetailResult {
  summary: RoomSummary;
  questionStats: QuestionAnalysisStats[];
  studentResults: StudentSessionResult[];
  studentsNeedingSupport: StudentSessionResult[];
  topicPerformance: Record<string, { total: number; correct: number; accuracy: number }>;
}

export interface HistoryFilters {
  classId?: string;
  grade?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  searchTitle?: string;
  showArchived?: boolean;
  sortBy?: 'newest' | 'oldest' | 'accuracy_high' | 'accuracy_low';
}

export interface StudentLongitudinalRecord {
  roomId: string;
  date: string;
  subject: string;
  quizTitle: string;
  className: string;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  score: number;
}
