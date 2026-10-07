import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PracticeService } from '../../services/practice/PracticeService';
import type { PracticeSet } from '../../services/practice/types';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  PlusCircle,
  Users,
  Calendar,
  Filter,
  ArrowRight,
  RefreshCw,
  Archive,
} from 'lucide-react';

export const PracticeListPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes } = useTeacherData();
  const { showToast } = useToast();

  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  const fetchPracticeSets = async () => {
    setIsLoading(true);
    try {
      const sets = await PracticeService.getTeacherPracticeSets(selectedClassId || undefined, selectedSubject, showArchived);
      setPracticeSets(sets);
    } catch {
      showToast('Lỗi khi tải danh sách bài ôn tập.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeSets();
  }, [selectedClassId, selectedSubject, showArchived]);

  const handleToggleArchive = async (e: React.MouseEvent, id: string, archived?: boolean) => {
    e.stopPropagation();
    await PracticeService.archivePracticeSet(id, !archived);
    showToast(archived ? 'Đã bỏ lưu trữ bài ôn!' : 'Đã lưu trữ bài ôn!', 'success');
    fetchPracticeSets();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="QUẢN LÝ CÁC BÀI ÔN TẬP ĐÃ GIAO"
        description="Theo dõi tiến độ làm bài, kết quả hoàn thành và quản lý nhiệm vụ ôn tập phân hóa"
        action={
          <Button variant="primary" onClick={() => navigate('/teacher/practice/new')}>
            <PlusCircle className="w-5 h-5 mr-1" /> TẠO BÀI ÔN MỚI
          </Button>
        }
      />

      {/* FILTER CONTROLS */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Filter className="w-4 h-4 text-sky-600" /> BỘ LỌC BÀI ÔN TẬP
          </div>

          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded text-sky-600"
            />
            <span>Hiển thị bài đã lưu trữ</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
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
        </div>
      </Card>

      {/* PRACTICE LIST */}
      {isLoading ? (
        <Card className="p-12 text-center text-slate-500 space-y-2">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600" />
          <p className="font-bold text-sm">Đang tải danh sách bài ôn tập...</p>
        </Card>
      ) : practiceSets.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-lg text-slate-800">Chưa có bài ôn tập nào</h3>
          <Button variant="primary" onClick={() => navigate('/teacher/practice/new')}>
            TẠO BÀI ÔN TẬP ĐẦU TIÊN
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {practiceSets.map((p) => {
            const assignmentsList = Object.values(p.assignments || {});
            const totalAssigned = assignmentsList.length;
            const completedCount = assignmentsList.filter((a) => a.status === 'COMPLETED').length;
            const dateStr = new Date(p.createdAt).toLocaleDateString('vi-VN');

            return (
              <Card
                key={p.id}
                className="p-5 border-2 border-slate-200 hover:border-sky-400 transition-all cursor-pointer bg-white"
                onClick={() => navigate(`/teacher/practice/${p.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="primary">{p.className}</Badge>
                      <Badge variant="neutral">Môn {p.subject}</Badge>
                      <Badge
                        variant={
                          p.type === 'REMEDIATION' ? 'warning' : p.type === 'PRACTICE' ? 'info' : 'success'
                        }
                      >
                        {p.type === 'REMEDIATION' ? 'Củng cố' : p.type === 'PRACTICE' ? 'Luyện tập' : 'Nâng cao'}
                      </Badge>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Giao ngày {dateStr}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">{p.title}</h3>

                    <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-400" /> Đã giao: <strong>{totalAssigned}</strong> học sinh
                      </span>
                      <span>•</span>
                      <span>Hoàn thành: <strong className="text-emerald-700">{completedCount}/{totalAssigned}</strong></span>
                      <span>•</span>
                      <span><strong>{p.questions.length}</strong> câu hỏi</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={(e) => handleToggleArchive(e, p.id, p.archived)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                      title={p.archived ? 'Bỏ lưu trữ' : 'Lưu trữ'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    <Button variant="outline" size="sm" className="font-bold">
                      XEM KẾT QUẢ <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
