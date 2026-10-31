export interface BachDangStage {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  tideState: 'HIGH' | 'LOW';
  description: string;
  tactics: string;
  significance: string;
  camPos: { x: number; y: number; z: number };
  camTarget: { x: number; y: number; z: number };
}

export interface BachDangQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const BACH_DANG_STAGES: BachDangStage[] = [
  {
    id: 'stage-1',
    order: 1,
    title: 'Xây dựng Trận địa Cọc ngầm',
    subtitle: 'Nghệ thuật quân sự độc đáo của Ngô Quyền',
    tideState: 'LOW',
    description: 'Ngô Quyền huy động quân dân vào rừng đẵn hàng nghìn cây gỗ lim, táu to khỏe, vót nhọn một đầu rồi bịt sắt sắc bén. Chờ lúc thủy triều rút cạn, quân ta đóng cọc nghiêng theo dòng nước xuôi ra biển tại vùng cửa sông Bạch Đằng.',
    tactics: 'Lợi dụng địa hình hiểm trở và con nước thủy triều lên xuống chênh lệch hàng mét mỗi ngày ở vùng biển Đông Bắc.',
    significance: 'Bãi cọc trở thành cái bẫy vô hình nhưng vô cùng hiểm hóc chực chờ đoàn chiến thuyền to lớn của giặc.',
    camPos: { x: 0, y: 18, z: 45 },
    camTarget: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'stage-2',
    order: 2,
    title: 'Thủy triều lên & Nhử địch vượt bãi cọc',
    subtitle: 'Lấy yếu đánh mạnh, mưu trí nhử mồi',
    tideState: 'HIGH',
    description: 'Cuối năm 938, đoàn thuyền chiến khổng lồ của tướng Nam Hán là Hoằng Tháo tiến vào cửa sông Bạch Đằng. Khi nước thủy triều dâng cao ngập sâu toàn bộ bãi cọc ngầm, Ngô Quyền cử một đội thuyền nhẹ, cơ động ra khiêu chiến rồi giả vờ thua chạy.',
    tactics: 'Hoằng Tháo kiêu ngạo, tưởng quân ta yếu thế nên thúc toàn bộ hạm đội thuyền lớn đuổi theo vượt qua bãi cọc ngập nước vào sâu trong sông.',
    significance: 'Toàn bộ quân địch đã hoàn toàn rơi vào thế trận bẫy cọc đã được bố trí sẵn mà không hề hay biết.',
    camPos: { x: -25, y: 24, z: 35 },
    camTarget: { x: 0, y: 5, z: 0 },
  },
  {
    id: 'stage-3',
    order: 3,
    title: 'Thủy triều rút & Đắm thuyền giặc',
    subtitle: 'Trận địa cọc nhô lên – Giặc hoảng loạn',
    tideState: 'LOW',
    description: 'Khi nước thủy triều bắt đầu rút nhanh ra biển, dòng nước chảy xiết cuồn cuộn. Ngô Quyền lập tức phát lệnh quay đầu thuyền tổng phản công dữ dội. Quân giặc hoảng sợ quay thuyền tháo chạy ra biển thì bãi cọc nhọn đã nhô lên mặt nước.',
    tactics: 'Thuyền chiến nặng nề của giặc bị dòng nước đẩy mạnh đâm sầm vào đầu cọc nhọn bịt sắt, vỡ toang đáy thuyền, mắc cạn và lật úp hàng loạt.',
    significance: 'Quân giặc rơi vào tình thế tiến thoái lưỡng nan, hoảng loạn nhảy xuống sông chết đuối vô số.',
    camPos: { x: 15, y: 15, z: 30 },
    camTarget: { x: 0, y: 2, z: -5 },
  },
  {
    id: 'stage-4',
    order: 4,
    title: 'Đại thắng Bạch Đằng – Mở nền độc lập',
    subtitle: 'Chấm dứt hơn 1.000 năm Bắc thuộc',
    tideState: 'LOW',
    description: 'Quân ta từ hai bên bờ mai phục đồng loạt đánh giáp lá cà, bắn tên lửa thiêu rụi tàn quân địch. Tướng giặc Lưu Hoằng Tháo tử trận tại chỗ, vua Nam Hán đang đóng quân ở biên giới nghe tin kinh hoàng rút chạy về nước.',
    tactics: 'Chiến thắng quân sự oanh liệt bằng trí tuệ, lòng dũng cảm và tinh thần đoàn kết toàn dân tộc.',
    significance: 'Mùa xuân năm 939, Ngô Quyền xưng Vương, định đô ở Cổ Loa, chính thức chấm dứt hơn 1.000 năm Bắc thuộc, mở ra kỷ nguyên độc lập, tự chủ lâu dài cho dân tộc Việt Nam.',
    camPos: { x: 0, y: 35, z: 50 },
    camTarget: { x: 0, y: 0, z: 0 },
  },
];

