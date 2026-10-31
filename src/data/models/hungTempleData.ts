export interface HungTempleStation {
  id: string;
  name: string;
  subtitle: string;
  altitude: number; // in meters (relative to sea level)
  steps: string; // number of stone steps
  xPercent: number; // coordinate for 2D/2.5D visual layout (0-100)
  yPercent: number; // coordinate for 2D/2.5D visual layout (0-100)
  theme: string;
  imageUrl: string;
  badgeNumber: number;
  highlight: string;
  legend: string;
  architecture: string;
  historicalQuote?: string;
  funFact: string;
}

export interface HungTempleFestivalActivity {
  id: string;
  category: 'LE' | 'HOI';
  title: string;
  subtitle: string;
  description: string;
  meaning: string;
  badge: string;
  iconName: string;
}

export interface HungTempleQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface HungTempleData {
  lessonId: string;
  lessonTitle: string;
  subject: string;
  grade: number;
  location: {
    mountain: string;
    altitudeMeters: number;
    village: string;
    city: string;
    province: string;
  };
  unescoHeritage: string[];
  stations: HungTempleStation[];
  festival: HungTempleFestivalActivity[];
  folkVerses: string[];
  uncleHoQuote: {
    quote: string;
    context: string;
    date: string;
    location: string;
  };
  quizQuestions: HungTempleQuizQuestion[];
}

