export interface WaterCycleStage {
  id: string;
  order: number;
  title: string;
  vietnameseTerm: string;
  scientificTerm: string;
  stateChange: string;
  description: string;
  detail: string;
  keyFact: string;
  realWorldExample: string;
  color: string;
}

export interface WaterQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const WATER_CYCLE_STAGES: WaterCycleStage[] = [
  {
    id: 'bay-hoi',
    order: 1,
    title: 'Hiện tượng Bay hơi',
    vietnameseTerm: 'Nước bốc hơi lên cao',
    scientificTerm: 'Bay hơi (Evaporation)',
    stateChange: 'Thể lỏng ➔ Thể khí (Hơi nước)',
    description: 'Nước ở mặt biển, sông, hồ, ao và mặt đất được ánh sáng Mặt Trời hun nóng, biến đổi từ thể lỏng thành thể khí (hơi nước) và bay lên cao trong không khí.',
    detail: 'Hơi nước là chất khí không màu, không mùi, không nhìn thấy được bằng mắt thường. Thực vật cũng thải hơi nước vào không khí qua quá trình thoát hơi nước ở lá cây.',
    keyFact: 'Mặt Trời là "cỗ máy" năng lượng khổng lồ cung cấp nhiệt để làm bay hơi khoảng 500.000 tỉ mét khối nước mỗi năm trên Trái Đất.',
    realWorldExample: 'Khi phơi quần áo ướt dưới ánh nắng, sau một thời gian quần áo khô ráo vì nước đã bay hơi vào không khí.',
    color: '#f59e0b',
  },
  {
    id: 'ngung-tu',
    order: 2,
    title: 'Hiện tượng Ngưng tụ',
    vietnameseTerm: 'Tạo thành các đám mây',
    scientificTerm: 'Ngưng tụ (Condensation)',
    stateChange: 'Thể khí (Hơi nước) ➔ Thể lỏng (Hạt nước nhỏ li ti)',
    description: 'Hơi nước bay lên cao gặp nhiệt độ thấp (lạnh dần) sẽ ngưng tụ lại thành vô số hạt nước nhỏ li ti. Hàng triệu triệu hạt nước li ti kết tụ lại tạo thành các đám mây bồng bềnh trên bầu trời.',
    detail: 'Khi ở trên tầng cao rất lạnh (dưới 0°C), các hạt nước li ti có thể đóng băng lại thành các tinh thể băng nhỏ li ti tạo nên mây ti trắng xốp.',
    keyFact: 'Mây nhìn có vẻ nhẹ nhàng như bông gòn nhưng một đám mây tích trung bình có thể chứa tới 500 tấn nước!',
    realWorldExample: 'Khi rót nước đá lạnh vào cốc thủy tinh, một lúc sau bên ngoài thành cốc xuất hiện những giọt nước đọng lại. Đó là do hơi nước trong không khí gặp lạnh ngưng tụ.',
    color: '#38bdf8',
  },
  {
    id: 'mua-roi',
    order: 3,
    title: 'Hiện tượng Mưa rơi',
    vietnameseTerm: 'Hạt mưa rơi xuống mặt đất',
    scientificTerm: 'Giáng thủy (Precipitation)',
    stateChange: 'Thể lỏng tích tụ rơi tự do / Thể rắn (Tuyết, mưa đá)',
    description: 'Các đám mây bay vào đất liền, gặp điều kiện thuận lợi và gió lạnh, các giọt nước nhỏ hợp lại với nhau thành giọt nước lớn hơn, nặng dần và không thể lơ lửng được nữa, rơi xuống đất tạo thành mưa.',
    detail: 'Ở các vùng khí hậu lạnh hoặc đỉnh núi cao như dãy Hoàng Liên Sơn vào mùa đông buốt giá, nước có thể rơi xuống dưới dạng tuyết hoặc mưa đá (thể rắn).',
    keyFact: 'Mưa cung cấp nguồn nước ngọt vô cùng quý giá cho sự sống của con người, động vật và thực vật trên toàn bộ đất liền.',
    realWorldExample: 'Những cơn mưa rào mùa hạ tưới mát cây cối, làm đầy các con suối và hồ chứa nước phục vụ sinh hoạt, sản xuất.',
    color: '#3b82f6',
  },
  {
    id: 'dong-chay-ngam',
    order: 4,
    title: 'Dòng chảy & Nước ngầm',
    vietnameseTerm: 'Nước thấm vào đất và chảy ra biển',
    scientificTerm: 'Dòng chảy bề mặt & Thấm ngầm (Infiltration & Runoff)',
    stateChange: 'Thể lỏng luân chuyển liên tục',
    description: 'Nước mưa rơi xuống mặt đất một phần chảy tràn trên bề mặt vào các khe suối, sông rồi đổ ra biển; một phần thấm sâu vào lòng đất tạo thành các túi mạch nước ngầm.',
    detail: 'Mạch nước ngầm di chuyển chậm chạp qua các tầng đất đá, có thể phun lên mặt đất thành các dòng suối khoáng tự nhiên hoặc được con người đào giếng khai thác, cuối cùng cũng luân chuyển trở lại biển.',
    keyFact: 'Vòng tuần hoàn nước là một chu trình khép kín, liên tục và không bao giờ ngừng lại. Lượng nước trên Trái Đất hầu như không bị mất đi!',
    realWorldExample: 'Nước giếng khoan mát lạnh mà các gia đình nông thôn sử dụng chính là nguồn nước ngầm được tích lũy từ những cơn mưa ngấm sâu qua lớp cát sỏi thiên nhiên.',
    color: '#10b981',
  },
];

