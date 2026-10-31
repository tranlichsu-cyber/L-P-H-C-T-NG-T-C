import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, BookOpen, Sparkles, Swords, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { BachDangDiorama } from '../../components/models/BachDangDiorama';
import { SCHOOL_LOGO_SRC } from '../../assets/schoolLogo';
import { useSchool } from '../../context/SchoolContext';

export const BachDangPage: React.FC = () => {
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
            <div className="flex items-center gap-2 text-xs font-bold text-red-400">
              <Swords className="h-3.5 w-3.5" />
              <span>Kho Mô hình & Sa bàn</span>
              <span>•</span>
              <span>Môn Lịch sử và Địa lí 4</span>
              <span>•</span>
              <span>Bài 5</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sa bàn 3D Trận chiến trên sông Bạch Đằng năm 938
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Tái hiện sinh động trận địa cọc ngầm của Ngô Quyền: Thủy triều lên nhử địch, thủy triều rút nhanh đâm thủng thuyền giặc Nam Hán, mở ra kỷ nguyên độc lập tự chủ cho non sông.
            </p>
          </div>

          <a
            href="/models/bach-dang-938-3d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-red-600/20 shrink-0 self-start md:self-center transition transform hover:scale-105"
          >
            <span>Mở Mô hình 3D Độc Lập</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* The Interactive Diorama */}
        <BachDangDiorama />

        {/* Educational Objectives Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="h-4 w-4" />
              <span>Nghệ thuật quân sự</span>
            </div>
            <h3 className="text-sm font-bold text-white">Trận địa cọc ngầm & Thủy triều</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hiểu rõ cách cha ông ta mưu trí lợi dụng dòng nước thủy triều lên xuống chênh lệch hàng mét mỗi ngày để biến cọc gỗ thành cái bẫy hiểm hóc đánh tan giặc.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Chiến công hiển hách</span>
            </div>
            <h3 className="text-sm font-bold text-white">Đại thắng chấm dứt Bắc thuộc</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nắm được diễn biến chiến dịch, lòng quả cảm của quân dân Đại Việt và sự thất bại thảm hại của quân xâm lược Nam Hán dưới sự chỉ huy của tướng giặc Hoằng Tháo.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Lòng tự hào dân tộc</span>
            </div>
            <h3 className="text-sm font-bold text-white">Mở ra kỷ nguyên độc lập</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bồi dưỡng lòng biết ơn sâu sắc đối với anh hùng dân tộc Ngô Quyền, tự hào về truyền thống dựng nước và giữ nước bất khuất của dân tộc Việt Nam.
            </p>
          </div>
        </section>

        {/* Quick Links to QR Cards & Games */}
        <section className="bg-gradient-to-r from-red-950/60 to-slate-900/80 rounded-3xl p-5 sm:p-6 border border-red-500/30 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-black text-white tracking-tight">Tiếp theo: Củng cố bài học</h3>
            <span className="text-xs text-slate-400">Chuyển ngay sang thực hành tương tác</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Button 1: QR Cards */}
            <a href="/qr-bank" className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-red-500/50 hover:bg-red-950/30 transition-all duration-200">
              <div className="w-11 h-11 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 text-2xl shrink-0 group-hover:bg-red-500/20 transition">🃏</div>
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
