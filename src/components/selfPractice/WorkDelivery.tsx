import {useEffect,useState} from 'react';
import {StudentAccessService,type StudentAccess} from '../../services/selfPractice/studentAccess';
import type {SelfPracticeQuiz} from '../../services/selfPractice/content';
export interface WorkPayload {id:string; data:{answers:Record<string,string>}|{outline:string[];essay:string}}
export function WorkDelivery({student,quiz,work,onSaved}:{student:StudentAccess;quiz:SelfPracticeQuiz;work:WorkPayload;onSaved:()=>void}){
 const [status,setStatus]=useState('Đang gửi bài cho giáo viên…'),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;StudentAccessService.submit(student,quiz,work.data,work.id).then(()=>{if(active){setStatus('Đã gửi bài. Giáo viên có thể xem bài làm của em.');onSaved();}}).catch(()=>{if(active){setFailed(true);setStatus('Chưa gửi được bài. Em giữ trang này và bấm Gửi lại; kiểm tra kết nối hoặc liên hệ giáo viên nếu mã đã bị thu hồi.');}});return()=>{active=false;};},[student,quiz,work,retry,onSaved]);
 return <div role="status" className={`rounded-xl border p-4 ${failed?'bg-amber-50 border-amber-300':'bg-emerald-50 border-emerald-200'}`}>{status}{failed&&<button onClick={()=>{setFailed(false);setStatus('Đang gửi bài cho giáo viên…');setRetry(n=>n+1);}} className="block mt-3 underline font-bold">Gửi lại bài</button>}</div>;
}
