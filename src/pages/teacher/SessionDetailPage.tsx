import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { HistoryService } from '../../services/history/HistoryService';
import { ReportExportService } from '../../services/history/ReportExportService';
import type { SessionDetailResult, StudentSessionResult } from '../../services/history/types';
import { PrintReportView } from '../../components/teacher/PrintReportView';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Printer,
  Users,
  CheckCircle2,
  AlertCircle,
  Award,
  HelpCircle,
  UserCheck,
  HeartHandshake,
  BarChart3,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const SessionDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sessionDetail, setSessionDetail] = useState<SessionDetailResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'students' | 'support'>('questions');
  const [selectedStudent, setSelectedStudent] = useState<StudentSessionResult | null>(null);

  useEffect(() => {
    if (!roomId) return;
    setIsLoading(true);
    HistoryService.getSessionDetail(roomId)
      .then((res) => {
        if (res) {
          setSessionDetail(res);
        } else {
          showToast('Không tìm thấy dữ liệu chi tiết của buổi học.', 'error');
        }
      })
      .catch(() => showToast('Lỗi khi tải chi tiết buổi học.', 'error'))
      .finally(() => setIsLoading(false));
  }, [roomId]);

  if (isLoading) {
    return (
      <Card className="p-12 text-center text-slate-500 space-y-3">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600" />
        <p className="font-bold text-sm">Đang tải báo cáo chi tiết buổi học...</p>
      </Card>
    );
  }

  if (!sessionDetail) {
    return (
      <Card className="p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="font-bold text-lg text-slate-800">Không tìm thấy báo cáo buổi học này</h3>
        <Button variant="outline" onClick={() => navigate('/teacher/history')}>
          Quay lại Lịch sử
        </Button>
      </Card>
    );
  }

  const { summary, questionStats, studentResults, studentsNeedingSupport } = sessionDetail;
  const dateFormatted = new Date(summary.startedAt).toLocaleDateString('vi-VN');

  return (
    <div className="space-y-6">
      {/* SCREEN VIEW ONLY (Hidden during Print) */}
      <div className="print:hidden space-y-6">
        {/* Header & Export Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/history')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Quay lại Lịch sử"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary">{summary.className}</Badge>
                <Badge variant="neutral">Môn {summary.subject}</Badge>
                <span className="text-xs text-slate-500 font-semibold">{dateFormatted}</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 mt-1">
                {summary.quizTitle || 'Báo cáo chi tiết buổi học'}
              </h1>
            </div>
          </div>

          {/* Export & Print Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => ReportExportService.exportSessionToExcel(sessionDetail)}
              className="font-bold text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-600" /> Xuất Excel (.xlsx)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => ReportExportService.exportSessionToCSV(sessionDetail)}
              className="font-bold text-sky-800 border-sky-300 bg-sky-50 hover:bg-sky-100"
            >
              <FileText className="w-4 h-4 mr-1 text-sky-600" /> Xuất CSV
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => ReportExportService.triggerPrintReport()}
              className="font-bold"
            >
              <Printer className="w-4 h-4 mr-1" /> IN BÁO CÁO / XUẤT PDF
            </Button>
          </div>
        </div>

        {/* OVERVIEW CARDS SNAPSHOT */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-2 border-slate-200 bg-white">
            <span className="text-xs font-bold text-slate-500 block">Học sinh tham gia</span>
            <span className="text-2xl font-black text-slate-900 flex items-center gap-1.5 mt-1">
              <Users className="w-6 h-6 text-sky-600" /> {summary.participantCount} em
            </span>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-white">
            <span className="text-xs font-bold text-slate-500 block">Tổng số câu hỏi</span>
            <span className="text-2xl font-black text-slate-900 flex items-center gap-1.5 mt-1">
              <HelpCircle className="w-6 h-6 text-indigo-600" /> {summary.questionCount} câu
            </span>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-white">
            <span className="text-xs font-bold text-slate-500 block">Tỷ lệ chính xác TB</span>
            <span
              className={`text-2xl font-black flex items-center gap-1.5 mt-1 ${
                summary.averageAccuracy >= 80
                  ? 'text-emerald-600'
                  : summary.averageAccuracy >= 50
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              <CheckCircle2 className="w-6 h-6" /> {summary.averageAccuracy}%
            </span>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-white">
            <span className="text-xs font-bold text-slate-500 block">Tổng điểm phát ra</span>
            <span className="text-2xl font-black text-amber-500 flex items-center gap-1.5 mt-1">
              <Award className="w-6 h-6" /> {summary.totalScoreAwarded} điểm
            </span>
          </Card>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'questions'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> PHÂN TÍCH THEO CÂU HỎI ({questionStats.length})
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'students'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" /> KẾT QUẢ HỌC SINH ({studentResults.length})
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'support'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-amber-500" /> CẦN QUAN TÂM THÊM ({studentsNeedingSupport.length})
          </button>
        </div>

        {/* TAB 1: QUESTION ANALYSIS */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {questionStats.map((q, idx) => (
              <Card key={q.questionId} className="p-5 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sky-700 text-sm">Câu {idx + 1}</span>
                    <Badge variant="info" size="sm">{q.type}</Badge>
                    <Badge
                      variant={
                        q.difficultyTag === 'EXCELLENT'
                          ? 'success'
                          : q.difficultyTag === 'REINFORCE'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {q.difficultyTagLabel}
                    </Badge>
                  </div>

                  <span className="text-xs font-bold text-slate-600">
                    Tỷ lệ đúng: <strong className="text-emerald-600 text-sm">{q.accuracy}%</strong>
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base">{q.content}</h4>

                {/* Question Options Breakdown */}
                {q.options && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isCorrect = q.correctAnswer === letter;
                      const count = q.optionDistribution[letter] || 0;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border flex justify-between items-center ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span><strong>{letter}.</strong> {opt}</span>
                          <span className="px-2 py-0.5 rounded-full bg-white text-slate-800 font-black text-xs border">
                            {count} HS
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Submissions Stats Bar */}
                <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center text-slate-700">
                  <div>
                    <strong>Đáp án đúng chuẩn:</strong> <span className="text-emerald-700 font-bold">{q.correctAnswer}</span>
                    {q.explanation && <span className="ml-2 text-slate-500">({q.explanation})</span>}
                  </div>
                  <div className="flex items-center gap-4 font-semibold">
                    <span className="text-emerald-700">Đúng: <strong>{q.correctCount}</strong></span>
                    <span className="text-rose-600">Sai: <strong>{q.incorrectCount}</strong></span>
                    <span className="text-slate-500">Chưa trả lời: <strong>{q.unansweredCount}</strong></span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 2: STUDENT RESULTS */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <Card className="p-0 overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-12 text-center">STT</th>
                      <th className="p-3">Họ và tên học sinh</th>
                      <th className="p-3 text-center">Số câu đúng</th>
                      <th className="p-3 text-center">Số câu sai</th>
                      <th className="p-3 text-center">Chưa trả lời</th>
                      <th className="p-3 text-center">Tỷ lệ đúng</th>
                      <th className="p-3 text-center">Điểm số</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {studentResults.map((std, idx) => (
                      <tr key={std.studentId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{std.studentName}</td>
                        <td className="p-3 text-center font-bold text-emerald-600">{std.correctCount}</td>
                        <td className="p-3 text-center text-rose-600">{std.incorrectCount}</td>
                        <td className="p-3 text-center text-slate-400">{std.unansweredCount}</td>
                        <td className="p-3 text-center font-bold">
                          <span
                            className={
                              std.accuracy >= 80 ? 'text-emerald-600' : std.accuracy >= 50 ? 'text-amber-600' : 'text-rose-600'
                            }
                          >
                            {std.accuracy}%
                          </span>
                        </td>
                        <td className="p-3 text-center font-black text-sky-700">{std.score} đ</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedStudent(std)}
                            className="px-2.5 py-1 bg-sky-100 text-sky-800 hover:bg-sky-200 rounded-lg font-bold transition-all inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: STUDENTS NEEDING SUPPORT */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <Card className="bg-amber-50 border-2 border-amber-300 p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">GỢI Ý HỌC SINH CẦN QUAN TÂM THÊM</h3>
                  <p className="text-xs text-amber-900 font-medium">
                    Danh sách các em có tỷ lệ trả lời đúng dưới 50% hoặc bỏ qua nhiều câu hỏi trong buổi học này để Thầy/Cô hỗ trợ riêng.
                  </p>
                </div>
              </div>

              {studentsNeedingSupport.length === 0 ? (
                <div className="p-4 bg-white rounded-xl border text-xs text-center font-bold text-emerald-700">
                  🎉 Buổi học này tất cả học sinh đều đạt kết quả tốt từ 50% trở lên!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {studentsNeedingSupport.map((std) => (
                    <div key={std.studentId} className="p-4 bg-white rounded-xl border border-amber-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">{std.studentName}</span>
                        <Badge variant="warning" size="sm">Đúng {std.accuracy}%</Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        Làm đúng: <strong>{std.correctCount}/{summary.questionCount}</strong> câu • Chưa trả lời: <strong>{std.unansweredCount}</strong> câu
                      </p>
                      <button
                        onClick={() => setSelectedStudent(std)}
                        className="text-xs font-bold text-sky-600 hover:underline inline-block"
                      >
                        Xem chi tiết từng câu nộp →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* STUDENT INDIVIDUAL RESULT MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">{selectedStudent.studentName}</h3>
                <p className="text-xs text-slate-500 font-medium">Chi tiết bài làm buổi học này</p>
              </div>
              <Badge variant="primary">{selectedStudent.score} điểm</Badge>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1 text-xs">
              {questionStats.map((q, idx) => {
                const ans = selectedStudent.answers[q.questionId];
                const isCorrect = ans?.isCorrect;
                return (
                  <div
                    key={q.questionId}
                    className={`p-3 rounded-xl border ${
                      isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 mb-1">
                      Câu {idx + 1}: {q.content}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Đáp án của em: <strong>{ans?.studentAnswer || '—'}</strong></span>
                      <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isCorrect ? '✓ Đúng' : '✗ Chưa đúng'} (Đáp án đúng: {q.correctAnswer})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CSS PRINT COMPONENT (Only rendered during window.print()) */}
      <PrintReportView sessionDetail={sessionDetail} />
    </div>
  );
};
