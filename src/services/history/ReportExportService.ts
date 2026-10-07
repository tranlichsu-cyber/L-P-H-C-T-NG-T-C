import * as XLSX from 'xlsx';
import type { SessionDetailResult } from './types';

export class ReportExportService {
  public static sanitizeFilename(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .replace(/_+/g, '_');
  }

  // 1. Export Excel Workbook with 3 Sheets
  public static exportSessionToExcel(sessionDetail: SessionDetailResult): void {
    const { summary, questionStats, studentResults } = sessionDetail;
    const dateStr = new Date(summary.startedAt).toLocaleDateString('vi-VN').replace(/\//g, '-');
    const safeClassName = this.sanitizeFilename(summary.className);
    const safeSubject = this.sanitizeFilename(summary.subject);
    const fileName = `Ket_qua_${safeClassName}_${safeSubject}_${dateStr}.xlsx`;

    const wb = XLSX.utils.book_new();

    // SHEET 1: TỔNG HỢP HỌC SINH
    const sheet1Data = studentResults.map((s, idx) => ({
      STT: idx + 1,
      'Họ và tên': s.studentName,
      'Số câu đúng': s.correctCount,
      'Số câu sai': s.incorrectCount,
      'Chưa trả lời': s.unansweredCount,
      'Tỷ lệ đúng (%)': `${s.accuracy}%`,
      'Điểm số': s.score,
    }));
    const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Tổng hợp');

    // SHEET 2: CHI TIẾT CÂU HỎI
    const sheet2Data = questionStats.map((q, idx) => ({
      'Câu số': idx + 1,
      'Nội dung câu hỏi': q.content,
      'Dạng câu': q.type,
      'Đáp án đúng': q.correctAnswer,
      'Số HS đúng': q.correctCount,
      'Số HS sai': q.incorrectCount,
      'Không trả lời': q.unansweredCount,
      'Tỷ lệ đúng (%)': `${q.accuracy}%`,
      'Đánh giá': q.difficultyTagLabel,
    }));
    const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'Chi tiết câu hỏi');

    // SHEET 3: CHI TIẾT THEO HỌC SINH & CÂU HỎI
    const sheet3Data = studentResults.map((s, idx) => {
      const row: Record<string, any> = {
        STT: idx + 1,
        'Họ và tên': s.studentName,
      };

      questionStats.forEach((q, qIdx) => {
        const ans = s.answers[q.questionId];
        row[`Câu ${qIdx + 1}`] = ans ? `${ans.studentAnswer} (${ans.isCorrect ? 'Đúng' : 'Sai'})` : 'Chưa trả lời';
      });

      row['Tổng đúng'] = `${s.correctCount}/${questionStats.length}`;
      row['Tỷ lệ đúng (%)'] = `${s.accuracy}%`;
      row['Điểm'] = s.score;
      return row;
    });
    const ws3 = XLSX.utils.json_to_sheet(sheet3Data);
    XLSX.utils.book_append_sheet(wb, ws3, 'Chi tiết đáp án');

    // Write & Trigger Download
    XLSX.writeFile(wb, fileName);
  }

  // 2. Export UTF-8 BOM CSV (for Windows Excel compatibility)
  public static exportSessionToCSV(sessionDetail: SessionDetailResult): void {
    const { summary, studentResults } = sessionDetail;
    const dateStr = new Date(summary.startedAt).toLocaleDateString('vi-VN').replace(/\//g, '-');
    const safeClassName = this.sanitizeFilename(summary.className);
    const fileName = `Ket_qua_${safeClassName}_${dateStr}.csv`;

    const headers = ['STT', 'Họ và tên', 'Số câu đúng', 'Số câu sai', 'Chưa trả lời', 'Tỷ lệ đúng (%)', 'Điểm số'];
    const rows = studentResults.map((s, idx) => [
      idx + 1,
      `"${s.studentName.replace(/"/g, '""')}"`,
      s.correctCount,
      s.incorrectCount,
      s.unansweredCount,
      `${s.accuracy}%`,
      s.score,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 3. Trigger Print Report
  public static triggerPrintReport(): void {
    window.print();
  }
}
