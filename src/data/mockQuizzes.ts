import type { Quiz } from '../types';
import { BUILTIN_MIDTERM_QUIZZES } from './exams/builtInMidtermExams';

export const LTVC_TUAN_11_CUNG_CO_QUIZ: Quiz = {
  id: 'quiz-ltvc-tuan-11-cung-co',
  teacherId: 'editorial',
  title: 'LTVC TUẦN 11 ( Củng cố)',
  subject: 'Tiếng Việt',
  grade: 'Khối 4',
  questionCount: 3,
  createdAt: '2026-11-03',
  visibility: 'SCHOOL',
  questions: [
    {
      id: 'ltvc-t11-cc-q1',
      type: 'MULTIPLE_CHOICE',
      content: 'Điền từ thích hợp vào chỗ trống: Nhanh như….',
      options: ['chớp', 'hổ', 'rùa', 'sư tử'],
      correctAnswer: 'chớp',
      explanation: 'Thành ngữ so sánh chỉ sự nhanh nhẹn: "Nhanh như chớp".',
      correctPoints: 10,
      wrongPenalty: 5,
      difficulty: 'KNOWLEDGE',
    },
    {
      id: 'ltvc-t11-cc-q2',
      type: 'MULTIPLE_CHOICE',
      content: 'Câu nào có sử dụng biện pháp nhân hóa?',
      options: [
        'Những cơn gió thổi nhẹ trên mặt hồ',
        'Những chị gió đang vui đùa trên mặt hồ',
        'Mặt hồ xanh biếc',
        'Mặt trời lặn ở đằng Tây',
      ],
      correctAnswer: 'Những chị gió đang vui đùa trên mặt hồ',
      explanation:
        'Trong câu "Những chị gió đang vui đùa trên mặt hồ", sự vật "gió" được gọi bằng từ chỉ người ("chị") và tả bằng từ ngữ chỉ hoạt động của người ("vui đùa").',
      correctPoints: 10,
      wrongPenalty: 5,
      difficulty: 'UNDERSTANDING',
    },
    {
      id: 'ltvc-t11-cc-q3',
      type: 'MULTIPLE_CHOICE',
      content: 'Tác dụng của biện pháp nhân hóa là gì?',
      options: [
        'Giúp sự vật, hiện tượng có hồn hơn',
        'Giúp sự vật, hiện tượng giống như con người',
        'Giúp câu văn trở nên sinh động, ngộ nghĩnh',
        'Cả 3 đáp án trên',
      ],
      correctAnswer: 'Cả 3 đáp án trên',
      explanation:
        'Biện pháp nhân hóa giúp sự vật, hiện tượng có hồn hơn, giống như con người và giúp câu văn trở nên sinh động, ngộ nghĩnh.',
      correctPoints: 10,
      wrongPenalty: 5,
      difficulty: 'UNDERSTANDING',
    },
  ],
};

export const BUILTIN_QUIZZES: Quiz[] = [
  LTVC_TUAN_11_CUNG_CO_QUIZ,
  ...BUILTIN_MIDTERM_QUIZZES,
];

export function mergeWithBuiltInQuizzes(list: Quiz[]): Quiz[] {
  const existingIds = new Set(list.map((q) => q.id));
  const missing = BUILTIN_QUIZZES.filter((q) => !existingIds.has(q.id));
  return [...missing, ...list];
}

export const INITIAL_QUIZZES: Quiz[] = [
  ...BUILTIN_QUIZZES,
  {
    id: 'quiz-1',
    title: 'Bài 43 – Nhân với số có hai chữ số',
    subject: 'Toán',
    grade: 'Khối 4',
    questionCount: 3,
    createdAt: '2026-10-01',
    questions: [
      {
        id: 'q-101',
        type: 'MULTIPLE_CHOICE',
        content: 'Kết quả của phép tính 25 × 12 là bao nhiêu?',
        options: ['250', '280', '300', '320'],
        correctAnswer: '300',
        explanation: '25 × 12 = 25 × 10 + 25 × 2 = 250 + 50 = 300.',
      },
      {
        id: 'q-102',
        type: 'TRUE_FALSE',
        content: 'Khi nhân một số tự nhiên với 10, ta chỉ việc viết thêm một chữ số 0 vào bên phải số đó.',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Đúng',
        explanation: 'Với số tự nhiên, nhân với 10 được kết quả bằng cách viết thêm một chữ số 0 vào bên phải cách viết số đó.',
      },
      {
        id: 'q-103',
        type: 'SHORT_ANSWER',
        content: 'Tính diện tích hình chữ nhật có chiều dài 15cm và chiều rộng 10cm (nhập số):',
        correctAnswer: '150',
        explanation: 'Diện tích = 15 × 10 = 150 (cm²).',
      },
    ],
  },
  {
    id: 'quiz-2',
    title: 'Ôn tập bài 1–2 – Nước và cuộc sống',
    subject: 'Khoa học',
    grade: 'Khối 4',
    questionCount: 2,
    createdAt: '2026-10-02',
    questions: [
      {
        id: 'q-201',
        type: 'MULTIPLE_CHOICE',
        content: 'Nước có thể tồn tại ở những thể nào?',
        options: ['Chỉ thể rắn', 'Chỉ thể lỏng', 'Thể rắn, thể lỏng và thể khí', 'Chỉ thể khí'],
        correctAnswer: 'Thể rắn, thể lỏng và thể khí',
        explanation: 'Nước tồn tại ở 3 thể: rắn (băng), lỏng (nước), khí (hơi nước).',
      },
      {
        id: 'q-202',
        type: 'TRUE_FALSE',
        content: 'Con người có thể sống thiếu nước trong 1 tháng mà vẫn khỏe mạnh.',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Sai',
        explanation: 'Nước cần thiết cho các hoạt động sống của cơ thể. Cần uống đủ nước sạch, không thử nhịn uống nước.',
      },
    ],
  },
  {
    id: 'quiz-3',
    title: 'Tuần 2 – Danh từ chung, danh từ riêng',
    subject: 'Tiếng Việt',
    grade: 'Khối 4',
    questionCount: 2,
    createdAt: '2026-10-03',
    questions: [
      {
        id: 'q-301',
        type: 'MULTIPLE_CHOICE',
        content: 'Từ nào dưới đây là danh từ riêng chỉ tên địa danh?',
        options: ['Ngôi trường', 'Sông Hồng', 'Con đường', 'Học sinh'],
        correctAnswer: 'Sông Hồng',
        explanation: 'Sông Hồng là tên riêng địa danh, cần viết hoa.',
      },
      {
        id: 'q-302',
        type: 'SHORT_ANSWER',
        content: 'Trong câu “Mẹ đang đọc sách.”, danh từ chỉ người là từ nào?',
        correctAnswer: 'Mẹ',
        explanation: 'Mẹ là danh từ chỉ người trong câu.',
      },
    ],
  },
];
