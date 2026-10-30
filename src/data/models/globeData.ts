export interface GlobeFeature {
  id: string;
  name: string;
  category: 'truc-toa-do' | 'chau-luc' | 'dai-duong' | 'viet-nam';
  definition: string;
  role: string;
  fact: string;
  coordinates?: string;
}

export interface GlobeQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const GLOBE_FEATURES: GlobeFeature[] = [
  {
    id: 'truc-nghieng',
    name: 'Trục Trái Đất & Hai Cực',
    category: 'truc-toa-do',
    definition: 'Trục Trái Đất là một đường tưởng tượng xuyên qua tâm Trái Đất, cắt bề mặt ở hai điểm đối diện: Cực Bắc (ở phía trên) và Cực Nam (ở phía dưới).',
    role: 'Trục Trái Đất luôn nghiêng một góc khoảng 66°33’ so với mặt phẳng quỹ đạo (nghiêng 23,5° so với phương thẳng đứng).',
    fact: 'Nhờ trục nghiêng và chuyển động tự quay quanh trục từ Tây sang Đông mà Trái Đất có hiện tượng ngày đêm luân phiên và các mùa trong năm.',
  },
  {
    id: 'xich-dao',
    name: 'Đường Xích Đạo (Vĩ tuyến 0°)',
    category: 'truc-toa-do',
    definition: 'Đường Xích đạo là đường tròn lớn nhất bao quanh giữa quả Địa Cầu, cách đều hai cực Bắc và Nam.',
    role: 'Xích đạo chia Quả Địa Cầu thành hai nửa bằng nhau: Bán cầu Bắc (từ Xích đạo lên Cực Bắc) và Bán cầu Nam (từ Xích đạo xuống Cực Nam).',
    fact: 'Đường Xích đạo có chu vi khoảng 40.075 km. Các vùng nằm gần đường Xích đạo quanh năm nhận được nhiều ánh sáng Mặt Trời nên có khí hậu nóng ẩm.',
  },
  {
    id: 'kinh-vi-tuyen',
    name: 'Hệ Thống Kinh Tuyến & Vĩ Tuyến',
    category: 'truc-toa-do',
    definition: 'Kinh tuyến là những đường nối liền hai cực Bắc - Nam trên bề mặt địa cầu. Vĩ tuyến là những đường tròn vuông góc với các kinh tuyến, song song với Xích đạo.',
    role: 'Giúp xác định vị trí chính xác của bất kỳ địa điểm nào trên Trái Đất thông qua tọa độ địa lý (kinh độ và vĩ độ).',
    fact: 'Kinh tuyến gốc (0°) được quy ước đi qua Đài thiên văn Greenwich ở thủ đô Luân Đôn (Vương quốc Anh).',
  },
  {
    id: 'viet-nam',
    name: 'Việt Nam Trên Quả Địa Cầu',
    category: 'viet-nam',
    definition: 'Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam nằm ở khu vực Đông Nam Á, thuộc Bán cầu Bắc và Bán cầu Đông.',
    role: 'Có dải đất liền hình chữ S tiếp giáp Biển Đông rộng lớn, với thủ đô Hà Nội và hai quần đảo thiêng liêng là Hoàng Sa và Trường Sa.',
    fact: 'Việt Nam nằm trọn trong vùng nội chí tuyến Bắc bán cầu, tiếp giáp ngã tư đường hàng hải và hàng không quốc tế quan trọng.',
  },
  {
    id: 'chau-luc',
    name: '6 Châu Lục Trên Thế Giới',
    category: 'chau-luc',
    definition: 'Trái Đất có 6 châu lục: Châu Á (lớn nhất và đông dân nhất), Châu Âu, Châu Phi, Châu Mỹ, Châu Đại Dương (nhỏ nhất) và Châu Nam Cực (lạnh giá nhất quanh năm đóng băng).',
    role: 'Là nơi sinh sống của hơn 8 tỉ người với hàng trăm nền văn hóa và quốc gia độc đáo.',
    fact: 'Châu Á có diện tích hơn 44 triệu km², chiếm khoảng 30% diện tích đất liền của toàn Trái Đất.',
  },
  {
    id: 'dai-duong',
    name: '4 Đại Dương Lớn',
    category: 'dai-duong',
    definition: 'Đại dương bao phủ hơn 70% bề mặt Trái Đất, gồm: Thái Bình Dương (lớn nhất và sâu nhất), Đại Tây Dương, Ấn Độ Dương và Bắc Băng Dương (nhỏ nhất và lạnh nhất).',
    role: 'Đại dương cung cấp nguồn hải sản, điều hòa khí hậu toàn cầu và là đường giao thương huyết mạch.',
    fact: 'Hố Mariana ở Thái Bình Dương là nơi sâu nhất thế giới với độ sâu gần 11.000 mét, sâu hơn cả chiều cao của đỉnh Everest!',
  },
];

