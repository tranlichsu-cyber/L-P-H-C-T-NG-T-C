import type { AIGeneratedQuestion } from '../types';

export const validateAIQuestions = (
  rawQuestions: any[]
): { validQuestions: AIGeneratedQuestion[]; warnings: string[] } => {
  const validQuestions: AIGeneratedQuestion[] = [];
  const globalWarnings: string[] = [];

  if (!Array.isArray(rawQuestions)) {
    return { validQuestions: [], warnings: ['Dữ liệu AI trả về không đúng định dạng danh sách.'] };
  }

  const seenContents = new Set<string>();

  rawQuestions.forEach((q, idx) => {
    const itemWarnings: string[] = [];

    // 1. Content check
    const content = typeof q.content === 'string' ? q.content.trim() : '';
    if (!content) {
      return; // Skip empty content
    }

    // Normalized duplicate check
    const normContent = content.toLowerCase().replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/g, '');
    if (seenContents.has(normContent)) {
      itemWarnings.push('Câu hỏi này trùng lặp nội dung với một câu khác trong danh sách.');
    } else {
      seenContents.add(normContent);
    }

    // 2. Question Type Check
    let type = q.type;
    if (!['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'].includes(type)) {
      type = 'MULTIPLE_CHOICE';
    }

    // 3. Options & CorrectAnswer Validation
    let options = Array.isArray(q.options) ? q.options.map((o: any) => String(o).trim()) : undefined;
    let correctAnswer = typeof q.correctAnswer === 'string' ? q.correctAnswer.trim() : '';

    if (type === 'MULTIPLE_CHOICE') {
      if (!options || options.length !== 4) {
        // Fallback default 4 options if corrupted
        options = ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'];
        itemWarnings.push('Tự động điều chỉnh về 4 phương án trắc nghiệm chuẩn.');
      }
      if (!['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())) {
        // Match option text if provided as full text
        const matchedIdx = options.findIndex((o: string) => o.toLowerCase() === correctAnswer.toLowerCase());
        if (matchedIdx !== -1) {
          correctAnswer = String.fromCharCode(65 + matchedIdx);
        } else {
          correctAnswer = 'A'; // Default fallback
        }
      } else {
        correctAnswer = correctAnswer.toUpperCase();
      }
    } else if (type === 'TRUE_FALSE') {
      options = undefined;
      const lowerAns = correctAnswer.toLowerCase();
      if (lowerAns.includes('đúng') || lowerAns === 'true' || lowerAns === 't') {
        correctAnswer = 'Đúng';
      } else {
        correctAnswer = 'Sai';
      }
    } else if (type === 'SHORT_ANSWER') {
      options = undefined;
      if (!correctAnswer) {
        correctAnswer = 'Đáp án mẫu';
      }
    }

    // 4. Explanation & Difficulty
    const explanation = typeof q.explanation === 'string' ? q.explanation.trim() : 'Giải thích câu hỏi.';
    let difficulty = q.difficulty;
    if (!['KNOWLEDGE', 'UNDERSTANDING', 'APPLICATION'].includes(difficulty)) {
      difficulty = 'UNDERSTANDING';
    }

    validQuestions.push({
      id: `ai-q-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      content,
      options,
      correctAnswer,
      explanation,
      difficulty,
      selected: true,
      warnings: itemWarnings,
    });
  });

  return { validQuestions, warnings: globalWarnings };
};
