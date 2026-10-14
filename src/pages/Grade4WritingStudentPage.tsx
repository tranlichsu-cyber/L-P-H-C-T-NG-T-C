import {useEffect,useState} from 'react';
import {grade4WritingWeeks} from '../data/grade4WritingWeeks';
import {WritingIdentityService,type WritingIdentity} from '../services/selfPractice/WritingIdentityService';
export function Grade4WritingStudentPage(){
 const [classId,setClassId]=useState(''),[studentId,setStudentId]=useState(''),[pin,setPin]=useState('');
 const [identity,setIdentity]=useState<WritingIdentity|null>(null),[week,setWeek]=useState(1);
 const [outline,setOutline]=useState(''),[writing,setWriting]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[submitted,setSubmitted]=useState(false);
 const [suggestionOpen,setSuggestionOpen]=useState(false);
 const [loadingSaved,setLoadingSaved]=useState(false);
 const [teacherComment,setTeacherComment]=useState('');
 const lesson=grade4WritingWeeks[week-1];
 useEffect(()=>{
  if(!identity)return;
  let active=true;
  WritingIdentityService.get(identity,week).then(result=>{
   if(!active)return;
   setOutline(result.found?result.outline||'':'');
   setWriting(result.found?result.writing||'':'');
   setSubmitted(result.found&&result.status==='SUBMITTED');
   setTeacherComment(result.found?result.teacherComment||'':'');
   setSuggestionOpen(false);
  }).catch(()=>{if(active)setMessage('Không tải được bài đã lưu. Vui lòng thử lại khi có mạng.');}).finally(()=>{if(active)setLoadingSaved(false);});
  setLoadingSaved(true);
  return()=>{active=false;};
 },[identity,week]);
 const verify=async()=>{setBusy(true);setMessage('');try{setIdentity(await WritingIdentityService.verify(classId,studentId,pin));setPin('');}catch{setMessage('Không xác minh được. Kiểm tra mã và liên hệ giáo viên.');}finally{setBusy(false);}};
 const save=async(status:'DRAFT'|'SUBMITTED')=>{if(!identity)return;setBusy(true);setMessage('');try{await WritingIdentityService.save(identity,week,outline,writing,status);setSubmitted(status==='SUBMITTED');setMessage(status==='SUBMITTED'?'Đã nộp bài thành công.':'Đã lưu bản nháp.');}catch{setMessage('Không lưu được bài. Kiểm tra kết nối hoặc mã đã được cấp lại.');}finally{setBusy(false);}};
 return <main className="mx-auto max-w-3xl space-y-5 p-5"><h1 className="text-2xl font-black text-sky-900">Tập làm văn lớp 4</h1>{!identity?<section className="space-y-3 rounded-2xl border bg-white p-5"><p>Nhập mã lớp và mã học sinh do giáo viên cung cấp, sau đó nhập mã xác nhận riêng.</p><input className="w-full rounded-xl border p-3" placeholder="Mã lớp" value={classId} onChange={e=>setClassId(e.target.value)}/><input className="w-full rounded-xl border p-3" placeholder="Mã học sinh" value={studentId} onChange={e=>setStudentId(e.target.value)}/><input className="w-full rounded-xl border p-3" placeholder="Mã xác nhận 6 chữ số" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value)}/><button disabled={busy||pin.length!==6||!classId||!studentId} onClick={()=>void verify()} className="rounded-xl bg-sky-700 p-3 text-white disabled:opacity-50">Xác minh</button></section>:<section className="space-y-4 rounded-2xl border bg-white p-5"><label className="block font-bold">Tuần<select className="ml-3 rounded-xl border p-2" value={week} onChange={e=>{setWeek(Number(e.target.value));setOutline('');setWriting('');setSubmitted(false);setSuggestionOpen(false);setTeacherComment('');setMessage('');}}>{Array.from({length:35},(_,i)=>i+1).map(n=><option key={n} value={n}>Tuần {n}</option>)}</select></label><div className="rounded-xl bg-sky-50 p-4"><h2 className="text-lg font-bold">{lesson.title}</h2><p className="mt-1 text-sm">{lesson.genre} • Bộ luyện viết bổ trợ</p><p className="mt-3 font-semibold">1. {lesson.outlinePrompt}</p><p className="mt-2 font-semibold">2. {lesson.writingPrompt}</p></div><label className="block font-bold">1. Lập ý / cấu trúc văn bản<textarea className="mt-2 block w-full rounded-xl border p-3 font-normal" rows={8} value={outline} onChange={e=>setOutline(e.target.value)} disabled={submitted||loadingSaved}/></label><label className="block font-bold">2. Viết theo đúng thể loại yêu cầu<textarea className="mt-2 block w-full rounded-xl border p-3 font-normal" rows={14} value={writing} onChange={e=>setWriting(e.target.value)} disabled={submitted}/></label><div className="flex gap-3"><button disabled={busy||submitted||loadingSaved} className="rounded-xl border p-3 disabled:opacity-50" onClick={()=>void save('DRAFT')}>Lưu nháp</button><button disabled={busy||submitted||loadingSaved||!outline.trim()||!writing.trim()} className="rounded-xl bg-sky-700 p-3 text-white disabled:opacity-50" onClick={()=>void save('SUBMITTED')}>Nộp bài</button></div>{submitted&&<div className="mt-4 rounded-xl border p-4"><button className="font-bold text-sky-800 underline" onClick={()=>setSuggestionOpen(v=>!v)}>{suggestionOpen?'Ẩn gợi ý':'Gợi ý'}</button>{suggestionOpen&&<p className="mt-2 text-slate-700">Em kiểm tra xem bài làm đã đúng thể loại và yêu cầu đề bài chưa, sắp xếp ý rõ ràng, bổ sung chi tiết cần thiết và sửa lỗi chính tả. Nội dung sau đây chỉ để tham khảo, không chép lại.</p>}{suggestionOpen&&<p className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3">{lesson.suggestedWriting}</p>}</div>}{teacherComment&&<div className="rounded-xl border border-sky-200 bg-sky-50 p-4"><h3 className="font-bold">Nhận xét của giáo viên</h3><p className="mt-2 whitespace-pre-wrap">{teacherComment}</p></div>}{loadingSaved&&<p role="status">Đang tải bài đã lưu…</p>}</section>}{message&&<p role="status" className="rounded-xl bg-sky-50 p-3">{message}</p>}</main>;
}
