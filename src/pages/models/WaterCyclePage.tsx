import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, BookOpen, Sparkles, Droplets, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { WaterCycleDiorama } from '../../components/models/WaterCycleDiorama';
import { SCHOOL_LOGO_SRC } from '../../assets/schoolLogo';
import { useSchool } from '../../context/SchoolContext';

export const WaterCyclePage: React.FC = () => {
  const navigate = useNavigate();
  const { logoUrl, settings } = useSchool();
  const schoolName = settings.displayName || settings.schoolName || 'TRƯỜNG TIỂU HỌC SÔNG CÔNG';
  const currentLogo = logoUrl || SCHOOL_LOGO_SRC;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/mo-hinh')}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold border border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kho Mô hình & Sa bàn</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-bold border border-slate-700"
            title="Về Trang chủ"
          >
            <Home className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <img src={currentLogo} alt="Logo" className="h-8 w-8 object-contain" />
          <span className="text-xs font-black tracking-wide text-slate-200 hidden md:inline">
            {schoolName.toUpperCase()}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <Droplets className="h-3.5 w-3.5" />
              <span>Kho Mô hình & Sa bàn</span>
              <span>•</span>
              <span>Môn Khoa học 4</span>
              <span>•</span>
              <span>Bài 2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Mô hình 3D Vòng tuần hoàn của nước trong tự nhiên
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Trải nghiệm mô phỏng 3D thời gian thực: Đại dương bốc hơi, mây ngưng tụ, mưa rào trên núi rừng và mạch nước ngầm luân chuyển liên tục.
            </p>
          </div>

          <a
            href="/models/vong-tuan-hoan-nuoc-3d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-sky-500/20 shrink-0 self-start md:self-center transition transform hover:scale-105"
          >
            <span>Mở Mô hình 3D Độc Lập</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* The Interactive Diorama */}
        <WaterCycleDiorama />

        {/* Educational Objectives Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="h-4 w-4" />
              <span>Sự chuyển thể của nước</span>
            </div>
            <h3 className="text-sm font-bold text-white">3 Thể biến đổi linh hoạt</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hiểu rõ điều kiện nhiệt độ khiến nước chuyển thể: Bay hơi (lỏng ➔ khí), ngưng tụ (khí ➔ lỏng), đông đặc (lỏng ➔ rắn) và nóng chảy (rắn ➔ lỏng).
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Quy luật tuần hoàn tự nhiên</span>
            </div>
            <h3 className="text-sm font-bold text-white">Chu trình khép kín vô tận</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nước trên Trái Đất không mất đi mà luân chuyển không ngừng từ biển vào mây, mưa xuống mặt đất và ngấm thành nước ngầm chảy lại về biển.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Ý thức bảo vệ môi trường</span>
            </div>
            <h3 className="text-sm font-bold text-white">Giữ gìn nguồn nước sạch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nhận thức tầm quan trọng sống còn của nước sạch, thực hành tiết kiệm nước hàng ngày và không xả rác, chất thải gây ô nhiễm sông ngòi, ao hồ.
            </p>
          </div>
        </section>

        {/* Quick Links to QR Cards & Games */}
        <section className="bg-gradient-to-r from-amber-950/60 to-slate-900/80 rounded-3xl p-5 sm:p-6 border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-black text-white tracking-tight">Tiếp theo: Củng cố bài học</h3>
            <span className="text-xs text-slate-400">Chuyển ngay sang thực hành tương tác</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Button 1: QR Cards */}
            <a href="/qr-bank" className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-amber-500/50 hover:bg-amber-950/30 transition-all duration-200">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-2xl shrink-0 group-hover:bg-amber-500/20 transition">🃏</div>
              <div>
                <div className="text-sm font-bold text-white">Thẻ QR bài học này</div>
                <div className="text-xs text-slate-400 leading-snug">Câu hỏi trắc nghiệm chiếu lên màn hình lớp</div>
              </div>
            </a>
            {/* Button 2: Rung chuong vang game */}
            <a href="/teacher-games" className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-950/30 transition-all duration-200">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl shrink-0 group-hover:bg-emerald-500/20 transition">🔔</div>
              <div>
                <div className="text-sm font-bold text-white">Trò chơi Rung chuông vàng</div>
                <div className="text-xs text-slate-400 leading-snug">Cả lớp thi đua trả lời — chiếu trực tiếp</div>
              </div>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};
