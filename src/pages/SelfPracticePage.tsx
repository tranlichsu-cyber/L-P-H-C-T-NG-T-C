import {RewardShop,EquippedAvatar} from '../components/rewards/RewardShop';
import {useCallback,useEffect,useState} from 'react';
import {StudentEntry} from '../components/selfPractice/StudentEntry';
import {WorkDelivery,type WorkPayload} from '../components/selfPractice/WorkDelivery';
import {StudentAccessService, type StudentAccess} from '../services/selfPractice/studentAccess';
import {getWritingLesson,withWeeklyWritingSets} from '../data/writing';
import {WritingPracticeRunner} from '../components/writing/WritingPracticeRunner';
import {Link} from 'react-router-dom';
import {BookOpen,Search,ClipboardList,PenLine,Home,Sparkles} from 'lucide-react';
import {SelfPracticeService} from '../services/selfPractice/SelfPracticeService';
import {catalogueSearch,quizWeeks,compareQuiz,withoutRepeatedWritingSets} from '../services/selfPractice/catalogue';
import {matchesGrade,type SelfPracticeQuiz} from '../services/selfPractice/content';
import {curatedTraditionQuizzes} from '../data/traditionQuizzes';
import {TraditionQuizRunner} from '../components/tradition/TraditionQuizRunner';
import { SCHOOL_LOGO_SRC } from '../assets/schoolLogo';
import { BUILTIN_MIDTERM_EXAMS } from '../data/exams/builtInMidtermExams';

