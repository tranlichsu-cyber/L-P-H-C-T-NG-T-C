import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SchoolService } from '../../services/school/SchoolService';
import type { AuditLogEntry } from '../../services/school/types';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const lList = await SchoolService.getAuditLogs();
      setLogs(lList);
    } catch {
      showToast('Lỗi khi tải nhật ký hệ thống.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'ROLE_CHANGED':
        return <Badge variant="warning">ĐỔI VAI TRÒ</Badge>;
      case 'MEMBER_DISABLED':
        return <Badge variant="danger">KHÓA TÀI KHOẢN</Badge>;
      case 'MEMBER_ACTIVATED':
        return <Badge variant="success">MỞ KHÓA TÀI KHOẢN</Badge>;
      case 'TEAM_ASSIGNED':
        return <Badge variant="info">GÁN TỔ CHUYÊN MÔN</Badge>;
      case 'JOIN_REQUEST_APPROVED':
        return <Badge variant="success">DUYỆT GIA NHẬP</Badge>;
      default:
        return <Badge variant="neutral">{action}</Badge>;
    }
  };

  const formatMetadata = (meta?: Record<string, any>) => {
    if (!meta) return null;
    return Object.entries(meta)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(' | ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Về Bảng quản trị
        </Button>
      </div>

      <PageHeader
        title="NHẬT KÝ HỆ THỐNG (AUDIT LOGS)"
        description="Lịch sử minh bạch ghi lại tất cả các thay đổi phân quyền và quản trị hệ thống"
      />

      {isLoading ? (
        <Card className="p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600 mb-2" />
          <p className="font-bold text-sm">Đang tải nhật ký hệ thống...</p>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 bg-white border-2 border-dashed border-slate-300">
          <ShieldCheck className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="font-black text-slate-800 text-lg">Chưa có nhật ký nào</h3>
          <p className="text-xs">Các thao tác phân quyền sẽ được ghi chép tự động tại đây.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-2 border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-700 font-bold text-xs uppercase">
                  <th className="p-4">THỜI GIAN</th>
                  <th className="p-4">HÀNH ĐỘNG</th>
                  <th className="p-4">NGƯỜI THỰC HIỆN</th>
                  <th className="p-4">ĐỐI TƯỢNG TÁC ĐỘNG</th>
                  <th className="p-4">CHI TIẾT THAY ĐỔI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-4">{getActionBadge(log.action)}</td>
                    <td className="p-4 font-bold text-slate-900">{log.actorName}</td>
                    <td className="p-4 font-bold text-sky-800">{log.targetName}</td>
                    <td className="p-4 text-xs text-slate-600 font-mono">
                      {formatMetadata(log.metadata) || '-'}
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
