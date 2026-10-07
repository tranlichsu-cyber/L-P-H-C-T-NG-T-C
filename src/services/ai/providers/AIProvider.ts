import type { AIGenerationOptions, AIGeneratedQuestion } from '../types';

export interface AIProvider {
  name: string;
  generateQuestions(options: AIGenerationOptions): Promise<AIGeneratedQuestion[]>;
  refineQuestion(
    question: AIGeneratedQuestion,
    action: string,
    options: AIGenerationOptions
  ): Promise<AIGeneratedQuestion>;
  generateExplanation(questionContent: string, correctAnswer: string): Promise<string>;
}
