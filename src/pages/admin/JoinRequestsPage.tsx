import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SchoolService } from '../../services/school/SchoolService';
import type { SchoolJoinRequest } from '../../services/school/types';
import { useToast } from '../../context/ToastContext';
import {
  UserPlus,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Mail,
} from 'lucide-react';

export const JoinRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [requests, setRequests] = useState<SchoolJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const rList = await SchoolService.getJoinRequests();
      setRequests(rList);
    } catch {
      showToast('Lỗi khi tải danh sách yêu cầu gia nhập.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (req: SchoolJoinRequest) => {
    setProcessingId(req.id);
    const actor = { uid: 'admin-1', name: 'Hiệu trưởng Nguyễn Văn A' };
    try {
      const ok = await SchoolService.approveJoinRequest(req.id, actor);
      if (ok) {
        showToast(`Đã phê duyệt giáo viên ${req.displayName} gia nhập trường!`, 'success');
        await loadRequests();
      } else {
        showToast('Không thể phê duyệt yêu cầu này.', 'error');
      }
    } catch (err: any) {
      showToast('Lỗi khi phê duyệt: ' + err.message, 'error');
    } finally {
      setProcessingId(null);
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
        title="DUYỆT YÊU CẦU GIA NHẬP TRƯỜNG"
        description="Xem và kiểm duyệt tài khoản Giáo viên mới đăng ký gia nhập đơn vị"
      />

      {isLoading ? (
        <Card className="p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600 mb-2" />
          <p className="font-bold text-sm">Đang tải danh sách yêu cầu...</p>
        </Card>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 bg-white border-2 border-dashed border-slate-300">
          <UserPlus className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="font-black text-slate-800 text-lg">Không có yêu cầu chờ duyệt</h3>
          <p className="text-xs">Tất cả các giáo viên gửi yêu cầu gia nhập đã được xử lý.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-2 border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-700 font-bold">
                  <th className="p-4">GIÁO VIÊN YÊU CẦU</th>
                  <th className="p-4">EMAIL TIẾP NHẬN</th>
                  <th className="p-4">THỜI GIAN GỬI</th>
                  <th className="p-4 text-center">TRẠNG THÁI</th>
                  <th className="p-4 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{r.displayName}</td>
                    <td className="p-4 text-slate-600 font-medium text-xs flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {r.email}
                    </td>
                    <td className="p-4 text-slate-500 text-xs font-medium">
                      {new Date(r.requestedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-4 text-center">
                      {r.status === 'PENDING' ? (
                        <Badge variant="warning">CHỜ DUYỆT</Badge>
                      ) : r.status === 'ACCEPTED' ? (
                        <Badge variant="success">ĐÃ PHÊ DUYỆT</Badge>
                      ) : (
                        <Badge variant="danger">ĐÃ TỪ CHỐI</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {r.status === 'PENDING' ? (
                        <Button
                          variant="success"
                          size="sm"
                          disabled={processingId === r.id}
                          onClick={() => handleApprove(r)}
                          className="font-bold text-white shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Duyệt gia nhập
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
