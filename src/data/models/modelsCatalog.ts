export interface LearningModelItem {
  id: string;
  title: string;
  subject: 'Lịch sử và Địa lí' | 'Khoa học';
  grade: number;
  lessonCode: string;
  lessonName: string;
  coverImage: string;
  summary: string;
  status: 'AVAILABLE' | 'UPCOMING';
  route?: string;
  tags: string[];
  type: 'SA_BAN' | 'MO_HINH_3D' | 'HOAT_CANH';
}

export const modelsCatalog: LearningModelItem[] = [
  {
    id: 'den-hung',
    title: 'Sa bàn Đền Hùng & Núi Nghĩa Lĩnh',
    subject: 'Lịch sử và Địa lí',
    grade: 4,
    lessonCode: 'Bài 7',
    lessonName: 'Đền Hùng và lễ giỗ Tổ',
    coverImage: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
    summary: 'Khám phá sa bàn hành hương núi Nghĩa Lĩnh qua 8 điểm di tích: Cổng Đền, Đền Hạ, Đền Trung, Đền Thượng, Lăng Vua Hùng, Đền Giếng và không gian Lễ hội Giỗ Tổ mùng 10/3.',
    status: 'AVAILABLE',
    route: '/mo-hinh/den-hung',
    tags: ['Núi Nghĩa Lĩnh', 'Vua Hùng', 'Giỗ Tổ 10/3', 'Hát Xoan', 'Di sản UNESCO'],
    type: 'SA_BAN',
  },
  {
    id: 'dia-dao-cu-chi',
    title: 'Sa bàn Mặt cắt 3 Tầng Địa đạo Củ Chi',
    subject: 'Lịch sử và Địa lí',
    grade: 4,
    lessonCode: 'Bài 26',
    lessonName: 'Địa đạo Củ Chi',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    summary: 'Mô phỏng mặt cắt không gian ngầm 3 tầng: Bếp Hoàng Cầm giấu khói, giếng nước, hầm cứu thương, ụ chiến đấu và hệ thống thông hơi ngụy trang tổ mối.',
    status: 'UPCOMING',
    tags: ['Lòng đất kỳ bí', 'Bếp Hoàng Cầm', 'Nam Bộ', 'Kháng chiến'],
    type: 'SA_BAN',
  },
  {
    id: 'trong-dong-dong-son',
    title: 'Mô hình 3D Trống đồng Đông Sơn',
    subject: 'Lịch sử và Địa lí',
    grade: 4,
    lessonCode: 'Bài 11',
    lessonName: 'Sông Hồng và văn minh sông Hồng',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    summary: 'Mô hình 3D xoay 360 độ: Khám phá tâm mặt trời 14 tia, đàn chim Lạc bay ngược chiều kim đồng hồ, cảnh giã gạo và thuyền chiến thời dựng nước Văn Lang.',
    status: 'UPCOMING',
    tags: ['Văn minh sông Hồng', 'Đồ đồng cổ', 'Chim Lạc', 'Văn Lang'],
    type: 'MO_HINH_3D',
  },
  {
    id: 'de-song-hong',
    title: 'Sa bàn Mặt cắt Hệ thống Đê sông Hồng',
    subject: 'Lịch sử và Địa lí',
    grade: 4,
    lessonCode: 'Bài 8',
    lessonName: 'Thiên nhiên vùng Đồng bằng Bắc Bộ',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    summary: 'Mô phỏng cắt ngang cấu trúc con đê: Bãi bồi sông Hồng, thân đê đất đá kiên cố, vùng đất phù sa trong đê và cơ chế ngăn lũ qua hàng trăm năm.',
    status: 'UPCOMING',
    tags: ['Đê sông Hồng', 'Đồng bằng Bắc Bộ', 'Phòng chống lũ', 'Đất phù sa'],
    type: 'SA_BAN',
  },
  {
    id: 'van-mieu-quoc-tu-giam',
    title: 'Sa bàn Di tích Văn Miếu – Quốc Tử Giám',
    subject: 'Lịch sử và Địa lí',
    grade: 4,
    lessonCode: 'Bài 13',
    lessonName: 'Văn Miếu – Quốc Tử Giám',
    coverImage: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&w=800&q=80',
    summary: 'Sa bàn toàn cảnh trường đại học đầu tiên của Việt Nam: Cửa Khuê Văn Các, Giếng Thiên Quang, 82 Bia Tiến sĩ trên lưng rùa đá và nhà Thái Học.',
    status: 'UPCOMING',
    tags: ['Thăng Long - Hà Nội', 'Bia Tiến sĩ', 'Khuê Văn Các', 'Hiếu học'],
    type: 'SA_BAN',
  },
  {
    id: 'nha-rong-tay-nguyen',
    title: 'Mô hình 3D Nhà Rông Tây Nguyên & Cồng chiêng',
    subject: 'Lịch sử và Địa lí',
    grade: 4,
    lessonCode: 'Bài 21',
    lessonName: 'Lễ hội Cồng chiêng Tây Nguyên',
    coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    summary: 'Mô hình 3D kiến trúc nhà Rông mái cao vút hình lưỡi búa, sàn gỗ và không gian diễn tấu cồng chiêng bên bếp lửa bập bùng.',
    status: 'UPCOMING',
    tags: ['Tây Nguyên', 'Nhà Rông', 'Cồng chiêng', 'Văn hóa phi vật thể'],
    type: 'MO_HINH_3D',
  },
  {
    id: 'co-the-nguoi-tuan-hoan',
    title: 'Mô hình 3D Quả tim & Hệ tuần hoàn máu',
    subject: 'Khoa học',
    grade: 4,
    lessonCode: 'Bài 21',
    lessonName: 'Cơ quan tuần hoàn ở người',
    coverImage: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    summary: 'Mô hình 3D tương tác quả tim đập theo nhịp: Khám phá tâm nhĩ, tâm thất, động mạch và tĩnh mạch vận chuyển máu mang ô-xi nuôi toàn bộ cơ thể.',
    status: 'UPCOMING',
    tags: ['Cơ thể người', 'Trái tim', 'Vòng tuần hoàn máu', 'Sức khỏe'],
    type: 'MO_HINH_3D',
  },
  {
    id: 'he-mat-troi',
    title: 'Mô hình 3D Hệ Mặt Trời & Chuyển động Trái Đất',
    subject: 'Khoa học',
    grade: 4,
    lessonCode: 'Bài 29',
    lessonName: 'Mặt Trời và các hành tinh',
    coverImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
    summary: 'Mô phỏng quỹ đạo 8 hành tinh quay quanh Mặt Trời, cơ chế Trái Đất tự quay sinh ra ngày và đêm, và chuyển động quanh Mặt Trời tạo nên 4 mùa xuân - hạ - thu - đông.',
    status: 'UPCOMING',
    tags: ['Hệ Mặt Trời', 'Trái Đất', 'Ngày và đêm', 'Bốn mùa', 'Vũ trụ'],
    type: 'MO_HINH_3D',
  },
];
