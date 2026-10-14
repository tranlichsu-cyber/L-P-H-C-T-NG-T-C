import {useMemo,useState} from 'react';
import {isValidStudentPinFormat} from '../../services/selfPractice/grade4WritingIdentity';

export interface RosterClass {id:string;name:string;students:Array<{id:string;name:string}>}
export interface VerifiedStudent {classId:string;studentId:string;studentName:string;className:string}
interface Props {
  classes:RosterClass[];
  onVerify:(choice:{classId:string;studentId:string;pin:string})=>Promise<void>;
  loading?:boolean;
}
/** Presentational form only. The parent MUST load a privacy-safe roster and verify PIN server-side. */
export function Grade4StudentIdentityForm({classes,onVerify,loading=false}:Props){
  const [classId,setClassId]=useState('');
  const [studentId,setStudentId]=useState('');
  const [pin,setPin]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const students=useMemo(()=>classes.find(c=>c.id===classId)?.students||[],[classes,classId]);
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();setError('');
    if(!classId||!studentId||!students.some(s=>s.id===studentId)||!isValidStudentPinFormat(pin)){
      setError('Vui lòng chọn đúng lớp, họ tên và nhập mã xác nhận 6 chữ số.');return;
    }
    setBusy(true);
    try{await onVerify({classId,studentId,pin});setPin('');}
    catch{setError('Không thể xác nhận. Em kiểm tra lại thông tin hoặc liên hệ giáo viên.');}
    finally{setBusy(false);}
  };
  return <form onSubmit={submit} className="mx-auto max-w-lg space-y-5 rounded-3xl border-2 border-sky-200 bg-white p-6 shadow-sm" aria-label="Xác nhận học sinh lớp 4">
    <h2 className="text-2xl font-black text-sky-900">Em hãy chọn tên của mình</h2>
    <p className="text-sm text-slate-600">Mỗi bạn có mã xác nhận riêng do giáo viên cấp. Không chia sẻ mã cho người khác.</p>
    <label className="block font-bold text-slate-800">1. Chọn lớp
      <select required value={classId} onChange={e=>{setClassId(e.target.value);setStudentId('');setPin('');setError('');}} className="mt-2 block min-h-12 w-full rounded-xl border-2 border-slate-200 p-3">
        <option value="">-- Chọn lớp --</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </label>
    <label className="block font-bold text-slate-800">2. Chọn họ và tên
      <select required disabled={!classId} value={studentId} onChange={e=>{setStudentId(e.target.value);setError('');}} className="mt-2 block min-h-12 w-full rounded-xl border-2 border-slate-200 p-3 disabled:opacity-50">
        <option value="">-- Chọn tên của em --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </label>
    <label className="block font-bold text-slate-800">3. Mã xác nhận cá nhân
      <input required type="password" inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,'').slice(0,6))} placeholder="6 chữ số" className="mt-2 block min-h-12 w-full rounded-xl border-2 border-slate-200 p-3"/>
    </label>
    {error&&<p role="alert" className="rounded-xl bg-rose-50 p-3 font-semibold text-rose-800">{error}</p>}
    <button type="submit" disabled={busy||loading||!classId||!studentId||!isValidStudentPinFormat(pin)} className="min-h-12 w-full rounded-xl bg-sky-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy?'Đang xác nhận…':'Xác nhận và làm bài'}</button>
  </form>;
}
