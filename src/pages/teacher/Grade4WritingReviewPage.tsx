import {useEffect,useMemo,useState} from 'react';
import {useTeacherData} from '../../context/TeacherDataContext';
import {Grade4WritingReviewService,type TeacherWritingSubmission} from '../../services/selfPractice/Grade4WritingReviewService';

export function Grade4WritingReviewPage(){
 const {classes}=useTeacherData();
 const grade4=useMemo(()=>classes.filter(c=>/^(?:khối\\s*)?4$/i.test(c.grade.trim())),[classes]);
 const [classId,setClassId]=useState('');
 const [week,setWeek]=useState('');
 const [studentId,setStudentId]=useState('');
 const [rows,setRows]=useState<TeacherWritingSubmission[]>([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{setClassId(prev=>grade4.some(c=>c.id===prev)?prev:(grade4[0]?.id||''));},[grade4]);
 useEffect(()=>{let active=true;setRows([]);setError('');setStudentId('');if(!classId)return;setLoading(true);
 Grade4WritingReviewService.listForClass(classId).then(data=>{if(active)setRows(data);}).catch(()=>{if(active)setError('Không thể tải bài làm. Vui lòng kiểm tra quyền giáo viên, quy tắc Firestore và kết nối mạng.');}).finally(()=>{if(active)setLoading(false);});
 return()=>{active=false;};},[classId]);
 const students=grade4.find(c=>c.id===classId)?.students||[];
 const shown=rows.filter(r=>(!week||r.week===Number(week))&&(!studentId||r.studentId===studentId)).sort((a,b)=>a.week-b.week||a.studentName.localeCompare(b.studentName,'vi'));
 return <main className="space-y-6"><header><h1 className="text-2xl font-black text-sky-900">Bài Tập làm văn lớp 4</h1><p className="text-slate-600">Xem dàn ý và bài viết đã lưu của từng học sinh. Chỉ hiển thị dữ liệu được Firebase cấp quyền.</p></header>
 <section className="grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-3">
 <label className="font-semibold">Lớp<select className="mt-2 block w-full rounded-xl border p-3" value={classId} onChange={e=>setClassId(e.target.value)}><option value="">Chọn lớp</option>{grade4.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <label className="font-semibold">Tuần<select className="mt-2 block w-full rounded-xl border p-3" value={week} onChange={e=>setWeek(e.target.value)}><option value="">Tất cả các tuần</option>{Array.from({length:35},(_,i)=>i+1).map(n=><option key={n} value={n}>Tuần {n}</option>)}</select></label>
 <label className="font-semibold">Học sinh<select className="mt-2 block w-full rounded-xl border p-3" value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">Tất cả học sinh</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
 </section>
 {loading&&<p role="status">Đang tải bài làm…</p>}{error&&<p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>}
 {!loading&&!error&&<p className="font-semibold text-slate-600">{shown.length} bài làm</p>}
 <section className="space-y-4">{shown.map(r=><article key={r.id} className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">{r.studentName} – Tuần {r.week}</h2><p className="text-sm text-slate-500">{r.status==='SUBMITTED'?'Đã nộp':'Bản nháp'} • {r.updatedAt}</p><h3 className="mt-4 font-bold">Dàn ý</h3><p className="whitespace-pre-wrap">{r.outline}</p><h3 className="mt-4 font-bold">Bài viết</h3><p className="whitespace-pre-wrap">{r.writing}</p>{r.teacherComment&&<p className="mt-4 rounded-xl bg-sky-50 p-3"><strong>Nhận xét: </strong>{r.teacherComment}</p>}</article>)}</section>
 </main>;
}
