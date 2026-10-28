import type { Question } from '../../types';

export interface GameQuestionItem {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: 'KNOWLEDGE' | 'UNDERSTANDING' | 'APPLICATION';
}

export const SAMPLE_MILLIONAIRE_QUESTIONS: GameQuestionItem[] = [
  {
    id: 'm1',
    content: 'Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là thành phố nào?',
    options: ['Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Cần Thơ'],
    correctAnswer: 'Hà Nội',
    explanation: 'Hà Nội là thủ đô của Việt Nam từ năm 1976 đến nay.',
    difficulty: 'KNOWLEDGE',
  },
  {
    id: 'm2',
    content: 'Chiến thắng Bạch Đằng năm 938 do vị anh hùng dân tộc nào lãnh đạo?',
    options: ['Lý Thường Kiệt', 'Ngô Quyền', 'Trần Hưng Đạo', 'Quang Trung'],
    correctAnswer: 'Ngô Quyền',
    explanation: 'Ngô Quyền đã lãnh đạo nhân dân đánh tan quân Nam Hán trên sông Bạch Đằng năm 938, mở ra kỷ nguyên độc lập tự chủ.',
    difficulty: 'KNOWLEDGE',
  },
  {
    id: 'm3',
    content: 'Hình tròn có bao nhiêu cạnh?',
    options: ['0 cạnh', '1 cạnh', '2 cạnh', 'Vô số cạnh'],
    correctAnswer: '0 cạnh',
    explanation: 'Hình tròn là một đường cong khép kín, không có cạnh thẳng.',
    difficulty: 'KNOWLEDGE',
  },
  {
    id: 'm4',
    content: 'Thực vật quang hợp chủ yếu nhờ chất diệp lục có màu gì?',
    options: ['Màu đỏ', 'Màu vàng', 'Màu xanh lục', 'Màu tím'],
    correctAnswer: 'Màu xanh lục',
    explanation: 'Chất diệp lục (chlorophyll) hấp thụ ánh sáng và có màu xanh lục đặc trưng.',
    difficulty: 'UNDERSTANDING',
  },
  {
    id: 'm5',
    content: 'Bác Hồ đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình vào ngày tháng năm nào?',
    options: ['02/09/1945', '19/08/1945', '30/04/1975', '22/12/1944'],
    correctAnswer: '02/09/1945',
    explanation: 'Ngày 2/9/1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập khai sinh nước VNDCCH.',
    difficulty: 'UNDERSTANDING',
  },
  {
    id: 'm6',
    content: 'Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?',
    options: ['Sao Kim', 'Sao Thủy', 'Sao Hỏa', 'Trái Đất'],
    correctAnswer: 'Sao Thủy',
    explanation: 'Sao Thủy (Mercury) là hành tinh gần Mặt Trời nhất.',
    difficulty: 'UNDERSTANDING',
  },
  {
    id: 'm7',
    content: 'Trong tiếng Việt, từ nào dưới đây là từ láy?',
    options: ['Long lanh', 'Cây cối', 'Nhà cửa', 'Xe cộ'],
    correctAnswer: 'Long lanh',
    explanation: '"Long lanh" là từ láy âm đầu (l - l) gợi tả vẻ sáng bóng, lấp lánh.',
    difficulty: 'APPLICATION',
  },
  {
    id: 'm8',
    content: 'Nước đóng băng ở nhiệt độ bao nhiêu độ C (ở điều kiện áp suất tiêu chuẩn)?',
    options: ['0°C', '-5°C', '100°C', '4°C'],
    correctAnswer: '0°C',
    explanation: 'Nước tinh khiết chuyển từ thể lỏng sang thể rắn ở 0°C.',
    difficulty: 'KNOWLEDGE',
  },
  {
    id: 'm9',
    content: 'Đỉnh núi cao nhất Việt Nam và được mệnh danh là "Nóc nhà Đông Dương" là đỉnh núi nào?',
    options: ['Bà Đen', 'Fansipan', 'Mẫu Sơn', 'Ngọc Linh'],
    correctAnswer: 'Fansipan',
    explanation: 'Đỉnh Fansipan cao 3.143m thuộc dãy Hoàng Liên Sơn.',
    difficulty: 'UNDERSTANDING',
  },
  {
    id: 'm10',
    content: 'Chiến dịch Điện Biên Phủ toàn thắng vào ngày nào?',
    options: ['07/05/1954', '13/03/1954', '20/07/1954', '30/04/1975'],
    correctAnswer: '07/05/1954',
    explanation: 'Lúc 17h30 ngày 7/5/1954, lá cờ "Quyết chiến Quyết thắng" tung bay trên nóc hầm De Castries.',
    difficulty: 'APPLICATION',
  },
];

