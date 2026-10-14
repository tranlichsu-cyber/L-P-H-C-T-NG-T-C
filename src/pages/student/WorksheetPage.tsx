import {useEffect,useState} from 'react';
import {Link,Navigate} from 'react-router-dom';
import {useStudentSession} from '../../context/StudentSessionContext';
import {useWorksheet,useWorksheetState} from '../../hooks/useWorksheet';
import {WorksheetService} from '../../services/worksheets/WorksheetService';
import {WordDocument} from '../../components/worksheets/WordDocument';
import type {RoomWorksheet,WorksheetResponse} from '../../services/worksheets/content';
function WorksheetForm({sheet,studentId,studentName,work,finished}:{sheet:RoomWorksheet;studentId:string;studentName:string;work?:WorksheetResponse;finished:boolean}){
 const key=['worksheet-draft',sheet.roomId,sheet.id,studentId].join(':');
 const [answers,setAnswers]=useState<Record<string,string>>(()=>{try{const value=JSON.parse(localStorage.getItem(key)||'{}');return Object.fromEntries(sheet.questions.map(q=>[q.id,typeof value?.[q.id]==='string'?value[q.id]:'']));}catch{return {};}});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState(false),[draftError,setDraftError]=useState(false);
 useEffect(()=>{let active=true;Promise.resolve().then(()=>{if(active){try{localStorage.setItem(key,JSON.stringify(answers));setDraftError(false);}catch{setDraftError(true);}}});return()=>{active=false;};},[key,answers]);
 const locked=sheet.status!=='OPEN'||finished||!!work||sent;
 return <section className="space-y-5"><h1 className="text-2xl font-black text-sky-950">{sheet.title}</h1><p className="font-bold">{studentName} • Phiếu bài tập trong buổi học</p><WordDocument html={sheet.html}/><form className="bg-white rounded-2xl border-2 border-sky-200 p-4 sm:p-6 space-y-5" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const payload=Object.fromEntries(sheet.questions.map(q=>[q.id,(answers[q.id]||'').trim()]));await WorksheetService.submit(sheet.roomId,sheet.id,studentId,payload);setSent(true);}catch(err){setError((err as Error).message||'Chưa gửi được bài. Em giữ trang này và thử nộp lại.');}finally{setBusy(false);}}}><h2 className="text-xl font-black">Bài làm của em</h2>{sheet.questions.map((q,i)=><label key={q.id} className="block font-bold">{i+1}. {q.label}<textarea aria-label={'Trả lời phần '+(i+1)} maxLength={10000} required disabled={busy} readOnly={locked} value={work?.answers[q.id]??answers[q.id]??''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} rows={5} className="block w-full mt-2 rounded-xl border-2 border-sky-200 p-3 font-normal text-lg select-text" placeholder="Em làm bài ở đây…"/></label>)}{draftError&&<p role="alert" className="text-amber-900">Chưa lưu được bản nháp trên thiết bị. Em hãy sao chép bài trước khi rời trang.</p>}{error&&<p role="alert" className="text-red-800">{error}</p>}{work||sent?<p role="status" className="rounded-xl bg-emerald-50 p-4 font-bold text-emerald-900">Đã nộp phiếu. Giáo viên có thể xem và chọn bài của em để trình chiếu.</p>:sheet.status!=='OPEN'||finished?<p className="rounded-xl bg-amber-50 p-4">Giáo viên đã khóa nhận bài hoặc kết thúc buổi học. Bản nháp của em vẫn lưu trên thiết bị này.</p>:<><p className="text-sm text-slate-600">Em kiểm tra lại trước khi nộp. Bài đã nộp không sửa được. Bản nháp lưu riêng cho em trên thiết bị này.</p><button disabled={busy||!sheet.questions.every(q=>answers[q.id]?.trim())} className="min-h-12 rounded-xl bg-sky-700 text-white p-3 font-bold disabled:opacity-40">{busy?'Đang nộp…':'Nộp phiếu bài tập'}</button></>}</form></section>;
}
export function WorksheetPage(){
 const {session,room}=useStudentSession();
 const roomId=session.studentId?session.roomId:null;
 const {state,error:stateError}=useWorksheetState(roomId);
 const {sheet,responses,error}=useWorksheet(roomId,state.worksheetId,session.studentId);
 if(!session.roomId)return <Navigate to="/student/join" replace/>;
 if(!session.studentId)return <Navigate to="/student/select-name" replace/>;
 return <div className="space-y-5"><Link to="/student/waiting" className="underline font-bold text-sky-800">← Về buổi học</Link>{(error||stateError)&&<p role="alert" className="text-red-800">{error||stateError}</p>}{!state.worksheetId?<p className="bg-white p-5 rounded-xl">Giáo viên chưa phát phiếu hoặc đã thu phiếu. Em quay lại buổi học để tiếp tục.</p>:!sheet?<p role="status">Đang tải phiếu…</p>:<WorksheetForm key={sheet.id+session.studentId} sheet={sheet} studentId={session.studentId} studentName={session.studentName||'Học sinh'} work={responses.find(w=>w.studentId===session.studentId)} finished={room?.status==='FINISHED'}/>}</div>;
}
