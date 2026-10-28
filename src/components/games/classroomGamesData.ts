export interface GameQuestionItem {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: 'KNOWLEDGE' | 'UNDERSTANDING' | 'APPLICATION';
}

export interface CrosswordClue {
  row: number;
  word: string;
  clue: string;
  keyIndex: number;
}

export interface CrosswordGameData {
  title: string;
  secretWord: string;
  clues: CrosswordClue[];
}

export interface DragDropCategory {
  id: string;
  name: string;
  color: string;
}

export interface DragDropItem {
  id: string;
  text: string;
  categoryId: string;
}

export interface DragDropGameData {
  title: string;
  categories: DragDropCategory[];
  items: DragDropItem[];
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
    options: ['Ngô Quyền', 'Lý Thường Kiệt', 'Trần Hưng Đạo', 'Quang Trung'],
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
    options: ['Màu xanh lục', 'Màu đỏ', 'Màu vàng', 'Màu tím'],
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
    options: ['Sao Thủy', 'Sao Kim', 'Sao Hỏa', 'Trái Đất'],
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
    options: ['Fansipan', 'Bà Đen', 'Mẫu Sơn', 'Ngọc Linh'],
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
  { id: '1', front: 'Chiến thắng Bạch Đằng', back: 'Năm 938' },
  { id: '2', front: 'Phòng tuyến sông Như Nguyệt', back: 'Năm 1077' },
  { id: '3', front: 'Bạch Đằng đại thắng lần 3', back: 'Năm 1288' },
  { id: '4', front: 'Khởi nghĩa Lam Sơn', back: 'Năm 1427' },
  { id: '5', front: 'Chiến thắng Ngọc Hồi - Đống Đa', back: 'Năm 1789' },
  { id: '6', front: 'Cách mạng Tháng Tám', back: 'Năm 1945' },
  { id: '7', front: 'Chiến thắng Điện Biên Phủ', back: 'Năm 1954' },
  { id: '8', front: 'Đại thắng mùa Xuân', back: 'Năm 1975' },
];

