import type { ClassGroup, Quiz, Room, Question } from '../types';

export const MOCK_CLASSES: ClassGroup[] = [
  {
    id: 'class-3a',
    name: 'Lớp 3A',
    grade: 'Khối 3',
    studentCount: 5,
    createdAt: '2026-09-05',
    students: [
      { id: 'std-1', name: 'Nguyễn Văn An', studentCode: '3A01' },
      { id: 'std-2', name: 'Trần Thị Bình', studentCode: '3A02' },
      { id: 'std-3', name: 'Lê Hoàng Cường', studentCode: '3A03' },
      { id: 'std-4', name: 'Phạm Ngọc Dũng', studentCode: '3A04' },
      { id: 'std-5', name: 'Hoàng Minh Anh', studentCode: '3A05' },
    ],
  },
  {
    id: 'class-4b',
    name: 'Lớp 4B',
    grade: 'Khối 4',
    studentCount: 4,
    createdAt: '2026-09-05',
    students: [
      { id: 'std-6', name: 'Đỗ Đức Hải', studentCode: '4B01' },
      { id: 'std-7', name: 'Ngô Thanh Hương', studentCode: '4B02' },
      { id: 'std-8', name: 'Vũ Quốc Khánh', studentCode: '4B03' },
      { id: 'std-9', name: 'Bùi Mai Linh', studentCode: '4B04' },
    ],
  },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    type: 'MULTIPLE_CHOICE',
    content: '125 × 4 bằng bao nhiêu?',
    options: ['400', '450', '500', '550'],
    correctAnswer: '500',
    explanation: '125 × 4 = 100 × 4 + 25 × 4 = 400 + 100 = 500.',
  },
  {
    id: 'q-2',
    type: 'TRUE_FALSE',
    content: 'Số 99 là số tự nhiên lớn nhất có 2 chữ số.',
    options: ['Đúng', 'Sai'],
    correctAnswer: 'Đúng',
    explanation: 'Số 99 là số tự nhiên lớn nhất có 2 chữ số.',
  },
  {
    id: 'q-3',
    type: 'SHORT_ANSWER',
    content: 'Hình vuông có 4 cạnh bằng nhau. Đúng hay Sai?',
    correctAnswer: 'Đúng',
    explanation: 'Hình vuông có 4 cạnh bằng nhau và 4 góc vuông.',
  },
];

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Ôn tập Toán lớp 3 - Bài 4',
    subject: 'Toán học',
    grade: 'Khối 3',
    questionCount: 3,
    questions: MOCK_QUESTIONS,
    createdAt: '2026-10-01',
  },
  {
    id: 'quiz-2',
    title: 'Tiếng Việt - Luyện từ và câu',
    subject: 'Tiếng Việt',
    grade: 'Khối 3',
    questionCount: 1,
    questions: [
      {
        id: 'q-4',
        type: 'MULTIPLE_CHOICE',
        content: 'Từ nào sau đây là từ chỉ hoạt động?',
        options: ['Chạy bộ', 'Ngôi nhà', 'Xanh lam', 'Hiền lành'],
        correctAnswer: 'Chạy bộ',
        explanation: '"Chạy bộ" là từ chỉ hoạt động của con người.',
      },
    ],
    createdAt: '2026-10-02',
  },
];

export const MOCK_ROOM: Room = {
  id: 'room-839201',
  roomCode: '839201',
  teacherId: 'teacher-1',
  classId: 'class-3a',
  className: 'Lớp 3A',
  subject: 'Toán học',
  status: 'ACTIVE',
  activeQuestionId: 'q-1',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
};
