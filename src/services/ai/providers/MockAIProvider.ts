import type { AIProvider } from './AIProvider';
import type { AIGenerationOptions, AIGeneratedQuestion } from '../types';
import { validateAIQuestions } from '../schemas/questionSchema';

export class MockAIProvider implements AIProvider {
  public name = 'Mock AI Provider (Local Test Mode)';

  public async generateQuestions(options: AIGenerationOptions): Promise<AIGeneratedQuestion[]> {
    // Simulate slight natural AI response delay (300ms)
    await new Promise((resolve) => setTimeout(resolve, 300));

    const { subject, topic, questionCount, questionType } = options;
    const rawMockQuestions: any[] = [];

    const topicTitle = topic || 'Kiến thức tổng hợp';

    for (let i = 1; i <= questionCount; i++) {
      let type = questionType;
      if (questionType === 'MIXED') {
        const types = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'];
        type = types[(i - 1) % types.length] as any;
      }

      if (type === 'MULTIPLE_CHOICE') {
        rawMockQuestions.push({
          type: 'MULTIPLE_CHOICE',
          content: `[AI Đề xuất] Câu ${i}: Trong bài học "${topicTitle}" (${subject}), đâu là ý kiến đúng nhất?`,
          options: [
            `Phương án A cho câu hỏi ${i}`,
            `Phương án B chuẩn xác cho câu hỏi ${i}`,
            `Phương án C chưa đúng cho câu hỏi ${i}`,
            `Phương án D để so sánh cho câu hỏi ${i}`,
          ],
          correctAnswer: 'B',
          explanation: `Đáp án B là chính xác vì nội dung "${topicTitle}" được trình bày rõ ràng trong bài học.`,
          difficulty: i % 3 === 0 ? 'APPLICATION' : i % 2 === 0 ? 'UNDERSTANDING' : 'KNOWLEDGE',
        });
      } else if (type === 'TRUE_FALSE') {
        rawMockQuestions.push({
          type: 'TRUE_FALSE',
          content: `[AI Đề xuất] Câu ${i}: Phát biểu về chủ đề "${topicTitle}" là ĐÚNG hay SAI?`,
          correctAnswer: i % 2 === 0 ? 'Đúng' : 'Sai',
          explanation: `Giải thích chi tiết cho phát biểu về chủ đề ${topicTitle}.`,
          difficulty: 'KNOWLEDGE',
        });
      } else if (type === 'SHORT_ANSWER') {
        rawMockQuestions.push({
          type: 'SHORT_ANSWER',
          content: `[AI Đề xuất] Câu ${i}: Em hãy viết ngắn gọn kết quả hoặc từ khóa chính của bài "${topicTitle}":`,
          correctAnswer: `Kết quả câu ${i}`,
          explanation: `Giải thích chi tiết từ khóa của chủ đề ${topicTitle}.`,
          difficulty: 'UNDERSTANDING',
        });
      }
    }

    const { validQuestions } = validateAIQuestions(rawMockQuestions);
    return validQuestions;
  }

  public async refineQuestion(
    question: AIGeneratedQuestion,
    action: string,
    _options: AIGenerationOptions
  ): Promise<AIGeneratedQuestion> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    let newContent = question.content;
    let newExplanation = question.explanation;
    let newOptions = question.options ? [...question.options] : undefined;

    if (action === 'SIMPLIFY') {
      newContent = `${question.content} (Dạng dễ hiểu hơn)`;
      newExplanation = `[AI Đơn giản hóa] ${question.explanation}`;
    } else if (action === 'INCREASE_DIFFICULTY') {
      newContent = `${question.content} (Dạng nâng cao tư duy)`;
      newExplanation = `[AI Nâng cao] ${question.explanation}`;
    } else if (action === 'REWRITE_CLEARER') {
      newContent = `[AI Viết lại ngắn gọn] ${question.content.replace('[AI Đề xuất] ', '')}`;
    } else if (action === 'DISTRACTORS' && newOptions) {
      newOptions = [
        newOptions[0],
        `${newOptions[1]} (Mới)`,
        `${newOptions[2]} (Mới)`,
        `${newOptions[3]} (Mới)`,
      ];
    } else if (action === 'EXPLANATION') {
      newExplanation = `Giải thích chi tiết ngắn gọn cho câu hỏi "${question.content}".`;
    }

    return {
      ...question,
      content: newContent,
      explanation: newExplanation,
      options: newOptions,
    };
  }

  public async generateExplanation(questionContent: string, correctAnswer: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return `Giải thích ngắn gọn phù hợp học sinh tiểu học cho câu hỏi "${questionContent}": Đáp án đúng là ${correctAnswer}.`;
  }
}
