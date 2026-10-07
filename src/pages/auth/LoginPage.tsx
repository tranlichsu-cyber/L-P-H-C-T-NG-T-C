import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('huong.nguyen@th-nguyenhue.edu.vn');
  const [password, setPassword] = useState('123456');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In Milestone 1, redirect directly to teacher dashboard
    navigate('/teacher');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại chọn vai trò
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-600/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Đăng Nhập Giáo Viên</h1>
          <p className="text-sm text-slate-500 mt-1">Đăng nhập tài khoản giáo viên để bắt đầu tiết học</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              label="Địa chỉ Email"
              type="email"
              placeholder="nhap.email@giao-vien.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg" className="mt-2">
            Đăng nhập vào Dashboard
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Mẫu thử nghiệm dành cho Giáo viên (Milestone 1 - Mock Data)
          </p>
        </div>
      </div>
    </div>
  );
};
