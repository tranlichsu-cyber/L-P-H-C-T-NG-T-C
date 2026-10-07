import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  BarChart3,
  ArrowLeft,
  Calendar,
  BookOpen,
  Award,
  Radio,
  FileSpreadsheet,
  Plus,
  HeartHandshake,
} from 'lucide-react';

export const SchoolReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [timeRange, setTimeRange] = useState<string>('THIS_MONTH');

  const mockSubjectStats = [
    { subject: 'Toán học', sessions: 22, quizzes: 18, totalStudents: 340, avgParticipation: '94%' },
    { subject: 'Tiếng Việt', sessions: 15, quizzes: 14, totalStudents: 310, avgParticipation: '91%' },
    { subject: 'Tự nhiên & Xã hội', sessions: 12, quizzes: 10, totalStudents: 280, avgParticipation: '89%' },
    { subject: 'Tiếng Anh', sessions: 10, quizzes: 8, totalStudents: 250, avgParticipation: '92%' },
    { subject: 'Tin học', sessions: 8, quizzes: 6, totalStudents: 200, avgParticipation: '96%' },
  ];

  const handleExportCSV = () => {
    let csv = 'Môn học,Số buổi Live,Số bộ câu hỏi,Học sinh tham gia,Tỷ lệ tương tác\n';
    mockSubjectStats.forEach((s) => {
      csv += `"${s.subject}",${s.sessions},${s.quizzes},${s.totalStudents},"${s.avgParticipation}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Cap_Truong_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất báo cáo CSV cấp trường thành công!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Về Bảng quản trị
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="THỐNG KÊ SỬ DỤNG CẤP TRƯỜNG v1.1"
          description="Báo cáo tổng hợp mức độ tương tác và ứng dụng CNTT trong giảng dạy (Không lưu trữ thông tin nhạy cảm)"
        />

        {/* REPORT ACTION SHORTCUTS (v1.1 IMP-05) */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate('/teacher/practice/new')}
            className="font-bold text-xs bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50"
          >
            <HeartHandshake className="w-4 h-4 mr-1" /> TẠO BÀI CỦNG CỐ
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/teacher/quizzes')}
            className="font-bold text-xs bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            <Plus className="w-4 h-4 mr-1" /> TẠO QUIZ MỚI
          </Button>
          <Button variant="success" onClick={handleExportCSV} className="font-bold text-white text-xs">
            <FileSpreadsheet className="w-4 h-4 mr-1" /> XUẤT EXCEL / CSV
          </Button>
        </div>
      </div>

      {/* TIME RANGE SELECTOR */}
      <Card className="p-4 bg-white border-2 border-slate-200 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-600" />
          <span className="font-bold text-slate-800 text-sm">Khoảng thời gian báo cáo:</span>
        </div>
        <div className="flex items-center gap-2">
          {['THIS_WEEK', 'THIS_MONTH', 'THIS_SEMESTER'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === range
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {range === 'THIS_WEEK'
                ? 'Tuần này'
                : range === 'THIS_MONTH'
                ? 'Tháng này'
                : 'Học kỳ I'}
            </button>
          ))}
        </div>
      </Card>

      {/* HIGHLIGHT SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-sky-500 to-blue-700 text-white space-y-2">
          <span className="text-xs font-bold text-sky-100 uppercase block">Tổng số buổi dạy tương tác</span>
          <span className="text-3xl font-black flex items-center gap-2">
            <Radio className="w-8 h-8 text-amber-300" /> 67 buổi
          </span>
          <p className="text-xs text-sky-100 font-medium">+15% so với tháng trước</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-700 text-white space-y-2">
          <span className="text-xs font-bold text-indigo-100 uppercase block">Tỷ lệ học sinh tham gia trung bình</span>
          <span className="text-3xl font-black flex items-center gap-2">
            <Award className="w-8 h-8 text-amber-300" /> 92.4%
          </span>
          <p className="text-xs text-indigo-100 font-medium">Mức độ hào hứng tích cực cao</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-700 text-white space-y-2">
          <span className="text-xs font-bold text-emerald-100 uppercase block">Ngân hàng câu hỏi chung</span>
          <span className="text-3xl font-black flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-amber-300" /> 56 bộ câu hỏi
          </span>
          <p className="text-xs text-emerald-100 font-medium">Chia sẻ toàn trường & các Tổ chuyên môn</p>
        </Card>
      </div>

      {/* SUBJECT STATS TABLE */}
      <Card className="overflow-hidden border-2 border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" /> BẢNG THỐNG KÊ THEO MÔN HỌC
          </h3>
          <Badge variant="info">Tổng cộng 5 bộ môn</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase">
                <th className="p-4">MÔN HỌC</th>
                <th className="p-4 text-center">SỐ BUỔI INTERACTIVE LIVE</th>
                <th className="p-4 text-center">SỐ BỘ CÂU HỎI ĐÃ TẠO</th>
                <th className="p-4 text-center">HỌC SINH TƯƠNG TÁC</th>
                <th className="p-4 text-center">TỶ LỆ PHẢN HỒI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {mockSubjectStats.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{s.subject}</td>
                  <td className="p-4 text-center font-bold text-sky-700">{s.sessions} buổi</td>
                  <td className="p-4 text-center font-semibold text-slate-700">{s.quizzes} bộ</td>
                  <td className="p-4 text-center font-semibold text-slate-700">{s.totalStudents} em</td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                      {s.avgParticipation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
