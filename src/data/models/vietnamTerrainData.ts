export interface TerrainRegion {
  id: string;
  order: number;
  name: string;
  category: 'mien-bac' | 'mien-trung' | 'tay-nguyen' | 'nam-bo' | 'bien-dao';
  icon: string;
  elevation: string;
  climate: string;
  features: string;
  economic: string;
  camPos: { x: number; y: number; z: number };
  camTarget: { x: number; y: number; z: number };
  highlightCoord: { x: number; y: number; z: number };
}

export interface TerrainQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const VIETNAM_TERRAIN_REGIONS: TerrainRegion[] = [
  {
    id: 'bac-bo-nui',
    order: 1,
    name: 'Vùng Trung du và Miền núi Bắc Bộ',
    category: 'mien-bac',
    icon: '⛰️',
    elevation: 'Đỉnh Fansipan 3.143m (Cao nhất Việt Nam & Đông Dương)',
    climate: 'Khí hậu nhiệt đới gió mùa có mùa đông lạnh nhất cả nước, vùng núi cao có sương mù và tuyết rơi.',
    features: 'Địa hình đồi núi hiểm trở, nhiều đỉnh núi cao trên 2.000m thuộc dãy Hoàng Liên Sơn, các thung lũng sông và vùng đồi trung du hình bát úp uốn lượn.',
    economic: 'Thế mạnh khai thác khoáng sản, thủy điện lớn (Hòa Bình, Sơn La), trồng chè, cây ăn quả ôn đới và ruộng bậc thang độc đáo.',
    camPos: { x: -8, y: 35, z: 25 },
    camTarget: { x: -6, y: 8, z: 8 },
    highlightCoord: { x: -6, y: 9, z: 8 },
  },
  {
    id: 'dong-bang-bac-bo',
    order: 2,
    name: 'Vùng Đồng bằng Bắc Bộ (Đồng bằng Sông Hồng)',
    category: 'mien-bac',
    icon: '🌾',
    elevation: 'Địa hình bằng phẳng thấp, độ cao trung bình 2m – 10m',
    climate: 'Nhiệt đới gió mùa, có mùa đông lạnh khô và mùa hè nóng ẩm, mưa nhiều.',
    features: 'Được bồi đắp bởi phù sa sông Hồng và sông Thái Bình, hình tam giác châu thổ phì nhiêu với hệ thống đê dài hàng nghìn km bao bọc.',
    economic: 'Vựa lúa lớn thứ hai cả nước, cái nôi văn minh lúa nước sông Hồng, mật độ dân cư đông đúc và làng nghề truyền thống phong phú.',
    camPos: { x: 4, y: 28, z: 22 },
    camTarget: { x: 2, y: 3, z: 4 },
    highlightCoord: { x: 2, y: 3.5, z: 4 },
  },
  {
    id: 'duyen-hai-mien-trung',
    order: 3,
    name: 'Vùng Duyên hải Miền Trung',
    category: 'mien-trung',
    icon: '🌊',
    elevation: 'Hẹp ngang, phía tây là sườn núi Trường Sơn, phía đông giáp biển',
    climate: 'Khí hậu khắc nghiệt, nhiều nắng gió bão lũ, mùa khô kéo dài dễ hạn hán.',
    features: 'Các nhánh núi đâm ngang ra biển chia cắt thành nhiều dải đồng bằng nhỏ hẹp ven biển, nhiều cồn cát trắng, đầm phá và bãi biển cát vàng.',
    economic: 'Kinh tế biển mạnh: Đánh bắt và nuôi trồng hải sản, làm muối, cảng nước sâu và du lịch biển danh tiếng.',
    camPos: { x: 12, y: 26, z: 20 },
    camTarget: { x: 4, y: 2, z: -2 },
    highlightCoord: { x: 4, y: 2.5, z: -2 },
  },
  {
    id: 'tay-nguyen',
    order: 4,
    name: 'Vùng Cao nguyên Tây Nguyên',
    category: 'tay-nguyen',
    icon: '☕',
    elevation: 'Các cao nguyên xếp tầng cao từ 500m đến 1.500m (Kon Tum, Pleiku, Đắk Lắk, Lâm Viên)',
    climate: 'Khí hậu cận xích đạo chia hai mùa mưa – khô rõ rệt, cao nguyên Lâm Viên quanh năm mát mẻ.',
    features: 'Không giáp biển, gồm các mặt bằng cao nguyên rộng lớn phủ đất đỏ ba-dan màu mỡ phì nhiêu do núi lửa cổ phun trào tạo thành.',
    economic: 'Thủ phủ cây công nghiệp lâu năm: Cà phê, hồ tiêu, cao su, chè; rừng đại ngàn và không gian văn hóa cồng chiêng Tây Nguyên.',
    camPos: { x: 14, y: 24, z: 15 },
    camTarget: { x: 6, y: 4, z: -8 },
    highlightCoord: { x: 6, y: 4.5, z: -8 },
  },
  {
    id: 'dong-bang-nam-bo',
    order: 5,
    name: 'Vùng Nam Bộ (Đồng bằng Sông Cửu Long & Đông Nam Bộ)',
    category: 'nam-bo',
    icon: '🛶',
    elevation: 'Đồng bằng thấp trũng, độ cao dưới 2m, mạng lưới kênh rạch dày đặc',
    climate: 'Nhiệt đới gió mùa cận xích đạo, nóng quanh năm, biên độ nhiệt ngày đêm nhỏ.',
    features: 'Đồng bằng châu thổ lớn nhất cả nước do sông Mê Kông bồi đắp, đất phù sa bãi bồi ngọt, rừng ngập mặn U Minh và mùa nước nổi hàng năm.',
    economic: 'Vựa lúa, vựa trái cây và thủy hải sản lớn nhất Việt Nam; vùng Đông Nam Bộ là trung tâm công nghiệp sôi động nhất đất nước.',
    camPos: { x: 10, y: 25, z: 10 },
    camTarget: { x: 4, y: 1, z: -16 },
    highlightCoord: { x: 4, y: 1.5, z: -16 },
  },
  {
    id: 'bien-dao-chu-quyen',
    order: 6,
    name: 'Quần đảo Hoàng Sa & Quần đảo Trường Sa',
    category: 'bien-dao',
    icon: '⭐',
    elevation: 'Các đảo san hô và đảo đá nổi/chìm giữa Biển Đông',
    climate: 'Nhiệt đới hải dương, quanh năm chan hòa ánh nắng và gió biển mặn mòi.',
    features: 'Hai quần đảo thiêng liêng ở trung tâm Biển Đông, gồm hàng trăm đảo, đá, bãi cạn và rạn san hô sinh thái kỳ thú.',
    economic: 'Vị trí địa chính trị, an ninh quốc phòng chiến lược; nguồn tài nguyên thủy hải sản phong phú và khoáng sản dầu khí thềm lục địa.',
    camPos: { x: 26, y: 22, z: 12 },
    camTarget: { x: 18, y: 1, z: -5 },
    highlightCoord: { x: 18, y: 1.8, z: -5 },
  },
];

