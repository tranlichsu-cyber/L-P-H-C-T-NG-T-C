import type { AIGenerationOptions, AIGeneratedQuestion } from '../types';

export const QUESTION_GENERATION_PROMPT_VERSION = '1.0';

export const buildQuestionGenerationPrompt = (options: AIGenerationOptions): string => {
  const {
    grade,
    subject,
    topic,
    sourceText,
    isSourceGroundedOnly,
    questionCount,
    questionType,
    difficulty,
  } = options;

  let prompt = `Bạn là Trợ lý AI giáo dục chuyên môn cao cho giáo viên Tiểu học Việt Nam.
Hãy tạo chính xác ${questionCount} câu hỏi dành cho học sinh Lớp ${grade}, Môn ${subject}.

QUY TẮC BẮT BUỘC:
1. Ngôn ngữ: Tiếng Việt chuẩn mực, trong sáng, dễ hiểu, phù hợp với tâm lý lứa tuổi tiểu học.
2. Không dùng từ ngữ phức tạp, không dùng ngữ liệu nhạy cảm hay đáng sợ.
3. Loại câu hỏi: ${
    questionType === 'MIXED'
      ? 'Hỗn hợp các dạng (Trắc nghiệm, Đúng/Sai, Trả lời ngắn)'
      : questionType
  }.
4. Mức độ tư duy: ${
    difficulty === 'BALANCED'
      ? 'Cân bằng giữa Nhận biết (KNOWLEDGE), Thông hiểu (UNDERSTANDING) và Vận dụng (APPLICATION)'
      : difficulty
  }.
`;

  if (isSourceGroundedOnly && sourceText) {
    prompt += `
5. NGUYÊN TẮC SOURCE-GROUNDED BẮT BUỘC:
Chỉ sử dụng DUY NHẤT nội dung tài liệu sau đây để tạo câu hỏi và đáp án. Tuyệt đối không thêm thông tin hay sự kiện ngoài nguồn tài liệu này:
--- BẮT ĐẦU TÀI LIỆU NGUỒN ---
${sourceText}
--- KẾT THÚC TÀI LIỆU NGUỒN ---
`;
  } else if (topic) {
    prompt += `
Chủ đề bài học: "${topic}".
`;
  }

  prompt += `
ĐỊNH DẠNG ĐẦU RẠ CẦN THỎA MÃN (Chỉ trả về JSON thuần túy, không kèm prose):
[
  {
    "type": "MULTIPLE_CHOICE",
    "content": "Nội dung câu hỏi...",
    "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
    "correctAnswer": "A",
    "explanation": "Giải thích ngắn gọn...",
    "difficulty": "KNOWLEDGE"
  }
]
`;

  return prompt;
};

export const buildSingleQuestionRegenPrompt = (
  question: AIGeneratedQuestion,
  action: string,
  options: AIGenerationOptions
): string => {
  return `Bạn là Trợ lý AI giáo dục tiểu học.
Hãy chỉnh sửa hoặc viết lại câu hỏi sau đây cho học sinh Lớp ${options.grade}, Môn ${options.subject}:

Nội dung cũ: "${question.content}"
Loại: ${question.type}
Đáp án hiện tại: ${question.correctAnswer}

HÀNH ĐỘNG CẦN THỰC HIỆN: ${action}
- DỄ HƠN: Giảm bớt độ khó, dùng từ quen thuộc.
- KHÓ HƠN: Tăng tư duy suy luận nhưng không quá khối lớp.
- VIẾT DỄ HIỂU HƠN: Câu văn ngắn gọn, chỉ dẫn rõ.
- TẠO LẠI PHƯƠNG ÁN NHIỄU: Giữ nguyên câu hỏi và đáp án đúng, đổi 3 phương án nhiễu khác.
- TẠO GIẢI THÍCH: Viết giải thích chi tiết dễ hiểu.

Chỉ trả về 1 JSON object duy nhất theo định dạng AIGeneratedQuestion.
`;
};
