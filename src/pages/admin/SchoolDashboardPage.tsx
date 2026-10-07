import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { SchoolService } from '../../services/school/SchoolService';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SCHOOL_LOGO_SRC } from '../../assets/schoolLogo';
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
  Upload,
  Camera,
  Check,
} from 'lucide-react';

const PRESET_LOGOS = [
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=200&q=80',
];

export const SchoolDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const { school, logoUrl, updateLogo } = useSchool();

  const actor = {
    uid: currentUser?.uid || 'admin-current',
    name: currentUser?.displayName || currentUser?.email || 'Quản trị trường',
  };

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
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);

  // Logo Modal state
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<boolean>(false);
  const [selectedLogo, setSelectedLogo] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isSavingLogo, setIsSavingLogo] = useState<boolean>(false);

  useEffect(() => {
    setIsLoadingMetrics(true);
    SchoolService.getSchoolDashboardMetrics()
      .then((m) => setMetrics(m))
      .catch(() => showToast('Lỗi khi tải dữ liệu Quản trị trường.', 'error'))
      .finally(() => setIsLoadingMetrics(false));
  }, []);

  const handleOpenLogoModal = () => {
    setSelectedLogo(logoUrl || '');
    setUrlInput(logoUrl || '');
    setIsLogoModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, SVG).', 'error');
      return;
    }

    if (file.size > 500 * 1024) {
      showToast('Ảnh logo tải trực tiếp phải nhỏ hơn 500 KB để lưu an toàn trên Firestore. Với ảnh lớn hơn, hãy dùng URL ảnh.', 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedLogo(reader.result);
        setUrlInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    const finalUrl = selectedLogo.trim() || urlInput.trim();
    setIsSavingLogo(true);
    try {
      await updateLogo(finalUrl, actor);
      showToast('Cập nhật logo trường thành công!', 'success');
      setIsLogoModalOpen(false);
    } catch (err: any) {
      showToast('Lỗi khi cập nhật logo: ' + (err.message || 'Thất bại'), 'error');
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setIsSavingLogo(true);
    try {
      await updateLogo('', actor);
      setSelectedLogo('');
      setUrlInput('');
      showToast('Đã xóa logo trường, sử dụng biểu tượng mặc định.', 'info');
      setIsLogoModalOpen(false);
    } catch (err: any) {
      showToast('Lỗi khi xóa logo: ' + err.message, 'error');
    } finally {
      setIsSavingLogo(false);
    }
  };

  if (isLoadingMetrics) {
    return (
      <Card className="p-12 text-center text-slate-500 space-y-2">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600" />
        <p className="font-bold text-sm">Đang tải Bảng điều khiển Quản trị Cấp trường...</p>
      </Card>
    );
  }

  const activeBannerLogo = logoUrl || SCHOOL_LOGO_SRC;

  return (
    <div className="space-y-6">
      {/* School Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl border-2 border-sky-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-3xl shadow-lg overflow-hidden border-2 border-amber-300">
              {activeBannerLogo ? (
                <img
                  src={activeBannerLogo}
                  alt={school?.name || 'School Logo'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-10 h-10" />
              )}
            </div>
            <button
              onClick={handleOpenLogoModal}
              className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1 cursor-pointer"
              title="Thay đổi logo trường"
            >
              <Camera className="w-5 h-5 text-amber-400" />
              <span>Đổi logo</span>
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
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
          <Button
            variant="outline"
            size="md"
            onClick={handleOpenLogoModal}
            className="text-amber-300 border-amber-400/50 hover:bg-amber-400/10 font-bold"
          >
            <Camera className="w-4 h-4 mr-1" /> ĐỔI LOGO TRƯỜNG
          </Button>
          <Button
            variant="warning"
            size="md"
            onClick={() => navigate('/admin/teachers')}
            className="font-bold text-slate-950 shadow-lg shadow-amber-500/20"
          >
            <Users className="w-4 h-4 mr-1" /> QUẢN LÝ GIÁO VIÊN
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/teams')}
            className="font-black bg-gradient-to-r from-violet-500 to-fuchsia-500 border-violet-400 shadow-lg shadow-violet-500/20"
          >
            <Building2 className="w-4 h-4 mr-1" /> TỔ CHUYÊN MÔN
          </Button>
        </div>
      </div>

      {/* OVERVIEW CARDS METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">Giáo viên hoạt động</span>
          <span className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <UserCheck className="w-6 h-6 text-sky-600" /> {metrics.activeTeacherCount} thầy/cô
          </span>
        </Card>

        <Card className="p-4 border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">Tổng số lớp học</span>
          <span className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <Users className="w-6 h-6 text-indigo-600" /> {metrics.totalClassesCount} lớp
          </span>
        </Card>

        <Card className="p-4 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">Tổng số học sinh</span>
          <span className="text-2xl font-black text-emerald-600 flex items-center gap-2 mt-1">
            <Award className="w-6 h-6" /> {metrics.totalStudentsCount} em
          </span>
        </Card>

        <Card className="p-4 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">Phòng dạy Live tháng này</span>
          <span className="text-2xl font-black text-amber-500 flex items-center gap-2 mt-1">
            <Radio className="w-6 h-6" /> {metrics.monthlyRoomsCount} buổi
          </span>
        </Card>
      </div>

      {/* QUICK ADMIN NAVIGATION GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card
          className="p-6 border-2 border-sky-200 hover:border-sky-500 transition-all cursor-pointer space-y-3 bg-gradient-to-br from-sky-50 via-white to-sky-100/60 hover:-translate-y-1 hover:shadow-lg"
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
          className="p-6 border-2 border-violet-200 hover:border-violet-500 transition-all cursor-pointer space-y-3 bg-gradient-to-br from-violet-50 via-white to-violet-100/60 hover:-translate-y-1 hover:shadow-lg"
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
          className="p-6 border-2 border-amber-200 hover:border-amber-500 transition-all cursor-pointer space-y-3 bg-gradient-to-br from-amber-50 via-white to-orange-100/60 hover:-translate-y-1 hover:shadow-lg"
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
          className="p-6 border-2 border-emerald-200 hover:border-emerald-500 transition-all cursor-pointer space-y-3 bg-gradient-to-br from-emerald-50 via-white to-teal-100/60 hover:-translate-y-1 hover:shadow-lg"
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
          className="p-6 border-2 border-rose-200 hover:border-rose-500 transition-all cursor-pointer space-y-3 bg-gradient-to-br from-rose-50 via-white to-pink-100/60 hover:-translate-y-1 hover:shadow-lg"
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

      {/* LOGO UPLOAD MODAL */}
      <Modal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        title="Tải lên & Thay đổi Logo Trường"
        footer={
          <div className="flex items-center justify-between w-full">
            {logoUrl ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveLogo}
                disabled={isSavingLogo}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
              >
                Xóa Logo
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLogoModalOpen(false)}
                disabled={isSavingLogo}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveLogo}
                disabled={isSavingLogo || (!selectedLogo && !urlInput)}
                className="font-bold"
              >
                {isSavingLogo ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Cập nhật Logo
                  </>
                )}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Current / Preview Box */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-20 h-20 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-3xl shadow-sm shrink-0 overflow-hidden border border-amber-300">
              {selectedLogo || urlInput ? (
                <img
                  src={selectedLogo || urlInput}
                  alt="Preview Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Building2 className="w-10 h-10" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Xem trước Logo</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Logo mới sẽ tự động đồng bộ ngay lập tức lên Thanh điều hướng và Banner Quản trị.
              </p>
            </div>
          </div>

          {/* Option 1: File Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tải ảnh từ máy tính (PNG, JPG, SVG)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-sky-300 rounded-2xl cursor-pointer bg-sky-50/50 hover:bg-sky-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-3 pb-4">
                  <Upload className="w-6 h-6 text-sky-600 mb-1" />
                  <p className="text-xs font-bold text-sky-900">Bấm để chọn hình ảnh logo</p>
                  <p className="text-[11px] text-slate-500">Khuyên dùng ảnh vuông 200x200px (tối đa 500 KB khi tải trực tiếp)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Option 2: Image URL Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Hoặc nhập đường dẫn URL ảnh
            </label>
            <Input
              type="text"
              placeholder="https://domain.com/logo.png"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setSelectedLogo(e.target.value);
              }}
            />
          </div>

          {/* Option 3: Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Hoặc chọn logo mẫu có sẵn
            </label>
            <div className="flex items-center gap-3">
              {PRESET_LOGOS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedLogo(url);
                    setUrlInput(url);
                  }}
                  className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                    (selectedLogo === url || urlInput === url)
                      ? 'border-sky-600 ring-2 ring-sky-300 scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
