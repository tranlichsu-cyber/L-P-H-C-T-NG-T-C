import type { ClassGroup } from '../types';

export const INITIAL_CLASSES: ClassGroup[] = [
  {
    id: 'class-4a',
    name: 'Lớp 4A',
    grade: 'Khối 4',
    studentCount: 8,
    createdAt: '2026-09-05',
    students: [
      { id: 'std-101', name: 'Nguyễn Minh Anh', studentCode: '4A01' },
      { id: 'std-102', name: 'Trần Gia Bảo', studentCode: '4A02' },
      { id: 'std-103', name: 'Lê Hoàng Minh', studentCode: '4A03' },
      { id: 'std-104', name: 'Phạm Ngọc Anh', studentCode: '4A04' },
      { id: 'std-105', name: 'Nguyễn Hà My', studentCode: '4A05' },
      { id: 'std-106', name: 'Đỗ Minh Quân', studentCode: '4A06' },
      { id: 'std-107', name: 'Hoàng Gia Huy', studentCode: '4A07' },
      { id: 'std-108', name: 'Nguyễn Khánh Linh', studentCode: '4A08' },
    ],
  },
  {
    id: 'class-4b',
    name: 'Lớp 4B',
    grade: 'Khối 4',
    studentCount: 5,
    createdAt: '2026-09-05',
    students: [
      { id: 'std-201', name: 'Vũ Thanh Tùng', studentCode: '4B01' },
      { id: 'std-202', name: 'Đặng Bảo Ngọc', studentCode: '4B02' },
      { id: 'std-203', name: 'Ngô Đức Anh', studentCode: '4B03' },
      { id: 'std-204', name: 'Bùi Phương Thảo', studentCode: '4B04' },
      { id: 'std-205', name: 'Trịnh Quốc Bảo', studentCode: '4B05' },
    ],
  },
  {
    id: 'class-5a',
    name: 'Lớp 5A',
    grade: 'Khối 5',
    studentCount: 4,
    createdAt: '2026-09-05',
    students: [
      { id: 'std-301', name: 'Trần Nhật Minh', studentCode: '5A01' },
      { id: 'std-302', name: 'Phạm Thùy Chi', studentCode: '5A02' },
      { id: 'std-303', name: 'Hoàng Văn Nam', studentCode: '5A03' },
      { id: 'std-304', name: 'Lê Quỳnh Anh', studentCode: '5A04' },
    ],
  },
];
