import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, BookOpen, Sparkles, Waves, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { RedRiverDikeDiorama } from '../../components/models/RedRiverDikeDiorama';
import { SCHOOL_LOGO_SRC } from '../../assets/schoolLogo';
import { useSchool } from '../../context/SchoolContext';

export const RedRiverDikePage: React.FC = () => {
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
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Waves className="h-3.5 w-3.5" />
              <span>Kho Mô hình & Sa bàn</span>
              <span>•</span>
              <span>Môn Lịch sử và Địa lí 4</span>
              <span>•</span>
              <span>Bài 8</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sa bàn 3D Mặt cắt Hệ thống Đê sông Hồng
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Khám phá cấu trúc mặt cắt hình thang con đê kiên cố, dòng sông Hồng đỏ nặng phù sa, bãi bồi trồng ngô dâu ngoài đê và làng quê trù phú trong đê được bảo vệ an toàn qua ngàn năm lịch sử.
            </p>
          </div>

          <a
            href="/models/de-song-hong-3d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl shadow-amber-500/20 shrink-0 self-start md:self-center transition transform hover:scale-105"
          >
            <span>Mở Sa Bàn 3D Độc Lập</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* The Interactive Diorama */}
        <RedRiverDikeDiorama />

        {/* Educational Objectives Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="h-4 w-4" />
              <span>Kỳ tích trị thủy ngàn năm</span>
            </div>
            <h3 className="text-sm font-bold text-white">Ý chí và tinh thần quật cường</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tìm hiểu lịch sử đắp đê từ thời Lý (năm 1108 - đê Cơ Xá) đến các triều đại nhà Trần, nhà Lê nhằm bảo vệ Thăng Long và toàn bộ Đồng bằng Bắc Bộ.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Cấu trúc & Cơ chế ngăn lũ</span>
            </div>
            <h3 className="text-sm font-bold text-white">Chân đê, thân đê, kè đá và mặt đê</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Giải thích vì sao vùng đồng ruộng trong đê lại trũng thấp hơn mực nước lũ ngoài sông và cách con đê ngăn nước lũ bảo vệ mùa màng.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Ý thức bảo vệ đê điều</span>
            </div>
            <h3 className="text-sm font-bold text-white">Trách nhiệm của thế hệ trẻ</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nâng cao ý thức gìn giữ, không đào xới chân đê, tích cực trồng cây chắn sóng và chung tay tham gia các hoạt động bảo vệ môi trường dòng sông.
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
