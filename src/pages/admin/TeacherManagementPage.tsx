import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SchoolService } from '../../services/school/SchoolService';
import type { SchoolMember, SchoolTeam, UserRole, MemberStatus } from '../../services/school/types';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Edit,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

export const TeacherManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [teams, setTeams] = useState<SchoolTeam[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Edit Modal State
  const [editingMember, setEditingMember] = useState<SchoolMember | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('TEACHER');
  const [editStatus, setEditStatus] = useState<MemberStatus>('ACTIVE');
  const [editTeamIds, setEditTeamIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mList, tList] = await Promise.all([
        SchoolService.getMembers(),
        SchoolService.getTeams(),
      ]);
      setMembers(mList);
      setTeams(tList);
    } catch {
      showToast('Lỗi khi tải danh sách giáo viên.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = (member: SchoolMember) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditStatus(member.status);
    setEditTeamIds(member.teamIds || []);
  };

  const handleSaveMemberChanges = async () => {
    if (!editingMember) return;
    setIsSaving(true);
    const actor = { uid: 'admin-1', name: 'Hiệu trưởng Nguyễn Văn A' };

    try {
      // 1. Role Update
      if (editingMember.role !== editRole) {
        const resRole = await SchoolService.updateMemberRole(
          editingMember.uid,
          editRole,
          actor
        );
        if (!resRole.success) {
          showToast(resRole.error || 'Lỗi cập nhật vai trò', 'error');
          setIsSaving(false);
          return;
        }
      }

      // 2. Status Update
      if (editingMember.status !== editStatus) {
        const resStatus = await SchoolService.updateMemberStatus(
          editingMember.uid,
          editStatus,
          actor
        );
        if (!resStatus.success) {
          showToast(resStatus.error || 'Lỗi cập nhật trạng thái', 'error');
          setIsSaving(false);
          return;
        }
      }

      // 3. Teams Update
      await SchoolService.updateMemberTeams(
        editingMember.uid,
        editTeamIds,
        actor
      );

      showToast(`Đã cập nhật thông tin cho giáo viên ${editingMember.displayName}`, 'success');
      setEditingMember(null);
      await loadData();
    } catch (err: any) {
      showToast('Lỗi hệ thống khi lưu thông tin: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || m.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || m.status === selectedStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SCHOOL_ADMIN':
        return <Badge variant="warning">BGH / QUẢN TRỊ</Badge>;
      case 'TEAM_LEADER':
        return <Badge variant="info">TỔ TRƯỜNG CHUYÊN MÔN</Badge>;
      default:
        return <Badge variant="neutral">GIÁO VIÊN</Badge>;
    }
  };

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">HOẠT ĐỘNG</Badge>;
      case 'DISABLED':
        return <Badge variant="danger">ĐÃ KHÓA</Badge>;
      case 'INVITED':
        return <Badge variant="warning">CHỜ XÁC NHẬN</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Về Bảng quản trị
        </Button>
      </div>

      <PageHeader
        title="QUẢN LÝ GIÁO VIÊN & PHÂN QUYỀN"
        description="Quản lý danh sách giáo viên, phân vai trò, gán tổ chuyên môn và bảo vệ tài khoản Quản trị viên"
      />

      {/* FILTER & SEARCH BAR */}
      <Card className="p-4 bg-white border-2 border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email giáo viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none text-sm font-medium"
            />
          </div>

          <div>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full py-2 px-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none text-sm font-medium bg-white"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="SCHOOL_ADMIN">BGH / Quản trị</option>
              <option value="TEAM_LEADER">Tổ trưởng chuyên môn</option>
              <option value="TEACHER">Giáo viên</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full py-2 px-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none text-sm font-medium bg-white"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="DISABLED">Đã khóa</option>
              <option value="INVITED">Chờ duyệt</option>
            </select>
          </div>
        </div>
      </Card>

      {/* MEMBERS TABLE */}
      {isLoading ? (
        <Card className="p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600 mb-2" />
          <p className="font-bold text-sm">Đang tải danh sách giáo viên...</p>
        </Card>
      ) : filteredMembers.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 bg-white border-2 border-dashed border-slate-300">
          <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="font-black text-slate-800 text-lg">Không tìm thấy giáo viên nào</h3>
          <p className="text-xs">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-2 border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-700 font-bold">
                  <th className="p-4">HỌ VÀ TÊN</th>
                  <th className="p-4">EMAIL</th>
                  <th className="p-4">VAI TRÒ</th>
                  <th className="p-4">TỔ CHUYÊN MÔN</th>
                  <th className="p-4 text-center">TRẠNG THÁI</th>
                  <th className="p-4 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMembers.map((m) => {
                  const memberTeams = teams.filter((t) => m.teamIds?.includes(t.id));
                  return (
                    <tr key={m.uid} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{m.displayName}</td>
                      <td className="p-4 text-slate-600 font-medium text-xs">{m.email}</td>
                      <td className="p-4">{getRoleBadge(m.role)}</td>
                      <td className="p-4">
                        {memberTeams.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {memberTeams.map((t) => (
                              <span
                                key={t.id}
                                className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded-md text-xs font-bold text-slate-700"
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa phân tổ</span>
                        )}
                      </td>
                      <td className="p-4 text-center">{getStatusBadge(m.status)}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(m)}
                          className="font-bold text-sky-700 hover:bg-sky-50 border-sky-300"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" /> Phân quyền & Tổ
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <Modal
          isOpen={true}
          onClose={() => setEditingMember(null)}
          title={`CHỈNH SỬA TÀI KHOẢN: ${editingMember.displayName}`}
        >
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Vai trò hệ thống
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="w-full p-2.5 border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="TEACHER">Giáo viên</option>
                <option value="TEAM_LEADER">Tổ trưởng chuyên môn</option>
                <option value="SCHOOL_ADMIN">BGH / Quản trị viên trường</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                * Lưu ý: Hệ thống có cơ chế Bảo vệ Admin cuối cùng (Last Admin Protection) ngăn chặn việc hạ quyền vô tình.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Trạng thái tài khoản
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as MemberStatus)}
                className="w-full p-2.5 border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="ACTIVE">Hoạt động (Cho phép đăng nhập)</option>
                <option value="DISABLED">Đã khóa (Chặn đăng nhập)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                Gán Tổ chuyên môn
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto p-3 border-2 border-slate-200 rounded-xl bg-slate-50">
                {teams.map((t) => {
                  const isChecked = editTeamIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditTeamIds([...editTeamIds, t.id]);
                          } else {
                            setEditTeamIds(editTeamIds.filter((id) => id !== t.id));
                          }
                        }}
                        className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                      />
                      {t.name}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingMember(null)} disabled={isSaving}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleSaveMemberChanges} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