export const VIETNAM_TERRAIN_QUIZ: TerrainQuizQuestion[] = [
  {
    id: 1,
    question: 'Đỉnh núi nào được mệnh danh là "Nóc nhà của Đông Dương", nằm trên dãy Hoàng Liên Sơn ở độ cao 3.143m?',
    options: [
      'Đỉnh Fansipan (Phan-xi-păng)',
      'Đỉnh Bà Đen',
      'Đỉnh Ngọc Linh',
      'Đỉnh Langbiang',
    ],
    correctIndex: 0,
    explanation: 'Đỉnh Fansipan cao 3.143m thuộc dãy Hoàng Liên Sơn (tỉnh Lào Cai) là đỉnh núi cao nhất Việt Nam và toàn Đông Dương.',
  },
  {
    id: 2,
    question: 'Đặc điểm địa hình nổi bật nhất của vùng Tây Nguyên là gì?',
    options: [
      'Đồng bằng bằng phẳng có đê bao bọc',
      'Các cao nguyên xếp tầng màu mỡ đất đỏ ba-dan',
      'Nhiều cồn cát trắng dọc bờ biển',
      'Rừng ngập mặn ven cửa biển',
    ],
    correctIndex: 1,
    explanation: 'Tây Nguyên nổi bật với các cao nguyên xếp tầng (Kon Tum, Pleiku, Đắk Lắk, Mơ Nông, Lâm Viên) phủ lớp đất đỏ ba-dan màu mỡ.',
  },
  {
    id: 3,
    question: 'Đồng bằng sông Cửu Long (vùng Nam Bộ) có đặc điểm tự nhiên nổi bật nào sau đây?',
    options: [
      'Độ cao trên 1.000m, khí hậu lạnh quanh năm',
      'Mạng lưới sông ngòi, kênh rạch chằng chịt và đất phù sa phì nhiêu',
      'Đất đai khô cằn toàn sỏi đá',
      'Có hệ thống đê sông cao 10m ngăn lũ',
    ],
    correctIndex: 1,
    explanation: 'Đồng bằng sông Cửu Long là đồng bằng châu thổ rộng lớn nhất nước ta, thấp phẳng, có mạng lưới sông ngòi kênh rạch chằng chịt.',
  },
  {
    id: 4,
    question: 'Dải đồng bằng Duyên hải miền Trung có đặc điểm địa hình gì?',
    options: [
      'Rất rộng lớn và bằng phẳng kéo dài hàng ngàn km',
      'Nhỏ hẹp, bị các nhánh núi đâm ngang ra biển chia cắt thành nhiều đoạn',
      'Chỉ toàn đồi núi dốc đứng không có đồng bằng',
      'Chỉ toàn hồ nước ngọt',
    ],
    correctIndex: 1,
    explanation: 'Duyên hải miền Trung có các dãy núi đâm sát ra biển chia cắt đồng bằng thành các dải nhỏ hẹp ven biển.',
  },
  {
    id: 5,
    question: 'Hai quần đảo thiêng liêng nào ở Biển Đông là một phần máu thịt không thể tách rời của Tổ quốc Việt Nam?',
    options: [
      'Quần đảo Hoàng Sa và Quần đảo Trường Sa',
      'Quần đảo Cát Bà và Côn Đảo',
      'Quần đảo Phú Quốc và Nam Du',
      'Quần đảo Thổ Chu và Cô Tô',
    ],
    correctIndex: 0,
    explanation: 'Quần đảo Hoàng Sa (thuộc TP Đà Nẵng) và Quần đảo Trường Sa (thuộc tỉnh Khánh Hòa) là chủ quyền thiêng liêng, bất khả xâm phạm của Việt Nam.',
  },
];
