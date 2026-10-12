import React from 'react';
import type { MockRoomData } from '../../services/realtime/types';
export function sessionRanking(room:MockRoomData) {
 const students=new Map<string,{id:string;name:string;score:number}>();
 Object.values(room.participants || {}).forEach(p=>students.set(p.studentId,{id:p.studentId,name:p.name,score:0}));
 Object.values(room.scores || {}).forEach(s=>students.set(s.studentId,{id:s.studentId,name:s.studentName || students.get(s.studentId)?.name || 'Học sinh',score:Number.isFinite(s.score)?s.score:0}));
 const sorted=[...students.values()].sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name,'vi'));
 return sorted.map(s=>({...s,rank:sorted.findIndex(row=>row.score===s.score)+1}));
}
export const SessionLeaderboard:React.FC<{room:MockRoomData}> = ({room})=>{
 const ranking=sessionRanking(room);
 return <aside aria-label="Bảng xếp hạng buổi học" className="bg-slate-900 border-2 border-sky-800 rounded-2xl flex flex-col min-h-0 overflow-hidden h-full">
 <header className="p-3 border-b border-slate-700 shrink-0"><h2 className="text-base font-black text-amber-300">🏆 BẢNG XẾP HẠNG</h2><p className="text-xs text-slate-300 mt-1">Điểm trong buổi học này • {ranking.length} học sinh</p></header>
 <ol className="p-2 space-y-2 overflow-y-auto flex-1 min-h-0">{ranking.map(s=><li key={s.id} className={`flex gap-2 items-center rounded-xl p-2 border ${s.rank===1?'bg-amber-400/15 border-amber-400/60':'bg-slate-800 border-slate-700'}`}><span className="w-5 shrink-0 font-black text-base text-amber-300">{s.rank}</span><span className="flex-1 min-w-0 break-words text-base font-bold text-white">{s.name}</span><span className="font-black text-xl text-sky-300 shrink-0">{s.score}<span className="block text-xs text-center text-slate-300">điểm</span></span></li>)}</ol>
 {!ranking.length && <p className="p-4 text-slate-300">Học sinh sẽ xuất hiện khi tham gia phòng.</p>}
 </aside>;
};
