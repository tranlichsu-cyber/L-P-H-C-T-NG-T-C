import type { AIProvider } from './providers/AIProvider';
import { MockAIProvider } from './providers/MockAIProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import type { AIGenerationOptions, AIGeneratedQuestion } from './types';

const aiMode = import.meta.env.VITE_AI_MODE || 'mock';
const aiEnabled = import.meta.env.VITE_AI_ENABLED !== 'false';
const hasGeminiApiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

export const isRealAIMode =
  aiEnabled &&
  (aiMode === 'real' || aiMode === 'gemini') &&
  hasGeminiApiKey;

export const isAIConfigured =
  !aiEnabled ||
  aiMode === 'mock' ||
  hasGeminiApiKey;

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

  public get isConfigured(): boolean {
    return isAIConfigured;
  }

  public get isRealMode(): boolean {
    return isRealAIMode;
  }

  private assertConfigured(): void {
    if (
      aiEnabled &&
      (aiMode === 'real' || aiMode === 'gemini') &&
      !hasGeminiApiKey
    ) {
      throw new Error(
        'Trợ lý AI chưa được cấu hình Gemini API Key trên máy chủ Production.'
      );
    }
  }

  public async generateQuestions(options: AIGenerationOptions): Promise<AIGeneratedQuestion[]> {
    this.assertConfigured();
    return activeProvider.generateQuestions(options);
  }

  public async refineQuestion(
    question: AIGeneratedQuestion,
    action: string,
    options: AIGenerationOptions
  ): Promise<AIGeneratedQuestion> {
    this.assertConfigured();
    return activeProvider.refineQuestion(question, action, options);
  }

  public async generateExplanation(questionContent: string, correctAnswer: string): Promise<string> {
    this.assertConfigured();
    return activeProvider.generateExplanation(questionContent, correctAnswer);
  }
}

export const aiService = new AIService();