const builtIn: SelfPracticeQuiz[] = withWeeklyWritingSets([
  ...curatedTraditionQuizzes.map((q) => ({
    ...q,
    teacherId: 'editorial',
    subject: 'Giáo dục địa phương',
    published: true as const,
    updatedAt: '2026-10-13',
  })),
  ...BUILTIN_MIDTERM_EXAMS,
]);
export function SelfPracticePage(){
 const [student,setStudent]=useState<StudentAccess|null>(null),[work,setWork]=useState<WorkPayload|null>(null),[saved,setSaved]=useState(true);
 const [checkingSaved,setCheckingSaved]=useState<boolean>(()=>{
   try { return Boolean(localStorage.getItem('lhtt_self_practice_code')); } catch { return false; }
 });
 useEffect(()=>{
   let alive=true;
   const savedCode=localStorage.getItem('lhtt_self_practice_code');
   if(savedCode){
     StudentAccessService.enter(savedCode).then(access=>{
       if(alive){
         setStudent(access);
         setGrade(access.grade.match(/[1-5]/)?.[0]||'');
       }
     }).catch(err=>{
       console.warn('Mã tự luyện không còn hiệu lực:',err);
       try{localStorage.removeItem('lhtt_self_practice_code');}catch{}
     }).finally(()=>{
       if(alive)setCheckingSaved(false);
     });
   }else{
     setCheckingSaved(false);
   }
   return()=>{alive=false;};
 },[]);
 const markSaved=useCallback(()=>setSaved(true),[]);
 const complete=useCallback((data:WorkPayload['data'])=>{setSaved(false);setWork({id:crypto.randomUUID(),data});},[]);
 const [weekFilter,setWeekFilter]=useState(''),[items,setItems]=useState<SelfPracticeQuiz[]>(builtIn),[loading,setLoading]=useState(true),[error,setError]=useState(''),[grade,setGrade]=useState(''),[subject,setSubject]=useState(''),[search,setSearch]=useState(''),[selected,setSelected]=useState<SelfPracticeQuiz|null>(null),[retry,setRetry]=useState(0),[section,setSection]=useState<'PRACTICE'|'WRITING'|'EXAM'>('PRACTICE');
 useEffect(()=>{let alive=true;SelfPracticeService.list(true,retry>0).then(data=>{if(alive){setItems(withWeeklyWritingSets([...data,...builtIn.filter(q=>!data.some(item=>item.id===q.id))]));setError('');}}).catch(()=>{if(alive)setError('Chưa tải được bộ đề giáo viên đã công khai. Em có thể làm các bộ đề có sẵn hoặc bấm tải lại.');}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[retry]);
 const shown=withoutRepeatedWritingSets(items.filter(q=>{
  const writing=getWritingLesson(q);
  return (Boolean(writing)||q.questions.length>0)&&(section==='WRITING'?Boolean(writing):(q.category||'PRACTICE')===section)&&matchesGrade(q.grade,grade)&&(!subject||q.subject===subject)&&(!weekFilter||quizWeeks(q.title).includes(Number(weekFilter)))&&catalogueSearch(search,[q.title,q.subject,writing?.title,writing?.topic,quizWeeks(q.title).map(w=>'tuần '+w).join(' ')]);
 })).sort(compareQuiz);
 const hasFilters=Boolean(grade||subject||weekFilter||search.trim());
 const clearFilters=()=>{setGrade('');setSubject('');setWeekFilter('');setSearch('');};
 const writingLesson=selected?getWritingLesson(selected):undefined;
 const back=()=>{if(!saved&&!window.confirm('Bài chưa được gửi cho giáo viên. Em muốn rời bài này?'))return;setWork(null);setSaved(true);setSelected(null);requestAnimationFrame(()=>document.getElementById('practice-list-heading')?.focus());};
 return <div className="learning-shell min-h-screen text-slate-900">
  <header className="sticky top-0 z-30 border-b border-sky-200/80 bg-white/90 backdrop-blur-md px-5 py-3 shadow-2xs">
   {student ? (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
     <div className="flex min-w-0 items-center gap-3">
      <EquippedAvatar identity={{classId:student.classId,studentId:student.studentId,accessCode:student.code}}/>
      <div className="min-w-0">
       <h1 className="break-words text-xl font-black text-violet-950">{student.studentName}</h1>
       <p className="font-bold text-sky-800">Lớp {student.className}</p>
      </div>
     </div>
     <div className="flex items-center gap-2">
      <button type="button" className="min-h-11 rounded-xl border border-violet-200 bg-violet-50/70 hover:bg-violet-100 px-4 py-2 font-bold text-violet-900 transition-colors" onClick={()=>{if(!saved&&!window.confirm('Bài chưa được gửi. Em muốn đổi học sinh?'))return;try{localStorage.removeItem('lhtt_self_practice_code');}catch{}setStudent(null);setSelected(null);setWork(null);setSaved(true);}}>Đổi học sinh</button>
      <Link to="/" className="min-h-11 inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 text-sm font-black text-sky-900 transition-colors">
       <Home size={16} className="text-sky-700"/>
       <span>Trang chủ</span>
      </Link>
     </div>
    </div>
   ) : (
    <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
     <div className="flex items-center gap-3">
      <img src={SCHOOL_LOGO_SRC} alt="Logo Trường Tiểu học Sông Công" className="w-11 h-11 object-contain shrink-0 drop-shadow-xs"/>
      <div>
       <p className="font-black text-sky-950 text-sm sm:text-base leading-tight">TRƯỜNG TIỂU HỌC SÔNG CÔNG</p>
       <span className="font-bold text-xs text-emerald-700">Phân hiệu Lý Tự Trọng</span>
      </div>
     </div>
     <Link to="/" className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2 text-xs sm:text-sm font-black text-sky-900 transition-colors shadow-2xs">
      <Home size={16} className="text-sky-700"/>
      <span>Về trang chủ</span>
     </Link>
    </div>
   )}
  </header>

  <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
 {!student&&!checkingSaved&&<section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-800 via-indigo-800 to-teal-800 p-6 sm:p-7 text-white border-b-4 border-amber-400 shadow-lg shadow-sky-900/15">
  <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-300/15 blur-2xl"/>
  <div className="relative">
   <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 px-3 py-1 text-xs font-extrabold text-amber-200">
    <Sparkles size={14} aria-hidden="true"/> Rèn luyện mỗi ngày
   </span>
   <h1 className="mt-2.5 text-2xl sm:text-3xl font-black flex gap-3 items-center text-white"><BookOpen/>TỰ LUYỆN</h1>
   <p className="mt-2.5 text-base sm:text-lg font-medium text-sky-50">Em nhập mã riêng do giáo viên cấp, chọn tên của mình rồi chọn môn và bộ đề để luyện tập.</p>
   <p className="mt-1.5 text-xs sm:text-sm text-sky-100/90">Sau khi nộp, bài làm được gửi cho giáo viên theo dõi; kết quả tự luyện không cộng vào điểm kiểm tra của lớp.</p>
  </div>
 </section>}
 {checkingSaved ? (
  <section className="max-w-md mx-auto p-8 bg-white border-2 border-sky-200 rounded-3xl text-center space-y-3 shadow-md">
    <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"/>
    <p className="font-bold text-sky-950">Đang tự động vào góc tự luyện...</p>
  </section>
 ) : !student ? (
  <StudentEntry onEnter={value=>{try{localStorage.setItem('lhtt_self_practice_code',value.code);}catch{}setStudent(value);setGrade(value.grade.match(/[1-5]/)?.[0]||'');}}/>
 ) : <>
 {!selected&&<RewardShop key={student.code} identity={{classId:student.classId,studentId:student.studentId,accessCode:student.code}}/>}
 {selected&&work&&<WorkDelivery key={work.id} student={student} quiz={selected} work={work} onSaved={markSaved}/>}
 {selected?(writingLesson?<WritingPracticeRunner key={selected.id} lesson={writingLesson} onBack={back} studentKey={student.classId+'-'+student.studentId} onComplete={data=>complete(data)} onDraftChange={()=>setSaved(false)}/>:<TraditionQuizRunner key={selected.id} quiz={selected} onBack={back} onComplete={answers=>complete({answers})} mode="practice" durationMinutes={selected.category==='EXAM'?(selected.durationMinutes||30):undefined}/>):<>
 <nav aria-label="Chọn nội dung tự luyện" className="grid grid-cols-1 sm:grid-cols-3 gap-3"><button type="button" aria-pressed={section==='PRACTICE'} onClick={()=>{setSection('PRACTICE');setSubject('');}} className={`rounded-2xl px-4 py-4 font-black flex items-center justify-center gap-2 transition-all ${section==='PRACTICE'?'bg-gradient-to-r from-sky-700 to-indigo-700 text-white shadow-md shadow-sky-900/15':'bg-white/90 text-sky-900 border-2 border-sky-200 hover:bg-sky-50'}`}><BookOpen size={22}/> Luyện tập</button><button type="button" aria-pressed={section==='EXAM'} onClick={()=>{setSection('EXAM');setSubject('');}} className={`rounded-2xl px-4 py-4 font-black flex items-center justify-center gap-2 transition-all ${section==='EXAM'?'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20':'bg-white/90 text-amber-900 border-2 border-amber-200 hover:bg-amber-50'}`}><ClipboardList size={22}/> Đề thi</button><button type="button" aria-pressed={section==='WRITING'} onClick={()=>{setSection('WRITING');setSubject('Tập làm văn');setGrade('4');setWeekFilter('');setSearch('');}} className={`rounded-2xl px-4 py-4 font-black flex items-center justify-center gap-2 transition-all ${section==='WRITING'?'bg-gradient-to-r from-violet-700 to-purple-700 text-white shadow-md shadow-violet-900/15':'bg-white/90 text-violet-900 border-2 border-violet-200 hover:bg-violet-50'}`}><PenLine size={22}/> Tập làm văn</button></nav>{section==='WRITING'&&<section className="rounded-2xl border-2 border-violet-200 bg-violet-50/90 p-5"><h2 className="text-xl font-black text-violet-950">35 tuần tập viết • Lớp 4</h2><p className="mt-2">Chọn tuần, đọc đề và viết trực tiếp. Không có câu hỏi trắc nghiệm. Đọc lại bài rồi nộp để thầy/cô xem.</p></section>}
 <section className="bg-white/90 backdrop-blur-xs border-2 border-sky-100 rounded-2xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-2xs"><label className="font-bold">Lớp<select className="block mt-2 w-full border border-slate-200 bg-white rounded-xl p-3" value={grade} onChange={e=>setGrade(e.target.value)}><option value="">Tất cả các lớp</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>Lớp {n}</option>)}</select></label><label className="font-bold">Môn học<select className="block mt-2 w-full border border-slate-200 bg-white rounded-xl p-3" value={subject} onChange={e=>setSubject(e.target.value)}><option value="">Tất cả các môn</option>{[...new Set(items.map(q=>q.subject))].sort((a,b)=>a.localeCompare(b,'vi')).map(s=><option key={s}>{s}</option>)}</select></label><label className="font-bold">Tuần học<select className="block mt-2 w-full border border-slate-200 bg-white rounded-xl p-3" value={weekFilter} onChange={e=>setWeekFilter(e.target.value)}><option value="">Tất cả các tuần</option>{Array.from({length:35},(_,i)=>i+1).map(n=><option key={n} value={n}>Tuần {n}</option>)}</select></label><label className="font-bold"><span className="flex items-center gap-2"><Search size={18}/>Tìm bộ đề</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tên bài, nội dung hoặc tuần…" className="block mt-2 w-full border border-slate-200 bg-white rounded-xl p-3"/></label></section>
 <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium text-slate-600">{loading?'Đang đồng bộ danh sách bài học…':'Em có thể chọn bộ đề rồi bắt đầu ngay.'}</p><button type="button" disabled={loading} onClick={()=>{setLoading(true);setRetry(n=>n+1);}} className="min-h-11 rounded-xl border-2 border-sky-200 bg-white px-4 py-2 font-bold text-sky-800 hover:bg-sky-50 disabled:opacity-50">Tải lại danh sách</button></div>
 {error&&<div role="alert" className="bg-amber-50 border border-amber-200 p-4 rounded-xl">{error}<button className="ml-3 underline font-bold" onClick={()=>{setLoading(true);setRetry(n=>n+1);}}>Tải lại</button></div>}
 {hasFilters&&<div className="flex flex-wrap items-center gap-2 text-sm" aria-label="Bộ lọc đang dùng">{grade&&<span className="rounded-full bg-sky-100 px-3 py-2 font-semibold">Lớp {grade}</span>}{subject&&<span className="rounded-full bg-emerald-100 px-3 py-2 font-semibold">{subject}</span>}{weekFilter&&<span className="rounded-full bg-violet-100 px-3 py-2 font-semibold">Tuần {weekFilter}</span>}{search.trim()&&<span className="rounded-full bg-amber-100 px-3 py-2 font-semibold break-all">Tìm: {search.trim()}</span>}<button type="button" onClick={clearFilters} className="min-h-11 px-3 underline font-bold text-sky-800">Xóa bộ lọc</button></div>}
 <h2 id="practice-list-heading" tabIndex={-1} className="text-xl font-black text-sky-950">{section==='EXAM'?'Đề thi':section==='WRITING'?'Bài viết theo tuần':'Bộ đề luyện tập'} ({shown.length})</h2>{loading&&<p role="status">Đang tải thêm bộ đề…</p>}
 {!loading&&!shown.length?<section className="bg-white rounded-xl p-5"><p>Chưa có {section==='EXAM'?'đề thi':'bộ luyện tập'} phù hợp. Em thử lớp hoặc môn khác.</p><button onClick={clearFilters} className="mt-3 underline font-bold text-sky-800">Xem tất cả bộ đề</button></section>:<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{shown.map(q=><article key={q.id} className="flex flex-col justify-between rounded-3xl border-2 border-sky-100 hover:border-sky-300 bg-white/95 p-5 space-y-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"><div className="space-y-2"><span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">{q.grade} • {q.subject}</span><h3 className="text-xl font-black text-sky-950 leading-snug">{q.title}</h3>{getWritingLesson(q)&&<p className="text-sm font-medium text-violet-800">{getWritingLesson(q)?.focus}</p>}<p className="text-sm text-slate-600 font-medium">{getWritingLesson(q)?'Viết trực tiếp • Lưu nháp • Nộp cho giáo viên':q.questions.length+' câu hỏi'} {q.category==='EXAM'&&`• ${q.durationMinutes||30} phút`}</p></div><button onClick={()=>{setWork(null);setSaved(true);setSelected(q);window.scrollTo({top:0});}} className="w-full min-h-12 rounded-xl bg-sky-700 hover:bg-sky-800 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-700 text-white font-extrabold px-5 py-3 transition-colors">{getWritingLesson(q)?'Viết bài →':'Làm bài →'}</button></article>)}</div>}
 </>}
 </>}
 </main></div>;
}