export const BACH_DANG_QUIZ: BachDangQuizQuestion[] = [
  {
    id: 1,
    question: 'Trận chiến lịch sử trên sông Bạch Đằng do ai trực tiếp chỉ huy diễn ra vào năm nào?',
    options: [
      'Đinh Bộ Lĩnh chỉ huy năm 968',
      'Ngô Quyền chỉ huy năm 938',
      'Lê Hoàn chỉ huy năm 981',
      'Trần Hưng Đạo chỉ huy năm 1288',
    ],
    correctIndex: 1,
    explanation: 'Trận chiến Bạch Đằng lịch sử do anh hùng dân tộc Ngô Quyền lãnh đạo diễn ra vào mùa đông năm 938.',
  },
  {
    id: 2,
    question: 'Ngô Quyền đã dùng mưu kế độc đáo nào để đánh bại quân xâm lược Nam Hán?',
    options: [
      'Đào hầm chông trên bờ sông',
      'Cắm bãi cọc gỗ nhọn bịt sắt ngầm dưới lòng sông kết hợp lợi dụng thủy triều',
      'Đắp đê ngăn chặn dòng nước lũ',
      'Dùng voi chiến đánh úp ban đêm',
    ],
    correctIndex: 1,
    explanation: 'Ngô Quyền đã sáng tạo trận địa cọc ngầm cắm dưới lòng sông, kết hợp sự lên xuống của thủy triều để đâm vỡ thuyền giặc.',
  },
  {
    id: 3,
    question: 'Quân ta đã nhử thuyền chiến của giặc vượt qua bãi cọc ngầm vào thời điểm nào?',
    options: [
      'Khi thủy triều bắt đầu rút cạn',
      'Lúc nửa đêm không có trăng',
      'Lúc thủy triều đang lên cao ngập sâu bãi cọc',
      'Vào lúc trời mưa bão lớn',
    ],
    correctIndex: 2,
    explanation: 'Khi thủy triều lên cao, nước che lấp toàn bộ bãi cọc, quân ta dùng thuyền nhẹ nhử giặc đuổi theo vượt qua bãi cọc mà chúng không biết.',
  },
  {
    id: 4,
    question: 'Tướng giặc chỉ huy đoàn quân xâm lược Nam Hán bị tử trận trên sông Bạch Đằng là ai?',
    options: [
      'Lưu Hoằng Tháo',
      'Thoát Hoan',
      'Mã Viện',
      'Liễu Thăng',
    ],
    correctIndex: 0,
    explanation: 'Chủ tướng giặc Lưu Hoằng Tháo (con trai vua Nam Hán) đã bị tử trận tại trận địa cọc ngầm sông Bạch Đằng.',
  },
  {
    id: 5,
    question: 'Chiến thắng Bạch Đằng năm 938 có ý nghĩa lịch sử vô cùng to lớn nào đối với dân tộc ta?',
    options: [
      'Mở rộng bờ cõi về phương Nam',
      'Chấm dứt hơn 1.000 năm đô hộ của phong kiến phương Bắc, mở ra kỷ nguyên độc lập tự chủ lâu dài',
      'Xây dựng xong kinh thành Thăng Long',
      'Thành lập nên triều đại nhà Trần',
    ],
    correctIndex: 1,
    explanation: 'Chiến thắng Bạch Đằng năm 938 đã chấm dứt hoàn toàn hơn 1.000 năm Bắc thuộc tối tăm, mở ra thời kỳ độc lập, tự do muôn đời cho đất nước.',
  },
];