export const SAMPLE_MEMORY_PAIRS = [
  { id: '1', front: '938', back: 'Chiến thắng Bạch Đằng' },
  { id: '2', front: '1077', back: 'Phòng tuyến sông Như Nguyệt' },
  { id: '3', front: '1288', back: 'Bạch Đằng đại thắng lần 3' },
  { id: '4', front: '1427', back: 'Khởi nghĩa Lam Sơn thắng lợi' },
  { id: '5', front: '1789', back: 'Chiến thắng Ngọc Hồi - Đống Đa' },
  { id: '6', front: '1945', back: 'Cách mạng Tháng Tám' },
  { id: '7', front: '1954', back: 'Chiến thắng Điện Biên Phủ' },
  { id: '8', front: '1975', back: 'Đại thắng mùa Xuân' },
];

export const SAMPLE_DRAG_DROP_CATEGORIES = {
  title: 'Phân loại từ tiếng Việt',
  categories: [
    { id: 'cat1', name: 'Từ chỉ sự vật 🏫', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    { id: 'cat2', name: 'Từ chỉ hoạt động 🏃', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { id: 'cat3', name: 'Từ chỉ đặc điểm ✨', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  ],
  items: [
    { id: 'i1', text: 'Thước kẻ', categoryId: 'cat1' },
    { id: 'i2', text: 'Nhảy dây', categoryId: 'cat2' },
    { id: 'i3', text: 'Thực thà', categoryId: 'cat3' },
    { id: 'i4', text: 'Bảng đen', categoryId: 'cat1' },
    { id: 'i5', text: 'Học bài', categoryId: 'cat2' },
    { id: 'i6', text: 'Thông minh', categoryId: 'cat3' },
    { id: 'i7', text: 'Cây bàng', categoryId: 'cat1' },
    { id: 'i8', text: 'Đá bóng', categoryId: 'cat2' },
    { id: 'i9', text: 'Chăm chỉ', categoryId: 'cat3' },
  ],
};

export const SAMPLE_CROSSWORD_DATA = {
  title: 'Ô chữ Bí Mật: Chủ điểm Thầy Cô & Mái Trường',
  secretWord: 'TRI AN',
  clues: [
    {
      row: 1,
      word: 'TOAN',
      clue: 'Môn học về các con số, hình học và phép tính?',
      keyIndex: 0, // Letter 'T'
    },
    {
      row: 2,
      word: 'TRUONG',
      clue: 'Nơi chúng ta đến học tập cùng thầy cô và bè bạn mỗi ngày?',
      keyIndex: 1, // Letter 'R'
    },
    {
      row: 3,
      word: 'GIAO VIEN',
      clue: 'Người truyền đạt tri thức và dìu dắt học sinh khôn lớn?',
      keyIndex: 1, // Letter 'I'
    },
    {
      row: 4,
      word: 'BAN BE',
      clue: 'Những người cùng học, cùng chơi và giúp đỡ nhau trong lớp?',
      keyIndex: 1, // Letter 'A'
    },
    {
      row: 5,
      word: 'CHAM NGOAN',
      clue: 'Tính từ chỉ học sinh vâng lời, chăm chỉ học tập?',
      keyIndex: 4, // Letter 'N'
    },
  ],
};

export function adaptQuizQuestionsToGameItems(questions: Question[]): GameQuestionItem[] {
  if (!questions || questions.length === 0) return SAMPLE_MILLIONAIRE_QUESTIONS;

  return questions.map((q, idx) => {
    let opts = q.options && q.options.length >= 2 ? [...q.options] : [];
    if (opts.length === 0) {
      opts = [q.correctAnswer, 'Đáp án B', 'Đáp án C', 'Đáp án D'];
    }
    // Make sure correct answer is in options
    if (!opts.includes(q.correctAnswer)) {
      opts[0] = q.correctAnswer;
    }
    // Shuffle options so correct answer isn't always at same slot
    return {
      id: q.id || `q-${idx}`,
      content: q.content,
      options: opts,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || 'KNOWLEDGE',
    };
  });
}
