import type { QuestionType, QuestionDifficulty } from '../../types';

export type PracticeType = 'REMEDIATION' | 'PRACTICE' | 'ADVANCED'; // "CỦNG CỐ", "LUYỆN THÊM", "NÂNG CAO"
export type PracticeStatus = 'DRAFT' | 'READY' | 'ASSIGNED' | 'CLOSED' | 'ARCHIVED';
export type AssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
export type PracticeFeedbackMode = 'AFTER_FINISH' | 'PER_QUESTION' | 'TEACHER_ONLY';

export interface PracticeQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: QuestionDifficulty;
}

export interface PracticeAssignment {
  studentId: string;
  studentName: string;
  assignedAt: string;
  status: AssignmentStatus;
  startedAt?: string;
  completedAt?: string;
  attemptCount: number;
  score?: number;
  correctCount?: number;
  totalQuestions?: number;
}

export interface PracticeSubmission {
  id: string; // questionId_studentId
  questionId: string;
  studentId: string;
  authUid?: string;
  answer: string;
  submittedAt: string;
  attemptNumber: number;
  isCorrect?: boolean;
}

export interface PracticeSet {
  id: string;
  teacherId: string;
  classId: string;
  className: string;
  subject: string;
  grade: string;
  title: string;
  type: PracticeType;
  status: PracticeStatus;
  dueAt?: string;
  allowRetry?: boolean;
  maxAttempts?: number;
  feedbackMode?: PracticeFeedbackMode;
  createdAt: string;
  assignedAt?: string;
  createdBy: string;
  source: 'QUESTION_BANK' | 'HISTORY_REMEDIATION' | 'AI_PROPOSAL';
  questions: PracticeQuestion[];
  assignments: Record<string, PracticeAssignment>; // studentId -> Assignment
  responses?: Record<string, PracticeSubmission>; // submissionId -> Submission
  archived?: boolean;
}

export interface TopicRecommendation {
  topic: string;
  accuracy: number;
  questionCount: number;
  suggestedStudents: { id: string; name: string; accuracy: number }[];
  recommendationLevel: 'REMEDIATION' | 'PRACTICE' | 'MASTERY'; // 'Nên củng cố', 'Cần luyện thêm', 'Đã nắm tốt'
  reasonExplanation: string;
}
