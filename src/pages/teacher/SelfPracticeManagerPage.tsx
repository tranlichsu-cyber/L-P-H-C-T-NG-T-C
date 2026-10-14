import {TeacherStudentWork} from '../../components/selfPractice/TeacherStudentWork';
import {useEffect,useState,useCallback} from 'react';
import {Link} from 'react-router-dom';
import {useTeacherData} from '../../context/TeacherDataContext';
import {SelfPracticeService} from '../../services/selfPractice/SelfPracticeService';
import {publicQuizCopy,type SelfPracticeQuiz} from '../../services/selfPractice/content';
import {useToast} from '../../context/ToastContext';
import {Modal} from '../../components/common/Modal';
import {Button} from '../../components/common/Button';
import {auth} from '../../services/firebase/firebase';
import {downloadExamTemplate,readExamFile,type ExamImport} from '../../services/selfPractice/examImport';
import {downloadWritingTemplate,readQuestionFile} from '../../services/questionImport/template';
import {db,isFirebaseConfigured} from '../../services/firebase/firebase';
import {doc,writeBatch,getDocs,collection} from 'firebase/firestore';
import type {Quiz,Question} from '../../types';
export function SelfPracticeManagerPage(){
 const {quizzes}=useTeacherData(),{showToast}=useToast();
 const [items,setItems]=useState<SelfPracticeQuiz[]>([]),[category,setCategory]=useState<'PRACTICE'|'EXAM'>('PRACTICE'),[durationMinutes,setDurationMinutes]=useState(30),[selected,setSelected]=useState(''),[confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[removeId,setRemoveId]=useState<string|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const [importedExam,setImportedExam]=useState<ExamImport|null>(null),[importError,setImportError]=useState('');
 const [scienceConfirm,setScienceConfirm]=useState(false),[scienceResult,setScienceResult]=useState('');
 const scienceQuizzes=quizzes.filter(q=>q.subject.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()==='khoa hoc' && q.questions.length>0);
 const [writingFiles,setWritingFiles]=useState<File[]>([]),[writingProgress,setWritingProgress]=useState('');
 const emptyQuizzes=quizzes.filter(q=>q.questions.length===0);
 const publishedEmpty=items.filter(q=>q.questions.length===0);
 const outdatedPublished=items.filter(item=>{
  const original=quizzes.find(q=>item.id===item.teacherId+'_'+q.id);
  return original&&original.questions.length!==item.questions.length;
 });
 const normalized=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().trim();
 const duplicateWriting=new Map<string,SelfPracticeQuiz[]>();
 items.filter(item=>normalized(item.subject)==='tap lam van').forEach(item=>{
  const week=normalized(item.title).match(/(?:^|\s)tuan\s*0*(\d{1,2})/);
  if(!week)return;
  const key=(item.grade.match(/[1-5]/)?.[0]||item.grade)+'-tuan-'+Number(week[1])+'-'+(item.category||'PRACTICE');
  duplicateWriting.set(key,[...(duplicateWriting.get(key)||[]),item]);
 });
 const duplicates=[...duplicateWriting.values()].filter(group=>group.length>1);
 const quiz=quizzes.find(q=>q.id===selected);
 const load=useCallback(async()=>{try{setItems(await SelfPracticeService.list(false,true));setError('');}catch{setError('Không tải được các bộ đề đã công khai.');}finally{setLoading(false);}},[]);
 useEffect(()=>{let active=true;SelfPracticeService.list(false).then(data=>{if(active)setItems(data);}).catch(()=>{if(active)setError('Không tải được các bộ đề đã công khai.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 return <div className="space-y-5"><h1 className="font-black text-2xl text-sky-900">QUẢN LÝ TỰ LUYỆN</h1><section className="bg-sky-50 border border-sky-200 rounded-2xl p-5 space-y-3"><p>Học sinh vào bằng mã riêng, xác nhận tên rồi làm bài. Thầy/cô có thể xem kết quả và nội dung bài đã nộp bên dưới.</p><Link to="/tu-luyen" target="_blank" className="underline font-bold text-sky-800">Mở trang Tự luyện dành cho học sinh ↗</Link><p>Bốn bộ câu hỏi Giáo dục địa phương đã công khai được hiển thị sẵn. Các bộ đề riêng chỉ xuất hiện sau khi thầy/cô chọn công khai.</p></section>
 <TeacherStudentWork/>
 <section className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-5 space-y-3" aria-labelledby="data-health-heading">
  <h2 id="data-health-heading" className="text-xl font-black text-sky-950">Kiểm tra chất lượng Ngân hàng và Tự luyện</h2>
  <p className="text-sm text-sky-900">Báo cáo chỉ đọc, không tự xóa hoặc sửa bất kỳ dữ liệu Firebase nào. Bộ trùng trên giao diện học sinh được ẩn, nhưng bản gốc vẫn được giữ.</p>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
   <div className="rounded-xl bg-white p-3 border border-sky-100"><p className="text-sm">Bộ trong Ngân hàng</p><p className="text-2xl font-black">{quizzes.length}</p></div>
   <div className="rounded-xl bg-white p-3 border border-amber-100"><p className="text-sm">Bộ gốc chưa có câu</p><p className="text-2xl font-black text-amber-800">{emptyQuizzes.length}</p></div>
   <div className="rounded-xl bg-white p-3 border border-rose-100"><p className="text-sm">Bản công khai 0 câu</p><p className="text-2xl font-black text-rose-800">{publishedEmpty.length}</p></div>
   <div className="rounded-xl bg-white p-3 border border-violet-100"><p className="text-sm">Nhóm Tập làm văn trùng</p><p className="text-2xl font-black text-violet-800">{duplicates.length}</p></div>
  </div>
  {(emptyQuizzes.length>0||publishedEmpty.length>0||duplicates.length>0||outdatedPublished.length>0)&&<details className="rounded-xl bg-white border border-sky-100 p-4">
   <summary className="cursor-pointer font-bold text-sky-900">Xem chi tiết các vấn đề cần xử lý</summary>
   <div className="mt-3 max-h-64 overflow-auto text-sm space-y-2">
    {emptyQuizzes.slice(0,30).map(q=><p key={q.id} className="text-amber-900">Ngân hàng rỗng: {q.title} ({q.grade})</p>)}
    {publishedEmpty.slice(0,30).map(q=><p key={q.id} className="text-rose-800">Đã công khai nhưng rỗng: {q.title}</p>)}
    {duplicates.map((group,i)=><p key={i} className="text-violet-800">Trùng tuần: {group[0].title} ({group.length} bản, giữ nguyên dữ liệu)</p>)}
    {outdatedPublished.slice(0,30).map(q=><p key={q.id} className="text-sky-800">Cần công khai lại sau khi sửa: {q.title}</p>)}
   </div>
  </details>}
  <p className="text-xs text-slate-600">Các số liệu trên phản ánh dữ liệu đã tải về trong phiên hiện tại. Làm mới trang để đối chiếu sau khi nhập hoặc sửa đề.</p>
 </section>
 <section className="bg-white border-2 border-amber-200 rounded-2xl p-5 space-y-3"><h2 className="font-black text-xl text-amber-900">Nhập đề thi từ Excel (mẫu riêng)</h2><p>Độc lập với mẫu bài tập. Đề có tên, môn, lớp, thời gian, điểm từng câu và đáp án. Kiểm tra tổng điểm trước khi công khai.</p><Button variant="outline" disabled={busy} onClick={()=>downloadExamTemplate()}>Tải mẫu nhập đề thi (.xlsx)</Button><label className="block font-bold">Nhập đề thi<input type="file" accept=".xlsx" disabled={busy} className="block mt-2 w-full" onChange={async e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;setImportError('');setImportedExam(null);setBusy(true);try{const uid=auth?.currentUser?.uid;if(!uid)throw new Error('Cần đăng nhập giáo viên để nhập đề thi.');setImportedExam(await readExamFile(f,uid));}catch(err){setImportError((err as Error).message);}finally{setBusy(false);}}}/></label>{importError&&<p role="alert" className="text-red-800">{importError}</p>}{importedExam&&<div className="rounded-xl border border-amber-200 p-4 space-y-2"><p className="font-bold">{importedExam.quiz.title}</p><p>{importedExam.quiz.subject} • {importedExam.quiz.grade} • {importedExam.quiz.questions.length} câu • {importedExam.durationMinutes} phút • {importedExam.totalPoints} điểm</p>{importedExam.warnings.map((w,i)=><p key={i} className="text-amber-800">{w}</p>)}<p className="text-sm">Kiểm tra lại nội dung và đáp án trước khi công khai. Đề sẽ xuất hiện trực tiếp ở mục Đề thi của học sinh.</p><Button disabled={busy} onClick={async()=>{if(!importedExam)return;setBusy(true);try{await SelfPracticeService.publish(importedExam.quiz,'EXAM',importedExam.durationMinutes);setImportedExam(null);await load();showToast('Đã nhập và công khai đề thi cho học sinh.','success');}catch(err){setImportError((err as Error).message);}finally{setBusy(false);}}}>Xác nhận nhập và công khai đề thi</Button></div>}</section>
 <section className="bg-white border-2 border-violet-200 rounded-2xl p-5 space-y-3">
 <Link to="/teacher/curriculum-audit" className="inline-block underline font-bold text-sky-800">Đối chiếu bài và tuần với sáu SGK lớp 4</Link><h2 className="font-black text-xl text-violet-900">Nhập Tập làm văn lớp 4 theo tuần (tập 1 và tập 2)</h2><Button variant="outline" disabled={busy} onClick={()=>downloadWritingTemplate()}>Tải mẫu riêng Tập làm văn (.xlsx)</Button>
 <p>Giải nén bộ file đã tải, chọn đồng thời các file Excel Tuan_01 đến Tuan_35. Hệ thống tạo từng bộ trong Ngân hàng câu hỏi rồi công khai ngay tại Tự luyện. Bộ có cùng tên trong Ngân hàng sẽ được bỏ qua để tránh trùng.</p>
 <label className="block font-bold">Chọn các file Excel theo tuần<input type="file" accept=".xlsx" multiple disabled={busy} className="block mt-2 w-full text-sm" onChange={e=>{setWritingFiles(Array.from(e.target.files||[]));setWritingProgress('');}}/></label>
 <p className="text-sm text-slate-600">Đã chọn {writingFiles.length} file. Vui lòng kiểm tra đáp án của các câu hỏi trước khi công khai.</p>
 <Button disabled={busy||!writingFiles.length} onClick={async()=>{
  setBusy(true);setWritingProgress('Đang kiểm tra file…');
  try{
   const sorted=[...writingFiles].sort((a,b)=>a.name.localeCompare(b.name,'vi',{numeric:true}));
   const prepared=[];
   for(const file of sorted){
    const week=Number(file.name.match(/Tuan[_ -]?(\d{1,2})/i)?.[1]);
    if(!Number.isInteger(week)||week<1||week>35)throw new Error(file.name+': Tên file cần chứa Tuan_01 đến Tuan_35.');
    const parsed=await readQuestionFile(file);
    if(parsed.errors.length)throw new Error(file.name+': '+parsed.errors.join('; '));
    const title='Tuần '+week+' – Tập làm văn lớp 4';
    prepared.push({week,title,questions:parsed.questions});
   }
   const existing=new Map(quizzes.filter(q=>q.grade.includes('4')&&q.subject==='Tập làm văn').map(q=>[q.title,q]));
   let created=0,published=0;const problems:string[]=[];
   for(const item of prepared){
    try{
     let target=existing.get(item.title);
     const uid=auth?.currentUser?.uid;
     if(!uid)throw new Error('Phiên đăng nhập giáo viên không còn hiệu lực.');
     if(!target || !target.questions.length){
      if(!isFirebaseConfigured||!db)throw new Error('Không có kết nối Firebase để lưu bộ câu hỏi.');
      if(target?.teacherId && target.teacherId!==uid)throw new Error('Bộ đã có thuộc tài khoản khác; không thể ghi đè.');
      const quizId=target?.id||'tlv4-'+uid+'-week-'+item.week;
      const now=new Date().toISOString();
      const questions:Question[]=item.questions.map(({points:_points,...q},i)=>({...q,id:'tlv4-week-'+item.week+'-question-'+(i+1)}));
      const fresh:Quiz={id:quizId,teacherId:uid,title:item.title,subject:'Tập làm văn',grade:'Khối 4',questionCount:questions.length,questions,createdAt:target?.createdAt||now,visibility:'PRIVATE'};
      const batch=writeBatch(db);
      batch.set(doc(db,'quizzes',quizId),{teacherId:uid,title:fresh.title,subject:fresh.subject,grade:fresh.grade,questionCount:questions.length,visibility:'PRIVATE',teamId:null,createdAt:fresh.createdAt,updatedAt:now});
      questions.forEach((q,i)=>batch.set(doc(db!,'quizzes',quizId,'questions',q.id),{...q,order:i,createdAt:now,updatedAt:now}));
      await batch.commit();
      const saved=await getDocs(collection(db,'quizzes',quizId,'questions'));
      if(saved.size!==questions.length)throw new Error('Firebase mới lưu '+saved.size+'/'+questions.length+' câu. Không công khai bộ chưa đủ câu.');
      if(!target)created++;
      target=fresh;
     }
     existing.set(item.title,target);
     if(!target.questions.length)throw new Error('Bộ câu hỏi còn rỗng; cần nhập lại dữ liệu.');
     await SelfPracticeService.publish(target,'PRACTICE');published++;
    }catch(err){problems.push(item.title+': '+((err as Error).message||'Lỗi không xác định'));}
    setWritingProgress('Đã xử lý '+(created)+' bộ mới; công khai '+published+'/'+prepared.length+'.');
   }
   await load();
   setWritingProgress('Đã tạo '+created+' bộ mới và công khai '+published+'/'+prepared.length+' tuần.'+(problems.length?' Lỗi: '+problems.join(' | '):''));
   if(!problems.length)setWritingFiles([]);
   showToast('Đã công khai '+published+'/'+prepared.length+' bộ Tập làm văn.',problems.length?'error':'success');
  }catch(err){setWritingProgress('Không nhập được: '+((err as Error).message||'Lỗi đọc file'));}
  finally{setBusy(false);}
 }}>Nhập vào Ngân hàng và công khai Tự luyện</Button>
 {writingProgress&&<p role="status" className="text-sm font-semibold text-violet-900">{writingProgress}</p>}
 </section>
 <section className="bg-white border-2 border-emerald-200 rounded-2xl p-5 space-y-3"><h2 className="font-bold text-lg text-emerald-900">Đưa các bộ câu hỏi Khoa học vào Tự luyện</h2><p>Có {scienceQuizzes.length} bộ Khoa học có câu hỏi trong Ngân hàng. Công khai vào mục Luyện tập, giữ nguyên bộ đề gốc và không tạo bản sao trùng khi thực hiện lại.</p><Button disabled={!scienceQuizzes.length||busy} onClick={()=>{setScienceResult('');setScienceConfirm(true);}}>Công khai tất cả bộ Khoa học</Button>{scienceResult&&<p role="status" className="text-sm font-semibold text-emerald-900">{scienceResult}</p>}</section>
 <section className="bg-white border rounded-2xl p-5 space-y-3"><h2 className="font-bold text-lg">Nhập bài tập / Chọn bộ đề từ Ngân hàng câu hỏi</h2><Link to="/teacher/quizzes" className="underline text-sky-800">Tạo hoặc sửa bộ đề trong Ngân hàng câu hỏi</Link><label className="block font-bold">Bộ đề<select disabled={busy} value={selected} onChange={e=>setSelected(e.target.value)} className="block mt-2 w-full border rounded-xl p-3"><option value="">Chọn bộ đề để công khai</option>{quizzes.map(q=><option key={q.id} value={q.id}>{q.title} • {q.grade} • {q.subject} • {q.questions.length} câu</option>)}</select></label><label className="block font-bold">Đưa vào mục<select value={category} onChange={e=>setCategory(e.target.value as 'PRACTICE'|'EXAM')} className="block mt-2 w-full border rounded-xl p-3"><option value="PRACTICE">Luyện tập</option><option value="EXAM">Đề thi</option></select></label>{category==='EXAM'&&<label className="block font-bold">Thời gian làm bài (phút)<input type="number" min={1} max={180} step={1} value={durationMinutes} onChange={e=>setDurationMinutes(Number(e.target.value))} className="block mt-2 w-full border rounded-xl p-3"/></label>}<Button disabled={!quiz||busy} onClick={()=>{try{if(quiz)publicQuizCopy(quiz,'preview',category,durationMinutes);setConfirm(true);}catch(e){showToast((e as Error).message,'error');}}}>Xem trước và công khai</Button><p className="text-sm text-slate-600">Khi sửa đề gốc, chọn công khai lại để cập nhật bản tự luyện.</p></section>
 <section className="space-y-3"><h2 className="font-bold text-lg">Bộ đề thầy/cô đã công khai ({items.length})</h2>{loading&&<p>Đang tải…</p>}{error&&<p role="alert" className="text-red-800">{error} <button className="underline" onClick={()=>void load()}>Tải lại</button></p>}{!loading&&!error&&!items.length&&<p>Chưa công khai bộ đề nào từ Ngân hàng câu hỏi.</p>}{items.map(i=><article key={i.id} className="bg-white border rounded-xl p-4 flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{i.title}</h3><p>{i.grade} • {i.subject} • {i.category==='EXAM'?'Đề thi':'Luyện tập'} • {i.questions.length} câu {i.category==='EXAM'&&`• ${i.durationMinutes||30} phút`}</p></div><Button variant="danger" disabled={busy} onClick={()=>setRemoveId(i.id)}>Gỡ khỏi Tự luyện</Button></article>)}</section>
 <Modal isOpen={scienceConfirm} title="Công khai bộ câu hỏi Khoa học" onClose={()=>{if(!busy)setScienceConfirm(false);}} footer={<><Button variant="outline" disabled={busy} onClick={()=>setScienceConfirm(false)}>Hủy</Button><Button disabled={busy||!scienceQuizzes.length} onClick={async()=>{setBusy(true);let done=0;const failed:string[]=[];try{for(const q of scienceQuizzes){try{await SelfPracticeService.publish(q,'PRACTICE');done++;}catch(err){failed.push(q.title+': '+((err as Error).message||'Lỗi lưu dữ liệu'));}}await load();setScienceConfirm(false);setScienceResult('Đã công khai '+done+'/'+scienceQuizzes.length+' bộ Khoa học.'+(failed.length?' Không thể công khai: '+failed.join(' | '):''));showToast('Đã xử lý '+done+' bộ Khoa học.','success');}finally{setBusy(false);}}}>{busy?'Đang công khai…':'Xác nhận công khai'}</Button></>}><p className="font-bold">Sẽ công khai {scienceQuizzes.length} bộ đề Khoa học vào mục Luyện tập.</p><p className="my-2">Bộ đề có sẵn trên Firebase sẽ được cập nhật theo nội dung hiện tại; các bộ môn khác không bị ảnh hưởng. Học sinh vào làm bài bằng mã riêng đã cấp.</p><div className="max-h-56 overflow-y-auto space-y-1 text-sm">{scienceQuizzes.map(q=><p key={q.id}>• {q.grade}: {q.title} ({q.questions.length} câu)</p>)}</div></Modal>
 <Modal isOpen={confirm&&!!quiz} title="Xem trước bộ đề tự luyện" onClose={()=>{if(!busy)setConfirm(false);}} footer={<><Button variant="outline" disabled={busy} onClick={()=>setConfirm(false)}>Hủy</Button><Button disabled={busy} onClick={async()=>{if(!quiz||busy)return;setBusy(true);try{await SelfPracticeService.publish(quiz,category,durationMinutes);setConfirm(false);await load();showToast('Đã công khai bộ đề trong Tự luyện.','success');}catch(e){showToast((e as Error).message,'error');}finally{setBusy(false);}}}>{busy?'Đang lưu…':'Công khai bộ đề'}</Button></>}><p className="font-bold">{quiz?.title} • {quiz?.grade} • {quiz?.subject}</p><p className="my-3">Bộ đề sẽ xuất hiện tại mục {category==='EXAM'?'Đề thi':'Luyện tập'} cho học sinh. {category==='EXAM'?`Thời gian làm bài: ${durationMinutes} phút. Hết giờ bài sẽ tự nộp.`:'Học sinh chỉ xem đáp án sau khi nộp bài.'} Chỉ nội dung bộ đề được đưa lên, không kèm danh sách học sinh hoặc kết quả lớp.</p>{quiz?.questions.map((q,i)=><section key={q.id} className="border rounded-xl p-3 my-2"><p className="font-bold">{i+1}. {q.content}</p>{q.options?.map((o,j)=><p key={j}>{String.fromCharCode(65+j)}. {o}</p>)}<p className="text-emerald-800">Đáp án: {q.correctAnswer}</p>{q.explanation&&<p>{q.explanation}</p>}</section>)}</Modal>
 <Modal isOpen={!!removeId} title="Gỡ bộ đề khỏi Tự luyện" onClose={()=>{if(!busy)setRemoveId(null);}} footer={<><Button variant="outline" disabled={busy} onClick={()=>setRemoveId(null)}>Hủy</Button><Button variant="danger" disabled={busy} onClick={async()=>{if(!removeId||busy)return;setBusy(true);try{await SelfPracticeService.remove(removeId);setRemoveId(null);await load();showToast('Đã gỡ bản tự luyện; đề gốc vẫn trong Ngân hàng câu hỏi.','success');}catch(e){showToast((e as Error).message,'error');}finally{setBusy(false);}}}>Gỡ bản công khai</Button></>}><p>Chỉ gỡ bản sao công khai. Thầy/cô có thể chọn đề gốc để công khai lại.</p></Modal>
 </div>;
}
