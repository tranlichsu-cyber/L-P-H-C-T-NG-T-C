import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { GameType, GameSessionData } from '../../services/realtime/types';
import { Sparkles, Award, Zap, Flag, Gift, Volume2, VolumeX, Clock, Users } from 'lucide-react';

interface GameHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (type: GameType, settings: GameSessionData['settings']) => void;
}

export const GameHubModal: React.FC<GameHubModalProps> = ({ isOpen, onClose, onStartGame }) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('RANDOM_WHEEL');
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [doorCount, setDoorCount] = useState<number>(6);
  const [boxCount, setBoxCount] = useState<number>(6);
  const [teamNames, setTeamNames] = useState('');
  const [teamCount, setTeamCount] = useState<number>(2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [enableSpeedScore] = useState<boolean>(true);

  const gamesList: {
    type: GameType;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
  }[] = [
    {
      type: 'RANDOM_WHEEL',
      title: '1. Vòng Quay Gọi Học Sinh',
      description: 'Quay ngẫu nhiên tên học sinh phát biểu tích cực, có ưu tiên học sinh chưa được gọi.',
      icon: <Award className="w-8 h-8 text-amber-500" />,
      color: 'border-amber-400',
      bg: 'bg-amber-50',
    },
    {
      type: 'MYSTERY_DOOR',
      title: '2. Ô Cửa Bí Mật',
      description: 'Mở từng ô cửa chứa câu hỏi ẩn đằng sau. Phù hợp khởi động hoặc ôn tập bài học.',
      icon: <Sparkles className="w-8 h-8 text-sky-500" />,
      color: 'border-sky-400',
      bg: 'bg-sky-50',
    },
    {
      type: 'QUICK_ANSWER',
      title: '3. Nhanh Tay Chọn Đáp ÁN',
      description: 'Thi đấu trả lời nhanh toàn lớp. Thưởng thêm điểm tốc độ cho câu trả lời chính xác.',
      icon: <Zap className="w-8 h-8 text-emerald-500" />,
      color: 'border-emerald-400',
      bg: 'bg-emerald-50',
    },
    {
      type: 'TEAM_RACE',
      title: '4. Học Theo Nhóm / Đua Đội',
      description: 'Chia lớp thành các đội đua (Mặt Trời, Ngôi Sao,...). Mỗi câu đúng đẩy xe đội tiến lên.',
      icon: <Flag className="w-8 h-8 text-rose-500" />,
      color: 'border-rose-400',
      bg: 'bg-rose-50',
    },
    {
      type: 'KNOWLEDGE_BOX',
      title: '5. Hộp Quà Kiến Thức',
      description: 'Mở hộp quà bất ngờ nhận câu hỏi, điểm may mắn hoặc quyền ưu tiên phát biểu.',
      icon: <Gift className="w-8 h-8 text-purple-500" />,
      color: 'border-purple-400',
      bg: 'bg-purple-50',
    },
  ];

  const handleStart = () => {
    onStartGame(selectedGame, {
      timerSeconds,
      enableSpeedScore,
      soundEnabled,
      doorCount,
      boxCount,
      teamCount,
      teamNames: teamNames.split('\n').map((name) => name.trim()).slice(0, teamCount),
      fairnessUncalled: true,
      showRanking: false,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CENTRAL GAME HUB - TRÒ CHƠI LỚP HỌC">
      <div className="space-y-6">
        {/* Game List Selector */}
        <div className="grid grid-cols-1 gap-3">
          {gamesList.map((g) => {
            const isSelected = selectedGame === g.type;
            return (
              <div
                key={g.type}
                onClick={() => setSelectedGame(g.type)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center space-x-4 ${
                  isSelected
                    ? `${g.color} ${g.bg} ring-2 ring-sky-400 shadow-md scale-[1.01]`
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">{g.icon}</div>
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 text-base">{g.title}</h4>
                  <p className="text-xs font-medium text-slate-600">{g.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Game Settings Panel */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-sky-600" /> Tùy chỉnh trò chơi:
            </span>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
                soundEnabled ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Âm thanh: BẬT' : 'Âm thanh: TẮT'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Timer setting */}
            {selectedGame === 'QUICK_ANSWER' && (
              <div>
                <label className="block mb-1 font-bold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-600" /> Thời gian đếm ngược:
                </label>
                <select
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value={0}>Không giới hạn</option>
                  <option value={5}>5 giây</option>
                  <option value={10}>10 giây</option>
                  <option value={15}>15 giây</option>
                  <option value={20}>20 giây</option>
                  <option value={30}>30 giây</option>
                </select>
              </div>
            )}

            {/* Door Count setting */}
            {selectedGame === 'MYSTERY_DOOR' && (
              <div>
                <label className="block mb-1 font-bold text-slate-800">Số lượng ô cửa:</label>
                <select
                  value={doorCount}
                  onChange={(e) => setDoorCount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value={4}>4 ô cửa</option>
                  <option value={6}>6 ô cửa</option>
                  <option value={8}>8 ô cửa</option>
                  <option value={9}>9 ô cửa</option>
                </select>
              </div>
            )}

            {/* Box Count setting */}
            {selectedGame === 'KNOWLEDGE_BOX' && (
              <div>
                <label className="block mb-1 font-bold text-slate-800">Số lượng hộp quà:</label>
                <select
                  value={boxCount}
                  onChange={(e) => setBoxCount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value={4}>4 hộp quà</option>
                  <option value={6}>6 hộp quà</option>
                  <option value={8}>8 hộp quà</option>
                  <option value={12}>12 hộp quà</option>
                </select>
              </div>
            )}

            {/* Team Count setting */}
            {selectedGame === 'TEAM_RACE' && (
              <div>
                <label className="block mb-1 font-bold text-slate-800 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-sky-600" /> Số nhóm học tập:
                </label>
                <select
                  value={teamCount}
                  onChange={(e) => setTeamCount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value={2}>2 Đội (Mặt Trời - Ngôi Sao)</option>
                  <option value={3}>3 Đội (+ Cầu Vồng)</option>
                  <option value={4}>4 Đội (+ Sấm Chớp)</option>
                </select>
                <label className="block mt-3 font-bold text-slate-800">Tên nhóm (mỗi dòng một tên, có thể bỏ trống)</label>
                <textarea value={teamNames} onChange={(e) => setTeamNames(e.target.value)} rows={4} className="w-full p-3 border rounded-xl text-slate-900 bg-white" placeholder="Nhóm 1\nNhóm 2" />
                <p className="text-xs text-slate-600 mt-2">Học sinh đã vào phòng được chia đều theo thứ tự tham gia. Hãy chờ đủ học sinh trước khi bắt đầu. Mỗi thành viên nộp riêng; mỗi câu đúng được 1 điểm nhóm.</p>
              </div>
            )}
          </div>
        </div>

        {/* Start Game Action */}
        <Button variant="student" size="xl" fullWidth onClick={handleStart}>
          🚀 BẮT ĐẦU TRÒ CHƠI
        </Button>
      </div>
    </Modal>
  );
};
