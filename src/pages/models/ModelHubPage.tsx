import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Home,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { modelsCatalog } from '../../data/models/modelsCatalog';
import { SCHOOL_LOGO_SRC } from '../../assets/schoolLogo';
import { useSchool } from '../../context/SchoolContext';

type SubjectFilter = 'ALL' | 'Lịch sử và Địa lí' | 'Khoa học';

export const ModelHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { logoUrl, settings } = useSchool();
  const schoolName = settings.displayName || settings.schoolName || 'TRƯỜNG TIỂU HỌC SÔNG CÔNG';
  const currentLogo = logoUrl || SCHOOL_LOGO_SRC;

  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredModels = useMemo(() => {
    return modelsCatalog.filter((item) => {
      const matchSubject = selectedSubject === 'ALL' || item.subject === selectedSubject;
      const matchGrade = selectedGrade === 0 || item.grade === selectedGrade;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.lessonName.toLowerCase().includes(q) ||
        item.lessonCode.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      return matchSubject && matchGrade && matchQuery;
    });
  }, [selectedSubject, selectedGrade, searchQuery]);

  const featuredModel = modelsCatalog.find((m) => m.id === 'den-hung');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-bold border border-slate-700"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Trang chủ</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                  Kho Mô Hình 3D & Sa Bàn Học Tập
                </h1>
                <p className="text-[11px] font-semibold text-slate-400">
                  Môn Lịch sử & Địa lí • Môn Khoa học Tiểu học
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <img src={currentLogo} alt="Logo" className="h-8 w-8 object-contain" />
            <span className="text-xs font-black tracking-wide text-slate-300 hidden md:inline">
              {schoolName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Featured Card: Hung Temple */}
        {featuredModel && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 border-2 border-amber-500/50 shadow-2xl p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8 group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Content */}
            <div className="flex-1 space-y-4 z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Mô hình nổi bật • Lớp 4
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 text-amber-300 border border-slate-700">
                  {featuredModel.subject} • {featuredModel.lessonCode}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {featuredModel.title}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {featuredModel.summary}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {featuredModel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => navigate(featuredModel.route || '/mo-hinh/den-hung')}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition transform hover:scale-105"
                >
                  <span>Khám phá sa bàn ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Preview Image */}
            <div className="w-full lg:w-96 shrink-0 z-10">
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl group-hover:border-amber-400 transition duration-500">
                <img
                  src={featuredModel.coverImage}
                  alt={featuredModel.title}
                  className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 text-xs font-bold text-amber-200">
                  Hành hương qua 8 điểm di tích núi Nghĩa Lĩnh cao 175m
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-3xl border border-slate-800">
          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubject('ALL')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition ${
                selectedSubject === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Tất cả các môn
            </button>
            <button
              type="button"
              onClick={() => setSelectedSubject('Lịch sử và Địa lí')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition ${
                selectedSubject === 'Lịch sử và Địa lí'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Lịch sử và Địa lí
            </button>
            <button
              type="button"
              onClick={() => setSelectedSubject('Khoa học')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition ${
                selectedSubject === 'Khoa học'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Khoa học
            </button>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setSelectedGrade(0)}
                className={`px-2.5 py-1 rounded-xl font-bold transition ${
                  selectedGrade === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất cả khối
              </button>
              <button
                type="button"
                onClick={() => setSelectedGrade(4)}
                className={`px-2.5 py-1 rounded-xl font-bold transition ${
                  selectedGrade === 4 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lớp 4
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài học, chủ đề..."
              className="w-full h-10 rounded-2xl bg-slate-900 border border-slate-700/80 pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
        </div>

        {/* Model Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-400" />
              Danh Sách Mô Hình & Sa Bàn ({filteredModels.length})
            </h3>
            <span className="text-xs text-slate-400">Ưu tiên chương trình Lớp 4</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((item) => {
              const isAvailable = item.status === 'AVAILABLE';
              return (
                <article
                  key={item.id}
                  className={`rounded-3xl bg-slate-950 border transition duration-300 flex flex-col justify-between overflow-hidden shadow-lg ${
                    isAvailable
                      ? 'border-amber-500/50 hover:border-amber-400 hover:shadow-amber-500/10'
                      : 'border-slate-800 opacity-90'
                  }`}
                >
                  <div>
                    {/* Card Cover Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-900 group">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {isAvailable ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md">
                            <CheckCircle2 className="h-3 w-3" />
                            Sẵn sàng học
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-800/90 text-amber-300 border border-slate-700 backdrop-blur-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Đang phát triển
                          </span>
                        )}
                      </div>

                      {/* Subject Tag */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-900/90 text-slate-300 border border-slate-700 backdrop-blur-sm">
                          {item.subject}
                        </span>
                      </div>

                      {/* Lesson title pinned at bottom of image */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <span className="text-xs font-bold text-amber-400">
                          Lớp {item.grade} • {item.lessonCode}: {item.lessonName}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <h4 className="text-base font-black text-white leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {item.summary}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="p-5 pt-0">
                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={() => navigate(item.route || '/mo-hinh/den-hung')}
                        className="w-full py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition"
                      >
                        <span>Mở Sa Bàn Tương Tác</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 text-slate-500 text-xs font-bold border border-slate-800 cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Sắp ra mắt bài học này</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
