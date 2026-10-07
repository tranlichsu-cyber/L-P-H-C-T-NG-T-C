import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Smile, ArrowRight, Sparkles } from 'lucide-react';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-amber-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Soft background ambient circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full text-center relative z-10">
        {/* Header Title Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-sky-800 font-extrabold text-sm mb-6 border border-sky-200 shadow-sm animate-bounce-gentle">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          Phần mềm Lớp Học Tương Tác cho Tiểu Học v1.1 🚀
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-4">
          Chào mừng đến với <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-800">Lớp Học Tương Tác</span>
        </h1>
        <p className="text-slate-600 text-base sm:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Nền tảng kết nối trực tiếp giữa thầy cô và học sinh trong từng giờ học sinh động và tràn đầy cảm hứng.
        </p>

        {/* 2 Big Role Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Teacher Card */}
          <div
            onClick={() => navigate('/login')}
            className="group relative bg-gradient-to-b from-white via-white to-sky-50/60 rounded-3xl p-8 border-2 border-sky-200/90 hover:border-sky-500 shadow-md hover:shadow-2xl hover:shadow-sky-500/15 hover:-translate-y-1 transition-all duration-200 cursor-pointer text-left flex flex-col justify-between active:scale-[0.98]"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-sky-600/30 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-9 h-9" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-extrabold text-xs mb-2">
                Dành cho Giáo viên 👩‍🏫
              </span>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Tôi là Giáo viên</h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Tạo lớp học, quản lý danh sách học sinh, phát câu hỏi và theo dõi kết quả realtime trên máy tính.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sky-600 font-black group-hover:translate-x-1.5 transition-transform text-base">
              Đăng nhập ngay <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Student Card */}
          <div
            onClick={() => navigate('/student/join')}
            className="group relative bg-gradient-to-b from-white via-white to-amber-50/60 rounded-3xl p-8 border-2 border-amber-300 hover:border-amber-500 shadow-md hover:shadow-2xl hover:shadow-amber-500/15 hover:-translate-y-1 transition-all duration-200 cursor-pointer text-left flex flex-col justify-between active:scale-[0.98]"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 flex items-center justify-center mb-6 shadow-lg shadow-amber-400/30 group-hover:scale-110 transition-transform border-2 border-amber-300">
                <Smile className="w-9 h-9 fill-slate-950" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs mb-2">
                Dành cho Học sinh 🎒
              </span>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Tôi là Học sinh</h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Nhập mã phòng 6 chữ số từ thầy cô, chọn tên mình và tham gia trả lời câu hỏi mượt mà trên thiết bị.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-amber-700 font-black group-hover:translate-x-1.5 transition-transform text-base">
              Tham gia lớp học <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
