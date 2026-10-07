import type { AIProvider } from './providers/AIProvider';
import { MockAIProvider } from './providers/MockAIProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import type { AIGenerationOptions, AIGeneratedQuestion } from './types';

const aiMode = import.meta.env.VITE_AI_MODE || 'mock';

export const isRealAIMode = aiMode === 'real' && Boolean(import.meta.env.VITE_GEMINI_API_KEY);

const activeProvider: AIProvider = isRealAIMode ? new GeminiProvider() : new MockAIProvider();

console.info(
  `[AI SERVICE] Đang hoạt động ở chế độ: ${
    isRealAIMode ? '🤖 GEMINI REAL API' : '📦 MOCK AI MODE (Local Test)'
  }`
);

export class AIService {
  public get providerName(): string {
    return activeProvider.name;
  }

  public async generateQuestions(options: AIGenerationOptions): Promise<AIGeneratedQuestion[]> {
    return activeProvider.generateQuestions(options);
  }

  public async refineQuestion(
    question: AIGeneratedQuestion,
    action: string,
    options: AIGenerationOptions
  ): Promise<AIGeneratedQuestion> {
    return activeProvider.refineQuestion(question, action, options);
  }

  public async generateExplanation(questionContent: string, correctAnswer: string): Promise<string> {
    return activeProvider.generateExplanation(questionContent, correctAnswer);
  }
}

export const aiService = new AIService();
