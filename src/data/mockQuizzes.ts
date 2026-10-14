import type { Quiz } from '../types';

export const INITIAL_QUIZZES: Quiz[] = [
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
