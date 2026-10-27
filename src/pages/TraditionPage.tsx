import {bookCultureArticles} from '../data/bookCultureArticles';
import {curatedTraditionMaterials} from '../data/traditionMaterials';
import {HistoryLibrary} from '../components/tradition/HistoryLibrary';
import {TraditionStoryMap} from '../components/tradition/TraditionStoryMap';
import {HeritageCatalog} from '../components/tradition/HeritageCatalog';
import {traditionMapPlaces} from '../data/traditionMap';
import {curatedTraditionQuizzes} from '../data/traditionQuizzes';
import { BookOpen, Images, Clapperboard, Flower2, Gamepad2, Sparkles, MapPinned } from 'lucide-react';
import { MaterialCard } from '../components/tradition/MaterialCard';
import { TraditionMaterials,materialKinds,type TraditionMaterial } from '../services/tradition/TraditionMaterials';
import React,{useState,useEffect} from 'react';
import {TraditionService,type TraditionQuizContent} from '../services/tradition/TraditionService';
import {TraditionQuizRunner} from '../components/tradition/TraditionQuizRunner';

// Curated reading order: historical periods, then related cultural themes.
const materialReadingOrder:Record<string,string[]>={
 HISTORY:['Thần Sa','Cầu Muối','Hồ Đề','Lý Bí','Đuổm','Núi Văn','Lưu Nhân Chú','Đỗ Cận','Năm 1831','năm 1917','Chợ Chu','Bá Vân','Chùa Đán','Nà Tu','Nà Pậu','Bản Ca','An Mạ','Đầm Sơn','Đình Trên','Bá Xuyên','Lục Giáp','Kim Sơn Tự','Chùa Hang Định Hóa','ATK Định Hóa','Bắc Thái 1965','Đại đội 915','Sông Công','Thái Nguyên hôm nay'],
 CULTURE:['Then','Soọng cô','Pả Dung','đền Đuổm','Núi Văn','Lồng tồng','Cầu mùa','Tân Cương','Tương nếp','Xôi ngũ sắc','Cơm lam','Bảo tàng','Thiên nhiên','Hồ Núi Cốc','Tự hào'],
 IMAGE:['Bác Hồ làm việc tại ATK Định Hóa','Đại tướng Võ Nguyên Giáp','Khu Gang thép','Thanh niên xung phong','Đội Cấn và Lương Ngọc Quyến','Cứu quốc quân II','Ảnh tư liệu 1945','Ảnh tư liệu 1965','Thần Sa','Không gian văn hóa trà','Quảng trường'],
 VIDEO:['ATK Định Hóa','Nẻo về nguồn cội','Hội xuân'],
};
const materialGuides:Record<string,string>={
 HISTORY:'Từ dấu tích tiền sử, nhân vật lịch sử đến các mốc thành lập tỉnh, cách mạng và quê hương hôm nay.',
 CULTURE:'Dân ca • Lễ hội • Nghề truyền thống và ẩm thực • Không gian văn hóa quê hương.',
 IMAGE:'Ảnh tư liệu lịch sử trước, hình ảnh di tích và cảnh quan sau. Đọc chú thích để biết thời điểm và nguồn ảnh.',
 VIDEO:'Tìm hiểu lịch sử qua chương trình tư liệu, sau đó khám phá các hoạt động gìn giữ truyền thống hôm nay.',
};
const sectionHeaderStyles:Record<string,string>={
 HISTORY:'from-amber-100 via-amber-50 to-yellow-50 border-amber-200',
 CULTURE:'from-rose-100 via-rose-50 to-orange-50 border-rose-200',
 IMAGE:'from-violet-100 via-violet-50 to-indigo-50 border-violet-200',
 VIDEO:'from-orange-100 via-amber-50 to-yellow-50 border-orange-200',
};
function compareMaterials(a:TraditionMaterial,b:TraditionMaterial){
 const order=materialReadingOrder[a.kind] || [];
 const rank=(item:TraditionMaterial)=>{const index=order.findIndex(keyword=>item.title.toLocaleLowerCase('vi').includes(keyword.toLocaleLowerCase('vi')));return index<0?order.length:index;};
 return rank(a)-rank(b) || a.title.localeCompare(b.title,'vi') || a.id.localeCompare(b.id);
}
export const TraditionPage:React.FC=()=>{
 const [items,setItems]=useState<TraditionQuizContent[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[selected,setSelected]=useState<TraditionQuizContent|null>(null);
 const [materials,setMaterials]=useState<TraditionMaterial[]>([]);
 const [selectedMapPlace,setSelectedMapPlace]=useState('');
 const curatedMaterials=[...bookCultureArticles,...curatedTraditionMaterials];
 const readingMaterials=[...curatedMaterials,...materials.filter(item=>!curatedMaterials.some(curated=>curated.id===item.id || curated.title===item.title))];
 const [activeSection,setActiveSection]=useState(()=>{
  const raw=typeof window!=='undefined'?window.location.hash.slice(1):'';
  return raw.startsWith('history-')?'history-library':/^heritage-.*-section-\d+$/.test(raw)?'heritage-catalog':raw||'history-library';
 });
 useEffect(()=>{
  const syncSection=()=>{
   const raw=window.location.hash.slice(1);
   const section=raw.startsWith('history-')?'history-library':/^heritage-.*-section-\d+$/.test(raw)?'heritage-catalog':raw;
   setActiveSection(section==='history-library' || section==='heritage-catalog' || section==='tradition-map' || section==='tradition-questions' || Object.keys(materialKinds).some(kind=>section==='material-'+kind) ? section : 'history-library');
  };
  syncSection();
  window.addEventListener('hashchange',syncSection);
  return ()=>window.removeEventListener('hashchange',syncSection);
 },[]);
 const switchSection=(section:string)=>{
  setActiveSection(section);
  window.location.hash=section;
  if(window.innerWidth<768){
   requestAnimationFrame(()=>{
    document.getElementById('tradition-content')?.scrollIntoView({behavior:'smooth',block:'start'});
   });
  }
 };
 const backToQuizzes=()=>{
  setSelected(null);
  switchSection('tradition-questions');
 };
 const navColors:Record<string,string>={
  'history-library':'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-400',
  'tradition-map':'bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-400',
  'heritage-catalog':'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400',
  'material-HISTORY':'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-400',
  'material-CULTURE':'bg-rose-50 border-rose-200 hover:bg-rose-100 hover:border-rose-400',
  'material-IMAGE':'bg-violet-50 border-violet-200 hover:bg-violet-100 hover:border-violet-400',
  'material-VIDEO':'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-400',
  'tradition-questions':'bg-lime-50 border-lime-200 hover:bg-lime-100 hover:border-lime-400',
 };
 const navClass=(section:string)=>`min-h-16 flex items-center gap-3 border-2 rounded-2xl px-4 py-3 text-base font-extrabold shadow-sm transition-all focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${activeSection===section?'bg-sky-700 border-sky-700 text-white shadow-md':`text-slate-800 ${navColors[section]||navColors['tradition-map']}`}`;
 const sectionIcons:Record<string,React.ReactNode>={HISTORY:<BookOpen size={23}/>,CULTURE:<Flower2 size={23}/>,IMAGE:<Images size={23}/>,VIDEO:<Clapperboard size={23}/>};
 const load=async()=>{
  setLoading(true);setError('');
  const [quizzes,docs]=await Promise.allSettled([TraditionService.list(),TraditionMaterials.list()]);
  const published=quizzes.status==='fulfilled'?quizzes.value:[];
  setItems([...curatedTraditionQuizzes,...published.filter(quiz=>!curatedTraditionQuizzes.some(item=>item.id===quiz.id || item.title===quiz.title))]);
  if(docs.status==='fulfilled')setMaterials(docs.value);else setError('Chưa tải được tư liệu. Em hãy bấm tải lại nội dung.');
  setLoading(false);
 };
 useEffect(()=>{void load();},[]);
 return <div className="learning-shell min-h-screen text-slate-900"><header className="bg-sky-900 text-white px-5 py-4"><div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-3"><p className="font-bold">TRƯỜNG TIỂU HỌC SÔNG CÔNG<br/><span className="font-normal text-emerald-100">Phân hiệu Lý Tự Trọng</span></p><a href="/" className="underline text-emerald-100">Về cổng lớp học</a></div></header>
 <main className="max-w-6xl mx-auto px-5 py-5 space-y-6"><section className="rounded-3xl bg-gradient-to-r from-sky-800 via-blue-700 to-emerald-700 text-white p-4 sm:p-5 border-b-4 border-amber-400 shadow-xl"><h1 className="text-2xl sm:text-3xl font-black my-2 leading-tight">GÓC TRUYỀN THỐNG SỐ</h1><p className="text-base text-amber-100"><Sparkles className="inline-block mr-2" aria-hidden="true"/>Em yêu quê hương Thái Nguyên</p><p className="mt-2 max-w-3xl text-base text-sky-50">Em chọn một mục bên dưới để đọc, xem ảnh hoặc thử sức với câu hỏi về quê hương.</p></section>
 <div className={selected ? '' : 'grid gap-6 md:grid-cols-[240px_minmax(0,1fr)] items-start'}>
 {!selected && <nav aria-label="Mục tư liệu" className="grid grid-cols-2 md:flex md:flex-col gap-3 md:sticky md:top-5"><a href="#history-library" onClick={(e)=>{e.preventDefault();switchSection('history-library');}} aria-current={activeSection==='history-library'?'location':undefined} className={navClass('history-library')}><BookOpen size={23}/><span>Bài giới thiệu lịch sử</span></a><a href="#tradition-map" onClick={(e)=>{e.preventDefault();switchSection('tradition-map');}} aria-current={activeSection==='tradition-map'?'location':undefined} className={navClass('tradition-map')}><MapPinned size={23}/><span>Bản đồ khám phá</span></a><a href="#heritage-catalog" onClick={(e)=>{e.preventDefault();switchSection('heritage-catalog');}} aria-current={activeSection==='heritage-catalog'?'location':undefined} className={navClass('heritage-catalog')}><BookOpen size={23}/><span>Tra cứu di tích</span></a>{Object.entries(materialKinds).map(([kind,label])=><a key={kind} href={'#material-'+kind} onClick={(e)=>{e.preventDefault();switchSection('material-'+kind);}} aria-current={activeSection==='material-'+kind?'location':undefined} className={navClass('material-'+kind)}>{sectionIcons[kind]}<span className="whitespace-normal">{label}</span></a>)}<a href="#tradition-questions" onClick={(e)=>{e.preventDefault();switchSection('tradition-questions');}} aria-current={activeSection==='tradition-questions'?'location':undefined} className={navClass('tradition-questions')}><Gamepad2 size={23}/><span className="whitespace-normal">Câu hỏi tương tác</span></a></nav>}
 <div id="tradition-content" className="min-w-0 space-y-6">
 {!selected ? <>
  {activeSection==='history-library' && <HistoryLibrary materials={materials}/>}
  {activeSection==='tradition-map' && <TraditionStoryMap materials={readingMaterials} selectedPlaceName={selectedMapPlace} onSelectPlace={setSelectedMapPlace} onOpenCatalog={()=>switchSection('heritage-catalog')}/>}
  {activeSection==='heritage-catalog' && <HeritageCatalog onOpenArea={id=>{const area=traditionMapPlaces.find(p=>p.id===id);if(area){setSelectedMapPlace(area.name);switchSection('tradition-map');requestAnimationFrame(()=>document.getElementById('tradition-map')?.scrollIntoView({block:'start'}));}}}/>}
  {activeSection.startsWith('material-') && (()=>{
   const kind=activeSection.replace('material-','');
   const label=materialKinds[kind as keyof typeof materialKinds];
   if(!label)return null;
   const list=readingMaterials.filter(i=>i.kind===kind).sort(compareMaterials);
   return <section id={'material-'+kind} className="space-y-4 scroll-mt-4">
    <div className={`rounded-2xl bg-gradient-to-r ${sectionHeaderStyles[kind]||sectionHeaderStyles.HISTORY} border p-5 shadow-2xs`}>
     <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-black text-2xl text-sky-950 flex items-center gap-2.5">{sectionIcons[kind]}<span>{label}</span></h2>
      <span className="rounded-full bg-white/90 border border-slate-300 px-3 py-1 text-xs font-extrabold text-slate-800">{list.length} tư liệu</span>
     </div>
     <p className="mt-2 leading-7 text-slate-700">{materialGuides[kind]}</p>
    </div>
    {list.length?<div className="grid sm:grid-cols-2 gap-4 items-stretch">{list.map(item=><MaterialCard key={item.id} item={item} compact={kind!=='HISTORY'&&kind!=='CULTURE'}/>)}</div>:loading?<p>Đang tải tư liệu…</p>:<p className="bg-white border rounded-xl p-4 text-slate-600">{error || 'Tư liệu đang được giáo viên chuẩn bị và kiểm tra trước khi đưa lên.'}</p>}
   </section>;
  })()}
  {activeSection==='tradition-questions' && <section className="space-y-4">
   <div className="rounded-2xl bg-gradient-to-r from-lime-100 via-emerald-50 to-teal-50 border border-lime-200 p-5 shadow-2xs flex flex-wrap gap-3 justify-between items-center">
    <div>
     <h2 id="tradition-questions" tabIndex={-1} className="scroll-mt-5 text-2xl font-black text-emerald-950 flex items-center gap-2.5"><Gamepad2 size={24}/><span>Câu hỏi tương tác</span></h2>
     <p className="mt-1 text-sm sm:text-base text-slate-700">Hoạt động tự luyện, không cần đăng nhập hay nhập tên. Kết quả chỉ hiển thị trên thiết bị đang làm bài.</p>
    </div>
    <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-emerald-300 rounded-xl font-bold text-sm text-emerald-950 shadow-2xs" onClick={()=>{void load();}}>Tải lại nội dung</button>
   </div>
   {loading?<p>Đang tải các bộ câu hỏi…</p>:error && !items.length?<p role="alert" className="text-red-800">{error}</p>:!items.length?<section className="bg-white border rounded-2xl p-6"><h3 className="font-bold">Học liệu đang được chuẩn bị</h3><p className="mt-2">Các bộ câu hỏi về Thái Nguyên sẽ xuất hiện tại đây sau khi giáo viên kiểm tra và đưa lên.</p></section>:<div className="grid sm:grid-cols-2 gap-4 items-stretch">{items.map(item=><section key={item.id} className="flex flex-col justify-between h-full bg-white border-2 border-sky-100 hover:border-sky-300 rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-md transition-all"><div className="space-y-2"><span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-800 font-extrabold">{item.grade} • {item.questions.length} câu hỏi</span><h3 className="font-black text-xl text-sky-950 leading-snug">{item.title}</h3></div><button onClick={()=>{setSelected(item);}} className="w-full min-h-11 bg-sky-700 hover:bg-sky-800 text-white rounded-xl px-5 py-2.5 font-extrabold transition-colors">Bắt đầu khám phá →</button></section>)}</div>}
  </section>}
 </> : <TraditionQuizRunner key={selected.id} quiz={selected} onBack={backToQuizzes}/>}
 </div></div>
 <footer className="border-t border-emerald-200 pt-5 text-sm text-slate-600">Học liệu phục vụ giáo dục truyền thống tại Phân hiệu Lý Tự Trọng • Trường Tiểu học Sông Công</footer>
 </main></div>;
};