export const WATER_QUIZ: WaterQuizQuestion[] = [
  {
    id: 1,
    question: 'Nước trong tự nhiên tồn tại ở mấy thể (trạng thái)?',
    options: [
      'Chỉ tồn tại ở 1 thể lỏng',
      '2 thể: Thể lỏng và thể khí',
      '3 thể: Thể rắn (băng/đá), thể lỏng (nước), thể khí (hơi nước)',
      '4 thể khác nhau',
    ],
    correctIndex: 2,
    explanation: 'Nước tồn tại ở 3 thể: Thể rắn (nước đá, băng, tuyết), thể lỏng (nước uống, nước mưa, sông, biển), và thể khí (hơi nước trong không khí).',
  },
  {
    id: 2,
    question: 'Dưới tác dụng của yếu tố nào mà nước ở biển, sông, hồ bay hơi lên cao?',
    options: [
      'Ánh sáng và nhiệt độ của Mặt Trời',
      'Gió thổi mạnh',
      'Độ mặn của nước biển',
      'Ánh trăng vào ban đêm',
    ],
    correctIndex: 0,
    explanation: 'Mặt Trời chiếu sáng và tỏa nhiệt sưởi ấm mặt đất, mặt biển làm nước nóng lên và chuyển thể từ lỏng sang khí (bay hơi) bay lên cao.',
  },
  {
    id: 3,
    question: 'Hơi nước bay lên cao gặp lạnh sẽ xảy ra hiện tượng gì để tạo thành mây?',
    options: [
      'Đông đặc thành tảng đá lớn',
      'Ngưng tụ thành các hạt nước nhỏ li ti',
      'Biến mất hoàn toàn vào không gian vũ trụ',
      'Bốc cháy',
    ],
    correctIndex: 1,
    explanation: 'Càng lên cao không khí càng lạnh, hơi nước ngưng tụ lại thành vô số hạt nước nhỏ li ti. Tập hợp hàng triệu triệu hạt nước này tạo thành mây.',
  },
  {
    id: 4,
    question: 'Vì sao gọi là "Vòng tuần hoàn của nước trong tự nhiên"?',
    options: [
      'Vì nước chỉ chảy theo hình tròn',
      'Vì nước chuyển thể liên tục (lỏng ➔ khí ➔ lỏng) lặp đi lặp lại không ngừng',
      'Vì mỗi tuần nước lại đổi màu một lần',
      'Vì nước chỉ rơi xuống vào ban ngày',
    ],
    correctIndex: 1,
    explanation: 'Vòng tuần hoàn nước là quá trình lặp đi lặp lại vô tận: Nước bay hơi thành khí ➔ ngưng tụ thành mây ➔ tạo mưa rơi xuống ➔ chảy về sông biển và ngấm xuống đất ➔ rồi lại tiếp tục bay hơi.',
  },
  {
    id: 5,
    question: 'Hành động nào sau đây giúp bảo vệ nguồn nước và giữ gìn vòng tuần hoàn tự nhiên trong lành?',
    options: [
      'Vứt rác và túi ni lông xuống lòng sông suối',
      'Xả nước thải chưa qua xử lý ra ao hồ',
      'Trồng nhiều cây xanh, rừng đầu nguồn và sử dụng nước tiết kiệm',
      'Đổ dầu mỡ thừa trực tiếp vào cống thoát nước',
    ],
    correctIndex: 2,
    explanation: 'Rừng cây giúp giữ nước, làm chậm dòng chảy xói mòn và điều hòa khí hậu. Tiết kiệm nước và không xả rác giúp nguồn nước luôn trong sạch cho muôn loài.',
  },
];
