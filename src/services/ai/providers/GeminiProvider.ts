import type { AIProvider } from './AIProvider';
import type { AIGenerationOptions, AIGeneratedQuestion } from '../types';
import { buildQuestionGenerationPrompt, buildSingleQuestionRegenPrompt } from '../prompts/questionGenerationPrompt';
import { validateAIQuestions } from '../schemas/questionSchema';

export class GeminiProvider implements AIProvider {
  public name = 'Google Gemini API Provider';

  private get apiKey(): string {
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  public async generateQuestions(options: AIGenerationOptions): Promise<AIGeneratedQuestion[]> {
    if (!this.apiKey) {
      throw new Error('Chưa cấu hình VITE_GEMINI_API_KEY trong file .env.local.');
    }

    const promptText = buildQuestionGenerationPrompt(options);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Đã đạt giới hạn sử dụng AI tạm thời. Hãy thử lại sau.');
        }
        throw new Error(`Lỗi kết nối Gemini API (HTTP ${response.status}).`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const parsedJSON = JSON.parse(rawText);

      const { validQuestions } = validateAIQuestions(parsedJSON);
      return validQuestions;
    } catch (err: any) {
      console.error('[GeminiProvider Error]', err);
      throw new Error(err.message || 'Không thể kết nối dịch vụ AI. Hãy thử lại.');
    }
  }

  public async refineQuestion(
    question: AIGeneratedQuestion,
    action: string,
    options: AIGenerationOptions
  ): Promise<AIGeneratedQuestion> {
    if (!this.apiKey) {
      throw new Error('Chưa cấu hình VITE_GEMINI_API_KEY trong file .env.local.');
    }

    const promptText = buildSingleQuestionRegenPrompt(question, action, options);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi kết nối Gemini API (HTTP ${response.status}).`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsedJSON = JSON.parse(rawText);

      const { validQuestions } = validateAIQuestions([parsedJSON]);
      return validQuestions[0] || question;
    } catch (err: any) {
      console.error('[GeminiProvider Refine Error]', err);
      return question;
    }
  }

  public async generateExplanation(questionContent: string, correctAnswer: string): Promise<string> {
    if (!this.apiKey) return 'Giải thích cho câu hỏi.';

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Tạo đoạn giải thích 1-2 câu ngắn gọn phù hợp học sinh tiểu học cho câu hỏi: "${questionContent}". Đáp án đúng: ${correctAnswer}.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Giải thích ngắn gọn cho câu hỏi.';
    } catch {
      return 'Giải thích ngắn gọn cho câu hỏi.';
    }
  }
}
