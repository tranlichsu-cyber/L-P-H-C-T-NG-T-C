import {curatedTraditionQuizzes} from '../data/traditionQuizzes';
import { BookOpen, Images, Clapperboard, Flower2, Trophy, Landmark, GraduationCap } from 'lucide-react';
import { MaterialCard } from '../components/tradition/MaterialCard';
import { TraditionMaterials,materialKinds,type TraditionMaterial } from '../services/tradition/TraditionMaterials';
import React,{useState,useEffect} from 'react';
import {TraditionService,type TraditionQuizContent} from '../services/tradition/TraditionService';
import {TraditionQuizRunner} from '../components/tradition/TraditionQuizRunner';
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
 const [items,setItems]=useState<TraditionQuizContent[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[selected,setSelected]=useState<TraditionQuizContent|null>(null);
 const [materials,setMaterials]=useState<TraditionMaterial[]>([]);
 const [activeSection,setActiveSection]=useState(()=>window.location.hash.slice(1));
 useEffect(()=>{
  const syncSection=()=>{const section=window.location.hash.slice(1);setActiveSection(section==='tradition-questions' || Object.keys(materialKinds).some(kind=>section==='material-'+kind) ? section : '');};
  syncSection();
  window.addEventListener('hashchange',syncSection);
  return ()=>window.removeEventListener('hashchange',syncSection);
 },[]);
 const backToQuizzes=()=>{setSelected(null);requestAnimationFrame(()=>{const heading=document.getElementById('tradition-questions');heading?.scrollIntoView({block:'start'});heading?.focus({preventScroll:true});});};
 const sectionStyles:Record<string,string>={HISTORY:'bg-[#deefff] text-[#17639b]',CULTURE:'bg-[#fff1d6] text-[#985509]',IMAGE:'bg-[#def6eb] text-[#196c49]',VIDEO:'bg-[#f0e6fc] text-[#7844a4]'};
 const sectionIcons:Record<string,React.ReactNode>={HISTORY:<BookOpen size={32}/>,CULTURE:<Flower2 size={32}/>,IMAGE:<Images size={32}/>,VIDEO:<Clapperboard size={32}/>};
 const load=async()=>{
  setLoading(true);setError('');
  const [quizzes,docs]=await Promise.allSettled([TraditionService.list(),TraditionMaterials.list()]);
  const published=quizzes.status==='fulfilled'?quizzes.value:[];
  setItems([...curatedTraditionQuizzes,...published.filter(quiz=>!curatedTraditionQuizzes.some(item=>item.id===quiz.id || item.title===quiz.title))]);
  if(docs.status==='fulfilled')setMaterials(docs.value);else setError('Chưa tải được tư liệu. Em hãy bấm tải lại nội dung.');
  setLoading(false);
 };
 useEffect(()=>{void load();},[]);
 return <div className="min-h-screen bg-[#eaf7ff] text-slate-900"><header className="px-5 py-3"><div className="max-w-4xl mx-auto flex flex-wrap justify-between gap-2 text-sm text-sky-900"><p className="font-bold">TRƯỜNG TIỂU HỌC SÔNG CÔNG • Phân hiệu Lý Tự Trọng</p><a href="/" className="underline">Về cổng lớp học</a></div></header>
 <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-6 space-y-4"><section className="rounded-3xl bg-[#1468ae] text-white px-4 py-4 sm:py-5 text-center"><h1 className="text-2xl sm:text-3xl font-black leading-tight">GÓC TRUYỀN THỐNG SỐ</h1><p className="mt-2 text-base sm:text-xl">Em yêu quê hương Thái Nguyên</p><div className="mt-3 flex justify-center gap-4 text-[#ffe383]" aria-hidden="true"><BookOpen size={28}/><Landmark size={28}/><GraduationCap size={28}/></div></section>
 <div>
 {!selected && <nav aria-label="Mục tư liệu" className="space-y-4"><div className="grid grid-cols-2 gap-3 sm:gap-4">{Object.entries(materialKinds).map(([kind,label])=><a key={kind} href={'#material-'+kind} onClick={()=>setActiveSection('material-'+kind)} aria-current={activeSection==='material-'+kind?'location':undefined} className={`min-h-28 sm:min-h-32 flex flex-col justify-center items-center gap-2 rounded-2xl p-3 text-center text-base sm:text-xl font-bold transition-colors focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-700 ${activeSection==='material-'+kind?'bg-[#1468ae] text-white ring-4 ring-sky-200':sectionStyles[kind]+' hover:brightness-95'}`}>{sectionIcons[kind]}<span>{label}</span></a>)}</div><section className="rounded-3xl bg-[#ffe7ac] px-4 py-4 sm:p-5 text-center text-[#865000]"><h2 className="text-xl sm:text-2xl font-black flex justify-center items-center gap-3"><Trophy className="shrink-0" size={26} aria-hidden="true"/>EM VUI HỌC LỊCH SỬ</h2><p className="my-3 text-base sm:text-lg">Khám phá quê hương qua những câu hỏi thú vị!</p><a href="#tradition-questions" onClick={()=>setActiveSection('tradition-questions')} aria-current={activeSection==='tradition-questions'?'location':undefined} className={`flex justify-center items-center min-h-12 rounded-full px-4 py-3 text-base sm:text-xl font-extrabold text-white focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-700 ${activeSection==='tradition-questions'?'bg-[#1468ae] ring-4 ring-sky-200':'bg-[#ed9005] hover:bg-amber-600'}`}>Câu hỏi tương tác →</a></section></nav>}
 <div className="min-w-0 space-y-5 mt-6">
 {!selected && <>{Object.entries(materialKinds).map(([kind,label])=><section key={kind} id={'material-'+kind} className="space-y-4 scroll-mt-4"><h2 className="font-black text-xl sm:text-2xl text-sky-950">{label}</h2><p className="text-sm text-slate-600">{materialGuides[kind]}</p>{loading?<p>Đang tải tư liệu…</p>:materials.some(i=>i.kind===kind)?<div className="grid sm:grid-cols-2 gap-4">{materials.filter(i=>i.kind===kind).sort(compareMaterials).map(item=><MaterialCard key={item.id} item={item} compact/>)}</div>:<p className="bg-white border rounded-xl p-4 text-slate-600">{error || 'Tư liệu đang được giáo viên chuẩn bị và kiểm tra trước khi đưa lên.'}</p>}</section>)}</>}
 {!selected ? <><div className="flex flex-wrap gap-3 justify-between items-center"><h2 id="tradition-questions" tabIndex={-1} className="scroll-mt-5 text-2xl font-black text-emerald-950">Câu hỏi tương tác</h2><button className="px-4 py-2 bg-white border rounded-xl" onClick={()=>{void load();}}>Tải lại nội dung</button></div>{loading?<p>Đang tải các bộ câu hỏi…</p>:error && !items.length?<p role="alert" className="text-red-800">{error}</p>:!items.length?<section className="bg-white border rounded-2xl p-6"><h3 className="font-bold">Học liệu đang được chuẩn bị</h3><p className="mt-2">Các bộ câu hỏi về Thái Nguyên sẽ xuất hiện tại đây sau khi giáo viên kiểm tra và đưa lên.</p></section>:<div className="grid sm:grid-cols-2 gap-4">{items.map(item=><section key={item.id} className="bg-white border-2 border-sky-100 rounded-3xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow"><p className="text-sm text-emerald-800 font-bold">{item.grade} • {item.questions.length} câu hỏi</p><h3 className="font-black text-xl">{item.title}</h3><button onClick={()=>{setSelected(item);}} className="min-h-12 bg-sky-700 hover:bg-sky-800 text-white rounded-2xl px-5 py-3 font-extrabold">Bắt đầu khám phá →</button></section>)}</div>}<p className="text-sm text-slate-600">Hoạt động tự luyện, không cần đăng nhập hay nhập tên. Kết quả chỉ hiển thị trên thiết bị đang làm bài.</p></> : <TraditionQuizRunner key={selected.id} quiz={selected} onBack={backToQuizzes}/>}
 </div></div>
 <footer className="border-t border-emerald-200 pt-5 text-sm text-slate-600">Học liệu phục vụ giáo dục truyền thống tại Phân hiệu Lý Tự Trọng • Trường Tiểu học Sông Công</footer>
 </main></div>;
};
