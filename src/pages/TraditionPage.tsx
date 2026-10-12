import { BookOpen, Images, Clapperboard, Flower2, Gamepad2, Sparkles } from 'lucide-react';
import { MaterialCard } from '../components/tradition/MaterialCard';
import { TraditionMaterials,materialKinds,type TraditionMaterial } from '../services/tradition/TraditionMaterials';
import React,{useState,useEffect} from 'react';
import {TraditionService,type TraditionQuiz} from '../services/tradition/TraditionService';
import {gradePractice} from '../services/practice/grading';
import type {PracticeResult} from '../services/practice/types';
import {OrderingAnswer} from '../components/student/OrderingAnswer';
// Curated reading order: historical periods, then related cultural themes.
const materialReadingOrder:Record<string,string[]>={
 HISTORY:['Thần Sa','Hồ Đề','Lý Bí','Năm 1831','năm 1917','Chợ Chu','ATK Định Hóa','Bắc Thái 1965','Đại đội 915','Sông Công','Thái Nguyên hôm nay'],
 CULTURE:['Then','Soọng cô','Pả Dung','đền Đuổm','Núi Văn','Lồng tồng','Cầu mùa','Tân Cương','Tương nếp','Xôi ngũ sắc','Cơm lam','Bảo tàng','Thiên nhiên','Hồ Núi Cốc','Tự hào'],
 IMAGE:['Ảnh tư liệu 1945','Ảnh tư liệu 1965','Thần Sa','Không gian văn hóa trà','Quảng trường'],
 VIDEO:['ATK Định Hóa','Nẻo về nguồn cội','Hội xuân'],
};
const materialGuides:Record<string,string>={
 HISTORY:'Từ dấu tích tiền sử, nhân vật lịch sử đến các mốc thành lập tỉnh, cách mạng và quê hương hôm nay.',
 CULTURE:'Dân ca • Lễ hội • Nghề truyền thống và ẩm thực • Không gian văn hóa quê hương.',
 IMAGE:'Ảnh tư liệu lịch sử trước, hình ảnh di tích và cảnh quan sau. Đọc chú thích để biết thời điểm và nguồn ảnh.',
 VIDEO:'Tìm hiểu lịch sử qua chương trình tư liệu, sau đó khám phá các hoạt động gìn giữ truyền thống hôm nay.',
};
function compareMaterials(a:TraditionMaterial,b:TraditionMaterial){
 const order=materialReadingOrder[a.kind] || [];
 const rank=(item:TraditionMaterial)=>{const index=order.findIndex(keyword=>item.title.toLocaleLowerCase('vi').includes(keyword.toLocaleLowerCase('vi')));return index<0?order.length:index;};
 return rank(a)-rank(b) || a.title.localeCompare(b.title,'vi') || a.id.localeCompare(b.id);
}
export const TraditionPage:React.FC=()=>{
 const [items,setItems]=useState<TraditionQuiz[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[selected,setSelected]=useState<TraditionQuiz|null>(null),[answers,setAnswers]=useState<Record<string,string>>({}),[result,setResult]=useState<PracticeResult|null>(null);
 const [materials,setMaterials]=useState<TraditionMaterial[]>([]);
 const [activeSection,setActiveSection]=useState(()=>window.location.hash.slice(1) || 'material-HISTORY');
 useEffect(()=>{
  const syncSection=()=>{const section=window.location.hash.slice(1);setActiveSection(section==='tradition-questions' || Object.keys(materialKinds).some(kind=>section==='material-'+kind) ? section : 'material-HISTORY');};
  syncSection();
  window.addEventListener('hashchange',syncSection);
  return ()=>window.removeEventListener('hashchange',syncSection);
 },[]);
 const navClass=(section:string)=>`min-h-14 flex shrink-0 items-center gap-3 border-2 rounded-2xl px-4 py-3 text-base font-extrabold shadow-sm transition-all focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${activeSection===section?'bg-sky-700 border-sky-700 text-white shadow-md':'bg-white border-sky-100 text-slate-800 hover:bg-sky-50 hover:border-sky-300'}`;
 const sectionIcons:Record<string,React.ReactNode>={HISTORY:<BookOpen size={23}/>,CULTURE:<Flower2 size={23}/>,IMAGE:<Images size={23}/>,VIDEO:<Clapperboard size={23}/>};
 const load=async()=>{setLoading(true);setError('');try{const [quizzes,docs]=await Promise.all([TraditionService.list(),TraditionMaterials.list()]);setItems(quizzes);setMaterials(docs);}catch{setError('Chưa tải được học liệu. Vui lòng thử lại.');}finally{setLoading(false);}};
 useEffect(()=>{void load();},[]);
 return <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-white text-slate-900"><header className="bg-sky-900 text-white px-5 py-4"><div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-3"><p className="font-bold">TRƯỜNG TIỂU HỌC SÔNG CÔNG<br/><span className="font-normal text-emerald-100">Phân hiệu Lý Tự Trọng</span></p><a href="/" className="underline text-emerald-100">Về cổng lớp học</a></div></header>
 <main className="max-w-6xl mx-auto px-5 py-5 space-y-5"><section className="rounded-3xl bg-gradient-to-r from-sky-800 via-blue-700 to-emerald-700 text-white p-6 sm:p-9 border-b-8 border-amber-400 shadow-xl"><p className="text-amber-300 font-bold tracking-wide">THÁI NGUYÊN 195 NĂM • 1831–2026</p><h1 className="text-3xl sm:text-5xl font-black my-3 leading-tight">GÓC TRUYỀN THỐNG SỐ</h1><p className="text-base text-amber-100"><Sparkles className="inline-block mr-2" aria-hidden="true"/>Em yêu quê hương Thái Nguyên</p><p className="mt-2 max-w-3xl text-sm text-emerald-50">Cùng khám phá lịch sử, văn hóa và con người Thái Nguyên qua tư liệu, hình ảnh, video và câu hỏi tương tác do giáo viên lựa chọn.</p></section>
 <div className={selected ? '' : 'grid gap-5 md:grid-cols-[210px_minmax(0,1fr)] items-start'}>
 {!selected && <nav aria-label="Mục tư liệu" className="flex md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0 md:sticky md:top-5">{Object.entries(materialKinds).map(([kind,label])=><a key={kind} href={'#material-'+kind} onClick={()=>setActiveSection('material-'+kind)} aria-current={activeSection==='material-'+kind?'location':undefined} className={navClass('material-'+kind)}>{sectionIcons[kind]}<span className="whitespace-nowrap">{label}</span></a>)}<a href="#tradition-questions" onClick={()=>setActiveSection('tradition-questions')} aria-current={activeSection==='tradition-questions'?'location':undefined} className={navClass('tradition-questions')}><Gamepad2 size={23}/><span className="whitespace-nowrap">Câu hỏi tương tác</span></a></nav>}
 <div className="min-w-0 space-y-5">
 {!selected && <>{Object.entries(materialKinds).map(([kind,label])=><section key={kind} id={'material-'+kind} className="space-y-4 scroll-mt-4"><h2 className="font-black text-2xl sm:text-3xl text-sky-950">{label}</h2><p className="text-sm text-slate-600">{materialGuides[kind]}</p>{loading?<p>Đang tải tư liệu…</p>:materials.some(i=>i.kind===kind)?<div className="grid sm:grid-cols-2 gap-4">{materials.filter(i=>i.kind===kind).sort(compareMaterials).map(item=><MaterialCard key={item.id} item={item}/>)}</div>:<p className="bg-white border rounded-xl p-4 text-slate-600">{error || 'Tư liệu đang được giáo viên chuẩn bị và kiểm tra trước khi đưa lên.'}</p>}</section>)}</>}
 {!selected ? <><div className="flex flex-wrap gap-3 justify-between items-center"><h2 id="tradition-questions" className="scroll-mt-5 text-2xl font-black text-emerald-950">Câu hỏi tương tác</h2><button className="px-4 py-2 bg-white border rounded-xl" onClick={()=>{void load();}}>Tải lại học liệu</button></div>{loading?<p>Đang tải các bộ câu hỏi…</p>:error?<p role="alert" className="text-red-800">{error}</p>:!items.length?<section className="bg-white border rounded-2xl p-6"><h3 className="font-bold">Học liệu đang được chuẩn bị</h3><p className="mt-2">Các bộ câu hỏi về Thái Nguyên sẽ xuất hiện tại đây sau khi giáo viên kiểm tra và đưa lên.</p></section>:<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(item=><section key={item.id} className="bg-white border-2 border-sky-100 rounded-3xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow"><p className="text-sm text-emerald-800 font-bold">{item.grade} • {item.questions.length} câu hỏi</p><h3 className="font-black text-xl">{item.title}</h3><button onClick={()=>{setSelected(item);setAnswers({});setResult(null);}} className="min-h-12 bg-sky-700 hover:bg-sky-800 text-white rounded-2xl px-5 py-3 font-extrabold">Bắt đầu khám phá →</button></section>)}</div>}<p className="text-sm text-slate-600">Hoạt động tự luyện, không cần đăng nhập hay nhập tên. Kết quả chỉ hiển thị trên thiết bị đang làm bài.</p></> : <section className="space-y-4"><button className="text-emerald-900 underline font-bold" onClick={()=>setSelected(null)}>← Các bộ câu hỏi</button><h2 className="text-2xl font-black">{selected.title}</h2>{result && <div className="bg-emerald-100 border border-emerald-300 rounded-2xl p-5"><h3 className="text-xl font-black">Em đã hoàn thành!</h3><p>Đúng {result.correctCount}/{result.totalCount} câu • {result.score}%</p><button className="mt-3 underline font-bold" onClick={()=>{setAnswers({});setResult(null);}}>Khám phá lại</button></div>}
 {selected.questions.map((q,i)=><section key={q.id} className="bg-white border rounded-2xl p-5 space-y-3"><h3 className="font-bold text-lg whitespace-pre-wrap">Câu {i+1}. {q.content}</h3>{!result?<>
 {(q.type==='MULTIPLE_CHOICE' || q.type==='TRUE_FALSE') && <div className="grid sm:grid-cols-2 gap-2">{(q.type==='TRUE_FALSE'?['Đúng','Sai']:q.options || []).map((o,j)=><label key={j} className={`min-h-14 cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-3 text-base font-semibold transition-colors ${answers[q.id]===o?'bg-sky-100 border-sky-600 ring-2 ring-sky-200':'border-slate-200 hover:bg-sky-50 hover:border-sky-300'}`}><input type="radio" name={q.id} checked={answers[q.id]===o} onChange={()=>setAnswers(a=>({...a,[q.id]:o}))}/><span>{q.type==='MULTIPLE_CHOICE'?`${String.fromCharCode(65+j)}. `:''}{o}</span></label>)}</div>}
 {q.type==='ORDERING' && <OrderingAnswer key={q.id} options={q.options || []} value={answers[q.id] || ''} onChange={value=>setAnswers(a=>({...a,[q.id]:value}))}/>}
 {(q.type==='SHORT_ANSWER' || q.type==='FILL_BLANK') && <label className="block">Câu trả lời của em<input className="block w-full border rounded-xl p-3 mt-2" value={answers[q.id] || ''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}/></label>}
 </>:<div className="space-y-2"><p className={result.breakdown[i].isCorrect?'font-bold text-emerald-800':'font-bold text-amber-900'}>{result.breakdown[i].isCorrect?'✓ Chính xác':'Hãy xem lại đáp án'}</p><p>Em trả lời: {answers[q.id] || 'Chưa trả lời'}</p><p>Đáp án: {q.correctAnswer}</p>{q.explanation && <p>{q.explanation}</p>}</div>}</section>)}
 {!result && <div className="sticky bottom-0 bg-white border rounded-xl p-4 flex justify-between items-center gap-3"><p>Đã trả lời {selected.questions.filter(q=>answers[q.id]?.trim()).length}/{selected.questions.length} câu</p><button className="bg-emerald-800 text-white p-3 rounded-xl font-bold" onClick={()=>setResult(gradePractice(selected.questions,answers))}>Xem kết quả</button></div>}
 </section>}
 </div></div>
 <footer className="border-t border-emerald-200 pt-5 text-sm text-slate-600">Học liệu phục vụ giáo dục truyền thống tại Phân hiệu Lý Tự Trọng • Trường Tiểu học Sông Công</footer>
 </main></div>;
};
