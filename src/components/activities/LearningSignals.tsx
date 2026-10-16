import {useAuth} from '../../context/AuthContext';
import {useEffect,useState} from 'react';
import {LearningSignalService,signalLabels,type LearningSignal} from '../../services/worksheets/LearningSignalService';
function useSignals(roomId:string,studentId:string|null){
 const {currentUser}=useAuth();
 const key=JSON.stringify([currentUser?.uid||'local',roomId,studentId]);
 const [state,setState]=useState<{key:string;signals:LearningSignal[];error:string}>({key:'',signals:[],error:''});
 useEffect(()=>LearningSignalService.subscribe(roomId,studentId,signals=>setState({key,signals,error:''}),()=>setState({key,signals:[],error:'Chưa đồng bộ được tín hiệu. Vui lòng kiểm tra kết nối.'})),[roomId,studentId,key]);
 return state.key===key?state:{key,signals:[],error:''};
}
export function StudentLearningSignal({roomId,studentId,finished}:{roomId:string;studentId:string;finished:boolean}){
 const {signals,error:loadError}=useSignals(roomId,studentId),current=signals[0];
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 return <section aria-label="Tín hiệu học tập của em" className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3"><h2 className="font-black text-lg text-amber-950">Thầy/cô ơi, em…</h2><div className="grid gap-2 sm:grid-cols-3">{Object.entries(signalLabels).map(([level,label])=><button key={level} type="button" disabled={busy||finished||(current?.level===level&&!current.handled)} aria-pressed={current?.level===level} onClick={async()=>{setBusy(true);setError('');try{await LearningSignalService.send(roomId,studentId,level as LearningSignal['level']);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}} className={`min-h-12 rounded-xl border-2 bg-white px-3 py-3 font-bold disabled:opacity-60 ${current?.level===level?'border-amber-700 text-amber-950':'border-amber-100 text-slate-900'}`}>{label}</button>)}</div><p className="text-sm">Chỉ thầy/cô thấy tín hiệu của em. Em có thể đổi khi cần; tín hiệu không tính điểm.</p>{current&&<p role="status" className="font-semibold">{current.handled?'Thầy/cô đã ghi nhận hỗ trợ. Em có thể báo lại nếu vẫn cần giúp.':'Đã gửi: '+signalLabels[current.level]}</p>}{finished&&<p>Buổi học đã kết thúc.</p>}{(error||loadError)&&<p role="alert" className="text-red-800">{error||loadError}</p>}</section>;
}
export function TeacherLearningSignals({roomId}:{roomId:string}){
 const {signals,error:loadError}=useSignals(roomId,null);
 const [busy,setBusy]=useState(''),[error,setError]=useState('');
 const pending=signals.filter(s=>s.level!=='UNDERSTOOD'&&!s.handled).sort((a,b)=>a.updatedAt.localeCompare(b.updatedAt));
 return <section aria-label="Tín hiệu cần hỗ trợ" className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3"><h2 className="text-xl font-black text-amber-950">Nhịp học của lớp</h2><div className="grid grid-cols-3 gap-2">{Object.entries(signalLabels).map(([level,label])=><p key={level} className="rounded-xl bg-white p-3"><strong className="block text-2xl">{signals.filter(s=>s.level===level&&(level==='UNDERSTOOD'||!s.handled)).length}</strong>{label}</p>)}</div><p className="text-sm">Các em đang chờ hỗ trợ: {pending.length}. Tín hiệu gần nhất của từng em được giữ trong buổi học.</p>{pending.map(s=><div key={s.studentId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3"><p><strong>{s.studentName}</strong> • {signalLabels[s.level]}</p><button type="button" disabled={!!busy} onClick={async()=>{setBusy(s.studentId);setError('');try{await LearningSignalService.acknowledge(roomId,s.studentId,s.requestId);}catch(e){setError((e as Error).message);}finally{setBusy('');}}} className="min-h-11 rounded-xl border px-4 font-bold disabled:opacity-40">Đã hỗ trợ {s.studentName}</button></div>)}{(error||loadError)&&<p role="alert" className="text-red-800">{error||loadError}</p>}</section>;
}
