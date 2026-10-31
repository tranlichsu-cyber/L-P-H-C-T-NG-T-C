export interface ModelBadge {
  id: string;
  modelId: string;
  title: string;
  icon: string;
  description: string;
  subject: 'Khoa học' | 'Lịch sử và Địa lí';
  unlockedAt?: string;
}

export const ALL_MODEL_BADGES: ModelBadge[] = [
  {
    id: 'badge-water-cycle',
    modelId: 'vong-tuan-hoan-nuoc',
    title: 'Chuyên Gia Khí Tượng Nhí',
    icon: '💧',
    description: 'Xuất sắc khám phá vòng tuần hoàn nước & 3 thể của nước trong tự nhiên.',
    subject: 'Khoa học',
  },
  {
    id: 'badge-globe',
    modelId: 'qua-dia-cau',
    title: 'Nhà Thám Hiểm Địa Cầu',
    icon: '🌍',
    description: 'Định vị chuẩn xác Việt Nam, Hoàng Sa, Trường Sa và 6 châu lục, 4 đại dương.',
    subject: 'Lịch sử và Địa lí',
  },
  {
    id: 'badge-red-river-dike',
    modelId: 'de-song-hong',
    title: 'Hiệp Sĩ Hộ Đê Sông Hồng',
    icon: '🌊',
    description: 'Làm chủ kiến thức mặt cắt con đê kiên cố và trị thủy mùa nước lũ.',
    subject: 'Lịch sử và Địa lí',
  },
  {
    id: 'badge-hung-temple',
    modelId: 'den-hung',
    title: 'Người Giữ Nguồn Cội Đền Hùng',
    icon: '⛩️',
    description: 'Hoàn thành hành trình dâng hương qua 8 điểm di tích linh thiêng núi Nghĩa Lĩnh.',
    subject: 'Lịch sử và Địa lí',
  },
  {
    id: 'badge-bach-dang',
    modelId: 'bach-dang-938',
    title: 'Anh Hùng Bạch Đằng Giang',
    icon: '⚔️',
    description: 'Nắm vững nghệ thuật quân sự bãi cọc ngầm của Ngô Quyền đánh tan quân Nam Hán.',
    subject: 'Lịch sử và Địa lí',
  },
];

const STORAGE_KEY = 'lhtt_unlocked_model_badges_v1';

export function getUnlockedBadges(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function unlockBadge(badgeId: string): boolean {
  try {
    const current = getUnlockedBadges();
    if (current[badgeId]) return false; // already unlocked
    current[badgeId] = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return true; // newly unlocked
  } catch {
    return false;
  }
}

export function isBadgeUnlocked(badgeId: string): boolean {
  const current = getUnlockedBadges();
  return Boolean(current[badgeId]);
}