export const SAMPLE_DRAG_DROP_CATEGORIES: DragDropGameData = {
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

export const SAMPLE_CROSSWORD_DATA: CrosswordGameData = {
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

/**
 * Remove Vietnamese accents/tones for crossword matching and typing
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase();
}

/**
 * Clean question prompt for neat card/crossword display
 */
export function cleanPrompt(text: string): string {
  if (!text) return '';
  return text
    .replace(/^câu\s*\d+[:.]?\s*/i, '')
    .replace(/^bài\s*\d+[:.]?\s*/i, '')
    .replace(/^em hãy\s*/i, '')
    .replace(/^hãy cho biết\s*/i, '')
    .replace(/^kết quả của phép tính\s*/i, '')
    .replace(/^theo em\s*/i, '')
    .replace(/^chọn đáp án đúng[:.]?\s*/i, '')
    .replace(/[?:!.]+$/, '')
    .trim();
}

/**
 * Resolve correct answer text whether stored as literal text or option key ('A', 'B', 'C', 'D' / 0, 1, 2, 3)
 */
export function resolveCorrectAnswerText(q: any): string {
  if (!q) return '';
  const ans = typeof q.correctAnswer === 'string' ? q.correctAnswer.trim() : String(q.correctAnswer || '').trim();
  const opts: string[] = Array.isArray(q.options) ? q.options.map((o: any) => String(o).trim()) : [];

  // If answer is single letter A, B, C, D
  if (/^[A-D]$/i.test(ans)) {
    const idx = ans.toUpperCase().charCodeAt(0) - 65;
    if (idx >= 0 && idx < opts.length && opts[idx]) {
      return opts[idx];
    }
  }

  // If answer is 0, 1, 2, 3 index
  if (/^[0-3]$/.test(ans)) {
    const idx = parseInt(ans, 10);
    if (idx >= 0 && idx < opts.length && opts[idx]) {
      return opts[idx];
    }
  }

  // Direct option match
  const found = opts.find((o) => o.toLowerCase() === ans.toLowerCase());
  if (found) return found;

  return ans;
}

/**
 * Adapt any quiz or question bank into 4-option multiple choice items
 */
export function adaptQuizQuestionsToGameItems(questions: any[]): GameQuestionItem[] {
  if (!questions || questions.length === 0) return SAMPLE_MILLIONAIRE_QUESTIONS;

  // Collect all resolved answers to supply distractors if needed
  const allResolvedAnswers = questions.map((q) => resolveCorrectAnswerText(q)).filter(Boolean);

  return questions.map((q, idx) => {
    const resolvedCorrect = resolveCorrectAnswerText(q);
    let opts =
      Array.isArray(q.options) && q.options.length >= 2
        ? [...q.options.map((o: any) => String(o).trim())]
        : [];

    if (opts.length < 2) {
      // Missing options: pick from other questions
      const otherAnswers = allResolvedAnswers.filter(
        (a) => a.toLowerCase() !== resolvedCorrect.toLowerCase()
      );
      const shuffledOthers = [...otherAnswers].sort(() => Math.random() - 0.5).slice(0, 3);
      opts = [resolvedCorrect, ...shuffledOthers];

      // If still fewer than 4, generate plausible alternatives
      if (opts.length < 4) {
        const numVal = parseFloat(resolvedCorrect.replace(/[^\d.-]/g, ''));
        if (!isNaN(numVal)) {
          const variants = [
            String(numVal + 1),
            String(Math.max(0, numVal - 1)),
            String(numVal * 2),
            String(numVal + 10),
          ];
          for (const v of variants) {
            if (opts.length < 4 && !opts.includes(v)) opts.push(v);
          }
        }
      }
      while (opts.length < 4) {
        opts.push(`Đáp án ${String.fromCharCode(65 + opts.length)}`);
      }
    } else {
      // Ensure resolved correct answer is present
      const hasCorrect = opts.some((o) => o.toLowerCase() === resolvedCorrect.toLowerCase());
      if (!hasCorrect) {
        opts[0] = resolvedCorrect;
      }
    }

    return {
      id: q.id || `q-${idx}`,
      content: q.content || `Câu hỏi số ${idx + 1}`,
      options: opts.slice(0, 4),
      correctAnswer: resolvedCorrect,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'KNOWLEDGE',
    };
  });
}

/**
 * Adapt any quiz into pairs for Memory Match (Lật thẻ tìm cặp)
 */
export function adaptToMemoryPairs(
  questions: any[],
  _quizTitle?: string
): Array<{ id: string; front: string; back: string }> {
  if (!questions || questions.length === 0) return SAMPLE_MEMORY_PAIRS;

  const validQuestions = questions.filter((q) => q && q.content);
  if (validQuestions.length === 0) return SAMPLE_MEMORY_PAIRS;

  const pairs = validQuestions.slice(0, 10).map((q, idx) => {
    const answer = resolveCorrectAnswerText(q);
    let front = cleanPrompt(q.content);
    if (front.length > 40) {
      front = front.slice(0, 37) + '...';
    }
    let back = answer;
    if (back.length > 35) {
      back = back.slice(0, 32) + '...';
    }
    return {
      id: `pair-${idx}-${q.id || idx}`,
      front: front || `Khái niệm ${idx + 1}`,
      back: back || `Kết quả ${idx + 1}`,
    };
  });

  return pairs.length >= 3 ? pairs : SAMPLE_MEMORY_PAIRS;
}

/**
 * Adapt any quiz into Drag & Drop categories & items
 */
export function adaptToDragDropData(
  questions: any[],
  quizTitle?: string
): DragDropGameData {
  if (!questions || questions.length === 0) return SAMPLE_DRAG_DROP_CATEGORIES;

  const validQuestions = questions.filter((q) => q && q.content);
  if (validQuestions.length < 3) return SAMPLE_DRAG_DROP_CATEGORIES;

  const title = quizTitle ? `Phân loại: ${quizTitle}` : 'Phân loại kiến thức bài học';

  // Strategy A: Check if questions can be categorized by Difficulty
  const hasDiffs = validQuestions.some((q) => q.difficulty);
  if (hasDiffs) {
    const categories: DragDropCategory[] = [
      { id: 'cat-kn', name: 'Nhận biết 🧠', color: 'bg-blue-100 text-blue-900 border-blue-300' },
      { id: 'cat-un', name: 'Thông hiểu 💡', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
      { id: 'cat-ap', name: 'Vận dụng 🚀', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    ];

    const items: DragDropItem[] = validQuestions.slice(0, 9).map((q, idx) => {
      let catId = 'cat-kn';
      if (q.difficulty === 'UNDERSTANDING') catId = 'cat-un';
      else if (q.difficulty === 'APPLICATION') catId = 'cat-ap';
      else {
        // distribute evenly if not specified
        const bucket = idx % 3;
        catId = bucket === 0 ? 'cat-kn' : bucket === 1 ? 'cat-un' : 'cat-ap';
      }

      let text = cleanPrompt(q.content);
      if (text.length > 40) text = text.slice(0, 37) + '...';

      return {
        id: `dd-item-${idx}`,
        text: text || `Câu hỏi ${idx + 1}`,
        categoryId: catId,
      };
    });

    return { title, categories, items };
  }

  // Strategy B: Universal True / False classification statements from the quiz!
  const categories: DragDropCategory[] = [
    { id: 'cat-true', name: 'Khẳng định ĐÚNG ✅', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { id: 'cat-false', name: 'Khẳng định SAI ❌', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  ];

  const items: DragDropItem[] = [];
  const sampleSet = validQuestions.slice(0, 5);

  sampleSet.forEach((q, idx) => {
    const prompt = cleanPrompt(q.content);
    const correctAns = resolveCorrectAnswerText(q);

    // Generate True item
    let trueText = `${prompt} ➔ ${correctAns}`;
    if (trueText.length > 50) trueText = trueText.slice(0, 47) + '...';
    items.push({
      id: `dd-t-${idx}`,
      text: trueText,
      categoryId: 'cat-true',
    });

    // Generate False item from first distractor
    const opts = Array.isArray(q.options) ? q.options : [];
    const wrongOpt = opts.find((o: string) => String(o).trim().toLowerCase() !== correctAns.toLowerCase()) || 'Sai lệch';
    let falseText = `${prompt} ➔ ${wrongOpt}`;
    if (falseText.length > 50) falseText = falseText.slice(0, 47) + '...';
    items.push({
      id: `dd-f-${idx}`,
      text: falseText,
      categoryId: 'cat-false',
    });
  });

  return {
    title: quizTitle ? `Đúng hay Sai: ${quizTitle}` : 'Phân loại Khẳng định Đúng / Sai',
    categories,
    items: items.sort(() => Math.random() - 0.5),
  };
}

/**
 * Adapt any quiz into a Crossword Puzzle (Đố chữ / Ô chữ tương tác)
 */
export function adaptToCrosswordData(
  questions: any[],
  quizTitle?: string
): CrosswordGameData {
  if (!questions || questions.length === 0) return SAMPLE_CROSSWORD_DATA;

  // Extract clean answers suitable for crossword rows
  const candidates: Array<{ answer: string; cleanWord: string; clue: string }> = [];

  questions.forEach((q) => {
    const rawAnswer = resolveCorrectAnswerText(q);
    const cleanWord = removeVietnameseTones(rawAnswer).replace(/[^A-Z]/g, '');

    // Allow words between 3 and 12 uppercase letters
    if (cleanWord.length >= 3 && cleanWord.length <= 12) {
      candidates.push({
        answer: rawAnswer,
        cleanWord,
        clue: q.content || 'Gợi ý từ khóa',
      });
    }
  });

  // If not enough textual answers in the quiz (e.g. pure numerical test), fallback to thematic subject crosswords
  if (candidates.length < 3) {
    const isMath = /toán|số|hình|phép/i.test(quizTitle || '');
    if (isMath) {
      return {
        title: quizTitle ? `Ô chữ: ${quizTitle}` : 'Ô chữ Bí Mật: Khám phá Toán học',
        secretWord: 'TOAN HOC',
        clues: [
          { row: 1, word: 'CHUSO', clue: 'Kí hiệu dùng để viết các số tự nhiên (0, 1, 2,...)?', keyIndex: 0 }, // T
          { row: 2, word: 'HINHTRON', clue: 'Hình học phẳng khép kín không có góc nào?', keyIndex: 6 }, // O
          { row: 3, word: 'PHEPCONG', clue: 'Phép tính tìm tổng của hai hay nhiều số?', keyIndex: 6 }, // A
          { row: 4, word: 'SOCHAN', clue: 'Số chia hết cho 2 có tận cùng là 0, 2, 4, 6, 8?', keyIndex: 4 }, // N
          { row: 5, word: 'HINHVUONG', clue: 'Tứ giác có 4 góc vuông và 4 cạnh bằng nhau?', keyIndex: 0 }, // H
          { row: 6, word: 'GOCNHON', clue: 'Góc bé hơn góc vuông gọi là gì?', keyIndex: 1 }, // O
          { row: 7, word: 'CHUVI', clue: 'Tổng độ dài các cạnh bao quanh một hình học?', keyIndex: 0 }, // C
        ],
      };
    }

    return SAMPLE_CROSSWORD_DATA;
  }

  // Derive Secret Word from Title or default to TRI THUC / VIET NAM
  let secretWord = 'TRI THUC';
  if (/lịch sử|địa lí|quê hương|dân tộc/i.test(quizTitle || '')) {
    secretWord = 'VIET NAM';
  } else if (/toán/i.test(quizTitle || '')) {
    secretWord = 'TOAN HOC';
  }

  const cleanSecret = secretWord.replace(/\s+/g, '').toUpperCase();
  const clues: CrosswordClue[] = [];
  const usedWords = new Set<string>();

  for (let sIdx = 0; sIdx < cleanSecret.length; sIdx++) {
    const targetChar = cleanSecret[sIdx];
    // Find candidate that contains targetChar
    const match = candidates.find(
      (c) => !usedWords.has(c.cleanWord) && c.cleanWord.includes(targetChar)
    );

    if (match) {
      usedWords.add(match.cleanWord);
      clues.push({
        row: clues.length + 1,
        word: match.cleanWord,
        clue: match.clue,
        keyIndex: match.cleanWord.indexOf(targetChar),
      });
    } else {
      // Pick any remaining candidate
      const fallback = candidates.find((c) => !usedWords.has(c.cleanWord));
      if (fallback) {
        usedWords.add(fallback.cleanWord);
        clues.push({
          row: clues.length + 1,
          word: fallback.cleanWord,
          clue: fallback.clue,
          keyIndex: 0,
        });
      }
    }
  }

  return {
    title: quizTitle ? `Ô chữ: ${quizTitle}` : 'Ô chữ Bí Mật Bài Học',
    secretWord,
    clues: clues.length >= 3 ? clues : SAMPLE_CROSSWORD_DATA.clues,
  };
}
