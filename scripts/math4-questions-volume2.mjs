// 36 Lessons of Grade 4 Math - Volume 2 (Sách giáo khoa Toán 4 - Tập 2, Kết nối tri thức với cuộc sống, Bài 38 đến 73)
// Each lesson has exactly 5 multiple choice questions.

export const volume2Lessons = [
  {
    number: 38,
    title: "Nhân với số có một chữ số",
    questions: [
      {
        content: "Kết quả của phép tính 24 153 × 3 là:",
        options: ["72 459", "72 359", "71 459", "72 469"],
        correctAnswer: "A",
        explanation: "24 153 × 3 = 72 459."
      },
      {
        content: "Một xưởng may mỗi ngày may được 1 250 chiếc áo. Hỏi trong 5 ngày xưởng may đó may được bao nhiêu chiếc áo?",
        options: ["6 250 chiếc", "5 250 chiếc", "6 150 chiếc", "7 250 chiếc"],
        correctAnswer: "A",
        explanation: "1 250 × 5 = 6 250 chiếc áo."
      },
      {
        content: "Tìm y, biết: y : 4 = 15 200",
        options: ["60 800", "3 800", "60 200", "50 800"],
        correctAnswer: "A",
        explanation: "y = 15 200 × 4 = 60 800."
      },
      {
        content: "Kết quả của phép tính 108 050 × 6 là:",
        options: ["648 300", "648 030", "648 350", "658 300"],
        correctAnswer: "A",
        explanation: "108 050 × 6 = 648 300."
      },
      {
        content: "Giá trị của biểu thức 12 000 + 4 500 × 2 là:",
        options: ["21 000", "33 000", "19 000", "22 500"],
        correctAnswer: "A",
        explanation: "Thực hiện nhân trước: 4 500 × 2 = 9 000. 12 000 + 9 000 = 21 000."
      }
    ]
  },
  {
    number: 39,
    title: "Chia cho số có một chữ số",
    questions: [
      {
        content: "Kết quả của phép tính 84 848 : 4 là:",
        options: ["21 212", "21 210", "21 202", "21 112"],
        correctAnswer: "A",
        explanation: "84 848 : 4 = 21 212."
      },
      {
        content: "Thương và số dư của phép tính 45 617 : 5 là:",
        options: ["9 123 (dư 2)", "9 123 (dư 1)", "9 120 (dư 2)", "9 125 (dư 2)"],
        correctAnswer: "A",
        explanation: "45 617 = 9 123 × 5 + 2."
      },
      {
        content: "Có 24 000 kg gạo chia đều vào 6 kho. Hỏi mỗi kho có bao nhiêu tấn gạo?",
        options: ["4 tấn", "40 tấn", "400 tấn", "4 000 kg"],
        correctAnswer: "A",
        explanation: "Mỗi kho: 24 000 : 6 = 4 000 kg = 4 tấn."
      },
      {
        content: "Tìm x, biết: x × 7 = 35 700",
        options: ["5 100", "5 010", "4 900", "5 200"],
        correctAnswer: "A",
        explanation: "x = 35 700 : 7 = 5 100."
      },
      {
        content: "Trong một phép chia có dư với số chia là 8, số dư lớn nhất có thể là:",
        options: ["7", "8", "9", "6"],
        correctAnswer: "A",
        explanation: "Số dư luôn bé hơn số chia, nên số dư lớn nhất khi chia cho 8 là 7."
      }
    ]
  },
  {
    number: 40,
    title: "Tính chất giao hoán và kết hợp của phép nhân",
    questions: [
      {
        content: "Tính chất giao hoán của phép nhân được viết là:",
        options: ["a × b = b × a", "(a × b) × c = a × (b × c)", "a × 1 = a", "a × 0 = 0"],
        correctAnswer: "A",
        explanation: "Khi đổi chỗ các thừa số trong một tích thì tích không thay đổi: a × b = b × a."
      },
      {
        content: "Tính nhanh: 25 × 7 × 4 =",
        options: ["700", "750", "800", "650"],
        correctAnswer: "A",
        explanation: "(25 × 4) × 7 = 100 × 7 = 700."
      },
      {
        content: "Biểu thức (a × b) × c = a × (b × c) thể hiện tính chất gì?",
        options: ["Tính chất kết hợp", "Tính chất giao hoán", "Tính chất phân phối", "Nhân với 1"],
        correctAnswer: "A",
        explanation: "Khi nhân một tích hai số với số thứ ba, ta có thể nhân số thứ nhất với tích của số thứ hai và số thứ ba (tính chất kết hợp)."
      },
      {
        content: "Tính nhanh: 125 × 9 × 8 =",
        options: ["9 000", "8 000", "10 000", "9 500"],
        correctAnswer: "A",
        explanation: "(125 × 8) × 9 = 1 000 × 9 = 9 000."
      },
      {
        content: "Điền số thích hợp: 34 × 5 × 2 = 34 × ...",
        options: ["10", "7", "20", "25"],
        correctAnswer: "A",
        explanation: "5 × 2 = 10 nên 34 × 5 × 2 = 34 × 10."
      }
    ]
  },
  {
    number: 41,
    title: "Nhân, chia với 10, 100, 1 000,...",
    questions: [
      {
        content: "Khi nhân một số tự nhiên với 10, 100, 1 000,... ta chỉ việc viết thêm lần lượt mấy chữ số 0 vào bên phải số đó?",
        options: [
          "Một, hai, ba,... chữ số 0",
          "Hai, ba, bốn,... chữ số 0",
          "Chỉ một chữ số 0",
          "Một, hai, ba,... chữ số 1"
        ],
        correctAnswer: "A",
        explanation: "Nhân với 10 thêm 1 số 0; nhân với 100 thêm 2 số 0; nhân với 1 000 thêm 3 số 0."
      },
      {
        content: "Kết quả của phép tính 245 × 100 là:",
        options: ["24 500", "2 450", "245 000", "245 000 000"],
        correctAnswer: "A",
        explanation: "245 × 100 = 24 500."
      },
      {
        content: "Kết quả của phép tính 680 000 : 1 000 là:",
        options: ["680", "6 800", "68", "68 000"],
        correctAnswer: "A",
        explanation: "Bớt 3 chữ số 0 ở bên phải: 680 000 : 1 000 = 680."
      },
      {
        content: "1 tấn gạo bằng bao nhiêu bao gạo loại 50 kg?",
        options: ["20 bao", "10 bao", "25 bao", "50 bao"],
        correctAnswer: "A",
        explanation: "1 tấn = 1 000 kg. Số bao: 1 000 : 50 = 20 bao."
      },
      {
        content: "Tìm số thích hợp điền vào chỗ chấm: 35 × ... = 35 000",
        options: ["1 000", "100", "10", "10 000"],
        correctAnswer: "A",
        explanation: "35 000 : 35 = 1 000."
      }
    ]
  },
  {
    number: 42,
    title: "Tính chất phân phối của phép nhân đối với phép cộng",
    questions: [
      {
        content: "Công thức tính chất phân phối của phép nhân đối với phép cộng là:",
        options: [
          "a × (b + c) = a × b + a × c",
          "(a + b) × c = a + b × c",
          "a × (b + c) = a + b + c",
          "a × (b × c) = a × b × c"
        ],
        correctAnswer: "A",
        explanation: "Khi nhân một số với một tổng, ta có thể nhân số đó với từng số hạng của tổng, rồi cộng các kết quả với nhau."
      },
      {
        content: "Tính thuận tiện: 35 × 12 + 35 × 88 =",
        options: ["3 500", "350", "3 400", "3 600"],
        correctAnswer: "A",
        explanation: "35 × (12 + 88) = 35 × 100 = 3 500."
      },
      {
        content: "Tính thuận tiện: 125 × 7 + 125 × 3 =",
        options: ["1 250", "1 000", "1 500", "1 150"],
        correctAnswer: "A",
        explanation: "125 × (7 + 3) = 125 × 10 = 1 250."
      },
      {
        content: "Biểu thức 48 × 99 có thể tính nhanh bằng cách nào?",
        options: [
          "48 × (100 - 1) = 48 × 100 - 48",
          "48 × 90 + 48 × 9",
          "(48 + 2) × 99",
          "48 × 100 + 48"
        ],
        correctAnswer: "A",
        explanation: "48 × 99 = 48 × (100 - 1) = 4 800 - 48 = 4 752."
      },
      {
        content: "Biểu thức 24 × 5 + 24 × 4 + 24 có giá trị là:",
        options: ["240", "216", "244", "264"],
        correctAnswer: "A",
        explanation: "24 × (5 + 4 + 1) = 24 × 10 = 240."
      }
    ]
  },
  {
    number: 43,
    title: "Nhân với số có hai chữ số",
    questions: [
      {
        content: "Kết quả của phép tính 36 × 12 là:",
        options: ["432", "422", "396", "442"],
        correctAnswer: "A",
        explanation: "36 × 12 = 36 × 10 + 36 × 2 = 360 + 72 = 432."
      },
      {
        content: "Khi đặt tính nhân với số có hai chữ số, tích riêng thứ hai được viết:",
        options: [
          "Lùi sang bên trái một cột so với tích riêng thứ nhất",
          "Thẳng cột với tích riêng thứ nhất",
          "Lùi sang bên phải một cột",
          "Lùi sang bên trái hai cột"
        ],
        correctAnswer: "A",
        explanation: "Tích riêng thứ hai là tích với chữ số hàng chục nên phải lùi sang bên trái một cột."
      },
      {
        content: "Một tấm vải dài 25 m, giá mỗi mét là 45 000 đồng. Tấm vải đó có giá là:",
        options: ["1 125 000 đồng", "1 025 000 đồng", "1 225 000 đồng", "925 000 đồng"],
        correctAnswer: "A",
        explanation: "45 000 × 25 = 1 125 000 đồng."
      },
      {
        content: "Kết quả của phép tính 142 × 23 là:",
        options: ["3 266", "3 166", "3 276", "3 366"],
        correctAnswer: "A",
        explanation: "142 × 23 = 142 × 3 + 142 × 20 = 426 + 2 840 = 3 266."
      },
      {
        content: "Nếu mỗi bạn quyên góp 15 quyển vở thì 32 bạn quyên góp được tất cả:",
        options: ["480 quyển", "450 quyển", "490 quyển", "500 quyển"],
        correctAnswer: "A",
        explanation: "15 × 32 = 480 quyển vở."
      }
    ]
  },
  {
    number: 44,
    title: "Chia cho số có hai chữ số",
    questions: [
      {
        content: "Kết quả của phép tính 288 : 24 là:",
        options: ["12", "14", "11", "13"],
        correctAnswer: "A",
        explanation: "288 : 24 = 12."
      },
      {
        content: "Thương và số dư của phép tính 350 : 15 là:",
        options: ["23 (dư 5)", "23 (dư 10)", "24 (dư 5)", "22 (dư 5)"],
        correctAnswer: "A",
        explanation: "350 = 23 × 15 + 5."
      },
      {
        content: "Một xe ô tô chở được 45 bao ngô. Cần chở 360 bao ngô thì phải chở bao nhiêu chuyến xe như thế?",
        options: ["8 chuyến", "7 chuyến", "9 chuyến", "10 chuyến"],
        correctAnswer: "A",
        explanation: "360 : 45 = 8 chuyến."
      },
      {
        content: "Kết quả của phép tính 4 680 : 36 là:",
        options: ["130", "120", "140", "135"],
        correctAnswer: "A",
        explanation: "4 680 : 36 = 130."
      },
      {
        content: "Khi ước lượng thương trong phép chia 178 : 32, ta có thể làm tròn thành 180 : 30 được thương ước lượng khoảng:",
        options: ["6", "5", "7", "4"],
        correctAnswer: "A",
        explanation: "180 : 30 = 6 (kiểm tra 32 × 6 = 192 > 178 nên thử lại lấy 5)."
      }
    ]
  },
  {
    number: 45,
    title: "Thực hành và trải nghiệm ước lượng trong tính toán",
    questions: [
      {
        content: "Mẹ mua một gói kẹo giá 19 000 đồng và một hộp bánh giá 32 000 đồng. Ước lượng tổng số tiền mẹ phải trả khoảng:",
        options: ["Khoảng 50 000 đồng", "Khoảng 60 000 đồng", "Khoảng 40 000 đồng", "Khoảng 70 000 đồng"],
        correctAnswer: "A",
        explanation: "Làm tròn: 19 000 ≈ 20 000; 32 000 ≈ 30 000 => 20 000 + 30 000 = 50 000 đồng."
      },
      {
        content: "Một quyển sách có 298 trang. Nếu mỗi ngày đọc khoảng 30 trang thì cần khoảng bao nhiêu ngày để đọc hết?",
        options: ["Khoảng 10 ngày", "Khoảng 5 ngày", "Khoảng 15 ngày", "Khoảng 20 ngày"],
        correctAnswer: "A",
        explanation: "298 ≈ 300; 300 : 30 = 10 ngày."
      },
      {
        content: "Một lớp có 32 học sinh, mỗi học sinh đóng 48 000 đồng tiền quỹ. Ước lượng tổng số tiền quỹ lớp thu được khoảng:",
        options: ["Khoảng 1 500 000 đồng", "Khoảng 1 000 000 đồng", "Khoảng 2 000 000 đồng", "Khoảng 1 200 000 đồng"],
        correctAnswer: "A",
        explanation: "32 ≈ 30; 48 000 ≈ 50 000 => 30 × 50 000 = 1 500 000 đồng (chính xác là 1 536 000 đồng)."
      },
      {
        content: "Ước lượng tích 49 × 21 bằng cách làm tròn hai thừa số đến hàng chục:",
        options: ["50 × 20 = 1 000", "50 × 25 = 1 250", "40 × 20 = 800", "50 × 30 = 1 500"],
        correctAnswer: "A",
        explanation: "49 ≈ 50; 21 ≈ 20 => 50 × 20 = 1 000."
      },
      {
        content: "Ước lượng thương 395 : 19 bằng cách làm tròn số bị chia và số chia:",
        options: ["400 : 20 = 20", "400 : 10 = 40", "300 : 20 = 15", "380 : 20 = 19"],
        correctAnswer: "A",
        explanation: "395 ≈ 400; 19 ≈ 20 => 400 : 20 = 20."
      }
    ]
  },
  {
    number: 46,
    title: "Tìm số trung bình cộng",
    questions: [
      {
        content: "Muốn tìm số trung bình cộng của nhiều số, ta:",
        options: [
          "Tính tổng các số đó rồi chia cho số các số hạng",
          "Lấy số lớn nhất cộng số bé nhất rồi chia 2",
          "Nhân các số đó với nhau rồi chia số các số hạng",
          "Lấy số ở giữa"
        ],
        correctAnswer: "A",
        explanation: "Số trung bình cộng = Tổng các số hạng : Số các số hạng."
      },
      {
        content: "Số trung bình cộng của 20 và 30 là:",
        options: ["25", "20", "30", "50"],
        correctAnswer: "A",
        explanation: "(20 + 30) : 2 = 25."
      },
      {
        content: "Số trung bình cộng của ba số 15, 25 và 50 là:",
        options: ["30", "25", "35", "40"],
        correctAnswer: "A",
        explanation: "(15 + 25 + 50) : 3 = 90 : 3 = 30."
      },
      {
        content: "Bốn bạn có cân nặng lần lượt là 32 kg, 34 kg, 36 kg và 38 kg. Cân nặng trung bình của mỗi bạn là:",
        options: ["35 kg", "34 kg", "36 kg", "33 kg"],
        correctAnswer: "A",
        explanation: "(32 + 34 + 36 + 38) : 4 = 140 : 4 = 35 kg."
      },
      {
        content: "Trung bình cộng của hai số là 45. Biết một trong hai số là 50, số còn lại là:",
        options: ["40", "45", "35", "50"],
        correctAnswer: "A",
        explanation: "Tổng hai số = 45 × 2 = 90. Số còn lại = 90 - 50 = 40."
      }
    ]
  },
  {
    number: 47,
    title: "Bài toán liên quan đến rút về đơn vị",
    questions: [
      {
        content: "Mua 4 quyển vở cùng loại hết 36 000 đồng. Hỏi mua 7 quyển vở như thế hết bao nhiêu tiền?",
        options: ["63 000 đồng", "54 000 đồng", "72 000 đồng", "81 000 đồng"],
        correctAnswer: "A",
        explanation: "Bước 1 (rút về đơn vị): 1 quyển giá 36 000 : 4 = 9 000 đồng. Bước 2: 7 quyển giá 9 000 × 7 = 63 000 đồng."
      },
      {
        content: "Có 35 lít mật ong rót đều vào 7 can. Hỏi có 45 lít mật ong thì rót được vào mấy can như thế?",
        options: ["9 can", "8 can", "10 can", "7 can"],
        correctAnswer: "A",
        explanation: "Mỗi can chứa: 35 : 7 = 5 lít. 45 lít rót được: 45 : 5 = 9 can."
      },
      {
        content: "Một ô tô trong 3 giờ đi được 150 km. Với vận tốc đó, ô tô đi trong 5 giờ được bao nhiêu ki-lô-mét?",
        options: ["250 km", "200 km", "300 km", "225 km"],
        correctAnswer: "A",
        explanation: "1 giờ đi được: 150 : 3 = 50 km. Trong 5 giờ đi được: 50 × 5 = 250 km."
      },
      {
        content: "May 5 bộ quần áo đồng phục hết 15 mét vải. Hỏi có 36 mét vải cùng loại thì may được bao nhiêu bộ?",
        options: ["12 bộ", "10 bộ", "11 bộ", "15 bộ"],
        correctAnswer: "A",
        explanation: "1 bộ hết: 15 : 5 = 3 m. 36 m may được: 36 : 3 = 12 bộ."
      },
      {
        content: "8 công nhân hoàn thành một công việc trong 6 ngày. Nếu muốn công việc xong nhanh hơn ta cần áp dụng dạng toán gì?",
        options: [
          "Bài toán tỉ lệ / rút về đơn vị",
          "Tìm số trung bình cộng",
          "Tổng - hiệu",
          "Hình học"
        ],
        correctAnswer: "A",
        explanation: "Đây là bài toán liên quan đến tỉ lệ và rút về năng suất đơn vị."
      }
    ]
  },
  {
    number: 48,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Trung bình cộng của các số 10, 20, 30, 40, 50 là:",
        options: ["30", "25", "35", "40"],
        correctAnswer: "A",
        explanation: "(10 + 20 + 30 + 40 + 50) : 5 = 150 : 5 = 30."
      },
      {
        content: "Tính giá trị biểu thức: (125 × 8) : 25 =",
        options: ["40", "50", "30", "20"],
        correctAnswer: "A",
        explanation: "1 000 : 25 = 40."
      },
      {
        content: "Một xưởng làm trong 4 ngày được 160 sản phẩm. Hỏi trong 7 ngày xưởng đó làm được bao nhiêu sản phẩm?",
        options: ["280 sản phẩm", "240 sản phẩm", "300 sản phẩm", "260 sản phẩm"],
        correctAnswer: "A",
        explanation: "1 ngày làm được: 160 : 4 = 40 sản phẩm. 7 ngày: 40 × 7 = 280 sản phẩm."
      },
      {
        content: "Kết quả của phép tính 1 200 : 24 là:",
        options: ["50", "40", "60", "25"],
        correctAnswer: "A",
        explanation: "1 200 : 24 = 50."
      },
      {
        content: "Trung bình cộng số bi của Nam và Hải là 18 viên. Biết Nam có 20 viên bi, Hải có số bi là:",
        options: ["16 viên", "18 viên", "14 viên", "22 viên"],
        correctAnswer: "A",
        explanation: "Tổng số bi của hai bạn = 18 × 2 = 36 viên. Số bi của Hải = 36 - 20 = 16 viên."
      }
    ]
  },
  {
    number: 49,
    title: "Dãy số liệu thống kê",
    questions: [
      {
        content: "Cho dãy số liệu điểm kiểm tra của 4 bạn: 8, 9, 7, 10. Điểm cao nhất là:",
        options: ["10", "9", "8", "7"],
        correctAnswer: "A",
        explanation: "Số lớn nhất trong dãy số liệu 8, 9, 7, 10 là 10."
      },
      {
        content: "Số lượng học sinh của 4 lớp 4A, 4B, 4C, 4D lần lượt là: 32, 35, 30, 33. Lớp có nhiều học sinh nhất là:",
        options: ["Lớp 4B", "Lớp 4A", "Lớp 4C", "Lớp 4D"],
        correctAnswer: "A",
        explanation: "Lớp 4B có 35 học sinh, nhiều nhất trong 4 lớp."
      },
      {
        content: "Cho dãy số đo chiều cao (cm): 132, 135, 128, 140, 130. Dãy số liệu trên gồm có bao nhiêu số đo?",
        options: ["5 số đo", "4 số đo", "6 số đo", "3 số đo"],
        correctAnswer: "A",
        explanation: "Đếm có tất cả 5 số liệu chiều cao."
      },
      {
        content: "Cho dãy nhiệt độ (°C) lúc 12 giờ trưa trong 3 ngày: 28°C, 31°C, 30°C. Nhiệt độ trung bình trong 3 ngày đó là:",
        options: ["29,67°C (hoặc xấp xỉ 30°C)", "31°C", "28°C", "25°C"],
        correctAnswer: "A",
        explanation: "(28 + 31 + 30) : 3 = 89 : 3 ≈ 29,7°C (gần 30°C)."
      },
      {
        content: "Ý nghĩa của việc thu thập và phân tích dãy số liệu là gì?",
        options: [
          "Giúp nhận xét, so sánh và đưa ra quyết định hợp lý",
          "Chỉ để tính tổng các số",
          "Chỉ để học thuộc lòng",
          "Không có ứng dụng trong đời sống"
        ],
        correctAnswer: "A",
        explanation: "Dãy số liệu thống kê giúp ta quan sát, so sánh và đánh giá các thông tin thực tế."
      }
    ]
  },
  {
    number: 50,
    title: "Biểu đồ cột",
    questions: [
      {
        content: "Trong biểu đồ cột, độ cao của mỗi cột biểu thị điều gì?",
        options: [
          "Số lượng hoặc giá trị của đối tượng thống kê",
          "Tên của đối tượng",
          "Thời gian thực hiện",
          "Độ rộng của cột"
        ],
        correctAnswer: "A",
        explanation: "Cột càng cao thì số lượng (hoặc giá trị) tương ứng càng lớn."
      },
      {
        content: "Trục nằm ngang của biểu đồ cột thường ghi gì?",
        options: [
          "Tên các đối tượng được biểu thị",
          "Số lượng số liệu",
          "Đơn vị đo",
          "Tên tác giả"
        ],
        correctAnswer: "A",
        explanation: "Trục ngang thường ghi danh sách tên đối tượng (ví dụ: các lớp, các ngày trong tuần)."
      },
      {
        content: "Biểu đồ cột biểu thị số cây trồng của 3 lớp: 4A (25 cây), 4B (30 cây), 4C (20 cây). Lớp nào trồng được nhiều cây nhất?",
        options: ["Lớp 4B", "Lớp 4A", "Lớp 4C", "Cả 3 lớp bằng nhau"],
        correctAnswer: "A",
        explanation: "Cột của lớp 4B cao nhất (30 cây)."
      },
      {
        content: "Từ biểu đồ trên, tổng số cây trồng được của cả 3 lớp là:",
        options: ["75 cây", "70 cây", "80 cây", "65 cây"],
        correctAnswer: "A",
        explanation: "25 + 30 + 20 = 75 cây."
      },
      {
        content: "Ưu điểm nổi bật nhất của biểu đồ cột so với bảng số liệu là:",
        options: [
          "Trực quan, dễ quan sát và dễ so sánh",
          "Viết được nhiều chữ hơn",
          "Tính toán số liệu nhanh hơn",
          "Tiết kiệm giấy in hơn"
        ],
        correctAnswer: "A",
        explanation: "Biểu đồ cột giúp người xem hình dung và so sánh các số liệu một cách trực quan, nhanh chóng."
      }
    ]
  },
  {
    number: 51,
    title: "Số lần xuất hiện của một sự kiện",
    questions: [
      {
        content: "Tung một đồng xu 10 lần, có 6 lần xuất hiện mặt Ngửa. Hỏi có bao nhiêu lần xuất hiện mặt Sấp?",
        options: ["4 lần", "6 lần", "5 lần", "10 lần"],
        correctAnswer: "A",
        explanation: "10 - 6 = 4 lần xuất hiện mặt Sấp."
      },
      {
        content: "Gieo một con xúc xắc 20 lần, số chấm 6 xuất hiện 3 lần. Số lần xuất hiện của sự kiện \"mặt 6 chấm\" là:",
        options: ["3 lần", "20 lần", "6 lần", "17 lần"],
        correctAnswer: "A",
        explanation: "Sự kiện mặt 6 chấm đã xuất hiện 3 lần."
      },
      {
        content: "Trong một hộp kín có 3 viên bi đỏ và 1 viên bi xanh. Khi lấy ngẫu nhiên 1 viên bi thì:",
        options: [
          "Khả năng lấy được bi đỏ lớn hơn bi xanh",
          "Chắc chắn lấy được bi xanh",
          "Không thể lấy được bi đỏ",
          "Khả năng lấy bi đỏ và bi xanh bằng nhau"
        ],
        correctAnswer: "A",
        explanation: "Vì số bi đỏ (3) nhiều hơn số bi xanh (1) nên khả năng lấy được bi đỏ lớn hơn."
      },
      {
        content: "Quay một vòng quay may mắn có 4 ô bằng nhau gồm các số 1, 2, 3, 4. Khả năng mũi tên dừng lại ở ô số 5 là:",
        options: ["Không thể xảy ra", "Chắc chắn xảy ra", "Có thể xảy ra", "Rất dễ xảy ra"],
        correctAnswer: "A",
        explanation: "Trên vòng quay không có số 5 nên sự kiện này không thể xảy ra."
      },
      {
        content: "Khi lặp lại một thí nghiệm nhiều lần, số lần xuất hiện của một sự kiện được gọi là gì?",
        options: [
          "Tần số (hoặc số lần xuất hiện thực nghiệm)",
          "Xác suất lý thuyết",
          "Trung bình cộng",
          "Biểu đồ số liệu"
        ],
        correctAnswer: "A",
        explanation: "Đó là số lần ghi nhận sự kiện xuất hiện qua quá trình thực hành thí nghiệm."
      }
    ]
  },
  {
    number: 52,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Dãy số liệu điểm Toán của tổ 1 là: 9, 8, 10, 7, 9, 10, 8, 9. Điểm số xuất hiện nhiều lần nhất là:",
        options: ["Điểm 9", "Điểm 10", "Điểm 8", "Điểm 7"],
        correctAnswer: "A",
        explanation: "Điểm 9 xuất hiện 3 lần (nhiều nhất trong dãy)."
      },
      {
        content: "Theo biểu đồ cột, số học sinh giỏi của khối 4 là: Học kì I có 45 em, Học kì II có 60 em. Số học sinh giỏi tăng thêm bao nhiêu em?",
        options: ["15 em", "20 em", "10 em", "25 em"],
        correctAnswer: "A",
        explanation: "60 - 45 = 15 em."
      },
      {
        content: "Bạn Mai gieo xúc xắc 12 lần, có 5 lần xuất hiện mặt số chẵn. Hỏi có bao nhiêu lần xuất hiện mặt số lẻ?",
        options: ["7 lần", "5 lần", "6 lần", "8 lần"],
        correctAnswer: "A",
        explanation: "12 - 5 = 7 lần."
      },
      {
        content: "Số trung bình cộng của dãy số: 12, 14, 16, 18 là:",
        options: ["15", "16", "14", "17"],
        correctAnswer: "A",
        explanation: "(12 + 14 + 16 + 18) : 4 = 60 : 4 = 15."
      },
      {
        content: "Trong trò chơi oẳn tù tì, khả năng bạn thắng, hòa hoặc thua là:",
        options: [
          "Đều có thể xảy ra",
          "Chắc chắn luôn thắng",
          "Không thể hòa",
          "Chỉ có thể thua"
        ],
        correctAnswer: "A",
        explanation: "Cả ba khả năng thắng, hòa, thua đều có thể xảy ra tùy vào nước đi của hai bên."
      }
    ]
  },
  {
    number: 53,
    title: "Khái niệm phân số",
    questions: [
      {
        content: "Phân số gồm có những thành phần nào?",
        options: [
          "Tử số và mẫu số ngăn cách bởi dấu gạch ngang",
          "Số bị chia và số chia",
          "Số hạng và tổng",
          "Thừa số và tích"
        ],
        correctAnswer: "A",
        explanation: "Phân số gồm tử số (ở trên) và mẫu số (ở dưới khác 0), ngăn cách bởi dấu gạch ngang."
      },
      {
        content: "Trong phân số 3/5, tử số là số nào và mẫu số là số nào?",
        options: [
          "Tử số là 3, mẫu số là 5",
          "Tử số là 5, mẫu số là 3",
          "Cả hai đều là tử số",
          "Không phân biệt được"
        ],
        correctAnswer: "A",
        explanation: "Số viết trên dấu gạch ngang là tử số (3), số viết dưới dấu gạch ngang là mẫu số (5)."
      },
      {
        content: "Một chiếc bánh pizza được chia đều thành 8 phần bằng nhau, Nam ăn 3 phần. Phân số chỉ số phần bánh Nam đã ăn là:",
        options: ["3/8", "5/8", "8/3", "3/5"],
        correctAnswer: "A",
        explanation: "Nam ăn 3 trong tổng số 8 phần bằng nhau, viết là 3/8."
      },
      {
        content: "Mẫu số của một phân số biểu thị điều gì?",
        options: [
          "Số phần bằng nhau mà đơn vị được chia ra",
          "Số phần được lấy đi",
          "Tổng của các phần",
          "Hiệu của các phần"
        ],
        correctAnswer: "A",
        explanation: "Mẫu số cho biết đơn vị được chia thành bao nhiêu phần bằng nhau."
      },
      {
        content: "Điều kiện bắt buộc đối với mẫu số của một phân số là:",
        options: [
          "Mẫu số phải là số tự nhiên khác 0",
          "Mẫu số phải lớn hơn tử số",
          "Mẫu số phải là số chẵn",
          "Mẫu số có thể bằng 0"
        ],
        correctAnswer: "A",
        explanation: "Mẫu số của phân số phải luôn khác 0 vì phép chia cho 0 không có nghĩa."
      }
    ]
  },
  {
    number: 54,
    title: "Phân số và phép chia số tự nhiên",
    questions: [
      {
        content: "Thương của phép chia số tự nhiên a cho số tự nhiên b (với b khác 0) có thể viết dưới dạng phân số là:",
        options: ["a/b", "b/a", "a × b", "a - b"],
        correctAnswer: "A",
        explanation: "Phép chia a : b có thể viết dưới dạng phân số a/b (tử số là a, mẫu số là b)."
      },
      {
        content: "Viết thương của phép chia 5 : 8 dưới dạng phân số:",
        options: ["5/8", "8/5", "5/13", "8/13"],
        correctAnswer: "A",
        explanation: "5 : 8 = 5/8."
      },
      {
        content: "Phân số 9/3 có giá trị bằng số tự nhiên nào?",
        options: ["3", "2", "6", "9"],
        correctAnswer: "A",
        explanation: "9/3 = 9 : 3 = 3."
      },
      {
        content: "Có 3 cái bánh chia đều cho 4 bạn. Hỏi mỗi bạn được bao nhiêu phần cái bánh?",
        options: ["3/4 cái bánh", "4/3 cái bánh", "1/4 cái bánh", "1 cái bánh"],
        correctAnswer: "A",
        explanation: "Lấy 3 cái bánh chia cho 4 bạn: 3 : 4 = 3/4 cái bánh."
      },
      {
        content: "Mỗi số tự nhiên a đều có thể viết dưới dạng phân số có mẫu số là 1:",
        options: ["a/1", "1/a", "a/a", "a/0"],
        correctAnswer: "A",
        explanation: "Mọi số tự nhiên a đều viết được dưới dạng a = a/1."
      }
    ]
  },
  {
    number: 55,
    title: "Tính chất cơ bản của phân số",
    questions: [
      {
        content: "Khi nhân cả tử số và mẫu số của một phân số với cùng một số tự nhiên khác 0 thì:",
        options: [
          "Được một phân số bằng phân số đã cho",
          "Được một phân số lớn hơn phân số đã cho",
          "Được một phân số bé hơn phân số đã cho",
          "Phân số bị thay đổi giá trị"
        ],
        correctAnswer: "A",
        explanation: "Nhân cả tử và mẫu với cùng số khác 0 cho phân số bằng phân số ban đầu."
      },
      {
        content: "Khi chia cả tử số và mẫu số của một phân số cho cùng một số tự nhiên khác 0 (và là ước chung của chúng) thì:",
        options: [
          "Được một phân số bằng phân số đã cho",
          "Được một phân số bé hơn phân số đã cho",
          "Được một phân số lớn hơn phân số đã cho",
          "Không thể chia được"
        ],
        correctAnswer: "A",
        explanation: "Chia cả tử và mẫu cho cùng một số khác 0 được phân số bằng phân số đã cho."
      },
      {
        content: "Tìm số thích hợp điền vào ô trống: 2/3 = .../12",
        options: ["8", "6", "4", "10"],
        correctAnswer: "A",
        explanation: "Mẫu số nhân với 4 (3 × 4 = 12) nên tử số cũng nhân với 4: 2 × 4 = 8."
      },
      {
        content: "Tìm số thích hợp: 15/20 = 3/...",
        options: ["4", "5", "10", "2"],
        correctAnswer: "A",
        explanation: "Tử số chia cho 5 (15 : 5 = 3) nên mẫu số cũng chia cho 5: 20 : 5 = 4."
      },
      {
        content: "Phân số nào dưới đây bằng phân số 3/4?",
        options: ["9/12", "6/10", "12/20", "5/6"],
        correctAnswer: "A",
        explanation: "Nhân cả tử và mẫu của 3/4 với 3 được: (3 × 3)/(4 × 3) = 9/12."
      }
    ]
  },
  {
    number: 56,
    title: "Rút gọn phân số",
    questions: [
      {
        content: "Thế nào là rút gọn phân số?",
        options: [
          "Tìm phân số bằng phân số đã cho nhưng có tử số và mẫu số bé hơn",
          "Tìm phân số lớn hơn phân số đã cho",
          "Lấy tử số cộng thêm mẫu số",
          "Lấy mẫu số trừ đi tử số"
        ],
        correctAnswer: "A",
        explanation: "Rút gọn phân số là biến đổi để được phân số bằng nó nhưng có tử và mẫu số nhỏ hơn."
      },
      {
        content: "Phân số tối giản là phân số:",
        options: [
          "Có tử số và mẫu số không cùng chia hết cho số tự nhiên nào lớn hơn 1",
          "Có tử số bằng 1",
          "Có mẫu số là số lẻ",
          "Có tử số bé hơn mẫu số"
        ],
        correctAnswer: "A",
        explanation: "Phân số tối giản là phân số không thể rút gọn được nữa."
      },
      {
        content: "Rút gọn phân số 8/12 về dạng phân số tối giản ta được:",
        options: ["2/3", "4/6", "1/2", "3/4"],
        correctAnswer: "A",
        explanation: "Chia cả tử và mẫu cho 4: 8 : 4 = 2; 12 : 4 = 3 => 2/3."
      },
      {
        content: "Trong các phân số: 3/5, 6/8, 9/12, 10/15, phân số nào là phân số tối giản?",
        options: ["3/5", "6/8", "9/12", "10/15"],
        correctAnswer: "A",
        explanation: "3 và 5 không cùng chia hết cho số nào lớn hơn 1 nên 3/5 là phân số tối giản."
      },
      {
        content: "Rút gọn phân số 25/100 ta được phân số tối giản là:",
        options: ["1/4", "5/20", "1/5", "2/5"],
        correctAnswer: "A",
        explanation: "Chia cả tử và mẫu cho 25: 25 : 25 = 1; 100 : 25 = 4 => 1/4."
      }
    ]
  },
  {
    number: 57,
    title: "Quy đồng mẫu số các phân số",
    questions: [
      {
        content: "Quy đồng mẫu số hai phân số 1/3 và 2/5 ta được hai phân số có mẫu số chung là 15:",
        options: ["5/15 và 6/15", "3/15 và 10/15", "5/15 và 10/15", "1/15 và 2/15"],
        correctAnswer: "A",
        explanation: "1/3 = (1 × 5)/(3 × 5) = 5/15; 2/5 = (2 × 3)/(5 × 3) = 6/15."
      },
      {
        content: "Khi quy đồng mẫu số hai phân số 3/4 và 5/8, mẫu số chung nhỏ nhất thuận tiện nhất là:",
        options: ["8", "32", "16", "24"],
        correctAnswer: "A",
        explanation: "Vì 8 chia hết cho 4 (8 : 4 = 2) nên chọn luôn 8 làm mẫu số chung."
      },
      {
        content: "Quy đồng mẫu số hai phân số 3/4 và 7/8 (chọn mẫu số chung là 8):",
        options: ["6/8 và 7/8", "3/8 và 7/8", "9/8 và 7/8", "12/8 và 7/8"],
        correctAnswer: "A",
        explanation: "3/4 = (3 × 2)/(4 × 2) = 6/8; giữ nguyên 7/8."
      },
      {
        content: "Mục đích chính của việc quy đồng mẫu số các phân số là gì?",
        options: [
          "Để đưa các phân số về cùng một mẫu số, giúp dễ so sánh và thực hiện phép cộng, trừ",
          "Để làm cho các phân số lớn hơn",
          "Để biến các phân số thành số tự nhiên",
          "Để tìm phân số đảo ngược"
        ],
        correctAnswer: "A",
        explanation: "Quy đồng mẫu số giúp đưa các phân số về cùng mẫu để dễ dàng so sánh hoặc cộng trừ."
      },
      {
        content: "Mẫu số chung của hai phân số 1/6 và 1/9 có thể là:",
        options: ["18", "12", "15", "20"],
        correctAnswer: "A",
        explanation: "18 chia hết cho cả 6 và 9 (18 : 6 = 3; 18 : 9 = 2)."
      }
    ]
  },
  {
    number: 58,
    title: "So sánh phân số",
    questions: [
      {
        content: "Trong hai phân số có cùng mẫu số dương, phân số nào có tử số lớn hơn thì:",
        options: ["Lớn hơn", "Bé hơn", "Bằng nhau", "Không so sánh được"],
        correctAnswer: "A",
        explanation: "Cùng mẫu số, phân số nào có tử số lớn hơn thì lớn hơn (Ví dụ: 3/5 > 2/5)."
      },
      {
        content: "Điền dấu thích hợp: 4/7 ... 6/7",
        options: ["<", ">", "=", "Không có"],
        correctAnswer: "A",
        explanation: "Cùng mẫu số 7, vì 4 < 6 nên 4/7 < 6/7."
      },
      {
        content: "Phân số nào dưới đây lớn hơn 1?",
        options: ["5/4", "3/4", "4/4", "2/5"],
        correctAnswer: "A",
        explanation: "Phân số có tử số lớn hơn mẫu số thì lớn hơn 1: 5/4 > 1."
      },
      {
        content: "Phân số nào bé hơn 1?",
        options: ["5/8", "8/5", "8/8", "9/7"],
        correctAnswer: "A",
        explanation: "Phân số có tử số bé hơn mẫu số thì bé hơn 1: 5 < 8 nên 5/8 < 1."
      },
      {
        content: "So sánh hai phân số khác mẫu: 2/3 và 3/4",
        options: ["2/3 < 3/4", "2/3 > 3/4", "2/3 = 3/4", "Không so sánh được"],
        correctAnswer: "A",
        explanation: "Quy đồng mẫu số chung là 12: 2/3 = 8/12; 3/4 = 9/12. Vì 8/12 < 9/12 nên 2/3 < 3/4."
      }
    ]
  },
  {
    number: 59,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Sắp xếp các phân số sau theo thứ tự từ bé đến lớn: 1/2, 1/4, 3/4",
        options: ["1/4, 1/2, 3/4", "1/2, 1/4, 3/4", "3/4, 1/2, 1/4", "1/4, 3/4, 1/2"],
        correctAnswer: "A",
        explanation: "Quy đồng mẫu 4: 1/4 = 1/4; 1/2 = 2/4; 3/4 = 3/4. Do 1/4 < 2/4 < 3/4 nên thứ tự là 1/4, 1/2, 3/4."
      },
      {
        content: "Phân số nào dưới đây bằng 1?",
        options: ["7/7", "6/7", "8/7", "1/7"],
        correctAnswer: "A",
        explanation: "Phân số có tử số bằng mẫu số thì bằng 1: 7/7 = 1."
      },
      {
        content: "Rút gọn phân số 18/24 thành phân số tối giản:",
        options: ["3/4", "9/12", "6/8", "2/3"],
        correctAnswer: "A",
        explanation: "Chia cả tử và mẫu cho 6: 18 : 6 = 3; 24 : 6 = 4 => 3/4."
      },
      {
        content: "Trong hai phân số có cùng tử số (khác 0), phân số nào có mẫu số bé hơn thì:",
        options: ["Lớn hơn", "Bé hơn", "Bằng nhau", "Không so sánh được"],
        correctAnswer: "A",
        explanation: "Cùng tử số, mẫu càng nhỏ thì phân số càng lớn (Ví dụ: 1/2 > 1/4)."
      },
      {
        content: "Phân số nào lớn nhất trong các phân số: 2/5, 4/5, 1/5, 3/5?",
        options: ["4/5", "3/5", "2/5", "1/5"],
        correctAnswer: "A",
        explanation: "Cùng mẫu số 5, tử số 4 lớn nhất nên 4/5 lớn nhất."
      }
    ]
  },
  {
    number: 60,
    title: "Phép cộng phân số",
    questions: [
      {
        content: "Muốn cộng hai phân số cùng mẫu số, ta:",
        options: [
          "Cộng hai tử số với nhau và giữ nguyên mẫu số",
          "Cộng hai tử số và cộng hai mẫu số với nhau",
          "Nhân hai tử số và nhân hai mẫu số",
          "Lấy tử số này cộng mẫu số kia"
        ],
        correctAnswer: "A",
        explanation: "Muốn cộng hai phân số có cùng mẫu số, ta cộng hai tử số với nhau và giữ nguyên mẫu số."
      },
      {
        content: "Kết quả của phép tính 2/7 + 3/7 là:",
        options: ["5/7", "5/14", "6/7", "1/7"],
        correctAnswer: "A",
        explanation: "(2 + 3)/7 = 5/7."
      },
      {
        content: "Kết quả của phép tính 1/3 + 1/6 là:",
        options: ["1/2", "2/9", "2/6", "2/3"],
        correctAnswer: "A",
        explanation: "Quy đồng: 1/3 = 2/6. 2/6 + 1/6 = 3/6 = 1/2."
      },
      {
        content: "Tính: 3/5 + 1/2 =",
        options: ["11/10", "4/7", "4/10", "6/10"],
        correctAnswer: "A",
        explanation: "Quy đồng mẫu số chung là 10: 6/10 + 5/10 = 11/10."
      },
      {
        content: "Bạn An đọc một cuốn sách: buổi sáng đọc được 1/4 cuốn sách, buổi chiều đọc được 2/4 cuốn sách. Hỏi cả ngày An đọc được bao nhiêu phần cuốn sách?",
        options: ["3/4 cuốn sách", "3/8 cuốn sách", "1/2 cuốn sách", "1 cuốn sách"],
        correctAnswer: "A",
        explanation: "1/4 + 2/4 = 3/4 cuốn sách."
      }
    ]
  },
  {
    number: 61,
    title: "Phép trừ phân số",
    questions: [
      {
        content: "Muốn trừ hai phân số cùng mẫu số, ta:",
        options: [
          "Trừ tử số của phân số thứ nhất cho tử số của phân số thứ hai và giữ nguyên mẫu số",
          "Trừ tử số và trừ mẫu số",
          "Nhân chéo",
          "Quy đồng tử số"
        ],
        correctAnswer: "A",
        explanation: "Trừ hai tử số và giữ nguyên mẫu số."
      },
      {
        content: "Kết quả của phép tính 7/9 - 4/9 là:",
        options: ["3/9 (rút gọn thành 1/3)", "3/0", "3/18", "11/9"],
        correctAnswer: "A",
        explanation: "(7 - 4)/9 = 3/9 = 1/3."
      },
      {
        content: "Kết quả của phép tính 1 - 3/5 là:",
        options: ["2/5", "3/5", "4/5", "1/5"],
        correctAnswer: "A",
        explanation: "1 = 5/5. 5/5 - 3/5 = 2/5."
      },
      {
        content: "Tính: 5/6 - 1/3 =",
        options: ["1/2", "4/3", "4/6", "2/3"],
        correctAnswer: "A",
        explanation: "1/3 = 2/6. 5/6 - 2/6 = 3/6 = 1/2."
      },
      {
        content: "Một bình nước có 7/8 lít nước, mẹ đã dùng 3/8 lít. Trong bình còn lại bao nhiêu lít nước?",
        options: ["1/2 lít", "4/16 lít", "3/4 lít", "1 lít"],
        correctAnswer: "A",
        explanation: "7/8 - 3/8 = 4/8 = 1/2 lít."
      }
    ]
  },
  {
    number: 62,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Tính giá trị biểu thức: 1/2 + 1/4 - 1/8 =",
        options: ["5/8", "3/8", "7/8", "1/8"],
        correctAnswer: "A",
        explanation: "Quy đồng mẫu 8: 4/8 + 2/8 - 1/8 = 5/8."
      },
      {
        content: "Tìm x, biết: x + 1/5 = 4/5",
        options: ["3/5", "5/5", "2/5", "1/5"],
        correctAnswer: "A",
        explanation: "x = 4/5 - 1/5 = 3/5."
      },
      {
        content: "Tính thuận tiện: 2/7 + 3/5 + 5/7 + 2/5 =",
        options: ["2", "1", "3", "7/5"],
        correctAnswer: "A",
        explanation: "(2/7 + 5/7) + (3/5 + 2/5) = 1 + 1 = 2."
      },
      {
        content: "Một mảnh vườn trồng hoa: 2/5 diện tích trồng hoa hồng, 1/3 diện tích trồng hoa cúc. Diện tích trồng cả hai loại hoa chiếm bao nhiêu phần diện tích mảnh vườn?",
        options: ["11/15", "3/8", "2/15", "7/15"],
        correctAnswer: "A",
        explanation: "2/5 + 1/3 = 6/15 + 5/15 = 11/15 diện tích."
      },
      {
        content: "Từ phép tính ở câu trên, diện tích còn lại chưa trồng hoa chiếm bao nhiêu phần mảnh vườn?",
        options: ["4/15", "11/15", "1/15", "5/15"],
        correctAnswer: "A",
        explanation: "1 - 11/15 = 15/15 - 11/15 = 4/15."
      }
    ]
  },
  {
    number: 63,
    title: "Phép nhân phân số",
    questions: [
      {
        content: "Muốn nhân hai phân số, ta:",
        options: [
          "Lấy tử số nhân với tử số, mẫu số nhân với mẫu số",
          "Lấy tử số nhân mẫu số kia",
          "Quy đồng mẫu số rồi nhân",
          "Giữ nguyên mẫu số và nhân hai tử số"
        ],
        correctAnswer: "A",
        explanation: "Tử nhân tử, mẫu nhân mẫu: (a/b) × (c/d) = (a × c)/(b × d)."
      },
      {
        content: "Kết quả của phép tính 2/3 × 4/5 là:",
        options: ["8/15", "6/8", "6/15", "8/8"],
        correctAnswer: "A",
        explanation: "(2 × 4)/(3 × 5) = 8/15."
      },
      {
        content: "Kết quả của phép tính 3/4 × 8 là:",
        options: ["6", "24/32", "11/4", "32/3"],
        correctAnswer: "A",
        explanation: "(3 × 8)/4 = 24/4 = 6."
      },
      {
        content: "Một hình vuông có cạnh dài 2/5 m. Diện tích hình vuông đó là:",
        options: ["4/25 m²", "4/5 m²", "8/25 m²", "2/25 m²"],
        correctAnswer: "A",
        explanation: "Diện tích = 2/5 × 2/5 = 4/25 m²."
      },
      {
        content: "Tính: 5/7 × 0 =",
        options: ["0", "5/7", "1", "0/7 (bằng 0)"],
        correctAnswer: "A",
        explanation: "Bất kì phân số nào nhân với 0 cũng có kết quả bằng 0."
      }
    ]
  },
  {
    number: 64,
    title: "Phép chia phân số",
    questions: [
      {
        content: "Phân số đảo ngược của phân số 3/5 là:",
        options: ["5/3", "3/5", "-3/5", "1/3"],
        correctAnswer: "A",
        explanation: "Đổi chỗ tử số và mẫu số cho nhau: phân số đảo ngược của 3/5 là 5/3."
      },
      {
        content: "Muốn chia một phân số cho một phân số khác 0, ta:",
        options: [
          "Lấy phân số thứ nhất nhân với phân số thứ hai đảo ngược",
          "Chia tử cho tử, mẫu cho mẫu",
          "Nhân hai phân số với nhau",
          "Quy đồng mẫu số rồi chia"
        ],
        correctAnswer: "A",
        explanation: "(a/b) : (c/d) = (a/b) × (d/c)."
      },
      {
        content: "Kết quả của phép tính 3/7 : 2/5 là:",
        options: ["15/14", "6/35", "14/15", "5/14"],
        correctAnswer: "A",
        explanation: "3/7 × 5/2 = 15/14."
      },
      {
        content: "Kết quả của phép tính 4/5 : 2 là:",
        options: ["2/5", "8/5", "4/10 (rút gọn thành 2/5)", "1/5"],
        correctAnswer: "A",
        explanation: "4/5 : 2 = 4/(5 × 2) = 4/10 = 2/5."
      },
      {
        content: "Diện tích hình chữ nhật là 2/3 m², chiều rộng là 1/2 m. Chiều dài hình chữ nhật là:",
        options: ["4/3 m", "1/3 m", "2/6 m", "3/4 m"],
        correctAnswer: "A",
        explanation: "Chiều dài = Diện tích : Chiều rộng = 2/3 : 1/2 = 2/3 × 2 = 4/3 m."
      }
    ]
  },
  {
    number: 65,
    title: "Tìm phân số của một số",
    questions: [
      {
        content: "Muốn tìm phân số a/b của số m, ta làm thế nào?",
        options: [
          "Lấy m nhân với phân số a/b (hoặc m : b × a)",
          "Lấy m chia cho a/b",
          "Lấy m cộng với a/b",
          "Lấy a nhân b rồi chia cho m"
        ],
        correctAnswer: "A",
        explanation: "Muốn tìm phân số của một số, ta lấy số đó nhân với phân số."
      },
      {
        content: "Tìm 2/3 của 18:",
        options: ["12", "6", "9", "27"],
        correctAnswer: "A",
        explanation: "18 × 2/3 = (18 : 3) × 2 = 6 × 2 = 12."
      },
      {
        content: "Một rổ có 30 quả cam. Mẹ lấy ra 3/5 số cam trong rổ để vắt nước. Mẹ đã lấy ra bao nhiêu quả cam?",
        options: ["18 quả", "12 quả", "15 quả", "20 quả"],
        correctAnswer: "A",
        explanation: "30 × 3/5 = (30 : 5) × 3 = 18 quả cam."
      },
      {
        content: "Lớp 4A có 36 học sinh, trong đó 2/3 số học sinh là nữ. Số học sinh nữ là:",
        options: ["24 học sinh", "12 học sinh", "18 học sinh", "20 học sinh"],
        correctAnswer: "A",
        explanation: "36 × 2/3 = 24 học sinh nữ."
      },
      {
        content: "Tìm 3/4 của 1 giờ (theo đơn vị phút):",
        options: ["45 phút", "30 phút", "15 phút", "50 phút"],
        correctAnswer: "A",
        explanation: "1 giờ = 60 phút. 60 × 3/4 = 45 phút."
      }
    ]
  },
  {
    number: 66,
    title: "Luyện tập chung",
    questions: [
      {
        content: "Tính giá trị biểu thức: 1/2 + 2/3 × 3/4 =",
        options: ["1", "5/6", "7/12", "3/4"],
        correctAnswer: "A",
        explanation: "Nhân trước: 2/3 × 3/4 = 6/12 = 1/2. Sau đó cộng: 1/2 + 1/2 = 1."
      },
      {
        content: "Tính: (3/4 - 1/2) : 1/8 =",
        options: ["2", "1/4", "1/2", "4"],
        correctAnswer: "A",
        explanation: "Trong ngoặc: 3/4 - 2/4 = 1/4. Chia: 1/4 : 1/8 = 1/4 × 8 = 2."
      },
      {
        content: "Tìm x, biết: x × 3/5 = 6/10",
        options: ["1", "3/10", "9/25", "2"],
        correctAnswer: "A",
        explanation: "6/10 = 3/5 => x × 3/5 = 3/5 => x = 1."
      },
      {
        content: "Một bình chứa 2 lít nước ngọt. Người ta rót vào các cốc, mỗi cốc chứa 1/4 lít. Rót được bao nhiêu cốc như thế?",
        options: ["8 cốc", "6 cốc", "4 cốc", "10 cốc"],
        correctAnswer: "A",
        explanation: "2 : 1/4 = 2 × 4 = 8 cốc."
      },
      {
        content: "Tính nhanh: 3/7 × 4/9 + 3/7 × 5/9 =",
        options: ["3/7", "9/9", "1/3", "12/63"],
        correctAnswer: "A",
        explanation: "3/7 × (4/9 + 5/9) = 3/7 × 1 = 3/7."
      }
    ]
  },
  {
    number: 67,
    title: "Ôn tập số tự nhiên",
    questions: [
      {
        content: "Số liền sau của số tự nhiên lớn nhất có 6 chữ số là:",
        options: ["1 000 000", "999 998", "100 000", "1 000 001"],
        correctAnswer: "A",
        explanation: "Số lớn nhất có 6 chữ số là 999 999. Số liền sau là 1 000 000."
      },
      {
        content: "Giá trị của chữ số 7 trong số 372 105 400 là:",
        options: ["70 000 000", "7 000 000", "700 000", "700 000 000"],
        correctAnswer: "A",
        explanation: "Chữ số 7 đứng ở hàng chục triệu nên có giá trị là 70 000 000."
      },
      {
        content: "Làm tròn số 582 300 đến hàng trăm nghìn được số nào?",
        options: ["600 000", "500 000", "580 000", "590 000"],
        correctAnswer: "A",
        explanation: "Chữ số hàng chục nghìn là 8 ≥ 5 nên làm tròn lên thành 600 000."
      },
      {
        content: "Trong các số sau, số nào vừa là số chẵn vừa chia hết cho 5?",
        options: ["2 450", "3 425", "1 234", "5 555"],
        correctAnswer: "A",
        explanation: "Số vừa chẵn vừa chia hết cho 5 có chữ số tận cùng là 0: 2 450."
      },
      {
        content: "Dãy số tự nhiên liên tiếp từ 1 đến 100 có bao nhiêu số chẵn?",
        options: ["50 số", "49 số", "51 số", "100 số"],
        correctAnswer: "A",
        explanation: "Từ 1 đến 100 có 100 số, trong đó có đúng một nửa là số chẵn: 100 : 2 = 50 số."
      }
    ]
  },
  {
    number: 68,
    title: "Ôn tập phép tính với số tự nhiên",
    questions: [
      {
        content: "Kết quả của phép tính 15 240 + 34 760 là:",
        options: ["50 000", "49 000", "51 000", "40 000"],
        correctAnswer: "A",
        explanation: "15 240 + 34 760 = 50 000."
      },
      {
        content: "Tính nhanh: 25 × 36 × 4 =",
        options: ["3 600", "360", "36 000", "7 200"],
        correctAnswer: "A",
        explanation: "(25 × 4) × 36 = 100 × 36 = 3 600."
      },
      {
        content: "Kết quả của phép tính 7 500 : 25 là:",
        options: ["300", "30", "250", "350"],
        correctAnswer: "A",
        explanation: "75 : 25 = 3 => 7 500 : 25 = 300."
      },
      {
        content: "Tìm x, biết: x : 12 = 450",
        options: ["5 400", "4 500", "5 200", "37"],
        correctAnswer: "A",
        explanation: "x = 450 × 12 = 5 400."
      },
      {
        content: "Trung bình cộng của ba số 30, 45, 75 là:",
        options: ["50", "45", "55", "60"],
        correctAnswer: "A",
        explanation: "(30 + 45 + 75) : 3 = 150 : 3 = 50."
      }
    ]
  },
  {
    number: 69,
    title: "Ôn tập phân số",
    questions: [
      {
        content: "Phân số 15/25 rút gọn về dạng tối giản là:",
        options: ["3/5", "5/3", "1/5", "3/10"],
        correctAnswer: "A",
        explanation: "Chia cả tử và mẫu cho 5: 15 : 5 = 3; 25 : 5 = 5 => 3/5."
      },
      {
        content: "Phân số nào dưới đây lớn hơn phân số 1/2?",
        options: ["3/4", "1/3", "2/5", "4/10"],
        correctAnswer: "A",
        explanation: "3/4 = 0,75 > 0,5 (1/2)."
      },
      {
        content: "Quy đồng mẫu số hai phân số 2/3 và 3/5 với mẫu số chung 15:",
        options: ["10/15 và 9/15", "6/15 và 9/15", "10/15 và 6/15", "5/15 và 3/15"],
        correctAnswer: "A",
        explanation: "2/3 = 10/15; 3/5 = 9/15."
      },
      {
        content: "Sắp xếp theo thứ tự giảm dần: 3/5, 4/5, 1/5",
        options: ["4/5, 3/5, 1/5", "1/5, 3/5, 4/5", "3/5, 4/5, 1/5", "4/5, 1/5, 3/5"],
        correctAnswer: "A",
        explanation: "Cùng mẫu số: 4 > 3 > 1 => 4/5, 3/5, 1/5."
      },
      {
        content: "Phân số nào bằng phân số 4/6?",
        options: ["2/3", "3/2", "1/2", "5/6"],
        correctAnswer: "A",
        explanation: "Chia cả tử và mẫu cho 2 được 2/3."
      }
    ]
  },
  {
    number: 70,
    title: "Ôn tập phép tính với phân số",
    questions: [
      {
        content: "Kết quả của phép tính 3/8 + 1/4 là:",
        options: ["5/8", "4/12", "4/8", "1/2"],
        correctAnswer: "A",
        explanation: "1/4 = 2/8. 3/8 + 2/8 = 5/8."
      },
      {
        content: "Kết quả của phép tính 5/6 - 1/2 là:",
        options: ["1/3", "4/4", "4/6", "2/3"],
        correctAnswer: "A",
        explanation: "1/2 = 3/6. 5/6 - 3/6 = 2/6 = 1/3."
      },
      {
        content: "Kết quả của phép tính 4/7 × 14/12 là:",
        options: ["2/3", "4/12", "8/7", "7/6"],
        correctAnswer: "A",
        explanation: "(4 × 14)/(7 × 12) = (4/12) × (14/7) = (1/3) × 2 = 2/3."
      },
      {
        content: "Kết quả của phép tính 3/5 : 6/5 là:",
        options: ["1/2", "2", "18/25", "1"],
        correctAnswer: "A",
        explanation: "3/5 × 5/6 = 3/6 = 1/2."
      },
      {
        content: "Tìm 3/5 của 40:",
        options: ["24", "16", "20", "25"],
        correctAnswer: "A",
        explanation: "40 × 3/5 = (40 : 5) × 3 = 8 × 3 = 24."
      }
    ]
  },
  {
    number: 71,
    title: "Ôn tập hình học và đo lường",
    questions: [
      {
        content: "Hình thoi có hai đường chéo dài 6 cm và 8 cm. Hai đường chéo đó có tính chất:",
        options: [
          "Vuông góc với nhau",
          "Song song với nhau",
          "Bằng nhau",
          "Trùng nhau"
        ],
        correctAnswer: "A",
        explanation: "Hai đường chéo của hình thoi vuông góc với nhau và cắt nhau tại trung điểm của mỗi đường."
      },
      {
        content: "Đổi: 2 m² 5 dm² = ... dm²",
        options: ["205 dm²", "25 dm²", "250 dm²", "2 050 dm²"],
        correctAnswer: "A",
        explanation: "2 m² = 200 dm²; 200 + 5 = 205 dm²."
      },
      {
        content: "Đổi: 3 tấn 50 kg = ... kg",
        options: ["3 050 kg", "3 500 kg", "350 kg", "3 005 kg"],
        correctAnswer: "A",
        explanation: "3 tấn = 3 000 kg; 3 000 + 50 = 3 050 kg."
      },
      {
        content: "Góc có số đo bằng 120° là góc gì?",
        options: ["Góc tù", "Góc nhọn", "Góc vuông", "Góc bẹt"],
        correctAnswer: "A",
        explanation: "Góc lớn hơn 90° và nhỏ hơn 180° là góc tù."
      },
      {
        content: "Năm 1975 giải phóng hoàn toàn miền Nam, thống nhất đất nước. Năm 1975 thuộc thế kỉ nào?",
        options: ["Thế kỉ XX", "Thế kỉ XIX", "Thế kỉ XXI", "Thế kỉ XVIII"],
        correctAnswer: "A",
        explanation: "Từ năm 1901 đến năm 2000 thuộc thế kỉ XX."
      }
    ]
  },
  {
    number: 72,
    title: "Ôn tập một số yếu tố thống kê và xác suất",
    questions: [
      {
        content: "Cho dãy số đo cân nặng (kg) của 5 học sinh: 32, 35, 33, 35, 30. Cân nặng nào xuất hiện nhiều lần nhất?",
        options: ["35 kg", "32 kg", "33 kg", "30 kg"],
        correctAnswer: "A",
        explanation: "35 kg xuất hiện 2 lần, nhiều nhất trong dãy."
      },
      {
        content: "Theo biểu đồ cột, số cây lớp 4A trồng được là 40 cây, lớp 4B trồng 35 cây, lớp 4C trồng 45 cây. Cả ba lớp trồng được bao nhiêu cây?",
        options: ["120 cây", "110 cây", "130 cây", "115 cây"],
        correctAnswer: "A",
        explanation: "40 + 35 + 45 = 120 cây."
      },
      {
        content: "Tung một đồng xu 15 lần, mặt Sấp xuất hiện 7 lần. Hỏi mặt Ngửa xuất hiện bao nhiêu lần?",
        options: ["8 lần", "7 lần", "9 lần", "6 lần"],
        correctAnswer: "A",
        explanation: "15 - 7 = 8 lần."
      },
      {
        content: "Trong một túi có 5 viên bi xanh và không có viên bi đỏ nào. Khả năng lấy được 1 viên bi đỏ là:",
        options: [
          "Không thể xảy ra",
          "Chắc chắn xảy ra",
          "Có thể xảy ra",
          "Xảy ra 50%"
        ],
        correctAnswer: "A",
        explanation: "Không có viên bi đỏ nào trong túi nên việc lấy được bi đỏ là không thể xảy ra."
      },
      {
        content: "Biểu đồ cột giúp người xem:",
        options: [
          "Dễ dàng quan sát, so sánh và nhận xét số liệu",
          "Biết được tất cả các bài toán tương tự",
          "Tính nhẩm nhanh hơn",
          "Không cần đọc số liệu"
        ],
        correctAnswer: "A",
        explanation: "Biểu đồ cột biểu diễn số liệu trực quan, giúp dễ dàng so sánh giữa các đối tượng."
      }
    ]
  },
  {
    number: 73,
    title: "Ôn tập chung",
    questions: [
      {
        content: "Số tự nhiên bé nhất có 7 chữ số là:",
        options: ["1 000 000", "9 999 999", "1 000 001", "1 111 111"],
        correctAnswer: "A",
        explanation: "Số tự nhiên bé nhất có 7 chữ số là 1 000 000."
      },
      {
        content: "Giá trị của biểu thức 250 × 40 : 100 là:",
        options: ["100", "1 000", "10", "250"],
        correctAnswer: "A",
        explanation: "250 × 40 = 10 000; 10 000 : 100 = 100."
      },
      {
        content: "Tính giá trị biểu thức: 3/4 + 1/2 × 2/3 =",
        options: ["13/12", "5/6", "1", "7/12"],
        correctAnswer: "A",
        explanation: "Nhân trước: 1/2 × 2/3 = 1/3. Cộng: 3/4 + 1/3 = 9/12 + 4/12 = 13/12."
      },
      {
        content: "Hai thửa ruộng thu hoạch được 5 tấn 4 tạ thóc. Thửa thứ nhất thu hoạch được nhiều hơn thửa thứ hai 6 tạ. Thửa thứ nhất thu hoạch được:",
        options: ["30 tạ thóc", "24 tạ thóc", "27 tạ thóc", "32 tạ thóc"],
        correctAnswer: "A",
        explanation: "5 tấn 4 tạ = 54 tạ. Thửa 1 (số lớn) = (54 + 6) : 2 = 30 tạ."
      },
      {
        content: "Hình thoi có chu vi là 32 dm. Độ dài mỗi cạnh của hình thoi đó là:",
        options: ["8 dm", "16 dm", "4 dm", "6 dm"],
        correctAnswer: "A",
        explanation: "Hình thoi có 4 cạnh bằng nhau: 32 : 4 = 8 dm."
      }
    ]
  }
];
