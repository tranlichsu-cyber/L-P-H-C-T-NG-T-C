import {QrBankEditor} from '../../components/qr/QrBankEditor';
import {QrWordImport} from '../../components/qr/QrWordImport';
import {useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {QrBankService} from '../../services/qrBank/QrBankService';
import type {QrBank} from '../../services/qrBank/content';
const button='inline-block rounded-xl bg-indigo-700 px-4 py-3 font-bold text-white disabled:opacity-40';
export function QrBankPage(){const {bankId}=useParams();return bankId?<QrBankEditor key={bankId}/>:<BankList/>;}
function BankList(){
 const {currentUser}=useAuth(),uid=currentUser?.uid||'';
 const [items,setItems]=useState<QrBank[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true),[deleting,setDeleting]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{let cancelled=false;setItems([]);setLoading(true);QrBankService.list(uid).then(v=>{if(!cancelled)setItems(v);}).catch(()=>{if(!cancelled)setError('Chưa tải được kho câu hỏi. Hãy tải lại trang.');}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[uid]);
 async function remove(id:string){setBusy(true);setError('');try{await QrBankService.remove(uid,id);setItems(v=>v.filter(b=>b.id!==id));setDeleting('');}catch{setError('Chưa xóa được bộ câu hỏi. Hãy thử lại.');}finally{setBusy(false);}}
 return <section className="mx-auto max-w-5xl space-y-5"><Link to="/teacher/qr-cards" className="font-bold text-indigo-700">← Trả lời bằng thẻ QR</Link><header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-black">Kho câu hỏi thẻ QR</h1><p className="mt-2">Bộ câu hỏi riêng, có ảnh và video để chiếu cho cả lớp.</p></div><Link to="/teacher/qr-cards/bank/new" className={button}>+ Tạo bộ câu hỏi QR</Link></header><QrWordImport/>{loading&&<p>Đang tải kho câu hỏi…</p>}{error&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-900">{error}</p>}{!loading&&!items.length&&!error&&<p className="rounded-2xl bg-indigo-50 p-6">Chưa có bộ câu hỏi thẻ QR. Chọn “Tạo bộ câu hỏi QR” để soạn bộ đầu tiên.</p>}<div className="grid gap-4 sm:grid-cols-2">{items.map(bank=><article key={bank.id} className="space-y-3 rounded-2xl border bg-white p-5"><h2 className="text-xl font-black">{bank.title}</h2><p>{bank.subject} • {bank.grade} • {bank.questions.length} câu</p><div className="flex flex-wrap gap-3"><Link to={`/teacher/qr-cards/bank/${bank.id}`} className={button}>Sửa câu hỏi / Ảnh / Video</Link><button className="font-bold text-rose-800 underline" onClick={()=>setDeleting(bank.id)}>Xóa bộ…</button></div>{deleting===bank.id&&<div className="rounded-xl bg-amber-50 p-3"><p>Xóa bộ này khỏi kho? Các tiết đã tạo vẫn giữ nguyên câu hỏi và kết quả.</p><button className={button} disabled={busy} onClick={()=>void remove(bank.id)}>Xác nhận xóa</button> <button className="underline" disabled={busy} onClick={()=>setDeleting('')}>Giữ lại</button></div>}</article>)}</div></section>;
}
