import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SchoolService } from '../../services/school/SchoolService';
import type { SchoolTeam, SchoolMember } from '../../services/school/types';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  BookOpen,
  Crown,
  RefreshCw,
  Share2,
  BarChart2,
} from 'lucide-react';

export const TeamDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [teams, setTeams] = useState<SchoolTeam[]>([]);
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([SchoolService.getTeams(), SchoolService.getMembers()])
      .then(([tList, mList]) => {
        setTeams(tList);
        setMembers(mList);
      })
      .catch(() => showToast('Lỗi khi tải thông tin Tổ chuyên môn.', 'error'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Card className="p-12 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600 mb-2" />
        <p className="font-bold text-sm">Đang tải Trang Bảng điều khiển Tổ trưởng chuyên môn...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 via-sky-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl border-2 border-indigo-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
            <Crown className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">VAI TRÒ: TỔ TRƯỞNG CHUYÊN MÔN</Badge>
            </div>
            <h1 className="text-2xl font-black text-amber-400 uppercase tracking-wide">
              BẢNG ĐIỀU KHIỂN TỔ CHUYÊN MÔN
            </h1>
            <p className="text-xs text-sky-200 font-medium">
              Quản lý hoạt động giảng dạy, ngân hàng câu hỏi chia sẻ và sinh hoạt chuyên môn trong tổ
            </p>
          </div>
        </div>

        <Button
          variant="warning"
          size="md"
          onClick={() => navigate('/teacher/quizzes')}
          className="font-bold text-slate-950 shrink-0"
        >
          <BookOpen className="w-4 h-4 mr-1" /> NGÂN HÀNG CÂU HỎI TỔ
        </Button>
      </div>

      {/* TEAMS LIST */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" /> CÁC TỔ CHUYÊN MÔN ĐANG PHỤ TRÁCH
        </h2>

        {teams.map((t) => {
          const teamMembers = members.filter((m) => m.teamIds?.includes(t.id));
          const leaders = members.filter((m) => t.leaderIds.includes(m.uid));

          return (
            <Card key={t.id} className="p-6 bg-white border-2 border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Tổ trưởng: {leaders.map((l) => l.displayName).join(', ') || 'Chưa gán'}
                  </p>
                </div>
                <Badge variant="info">Mã tổ: {t.id}</Badge>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block mb-2">
                  Danh sách Giáo viên trong Tổ ({teamMembers.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {teamMembers.map((m) => (
                    <div
                      key={m.uid}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{m.displayName}</p>
                        <p className="text-[11px] text-slate-500">{m.email}</p>
                      </div>
                      <Badge variant={m.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {m.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUICK TEAM ACTIONS */}
              <div className="pt-2 flex items-center gap-3 flex-wrap border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/teacher/quizzes')}
                  className="text-xs font-bold text-indigo-700 hover:bg-indigo-50 border-indigo-300"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" /> Xem Bộ câu hỏi chia sẻ nội bộ Tổ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/teacher/history')}
                  className="text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <BarChart2 className="w-3.5 h-3.5 mr-1" /> Xem lịch sử giảng dạy các thành viên
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
