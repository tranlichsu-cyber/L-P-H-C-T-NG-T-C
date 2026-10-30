export interface DikeStation {
  id: string;
  order: number;
  title: string;
  category: 'lich-su' | 'cau-tao' | 'tac-dung' | 'bao-ve';
  description: string;
  detail: string;
  keyFact: string;
}

export interface DikeQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const DIKE_STATIONS: DikeStation[] = [
  {
    id: 'mat-cat-de',
    order: 1,
    title: 'Cấu Tạo Mặt Cắt Con Đê',
    category: 'cau-tao',
    description: 'Con đê có mặt cắt hình thang kiên cố gồm: Chân đê rộng vững chãi, thân đê đắp bằng đất sét nện chặt, sườn đê phía ngoài bọc kè đá hộ đê chống sóng xói lở, và mặt đê phẳng rộng kết hợp làm đường giao thông.',
    detail: 'Hệ thống đê sông Hồng có chiều dài hàng ngàn km, chạy dọc hai bên bờ sông từ vùng trung du Phú Thọ, Vĩnh Phúc xuôi qua Hà Nội, Hưng Yên, Hà Nam, Nam Định, Thái Bình ra biển.',
    keyFact: 'Mặt đê sông Hồng cao hơn lòng sông từ 6m đến 10m, và thường cao hơn hẳn mặt ruộng bên trong đồng.',
  },
  {
    id: 'lich-su-tri-thuy',
    order: 2,
    title: 'Lịch Sử Ngàn Năm Đắp Đê Trị Thủy',
    category: 'lich-su',
    description: 'Từ thời nhà Lý (năm 1108 - đê Cơ Xá) đến các triều đại nhà Trần, nhà Lê, cha ông ta đã liên tục huy động sức người, sức của để đắp đê, lập cơ quan Hà Đê sứ chuyên lo việc đắp đê ngăn lũ.',
    detail: 'Sông Hồng có lượng phù sa và lưu lượng nước mùa lũ khổng lồ. Việc kiên trì đắp đê qua hàng ngàn năm thể hiện tinh thần đoàn kết, trí tuệ và ý chí quật cường của tổ tiên ta.',
    keyFact: 'Hệ thống đê sông Hồng được coi là một trong những công trình nhân tạo vĩ đại nhất của người Việt cổ trong công cuộc khai phá và bảo vệ Đồng bằng Bắc Bộ.',
  },
  {
    id: 'tac-dung-ngan-lu',
    order: 3,
    title: 'Tác Dụng Ngăn Lũ & Vùng Trong Đê',
    category: 'tac-dung',
    description: 'Đê ngăn chặn nước lũ tràn vào đồng ruộng và làng mạc trong mùa mưa bão (tháng 6 đến tháng 8), giúp nhân dân yên tâm sinh sống, thâm canh lúa nước và phát triển đô thị trù phú.',
    detail: 'Do đê ngăn phù sa tràn vào đồng, vùng đất trong đê qua nhiều năm không được bồi đắp tự nhiên nên thường trũng thấp hơn mực nước lũ ngoài sông, tạo thành các ô trũng đặc trưng của Đồng bằng Bắc Bộ.',
    keyFact: 'Bãi bồi ngoài đê hàng năm vẫn đón nhận phù sa màu mỡ từ dòng sông Hồng, tạo nên những bãi ngô, dâu tằm xanh tốt ngút ngàn.',
  },
  {
    id: 'bao-ve-de-dieu',
    order: 4,
    title: 'Trách Nhiệm Giữ Gìn & Bảo Vệ Đê',
    category: 'bao-ve',
    description: 'Bảo vệ đê là trách nhiệm của toàn dân: Thường xuyên tuần tra phát hiện rò rỉ (mạch đùn, mạch sủi), cấm đào xới chân đê hoặc xả rác bừa bãi, trồng cây chắn sóng ven sông.',
    detail: 'Khi mùa lũ về, các đội thanh niên xung kích và nhân dân địa phương luôn túc trực ngày đêm để gia cố bao cát, kè đá, sẵn sàng "hộ đê" bảo vệ an toàn cho xóm làng.',
    keyFact: 'Câu tục ngữ "Thuận vợ thuận chồng tát biển Đông cũng cạn, muôn dân một lòng giữ vững bờ đê" ca ngợi tinh thần đại đoàn kết toàn dân.',
  },
];

