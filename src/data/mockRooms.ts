import type { MockRoom } from '../types/student';
import type { Question } from '../types';

export const MOCK_ROOM_839201: MockRoom = {
  roomId: 'room-001',
  roomCode: '839201',
  className: 'Lớp 4A',
  subject: 'Toán',
  teacherName: 'Cô Nguyễn Thị Hương',
  status: 'ACTIVE',
  expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
  students: [
    { id: 'student-1', name: 'Nguyễn Minh Anh' },
    { id: 'student-2', name: 'Trần Gia Bảo' },
    { id: 'student-3', name: 'Lê Hoàng Minh' },
    { id: 'student-4', name: 'Phạm Ngọc Anh' },
    { id: 'student-5', name: 'Nguyễn Hà My' },
    { id: 'student-6', name: 'Đỗ Minh Quân' },
  ],
};

export const MOCK_STUDENT_QUESTIONS: Record<string, Question> = {
  q1: {
    id: 'q1',
    type: 'MULTIPLE_CHOICE',
    content: '125 × 4 bằng bao nhiêu?',
    options: ['400', '450', '500', '550'],
    correctAnswer: '500',
    explanation: '125 × 4 = 100 × 4 + 25 × 4 = 400 + 100 = 500.',
  },
  q2: {
    id: 'q2',
    type: 'TRUE_FALSE',
    content: '1000 mét bằng 1 ki-lô-mét.',
    options: ['Đúng', 'Sai'],
    correctAnswer: 'Đúng',
    explanation: '1 km = 1000 m.',
  },
  q3: {
    id: 'q3',
    type: 'SHORT_ANSWER',
    content: 'Thủ đô của Việt Nam là gì?',
    correctAnswer: 'Hà Nội',
    explanation: 'Hà Nội là thủ đô của nước CHXHCN Việt Nam.',
  },
};
