export interface FoodChainNode {
  id: string;
  name: string;
  role: string;
  scientificRole: 'producer' | 'herbivore' | 'carnivore1' | 'carnivore2' | 'decomposer';
  color: string;
  foodSource: string;
  roleDescription: string;
  energyRetained: string;
  examples: string[];
  lessonPoints: string[];
  funFact: string;
}

export const FOOD_CHAIN_NODES: FoodChainNode[] = [
  {
    id: 'producer',
    name: 'Cây lúa / Cây cỏ xanh',
    role: 'Sinh vật sản xuất',
    scientificRole: 'producer',
    color: '#22c55e',
    foodSource: 'Năng lượng ánh sáng Mặt Trời + Nước + Khí Cacbônic',
    roleDescription: 'Sử dụng chất diệp lục hấp thụ ánh sáng Mặt Trời qua quá trình quang hợp để tự tạo chất dinh dưỡng nuôi sống mình và làm thức ăn cho các loài sinh vật khác.',
    energyRetained: '100% năng lượng hấp thụ ban đầu từ Mặt Trời',
    examples: ['Cây lúa', 'Cỏ voi', 'Bèo tấm', 'Rong biển'],
    lessonPoints: [
      'Đứng ở vị trí đầu tiên của hầu hết các chuỗi thức ăn trên cạn và dưới nước.',
      'Là sinh vật duy nhất có khả năng tự dưỡng (tự tổng hợp chất hữu cơ).',
      'Cung cấp khí Ô-xi trong lành cho toàn bộ sinh quyển hô hấp.'
    ],
    funFact: 'Nếu không có cây cỏ quang hợp, sự sống của con người và muôn loài động vật trên Trái Đất sẽ chấm dứt!'
  },
  {
    id: 'herbivore',
    name: 'Cào cào / Châu chấu',
    role: 'Sinh vật tiêu thụ bậc 1 (Ăn thực vật)',
    scientificRole: 'herbivore',
    color: '#84cc16',
    foodSource: 'Lá lúa non, chồi non và cỏ dại',
    roleDescription: 'Động vật ăn thực vật trực tiếp, chuyển hóa năng lượng hữu cơ từ thực vật thành năng lượng cơ thể.',
    energyRetained: '~10% năng lượng từ thực vật chuyển hóa vào cơ thể',
    examples: ['Cào cào', 'Sâu cuốn lá', 'Thỏ', 'Bò', 'Chuột đồng'],
    lessonPoints: [
      'Cầu nối trung gian quan trọng chuyển năng lượng từ cây cỏ sang các động vật ăn thịt.',
      'Có cấu tạo hàm nghiền hoặc răng thích nghi đặc biệt với việc gặm nhấm lá cây.',
      'Số lượng cá thể thường rất đông để duy trì cân bằng hệ sinh thái.'
    ],
    funFact: 'Một con cào cào có thể ăn khối lượng lá bằng chính trọng lượng cơ thể nó mỗi ngày!'
  },
  {
    id: 'carnivore1',
    name: 'Ếch đồng / Chim sâu',
    role: 'Sinh vật tiêu thụ bậc 2 (Ăn động vật bậc 1)',
    scientificRole: 'carnivore1',
    color: '#06b6d4',
    foodSource: 'Cào cào, sâu bọ, côn trùng nhỏ',
    roleDescription: 'Động vật ăn thịt nhỏ, săn bắt các loài côn trùng ăn lá, giữ cho mùa màng không bị phá hoại.',
    energyRetained: '~10% năng lượng từ sinh vật bậc 1 (~1% năng lượng ban đầu)',
    examples: ['Ếch đồng', 'Chim sâu', 'Thằn lằn', 'Cá rô đồng'],
    lessonPoints: [
      'Đóng vai trò thiên địch bảo vệ mùa màng tự nhiên, giảm thiểu sâu hại lúa.',
      'Sử dụng các giác quan nhạy bén (lưỡi phóng nhanh, mắt tinh) để bắt mồi chuyển động.',
      'Vừa là kẻ săn mồi của sâu bọ, vừa là con mồi của các loài săn mồi lớn hơn.'
    ],
    funFact: 'Lưỡi của ếch gắn ở phía trước miệng và có thể phóng ra bắt côn trùng trong vòng 0,05 giây!'
  },
  {
    id: 'carnivore2',
    name: 'Rắn hổ mang / Chim đại bàng',
    role: 'Sinh vật tiêu thụ bậc 3 (Động vật ăn thịt đầu bảng)',
    scientificRole: 'carnivore2',
    color: '#e11d48',
    foodSource: 'Ếch nhái, chim sẻ, chuột, thú nhỏ',
    roleDescription: 'Động vật săn mồi đỉnh cao trong hệ sinh thái đồng ruộng / rừng cây, khống chế số lượng cá thể bậc dưới.',
    energyRetained: '~10% năng lượng từ sinh vật bậc 2 (~0.1% năng lượng ban đầu)',
    examples: ['Rắn hổ mang', 'Đại bàng', 'Diều hâu', 'Hổ'],
    lessonPoints: [
      'Nằm ở nấc thang trên cùng của chuỗi thức ăn đồng ruộng / rừng cỏ.',
      'Giữ vai trò điều hòa số lượng loài chuột, ếch nhái, ngăn chặn bùng phát dịch bệnh động vật.',
      'Có số lượng cá thể ít nhất do thất thoát năng lượng qua các bậc dinh dưỡng.'
    ],
    funFact: 'Vì năng lượng giảm dần qua từng bậc, trong tự nhiên không thể có chuỗi thức ăn kéo dài vô tận!'
  },
  {
    id: 'decomposer',
    name: 'Nấm & Vi khuẩn đất',
    role: 'Sinh vật phân giải',
    scientificRole: 'decomposer',
    color: '#a855f7',
    foodSource: 'Xác chết thực vật, động vật và chất thải hữu cơ',
    roleDescription: 'Phân hủy xác động vật (rắn chết), lá rụng thành các chất khoáng vô cơ hòa tan vào đất để nuôi rễ cây lúa phát triển.',
    energyRetained: 'Hoàn trả khoáng chất cho đất, khép kín vòng tuần hoàn vật chất',
    examples: ['Nấm rơm', 'Vi khuẩn nốt sần', 'Giun đất', 'Vi nấm phân hủy'],
    lessonPoints: [
      'Khép kín vòng tuần hoàn vật chất trong tự nhiên: biến chất hữu cơ phức tạp thành chất khoáng đơn giản.',
      'Làm sạch môi trường sống, không để xác sinh vật tích tụ gây ô nhiễm.',
      'Rễ cây lại hút chất khoáng từ đất để tiếp tục tạo ra cây xanh mới.'
    ],
    funFact: 'Một nắm đất màu mỡ có chứa hàng tỉ vi sinh vật phân giải đang ngày đêm làm đất tơi xốp cho cây cỏ!'
  }
];

