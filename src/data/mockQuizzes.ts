import type { Quiz } from '../types';

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Phép nhân với số có hai chữ số',
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
        content: 'Khi nhân một số với 10, ta chỉ việc viết thêm một chữ số 0 vào bên phải số đó.',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Đúng',
        explanation: 'Quy tắc nhân nhẩm với 10.',
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
    title: 'Nước cần cho sự sống',
    subject: 'Khoa học',
    grade: 'Khối 4',
    questionCount: 2,
    createdAt: '2026-10-02',
    questions: [
      {
        id: 'q-201',
        type: 'MULTIPLE_CHOICE',
        content: 'Vòng tuần hoàn của nước trong tự nhiên gồm mấy thể?',
        options: ['1 thể', '2 thể', '3 thể (Rắn, Lỏng, Khí)', '4 thể'],
        correctAnswer: '3 thể (Rắn, Lỏng, Khí)',
        explanation: 'Nước tồn tại ở 3 thể: rắn (băng), lỏng (nước), khí (hơi nước).',
      },
      {
        id: 'q-202',
        type: 'TRUE_FALSE',
        content: 'Con người có thể sống thiếu nước trong 1 tháng mà vẫn khỏe mạnh.',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Sai',
        explanation: 'Con người chỉ có thể nhịn uống nước từ 3 đến 5 ngày.',
      },
    ],
  },
  {
    id: 'quiz-3',
    title: 'Danh từ và cụm danh từ',
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
        content: 'Danh từ chỉ người sinh ra và nuôi dưỡng em là gì?',
        correctAnswer: 'Cha mẹ',
        explanation: 'Hoặc: Bố mẹ, Ba mẹ.',
      },
    ],
  },
];
