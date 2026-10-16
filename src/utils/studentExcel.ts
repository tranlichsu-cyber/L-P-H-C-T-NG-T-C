import * as XLSX from 'xlsx';

export interface StudentExcelRow {
  name: string;
  className: string;
  code: string;
}

export function createStudentWorkbook(rows: StudentExcelRow[]) {
  const sheet = XLSX.utils.aoa_to_sheet([
    ['Họ tên', 'Lớp', 'Mã học sinh'],
    ...rows.map(row => [row.name, row.className, row.code]),
  ]);
  sheet['!cols'] = [{ wch: 32 }, { wch: 16 }, { wch: 24 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Danh sách học sinh');
  return workbook;
}

export function downloadStudentExcel(rows: StudentExcelRow[], label: string) {
  const filename = Array.from(label, char => char.charCodeAt(0) < 32 ? '_' : char).join('').replace(/[\\/:*?"<>|]/g, '_');
  XLSX.writeFile(createStudentWorkbook(rows), `Danh_sach_hoc_sinh_${filename}.xlsx`);
}
