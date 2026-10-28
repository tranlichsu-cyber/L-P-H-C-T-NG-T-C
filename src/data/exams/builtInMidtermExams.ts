import type { SelfPracticeQuiz } from '../../services/selfPractice/content';
import type { Quiz } from '../../types';

export const BUILTIN_MIDTERM_EXAMS: SelfPracticeQuiz[] = [
  // ==========================================
  // ĐỀ 1: TOÁN LỚP 4 – TRƯỜNG TIỂU HỌC SÔNG CÔNG
  // ==========================================
  {
    id: 'gk1-2026-grade4-math-01',
    teacherId: 'editorial',
    title: 'Đề ôn GHKI - Lớp 4 - Toán - Đề 01',
    subject: 'Toán',
    grade: 'Khối 4',
    category: 'EXAM',
    durationMinutes: 40,
    published: true,
    updatedAt: '2026-10-28',
    instructions:
      'Đề kiểm tra giữa học kì I môn Toán lớp 4 – Trường Tiểu học Sông Công. Thời gian làm bài: 40 phút. Gồm Phần I: Trắc nghiệm (9 câu) và Phần II: Tự luận (4 bài tính toán và giải toán). Em hãy làm bài cẩn thận và kiểm tra lại kết quả trước khi nộp.',
    questions: [
      {
        id: 'toan4-gk1-c01',
        type: 'MULTIPLE_CHOICE',
        content:
          'Câu 1 (MĐ1). Số gồm 6 trăm triệu, 5 chục triệu, 5 chục nghìn, 3 chục, 7 đơn vị được viết là:',
        options: ['65 537', '605 500 037', '650 050 370', '650 050 037'],
        correctAnswer: '650 050 037',
        points: 0.5,
        explanation:
          'Lớp triệu: 6 trăm triệu + 5 chục triệu = 650 triệu. Lớp nghìn: 5 chục nghìn = 050 nghìn. Lớp đơn vị: 3 chục + 7 đơn vị = 037. Viết là: 650 050 037.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c02',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 2 (MĐ1). Chữ số 4 trong số 214 538 007 thuộc hàng nào?',
        options: ['Hàng nghìn', 'Hàng triệu', 'Hàng chục triệu', 'Hàng trăm'],
        correctAnswer: 'Hàng triệu',
        points: 0.5,
        explanation:
          'Trong số 214 538 007, chữ số 4 đứng ở hàng triệu, thuộc lớp triệu (2 trăm triệu, 1 chục triệu, 4 triệu).',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c03',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 3 (MĐ1). Làm tròn số 19 762 318 đến hàng trăm nghìn được số nào?',
        options: ['19 800 000', '20 000 000', '19 770 000', '19 700 000'],
        correctAnswer: '19 800 000',
        points: 0.5,
        explanation:
          'Chữ số hàng chục nghìn là 6 (≥ 5), nên ta làm tròn tăng chữ số hàng trăm nghìn lên 1 đơn vị: 19 762 318 làm tròn thành 19 800 000.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c04',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 4 (MĐ2). Số chẵn nhỏ nhất có 5 chữ số khác nhau là:',
        options: ['12 340', '10 234', '10 340', '10 124'],
        correctAnswer: '10 234',
        points: 0.5,
        explanation:
          'Để số nhỏ nhất có 5 chữ số khác nhau: chữ số hàng chục nghìn là 1, hàng nghìn là 0, hàng trăm là 2, hàng chục là 3, và hàng đơn vị phải chẵn (khác 0 và 2) nên chọn 4. Ta được số 10 234.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c05',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 5 (MĐ2). Với a = 4 thì biểu thức 150 + 3 × a có giá trị là:',
        options: ['612', '600', '162', '165'],
        correctAnswer: '162',
        points: 0.5,
        explanation:
          'Thay a = 4 vào biểu thức: 150 + 3 × 4 = 150 + 12 = 162. (Thực hiện nhân trước, cộng sau).',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c06',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 6 (MĐ1). Đinh Bộ Lĩnh sinh năm 924, năm đó thuộc thế kỉ nào?',
        options: ['Thế kỉ XI', 'Thế kỉ X', 'Thế kỉ IX', 'Thế kỉ XII'],
        correctAnswer: 'Thế kỉ X',
        points: 0.5,
        explanation:
          'Từ năm 901 đến năm 1000 thuộc thế kỉ thứ mười (thế kỉ X). Vậy năm 924 thuộc thế kỉ X.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c07',
        type: 'MULTIPLE_CHOICE',
        content:
          'Câu 7 (MĐ3). Cho hình thang có một đường cao vuông góc với đáy chia hình thành 1 tam giác vuông và 1 hình thang vuông. Quan sát và đếm các góc, hình vẽ có những góc nào?',
        options: [
          'Hình bên có 2 góc vuông, 2 góc nhọn, 1 góc tù, 1 góc bẹt',
          'Hình bên có 3 góc vuông, 2 góc nhọn, 1 góc tù, 1 góc bẹt',
          'Hình bên có 3 góc vuông, 3 góc nhọn, 1 góc tù, 1 góc bẹt',
          'Hình bên có 3 góc vuông, 3 góc nhọn, 2 góc tù, 1 góc bẹt',
        ],
        correctAnswer: 'Hình bên có 3 góc vuông, 3 góc nhọn, 2 góc tù, 1 góc bẹt',
        points: 0.5,
        explanation:
          'Theo hướng dẫn chấm chính thức: Hình bên có 3 góc vuông, 3 góc nhọn, 2 góc tù và 1 góc bẹt.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c08',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 8 (MĐ1). Chữ số 5 trong số 14 531 274 có giá trị là bao nhiêu?',
        options: ['50 000', '500 000', '5 000 000', '5 000'],
        correctAnswer: '500 000',
        points: 0.5,
        explanation:
          'Chữ số 5 đứng ở hàng trăm nghìn trong số 14 531 274 nên có giá trị là 500 000.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c09',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 9 (MĐ3). Số liền trước của số chẵn nhỏ nhất có năm chữ số khác nhau là:',
        options: ['10 324', '10 432', '10 234', '10 233'],
        correctAnswer: '10 233',
        points: 0.5,
        explanation:
          'Số chẵn nhỏ nhất có 5 chữ số khác nhau là 10 234. Số liền trước của 10 234 là 10 234 − 1 = 10 233.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c10a',
        type: 'SHORT_ANSWER',
        content:
          'Bài 1a – Tự luận (0,25 điểm). Đặt tính rồi tính ra giấy nháp: 53 011 + 5 159. Nhập kết quả:',
        correctAnswer: '58170',
        points: 0.25,
        explanation: '53 011 + 5 159 = 58 170.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c10b',
        type: 'SHORT_ANSWER',
        content:
          'Bài 1b – Tự luận (0,25 điểm). Đặt tính rồi tính ra giấy nháp: 22 311 − 15 213. Nhập kết quả:',
        correctAnswer: '7098',
        points: 0.25,
        explanation: '22 311 − 15 213 = 7 098.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c10c',
        type: 'SHORT_ANSWER',
        content:
          'Bài 1c – Tự luận (0,25 điểm). Đặt tính rồi tính ra giấy nháp: 16 415 × 4. Nhập kết quả:',
        correctAnswer: '65660',
        points: 0.25,
        explanation: '16 415 × 4 = 65 660.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c10d',
        type: 'SHORT_ANSWER',
        content:
          'Bài 1d – Tự luận (0,25 điểm). Đặt tính rồi tính ra giấy nháp: 26 015 : 5. Nhập kết quả:',
        correctAnswer: '5203',
        points: 0.25,
        explanation: '26 015 : 5 = 5 203.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c11a',
        type: 'SHORT_ANSWER',
        content: 'Bài 2a – Đổi đơn vị (0,25 điểm). Điền số thích hợp: 15 tạ 7 yến = … kg (chỉ nhập số)',
        correctAnswer: '1570',
        points: 0.25,
        explanation: '15 tạ = 1 500 kg; 7 yến = 70 kg. 1 500 + 70 = 1 570 kg.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c11b',
        type: 'SHORT_ANSWER',
        content: 'Bài 2b – Đổi đơn vị (0,25 điểm). Điền số thích hợp: 3 tấn 3 yến = … yến (chỉ nhập số)',
        correctAnswer: '303',
        points: 0.25,
        explanation: '3 tấn = 300 yến. 300 + 3 = 303 yến.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c11c',
        type: 'SHORT_ANSWER',
        content:
          'Bài 2c – Đổi đơn vị (0,25 điểm). Điền số thích hợp: 26 m² 7 dm² = … dm² (chỉ nhập số)',
        correctAnswer: '2607',
        points: 0.25,
        explanation: '26 m² = 2 600 dm². 2 600 + 7 = 2 607 dm².',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c11d',
        type: 'SHORT_ANSWER',
        content:
          'Bài 2d – Đổi đơn vị (0,25 điểm). Điền số thích hợp: 2 m² 5 dm² = … cm² (chỉ nhập số)',
        correctAnswer: '20500',
        points: 0.25,
        explanation: '2 m² = 20 000 cm²; 5 dm² = 500 cm². 20 000 + 500 = 20 500 cm².',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c12a',
        type: 'SHORT_ANSWER',
        content:
          'Bài 3a – Tính giá trị biểu thức (0,5 điểm). Tính: 32 895 : 5 + 45 023. Nhập kết quả:',
        correctAnswer: '51602',
        points: 0.5,
        explanation: '32 895 : 5 + 45 023 = 6 579 + 45 023 = 51 602.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c12b',
        type: 'SHORT_ANSWER',
        content:
          'Bài 3b – Tính giá trị biểu thức (0,5 điểm). Tính: 160 + 4 748 − 186 × 6. Nhập kết quả:',
        correctAnswer: '3792',
        points: 0.5,
        explanation: '160 + 4 748 − 186 × 6 = 160 + 4 748 − 1 116 = 4 908 − 1 116 = 3 792.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c13',
        type: 'SHORT_ANSWER',
        content:
          'Bài 3 (M3 – 2 điểm). Một thùng dầu có 200 lít. Lần đầu cửa hàng bán được 30 lít dầu. Lần thứ hai cửa hàng bán được số lít dầu gấp đôi số lít dầu bán được trong lần thứ nhất. Lần thứ ba cửa hàng bán được 40 lít dầu. Hỏi sau ba lần bán, trong thùng còn lại bao nhiêu lít dầu? (Em nhập đáp số số lít dầu còn lại):',
        correctAnswer: '70',
        points: 2,
        explanation:
          'Bài giải: Lần thứ hai cửa hàng bán được số lít dầu là: 30 × 2 = 60 (lít). Cả ba lần bán được: 30 + 60 + 40 = 130 (lít). Trong thùng còn lại số lít dầu là: 200 − 130 = 70 (lít). Đáp số: 70 lít.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-gk1-c14',
        type: 'SHORT_ANSWER',
        content:
          'Bài 4 (M3 – 0,5 điểm). Viết tất cả các số tròn chục có 4 chữ số khác nhau, biết tổng các chữ số của số đó bằng 6. Hãy nhập các số tìm được theo thứ tự tăng dần (cách nhau bởi dấu phẩy):',
        correctAnswer: '1230, 1320, 2130, 2310, 3120, 3210',
        points: 0.5,
        explanation:
          'Số tròn chục có chữ số tận cùng là 0. Ba chữ số còn lại khác nhau và có tổng bằng 6 là: 1, 2, 3 (vì 1+2+3 = 6). Các số ghép được là: 1230, 1320, 2130, 2310, 3120, 3210.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
    ],
  },

  // ==========================================
  // ĐỀ 2: TOÁN LỚP 4 – TRƯỜNG TIỂU HỌC SÔNG CÔNG
  // ==========================================
  {
    id: 'gk1-2026-grade4-math-02',
    teacherId: 'editorial',
    title: 'Đề ôn GHKI - Lớp 4 - Toán - Đề 02',
    subject: 'Toán',
    grade: 'Khối 4',
    category: 'EXAM',
    durationMinutes: 40,
    published: true,
    updatedAt: '2026-10-28',
    instructions:
      'Đề kiểm tra giữa học kì I môn Toán lớp 4 – Trường Tiểu học Sông Công (Đề số 2). Thời gian làm bài: 40 phút. Gồm Phần I: Trắc nghiệm (6 câu - 3 điểm) và Phần II: Tự luận (4 bài - 7 điểm). Em hãy đọc kĩ đề bài và tính toán cẩn thận.',
    questions: [
      {
        id: 'toan4-de2-c01',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 1 (0,5 điểm). Số 68 405 được đọc là:',
        options: [
          'Sáu mươi tám nghìn bốn trăm linh năm',
          'Sáu mươi tám nghìn bốn trăm năm mươi',
          'Sáu mươi tám nghìn bốn trăm không trăm năm',
          'Sáu nghìn tám trăm bốn mươi lăm',
        ],
        correctAnswer: 'Sáu mươi tám nghìn bốn trăm linh năm',
        points: 0.5,
        explanation: 'Số 68 405 đọc là: Sáu mươi tám nghìn bốn trăm linh năm.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c02',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 2 (0,5 điểm). Chữ số 8 trong số 867 952 431 thuộc hàng nào, lớp nào?',
        options: [
          'Hàng triệu, lớp triệu',
          'Hàng trăm nghìn, lớp nghìn',
          'Hàng trăm triệu, lớp triệu',
          'Hàng chục triệu, lớp triệu',
        ],
        correctAnswer: 'Hàng trăm triệu, lớp triệu',
        points: 0.5,
        explanation: 'Trong số 867 952 431, chữ số 8 đứng ở hàng trăm triệu, thuộc lớp triệu.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c03',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 3 (0,5 điểm). Điền Đ (Đúng) hoặc S (Sai) vào nhận định: a) Số 35 728 là số lẻ. b) Số 46 000 là số chẵn.',
        options: [
          'a) S — b) Đ (35 728 là số lẻ: Sai; 46 000 là số chẵn: Đúng)',
          'a) Đ — b) S (35 728 là số lẻ: Đúng; 46 000 là số chẵn: Sai)',
          'a) Đ — b) Đ (Cả hai câu đều đúng)',
          'a) S — b) S (Cả hai câu đều sai)',
        ],
        correctAnswer: 'a) S — b) Đ (35 728 là số lẻ: Sai; 46 000 là số chẵn: Đúng)',
        points: 0.5,
        explanation:
          'Số 35 728 tận cùng bằng 8 là số chẵn nên nhận định "là số lẻ" là SAI (S). Số 46 000 tận cùng bằng 0 là số chẵn nên nhận định "là số chẵn" là ĐÚNG (Đ).',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c04',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 4 (0,5 điểm). Góc có số đo 90° và góc có số đo 125° lần lượt là:',
        options: [
          'Góc vuông và góc tù',
          'Góc nhọn và góc vuông',
          'Góc bẹt và góc tù',
          'Góc vuông và góc nhọn',
        ],
        correctAnswer: 'Góc vuông và góc tù',
        points: 0.5,
        explanation: 'Góc 90° là góc vuông; góc 125° (lớn hơn 90° và bé hơn 180°) là góc tù.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c05',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 5 (0,5 điểm). 8 tấn 15 kg = … kg. Số cần điền vào chỗ chấm là:',
        options: ['950 kg', '815 kg', '8 015 kg', '8 150 kg'],
        correctAnswer: '8 015 kg',
        points: 0.5,
        explanation: '8 tấn = 8 000 kg. 8 000 kg + 15 kg = 8 015 kg.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c06',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 6 (0,5 điểm). Làm tròn số 5 278 381 đến hàng trăm nghìn ta được số nào?',
        options: ['5 278 000', '5 000 381', '5 200 000', '5 300 000'],
        correctAnswer: '5 300 000',
        points: 0.5,
        explanation:
          'Chữ số hàng chục nghìn là 7 (≥ 5) nên làm tròn tăng lên hàng trăm nghìn: 5 278 381 làm tròn thành 5 300 000.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c07a',
        type: 'SHORT_ANSWER',
        content:
          'Bài 1a – Tự luận (0,5 điểm). Đặt tính rồi tính ra giấy nháp: 58 623 + 25 047. Nhập kết quả:',
        correctAnswer: '83670',
        points: 0.5,
        explanation: '58 623 + 25 047 = 83 670.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c07b',
        type: 'SHORT_ANSWER',
        content: 'Bài 1b – Tự luận (0,5 điểm). Đặt tính rồi tính ra giấy nháp: 36 073 − 2 855. Nhập kết quả:',
        correctAnswer: '33218',
        points: 0.5,
        explanation: '36 073 − 2 855 = 33 218.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c07c',
        type: 'SHORT_ANSWER',
        content: 'Bài 1c – Tự luận (0,5 điểm). Đặt tính rồi tính ra giấy nháp: 17 218 × 4. Nhập kết quả:',
        correctAnswer: '68872',
        points: 0.5,
        explanation: '17 218 × 4 = 68 872.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c07d',
        type: 'SHORT_ANSWER',
        content: 'Bài 1d – Tự luận (0,5 điểm). Đặt tính rồi tính ra giấy nháp: 88 445 : 7. Nhập kết quả:',
        correctAnswer: '12635',
        points: 0.5,
        explanation: '88 445 : 7 = 12 635.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c08a',
        type: 'SHORT_ANSWER',
        content:
          'Bài 2a – Tính giá trị biểu thức (1,5 điểm). Tính giá trị của biểu thức a + b × c với a = 2 370, b = 105 và c = 6. Nhập kết quả:',
        correctAnswer: '3000',
        points: 1.5,
        explanation: 'Thay số: 2 370 + 105 × 6 = 2 370 + 630 = 3 000.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c08b',
        type: 'SHORT_ANSWER',
        content:
          'Bài 2b – Tính giá trị biểu thức (0,5 điểm). Tính giá trị của: 24 000 : 6 × 5. Nhập kết quả:',
        correctAnswer: '20000',
        points: 0.5,
        explanation: '24 000 : 6 × 5 = 4 000 × 5 = 20 000.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c09',
        type: 'SHORT_ANSWER',
        content:
          'Bài 3 – Giải toán có lời văn (2 điểm). An mua 1 bút mực và 6 quyển vở. Giá một bút mực là 15 000 đồng, mỗi quyển vở giá 8 500 đồng. An đưa cô bán hàng 100 000 đồng. Hỏi cô bán hàng phải trả lại cho An bao nhiêu tiền? (Em nhập số tiền cần trả lại, ví dụ 34000):',
        correctAnswer: '34000',
        points: 2,
        explanation:
          'Bài giải: Mua 6 quyển vở hết: 8 500 × 6 = 51 000 (đồng). Tổng tiền mua bút và vở: 51 000 + 15 000 = 66 000 (đồng). Cô bán hàng trả lại An: 100 000 − 66 000 = 34 000 (đồng). Đáp số: 34 000 đồng.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c10a',
        type: 'SHORT_ANSWER',
        content:
          'Bài 4a – Tìm số (0,5 điểm). Cho các chữ số 1, 0, 5, 3, 7 và 8. Hãy lập số lớn nhất có 6 chữ số khác nhau từ các chữ số trên. Nhập số lập được:',
        correctAnswer: '875310',
        points: 0.5,
        explanation: 'Để được số lớn nhất có 6 chữ số khác nhau, ta xếp các chữ số theo thứ tự từ lớn đến bé: 875 310.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'toan4-de2-c10b',
        type: 'SHORT_ANSWER',
        content:
          'Bài 4b – Tìm số (0,5 điểm). Cho các chữ số 1, 0, 5, 3, 7 và 8. Hãy lập số bé nhất có 6 chữ số khác nhau từ các chữ số trên. Nhập số lập được:',
        correctAnswer: '103578',
        points: 0.5,
        explanation: 'Để được số bé nhất có 6 chữ số khác nhau, chữ số đầu tiên phải khác 0 nhỏ nhất là 1, các chữ số còn lại xếp từ bé đến lớn: 103 578.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
    ],
  },

  // ==========================================
  // ĐỀ 1: TIẾNG VIỆT – TRƯỜNG TIỂU HỌC SÔNG CÔNG (VÕ THỊ SÁU)
  // ==========================================
  {
    id: 'gk1-2026-grade4-vietnamese-01',
    teacherId: 'editorial',
    title: 'Đề ôn GHKI - Lớp 4 - Tiếng Việt - Đề 01',
    subject: 'Tiếng Việt',
    grade: 'Khối 4',
    category: 'EXAM',
    durationMinutes: 60,
    published: true,
    updatedAt: '2026-10-28',
    passageTitle: 'Câu chuyện về chị Võ Thị Sáu',
    passageAttribution: 'Trích trong quyển Cẩm nang đội viên',
    passage:
      'Vào năm mười hai tuổi, Sáu đã đi theo anh trai tham gia hoạt động cách mạng. Mỗi lần được các anh giao nhiệm vụ gì Sáu đều hoàn thành tốt. Một hôm, Sáu mang lựu đạn phục kích giết tên cai Tòng, một tên Việt gian bán nước ngay tại xã nhà. Lần đó, Sáu bị giặc bắt. Sau gần ba năm tra tấn, giam cầm, giặc Pháp đưa chị ra ở Côn Đảo.\n\nTrong ngục giam, chị vẫn hồn nhiên, vui tươi, tin tưởng vào ngày chiến thắng của đất nước. Bọn giặc Pháp đã lén lút đem chị đi thủ tiêu, vì sợ các chiến sĩ cách mạng trong tù sẽ nổi giận phản đối. Trên đường ra pháp trường, chị đã ngắt một bông hoa còn ướt đẫm sương đêm cài lên tóc. Bọn chúng kinh ngạc vì thấy một người trước lúc hi sinh lại bình tĩnh đến thế. Tới bãi đất, chị gỡ bông hoa từ mái tóc mình tặng cho người lính Âu Phi. Chị đi tới cột trói: mỉm cười, chị nhìn trời xanh bao la và chị cất cao giọng hát.\n\nLúc một tên lính bảo chị quỳ xuống, chị đã quát vào mặt lũ đao phủ: “Tao chỉ biết đứng không biết quỳ”.\n\nMột tiếng hô: “Bắn”.\n\nMột tràng súng nổ, chị Sáu ngã xuống. Máu chị thấm ướt bãi cát.',
    instructions:
      'Đề kiểm tra giữa học kì I môn Tiếng Việt lớp 4 – Trường Tiểu học Sông Công. Thời gian làm bài: 60 phút. Gồm Phần A: Kiểm tra đọc và kiến thức tiếng Việt (Đọc văn bản chị Võ Thị Sáu và trả lời các câu hỏi) và Phần B: Kiểm tra viết (Kể lại một câu chuyện cổ tích yêu thích).',
    questions: [
      {
        id: 'tv4-gk1-c01',
        type: 'MULTIPLE_CHOICE',
        content:
          'Câu 1 (M1 – 0,5 đ). Chị Võ Thị Sáu tham gia hoạt động cách mạng khi chị bao nhiêu tuổi?',
        options: ['Mười một tuổi', 'Mười hai tuổi', 'Mười ba tuổi', 'Mười bốn tuổi'],
        correctAnswer: 'Mười hai tuổi',
        points: 0.5,
        explanation:
          'Trong bài đọc có chi tiết: "Vào năm mười hai tuổi, Sáu đã đi theo anh trai tham gia hoạt động cách mạng."',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c02',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 2 (M1 – 0,5 đ). Chị Sáu bị giặc bắt và giam cầm ở đâu?',
        options: ['Ở đảo Phú Quý', 'Ở đảo Trường Sa', 'Ở Côn Đảo', 'Ở Vũng Tàu'],
        correctAnswer: 'Ở Côn Đảo',
        points: 0.5,
        explanation: 'Sau gần ba năm tra tấn, giam cầm, giặc Pháp đưa chị ra giam cầm ở Côn Đảo.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c03',
        type: 'MULTIPLE_CHOICE',
        content:
          'Câu 3 (M2 – 0,5 đ). Chị Sáu bị giặc Pháp bắt giữ, tra tấn, giam cầm ở Côn Đảo trong hoàn cảnh nào?',
        options: [
          'Trong lúc chị đi theo anh trai',
          'Trong lúc chị đi ra bãi biển',
          'Trong lúc chị đang đi theo dõi bọn giặc',
          'Trong lúc chị mang lựu đạn phục kích giết tên cai Tòng',
        ],
        correctAnswer: 'Trong lúc chị mang lựu đạn phục kích giết tên cai Tòng',
        points: 0.5,
        explanation:
          'Chi tiết: "Một hôm, Sáu mang lựu đạn phục kích giết tên cai Tòng, một tên Việt gian bán nước ngay tại xã nhà. Lần đó, Sáu bị giặc bắt."',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c04',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 4 (M2 – 0,5 đ). Vì sao bọn giặc Pháp phải lén lút đem chị Sáu đi thủ tiêu?',
        options: [
          'Vì sợ bị phục kích',
          'Vì sợ người dân phản đối',
          'Vì sợ các chiến sĩ cách mạng trong tù sẽ nổi giận phản đối',
          'Vì sợ chị Sáu thoát thân',
        ],
        correctAnswer: 'Vì sợ các chiến sĩ cách mạng trong tù sẽ nổi giận phản đối',
        points: 0.5,
        explanation:
          'Chi tiết trong bài: "Bọn giặc Pháp đã lén lút đem chị đi thủ tiêu, vì sợ các chiến sĩ cách mạng trong tù sẽ nổi giận phản đối."',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c05',
        type: 'MULTIPLE_CHOICE',
        content:
          'Câu 5 (M1 – 0,5 đ). Trong câu: Lúc một tên lính bảo chị quỳ xuống, chị đã quát vào mặt lũ đao phủ: “Tao chỉ biết đứng không biết quỳ”. Dấu hai chấm được sử dụng với mục đích gì?',
        options: [
          'Báo hiệu đằng sau nó là các từ, ngữ được liệt kê',
          'Báo hiệu đằng sau nó là từ ngữ giải thích cho bộ phận đứng trước',
          'Báo hiệu đằng sau nó là lời nói trực tiếp của nhân vật',
          'Đánh dấu các từ ngữ đặc biệt',
        ],
        correctAnswer: 'Báo hiệu đằng sau nó là lời nói trực tiếp của nhân vật',
        points: 0.5,
        explanation:
          'Dấu hai chấm kết hợp với dấu ngoặc kép báo hiệu đằng sau nó là lời nói trực tiếp của chị Võ Thị Sáu.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c06',
        type: 'MULTIPLE_CHOICE',
        content:
          'Câu 6 (M3 – 0,5 đ). “Chị đi tới cột trói: mỉm cười, chị nhìn trời xanh bao la …” Các động từ trong câu trên là:',
        options: [
          'đi, nhìn, bao la, mỉm cười',
          'đi, tới, nhìn, mỉm cười',
          'Chị, mỉm cười, nhìn',
          'Nhìn trời xanh, cột trói, bao la',
        ],
        correctAnswer: 'đi, tới, nhìn, mỉm cười',
        points: 0.5,
        explanation:
          'Các động từ chỉ hoạt động, trạng thái trong câu là: "đi", "tới", "nhìn", "mỉm cười". (Từ "bao la" là tính từ).',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c07',
        type: 'SHORT_ANSWER',
        reviewMode: 'TEACHER',
        content:
          'Câu 7 (M3 – 1 điểm). Qua bài đọc em thấy chị Sáu là người như thế nào? Là một học sinh, em sẽ làm gì để tỏ lòng biết ơn những người có công với đất nước như chị Võ Thị Sáu? (Em hãy viết 2 – 3 câu):',
        correctAnswer:
          'Chị Võ Thị Sáu là một người nữ anh hùng dũng cảm, kiên cường, bất khuất, sẵn sàng hi sinh vì nền độc lập của Tổ quốc. Là một học sinh Trường Tiểu học Sông Công, em nguyện chăm chỉ học tập, rèn luyện đạo đức tốt, vâng lời thầy cô và noi gương tinh thần yêu nước của các anh hùng dân tộc.',
        points: 1,
        explanation:
          'Hướng dẫn chấm: Nêu được phẩm chất anh dũng, kiên cường của chị Sáu (0,5đ); Nêu được hành động cụ thể để tỏ lòng biết ơn như học tập chăm ngoan, giữ gìn hòa bình (0,5đ).',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c08',
        type: 'SHORT_ANSWER',
        content:
          'Câu 8 (M1 – 1 điểm). Dựa vào bài đọc, hãy tìm và ghi lại: 2 danh từ chung và 2 danh từ riêng (Viết cách nhau bởi dấu phẩy):',
        correctAnswer: 'bông hoa, bãi cát, Võ Thị Sáu, Côn Đảo',
        points: 1,
        explanation:
          'Ví dụ: Danh từ chung: bông hoa, bãi cát, ngục giam, bầu trời, lựu đạn... Danh từ riêng: Võ Thị Sáu, Côn Đảo, Pháp, cai Tòng.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c09',
        type: 'SHORT_ANSWER',
        content:
          'Câu 9 (M2 – 1 điểm). Điền các động từ trong ngoặc (ao ước, xô đuổi, đưa, cất) vào chỗ chấm thích hợp:\n\nĐó là một buổi chiều mùa hạ có mây trắng (1)... nhau trên cao. Nền trời xanh vời vợi. Con chim sơn ca (2)... lên tiếng hót tự do tha thiết đến nỗi khiến người ta phải (3)... giá mà mình có một đôi cánh. Trải khắp cánh đồng là nắng chiều vàng dịu và thơm hơi đất, là gió (4)... thoang thoảng lúa ngậm đòng và hương sen.\n\n(Nhập 4 từ cần điền theo đúng thứ tự 1, 2, 3, 4, cách nhau bởi dấu phẩy):',
        correctAnswer: 'xô đuổi, cất, ao ước, đưa',
        points: 1,
        explanation:
          'Thứ tự đúng: (1) xô đuổi nhau; (2) cất lên tiếng hót; (3) ao ước giá mà; (4) gió đưa thoang thoảng.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c10a',
        type: 'SHORT_ANSWER',
        content:
          'Câu 10a (M1 – 0,5 điểm). Viết lại tên trường học dưới đây cho đúng quy tắc viết hoa: "Trường tiểu học trần quốc toản"',
        correctAnswer: 'Trường Tiểu học Trần Quốc Toản',
        points: 0.5,
        explanation: 'Quy tắc viết hoa tên cơ quan, tổ chức: Trường Tiểu học Trần Quốc Toản.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c10b',
        type: 'SHORT_ANSWER',
        content:
          'Câu 10b (M1 – 0,5 điểm). Viết lại tên tổ chức dưới đây cho đúng quy tắc viết hoa: "Hội chữ thập đỏ việt nam"',
        correctAnswer: 'Hội Chữ thập đỏ Việt Nam',
        points: 0.5,
        explanation: 'Quy tắc viết hoa tên cơ quan, tổ chức: Hội Chữ thập đỏ Việt Nam.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-gk1-c11',
        type: 'SHORT_ANSWER',
        reviewMode: 'TEACHER',
        content:
          'PHẦN B: KIỂM TRA VIẾT (TẬP LÀM VĂN – 10 ĐIỂM)\n\nĐề bài: Viết bài văn kể lại một câu chuyện cổ tích đã nghe hoặc đã đọc mà em yêu thích nhất (Ví dụ: Tấm Cám, Cây khế, Sọ Dừa, Thạch Sanh, Cây tre trăm đốt...).\n\n(Yêu cầu: Bài văn có đủ 3 phần Mở bài, Thân bài, Kết bài. Kể rõ ràng các nhân vật, trình tự sự việc và nêu được suy nghĩ, cảm xúc của em về câu chuyện. Em hãy viết bài văn vào khung dưới đây):',
        correctAnswer:
          'Dàn ý gợi ý:\n1. Mở bài (2đ): Giới thiệu tên câu chuyện cổ tích và lý do em yêu thích câu chuyện đó.\n2. Thân bài (6đ): Kể lại các sự việc chính theo trình tự thời gian (nhân vật, xuất thân, biến cố, thử thách, kết cục có hậu của người hiền lành).\n3. Kết bài (2đ): Nêu suy nghĩ, bài học rút ra từ câu chuyện và tình cảm của em.\n(Chữ viết sạch đẹp, đúng chính tả được cộng 1đ hình thức).',
        points: 10,
        explanation:
          'Giáo viên chấm điểm theo barem: Mở bài (2đ), Thân bài (6đ), Kết bài (2đ), Trình bày & chính tả (1đ). Tùy mức độ diễn đạt của học sinh có thể trừ lỗi chính tả.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
    ],
  },

  // ==========================================
  // ĐỀ 2: TIẾNG VIỆT – TRƯỜNG TIỂU HỌC SÔNG CÔNG (THANH KIẾM VÀ HOA HỒNG)
  // ==========================================
  {
    id: 'gk1-2026-grade4-vietnamese-02',
    teacherId: 'editorial',
    title: 'Đề ôn GHKI - Lớp 4 - Tiếng Việt - Đề 02',
    subject: 'Tiếng Việt',
    grade: 'Khối 4',
    category: 'EXAM',
    durationMinutes: 60,
    published: true,
    updatedAt: '2026-10-28',
    passageTitle: 'Thanh kiếm và hoa hồng',
    passage:
      'Một lần thanh kiếm và hoa hồng cãi nhau, thanh kiếm cao giọng bảo:\n- Tôi khoẻ hơn bạn, chắc chắn sẽ giúp ích cho con người nhiều hơn rồi! Còn bạn yếu ớt và mảnh dẻ thế kia thì làm sao chống chọi với thiên tai, giặc giã được.\nHoa hồng ngạc nhiên:\n- Tôi không hiểu tại sao anh lại chê tôi như vậy? Hay là anh ghen tị vì anh không có được hương thơm và vẻ đẹp lộng lẫy của tôi?\n- Bạn nhầm to bạn đẹp thật nhưng vẻ đẹp của bạn chẳng để làm gì. Thanh kiếm lắc đầu, mỉa mai.\n- Bỗng lúc đó có một nhà thông thái đi tới, chúng bèn nhờ ông phân xử. Nhà thông thái ôn tồn giải thích:\n- Con người cần cả kiếm và hoa hồng các cháu ạ. Kiếm giúp con người chống lại kẻ thù và tránh được các hiểm hoạ. Còn hoa hồng đem lại hương thơm, sự ngọt ngào, niềm vui sướng cho cuộc sống và trái tim của họ…\n- Thanh kiếm và hoa hồng hiểu ra, chúng rối rít cảm ơn nhà thông thái. Cả hai bắt tay nhau thân thiện và không bao giờ cãi nhau nữa.',
    instructions:
      'Đề kiểm tra giữa học kì I môn Tiếng Việt lớp 4 – Trường Tiểu học Sông Công (Đề số 2). Thời gian: 60 phút. Gồm Phần A: Đọc thầm bài "Thanh kiếm và hoa hồng" trả lời câu hỏi và Phần B: Tập làm văn (Kể lại câu chuyện em yêu thích).',
    questions: [
      {
        id: 'tv4-de2-c01',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 1 (0,5 điểm). Tại sao thanh kiếm cho rằng nó có ích còn hoa hồng vô ích?',
        options: [
          'Nó khoẻ mạnh nên nó chống được thiên tai, giặc giã.',
          'Hoa hồng yếu ớt không thể có sức lực để chống lại giặc giã.',
          'Nó khoẻ, chống được thiên tai, giặc giã; còn hoa hồng yếu ớt.',
          'Hoa hồng mạnh khoẻ để chống lại giặc giã.',
        ],
        correctAnswer: 'Nó khoẻ, chống được thiên tai, giặc giã; còn hoa hồng yếu ớt.',
        points: 0.5,
        explanation:
          'Thanh kiếm cho rằng mình khỏe, chống được thiên tai, giặc giã; còn hoa hồng yếu ớt, mảnh dẻ.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-de2-c02',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 2 (0,5 điểm). Hoa hồng hiểu sự chê bai của thanh kiếm xuất phát từ lí do nào?',
        options: [
          'Thanh kiếm ganh tị với hương thơm và vẻ đẹp của hoa hồng.',
          'Thanh kiếm không hiểu được vẻ đẹp lộng lẫy, kiêu sa của hoa hồng.',
          'Thanh kiếm là một kẻ thiển cận.',
          'Thanh kiếm là nhà thông thái.',
        ],
        correctAnswer: 'Thanh kiếm ganh tị với hương thơm và vẻ đẹp của hoa hồng.',
        points: 0.5,
        explanation: 'Hoa hồng nói: "Hay là anh ghen tị vì anh không có được hương thơm và vẻ đẹp lộng lẫy của tôi?".',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-de2-c03',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 3 (0,5 điểm). Nhà thông thái đã giải thích điều gì cho thanh kiếm và hoa hồng?',
        options: [
          'Công dụng của thanh kiếm đối với cuộc sống của con người.',
          'Vẻ đẹp của hoa hồng, sự cần thiết của hoa hồng.',
          'Vai trò của thanh kiếm và hoa hồng đối với cuộc sống của con người.',
          'Kiếm giúp con người chống lại kẻ thù và tránh được các hiểm hoạ.',
        ],
        correctAnswer: 'Vai trò của thanh kiếm và hoa hồng đối với cuộc sống của con người.',
        points: 0.5,
        explanation:
          'Nhà thông thái chỉ rõ: Kiếm giúp chống kẻ thù, còn hoa hồng đem lại hương thơm và niềm vui cho cuộc sống.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-de2-c04',
        type: 'MULTIPLE_CHOICE',
        content: 'Câu 4 (0,5 điểm). Câu chuyện "Thanh kiếm và hoa hồng" muốn nói với chúng ta điều gì?',
        options: [
          'Không nên cãi nhau vì những chuyện nhỏ nhặt trong cuộc sống.',
          'Không nên kiêu căng, tự phụ, tự cho mình hơn hẳn người khác.',
          'Con người cần cả sức mạnh, hương thơm, niềm tin và sự ngọt ngào.',
          'Thanh kiếm và hoa hồng là niềm tự hào của con người.',
        ],
        correctAnswer: 'Con người cần cả sức mạnh, hương thơm, niềm tin và sự ngọt ngào.',
        points: 0.5,
        explanation: 'Cuộc sống con người cần cả sự bảo vệ vững vàng lẫn những vẻ đẹp tinh thần ngọt ngào.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-de2-c05',
        type: 'SHORT_ANSWER',
        content:
          'Câu 5 (1 điểm). Hãy ghi lại các động từ có trong câu: "Bỗng lúc đó có một nhà thông thái đi tới, hoa hồng và thanh kiếm bèn nhờ ông phân xử" (viết cách nhau bởi dấu phẩy):',
        correctAnswer: 'có, đi tới, nhờ, phân xử',
        points: 1,
        explanation: 'Các động từ trong câu gồm: "có", "đi tới", "nhờ", "phân xử".',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-de2-c06',
        type: 'SHORT_ANSWER',
        content:
          'Câu 6 (1 điểm). Tìm các danh từ thích hợp điền vào chỗ chấm:\na) Trong mưa thường xuất hiện những (1)... long trời, lở đất.\nb) Chúng tôi phản đối (2)... và mong muốn hòa bình.\nc) Các tỉnh miền Trung thường xảy ra (3)... hằng năm.\nd) (4)... là người dạy em biết đọc, biết viết.\n(Nhập 4 danh từ lần lượt cách nhau bởi dấu phẩy):',
        correctAnswer: 'tiếng sấm, chiến tranh, lũ lụt, cô giáo',
        points: 1,
        explanation: 'Ví dụ phù hợp: (1) tiếng sấm; (2) chiến tranh; (3) lũ lụt (bão lũ); (4) cô giáo (thầy giáo).',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-de2-c07',
        type: 'SHORT_ANSWER',
        reviewMode: 'TEACHER',
        content:
          'Câu 7 (1 điểm). Qua bài đọc, em rút ra bài học gì cho bản thân? (Em hãy viết câu trả lời từ 1 – 2 câu):',
        correctAnswer:
          'Bài học: Mỗi người, mỗi vật đều có giá trị và sứ mệnh riêng trong cuộc sống; ta không nên kiêu căng, tự phụ mà cần biết tôn trọng, hòa thuận và hợp tác với mọi người.',
        points: 1,
        explanation: 'Học sinh nêu được bài học về sự khiêm tốn, không tự phụ và tôn trọng giá trị của người khác.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-de2-c08',
        type: 'SHORT_ANSWER',
        reviewMode: 'TEACHER',
        content:
          'Câu 8 (1 điểm). Đặt câu theo gợi ý:\na) Đặt 1 câu có chứa danh từ riêng chỉ tên người:\nb) Đặt 1 câu có chứa động từ chỉ hoạt động:\n(Em viết 2 câu vào ô bên dưới, mỗi câu một dòng):',
        correctAnswer:
          'Ví dụ:\na) Bạn Linh là học sinh giỏi của lớp em.\nb) Đàn chim én đang bay lượn trên bầu trời mùa xuân.',
        points: 1,
        explanation: 'Giáo viên chấm: Câu a có danh từ riêng viết hoa đúng (0,5đ); Câu b có động từ chỉ hoạt động đúng ngữ pháp (0,5đ).',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-de2-c09',
        type: 'SHORT_ANSWER',
        reviewMode: 'TEACHER',
        content:
          'Câu 9 (1 điểm). Em hãy đặt 1 câu nói về một việc mà em hoặc bạn em đã làm để giúp đỡ người có hoàn cảnh khó khăn:',
        correctAnswer:
          'Ví dụ: Em đã cùng các bạn trong lớp quyên góp sách vở và quần áo ấm để gửi tặng các bạn nhỏ vùng cao.',
        points: 1,
        explanation: 'Câu văn có nội dung nhân ái, giúp đỡ người khó khăn, đúng ngữ pháp tiếng Việt.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
      {
        id: 'tv4-de2-c10',
        type: 'SHORT_ANSWER',
        reviewMode: 'TEACHER',
        content:
          'PHẦN II: KIỂM TRA VIẾT (TẬP LÀM VĂN – 10 ĐIỂM)\n\nĐề bài: Em hãy kể lại một câu chuyện cổ tích đã được nghe hoặc được đọc mà em yêu thích nhất.\n\n(Yêu cầu: Bài viết có bố cục 3 phần Mở bài, Thân bài, Kết bài. Kể diễn biến câu chuyện rõ ràng, cảm xúc chân thực. Em hãy viết bài văn vào khung dưới đây):',
        correctAnswer:
          'Barem chấm điểm:\n- Mở bài (2đ): Giới thiệu câu chuyện định kể.\n- Thân bài (5đ + 1đ sáng tạo): Kể diễn biến câu chuyện theo trình tự hợp lý, sinh động.\n- Kết bài (2đ): Kết thúc câu chuyện, nêu bài học và cảm nghĩ của em.',
        points: 10,
        explanation: 'Giáo viên chấm điểm bài làm văn của học sinh theo tiêu chí 3 phần và lỗi chính tả.',
        caseInsensitive: true,
        trimWhitespace: true,
      },
    ],
  },
];

export const BUILTIN_MIDTERM_QUIZZES: Quiz[] = BUILTIN_MIDTERM_EXAMS.map((exam) => ({
  id: exam.id,
  teacherId: exam.teacherId,
  title: exam.title,
  subject: exam.subject,
  grade: exam.grade,
  questionCount: exam.questions.length,
  createdAt: '2026-10-28',
  visibility: 'SCHOOL',
  questions: exam.questions.map((q) => ({
    id: q.id,
    type: q.type,
    content: q.content,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    correctPoints: q.points,
    difficulty: q.points && q.points >= 1 ? 'APPLICATION' : 'KNOWLEDGE',
  })),
}));
