import React from 'react';
import type { SessionDetailResult } from '../../services/history/types';

interface PrintReportViewProps {
  sessionDetail: SessionDetailResult;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({ sessionDetail }) => {
  const { summary, questionStats, studentResults } = sessionDetail;
  const dateFormatted = new Date(summary.startedAt).toLocaleDateString('vi-VN');

  return (
    <div className="hidden print:block p-8 bg-white text-black text-sm font-sans space-y-6">
      {/* Printable Header */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider">BÁO CÁO KẾT QUẢ BUỔI HỌC LIVE</h1>
          <p className="text-xs text-slate-600 mt-1">Ứng dụng Lớp Học Tương Tác • Ngày dạy: {dateFormatted}</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold">{summary.className} • Môn {summary.subject}</p>
          <p className="text-slate-600">Khối: {summary.grade} | Sĩ số: {summary.participantCount} học sinh</p>
        </div>
      </div>

      {/* Session Summary Snapshot */}
      <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg bg-slate-50 text-center">
        <div>
          <span className="text-xs text-slate-500 block">Bộ đề câu hỏi</span>
          <span className="font-bold text-slate-900">{summary.quizTitle}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">Số câu hỏi</span>
          <span className="font-bold text-slate-900">{summary.questionCount} câu</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">Tỷ lệ chính xác TB</span>
          <span className="font-bold text-emerald-700">{summary.averageAccuracy}%</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">Tổng điểm phát ra</span>
          <span className="font-bold text-slate-900">{summary.totalScoreAwarded} điểm</span>
        </div>
      </div>

      {/* Section 1: Student Results */}
      <div>
        <h2 className="font-bold text-base mb-2 border-b pb-1">1. BẢNG TỔNG HỢP KẾT QUẢ HỌC SINH</h2>
        <table className="w-full text-left border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-2 font-bold w-12 text-center">STT</th>
              <th className="border border-slate-300 p-2 font-bold">Họ và tên học sinh</th>
              <th className="border border-slate-300 p-2 font-bold text-center">Số câu đúng</th>
              <th className="border border-slate-300 p-2 font-bold text-center">Số câu sai</th>
              <th className="border border-slate-300 p-2 font-bold text-center">Chưa trả lời</th>
              <th className="border border-slate-300 p-2 font-bold text-center">Tỷ lệ đúng</th>
              <th className="border border-slate-300 p-2 font-bold text-center">Điểm số</th>
            </tr>
          </thead>
          <tbody>
            {studentResults.map((s, idx) => (
              <tr key={s.studentId}>
                <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                <td className="border border-slate-300 p-2 font-medium">{s.studentName}</td>
                <td className="border border-slate-300 p-2 text-center text-emerald-700 font-bold">{s.correctCount}</td>
                <td className="border border-slate-300 p-2 text-center text-rose-700">{s.incorrectCount}</td>
                <td className="border border-slate-300 p-2 text-center text-slate-500">{s.unansweredCount}</td>
                <td className="border border-slate-300 p-2 text-center font-bold">{s.accuracy}%</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-sky-800">{s.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Question Analysis */}
      <div>
        <h2 className="font-bold text-base mb-2 border-b pb-1">2. PHÂN TÍCH KẾT QUẢ THEO CÂU HỎI</h2>
        <div className="space-y-3">
          {questionStats.map((q, idx) => (
            <div key={q.questionId} className="border border-slate-300 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-bold">
                <span>Câu {idx + 1}: {q.content}</span>
                <span>Tỷ lệ đúng: {q.accuracy}% ({q.difficultyTagLabel})</span>
              </div>
              <div className="text-slate-600">
                Đáp án đúng: <strong>{q.correctAnswer}</strong> | Đúng: {q.correctCount} HS | Sai: {q.incorrectCount} HS | Chưa trả lời: {q.unansweredCount} HS
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Signature Block */}
      <div className="pt-8 flex justify-between items-end text-xs">
        <div>
          <p className="text-slate-500">Báo cáo được khởi tạo tự động từ hệ thống Lớp Học Tương Tác</p>
        </div>
        <div className="text-center font-bold space-y-12">
          <p>Giáo viên bộ môn / Chủ nhiệm</p>
          <p className="text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  );
};
