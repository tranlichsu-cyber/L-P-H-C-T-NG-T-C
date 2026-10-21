import {useEffect,useRef,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useTeacherData} from '../../context/TeacherDataContext';
import {useAuth} from '../../context/AuthContext';
import {activeRealtimeService} from '../../services/realtime/realtimeServiceSwitch';
import {QrCardsPrintButton} from '../../components/qr/QrCardsPrintButton';
import {QrBankService} from '../../services/qrBank/QrBankService';
import type {QrBank} from '../../services/qrBank/content';
const button='inline-block rounded-xl bg-indigo-700 px-5 py-3 font-bold text-white disabled:opacity-40';
export function QrCardsPage(){
 const {classes}=useTeacherData(),{currentUser}=useAuth(),navigate=useNavigate();
 const [classId,setClassId]=useState(''),[quizId,setQuizId]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const lock=useRef(false),key=`qr-last-room-${currentUser?.uid||'teacher'}`;
 const cls=classes.find(c=>c.id===(classId||classes[0]?.id));
 const [available,setAvailable]=useState<QrBank[]>([]),[loading,setLoading]=useState(true);
 useEffect(()=>{let cancelled=false;setAvailable([]);setLoading(true);QrBankService.list(currentUser?.uid||'').then(items=>{if(!cancelled)setAvailable(items);}).catch(()=>{if(!cancelled)setError('Chưa tải được kho câu hỏi thẻ QR. Hãy tải lại trang.');}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[currentUser?.uid]);
 const quiz=available.find(q=>q.id===(quizId||available[0]?.id)),questions=quiz?.questions||[];
 let last='';try{last=localStorage.getItem(key)||'';}catch{/* Storage can be unavailable in private browsing. */}
 async function start(){if(lock.current||!cls||!quiz||!questions.length||!cls.students.length)return;lock.current=true;setBusy(true);setError('');try{
  const room=await activeRealtimeService.createRoom({teacherId:currentUser?.uid||'teacher',classId:cls.id,className:cls.name,subject:quiz.subject,quizId:quiz.id,quizTitle:quiz.title,responseMode:'QR_CARD',questionSource:'QR_BANK',questions,roster:cls.students.map(s=>({id:s.id,name:s.name}))});
  try{localStorage.setItem(key,room.id);}catch{/* Starting a lesson does not depend on browser storage. */}
  navigate(`/teacher/qr-cards/${encodeURIComponent(room.id)}`);
 }catch(e){setError(e instanceof Error?e.message:'Chưa tạo được tiết học. Hãy thử lại.');}finally{lock.current=false;setBusy(false);}}
 return <section className="mx-auto max-w-4xl space-y-6"><header className="rounded-3xl bg-gradient-to-br from-indigo-700 to-violet-600 p-6 text-white"><p className="font-bold">📷 HỌC SINH GIƠ THẺ • GIÁO VIÊN QUÉT</p><h1 className="mt-2 text-3xl font-black">Trả lời bằng thẻ QR</h1><p className="mt-3">Chỉ cần thẻ giấy của học sinh và điện thoại của giáo viên. In thẻ một lần, dùng lại cho các tiết của cùng lớp.</p></header>
 <Link className={button} to="/teacher/qr-cards/bank">Kho câu hỏi QR riêng • Soạn câu / Chèn ảnh / Video →</Link>
 <div className="grid gap-4 md:grid-cols-2"><section className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-xl font-black">1. Chọn lớp và in thẻ</h2><label className="block font-bold">Lớp học<select className="mt-2 block w-full rounded-xl border p-3" value={cls?.id||''} onChange={e=>setClassId(e.target.value)} disabled={busy}>{classes.map(c=><option key={c.id} value={c.id}>{c.name} • {c.students.length} học sinh</option>)}</select></label>{cls&&<QrCardsPrintButton key={cls.id} classId={cls.id} className={cls.name} roster={cls.students.map(s=>({studentId:s.id,name:s.name}))}/>}<p>Phát đúng thẻ có tên từng em. Khi trả lời, xoay cạnh A, B, C hoặc D lên trên.</p>{!classes.length&&<Link className="underline" to="/teacher/classes">Tạo lớp và thêm danh sách học sinh →</Link>}{cls&&!cls.students.length&&<Link className="underline" to={`/teacher/classes/${cls.id}`}>Thêm học sinh cho lớp →</Link>}</section>
 <section className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-xl font-black">2. Chọn câu hỏi và bắt đầu</h2><label className="block font-bold">Bộ câu hỏi QR riêng<select className="mt-2 block w-full rounded-xl border p-3" value={quiz?.id||''} onChange={e=>setQuizId(e.target.value)} disabled={busy||loading}>{available.map(q=><option key={q.id} value={q.id}>{q.title} • {q.subject} • {q.grade}</option>)}</select></label><p>{quiz?`${questions.length} câu trắc nghiệm có 2–4 lựa chọn sẽ được dùng trong tiết này.`:loading?'Đang tải kho câu hỏi QR…':'Chưa có bộ câu hỏi thẻ QR. Hãy tạo bộ riêng để bắt đầu.'}</p><button className={button} disabled={busy||!cls?.students.length||!questions.length} onClick={()=>void start()}>{busy?'Đang tạo tiết học…':'Bắt đầu tiết học bằng thẻ QR'}</button>{!loading&&!available.length&&<Link className="block underline" to="/teacher/qr-cards/bank/new">+ Tạo bộ câu hỏi QR có ảnh, video →</Link>}</section></div>
 {error&&<p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-900">{error}</p>}
 {last&&<Link className={button} to={`/teacher/qr-cards/${encodeURIComponent(last)}`}>Tiếp tục tiết dùng thẻ gần nhất trên máy này →</Link>}
 <section className="rounded-2xl bg-sky-50 p-5"><h2 className="font-black">3. Chiếu trên máy tính, quét bằng điện thoại</h2><p className="mt-2">Trong tiết học, chọn “Mở màn chiếu” trên máy tính. Dùng điện thoại mở mã dẫn đến màn quét và đăng nhập cùng tài khoản giáo viên. Phát câu hỏi, quét từng nhóm nhỏ rồi kiểm tra và gửi đáp án.</p></section></section>;
}
