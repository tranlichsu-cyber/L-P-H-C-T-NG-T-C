/**
 * Chuẩn hóa chuỗi tiếng Việt bỏ dấu và chuyển về chữ thường
 * Ví dụ: "Nguyễn Văn An" -> "nguyen van an"
 */
export const normalizeVietnameseText = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

/**
 * Kiểm tra chuỗi target có chứa chuỗi search (không phân biệt hoa/thường & dấu)
 */
export const matchVietnameseText = (target: string, search: string): boolean => {
  if (!search) return true;
  const normalizedTarget = normalizeVietnameseText(target);
  const normalizedSearch = normalizeVietnameseText(search);
  return normalizedTarget.includes(normalizedSearch);
};
