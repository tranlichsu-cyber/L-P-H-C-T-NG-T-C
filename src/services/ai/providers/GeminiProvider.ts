import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import type { AIProvider } from './AIProvider';
import type { AIGenerationOptions, AIGeneratedQuestion } from '../types';
import { buildQuestionGenerationPrompt, buildSingleQuestionRegenPrompt } from '../prompts/questionGenerationPrompt';
import { validateAIQuestions } from '../schemas/questionSchema';
import { app } from '../../firebase/firebase';

export class GeminiProvider implements AIProvider {
  public name = 'Firebase AI Logic • Gemini';

  private getModel(jsonMode: boolean = true) {
    if (!app) {
      throw new Error('Firebase chưa được khởi tạo.');
    }

    const ai = getAI(app, { backend: new GoogleAIBackend() });

    return getGenerativeModel(ai, {
      model: 'gemini-2.5-flash',
      generationConfig: jsonMode
        ? {
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        : {
            temperature: 0.3,
          },
    });
  }

  private mapError(err: any): Error {
    const message = String(err?.message || err || '');

    if (/app.?check|attestation|403|permission.?denied/i.test(message)) {
      return new Error(
        'Firebase AI Logic/App Check chưa được cấu hình hoặc chưa cho phép ứng dụng Production.'
      );
    }

    if (/429|quota|resource.?exhausted/i.test(message)) {
      return new Error('Đã đạt giới hạn sử dụng AI tạm thời. Hãy thử lại sau.');
    }

    return new Error(message || 'Không thể kết nối dịch vụ AI. Hãy thử lại.');
  }

  public async generateQuestions(options: AIGenerationOptions): Promise<AIGeneratedQuestion[]> {
    try {
      const model = this.getModel(true);
      const result = await model.generateContent(buildQuestionGenerationPrompt(options));
      const rawText = result.response.text() || '[]';
      const parsedJSON = JSON.parse(rawText);
      const { validQuestions } = validateAIQuestions(parsedJSON);
      return validQuestions;
    } catch (err: any) {
      console.error('[Firebase AI Logic Error]', err);
      throw this.mapError(err);
    }
  }

  public async refineQuestion(
    question: AIGeneratedQuestion,
    action: string,
    options: AIGenerationOptions
  ): Promise<AIGeneratedQuestion> {
    try {
      const model = this.getModel(true);
      const result = await model.generateContent(
        buildSingleQuestionRegenPrompt(question, action, options)
      );
      const parsedJSON = JSON.parse(result.response.text() || '{}');
      const { validQuestions } = validateAIQuestions([parsedJSON]);
      return validQuestions[0] || question;
    } catch (err: any) {
      console.error('[Firebase AI Logic Refine Error]', err);
      throw this.mapError(err);
    }
  }

  public async generateExplanation(
    questionContent: string,
    correctAnswer: string
  ): Promise<string> {
    try {
      const model = this.getModel(false);
      const result = await model.generateContent(
        `Tạo đoạn giải thích 1-2 câu ngắn gọn phù hợp học sinh tiểu học cho câu hỏi: "${questionContent}". Đáp án đúng: ${correctAnswer}.`
      );
      return result.response.text()?.trim() || 'Giải thích ngắn gọn cho câu hỏi.';
    } catch (err: any) {
      console.error('[Firebase AI Logic Explanation Error]', err);
      throw this.mapError(err);
    }
  }
}
