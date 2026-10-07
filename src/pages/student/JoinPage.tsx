import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useStudentSession } from '../../context/StudentSessionContext';
import { realtimeService } from '../../services/realtime/MockRealtimeService';
import { Sparkles, ArrowRight } from 'lucide-react';

export const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, joinRoom } = useStudentSession();
  const [pin, setPin] = useState('839201');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto handle QR Code URL scan (?room=839201)
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam && roomParam.length === 6) {
      setPin(roomParam);
      // Auto check and navigate if room is valid
      const { room, error: joinErr } = realtimeService.joinRoomByCode(roomParam);
      if (room) {
        joinRoom(roomParam);
        navigate('/student/select-name');
      } else {
        setError(joinErr || 'Phòng học không còn hoạt động. Hãy thử mã khác.');
      }
    } else {
      inputRef.current?.focus();
    }
  }, [searchParams, joinRoom, navigate]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Vui lòng nhập mã phòng.');
      return;
    }
    if (pin.trim().length !== 6) {
      setError('Mã phòng gồm 6 chữ số.');
      return;
    }

    // Attempt join room using Realtime Service
    const { room, error: joinErr } = realtimeService.joinRoomByCode(pin);
    if (joinErr || !room) {
      // Fallback check in local session join
      const res = joinRoom(pin);
      if (!res.success) {
        setError(joinErr || res.message || 'Không tìm thấy phòng học.');
        return;
      }
    } else {
      joinRoom(pin);
    }

    setError('');
    navigate('/student/select-name');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 border-2 border-sky-300 shadow-2xl shadow-sky-500/10 text-center animate-fade-in relative overflow-hidden">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 flex items-center justify-center mx-auto mb-4 border-2 border-amber-300 shadow-md">
        <Sparkles className="w-8 h-8 fill-slate-950 animate-pulse-subtle" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-sky-950 mb-1 tracking-tight">THAM GIA LỚP HỌC</h1>
      <p className="text-slate-600 text-sm mb-6 font-semibold">Nhập mã phòng do thầy/cô cung cấp 🎈</p>

      <form onSubmit={handleJoin} className="space-y-6">
        <div>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            className={`w-full rounded-2xl border-2 bg-slate-50 px-4 py-4 text-3xl sm:text-4xl font-mono font-black tracking-widest text-center text-slate-900 transition-all focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 placeholder:text-slate-300 ${
              error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/40' : 'border-slate-300/80'
            }`}
            required
          />
          {error && (
            <p className="mt-2 text-sm font-black text-rose-600 bg-rose-50 py-2 px-3 rounded-xl border border-rose-200">
              {error}
            </p>
          )}
        </div>

        <Button variant="student" size="xl" fullWidth type="submit">
          THAM GIA NGAY <ArrowRight className="w-6 h-6 ml-2 inline stroke-[3]" />
        </Button>
      </form>

      {session.roomCode && (
        <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-bold text-slate-400">
          Đang kết nối phòng: <strong className="text-sky-700">{session.className || 'Lớp 4A'}</strong> • Mã <span className="font-mono text-amber-600">{session.roomCode}</span>
        </div>
      )}
    </div>
  );
};