export const hungTempleData: HungTempleData = {
  lessonId: 'historygeo-7',
  lessonTitle: 'Bài 7: Đền Hùng và lễ giỗ Tổ',
  subject: 'Lịch sử và Địa lí',
  grade: 4,
  location: {
    mountain: 'Núi Nghĩa Lĩnh (núi Hùng)',
    altitudeMeters: 175,
    village: 'Xã Hy Cương',
    city: 'Thành phố Việt Trì',
    province: 'Tỉnh Phú Thọ',
  },
  unescoHeritage: [
    'Tín ngưỡng thờ cúng Hùng Vương ở Phú Thọ (Di sản văn hóa phi vật thể đại diện của nhân loại - 2012)',
    'Hát Xoan Phú Thọ (Di sản văn hóa phi vật thể của nhân loại - 2011/2017)',
  ],
  folkVerses: [
    '“Dù ai đi ngược về xuôi\nNhớ ngày Giỗ Tổ mùng mười tháng ba\nKhắp người truyền tụng câu ca\nNước non để lại cho ta vạn đời.”',
  ],
  uncleHoQuote: {
    quote: '“Các Vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước.”',
    context: 'Lời Bác Hồ căn dặn cán bộ, chiến sĩ Đại đoàn Quân Tiên Phong trước khi về tiếp quản Thủ đô Hà Nội.',
    date: 'Ngày 19 tháng 9 năm 1954',
    location: 'Tại Đền Giếng – Khu di tích lịch sử Đền Hùng',
  },
  stations: [
    {
      id: 'cong-den',
      badgeNumber: 1,
      name: 'Cổng Đền (Chân núi)',
      subtitle: 'Cửa ngõ hành hương lên đỉnh Nghĩa Lĩnh',
      altitude: 15,
      steps: 'Điểm khởi đầu',
      xPercent: 12,
      yPercent: 84,
      theme: 'Cổng chào & Kiến trúc',
      imageUrl: '/images/models/den-hung-cong-den-3d.jpg',
      highlight: 'Bức đại tự “Cao sơn cảnh hành” (Núi cao trông lên, đường lớn noi theo) ca ngợi công đức Vua Hùng.',
      legend: 'Xây dựng vào năm Khải Định thứ 2 (1917), cổng kiểu vòm cuốn cổ kính 2 tầng 8 mái, phía trước có đôi nghê chầu uy nghiêm.',
      architecture: 'Hai bên cổng có đắp hai cột trụ biểu cao vút, trên các mặt cột khắc những câu đối chữ Hán ca tụng non sông cội nguồn gấm vóc.',
      funFact: 'Để lên tới đỉnh núi, các em và du khách sẽ bước qua gần 500 bậc đá dưới những tán cây rừng nguyên sinh rợp bóng mát!',
    },
    {
      id: 'den-ha',
      badgeNumber: 2,
      name: 'Đền Hạ & Chùa Thiên Quang',
      subtitle: 'Nơi khởi nguồn bọc trăm trứng mẹ Âu Cơ',
      altitude: 60,
      steps: 'Sau 225 bậc đá từ chân núi',
      xPercent: 26,
      yPercent: 66,
      theme: 'Cội nguồn Dân tộc',
      imageUrl: '/images/models/den-hung-den-ha-3d.jpg',
      highlight: 'Nơi Mẹ Âu Cơ sinh ra bọc trăm trứng, cội nguồn của hai chữ thiêng liêng “Đồng bào”.',
      legend: 'Tương truyền tại đây, mẹ Âu Cơ sinh ra một bọc trăm trứng, nở thành 100 người con trai. Sau đó 50 người con theo cha Lạc Long Quân xuống biển, 50 người con theo mẹ lên núi mở mang bờ cõi. Người con trưởng ở lại đất Phong Châu lên nối ngôi, xưng là Hùng Vương thứ nhất.',
      architecture: 'Đền Hạ gồm hai tòa Tiền tế và Hậu cung. Kế bên Đền Hạ là Chùa Thiên Quang Thiền Tự và cây Vạn tuế cổ thụ ba nhánh có tuổi đời hơn 800 năm.',
      funFact: 'Hai chữ “Đồng bào” (nghĩa là “cùng chung một bọc”) của người Việt Nam ta bắt nguồn chính từ sự tích bọc trăm trứng tại Đền Hạ này đấy!',
    },
    {
      id: 'den-trung',
      badgeNumber: 3,
      name: 'Đền Trung (Hùng Vương Thiền Điện)',
      subtitle: 'Nơi họp bàn việc nước & Sự tích Bánh chưng, Bánh giầy',
      altitude: 110,
      steps: 'Đi thêm 168 bậc đá từ Đền Hạ',
      xPercent: 44,
      yPercent: 48,
      theme: 'Sự tích Dân gian',
      imageUrl: '/images/models/den-hung-den-trung-3d.jpg',
      highlight: 'Nơi vua Hùng cùng Lạc hầu, Lạc tướng ngắm cảnh non sông và họp bàn việc cơ mật của đất nước.',
      legend: 'Đây là nơi vua Hùng thứ 6 tổ chức cuộc thi tìm người kế vị. Hoàng tử Lang Liêu đã làm ra Bánh Chưng vuông (tượng trưng cho Đất) và Bánh Giầy tròn (tượng trưng cho Trời) từ chính hạt gạo nuôi sống con người. Cảm động trước tấm lòng thơm thảo và đạo lý sâu xa, vua cha đã truyền ngôi báu cho chàng.',
      architecture: 'Đền Trung quay hướng đông nam, gồm 3 gian tiền tế và hậu cung. Bên trong có khám thờ bài vị của các Vua Hùng.',
      funFact: 'Mỗi dịp Tết đến xuân về, nhân dân ta gói bánh chưng, giã bánh giầy chính là để ghi nhớ bài học biết ơn trời đất và cha mẹ từ thời Vua Hùng!',
    },
    {
      id: 'den-thuong',
      badgeNumber: 4,
      name: 'Đền Thượng (Kính Thiên Lĩnh Điện)',
      subtitle: 'Đỉnh núi Nghĩa Lĩnh – Nơi tế lễ Trời Đất',
      altitude: 175,
      steps: 'Đi thêm 102 bậc đá từ Đền Trung',
      xPercent: 62,
      yPercent: 22,
      theme: 'Nghi lễ Quốc gia',
      imageUrl: '/images/models/den-hung-3d.jpg',
      highlight: 'Ngôi đền cao nhất trên đỉnh núi. Nơi diễn ra Đại lễ dâng hương Giỗ Tổ Hùng Vương mùng 10/3 hàng năm.',
      legend: 'Thời dựng nước Văn Lang, các Vua Hùng lập đài Kính Thiên trên đỉnh núi cao nhất này để làm lễ tế Trời Đất, Thần Núi, Thần Nông cầu cho mưa thuận gió hòa, mùa màng tươi tốt, trăm họ yên vui.',
      architecture: 'Đền làm theo kiểu chữ Vương, gồm 4 cấp: Nhà chuông, Tiền tế, Trung tế và Hậu cung. Bức đại tự cổ kính thếp vàng treo trang nghiêm: “Nam Việt triệu tổ” (Tổ tiên khai sáng nước Nam).',
      funFact: 'Đứng từ Đền Thượng nhìn xuống, các em có thể ngắm trọn ngã ba sông Hạc Trì – nơi sông Lô, sông Thao và sông Đà cùng hội tụ!',
    },
    {
      id: 'cot-da-the',
      badgeNumber: 5,
      name: 'Cột đá thề Thục Phán',
      subtitle: 'Lời thề son sắt giữ gìn non sông cơ nghiệp',
      altitude: 175,
      steps: 'Nằm bên trái cửa Đền Thượng',
      xPercent: 73,
      yPercent: 20,
      theme: 'Di tích Lịch sử',
      imageUrl: '/images/models/den-hung-3d.jpg',
      highlight: 'Lời thề đời đời bảo vệ non sông gấm vóc do vua Hùng gây dựng.',
      legend: 'Tương truyền sau khi được Hùng Vương thứ 18 nhường ngôi, Thục Phán An Dương Vương đã dựng cột đá thề trên đỉnh Nghĩa Lĩnh: “Nguyện có trời đất chứng giám, nước Nam đời đời bền vững, miếu thờ Hùng Vương muôn thuở khói hương”.',
      architecture: 'Cột đá cẩm thạch nguyên khối hình lục lăng, đứng sừng sững uy nghi trước mây trời non xanh nước biếc.',
      funFact: 'Cột đá thề là biểu tượng bất diệt cho sự tiếp nối thế hệ, lòng tri ân sâu sắc và quyết tâm giữ vững độc lập chủ quyền dân tộc ta.',
    },
    {
      id: 'lang-vua-hung',
      badgeNumber: 6,
      name: 'Lăng Hùng Vương (Lăng Vua Hùng thứ 6)',
      subtitle: 'Nơi an nghỉ nghìn thu của bậc tiền nhân',
      altitude: 173,
      steps: 'Nằm sát phía đông Đền Thượng',
      xPercent: 78,
      yPercent: 32,
      theme: 'Lăng tẩm Uy nghiêm',
      imageUrl: '/images/models/den-hung-3d.jpg',
      highlight: 'Lăng tẩm cổ kính ngự trên đỉnh núi thiêng, hướng nhìn ra ngã ba sông hùng vĩ.',
      legend: 'Theo truyền thuyết dân gian, sau khi người anh hùng làng Gióng (Phù Đổng Thiên Vương) đánh tan giặc Ân bay về trời, vua Hùng thứ 6 cũng hóa thân thanh thản tại đỉnh núi thiêng này. Nhân dân đã lập lăng để đời đời tưởng nhớ.',
      architecture: 'Lăng hình tháp vuông cổ kính, có 2 tầng mái, 4 góc đắp hình rồng chầu. Phía trước có tấm bia đá cổ khắc 3 chữ chữ Hán thếp vàng: “Hùng Vương lăng”.',
      funFact: 'Xung quanh lăng luôn thoang thoảng mùi hương trầm và tiếng thông reo rì rào quanh năm.',
    },
    {
      id: 'den-gieng',
      badgeNumber: 7,
      name: 'Đền Giếng (Ngọc Tỉnh)',
      subtitle: 'Giếng soi ngọc ngà & Lời dặn thiêng liêng của Bác Hồ',
      altitude: 20,
      steps: 'Dưới chân núi (phía đông nam)',
      xPercent: 88,
      yPercent: 72,
      theme: 'Kỷ niệm Lịch sử & Bác Hồ',
      imageUrl: '/images/models/den-hung-3d.jpg',
      highlight: 'Nơi Bác Hồ căn dặn: “Các Vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước”.',
      legend: 'Tương truyền hai nàng công chúa Tiên Dung và Ngọc Hoa (con gái vua Hùng thứ 18) thường soi gương chải tóc, gội đầu tại giếng này khi theo cha đi kinh lý dạy dân cấy lúa, dệt vải. Giếng nước trong vắt bốn mùa không bao giờ vơi cạn.',
      architecture: 'Kiểu kiến trúc chữ Công (工) gồm tiền tế, hậu cung và nhà chuông. Phía trước đền là Giếng Ngọc được xây gạch bao quanh.',
      historicalQuote: '“Các Vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước.” – Bác Hồ (19/9/1954)',
      funFact: 'Lời dạy của Bác Hồ tại Đền Giếng đã trở thành kim chỉ nam thiêng liêng cho mọi thế hệ người Việt Nam trong công cuộc xây dựng và bảo vệ Tổ quốc!',
    },
    {
      id: 'bao-tang',
      badgeNumber: 8,
      name: 'Bảo tàng Hùng Vương',
      subtitle: 'Kho tàng cổ vật Văn hóa Đông Sơn & Thời đại dựng nước',
      altitude: 18,
      steps: 'Khu vực quảng trường chân núi',
      xPercent: 38,
      yPercent: 88,
      theme: 'Khảo cổ & Hiện vật',
      imageUrl: '/images/models/trong-dong-dong-son-3d.jpg',
      highlight: 'Trưng bày gần 4.000 hiện vật khảo cổ học từ các nền văn hóa Phùng Nguyên, Đồng Đậu, Gò Mun đến Đông Sơn.',
      legend: 'Bảo tàng được thiết kế lấy ý tưởng từ truyền thuyết “Trời tròn, Đất vuông”. Tầng 1 hình vuông tượng trưng cho Mẹ Đất, tầng 2 hình tròn tượng trưng cho Cha Trời.',
      architecture: 'Lưu giữ trống đồng, mũi tên đồng Cổ Loa, lưỡi cày đồng, rìu đồng xòe cân... chứng minh thời đại Hùng Vương là có thật và vô cùng rực rỡ.',
      funFact: 'Tại đây các em có thể tận mắt nhìn thấy những chiếc trống đồng cổ hơn 2.500 năm tuổi với hoa văn chim Lạc tinh xảo!',
    },
  ],
  festival: [
    {
      id: 'ruoc-kieu',
      category: 'LE',
      title: 'Lễ rước kiệu về Đền Hùng',
      subtitle: 'Nghi thức trang nghiêm, rực rỡ sắc màu cội nguồn',
      description: 'Đội hình rước kiệu gồm cờ ngũ sắc, kiệu sơn son thếp vàng, đội bát âm tấu nhạc, kiệu dâng bánh chưng, bánh giầy. Các làng xung quanh khu di tích cùng rước kiệu về Đền Thượng thi đua trong không khí trang nghiêm và rộn rã.',
      meaning: 'Thể hiện lòng hiếu thảo, sự đoàn kết của các cộng đồng làng xã hướng về đất Tổ.',
      badge: 'Phần Lễ',
      iconName: 'ShieldCheck',
    },
    {
      id: 'dang-huong',
      category: 'LE',
      title: 'Đại lễ Dâng hương mùng 10 tháng 3',
      subtitle: 'Quốc lễ thiêng liêng của toàn thể dân tộc',
      description: 'Vào sáng mùng 10/3 âm lịch, đoàn đại biểu lãnh đạo Đảng, Nhà nước cùng hàng triệu đồng bào từ khắp mọi miền và kiều bào nước ngoài dâng hương, hoa, lễ vật Bánh Chưng, Bánh Giầy lên bàn thờ Tổ tại Đền Thượng.',
      meaning: 'Tưởng nhớ công ơn trời biển của các Vua Hùng dựng nước và các bậc tiền nhân.',
      badge: 'Phần Lễ',
      iconName: 'Flame',
    },
    {
      id: 'hat-xoan',
      category: 'HOI',
      title: 'Hát Xoan Phú Thọ',
      subtitle: 'Di sản văn hóa phi vật thể của nhân loại (UNESCO)',
      description: 'Làn điệu dân ca nghi lễ cổ truyền độc đáo của vùng đất Phú Thọ, hát trước cửa đình, đền vào mùa xuân để chúc tụng vua Hùng, cầu mùa màng tươi tốt, người người mạnh khỏe.',
      meaning: 'Gìn giữ tinh hoa âm nhạc dân tộc được thế giới vinh danh.',
      badge: 'Phần Hội',
      iconName: 'Music',
    },
    {
      id: 'thi-banh-chung',
      category: 'HOI',
      title: 'Thi gói Bánh chưng & Giã bánh giầy',
      subtitle: 'Tái hiện sự tích Lang Liêu hiếu thảo',
      description: 'Các nghệ nhân từ các huyện và các tỉnh thành tụ hội về so tài gói bánh chưng nhanh, đẹp và giã bánh giầy dẻo thơm. Đội đạt giải Nhất sẽ được vinh dự dâng bánh lên bàn thờ Vua Hùng vào đúng ngày chính giỗ.',
      meaning: 'Khắc ghi đạo lý “Uống nước nhớ nguồn” và tôn vinh nền văn minh lúa nước.',
      badge: 'Phần Hội',
      iconName: 'Sparkles',
    },
    {
      id: 'boi-chai',
      category: 'HOI',
      title: 'Hội bơi chải trên Sông Lô',
      subtitle: 'Sức mạnh quật cường & tài thao lược sông nước',
      description: 'Hàng chục đội chải với các tay chèo vạm vỡ rẽ sóng trên dòng sông Lô lịch sử. Tiếng trống, tiếng thanh la và tiếng hò reo cổ vũ của người xem vang dậy cả một khúc sông.',
      meaning: 'Tái hiện tinh thần thượng võ và tài luyện thủy quân đánh giặc giữ nước của tổ tiên ta.',
      badge: 'Phần Hội',
      iconName: 'Waves',
    },
    {
      id: 'tro-choi-dan-gian',
      category: 'HOI',
      title: 'Các trò chơi dân gian truyền thống',
      subtitle: 'Sôi nổi, hào hứng khắp khu di tích',
      description: 'Đấu vật cổ truyền, kéo co, bắn nỏ, múa rối nước, thi nấu cơm củi tre, biểu diễn cờ người... thu hút đông đảo học sinh và du khách cùng tham gia.',
      meaning: 'Gắn kết tình làng nghĩa xóm, rèn luyện thân thể và tinh thần nhanh nhẹn, bền bỉ.',
      badge: 'Phần Hội',
      iconName: 'Smile',
    },
  ],
  quizQuestions: [
    {
      id: 'q1',
      question: 'Khu di tích lịch sử Đền Hùng nằm trên ngọn núi nào và thuộc tỉnh nào của nước ta?',
      options: [
        'Núi Ba Vì, thành phố Hà Nội',
        'Núi Nghĩa Lĩnh, tỉnh Phú Thọ',
        'Núi Tam Đảo, tỉnh Vĩnh Phúc',
        'Núi Yên Tử, tỉnh Quảng Ninh',
      ],
      correctIndex: 1,
      explanation: 'Đền Hùng nằm trên núi Nghĩa Lĩnh (cao 175m), thuộc xã Hy Cương, thành phố Việt Trì, tỉnh Phú Thọ.',
    },
    {
      id: 'q2',
      question: 'Sự tích bánh chưng, bánh giầy của hoàng tử Lang Liêu gắn liền với ngôi đền nào trên núi Nghĩa Lĩnh?',
      options: [
        'Đền Hạ',
        'Đền Trung',
        'Đền Thượng',
        'Đền Giếng',
      ],
      correctIndex: 1,
      explanation: 'Đền Trung là nơi vua Hùng họp bàn việc nước với các Lạc hầu, Lạc tướng và là nơi diễn ra cuộc thi chọn người kế vị với bánh chưng, bánh giầy của hoàng tử Lang Liêu.',
    },
    {
      id: 'q3',
      question: 'Câu nói nổi tiếng của Bác Hồ: “Các Vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước” được căn dặn tại địa điểm nào?',
      options: [
        'Cổng Đền Hùng',
        'Đền Thượng',
        'Đền Giếng',
        'Bảo tàng Hùng Vương',
      ],
      correctIndex: 2,
      explanation: 'Vào ngày 19/9/1954, Bác Hồ đã nói chuyện và căn dặn các chiến sĩ Đại đoàn Quân Tiên Phong tại Đền Giếng trước khi về tiếp quản Thủ đô.',
    },
    {
      id: 'q4',
      question: 'Ngày Giỗ Tổ Hùng Vương được tổ chức vào ngày nào hàng năm?',
      options: [
        'Mùng 1 tháng 1 Âm lịch',
        'Mùng 10 tháng 3 Âm lịch',
        'Mùng 2 tháng 9 Dương lịch',
        'Ngày 30 tháng 4 Dương lịch',
      ],
      correctIndex: 1,
      explanation: 'Giỗ Tổ Hùng Vương diễn ra vào ngày Mùng 10 tháng 3 Âm lịch hàng năm, đúng như câu ca dao: “Dù ai đi ngược về xuôi / Nhớ ngày Giỗ Tổ mùng mười tháng ba”.',
    },
  ],
};
