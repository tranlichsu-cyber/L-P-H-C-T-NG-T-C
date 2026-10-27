import {HistoryArticle} from './HistoryArticle';
import {useState} from 'react';
import {heritageCatalog} from '../../data/heritageCatalog';
import {normalizeMapText} from '../../data/traditionMap';
const communes=[...new Set(heritageCatalog.map(record=>record.commune))].sort((a,b)=>a.localeCompare(b,'vi'));
export function HeritageCatalog({onOpenArea}:{onOpenArea:(areaId:string)=>void}){
 const [query,setQuery]=useState(''),[commune,setCommune]=useState('Tất cả'),[kind,setKind]=useState('Tất cả'),[limit,setLimit]=useState(12),[openId,setOpenId]=useState('');
 const results=heritageCatalog.filter(record=>(commune==='Tất cả'||record.commune===commune)&&(kind==='Tất cả'||record.kind===kind)&&normalizeMapText(record.name+' '+record.address+' '+record.formerArea).includes(normalizeMapText(query)));
 return <section id="heritage-catalog" className="scroll-mt-4 space-y-4" aria-labelledby="heritage-catalog-title">
 <div className="rounded-2xl bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-50 border border-emerald-200 p-5 shadow-2xs">
  <div className="flex flex-wrap items-center justify-between gap-2">
   <h2 id="heritage-catalog-title" className="text-2xl font-black text-emerald-950">Tra cứu di tích trên địa bàn tỉnh</h2>
   <span className="rounded-full bg-white/90 border border-emerald-300 px-3 py-1 text-xs font-extrabold text-emerald-900">{heritageCatalog.length} hồ sơ • {communes.length} xã, phường</span>
  </div>
  <p className="mt-2 leading-7 text-slate-700">Bao gồm các di tích, cụm di tích và điểm thành phần tại Thái Nguyên và Bắc Kạn trước sáp nhập đã được đối chiếu từ nguồn chính thức.</p>
 </div>
 <div className="grid sm:grid-cols-2 gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
  <label className="sm:col-span-2"><span className="font-bold text-sm text-slate-700">Tìm tên di tích, địa chỉ hoặc khu vực cũ</span><input type="search" value={query} onChange={e=>{setQuery(e.target.value);setLimit(12);}} placeholder="Ví dụ: Đền Mục, Nà Tu, Chợ Đồn…" className="block mt-1.5 w-full border-2 border-slate-200 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none"/></label>
  <label><span className="font-bold text-sm text-slate-700">Xã, phường hiện nay</span><select value={commune} onChange={e=>{setCommune(e.target.value);setLimit(12);}} className="block mt-1.5 w-full border-2 border-slate-200 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none">{['Tất cả',...communes].map(item=><option key={item}>{item}</option>)}</select></label>
  <label><span className="font-bold text-sm text-slate-700">Nhóm hồ sơ</span><select value={kind} onChange={e=>{setKind(e.target.value);setLimit(12);}} className="block mt-1.5 w-full border-2 border-slate-200 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none">{['Tất cả','Lịch sử','Văn hóa','Khảo cổ'].map(item=><option key={item}>{item}</option>)}</select></label>
 </div>
 <div className="flex flex-wrap justify-between items-center gap-2 px-1">
  <p role="status" className="text-sm font-bold text-slate-700">Tìm thấy <span className="text-emerald-900">{results.length}</span> hồ sơ • Đang hiển thị <span className="text-emerald-900">{Math.min(limit,results.length)}</span></p>
  <button onClick={()=>{setQuery('');setCommune('Tất cả');setKind('Tất cả');setLimit(12);}} className="border border-slate-300 hover:bg-slate-50 rounded-xl bg-white px-3.5 py-1.5 text-sm font-bold text-slate-700">Xóa bộ lọc</button>
 </div>
 <div className="grid sm:grid-cols-2 gap-4 items-stretch">{results.slice(0,limit).map(record=>{
  const isOpen=openId===record.id;
  return <article key={record.id} className={`flex flex-col justify-between bg-white border-2 border-emerald-200/80 hover:border-emerald-400 rounded-2xl p-5 shadow-2xs transition-all ${isOpen?'sm:col-span-2':''}`}>
   <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
     <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-900">{record.kind}</span>
     <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{record.commune}</span>
    </div>
    <h3 className="font-black text-xl text-sky-950 leading-snug">{record.name}</h3>
    <p className="text-sm leading-6 text-slate-700"><strong className="text-slate-900">Địa điểm:</strong> {record.address}, tỉnh Thái Nguyên.</p>
    <p className="text-sm sm:text-base leading-7 text-slate-700">{record.summary}</p>
   </div>
   <div className="pt-4 mt-4 border-t border-slate-100">
    <details open={isOpen} onToggle={e=>setOpenId((e.currentTarget as HTMLDetailsElement).open?record.id:(openId===record.id?'':openId))}>
     <summary className="cursor-pointer font-bold text-sky-800 hover:text-sky-950 py-1.5 text-sm sm:text-base">Đọc bài giới thiệu chi tiết và nguồn tư liệu</summary>
     <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
      {record.detail ? <HistoryArticle id={'heritage-'+record.id} title={record.name} text={record.detail} sources={[]}/> : <p className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-sm text-amber-900">Hồ sơ này hiện có thông tin giới thiệu tóm tắt. Nội dung chi tiết đang được đối chiếu thêm từ nguồn chính thức; xem liên kết bên dưới để tìm hiểu sâu hơn.</p>}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-sm text-slate-700 space-y-2">
       <p>Khu vực trước sắp xếp: <strong>{record.formerArea}</strong> • Ngày đối chiếu: <strong>{record.checkedAt}</strong></p>
       <div className="flex flex-wrap items-center gap-3 pt-1">
        <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline text-sky-800">Nguồn thông tin chính thức ↗</a>
        {record.addressSourceUrl && <a href={record.addressSourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline text-sky-800">Nguồn đối chiếu địa chỉ ↗</a>}
        {record.mapAreaId && <button onClick={()=>onOpenArea(record.mapAreaId!)} className="min-h-10 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold px-3.5 py-1.5 text-xs sm:text-sm">Xem trên bản đồ →</button>}
       </div>
      </div>
     </div>
    </details>
   </div>
  </article>;
 })}</div>
 {results.length===0 && <p className="rounded-xl border bg-white p-4">Chưa có hồ sơ phù hợp trong dữ liệu đã đối chiếu. Em thử tên khác hoặc xóa bộ lọc.</p>}
 {limit<results.length && <div className="flex justify-center pt-2"><button className="min-h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 font-bold shadow-sm transition-colors" onClick={()=>setLimit(value=>value+12)}>Xem thêm hồ sơ ({results.length-limit} còn lại)</button></div>}
 </section>;
}
