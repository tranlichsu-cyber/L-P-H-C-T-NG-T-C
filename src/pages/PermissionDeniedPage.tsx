import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const PermissionDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center bg-white border-2 border-slate-200 space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900">403 - KHÔNG CÓ QUYỀN TRUY CẬP</h1>
          <p className="text-xs text-slate-500 mt-2">
            Tài khoản của bạn không được phân quyền để truy cập trang này. Vui lòng liên hệ Ban Giám hiệu nhà trường.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={() => navigate('/teacher')} className="w-full font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" /> VỀ BẢNG ĐIỀU KHIỂN GIÁO VIÊN
        </Button>
      </Card>
    </div>
  );
};
