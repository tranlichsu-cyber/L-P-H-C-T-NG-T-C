import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SchoolService } from '../../services/school/SchoolService';
import type { SchoolTeam, SchoolMember } from '../../services/school/types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Plus,
  ArrowLeft,
  RefreshCw,
  Crown,
  Trash2,
} from 'lucide-react';

export const TeamManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const actor = {
    uid: currentUser?.uid || 'admin-current',
    name: currentUser?.displayName || currentUser?.email || 'Quản trị trường',
  };

  const [teams, setTeams] = useState<SchoolTeam[]>([]);
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New Team Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tList, mList] = await Promise.all([
        SchoolService.getTeams(),
        SchoolService.getMembers(),
      ]);
      setTeams(tList);
      setMembers(mList);
    } catch {
      showToast('Lỗi khi tải danh sách Tổ chuyên môn.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      showToast('Vui lòng nhập tên Tổ chuyên môn!', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      const leaders = selectedLeaderId ? [selectedLeaderId] : [];
      await SchoolService.createTeam(newTeamName, leaders, [], actor);
      showToast(`Đã tạo thành công ${newTeamName}`, 'success');
      setNewTeamName('');
      setSelectedLeaderId('');
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('Lỗi khi tạo tổ chuyên môn: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (team: SchoolTeam) => {
    const confirmed = window.confirm(
      `Xóa tổ "${team.name}"? Giáo viên đang thuộc tổ này sẽ được gỡ khỏi tổ, nhưng tài khoản giáo viên không bị xóa.`
    );
    if (!confirmed) return;

    setDeletingTeamId(team.id);
    try {
      await SchoolService.deleteTeam(team.id, actor);
      showToast(`Đã xóa tổ ${team.name}.`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Không thể xóa tổ chuyên môn.', 'error');
    } finally {
      setDeletingTeamId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Về Bảng quản trị
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="QUẢN LÝ TỔ CHUYÊN MÔN"
          description="Tạo và quản lý các tổ bộ môn (Tổ 1, Tổ 4-5, Tổ Tin học...), phân bổ Tổ trưởng chuyên môn"
        />
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)} className="shrink-0 font-bold">
          <Plus className="w-4 h-4 mr-1" /> THÊM TỔ CHUYÊN MÔN
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600 mb-2" />
          <p className="font-bold text-sm">Đang tải danh sách tổ chuyên môn...</p>
        </Card>
      ) : teams.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 bg-white border-2 border-dashed border-slate-300">
          <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="font-black text-slate-800 text-lg">Chưa có tổ chuyên môn nào</h3>
          <p className="text-xs">Bấm nút trên để tạo Tổ chuyên môn đầu tiên.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((t) => {
            const teamLeaders = members.filter((m) => t.leaderIds.includes(m.uid));
            const teamMembers = members.filter((m) => m.teamIds?.includes(t.id));

            return (
              <Card key={t.id} className="p-6 bg-white border-2 border-slate-200 space-y-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 border-b pb-3 border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{t.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Tổng số giáo viên: {teamMembers.length} thầy/cô
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">Mã tổ: {t.id}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTeam(t)}
                      disabled={deletingTeamId === t.id}
                      className="text-rose-700 border-rose-300 hover:bg-rose-50 font-bold"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {deletingTeamId === t.id ? 'Đang xóa...' : 'Xóa tổ'}
                    </Button>
                  </div>
                </div>

                {/* Team Leaders */}
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                    <Crown className="w-3.5 h-3.5 text-amber-500" /> Tổ trưởng chuyên môn:
                  </span>
                  {teamLeaders.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teamLeaders.map((l) => (
                        <div
                          key={l.uid}
                          className="px-3 py-1 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-1.5"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-600" /> {l.displayName} ({l.email})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Chưa có tổ trưởng</span>
                  )}
                </div>

                {/* Team Members */}
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-2">
                    Thành viên trong tổ ({teamMembers.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50">
                    {teamMembers.length > 0 ? (
                      teamMembers.map((m) => (
                        <span
                          key={m.uid}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                        >
                          {m.displayName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Chưa có thành viên nào</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      {isCreateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
          title="THÊM TỔ CHUYÊN MÔN MỚI"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Tên Tổ chuyên môn
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Tổ Khối 1 & 2, Tổ Tiếng Anh, Tổ Âm nhạc..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full p-2.5 border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Chọn Tổ trưởng chuyên môn (Tùy chọn)
              </label>
              <select
                value={selectedLeaderId}
                onChange={(e) => setSelectedLeaderId(e.target.value)}
                className="w-full p-2.5 border-2 border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:border-sky-500 focus:outline-none bg-white"
              >
                <option value="">-- Chưa gán tổ trưởng --</option>
                {members.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.displayName} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleCreateTeam} disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo Tổ chuyên môn'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
