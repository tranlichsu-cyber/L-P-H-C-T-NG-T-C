import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Home, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center bg-white border-2 border-slate-200 space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
          <HelpCircle className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-3xl font-black text-slate-900">404</h1>
          <h2 className="text-lg font-bold text-slate-700 mt-1">Không tìm thấy trang yêu cầu</h2>
          <p className="text-xs text-slate-500 mt-2">
            Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={() => navigate('/')} className="w-full font-bold">
          <Home className="w-5 h-5 mr-2" /> VỀ TRANG CHỦ
        </Button>
      </Card>
    </div>
  );
};
