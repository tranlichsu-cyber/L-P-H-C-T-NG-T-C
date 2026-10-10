import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PdfLessonView, countPdfPages } from '../../components/teacher/PdfLessonView';
import { LessonSlideControls } from '../../components/teacher/LessonSlideControls';
import { deleteLesson, downloadLesson, saveLesson, useLessonLibrary, validateLessonFile, type Lesson } from '../../services/lessons/lessonLibrary';
import { SUBJECT_OPTIONS } from './QuizzesPage';
export function LessonsPage() {
  const { currentUser }=useAuth();const {showToast}=useToast();const library=useLessonLibrary();
  const [replacing,setReplacing]=useState<Lesson|null>(null);
  const [open,setOpen]=useState(false);const [busy,setBusy]=useState(false);const [title,setTitle]=useState('');
  const [subject,setSubject]=useState('Toán');const [grade,setGrade]=useState('Khối 4');
  const [ppt,setPpt]=useState<File|null>(null);const [pdf,setPdf]=useState<File|null>(null);
  const [preview,setPreview]=useState<Lesson|null>(null);const [page,setPage]=useState(1);const [count,setCount]=useState(1);
  const [deleting,setDeleting]=useState<Lesson|null>(null);
  const run=async(action:()=>Promise<void>)=>{setBusy(true);try{await action();}catch(err){showToast(err instanceof Error ? err.message:'Không xử lý được tệp.','error');}finally{setBusy(false);}};
  const field='w-full border border-slate-300 rounded-xl p-3 bg-white text-slate-900 text-sm';
  if(preview)return <div className="fixed inset-0 z-50 bg-slate-950 p-3 flex flex-col gap-2 h-[100dvh] overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 text-white"><strong>{preview.title}</strong><Button variant="primary" onClick={()=>setPreview(null)}>Đóng bài giảng</Button></div>
    <div className="flex-1 min-h-0"><PdfLessonView lesson={preview} page={page} onCount={setCount}/></div>
    <LessonSlideControls page={page} count={count} onPage={setPage}/>
  </div>;
  return <div>
    <PageHeader title="KHO BÀI GIẢNG PPT / PDF" description="Lưu trên trình duyệt của máy đang dùng, theo tài khoản giáo viên." action={<Button variant="primary" onClick={()=>{setReplacing(null);setTitle('');setPpt(null);setPdf(null);setOpen(true);}}>Tải bài giảng lên</Button>}/>
    <div className="rounded-xl bg-amber-50 text-amber-900 border border-amber-200 p-4 mb-4 text-sm space-y-2">
      <p><strong>PPT gốc để tải về chỉnh sửa; PDF để trình chiếu trong ứng dụng.</strong> Trong PowerPoint: Tệp → Xuất hoặc Lưu dưới dạng → PDF, rồi chọn cả PPT và PDF khi tải lên.</p>
      <p>Tệp lưu trên máy này, chưa đồng bộ lên Firebase hoặc sang máy khác. Xoá dữ liệu trình duyệt có thể làm mất kho; hãy giữ bản gốc. Bản PDF không có hiệu ứng, âm thanh hoặc video của PPT.</p>
    </div>
    {library.loading ? <p>Đang đọc kho…</p> : library.error ? <p role="alert" className="text-rose-700">{library.error}</p> : !library.items.length ? <p className="py-10 text-center text-slate-500">Chưa có bài giảng trên máy này. Bấm “Tải bài giảng lên” để bắt đầu.</p> : <div className="grid md:grid-cols-2 gap-4">{library.items.map((lesson)=><article key={lesson.id} className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-indigo-700">{lesson.grade} • {lesson.subject} • Lưu trên máy</p><h2 className="font-bold text-lg text-slate-900 my-2">{lesson.title}</h2>
      <p className="text-sm text-slate-600 break-all">{lesson.pdfName ? `${lesson.pdfName} • ${lesson.pageCount} trang` : 'Chỉ có PPT gốc. Bấm Bổ sung PDF để chiếu.'}</p>
      {lesson.pptName && <p className="text-sm text-slate-600 break-all">PPT: {lesson.pptName}</p>}
      <div className="flex flex-wrap gap-2 mt-4">
        <Button variant="outline" disabled={busy} onClick={()=>{setReplacing(lesson);setTitle(lesson.title);setSubject(lesson.subject);setGrade(lesson.grade);setPpt(null);setPdf(null);setOpen(true);}}>{lesson.pdfName?'Thay PDF / PPT':'Bổ sung PDF'}</Button>
        <Button variant="primary" disabled={!lesson.pdfName} onClick={()=>{setPage(1);setCount(lesson.pageCount || 1);setPreview(lesson);}}>Trình chiếu PDF</Button>
        {lesson.pptName && <Button variant="outline" disabled={busy} onClick={()=>run(()=>downloadLesson(lesson,'ppt'))}>Tải PPT gốc</Button>}
        {lesson.pdfName && <Button variant="outline" disabled={busy} onClick={()=>run(()=>downloadLesson(lesson,'pdf'))}>Tải PDF</Button>}
        <Button variant="secondary" disabled={busy} onClick={()=>setDeleting(lesson)}>Xoá khỏi kho</Button>
      </div>
    </article>)}</div>}
    <Modal isOpen={open} onClose={()=>{if(!busy)setOpen(false);}} title={replacing ? "Bổ sung / Thay tệp bài giảng" : "Tải bài giảng lên máy"} footer={<><Button variant="secondary" disabled={busy} onClick={()=>setOpen(false)}>Hủy</Button><Button variant="primary" disabled={busy || (!ppt && !pdf)} onClick={()=>run(async()=>{
      if(!currentUser?.uid)throw new Error('Cần đăng nhập giáo viên.');if(!title.trim())throw new Error('Nhập tên bài giảng.');
      if(ppt)await validateLessonFile(ppt,'ppt');let pageCount: number|undefined;
      if(pdf){await validateLessonFile(pdf,'pdf');try{pageCount=await countPdfPages(pdf);}catch{throw new Error('Không đọc được PDF. Hãy xuất PDF không có mật khẩu từ PowerPoint.');}}
      const lesson:Lesson={...(replacing || {}),id:replacing?.id || crypto.randomUUID(),ownerId:currentUser.uid,title:title.trim(),subject,grade,createdAt:replacing?.createdAt || new Date().toISOString(),...(ppt?{pptName:ppt.name}:{}),...(pdf?{pdfName:pdf.name,pageCount}:{})};
      await saveLesson(lesson,ppt,pdf);setOpen(false);showToast('Đã lưu bài giảng trên máy này.','success');
    })}>{busy?'Đang kiểm tra và lưu…':'Lưu bài giảng'}</Button></>}>
      <div className="space-y-4"><label className="block">Tên bài giảng<input className={field} value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Ví dụ: Phân số – Tiết 1"/></label>
        <label className="block">Môn<select className={field} value={subject} onChange={(e)=>setSubject(e.target.value)}>{SUBJECT_OPTIONS.map((s)=><option key={s}>{s}</option>)}</select></label>
        <label className="block">Khối<select className={field} value={grade} onChange={(e)=>setGrade(e.target.value)}>{[1,2,3,4,5].map((g)=><option key={g}>Khối {g}</option>)}</select></label>
        <label className="block">PPT gốc (.ppt / .pptx, tối đa 50 MB)<input className={field} type="file" accept=".ppt,.pptx" onChange={(e)=>{const file=e.target.files?.[0] || null;setPpt(file);if(file && !title)setTitle(file.name.replace(/\.[^.]+$/,''));}}/></label>
        <label className="block">PDF trình chiếu (tối đa 50 MB)<input className={field} type="file" accept=".pdf" onChange={(e)=>{const file=e.target.files?.[0] || null;setPdf(file);if(file && !title)setTitle(file.name.replace(/\.[^.]+$/,''));}}/></label>
        <p className="text-sm text-slate-600">Có thể chỉ tải PDF để chiếu. Chỉ tải PPT thì lưu được bản gốc, nhưng chưa chiếu trực tiếp. Tệp không rời máy của thầy.</p>
      </div>
    </Modal>
    <Modal isOpen={!!deleting} onClose={()=>{if(!busy)setDeleting(null);}} title="Xoá bài giảng khỏi máy" footer={<><Button variant="secondary" disabled={busy} onClick={()=>setDeleting(null)}>Hủy</Button><Button variant="danger" disabled={busy} onClick={()=>run(async()=>{if(deleting){await deleteLesson(deleting);setDeleting(null);showToast('Đã xoá bài giảng khỏi kho trên máy.','success');}})}>Xoá khỏi kho</Button></>}><p>{deleting?.title}</p><p className="mt-2 text-sm text-slate-600">Xoá bản PPT/PDF đã lưu trong kho này; tệp gốc trong thư mục máy tính vẫn giữ nguyên.</p></Modal>
  </div>;
}
