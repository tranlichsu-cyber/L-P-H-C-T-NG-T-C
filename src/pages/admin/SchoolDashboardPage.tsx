import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SchoolService } from '../../services/school/SchoolService';
import type { School } from '../../services/school/types';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Users,
  UserCheck,
  Radio,
  BarChart3,
  ShieldCheck,
  Award,
  UserPlus,
  RefreshCw,
} from 'lucide-react';

export const SchoolDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [school, setSchool] = useState<School | null>(null);
  const [metrics, setMetrics] = useState<{
    activeTeacherCount: number;
    totalClassesCount: number;
    totalStudentsCount: number;
    monthlyRoomsCount: number;
    sharedQuizCount: number;
  }>({
    activeTeacherCount: 0,
    totalClassesCount: 0,
    totalStudentsCount: 0,
    monthlyRoomsCount: 0,
    sharedQuizCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      SchoolService.getSchool(),
      SchoolService.getSchoolDashboardMetrics(),
    ])
      .then(([s, m]) => {
        setSchool(s);
        setMetrics(m);
      })
      .catch(() => showToast('Lỗi khi tải dữ liệu Quản trị trường.', 'error'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Card className="p-12 text-center text-slate-500 space-y-2">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600" />
        <p className="font-bold text-sm">Đang tải Bảng điều khiển Quản trị Cấp trường...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* School Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl border-2 border-sky-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">Mã trường: {school?.code || 'SC2026'}</Badge>
              <Badge variant="info">Năm học: {school?.academicYear || '2026-2027'}</Badge>
            </div>
            <h1 className="text-2xl font-black text-amber-400 uppercase tracking-wide">
              {school?.name || 'Trường Tiểu học Sông Công'}
            </h1>
            <p className="text-xs text-sky-200 font-medium">
              Bảng điều khiển Quản trị Cấp trường dành cho Ban Giám hiệu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="warning" size="md" onClick={() => navigate('/admin/teachers')} className="font-bold text-slate-950">
            <Users className="w-4 h-4 mr-1" /> QUẢN LÝ GIÁO VIÊN
          </Button>
          <Button variant="outline" size="md" onClick={() => navigate('/admin/teams')} className="text-white border-white/30 hover:bg-white/10 font-bold">
            <Building2 className="w-4 h-4 mr-1" /> TỔ CHUYÊN MÔN
          </Button>
        </div>
      </div>

      {/* OVERVIEW CARDS METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Giáo viên hoạt động</span>
          <span className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <UserCheck className="w-6 h-6 text-sky-600" /> {metrics.activeTeacherCount} thầy/cô
          </span>
        </Card>

        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Tổng số lớp học</span>
          <span className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <Users className="w-6 h-6 text-indigo-600" /> {metrics.totalClassesCount} lớp
          </span>
        </Card>

        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Tổng số học sinh</span>
          <span className="text-2xl font-black text-emerald-600 flex items-center gap-2 mt-1">
            <Award className="w-6 h-6" /> {metrics.totalStudentsCount} em
          </span>
        </Card>

        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Phòng dạy Live tháng này</span>
          <span className="text-2xl font-black text-amber-500 flex items-center gap-2 mt-1">
            <Radio className="w-6 h-6" /> {metrics.monthlyRoomsCount} buổi
          </span>
        </Card>
      </div>

      {/* QUICK ADMIN NAVIGATION GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card
          className="p-6 border-2 border-slate-200 hover:border-sky-500 transition-all cursor-pointer space-y-3 bg-white"
          onClick={() => navigate('/admin/teachers')}
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-base">QUẢN LÝ GIÁO VIÊN & PHÂN QUYỀN</h3>
          <p className="text-xs text-slate-500 font-medium">
            Phân vai trò (Admin, Tổ trưởng, Giáo viên), phân tổ chuyên môn và quản lý trạng thái truy cập.
          </p>
        </Card>

        <Card
          className="p-6 border-2 border-slate-200 hover:border-sky-500 transition-all cursor-pointer space-y-3 bg-white"
          onClick={() => navigate('/admin/teams')}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-base">TỔ CHUYÊN MÔN</h3>
          <p className="text-xs text-slate-500 font-medium">
            Tạo và quản lý danh sách các Tổ chuyên môn (Tổ 1, Tổ 4-5, Tổ Tin học...) và phân bổ Tổ trưởng.
          </p>
        </Card>

        <Card
          className="p-6 border-2 border-slate-200 hover:border-sky-500 transition-all cursor-pointer space-y-3 bg-white"
          onClick={() => navigate('/admin/requests')}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-base">DUYỆT YÊU CẦU THAM GIA</h3>
          <p className="text-xs text-slate-500 font-medium">
            Xem và phê duyệt danh sách Giáo viên mới gửi yêu cầu gia nhập trường.
          </p>
        </Card>

        <Card
          className="p-6 border-2 border-slate-200 hover:border-sky-500 transition-all cursor-pointer space-y-3 bg-white"
          onClick={() => navigate('/admin/reports')}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-base">THỐNG KÊ SỬ DỤNG CẤP TRƯỜNG</h3>
          <p className="text-xs text-slate-500 font-medium">
            Báo cáo mức độ sử dụng ứng dụng theo môn học, khối lớp và thời gian (Không lộ dữ liệu nhạy cảm).
          </p>
        </Card>

        <Card
          className="p-6 border-2 border-slate-200 hover:border-sky-500 transition-all cursor-pointer space-y-3 bg-white"
          onClick={() => navigate('/admin/logs')}
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-base">NHẬT KÝ HỆ THỐNG (AUDIT LOGS)</h3>
          <p className="text-xs text-slate-500 font-medium">
            Nhật ký minh bạch ghi lại các thao tác thay đổi quyền, đổi trạng thái giáo viên của Ban Giám hiệu.
          </p>
        </Card>
      </div>
    </div>
  );
};