export const DIKE_QUIZ: DikeQuizQuestion[] = [
  {
    id: 1,
    question: 'Hệ thống đê sông Hồng được xây dựng nhằm mục đích quan trọng nhất là gì?',
    options: [
      'Làm đường đua thuyền thể thao',
      'Ngăn chặn lũ lụt từ sông Hồng tràn vào làng mạc, ruộng đồng',
      'Để ngăn người dân không đi ra bờ sông',
      'Để chứa nước mưa làm hồ bơi nhân tạo',
    ],
    correctIndex: 1,
    explanation: 'Hệ thống đê sông Hồng được đắp qua hàng ngàn năm với mục đích tối quan trọng là ngăn lũ lụt màu đỏ phù sa tàn phá ruộng đồng và xóm làng.',
  },
  {
    id: 2,
    question: 'Thời kỳ lịch sử nào đê Cơ Xá - con đê đầu tiên được ghi chép trong sử sách được xây dựng?',
    options: [
      'Thời kỳ dựng nước Văn Lang',
      'Thời nhà Lý (năm 1108)',
      'Thời kỳ kháng chiến chống Pháp',
      'Năm 2000',
    ],
    correctIndex: 1,
    explanation: 'Năm 1108 dưới triều vua Lý Nhân Tông, đê Cơ Xá được đắp để bảo vệ kinh thành Thăng Long, mở đầu cho lịch sử đắp đê quy mô lớn.',
  },
  {
    id: 3,
    question: 'Vì sao vùng đất trong đê thường trũng thấp hơn mực nước sông Hồng vào mùa lũ?',
    options: [
      'Vì đất trong đê bị lún tự nhiên do khai thác dầu mỏ',
      'Vì có đê ngăn không cho phù sa bồi đắp qua hàng trăm năm',
      'Vì người dân đào đất đem bán hết',
      'Vì khí hậu ở trong đê lạnh hơn',
    ],
    correctIndex: 1,
    explanation: 'Đê giữ cho nước lũ không tràn vào, khiến vùng đất trong đê không được bồi đắp phù sa hàng năm nên thấp dần so với mực nước lũ ngoài sông.',
  },
  {
    id: 4,
    question: 'Mặt đê sông Hồng ngày nay thường được tận dụng để làm gì phục vụ đời sống nhân dân?',
    options: [
      'Làm sân bay quốc tế',
      'Làm bãi đỗ tàu ngầm',
      'Làm đường giao thông phẳng phiu kết nối các làng quê, huyện lị',
      'Làm khu vui chơi bắn pháo hoa',
    ],
    correctIndex: 2,
    explanation: 'Mặt đê được trải nhựa hoặc bê tông kiên cố, vừa bảo vệ thân đê vừa làm đường giao thông huyết mạch kết nối các địa phương ven sông.',
  },
  {
    id: 5,
    question: 'Hành động nào sau đây là vi phạm pháp luật và gây nguy hiểm cho an toàn đê điều?',
    options: [
      'Trồng cây chắn sóng ngoài bãi bồi ven sông',
      'Đào bới đất ở chân đê, đổ chất thải làm sạt lở thân đê',
      'Tham gia tuần tra canh đê khi mùa nước lũ lên cao',
      'Vệ sinh phát quang cỏ dại trên thân đê',
    ],
    correctIndex: 1,
    explanation: 'Đào bới đất chân đê, xe chở quá tải chạy trên mặt đê hoặc xả rác sẽ làm suy yếu kết cấu con đê, dễ dẫn đến nguy cơ vỡ đê khi lũ lớn.',
  },
];