export const GLOBE_QUIZ: GlobeQuizQuestion[] = [
  {
    id: 1,
    question: 'Quả Địa Cầu là gì trong môn Lịch sử và Địa lí?',
    options: [
      'Là một quả bóng đồ chơi thông thường',
      'Là mô hình thu nhỏ của Trái Đất',
      'Là tấm ảnh chụp một thành phố từ trên cao',
      'Là chiếc đồng hồ đo thời gian',
    ],
    correctIndex: 1,
    explanation: 'Quả Địa Cầu là mô hình thu nhỏ chính xác hình dạng của Trái Đất, giúp học sinh quan sát các châu lục, đại dương và hệ tọa độ.',
  },
  {
    id: 2,
    question: 'Đường Xích đạo chia Quả Địa Cầu thành hai nửa nào?',
    options: [
      'Bán cầu Đông và Bán cầu Tây',
      'Bán cầu Bắc và Bán cầu Nam',
      'Bán cầu Sáng và Bán cầu Tối',
      'Châu Á và Châu Âu',
    ],
    correctIndex: 1,
    explanation: 'Đường Xích đạo chạy ngang ở giữa quả cầu, chia bề mặt Trái Đất thành Bán cầu Bắc (nửa phía trên) và Bán cầu Nam (nửa phía dưới).',
  },
  {
    id: 3,
    question: 'Kinh tuyến gốc (0°) được quy ước đi qua địa điểm nổi tiếng nào?',
    options: [
      'Thủ đô Hà Nội (Việt Nam)',
      'Tháp Eiffel ở Pa-ri (Pháp)',
      'Đài thiên văn Greenwich ở Luân Đôn (Anh)',
      'Tượng Nữ Thần Tự Do (Mỹ)',
    ],
    correctIndex: 2,
    explanation: 'Kinh tuyến gốc 0° đi qua Đài thiên văn hoàng gia Greenwich ở thủ đô Luân Đôn, Vương quốc Anh.',
  },
  {
    id: 4,
    question: 'Việt Nam nằm ở bán cầu nào và có dải đất liền mang hình dáng chữ gì?',
    options: [
      'Nằm ở Bán cầu Nam, hình chữ O',
      'Nằm ở Bán cầu Bắc, dải đất liền hình chữ S',
      'Nằm ở Cực Bắc, hình chữ V',
      'Nằm ở Bán cầu Tây, hình chữ C',
    ],
    correctIndex: 1,
    explanation: 'Việt Nam nằm hoàn toàn ở Bán cầu Bắc (phía trên đường Xích đạo), thuộc khu vực Đông Nam Á, dải đất liền cong cong hình chữ S bên bờ Biển Đông.',
  },
  {
    id: 5,
    question: 'Đại dương nào có diện tích lớn nhất và sâu nhất trên Quả Địa Cầu?',
    options: [
      'Đại Tây Dương',
      'Bắc Băng Dương',
      'Ấn Độ Dương',
      'Thái Bình Dương',
    ],
    correctIndex: 3,
    explanation: 'Thái Bình Dương là đại dương lớn nhất và sâu nhất hành tinh, có diện tích lớn hơn toàn bộ diện tích đất liền của Trái Đất cộng lại.',
  },
];
