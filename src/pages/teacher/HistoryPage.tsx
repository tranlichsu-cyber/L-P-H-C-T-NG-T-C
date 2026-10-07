import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { HistoryService } from '../../services/history/HistoryService';
import type { RoomSummary, HistoryFilters } from '../../services/history/types';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import {
  History,
  Filter,
  Calendar,
  Users,
  ArrowRight,
  Archive,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes } = useTeacherData();
  const { showToast } = useToast();

  const [summaries, setSummaries] = useState<RoomSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  // Filters State
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchTitle, setSearchTitle] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'accuracy_high' | 'accuracy_low'>('newest');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const filters: HistoryFilters = {
        classId: selectedClassId || undefined,
        grade: selectedGrade || undefined,
        subject: selectedSubject !== 'ALL' ? selectedSubject : undefined,
        searchTitle: searchTitle || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        showArchived,
        sortBy,
      };

      const res = await HistoryService.getHistoryList(filters, page, pageSize);
      setSummaries(res.summaries);
      setTotalCount(res.totalCount);
    } catch (err) {
      showToast('Không thể tải lịch sử học tập. Hãy thử lại.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedClassId, selectedGrade, selectedSubject, searchTitle, startDate, endDate, showArchived, sortBy, page]);

  const handleToggleArchive = async (e: React.MouseEvent, roomId: string, currentArchived?: boolean) => {
    e.stopPropagation();
    await HistoryService.archiveSession(roomId, !currentArchived);
    showToast(currentArchived ? 'Đã bỏ lưu trữ buổi học!' : 'Đã lưu trữ buổi học!', 'success');
    fetchHistory();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="LỊCH SỬ DẠY HỌC VÀ KẾT QUẢ CÁC BUỔI HỌC"
        description="Xem lại báo cáo chi tiết, thống kê tỷ lệ đúng và kết quả từng học sinh theo từng buổi dạy"
        action={
          <Button variant="primary" size="md" onClick={() => navigate('/teacher/room')}>
            <PlusCircle className="w-5 h-5 mr-1" /> TẠO PHÒNG HỌC MỚI
          </Button>
        }
      />

      {/* FILTER PANEL */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Filter className="w-4 h-4 text-sky-600" /> BỘ LỌC TÌM KIẾM
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded text-sky-600"
              />
              <span>Hiển thị cả buổi đã lưu trữ</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
          {/* Class Filter */}
          <div>
            <label className="text-slate-600 block mb-1">Lớp học:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">Tất cả các lớp</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="text-slate-600 block mb-1">Khối lớp:</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">Tất cả các khối</option>
              <option value="1">Lớp 1</option>
              <option value="2">Lớp 2</option>
              <option value="3">Lớp 3</option>
              <option value="4">Lớp 4</option>
              <option value="5">Lớp 5</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="text-slate-600 block mb-1">Môn học:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="ALL">Tất cả các môn</option>
              <option value="Toán">Toán</option>
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="Khoa học">Khoa học</option>
              <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
              <option value="Tin học">Tin học</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-slate-600 block mb-1">Sắp xếp theo:</label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="accuracy_high">Tỷ lệ đúng: Cao → Thấp</option>
              <option value="accuracy_low">Tỷ lệ đúng: Thấp → Cao</option>
            </select>
          </div>

          {/* Search Keywords */}
          <div>
            <label className="text-slate-600 block mb-1">Tìm theo tên bài học:</label>
            <Input
              placeholder="Nhập tên bài học..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-slate-600 block mb-1">Từ ngày:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Đến ngày:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>
      </Card>

      {/* SESSIONS HISTORY LIST */}
      {isLoading ? (
        <Card className="p-8 text-center text-slate-500 space-y-2">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600" />
          <p className="font-bold text-sm">Đang tải lịch sử các buổi học...</p>
        </Card>
      ) : summaries.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Không tìm thấy buổi học nào phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1">
              Hãy kiểm tra lại bộ lọc tìm kiếm hoặc kết thúc một buổi học mới để xem báo cáo.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/teacher/room')}>
            TẠO PHÒNG HỌC NGAY
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600 px-1">
            <span>Tìm thấy <strong>{totalCount}</strong> buổi học</span>
            <span>Trang {page} / {Math.ceil(totalCount / pageSize) || 1}</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {summaries.map((s) => {
              const dateStr = new Date(s.startedAt).toLocaleDateString('vi-VN');
              const isHighAcc = s.averageAccuracy >= 80;
              const isMidAcc = s.averageAccuracy >= 50 && s.averageAccuracy < 80;

              return (
                <Card
                  key={s.roomId}
                  className={`p-5 hover:border-sky-400 transition-all cursor-pointer border-2 ${
                    s.archived ? 'bg-slate-50 opacity-60 border-slate-200' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                  onClick={() => navigate(`/teacher/history/${s.roomId}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary" size="sm">{s.className}</Badge>
                        <Badge variant="neutral" size="sm">Môn {s.subject}</Badge>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {dateStr}
                        </span>
                        {s.archived && <Badge variant="neutral" size="sm">Đã lưu trữ</Badge>}
                      </div>

                      <h3 className="text-base font-black text-slate-900 hover:text-sky-700 transition-colors">
                        {s.quizTitle || 'Bài kiểm tra trực tiếp'}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-slate-400" /> <strong>{s.participantCount}</strong> học sinh
                        </span>
                        <span>•</span>
                        <span><strong>{s.questionCount}</strong> câu hỏi</span>
                        <span>•</span>
                        <span><strong>{s.submissionCount}</strong> lượt trả lời</span>
                      </div>
                    </div>

                    {/* Right: Accuracy & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-500 block mb-0.5">Tỷ lệ đúng trung bình</span>
                        <div
                          className={`text-xl font-black ${
                            isHighAcc ? 'text-emerald-600' : isMidAcc ? 'text-amber-600' : 'text-rose-600'
                          }`}
                        >
                          {s.averageAccuracy}%
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleToggleArchive(e, s.roomId, s.archived)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                          title={s.archived ? 'Bỏ lưu trữ' : 'Lưu trữ'}
                        >
                          <Archive className="w-4 h-4" />
                        </button>

                        <Button variant="outline" size="sm" className="font-bold">
                          CHI TIẾT <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalCount > pageSize && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trang trước
              </Button>
              <span className="px-4 py-2 text-xs font-bold text-slate-700 self-center">
                Trang {page} / {Math.ceil(totalCount / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(totalCount / pageSize)}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
