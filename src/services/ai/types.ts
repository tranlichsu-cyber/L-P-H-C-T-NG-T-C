import type { QuestionType, QuestionDifficulty } from '../../types';

export interface AIGenerationOptions {
  grade: string; // "1" | "2" | "3" | "4" | "5"
  subject: string;
  topic?: string;
  sourceText?: string;
  isSourceGroundedOnly?: boolean;
  questionCount: number; // 3, 5, 10
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MIXED';
  difficulty: 'KNOWLEDGE' | 'UNDERSTANDING' | 'APPLICATION' | 'BALANCED';
}

export interface AIGeneratedQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuestionDifficulty;
  selected?: boolean;
  warnings?: string[];
}

export interface DocumentExtractResult {
  fileName: string;
  charCount: number;
  extractedText: string;
  error?: string;
}
