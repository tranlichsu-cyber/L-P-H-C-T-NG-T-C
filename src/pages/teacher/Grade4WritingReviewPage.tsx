import {WritingIdentityService} from '../../services/selfPractice/WritingIdentityService';
import {useEffect,useMemo,useState} from 'react';
import {useTeacherData} from '../../context/TeacherDataContext';
import {Grade4WritingReviewService,type TeacherWritingSubmission} from '../../services/selfPractice/Grade4WritingReviewService';

export function Grade4WritingReviewPage(){
 const {classes}=useTeacherData();
 const grade4=useMemo(()=>classes.filter(c=>/^(?:khối\s*)?4$/i.test(c.grade.trim())),[classes]);
 const [classId,setClassId]=useState('');
 const [week,setWeek]=useState('');
 const [studentId,setStudentId]=useState('');
 const [rows,setRows]=useState<TeacherWritingSubmission[]>([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [comments,setComments]=useState<Record<string,string>>({});
 const [saving,setSaving]=useState<string|null>(null);
 const [pinStudentId,setPinStudentId]=useState('');
 const [issuedPin,setIssuedPin]=useState('');
 const [issuing,setIssuing]=useState(false);
 const issuePin=async()=>{setIssuedPin('');setError('');setIssuing(true);try{setIssuedPin(await WritingIdentityService.issuePin(classId,pinStudentId));}catch{setError('Không cấp được mã. Vui lòng kiểm tra quyền quản lý lớp và Firebase Functions.');}finally{setIssuing(false);}};
 const saveComment=async(r:TeacherWritingSubmission)=>{setSaving(r.id);setError('');try{const comment=comments[r.id]??r.teacherComment??'';await WritingIdentityService.comment(r.classId,r.studentId,r.week,comment);setRows(prev=>prev.map(x=>x.id===r.id?{...x,teacherComment:comment}:x));}catch{setError('Không lưu được nhận xét. Kiểm tra quyền giáo viên và kết nối.');}finally{setSaving(null);}};
 useEffect(()=>{setClassId(prev=>grade4.some(c=>c.id===prev)?prev:(grade4[0]?.id||''));},[grade4]);
 useEffect(()=>{let active=true;setRows([]);setError('');setStudentId('');if(!classId)return;setLoading(true);
 Grade4WritingReviewService.listForClass(classId).then(data=>{if(active)setRows(data);}).catch(()=>{if(active)setError('Không thể tải bài làm. Vui lòng kiểm tra quyền giáo viên, quy tắc Firestore và kết nối mạng.');}).finally(()=>{if(active)setLoading(false);});
 return()=>{active=false;};},[classId]);
 const students=grade4.find(c=>c.id===classId)?.students||[];
 const shown=rows.filter(r=>(!week||r.week===Number(week))&&(!studentId||r.studentId===studentId)).sort((a,b)=>a.week-b.week||a.studentName.localeCompare(b.studentName,'vi'));
 return <main className="space-y-6"><header><h1 className="text-2xl font-black text-sky-900">Bài Tập làm văn lớp 4</h1><p className="text-slate-600">Xem dàn ý và bài viết đã lưu của từng học sinh. Chỉ hiển thị dữ liệu được Firebase cấp quyền.</p></header>
 <section className="rounded-2xl border bg-white p-5"><h2 className="mb-3 text-lg font-bold">Cấp hoặc cấp lại mã học sinh</h2><p className="mb-3 text-sm">Mã mới chỉ hiển thị một lần. Hãy phát riêng cho đúng học sinh hoặc phụ huynh.</p><div className="flex flex-wrap gap-3"><select className="min-w-48 rounded-xl border p-3" value={pinStudentId} onChange={e=>{setPinStudentId(e.target.value);setIssuedPin('');}}><option value="">Chọn học sinh</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><button className="rounded-xl bg-sky-700 px-4 py-2 font-bold text-white disabled:opacity-50" disabled={!classId||!pinStudentId||issuing} onClick={()=>void issuePin()}>{issuing?'Đang tạo…':'Tạo / cấp lại mã'}</button></div>{issuedPin&&<div className="mt-3 rounded-xl border border-amber-400 bg-amber-50 p-4"><p>Mã mới: <strong className="text-2xl tracking-widest">{issuedPin}</strong></p><button className="mt-2 underline" onClick={()=>setIssuedPin('')}>Ẩn mã</button></div>}</section><section className="grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-3">
 <label className="font-semibold">Lớp<select className="mt-2 block w-full rounded-xl border p-3" value={classId} onChange={e=>setClassId(e.target.value)}><option value="">Chọn lớp</option>{grade4.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <label className="font-semibold">Tuần<select className="mt-2 block w-full rounded-xl border p-3" value={week} onChange={e=>setWeek(e.target.value)}><option value="">Tất cả các tuần</option>{Array.from({length:35},(_,i)=>i+1).map(n=><option key={n} value={n}>Tuần {n}</option>)}</select></label>
 <label className="font-semibold">Học sinh<select className="mt-2 block w-full rounded-xl border p-3" value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">Tất cả học sinh</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
 </section>
 {loading&&<p role="status">Đang tải bài làm…</p>}{error&&<p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>}
 {!loading&&!error&&<p className="font-semibold text-slate-600">{shown.length} bài làm</p>}
 <section className="space-y-4">{shown.map(r=><article key={r.id} className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">{r.studentName} – Tuần {r.week}</h2><p className="text-sm text-slate-500">{r.status==='SUBMITTED'?'Đã nộp':'Bản nháp'} • {r.updatedAt}</p><h3 className="mt-4 font-bold">Dàn ý</h3><p className="whitespace-pre-wrap">{r.outline}</p><h3 className="mt-4 font-bold">Bài viết</h3><p className="whitespace-pre-wrap">{r.writing}</p><label className="mt-4 block font-bold">Nhận xét của giáo viên<textarea className="mt-2 block w-full rounded-xl border p-3 font-normal" maxLength={3000} rows={3} value={comments[r.id]??r.teacherComment??''} onChange={e=>setComments(prev=>({...prev,[r.id]:e.target.value}))}/></label><button className="mt-2 rounded-xl bg-sky-700 px-4 py-2 font-bold text-white disabled:opacity-50" disabled={saving===r.id} onClick={()=>void saveComment(r)}>{saving===r.id?'Đang lưu…':'Lưu nhận xét'}</button></article>)}</section>
 </main>;
}
