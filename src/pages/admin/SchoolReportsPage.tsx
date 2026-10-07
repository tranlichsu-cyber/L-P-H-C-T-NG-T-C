import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { SchoolService } from '../../services/school/SchoolService';
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

  type TimeRange = 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_SEMESTER';

  const [timeRange, setTimeRange] = useState<TimeRange>('THIS_MONTH');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [report, setReport] = useState<{
    totalSessions: number;
    totalParticipants: number;
    totalRoster: number;
    avgParticipation: number;
    sharedQuizCount: number;
    subjectStats: Array<{
      subject: string;
      sessions: number;
      quizzes: number;
      totalStudents: number;
      totalRoster: number;
      avgParticipation: number;
    }>;
  }>({
    totalSessions: 0,
    totalParticipants: 0,
    totalRoster: 0,
    avgParticipation: 0,
    sharedQuizCount: 0,
    subjectStats: [],
  });

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    SchoolService.getSchoolUsageReport(timeRange)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err: any) => {
        if (!cancelled) {
          setReport({
            totalSessions: 0,
            totalParticipants: 0,
            totalRoster: 0,
            avgParticipation: 0,
            sharedQuizCount: 0,
            subjectStats: [],
          });
          showToast(err?.message || 'Không thể tải số liệu thống kê thực.', 'error');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [timeRange]);

  const handleExportCSV = () => {
    let csv = 'Môn học,Số buổi Live,Số bộ câu hỏi,Học sinh tham gia,Sĩ số các phòng,Tỷ lệ tham gia\n';
    report.subjectStats.forEach((s) => {
      csv += `"${s.subject}",${s.sessions},${s.quizzes},${s.totalStudents},${s.totalRoster},"${s.avgParticipation}%"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Cap_Truong_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Đã xuất báo cáo CSV từ dữ liệu thực!', 'success');
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
          {(['THIS_WEEK', 'THIS_MONTH', 'THIS_SEMESTER'] as TimeRange[]).map((range) => (
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
            <Radio className="w-8 h-8 text-amber-300" /> {isLoading ? '...' : report.totalSessions} buổi
          </span>
          <p className="text-xs text-sky-100 font-medium">Số buổi Live thực tế trong khoảng thời gian đã chọn</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-700 text-white space-y-2">
          <span className="text-xs font-bold text-indigo-100 uppercase block">Tỷ lệ học sinh tham gia trung bình</span>
          <span className="text-3xl font-black flex items-center gap-2">
            <Award className="w-8 h-8 text-amber-300" /> {isLoading ? '...' : `${report.avgParticipation}%`}
          </span>
          <p className="text-xs text-indigo-100 font-medium">
            {isLoading ? 'Đang tính từ dữ liệu phòng học...' : `${report.totalParticipants}/${report.totalRoster} lượt tham gia theo sĩ số phòng`}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-700 text-white space-y-2">
          <span className="text-xs font-bold text-emerald-100 uppercase block">Ngân hàng câu hỏi chung</span>
          <span className="text-3xl font-black flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-amber-300" /> {isLoading ? '...' : report.sharedQuizCount} bộ câu hỏi
          </span>
          <p className="text-xs text-emerald-100 font-medium">Bộ câu hỏi TEAM/SCHOOL được tạo trong khoảng thời gian đã chọn</p>
        </Card>
      </div>

      {/* SUBJECT STATS TABLE */}
      <Card className="overflow-hidden border-2 border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" /> BẢNG THỐNG KÊ THEO MÔN HỌC
          </h3>
          <Badge variant="info">Tổng cộng {report.subjectStats.length} bộ môn</Badge>
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    Đang tải số liệu thực từ Firestore...
                  </td>
                </tr>
              ) : report.subjectStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    Chưa có dữ liệu dạy học trong khoảng thời gian đã chọn.
                  </td>
                </tr>
              ) : (
                report.subjectStats.map((s) => (
                  <tr key={s.subject} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{s.subject}</td>
                    <td className="p-4 text-center font-bold text-sky-700">{s.sessions} buổi</td>
                    <td className="p-4 text-center font-semibold text-slate-700">{s.quizzes} bộ</td>
                    <td className="p-4 text-center font-semibold text-slate-700">{s.totalStudents} em</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                        {s.avgParticipation}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
