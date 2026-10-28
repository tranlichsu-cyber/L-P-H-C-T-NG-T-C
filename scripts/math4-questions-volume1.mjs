// 37 Lessons of Grade 4 Math - Volume 1 (Sách giáo khoa Toán 4 - Tập 1, Kết nối tri thức với cuộc sống)
// Each lesson has exactly 5 multiple choice questions.

export const volume1Lessons = [
  {
    number: 1,
    title: "Ôn tập các số đến 100 000",
    questions: [
      {
        content: "Số gồm 5 chục nghìn, 7 nghìn, 3 trăm và 8 đơn vị được viết là:",
        options: ["57 380", "57 308", "50 738", "57 038"],
        correctAnswer: "B",
        explanation: "Số gồm 5 chục nghìn, 7 nghìn, 3 trăm, 0 chục và 8 đơn vị viết là 57 308."
      },
      {
        content: "Giá trị của chữ số 6 trong số 86 425 là:",
        options: ["60 000", "6 000", "600", "60"],
        correctAnswer: "B",
        explanation: "Chữ số 6 đứng ở hàng nghìn nên có giá trị là 6 000."
      },
      {
        content: "Số liền sau của số 99 999 là:",
        options: ["99 998", "100 000", "100 001", "10 000"],
        correctAnswer: "B",
        explanation: "Muốn tìm số liền sau của một số, ta lấy số đó cộng thêm 1: 99 999 + 1 = 100 000."
      },
      {
        content: "Cho số 45 612. Khi đổi chỗ chữ số 4 và chữ số 2 cho nhau, ta được số mới là:",
        options: ["25 614", "42 615", "54 612", "24 615"],
        correctAnswer: "A",
        explanation: "Đổi chỗ chữ số 4 (ở hàng chục nghìn) và chữ số 2 (ở hàng đơn vị) ta được số 25 614."
      },
      {
        content: "Số nào dưới đây làm tròn đến hàng chục nghìn thì được 70 000?",
        options: ["64 990", "76 200", "68 450", "75 100"],
        correctAnswer: "C",
        explanation: "Số 68 450 có chữ số hàng nghìn là 8 (lớn hơn hoặc bằng 5) nên làm tròn lên thành 70 000."
      }
    ]
  },
  {
    number: 2,
    title: "Ôn tập các phép tính trong phạm vi 100 000",
    questions: [
      {
        content: "Kết quả của phép tính 35 240 + 24 150 là:",
        options: ["59 390", "59 490", "58 390", "60 390"],
        correctAnswer: "A",
        explanation: "35 240 + 24 150 = 59 390."
      },
      {
        content: "Kết quả của phép tính 76 850 - 32 410 là:",
        options: ["44 440", "44 450", "43 440", "45 440"],
        correctAnswer: "A",
        explanation: "76 850 - 32 410 = 44 440."
      },
      {
        content: "Kết quả của phép tính 12 108 × 4 là:",
        options: ["48 432", "48 402", "48 422", "48 332"],
        correctAnswer: "A",
        explanation: "12 108 × 4 = 48 432."
      },
      {
        content: "Kết quả của phép tính 64 824 : 8 là:",
        options: ["8 103", "8 130", "803", "8 013"],
        correctAnswer: "A",
        explanation: "64 824 : 8 = 8 103."
      },
      {
        content: "Giá trị của biểu thức 40 000 + 15 000 : 3 là:",
        options: ["45 000", "25 000", "55 000", "35 000"],
        correctAnswer: "A",
        explanation: "Thực hiện phép chia trước: 15 000 : 3 = 5 000. Sau đó cộng: 40 000 + 5 000 = 45 000."
      }
    ]
  },
  {
    number: 3,
    title: "Số chẵn, số lẻ",
    questions: [
      {
        content: "Số nào dưới đây là số chẵn?",
        options: ["2 457", "3 891", "4 568", "6 005"],
        correctAnswer: "C",
        explanation: "Số chẵn là số có chữ số tận cùng là 0, 2, 4, 6, 8. Số 4 568 có chữ số tận cùng là 8."
      },
      {
        content: "Số nào dưới đây là số lẻ?",
        options: ["1 240", "5 678", "9 872", "7 319"],
        correctAnswer: "D",
        explanation: "Số lẻ là số có chữ số tận cùng là 1, 3, 5, 7, 9. Số 7 319 có chữ số tận cùng là 9."
      },
      {
        content: "Tổng của hai số chẵn luôn là:",
        options: ["Một số lẻ", "Một số chẵn", "Không thể xác định", "Bằng 0"],
        correctAnswer: "B",
        explanation: "Chẵn + Chẵn = Chẵn (Ví dụ: 2 + 4 = 6)."
      },
      {
        content: "Số chẵn lớn nhất có 4 chữ số khác nhau là:",
        options: ["9 998", "9 876", "9 874", "9 864"],
        correctAnswer: "B",
        explanation: "Để số lớn nhất có 4 chữ số khác nhau và là số chẵn, các chữ số lần lượt là 9, 8, 7 và chữ số tận cùng chẵn lớn nhất khả dụng là 6: 9 876."
      },
      {
        content: "Từ 11 đến 20 có bao nhiêu số lẻ?",
        options: ["4 số", "5 số", "6 số", "10 số"],
        correctAnswer: "B",
        explanation: "Các số lẻ từ 11 đến 20 là: 11, 13, 15, 17, 19 (gồm 5 số)."
      }
    ]
  },
  {
    number: 4,
    title: "Biểu thức chứa chữ",
    questions: [
      {
        content: "Biểu thức nào dưới đây là biểu thức chứa một chữ?",
        options: ["15 + 24 - 8", "35 + a", "12 × 4 : 2", "100 - 50 + 20"],
        correctAnswer: "B",
        explanation: "Biểu thức 35 + a có chứa một chữ cái a."
      },
      {
        content: "Nếu a = 12 thì giá trị của biểu thức 45 + a là:",
        options: ["57", "47", "55", "67"],
        correctAnswer: "A",
        explanation: "Thay a = 12 vào biểu thức: 45 + 12 = 57."
      },
      {
        content: "Nếu m = 8 thì giá trị của biểu thức 120 - m × 10 là:",
        options: ["40", "1 120", "80", "100"],
        correctAnswer: "A",
        explanation: "Thay m = 8: 120 - 8 × 10 = 120 - 80 = 40."
      },
      {
        content: "Chu vi hình vuông có độ dài cạnh a được tính theo công thức:",
        options: ["a × a", "a × 4", "a + 4", "a × 2"],
        correctAnswer: "B",
        explanation: "Chu vi hình vuông bằng độ dài một cạnh nhân với 4: P = a × 4."
      },
      {
        content: "Với x = 5, biểu thức nào có giá trị lớn nhất?",
        options: ["20 + x", "50 - x", "10 × x", "100 : x"],
        correctAnswer: "C",
        explanation: "Thay x = 5: A = 25; B = 45; C = 50; D = 20. Giá trị lớn nhất là 10 × 5 = 50."
      }
    ]
  },
  {
    number: 5,
    title: "Giải bài toán có ba bước tính",
    questions: [
      {
        content: "Một cửa hàng có 3 thùng dầu, mỗi thùng chứa 20 l. Người ta đã bán đi 35 l dầu. Số dầu còn lại chia đều vào 5 can. Hỏi mỗi can có bao nhiêu lít dầu?",
        options: ["5 l", "7 l", "9 l", "8 l"],
        correctAnswer: "A",
        explanation: "Bước 1: 3 thùng có 20 × 3 = 60 l. Bước 2: Còn lại 60 - 35 = 25 l. Bước 3: Mỗi can có 25 : 5 = 5 l."
      },
      {
        content: "Bác An mua 3 gói bánh giá 15 000 đồng một gói và 2 hộp sữa giá 8 000 đồng một hộp. Bác đưa cho cô thu ngân 100 000 đồng. Hỏi cô thu ngân trả lại bác bao nhiêu tiền?",
        options: ["39 000 đồng", "61 000 đồng", "49 000 đồng", "29 000 đồng"],
        correctAnswer: "A",
        explanation: "Bước 1: Mua bánh hết 15 000 × 3 = 45 000 đồng. Bước 2: Tổng tiền hàng = 45 000 + 16 000 = 61 000 đồng. Bước 3: Trả lại 100 000 - 61 000 = 39 000 đồng."
      },
      {
        content: "Khối lớp 4 có 3 lớp, mỗi lớp 32 học sinh. Khối lớp 5 có 4 lớp, mỗi lớp 30 học sinh. Hỏi cả hai khối có tất cả bao nhiêu học sinh?",
        options: ["216 học sinh", "226 học sinh", "186 học sinh", "206 học sinh"],
        correctAnswer: "A",
        explanation: "Khối 4: 3 × 32 = 96 học sinh. Khối 5: 4 × 30 = 120 học sinh. Cả hai khối: 96 + 120 = 216 học sinh."
      },
      {
        content: "Đội Một hái được 45 kg cam, đội Hai hái được gấp đôi đội Một. Đội Ba hái được ít hơn đội Hai 15 kg. Hỏi đội Ba hái được bao nhiêu ki-lô-gam cam?",
        options: ["75 kg", "90 kg", "60 kg", "105 kg"],
        correctAnswer: "A",
        explanation: "Đội Hai: 45 × 2 = 90 kg. Đội Ba: 90 - 15 = 75 kg."
      },
      {
        content: "Một xưởng may ngày đầu may được 120 bộ quần áo, ngày thứ hai may được nhiều hơn ngày đầu 30 bộ. Ngày thứ ba may bằng một nửa tổng số bộ hai ngày đầu. Hỏi ngày thứ ba may được bao nhiêu bộ?",
        options: ["135 bộ", "150 bộ", "125 bộ", "140 bộ"],
        correctAnswer: "A",
        explanation: "Ngày 2: 120 + 30 = 150 bộ. Hai ngày đầu: 120 + 150 = 270 bộ. Ngày 3: 270 : 2 = 135 bộ."
      }
    ]
  },
  {
    number: 6,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Giá trị của chữ số 5 trong số 75 820 gấp giá trị của chữ số 5 trong số 20 540 bao nhiêu lần?",
        options: ["10 lần", "100 lần", "1 000 lần", "5 lần"],
        correctAnswer: "A",
        explanation: "Chữ số 5 trong 75 820 có giá trị là 5 000. Chữ số 5 trong 20 540 có giá trị là 500. 5 000 : 500 = 10 lần."
      },
      {
        content: "Hiệu của số chẵn lớn nhất có 5 chữ số và số lẻ bé nhất có 5 chữ số là:",
        options: ["89 997", "89 999", "89 998", "90 000"],
        correctAnswer: "A",
        explanation: "Số chẵn lớn nhất có 5 chữ số là 99 998. Số lẻ bé nhất có 5 chữ số là 10 001. 99 998 - 10 001 = 89 997."
      },
      {
        content: "Một hình vuông có chu vi là 36 cm. Diện tích của hình vuông đó là:",
        options: ["81 cm²", "36 cm²", "72 cm²", "64 cm²"],
        correctAnswer: "A",
        explanation: "Cạnh hình vuông: 36 : 4 = 9 cm. Diện tích: 9 × 9 = 81 cm²."
      },
      {
        content: "Biểu thức 15 000 + a × 3 có giá trị là 30 000 khi a bằng:",
        options: ["5 000", "4 000", "6 000", "3 000"],
        correctAnswer: "A",
        explanation: "a × 3 = 30 000 - 15 000 = 15 000 => a = 15 000 : 3 = 5 000."
      },
      {
        content: "Cho dãy số: 2, 4, 6, 8, ..., 20. Dãy số trên có bao nhiêu số hạng?",
        options: ["10 số", "9 số", "11 số", "12 số"],
        correctAnswer: "A",
        explanation: "Số số hạng: (20 - 2) : 2 + 1 = 10 số."
      }
    ]
  },
  {
    number: 7,
    title: "Đo góc, đơn vị đo góc",
    questions: [
      {
        content: "Đơn vị chuẩn thường dùng để đo góc là:",
        options: ["Độ (°)", "Mét (m)", "Gam (g)", "Lít (l)"],
        correctAnswer: "A",
        explanation: "Đơn vị đo góc là độ, kí hiệu là °."
      },
      {
        content: "Dụng cụ dùng để đo số đo của một góc là:",
        options: ["Thước đo góc", "Thước dây", "Com-pa", "Cân đồng hồ"],
        correctAnswer: "A",
        explanation: "Dụng cụ đo góc là thước đo góc."
      },
      {
        content: "Số đo của một góc vuông bằng:",
        options: ["90°", "60°", "180°", "45°"],
        correctAnswer: "A",
        explanation: "Góc vuông có số đo chuẩn bằng 90°."
      },
      {
        content: "Góc đỉnh O có hai cạnh là OA và OB được gọi là:",
        options: ["Góc đỉnh O, cạnh OA, OB", "Góc đỉnh A, cạnh OB", "Góc đỉnh B, cạnh OA", "Đoạn thẳng AB"],
        correctAnswer: "A",
        explanation: "Góc gồm đỉnh O và hai cạnh xuất phát từ đỉnh là OA, OB."
      },
      {
        content: "Lúc 3 giờ đúng, kim giờ và kim phút của đồng hồ tạo thành một góc có số đo là:",
        options: ["90°", "60°", "120°", "180°"],
        correctAnswer: "A",
        explanation: "Lúc 3 giờ đúng, kim phút chỉ số 12, kim giờ chỉ số 3, tạo thành góc vuông 90°."
      }
    ]
  },
  {
    number: 8,
    title: "Góc nhọn, góc tù, góc bẹt",
    questions: [
      {
        content: "Góc nhọn là góc có số đo:",
        options: ["Bé hơn 90°", "Lớn hơn 90°", "Bằng 90°", "Bằng 180°"],
        correctAnswer: "A",
        explanation: "Góc nhọn có số đo lớn hơn 0° và bé hơn 90° (bé hơn góc vuông)."
      },
      {
        content: "Góc tù là góc có số đo:",
        options: ["Lớn hơn 90° và bé hơn 180°", "Bé hơn 90°", "Bằng 90°", "Bằng 180°"],
        correctAnswer: "A",
        explanation: "Góc tù có số đo lớn hơn góc vuông và bé hơn góc bẹt (90° < góc tù < 180°)."
      },
      {
        content: "Góc bẹt có số đo bằng bao nhiêu?",
        options: ["180°", "90°", "120°", "360°"],
        correctAnswer: "A",
        explanation: "Góc bẹt có số đo bằng 180°, bằng 2 lần góc vuông."
      },
      {
        content: "Lúc 6 giờ đúng, hai kim đồng hồ tạo thành góc gì?",
        options: ["Góc bẹt", "Góc vuông", "Góc nhọn", "Góc tù"],
        correctAnswer: "A",
        explanation: "Lúc 6 giờ, kim dài chỉ số 12, kim ngắn chỉ số 6, tạo thành đường thẳng tương ứng góc bẹt 180°."
      },
      {
        content: "Trong các góc sau, góc nào là góc tù?",
        options: ["Góc có số đo 125°", "Góc có số đo 45°", "Góc có số đo 90°", "Góc có số đo 180°"],
        correctAnswer: "A",
        explanation: "Góc 125° lớn hơn 90° và bé hơn 180° nên là góc tù."
      }
    ]
  },
  {
    number: 9,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Một hình tam giác có thể có nhiều nhất bao nhiêu góc vuông?",
        options: ["1 góc vuông", "2 góc vuông", "3 góc vuông", "0 góc vuông"],
        correctAnswer: "A",
        explanation: "Trong một hình tam giác chỉ có thể có nhiều nhất 1 góc vuông."
      },
      {
        content: "Hình chữ nhật có bao nhiêu góc vuông?",
        options: ["4 góc vuông", "2 góc vuông", "1 góc vuông", "3 góc vuông"],
        correctAnswer: "A",
        explanation: "Hình chữ nhật có 4 góc vuông ở 4 đỉnh."
      },
      {
        content: "Góc nào lớn hơn góc vuông nhưng nhỏ hơn góc bẹt?",
        options: ["Góc tù", "Góc nhọn", "Góc vuông", "Góc bẹt"],
        correctAnswer: "A",
        explanation: "Góc tù lớn hơn góc vuông và nhỏ hơn góc bẹt."
      },
      {
        content: "Sắp xếp các góc theo thứ tự số đo từ bé đến lớn:",
        options: [
          "Góc nhọn, góc vuông, góc tù, góc bẹt",
          "Góc nhọn, góc tù, góc vuông, góc bẹt",
          "Góc vuông, góc nhọn, góc tù, góc bẹt",
          "Góc bẹt, góc tù, góc vuông, góc nhọn"
        ],
        correctAnswer: "A",
        explanation: "Góc nhọn (< 90°) < Góc vuông (= 90°) < Góc tù (90° - 180°) < Góc bẹt (= 180°)."
      },
      {
        content: "Góc bẹt gấp mấy lần góc vuông?",
        options: ["2 lần", "3 lần", "4 lần", "1,5 lần"],
        correctAnswer: "A",
        explanation: "Góc bẹt = 180°, góc vuông = 90°. 180° : 90° = 2 lần."
      }
    ]
  },
  {
    number: 10,
    title: "Số có sáu chữ số. Số 1 000 000",
    questions: [
      {
        content: "Số liền sau của số 999 999 là:",
        options: ["1 000 000", "100 000", "999 998", "1 000 001"],
        correctAnswer: "A",
        explanation: "999 999 + 1 = 1 000 000 (Một triệu)."
      },
      {
        content: "Số 1 000 000 có bao nhiêu chữ số 0?",
        options: ["6 chữ số 0", "5 chữ số 0", "7 chữ số 0", "4 chữ số 0"],
        correctAnswer: "A",
        explanation: "Số 1 000 000 gồm chữ số 1 và 6 chữ số 0 theo sau."
      },
      {
        content: "Số \"Năm trăm hai mươi nghìn bốn trăm linh sáu\" được viết là:",
        options: ["520 406", "524 006", "502 406", "520 460"],
        correctAnswer: "A",
        explanation: "Năm trăm hai mươi nghìn: 520, bốn trăm linh sáu: 406 => 520 406."
      },
      {
        content: "Chữ số 7 trong số 743 215 thuộc hàng nào?",
        options: ["Hàng trăm nghìn", "Hàng chục nghìn", "Hàng nghìn", "Hàng triệu"],
        correctAnswer: "A",
        explanation: "Số 743 215 có 6 chữ số, chữ số 7 đứng đầu tiên ở hàng trăm nghìn."
      },
      {
        content: "Mười trăm nghìn còn được gọi là gì?",
        options: ["Một triệu", "Một trăm nghìn", "Mười triệu", "Một tỉ"],
        correctAnswer: "A",
        explanation: "10 trăm nghìn = 1 000 000 = một triệu."
      }
    ]
  },
  {
    number: 11,
    title: "Hàng và lớp",
    questions: [
      {
        content: "Lớp nghìn gồm những hàng nào?",
        options: [
          "Hàng nghìn, hàng chục nghìn, hàng trăm nghìn",
          "Hàng đơn vị, hàng chục, hàng trăm",
          "Hàng triệu, hàng chục triệu, hàng trăm triệu",
          "Hàng chục nghìn, hàng trăm nghìn, hàng triệu"
        ],
        correctAnswer: "A",
        explanation: "Lớp nghìn gồm 3 hàng: hàng nghìn, hàng chục nghìn và hàng trăm nghìn."
      },
      {
        content: "Trong số 438 529, các chữ số thuộc lớp đơn vị là:",
        options: ["5, 2, 9", "4, 3, 8", "8, 5, 2", "3, 8, 5"],
        correctAnswer: "A",
        explanation: "Lớp đơn vị gồm hàng trăm (5), hàng chục (2), hàng đơn vị (9)."
      },
      {
        content: "Trong số 612 845, chữ số 1 thuộc hàng nào, lớp nào?",
        options: [
          "Hàng chục nghìn, lớp nghìn",
          "Hàng trăm nghìn, lớp nghìn",
          "Hàng nghìn, lớp nghìn",
          "Hàng chục, lớp đơn vị"
        ],
        correctAnswer: "A",
        explanation: "Chữ số 1 đứng ở hàng chục nghìn, thuộc lớp nghìn."
      },
      {
        content: "Mỗi lớp gồm bao nhiêu hàng liên tiếp?",
        options: ["3 hàng", "2 hàng", "4 hàng", "1 hàng"],
        correctAnswer: "A",
        explanation: "Mỗi lớp gồm 3 hàng liên tiếp từ phải sang trái."
      },
      {
        content: "Số nào dưới đây có chữ số 8 thuộc hàng trăm nghìn?",
        options: ["815 420", "185 420", "158 420", "514 820"],
        correctAnswer: "A",
        explanation: "Số 815 420 có chữ số 8 ở hàng trăm nghìn."
      }
    ]
  },
  {
    number: 12,
    title: "Các số trong phạm vi lớp triệu",
    questions: [
      {
        content: "Lớp triệu gồm những hàng nào?",
        options: [
          "Hàng triệu, hàng chục triệu, hàng trăm triệu",
          "Hàng trăm nghìn, hàng triệu, hàng chục triệu",
          "Hàng nghìn, hàng triệu, hàng tỉ",
          "Hàng chục triệu, hàng trăm triệu, hàng tỉ"
        ],
        correctAnswer: "A",
        explanation: "Lớp triệu gồm 3 hàng: hàng triệu, hàng chục triệu và hàng trăm triệu."
      },
      {
        content: "Số \"Bảy mươi lăm triệu ba trăm nghìn\" được viết là:",
        options: ["75 300 000", "750 300 000", "7 530 000", "75 030 000"],
        correctAnswer: "A",
        explanation: "75 triệu (75) và 300 nghìn (300 000) viết là 75 300 000."
      },
      {
        content: "Số 100 000 000 có bao nhiêu chữ số 0?",
        options: ["8 chữ số 0", "7 chữ số 0", "9 chữ số 0", "6 chữ số 0"],
        correctAnswer: "A",
        explanation: "Một trăm triệu viết là 100 000 000 có 8 chữ số 0."
      },
      {
        content: "Giá trị của chữ số 4 trong số 42 150 800 là:",
        options: ["40 000 000", "4 000 000", "400 000", "40 000"],
        correctAnswer: "A",
        explanation: "Chữ số 4 đứng ở hàng chục triệu nên có giá trị là 40 000 000."
      },
      {
        content: "Mười chục triệu gọi là gì?",
        options: ["Một trăm triệu", "Một triệu", "Một tỉ", "Mười triệu"],
        correctAnswer: "A",
        explanation: "10 chục triệu = 100 triệu (một trăm triệu)."
      }
    ]
  },
  {
    number: 13,
    title: "Làm tròn số đến hàng trăm nghìn",
    questions: [
      {
        content: "Để làm tròn số đến hàng trăm nghìn, ta xét chữ số ở hàng nào?",
        options: ["Hàng chục nghìn", "Hàng nghìn", "Hàng trăm", "Hàng triệu"],
        correctAnswer: "A",
        explanation: "Muốn làm tròn đến hàng trăm nghìn, ta so sánh chữ số ở hàng ngay sau nó là hàng chục nghìn với 5."
      },
      {
        content: "Làm tròn số 438 500 đến hàng trăm nghìn, ta được số:",
        options: ["400 000", "500 000", "440 000", "430 000"],
        correctAnswer: "A",
        explanation: "Chữ số hàng chục nghìn là 3 (< 5) nên ta làm tròn xuống thành 400 000."
      },
      {
        content: "Làm tròn số 762 000 đến hàng trăm nghìn, ta được số:",
        options: ["800 000", "700 000", "760 000", "750 000"],
        correctAnswer: "A",
        explanation: "Chữ số hàng chục nghìn là 6 (≥ 5) nên ta làm tròn lên thành 800 000."
      },
      {
        content: "Số nào dưới đây khi làm tròn đến hàng trăm nghìn thì được 500 000?",
        options: ["475 200", "420 000", "560 000", "580 000"],
        correctAnswer: "A",
        explanation: "Số 475 200 có chữ số hàng chục nghìn là 7 (≥ 5) nên làm tròn lên thành 500 000."
      },
      {
        content: "Số lớn nhất có 6 chữ số khi làm tròn đến hàng trăm nghìn được 300 000 là:",
        options: ["349 999", "340 000", "299 999", "350 000"],
        correctAnswer: "A",
        explanation: "Để làm tròn thành 300 000 thì chữ số hàng chục nghìn phải bé hơn 5 (lớn nhất là 4), các chữ số sau lớn nhất là 9 => 349 999."
      }
    ]
  },
  {
    number: 14,
    title: "So sánh các số có nhiều chữ số",
    questions: [
      {
        content: "Trong hai số tự nhiên, số nào có nhiều chữ số hơn thì:",
        options: ["Lớn hơn", "Bé hơn", "Bằng nhau", "Không so sánh được"],
        correctAnswer: "A",
        explanation: "Trong hai số tự nhiên, số nào có số chữ số nhiều hơn thì số đó lớn hơn."
      },
      {
        content: "Điền dấu thích hợp vào chỗ chấm: 8 950 000 ... 9 120 000",
        options: ["<", ">", "=", "Không có"],
        correctAnswer: "A",
        explanation: "Cả hai số đều có 7 chữ số. So sánh chữ số ở hàng triệu: 8 < 9 nên 8 950 000 < 9 120 000."
      },
      {
        content: "Số lớn nhất trong các số: 5 432 100; 5 423 900; 5 433 000; 5 429 800 là:",
        options: ["5 433 000", "5 432 100", "5 429 800", "5 423 900"],
        correctAnswer: "A",
        explanation: "So sánh đến hàng nghìn: 33 > 32 > 29 > 23 nên số lớn nhất là 5 433 000."
      },
      {
        content: "Sắp xếp các số sau theo thứ tự từ bé đến lớn: 12 000 000; 9 999 999; 10 500 000",
        options: [
          "9 999 999; 10 500 000; 12 000 000",
          "12 000 000; 10 500 000; 9 999 999",
          "10 500 000; 9 999 999; 12 000 000",
          "9 999 999; 12 000 000; 10 500 000"
        ],
        correctAnswer: "A",
        explanation: "9 999 999 (7 chữ số) < 10 500 000 < 12 000 000 (8 chữ số)."
      },
      {
        content: "Chữ số x thích hợp để 45x 820 < 451 820 là:",
        options: ["0", "1", "2", "3"],
        correctAnswer: "A",
        explanation: "Để 45x 820 < 451 820 thì x < 1, do đó x = 0."
      }
    ]
  },
  {
    number: 15,
    title: "Làm quen với dãy số tự nhiên",
    questions: [
      {
        content: "Dãy số tự nhiên bắt đầu từ số nào?",
        options: ["Số 0", "Số 1", "Số 10", "Không có số bắt đầu"],
        correctAnswer: "A",
        explanation: "Dãy số tự nhiên bắt đầu bằng số 0: 0, 1, 2, 3, 4, ..."
      },
      {
        content: "Hai số tự nhiên liên tiếp hơn kém nhau bao nhiêu đơn vị?",
        options: ["1 đơn vị", "2 đơn vị", "10 đơn vị", "0 đơn vị"],
        correctAnswer: "A",
        explanation: "Thêm 1 vào một số tự nhiên ta được số liền sau của nó, nên hai số tự nhiên liên tiếp hơn kém nhau 1 đơn vị."
      },
      {
        content: "Khẳng định nào sau đây là ĐÚNG về dãy số tự nhiên?",
        options: [
          "Không có số tự nhiên lớn nhất",
          "Số tự nhiên lớn nhất là 1 000 000 000",
          "Số tự nhiên bé nhất là 1",
          "Dãy số tự nhiên có số lượng phần tử hữu hạn"
        ],
        correctAnswer: "A",
        explanation: "Dãy số tự nhiên kéo dài vô tận, không có số tự nhiên lớn nhất."
      },
      {
        content: "Ba số tự nhiên liên tiếp tăng dần là:",
        options: ["98, 99, 100", "98, 100, 102", "101, 100, 99", "97, 99, 101"],
        correctAnswer: "A",
        explanation: "98, 99, 100 là 3 số tự nhiên liên tiếp hơn kém nhau 1 đơn vị theo thứ tự tăng dần."
      },
      {
        content: "Số 0 là số tự nhiên như thế nào?",
        options: [
          "Số tự nhiên bé nhất",
          "Số tự nhiên lớn nhất",
          "Không thuộc dãy số tự nhiên",
          "Số lẻ bé nhất"
        ],
        correctAnswer: "A",
        explanation: "Số 0 là số tự nhiên bé nhất trong dãy số tự nhiên."
      }
    ]
  },
  {
    number: 16,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Số tự nhiên bé nhất có 7 chữ số là:",
        options: ["1 000 000", "1 111 111", "9 999 999", "1 000 001"],
        correctAnswer: "A",
        explanation: "Số tự nhiên bé nhất có 7 chữ số là 1 000 000."
      },
      {
        content: "Số gồm 8 triệu, 5 trăm nghìn và 4 chục viết là:",
        options: ["8 500 040", "8 050 040", "8 500 400", "8 540 000"],
        correctAnswer: "A",
        explanation: "Hàng triệu: 8, trăm nghìn: 5, các hàng khác bằng 0, chục: 4, đơn vị: 0 => 8 500 040."
      },
      {
        content: "Viết số 34 506 200 thành tổng theo các lớp:",
        options: [
          "34 000 000 + 506 000 + 200",
          "30 000 000 + 4 000 000 + 500 000 + 6 000 + 200",
          "34 000 000 + 500 000 + 6 200",
          "34 500 000 + 6 200"
        ],
        correctAnswer: "A",
        explanation: "Phân tích theo 3 lớp: lớp triệu (34 000 000), lớp nghìn (506 000) và lớp đơn vị (200)."
      },
      {
        content: "Làm tròn số 8 360 000 đến hàng trăm nghìn được:",
        options: ["8 400 000", "8 300 000", "8 000 000", "9 000 000"],
        correctAnswer: "A",
        explanation: "Chữ số hàng chục nghìn là 6 ≥ 5 nên làm tròn lên thành 8 400 000."
      },
      {
        content: "Trong các số: 10 245 000; 9 899 999; 10 254 000; 10 199 000, số lớn nhất là:",
        options: ["10 254 000", "10 245 000", "9 899 999", "10 199 000"],
        correctAnswer: "A",
        explanation: "So sánh các số 8 chữ số ở hàng chục nghìn: 5 > 4 > 1, vậy 10 254 000 là số lớn nhất."
      }
    ]
  },
  {
    number: 17,
    title: "Yến, tạ, tấn",
    questions: [
      {
        content: "1 tấn bằng bao nhiêu ki-lô-gam?",
        options: ["1 000 kg", "100 kg", "10 kg", "10 000 kg"],
        correctAnswer: "A",
        explanation: "1 tấn = 1 000 kg."
      },
      {
        content: "1 tạ bằng bao nhiêu yến?",
        options: ["10 yến", "100 yến", "1 yến", "1 000 yến"],
        correctAnswer: "A",
        explanation: "1 tạ = 10 yến (và bằng 100 kg)."
      },
      {
        content: "Đổi: 3 tấn 5 tạ = ... tạ. Số thích hợp điền vào chỗ chấm là:",
        options: ["35", "305", "350", "3 050"],
        correctAnswer: "A",
        explanation: "3 tấn = 30 tạ. 30 tạ + 5 tạ = 35 tạ."
      },
      {
        content: "Một con bò nặng 3 tạ, một con nghé nặng 80 kg. Hỏi cả hai con nặng bao nhiêu ki-lô-gam?",
        options: ["380 kg", "110 kg", "308 kg", "480 kg"],
        correctAnswer: "A",
        explanation: "3 tạ = 300 kg. Cả hai con nặng: 300 + 80 = 380 kg."
      },
      {
        content: "Một xe tải chở 2 tấn thóc. Người ta đã dỡ xuống 8 tạ thóc. Hỏi trên xe còn lại bao nhiêu tạ thóc?",
        options: ["12 tạ", "18 tạ", "10 tạ", "14 tạ"],
        correctAnswer: "A",
        explanation: "2 tấn = 20 tạ. Số thóc còn lại: 20 - 8 = 12 tạ."
      }
    ]
  },
  {
    number: 18,
    title: "Đề-xi-mét vuông, mét vuông, mi-li-mét vuông",
    questions: [
      {
        content: "1 m² bằng bao nhiêu đề-xi-mét vuông?",
        options: ["100 dm²", "10 dm²", "1 000 dm²", "10 000 dm²"],
        correctAnswer: "A",
        explanation: "1 m² = 100 dm²."
      },
      {
        content: "1 cm² bằng bao nhiêu mi-li-mét vuông?",
        options: ["100 mm²", "10 mm²", "1 000 mm²", "10 000 mm²"],
        correctAnswer: "A",
        explanation: "1 cm² = 100 mm²."
      },
      {
        content: "Đổi: 4 m² 25 dm² = ... dm²",
        options: ["425 dm²", "4 025 dm²", "4 250 dm²", "425 000 dm²"],
        correctAnswer: "A",
        explanation: "4 m² = 400 dm²; 400 + 25 = 425 dm²."
      },
      {
        content: "Diện tích của một phòng học khoảng:",
        options: ["50 m²", "50 dm²", "50 cm²", "50 mm²"],
        correctAnswer: "A",
        explanation: "Phòng học thông thường có diện tích khoảng 50 mét vuông (m²)."
      },
      {
        content: "Một hình chữ nhật có chiều dài 8 dm, chiều rộng 5 dm. Diện tích hình chữ nhật đó là:",
        options: ["40 dm²", "26 dm²", "40 m²", "400 dm²"],
        correctAnswer: "A",
        explanation: "Diện tích hình chữ nhật: 8 × 5 = 40 dm²."
      }
    ]
  },
  {
    number: 19,
    title: "Giây, thế kỉ",
    questions: [
      {
        content: "1 thế kỉ bằng bao nhiêu năm?",
        options: ["100 năm", "10 năm", "1 000 năm", "60 năm"],
        correctAnswer: "A",
        explanation: "1 thế kỉ = 100 năm."
      },
      {
        content: "1 phút bằng bao nhiêu giây?",
        options: ["60 giây", "100 giây", "360 giây", "10 giây"],
        correctAnswer: "A",
        explanation: "1 phút = 60 giây."
      },
      {
        content: "Năm 2026 thuộc thế kỉ nào?",
        options: ["Thế kỉ XXI", "Thế kỉ XX", "Thế kỉ XIX", "Thế kỉ XXII"],
        correctAnswer: "A",
        explanation: "Từ năm 2001 đến năm 2100 thuộc thế kỉ XXI (thế kỉ 21)."
      },
      {
        content: "Bác Hồ đọc Tuyên ngôn Độc lập năm 1945. Năm đó thuộc thế kỉ nào?",
        options: ["Thế kỉ XX", "Thế kỉ XIX", "Thế kỉ XXI", "Thế kỉ XVIII"],
        correctAnswer: "A",
        explanation: "Từ năm 1901 đến năm 2000 là thế kỉ XX (thế kỉ 20)."
      },
      {
        content: "Đổi: 2 phút 15 giây = ... giây",
        options: ["135 giây", "75 giây", "215 giây", "125 giây"],
        correctAnswer: "A",
        explanation: "2 phút = 120 giây; 120 + 15 = 135 giây."
      }
    ]
  },
  {
    number: 20,
    title: "Thực hành và trải nghiệm sử dụng một số đơn vị đo đại lượng",
    questions: [
      {
        content: "Để đo thời gian chạy 60 mét của học sinh, người ta thường dùng đơn vị nào?",
        options: ["Giây", "Giờ", "Thế kỉ", "Ngày"],
        correctAnswer: "A",
        explanation: "Thời gian chạy cự li ngắn thường đo bằng giây (khoảng 10-15 giây)."
      },
      {
        content: "Một quả dưa hấu nặng khoảng 3 ... Đơn vị thích hợp điền vào chỗ chấm là:",
        options: ["kg", "tạ", "tấn", "g"],
        correctAnswer: "A",
        explanation: "Một quả dưa hấu nặng khoảng 3 ki-lô-gam (kg)."
      },
      {
        content: "Để đo diện tích một chiếc nhãn vở, đơn vị phù hợp nhất là:",
        options: ["cm²", "m²", "dm²", "mm²"],
        correctAnswer: "A",
        explanation: "Diện tích nhãn vở khoảng vài chục xăng-ti-mét vuông (cm²)."
      },
      {
        content: "Bạn Nam bắt đầu đọc sách lúc 14 giờ 15 phút và đọc xong lúc 15 giờ. Hỏi Nam đã đọc sách trong bao nhiêu phút?",
        options: ["45 phút", "15 phút", "30 phút", "60 phút"],
        correctAnswer: "A",
        explanation: "15 giờ - 14 giờ 15 phút = 45 phút."
      },
      {
        content: "Một gói bột ngọt nặng 450 g, gói thứ hai nặng 550 g. Cả hai gói nặng bao nhiêu ki-lô-gam?",
        options: ["1 kg", "10 kg", "100 g", "1 000 kg"],
        correctAnswer: "A",
        explanation: "450 g + 550 g = 1 000 g = 1 kg."
      }
    ]
  },
  {
    number: 21,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Điền dấu thích hợp: 5 tấn 2 tạ ... 52 tạ",
        options: ["=", ">", "<", "Không so sánh được"],
        correctAnswer: "A",
        explanation: "5 tấn = 50 tạ; 50 + 2 = 52 tạ. Do đó 5 tấn 2 tạ = 52 tạ."
      },
      {
        content: "2 m² 8 dm² = ... dm²",
        options: ["208 dm²", "28 dm²", "280 dm²", "2 008 dm²"],
        correctAnswer: "A",
        explanation: "2 m² = 200 dm²; 200 + 8 = 208 dm²."
      },
      {
        content: "Chiến thắng Điện Biên Phủ diễn ra năm 1954, thuộc thế kỉ nào?",
        options: ["Thế kỉ XX", "Thế kỉ XIX", "Thế kỉ XXI", "Thế kỉ XVIII"],
        correctAnswer: "A",
        explanation: "Năm 1954 thuộc thế kỉ XX."
      },
      {
        content: "Một thửa ruộng hình chữ nhật có chiều dài 25 m, chiều rộng 10 m. Diện tích thửa ruộng đó là:",
        options: ["250 m²", "70 m²", "250 dm²", "35 m²"],
        correctAnswer: "A",
        explanation: "Diện tích: 25 × 10 = 250 m²."
      },
      {
        content: "3 thế kỉ bằng bao nhiêu năm?",
        options: ["300 năm", "30 năm", "3 000 năm", "150 năm"],
        correctAnswer: "A",
        explanation: "1 thế kỉ = 100 năm => 3 thế kỉ = 300 năm."
      }
    ]
  },
  {
    number: 22,
    title: "Phép cộng các số có nhiều chữ số",
    questions: [
      {
        content: "Kết quả của phép tính 245 618 + 321 250 là:",
        options: ["566 868", "566 878", "567 868", "565 868"],
        correctAnswer: "A",
        explanation: "245 618 + 321 250 = 566 868."
      },
      {
        content: "Kết quả của phép tính 428 954 + 371 426 là:",
        options: ["800 380", "799 380", "800 480", "810 380"],
        correctAnswer: "A",
        explanation: "428 954 + 371 426 = 800 380."
      },
      {
        content: "Tìm x, biết: x - 125 000 = 375 000",
        options: ["500 000", "250 000", "400 000", "450 000"],
        correctAnswer: "A",
        explanation: "x = 375 000 + 125 000 = 500 000."
      },
      {
        content: "Một huyện năm ngoái thu hoạch được 125 400 tấn lúa, năm nay thu hoạch nhiều hơn năm ngoái 12 600 tấn. Hỏi cả hai năm huyện đó thu hoạch được bao nhiêu tấn lúa?",
        options: ["263 400 tấn", "138 000 tấn", "250 800 tấn", "275 400 tấn"],
        correctAnswer: "A",
        explanation: "Năm nay: 125 400 + 12 600 = 138 000 tấn. Cả hai năm: 125 400 + 138 000 = 263 400 tấn."
      },
      {
        content: "Tổng của số lớn nhất có 6 chữ số và số bé nhất có 6 chữ số là:",
        options: ["1 099 999", "1 999 999", "999 999", "1 100 000"],
        correctAnswer: "A",
        explanation: "Số lớn nhất có 6 chữ số là 999 999. Số bé nhất có 6 chữ số là 100 000. 999 999 + 100 000 = 1 099 999."
      }
    ]
  },
  {
    number: 23,
    title: "Phép trừ các số có nhiều chữ số",
    questions: [
      {
        content: "Kết quả của phép tính 687 452 - 342 120 là:",
        options: ["345 332", "345 322", "345 432", "335 332"],
        correctAnswer: "A",
        explanation: "687 452 - 342 120 = 345 332."
      },
      {
        content: "Kết quả của phép tính 1 000 000 - 450 000 là:",
        options: ["550 000", "650 000", "500 000", "450 000"],
        correctAnswer: "A",
        explanation: "1 000 000 - 450 000 = 550 000."
      },
      {
        content: "Tìm x, biết: 850 000 - x = 320 000",
        options: ["530 000", "570 000", "1 170 000", "430 000"],
        correctAnswer: "A",
        explanation: "x = 850 000 - 320 000 = 530 000."
      },
      {
        content: "Quãng đường từ Hà Nội đến Đà Nẵng dài khoảng 763 km, từ Hà Nội đến TP. Hồ Chí Minh dài khoảng 1 726 km. Quãng đường từ Đà Nẵng đến TP. Hồ Chí Minh dài khoảng:",
        options: ["963 km", "1 063 km", "863 km", "973 km"],
        correctAnswer: "A",
        explanation: "1 726 - 763 = 963 km."
      },
      {
        content: "Hiệu giữa số chẵn lớn nhất có 6 chữ số và số chẵn bé nhất có 6 chữ số là:",
        options: ["899 998", "999 998", "899 999", "900 000"],
        correctAnswer: "A",
        explanation: "Số chẵn lớn nhất có 6 chữ số: 999 998. Số chẵn bé nhất có 6 chữ số: 100 000. 999 998 - 100 000 = 899 998."
      }
    ]
  },
  {
    number: 24,
    title: "Tính chất giao hoán và kết hợp của phép cộng",
    questions: [
      {
        content: "Công thức biểu diễn tính chất giao hoán của phép cộng là:",
        options: ["a + b = b + a", "(a + b) + c = a + (b + c)", "a + 0 = a", "a × b = b × a"],
        correctAnswer: "A",
        explanation: "Tính chất giao hoán: Khi đổi chỗ các số hạng trong một tổng thì tổng không thay đổi: a + b = b + a."
      },
      {
        content: "Tính thuận tiện: 125 + 380 + 75 =",
        options: ["580", "570", "590", "600"],
        correctAnswer: "A",
        explanation: "(125 + 75) + 380 = 200 + 380 = 580."
      },
      {
        content: "Tính thuận tiện tổng: 46 + 189 + 54 + 11 =",
        options: ["300", "310", "290", "280"],
        correctAnswer: "A",
        explanation: "(46 + 54) + (189 + 11) = 100 + 200 = 300."
      },
      {
        content: "Biểu thức (a + b) + c = a + (b + c) thể hiện tính chất gì của phép cộng?",
        options: ["Tính chất kết hợp", "Tính chất giao hoán", "Tính chất phân phối", "Cộng với số 0"],
        correctAnswer: "A",
        explanation: "Khi cộng một tổng hai số với số thứ ba, ta có thể cộng số thứ nhất với tổng của số thứ hai và số thứ ba (tính chất kết hợp)."
      },
      {
        content: "Điền số thích hợp: 4 500 + 2 700 = 2 700 + ...",
        options: ["4 500", "2 700", "7 200", "1 800"],
        correctAnswer: "A",
        explanation: "Theo tính chất giao hoán: 4 500 + 2 700 = 2 700 + 4 500."
      }
    ]
  },
  {
    number: 25,
    title: "Tìm hai số biết tổng và hiệu của hai số đó",
    questions: [
      {
        content: "Công thức tìm số lớn khi biết tổng và hiệu là:",
        options: [
          "(Tổng + Hiệu) : 2",
          "(Tổng - Hiệu) : 2",
          "Tổng + Hiệu",
          "Tổng : 2 + Hiệu"
        ],
        correctAnswer: "A",
        explanation: "Số lớn = (Tổng + Hiệu) : 2."
      },
      {
        content: "Hai bạn An và Bình có tất cả 48 viên bi. An có nhiều hơn Bình 12 viên bi. Hỏi An có bao nhiêu viên bi?",
        options: ["30 viên", "18 viên", "36 viên", "24 viên"],
        correctAnswer: "A",
        explanation: "Số bi của An (số lớn) là: (48 + 12) : 2 = 30 viên bi."
      },
      {
        content: "Tổng của hai số là 100, hiệu của hai số là 30. Số bé là:",
        options: ["35", "65", "40", "70"],
        correctAnswer: "A",
        explanation: "Số bé = (100 - 30) : 2 = 35."
      },
      {
        content: "Một lớp học có 35 học sinh, trong đó số học sinh nữ nhiều hơn số học sinh nam là 5 bạn. Số học sinh nữ là:",
        options: ["20 bạn", "15 bạn", "25 bạn", "18 bạn"],
        correctAnswer: "A",
        explanation: "Số học sinh nữ: (35 + 5) : 2 = 20 bạn."
      },
      {
        content: "Một mảnh đất hình chữ nhật có chu vi là 60 m, chiều dài hơn chiều rộng 6 m. Chiều dài của mảnh đất đó là:",
        options: ["18 m", "12 m", "24 m", "33 m"],
        correctAnswer: "A",
        explanation: "Nửa chu vi (Tổng) = 60 : 2 = 30 m. Chiều dài = (30 + 6) : 2 = 18 m."
      }
    ]
  },
  {
    number: 26,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Tổng của hai số là 84, hiệu của hai số là 16. Hai số đó là:",
        options: ["50 và 34", "45 và 39", "52 và 32", "48 và 36"],
        correctAnswer: "A",
        explanation: "Số lớn = (84 + 16) : 2 = 50. Số bé = 84 - 50 = 34."
      },
      {
        content: "Tính giá trị biểu thức bằng cách thuận tiện: 2 345 + 4 567 + 7 655 + 5 433 =",
        options: ["20 000", "19 000", "21 000", "22 000"],
        correctAnswer: "A",
        explanation: "(2 345 + 7 655) + (4 567 + 5 433) = 10 000 + 10 000 = 20 000."
      },
      {
        content: "Tuổi bố và tuổi con cộng lại được 50 tuổi. Bố hơn con 28 tuổi. Hỏi con bao nhiêu tuổi?",
        options: ["11 tuổi", "39 tuổi", "12 tuổi", "10 tuổi"],
        correctAnswer: "A",
        explanation: "Tuổi con = (50 - 28) : 2 = 11 tuổi."
      },
      {
        content: "Tổng của hai số chẵn liên tiếp là 38. Hai số đó là:",
        options: ["18 và 20", "16 và 22", "19 và 19", "17 và 21"],
        correctAnswer: "A",
        explanation: "Hai số chẵn liên tiếp có hiệu bằng 2. Số lớn = (38 + 2) : 2 = 20, số bé = 18."
      },
      {
        content: "Hai kho thóc chứa 250 tấn thóc. Nếu chuyển 20 tấn từ kho thứ nhất sang kho thứ hai thì hai kho bằng nhau. Lúc đầu kho thứ nhất có:",
        options: ["145 tấn", "105 tấn", "125 tấn", "165 tấn"],
        correctAnswer: "A",
        explanation: "Chuyển 20 tấn mà bằng nhau nên kho 1 hơn kho 2 là: 20 × 2 = 40 tấn. Kho 1 = (250 + 40) : 2 = 145 tấn."
      }
    ]
  },
  {
    number: 27,
    title: "Hai đường thẳng vuông góc",
    questions: [
      {
        content: "Hai đường thẳng vuông góc với nhau tạo thành mấy góc vuông tại điểm giao nhau?",
        options: ["4 góc vuông", "2 góc vuông", "1 góc vuông", "3 góc vuông"],
        correctAnswer: "A",
        explanation: "Hai đường thẳng vuông góc cắt nhau tạo thành 4 góc vuông."
      },
      {
        content: "Dụng cụ tốt nhất dùng để kiểm tra hai đường thẳng có vuông góc với nhau hay không là:",
        options: ["Ê-ke", "Thước dây", "Com-pa", "Bút chì"],
        correctAnswer: "A",
        explanation: "Ê-ke có một góc vuông chuẩn, dùng để kiểm tra góc vuông và hai đường thẳng vuông góc."
      },
      {
        content: "Trong hình chữ nhật ABCD, cặp cạnh nào dưới đây vuông góc với nhau?",
        options: ["AB và BC", "AB và CD", "AD và BC", "AC và BD"],
        correctAnswer: "A",
        explanation: "Trong hình chữ nhật, hai cạnh kề nhau thì vuông góc với nhau: AB vuông góc với BC."
      },
      {
        content: "Hai mép liền kề của một quyển vở kẻ ô ly tạo với nhau một góc gì?",
        options: ["Góc vuông", "Góc nhọn", "Góc tù", "Góc bẹt"],
        correctAnswer: "A",
        explanation: "Hai mép liền kề của quyển vở hình chữ nhật vuông góc với nhau tạo thành góc vuông."
      },
      {
        content: "Cho đường thẳng AB và điểm M nằm ngoài AB. Có thể vẽ được bao nhiêu đường thẳng đi qua M và vuông góc với AB?",
        options: ["1 đường thẳng", "2 đường thẳng", "Vô số đường thẳng", "0 đường thẳng"],
        correctAnswer: "A",
        explanation: "Qua một điểm cho trước, chỉ vẽ được duy nhất 1 đường thẳng vuông góc với đường thẳng đã cho."
      }
    ]
  },
  {
    number: 28,
    title: "Thực hành và trải nghiệm về hai đường thẳng vuông góc",
    questions: [
      {
        content: "Để vẽ đường thẳng đi qua điểm O và vuông góc với đường thẳng AB, ta đặt một cạnh góc vuông của ê-ke:",
        options: [
          "Trùng với đường thẳng AB và đỉnh góc vuông hoặc cạnh còn lại đi qua O",
          "Vuông góc với AB",
          "Song song với AB",
          "Cắt đường thẳng AB tại góc 45°"
        ],
        correctAnswer: "A",
        explanation: "Đặt một cạnh góc vuông của ê-ke trùng với AB, trượt ê-ke sao cho cạnh góc vuông kia gặp điểm O."
      },
      {
        content: "Đoạn thẳng vuông góc kẻ từ đỉnh của một hình tam giác xuống cạnh đối diện được gọi là:",
        options: ["Đường cao", "Đường chéo", "Cạnh đáy", "Cạnh bên"],
        correctAnswer: "A",
        explanation: "Đoạn thẳng hạ vuông góc từ một đỉnh xuống cạnh đối diện của tam giác gọi là đường cao."
      },
      {
        content: "Trong một hình vuông, hai đường chéo có tính chất gì?",
        options: [
          "Vuông góc với nhau",
          "Song song với nhau",
          "Trùng nhau",
          "Không cắt nhau"
        ],
        correctAnswer: "A",
        explanation: "Hai đường chéo của hình vuông vuông góc với nhau."
      },
      {
        content: "Khung cửa sổ hình chữ nhật có bao nhiêu cặp cạnh vuông góc với nhau?",
        options: ["4 cặp", "2 cặp", "6 cặp", "8 cặp"],
        correctAnswer: "A",
        explanation: "4 góc vuông của hình chữ nhật tạo thành 4 cặp cạnh vuông góc tại 4 đỉnh."
      },
      {
        content: "Khi hai kim đồng hồ vuông góc với nhau, góc tạo bởi hai kim là bao nhiêu độ?",
        options: ["90°", "180°", "60°", "45°"],
        correctAnswer: "A",
        explanation: "Hai đường thẳng vuông góc tạo thành góc 90°."
      }
    ]
  },
  {
    number: 29,
    title: "Hai đường thẳng song song",
    questions: [
      {
        content: "Hai đường thẳng song song là hai đường thẳng:",
        options: [
          "Không bao giờ cắt nhau dù kéo dài mãi",
          "Cắt nhau tạo thành góc vuông",
          "Cắt nhau tại một điểm",
          "Có cùng độ dài"
        ],
        correctAnswer: "A",
        explanation: "Hai đường thẳng song song với nhau thì không bao giờ cắt nhau."
      },
      {
        content: "Trong hình chữ nhật ABCD, cặp cạnh nào dưới đây song song với nhau?",
        options: ["AB và CD", "AB và BC", "AD và AB", "BC và CD"],
        correctAnswer: "A",
        explanation: "Trong hình chữ nhật, các cặp cạnh đối diện song song với nhau: AB song song với CD; AD song song với BC."
      },
      {
        content: "Hình ảnh thực tế nào dưới đây minh họa hai đường thẳng song song?",
        options: [
          "Hai thanh ray của đường tàu hỏa",
          "Hai chiếc kim đồng hồ lúc 3 giờ",
          "Hai cạnh kề nhau của mặt bàn",
          "Hai đường chéo của hình vuông"
        ],
        correctAnswer: "A",
        explanation: "Hai thanh ray đường tàu luôn cách đều và không cắt nhau, là hình ảnh của hai đường thẳng song song."
      },
      {
        content: "Qua điểm M nằm ngoài đường thẳng a, ta có thể vẽ được bao nhiêu đường thẳng song song với đường thẳng a?",
        options: ["1 đường thẳng", "2 đường thẳng", "Vô số đường thẳng", "0 đường thẳng"],
        correctAnswer: "A",
        explanation: "Qua một điểm ở ngoài một đường thẳng, chỉ có một đường thẳng song song với đường thẳng đó."
      },
      {
        content: "Nếu đường thẳng a và đường thẳng b cùng vuông góc với đường thẳng c thì:",
        options: [
          "Đường thẳng a song song với đường thẳng b",
          "Đường thẳng a vuông góc với đường thẳng b",
          "Đường thẳng a trùng với đường thẳng b",
          "Đường thẳng a cắt đường thẳng b"
        ],
        correctAnswer: "A",
        explanation: "Hai đường thẳng cùng vuông góc với một đường thẳng thứ ba thì song song với nhau."
      }
    ]
  },
  {
    number: 30,
    title: "Thực hành và trải nghiệm về hai đường thẳng song song",
    questions: [
      {
        content: "Để vẽ đường thẳng đi qua điểm M và song song với đường thẳng AB, người ta thường dùng kết hợp:",
        options: ["Thước kẻ và ê-ke", "Com-pa và thước đo độ", "Hai chiếc bút chì", "Thước dây"],
        correctAnswer: "A",
        explanation: "Dùng thước kẻ và ê-ke trượt để vẽ đường thẳng song song chuẩn xác."
      },
      {
        content: "Trong hình vuông MNPQ, cặp đoạn thẳng nào song song với nhau?",
        options: ["MN và PQ", "MN và NP", "NP và PQ", "MQ và MN"],
        correctAnswer: "A",
        explanation: "Cặp cạnh đối diện MN và PQ song song với nhau."
      },
      {
        content: "Các vạch kẻ của dòng kẻ ô ly trong vở là những đường thẳng như thế nào với nhau?",
        options: ["Song song với nhau", "Vuông góc với nhau", "Cắt nhau", "Trùng nhau"],
        correctAnswer: "A",
        explanation: "Các đường kẻ ngang trong trang vở luôn song song và cách đều nhau."
      },
      {
        content: "Hai cạnh đối diện của khung bảng lớp học là hình ảnh của:",
        options: ["Hai đường thẳng song song", "Hai đường thẳng vuông góc", "Hai đường thẳng cắt nhau", "Góc tù"],
        correctAnswer: "A",
        explanation: "Hai cạnh đối diện của hình chữ nhật song song với nhau."
      },
      {
        content: "Hình thang có đặc điểm gì về các cạnh đáy?",
        options: ["Có một cặp cạnh đáy đối diện song song", "Có 4 cạnh song song", "Có 4 cạnh bằng nhau", "Không có cạnh nào song song"],
        correctAnswer: "A",
        explanation: "Hình thang có một cặp cạnh đối diện song song với nhau gọi là hai đáy."
      }
    ]
  },
  {
    number: 31,
    title: "Hình bình hành, hình thoi",
    questions: [
      {
        content: "Hình bình hành có đặc điểm nào dưới đây?",
        options: [
          "Có hai cặp cạnh đối diện song song và bằng nhau",
          "Có 4 góc vuông",
          "Có 4 cạnh bằng nhau",
          "Chỉ có một cặp cạnh song song"
        ],
        correctAnswer: "A",
        explanation: "Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau."
      },
      {
        content: "Hình thoi có đặc điểm nào nổi bật nhất?",
        options: [
          "Có hai cặp cạnh đối diện song song và 4 cạnh bằng nhau",
          "Có 4 góc vuông",
          "Có hai đường chéo bằng nhau",
          "Có 4 góc bằng nhau"
        ],
        correctAnswer: "A",
        explanation: "Hình thoi có hai cặp cạnh đối diện song song và 4 cạnh dài bằng nhau."
      },
      {
        content: "Hai đường chéo của hình thoi có tính chất gì?",
        options: [
          "Vuông góc với nhau và cắt nhau tại trung điểm của mỗi đường",
          "Bằng nhau và song song với nhau",
          "Không bao giờ cắt nhau",
          "Tạo thành một góc tù"
        ],
        correctAnswer: "A",
        explanation: "Hai đường chéo của hình thoi vuông góc với nhau và cắt nhau tại trung điểm của mỗi đường."
      },
      {
        content: "Hình vuông có phải là một hình thoi đặc biệt không?",
        options: [
          "Có, vì có 4 cạnh bằng nhau và có thêm 4 góc vuông",
          "Không, hình vuông không liên quan đến hình thoi",
          "Chỉ đúng khi hình vuông có kích thước lớn",
          "Chỉ là hình bình hành chứ không phải hình thoi"
        ],
        correctAnswer: "A",
        explanation: "Hình vuông là hình thoi đặc biệt có 4 góc vuông."
      },
      {
        content: "Một hình thoi có cạnh dài 6 cm. Chu vi của hình thoi đó là:",
        options: ["24 cm", "12 cm", "36 cm", "18 cm"],
        correctAnswer: "A",
        explanation: "Hình thoi có 4 cạnh bằng nhau nên chu vi là: 6 × 4 = 24 cm."
      }
    ]
  },
  {
    number: 32,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Hình nào dưới đây có hai đường chéo vuông góc với nhau?",
        options: ["Hình thoi", "Hình chữ nhật", "Hình bình hành", "Hình thang cân"],
        correctAnswer: "A",
        explanation: "Hình thoi có hai đường chéo vuông góc với nhau."
      },
      {
        content: "Hình bình hành ABCD có độ dài cạnh AB = 12 cm, BC = 8 cm. Chu vi của hình bình hành ABCD là:",
        options: ["40 cm", "20 cm", "96 cm", "48 cm"],
        correctAnswer: "A",
        explanation: "Chu vi hình bình hành: (12 + 8) × 2 = 40 cm."
      },
      {
        content: "Hình thoi có bao nhiêu cặp cạnh đối diện song song?",
        options: ["2 cặp", "4 cặp", "1 cặp", "3 cặp"],
        correctAnswer: "A",
        explanation: "Hình thoi có 2 cặp cạnh đối diện song song."
      },
      {
        content: "Khẳng định nào sau đây là SAI?",
        options: [
          "Hình bình hành luôn có 4 góc vuông",
          "Hình thoi có 4 cạnh bằng nhau",
          "Hình chữ nhật có 4 góc vuông",
          "Hình vuông vừa là hình chữ nhật vừa là hình thoi"
        ],
        correctAnswer: "A",
        explanation: "Hình bình hành không nhất thiết có 4 góc vuông (nếu có 4 góc vuông thì nó là hình chữ nhật)."
      },
      {
        content: "Một hình thoi có chu vi bằng 48 dm. Độ dài mỗi cạnh của hình thoi là:",
        options: ["12 dm", "16 dm", "24 dm", "8 dm"],
        correctAnswer: "A",
        explanation: "Độ dài cạnh hình thoi: 48 : 4 = 12 dm."
      }
    ]
  },
  {
    number: 33,
    title: "Ôn tập các số đến lớp triệu",
    questions: [
      {
        content: "Số \"Năm mươi triệu không trăm linh tám nghìn ba trăm\" viết là:",
        options: ["50 008 300", "50 080 300", "5 008 300", "50 800 300"],
        correctAnswer: "A",
        explanation: "50 triệu (50), 008 nghìn (008), 3 trăm (300) => 50 008 300."
      },
      {
        content: "Chữ số 9 trong số 29 450 600 có giá trị là:",
        options: ["9 000 000", "90 000 000", "900 000", "90 000"],
        correctAnswer: "A",
        explanation: "Chữ số 9 đứng ở hàng triệu nên có giá trị là 9 000 000."
      },
      {
        content: "Làm tròn số 3 750 000 đến hàng trăm nghìn được:",
        options: ["3 800 000", "3 700 000", "4 000 000", "3 750 000"],
        correctAnswer: "A",
        explanation: "Hàng chục nghìn là 5 (≥ 5) nên làm tròn lên thành 3 800 000."
      },
      {
        content: "Số tự nhiên lớn nhất có 7 chữ số khác nhau là:",
        options: ["9 876 543", "9 999 999", "9 876 542", "9 876 534"],
        correctAnswer: "A",
        explanation: "Chọn các chữ số giảm dần từ lớn nhất: 9 876 543."
      },
      {
        content: "Trong dãy số tự nhiên, hai số chẵn liên tiếp hơn kém nhau:",
        options: ["2 đơn vị", "1 đơn vị", "10 đơn vị", "0 đơn vị"],
        correctAnswer: "A",
        explanation: "Hai số chẵn liên tiếp (ví dụ 2 và 4, 10 và 12) hơn kém nhau 2 đơn vị."
      }
    ]
  },
  {
    number: 34,
    title: "Ôn tập phép cộng, phép trừ",
    questions: [
      {
        content: "Giá trị của biểu thức 450 000 + 230 000 - 180 000 là:",
        options: ["500 000", "400 000", "580 000", "510 000"],
        correctAnswer: "A",
        explanation: "450 000 + 230 000 = 680 000; 680 000 - 180 000 = 500 000."
      },
      {
        content: "Tìm hai số có tổng là 200 và hiệu là 40:",
        options: ["120 và 80", "110 và 90", "130 và 70", "140 và 60"],
        correctAnswer: "A",
        explanation: "Số lớn = (200 + 40) : 2 = 120. Số bé = 200 - 120 = 80."
      },
      {
        content: "Tính nhanh: 345 + 567 + 655 + 433 =",
        options: ["2 000", "1 900", "2 100", "1 800"],
        correctAnswer: "A",
        explanation: "(345 + 655) + (567 + 433) = 1 000 + 1 000 = 2 000."
      },
      {
        content: "Một thư viện có 15 400 cuốn sách, trong đó sách giáo khoa ít hơn các loại sách khác 3 200 cuốn. Số sách giáo khoa là:",
        options: ["6 100 cuốn", "9 300 cuốn", "5 100 cuốn", "7 100 cuốn"],
        correctAnswer: "A",
        explanation: "Số sách giáo khoa (số bé) = (15 400 - 3 200) : 2 = 6 100 cuốn."
      },
      {
        content: "Hiệu giữa số lớn nhất có 5 chữ số và số bé nhất có 5 chữ số là:",
        options: ["89 999", "99 999", "89 998", "90 000"],
        correctAnswer: "A",
        explanation: "99 999 - 10 000 = 89 999."
      }
    ]
  },
  {
    number: 35,
    title: "Ôn tập hình học",
    questions: [
      {
        content: "Góc có số đo lớn hơn góc nhọn và nhỏ hơn góc tù là:",
        options: ["Góc vuông", "Góc bẹt", "Góc tù", "Góc nhọn"],
        correctAnswer: "A",
        explanation: "Góc nhọn (< 90°) < Góc vuông (= 90°) < Góc tù (> 90°)."
      },
      {
        content: "Hình bình hành có đặc điểm nào dưới đây?",
        options: [
          "Các cặp cạnh đối diện song song và bằng nhau",
          "Bốn cạnh đều bằng nhau",
          "Bốn góc đều là góc vuông",
          "Hai đường chéo vuông góc với nhau"
        ],
        correctAnswer: "A",
        explanation: "Hình bình hành có các cặp cạnh đối diện song song và bằng nhau."
      },
      {
        content: "Hình nào vừa có 4 cạnh bằng nhau vừa có 4 góc vuông?",
        options: ["Hình vuông", "Hình thoi", "Hình chữ nhật", "Hình bình hành"],
        correctAnswer: "A",
        explanation: "Hình vuông có 4 cạnh bằng nhau và 4 góc vuông."
      },
      {
        content: "Hai đường thẳng vuông góc tạo thành góc có số đo là:",
        options: ["90°", "180°", "60°", "45°"],
        correctAnswer: "A",
        explanation: "Hai đường thẳng vuông góc tạo thành góc 90°."
      },
      {
        content: "Một hình thoi có cạnh bằng 15 cm. Chu vi của hình thoi là:",
        options: ["60 cm", "30 cm", "45 cm", "75 cm"],
        correctAnswer: "A",
        explanation: "Chu vi = 15 × 4 = 60 cm."
      }
    ]
  },
  {
    number: 36,
    title: "Ôn tập đo lường",
    questions: [
      {
        content: "Đổi: 4 tấn 50 kg = ... kg",
        options: ["4 050 kg", "4 500 kg", "450 kg", "40 050 kg"],
        correctAnswer: "A",
        explanation: "4 tấn = 4 000 kg; 4 000 + 50 = 4 050 kg."
      },
      {
        content: "Đổi: 5 m² 4 dm² = ... dm²",
        options: ["504 dm²", "54 dm²", "540 dm²", "5 040 dm²"],
        correctAnswer: "A",
        explanation: "5 m² = 500 dm²; 500 + 4 = 504 dm²."
      },
      {
        content: "Năm 1010 vua Lý Thái Tổ dời đô về Thăng Long. Năm 1010 thuộc thế kỉ nào?",
        options: ["Thế kỉ XI", "Thế kỉ X", "Thế kỉ XII", "Thế kỉ IX"],
        correctAnswer: "A",
        explanation: "Từ năm 1001 đến 1100 là thế kỉ XI (thế kỉ 11)."
      },
      {
        content: "Đổi: 3 phút 20 giây = ... giây",
        options: ["200 giây", "180 giây", "320 giây", "140 giây"],
        correctAnswer: "A",
        explanation: "3 phút = 180 giây; 180 + 20 = 200 giây."
      },
      {
        content: "Một con gà nặng 2 kg 500 g, một con vịt nặng 2 kg. Con gà nặng hơn con vịt bao nhiêu gam?",
        options: ["500 g", "50 g", "1 000 g", "200 g"],
        correctAnswer: "A",
        explanation: "2 500 g - 2 000 g = 500 g."
      }
    ]
  },
  {
    number: 37,
    title: "Ôn tập chung",
    questions: [
      {
        content: "Số liền trước của số 1 000 000 là:",
        options: ["999 999", "1 000 001", "999 990", "99 999"],
        correctAnswer: "A",
        explanation: "1 000 000 - 1 = 999 999."
      },
      {
        content: "Tính giá trị biểu thức: 125 000 + 35 000 × 2 =",
        options: ["195 000", "320 000", "160 000", "220 000"],
        correctAnswer: "A",
        explanation: "Nhân trước: 35 000 × 2 = 70 000. Sau đó cộng: 125 000 + 70 000 = 195 000."
      },
      {
        content: "Hai kho gạo có tất cả 360 tấn gạo. Kho A nhiều hơn kho B 40 tấn. Hỏi kho B có bao nhiêu tấn gạo?",
        options: ["160 tấn", "200 tấn", "140 tấn", "180 tấn"],
        correctAnswer: "A",
        explanation: "Kho B (kho bé) = (360 - 40) : 2 = 160 tấn."
      },
      {
        content: "Hình thoi có hai đường chéo dài 10 cm và 8 cm thì hai đường chéo đó:",
        options: [
          "Vuông góc với nhau",
          "Song song với nhau",
          "Bằng nhau",
          "Trùng nhau"
        ],
        correctAnswer: "A",
        explanation: "Hai đường chéo của hình thoi luôn vuông góc với nhau."
      },
      {
        content: "2 thế kỉ 15 năm bằng bao nhiêu năm?",
        options: ["215 năm", "205 năm", "250 năm", "115 năm"],
        correctAnswer: "A",
        explanation: "2 thế kỉ = 200 năm; 200 + 15 = 215 năm."
      }
    ]
  }
];