export interface FoodChainQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const FOOD_CHAIN_QUIZ: FoodChainQuizQuestion[] = [
  {
    id: 1,
    question: 'Trong chuỗi thức ăn tự nhiên, sinh vật nào có khả năng tự tổng hợp chất dinh dưỡng từ ánh sáng Mặt Trời?',
    options: [
      'Sinh vật tiêu thụ bậc 1 (Cào cào, thỏ)',
      'Sinh vật sản xuất (Cây cỏ xanh, lúa)',
      'Sinh vật tiêu thụ bậc 2 (Ếch đồng)',
      'Sinh vật phân giải (Nấm, vi khuẩn)'
    ],
    correctAnswer: 1,
    explanation: 'Chính xác! Cây xanh và thực vật là sinh vật sản xuất, nhờ diệp lục có thể quang hợp tự chế tạo chất hữu cơ từ ánh sáng Mặt Trời, nước và CO2.'
  },
  {
    id: 2,
    question: 'Chuỗi thức ăn nào sau đây thể hiện ĐÚNG mối quan hệ dinh dưỡng trong tự nhiên?',
    options: [
      'Ếch đồng ➔ Cây lúa ➔ Cào cào ➔ Rắn',
      'Cây lúa ➔ Cào cào ➔ Ếch đồng ➔ Rắn hổ mang ➔ Nấm vi khuẩn',
      'Rắn hổ mang ➔ Ếch đồng ➔ Cào cào ➔ Cây lúa',
      'Cào cào ➔ Ếch đồng ➔ Cây lúa ➔ Nấm vi khuẩn'
    ],
    correctAnswer: 1,
    explanation: 'Rất giỏi! Chuỗi thức ăn bắt đầu từ cây xanh (Cây lúa) ➔ Sinh vật ăn thực vật (Cào cào) ➔ Ăn thịt bậc 2 (Ếch) ➔ Săn mồi bậc 3 (Rắn) ➔ Phân giải xác (Nấm vi khuẩn).'
  },
  {
    id: 3,
    question: 'Điều gì sẽ xảy ra với đồng lúa nếu người dân bắt hết ếch đồng và chim sâu?',
    options: [
      'Cây lúa sẽ phát triển nhanh và tươi tốt hơn nhiều',
      'Cào cào và sâu hại lúa sẽ bùng phát dữ dội phá hoại mùa màng',
      'Rắn hổ mang sẽ sinh sôi thêm rất nhiều con non',
      'Không có ảnh hưởng gì vì chuỗi thức ăn tự cân bằng tức thì'
    ],
    correctAnswer: 1,
    explanation: 'Chính xác! Ếch đồng và chim sâu là thiên địch ăn sâu bọ. Mất đi bậc tiêu thụ này, sâu bọ cào cào mất đối thủ săn mồi sẽ sinh sôi phá tan cánh đồng.'
  },
  {
    id: 4,
    question: 'Sinh vật phân giải (nấm, vi khuẩn trong đất) đóng vai trò gì trong tự nhiên?',
    options: [
      'Săn bắt động vật sống trên mặt đất',
      'Hút ánh sáng Mặt Trời để tạo đường bột',
      'Phân hủy xác động thực vật chết thành chất khoáng nuôi rễ cây, làm sạch đất',
      'Ăn trực tiếp lá cây tươi tốt'
    ],
    correctAnswer: 2,
    explanation: 'Đúng rồi! Sinh vật phân giải biến xác động thực vật và lá khô thành mùn khoáng tơi xốp, giúp cây lại hút dinh dưỡng khép kín vòng tuần hoàn vật chất.'
  },
  {
    id: 5,
    question: 'Mũi tên trong sơ đồ chuỗi thức ăn: "Cây lúa ➔ Cào cào" có ý nghĩa gì?',
    options: [
      'Cây lúa đuổi bắt cào cào',
      'Cào cào là thức ăn của cây lúa',
      'Cây lúa là thức ăn của cào cào (dòng năng lượng truyền từ lúa sang cào cào)',
      'Hai sinh vật sống hòa bình không ăn lẫn nhau'
    ],
    correctAnswer: 2,
    explanation: 'Xuất sắc! Mũi tên chỉ chiều truyền năng lượng: Cây lúa là thức ăn cho cào cào, năng lượng từ lúa đi sang cào cào.'
  }
];
