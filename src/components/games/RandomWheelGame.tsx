import {wheelStopRotation} from '../../services/realtime/gamePolicy';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';
import type { MockParticipant } from '../../services/realtime/types';
import { playTickSound, playFanfareSound } from '../../utils/audio';
// RandomWheelGame Component

interface RandomWheelGameProps {
  paused?:boolean;
  participants: MockParticipant[];
  calledStudentIds: string[];
  onSpinFinish: (selected: MockParticipant) => void;
  onAwardOralScore: (studentId: string, studentName: string, points: number, reason: string,awardKey:string) => Promise<void>;
  onCloseGame: () => void;
}

export const RandomWheelGame: React.FC<RandomWheelGameProps> = ({
  participants,
  paused=false,
  calledStudentIds,
  onSpinFinish,
  onAwardOralScore,
  onCloseGame,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<MockParticipant | null>(null);
  const [prioritizeUncalled, setPrioritizeUncalled] = useState(true);
  const rotationRef = useRef(0);
  const frozenPool=useRef<MockParticipant[]|null>(null),frame=useRef(0),pausedRef=useRef(paused),awardKey=useRef(''),awardLock=useRef(false);
  const [awarded,setAwarded]=useState(false),[awarding,setAwarding]=useState(false),[awardError,setAwardError]=useState('');
  useEffect(()=>{pausedRef.current=paused;},[paused]);
  useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
  const award=async(points:number,reason:string)=>{if(!winner||awardLock.current||awarded||paused)return;awardLock.current=true;setAwarding(true);setAwardError('');try{await onAwardOralScore(winner.studentId,winner.name,points,reason,awardKey.current);setAwarded(true);}catch(e){setAwardError((e as Error).message||'Chưa lưu được điểm. Thầy/cô thử lại.');}finally{awardLock.current=false;setAwarding(false);}};

  const colors = ['#f59e0b', '#06b6d4', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#3b82f6', '#84cc16'];

  // Available students based on fairness filter
  const uncalled = participants.filter((p) => !calledStudentIds.includes(p.studentId));
  const activePool = prioritizeUncalled && uncalled.length > 0 ? uncalled : participants;

  // Draw Canvas Wheel
  const drawWheel = (currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    if (activePool.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chưa có học sinh nào vào phòng!', centerX, centerY);
      return;
    }

    const pool=frozenPool.current||activePool;
    const arc = (2 * Math.PI) / pool.length;

    // Draw slices
    pool.forEach((p, idx) => {
      const angle = currentRotation + idx * arc;
      ctx.beginPath();
      ctx.fillStyle = colors[idx % colors.length];
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Name Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(p.name, radius - 20, 5);
      ctx.restore();
    });

    // Center Peg
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel(rotationRef.current);
  });

  // Spin Wheel Logic
  const handleSpin = () => {
    if (isSpinning || paused || awarding || activePool.length === 0) return;

    setIsSpinning(true);
    setWinner(null);setAwarded(false);setAwardError('');awardKey.current='wheel_'+crypto.randomUUID();frozenPool.current=[...activePool];

    const targetStudentIdx = Math.floor(Math.random() * activePool.length);
    const selectedStudent = activePool[targetStudentIdx];

    const duration = 3000;
    const start = performance.now();
    const initialRot = rotationRef.current;
    const spinAngle=wheelStopRotation(initialRot,targetStudentIdx,activePool.length)-initialRot;
    let elapsed=0,lastFrame=start;

    let lastTickAngle = initialRot;

    const animate = (now: number) => {
      if(!pausedRef.current)elapsed+=now-lastFrame;lastFrame=now;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRot = initialRot + spinAngle * easeOut;

      rotationRef.current = currentRot;
      drawWheel(currentRot);

      // Ticking sound effect
      if (currentRot - lastTickAngle > 0.3) {
        playTickSound();
        lastTickAngle = currentRot;
      }

      if (progress < 1) {
        frame.current=requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWinner(selectedStudent);
        playFanfareSound();
        onSpinFinish(selectedStudent);
      }
    };

    frame.current=requestAnimationFrame(animate);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 text-center animate-fade-in border-2 border-slate-800">
      <div className="flex flex-wrap gap-3 items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="text-2xl font-black text-amber-400 flex items-center gap-2">
          🎯 VÒNG QUAY GỌI HỌC SINH
        </h3>
        <Button variant="outline" size="sm" onClick={onCloseGame} className="text-slate-300 border-slate-700">
          Đóng Trò Chơi
        </Button>
      </div>

      {/* Wheel Container */}
      <div className="relative inline-block my-4 w-full max-w-[380px]">
        {/* Pointer Triangle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-10 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[32px] border-t-amber-400 drop-shadow-lg" />

        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="w-full h-auto mx-auto rounded-full shadow-2xl border-4 border-slate-800 bg-slate-950"
        />
      </div>

      {/* Fairness Option */}
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
        <input
          type="checkbox"
          id="fairness"
          checked={prioritizeUncalled}
          onChange={(e) => setPrioritizeUncalled(e.target.checked)}
          className="rounded text-amber-500"
        />
        <label htmlFor="fairness">Ưu tiên học sinh chưa được gọi ({uncalled.length}/{participants.length} em chưa gọi)</label>
      </div>

      {/* Winner Overlay Card */}
      {winner && (
        <div className="p-6 rounded-2xl bg-amber-400 text-slate-950 space-y-4 border-4 border-amber-300 shadow-2xl">
          <span className="text-xs font-bold uppercase tracking-widest block opacity-90">🏆 CHÚC MỪNG HỌC SINH</span>
          <h2 className="text-3xl font-black uppercase break-words">{winner.name}</h2>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              disabled={awarded||awarding||paused} onClick={()=>void award(10,'Phát biểu đúng')}
            >
              +10 Trả lời đúng
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={awarded||awarding||paused} onClick={()=>void award(5,'Có cố gắng phát biểu')}
            >
              +5 Có cố gắng
            </Button>
            <Button variant="outline" size="sm" disabled={awarding||paused} onClick={handleSpin} className="border-slate-900 text-slate-950">
              Quay tiếp
            </Button>
          </div>
        </div>
      )}

      {awarded&&<p role="status">Đã ghi nhận điểm cho lượt này.</p>}{awardError&&<p role="alert">{awardError}</p>}
      {!winner && (
        <Button
          variant="student"
          size="xl"
          onClick={handleSpin}
          disabled={paused||isSpinning || activePool.length === 0}
          className="w-full max-w-sm mx-auto font-black"
        >
          {isSpinning ? 'ĐANG QUAY...' : '🎯 BẮT ĐẦU QUAY'}
        </Button>
      )}
    </div>
  );
};
