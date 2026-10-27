import {bookCultureArticles} from '../data/bookCultureArticles';
import {curatedTraditionMaterials} from '../data/traditionMaterials';
import {HistoryLibrary} from '../components/tradition/HistoryLibrary';
import {TraditionStoryMap} from '../components/tradition/TraditionStoryMap';
import {HeritageCatalog} from '../components/tradition/HeritageCatalog';
import {traditionMapPlaces} from '../data/traditionMap';
import {curatedTraditionQuizzes} from '../data/traditionQuizzes';
import { BookOpen, Images, Clapperboard, Flower2, Gamepad2, Sparkles, MapPinned, X, Link as LinkIcon, Check, ExternalLink, Home } from 'lucide-react';
import { MaterialCard } from '../components/tradition/MaterialCard';
import { TraditionMaterials,materialKinds,type TraditionMaterial } from '../services/tradition/TraditionMaterials';
import React,{useState,useEffect} from 'react';
import {TraditionService,type TraditionQuizContent} from '../services/tradition/TraditionService';
import {TraditionQuizRunner} from '../components/tradition/TraditionQuizRunner';
import { SCHOOL_LOGO_SRC } from '../assets/schoolLogo';

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
 IMAGE:'Bấm vào bất kỳ bức ảnh nào để mở xem ảnh lớn và lời giới thiệu chi tiết. Khi mở, chỉ hiển thị duy nhất ảnh đó với giao diện rộng, không hiện danh sách tên các ảnh khác.',
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
 const [selectedImageModal,setSelectedImageModal]=useState<TraditionMaterial|null>(null);
 const [focusedImageId,setFocusedImageId]=useState<string>(()=>{
  if(typeof window==='undefined')return '';
  const raw=window.location.hash.slice(1);
  return raw.startsWith('image-')?raw.replace('image-',''):'';
 });
 const [copiedImageId,setCopiedImageId]=useState<string>('');

 const curatedMaterials=[...bookCultureArticles,...curatedTraditionMaterials];
 const readingMaterials=[...curatedMaterials,...materials.filter(item=>!curatedMaterials.some(curated=>curated.id===item.id || curated.title===item.title))];
 const [activeSection,setActiveSection]=useState(()=>{
  const raw=typeof window!=='undefined'?window.location.hash.slice(1):'';
  if(raw.startsWith('image-')||raw.startsWith('card-curated-image-'))return 'material-IMAGE';
  if(raw.startsWith('video-')||raw.startsWith('card-curated-video-'))return 'material-VIDEO';
  return raw.startsWith('history-')?'history-library':/^heritage-.*-section-\d+$/.test(raw)?'heritage-catalog':raw||'history-library';
 });

 useEffect(()=>{
  const syncSection=()=>{
   const raw=window.location.hash.slice(1);
   if(raw.startsWith('image-')){
    setActiveSection('material-IMAGE');
    const imageId=raw.replace('image-','');
    setFocusedImageId(imageId);
    return;
   }
   if(raw==='material-IMAGE'){
    setActiveSection('material-IMAGE');
    setFocusedImageId('');
    return;
   }
   if(raw.startsWith('card-')){
    const cardId=raw.replace('card-','');
    const found=readingMaterials.find(m=>m.id===cardId);
    if(found){
     if(found.kind==='IMAGE'){
      setActiveSection('material-IMAGE');
      setFocusedImageId(cardId);
     }
     else if(found.kind==='VIDEO')setActiveSection('material-VIDEO');
     else if(found.kind==='CULTURE')setActiveSection('material-CULTURE');
     else if(found.kind==='HISTORY')setActiveSection('material-HISTORY');
    }
    requestAnimationFrame(()=>{
     const card=document.getElementById(raw);
     if(card){
      card.scrollIntoView({behavior:'smooth',block:'center'});
      card.classList.add('ring-4','ring-sky-500','ring-offset-2');
      setTimeout(()=>card.classList.remove('ring-4','ring-sky-500','ring-offset-2'),3500);
     }
    });
    return;
   }
   const section=raw.startsWith('history-')?'history-library':/^heritage-.*-section-\d+$/.test(raw)?'heritage-catalog':raw;
   setActiveSection(section==='history-library' || section==='heritage-catalog' || section==='tradition-map' || section==='tradition-questions' || Object.keys(materialKinds).some(kind=>section==='material-'+kind) ? section : 'history-library');
  };
  syncSection();
  window.addEventListener('hashchange',syncSection);
  return ()=>window.removeEventListener('hashchange',syncSection);
 },[readingMaterials.length]);

 const switchSection=(section:string)=>{
  if(section==='material-IMAGE'){
   setFocusedImageId('');
  }
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
  'history-library':'bg-white/90 border-amber-200 hover:bg-amber-50 hover:border-amber-400',
  'tradition-map':'bg-white/90 border-sky-200 hover:bg-sky-50 hover:border-sky-400',
  'heritage-catalog':'bg-white/90 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400',
  'material-HISTORY':'bg-white/90 border-amber-200 hover:bg-amber-50 hover:border-amber-400',
  'material-CULTURE':'bg-white/90 border-rose-200 hover:bg-rose-50 hover:border-rose-400',
  'material-IMAGE':'bg-white/90 border-violet-200 hover:bg-violet-50 hover:border-violet-400',
  'material-VIDEO':'bg-white/90 border-orange-200 hover:bg-orange-50 hover:border-orange-400',
  'tradition-questions':'bg-white/90 border-lime-200 hover:bg-lime-50 hover:border-lime-400',
 };
 const navClass=(section:string)=>`min-h-15 flex items-center gap-3 border-2 rounded-2xl px-4 py-3 text-base font-extrabold backdrop-blur-xs transition-all focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${activeSection===section?'bg-gradient-to-r from-sky-700 to-teal-700 border-sky-700 text-white shadow-md shadow-sky-900/15 -translate-y-0.5':`text-slate-800 shadow-2xs ${navColors[section]||navColors['tradition-map']}`}`;
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
 return <div className="learning-shell min-h-screen text-slate-900">
  <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-sky-200/80 px-5 py-3 shadow-2xs">
   <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
     <img src={SCHOOL_LOGO_SRC} alt="Logo Trường Tiểu học Sông Công" className="w-11 h-11 object-contain shrink-0 drop-shadow-xs"/>
     <div>
      <p className="font-black text-sky-950 text-sm sm:text-base leading-tight">TRƯỜNG TIỂU HỌC SÔNG CÔNG</p>
      <span className="font-bold text-xs text-emerald-700">Phân hiệu Lý Tự Trọng</span>
     </div>
    </div>
    <a href="/" className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2 text-xs sm:text-sm font-black text-sky-900 transition-colors shadow-2xs">
     <Home size={16} className="text-sky-700"/>
     <span>Về cổng lớp học</span>
    </a>
   </div>
  </header>

  <main className="max-w-6xl mx-auto px-5 py-5 space-y-6">
   <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-800 via-teal-800 to-emerald-800 text-white p-5 sm:p-7 border-b-4 border-amber-400 shadow-lg shadow-sky-900/15">
    <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-300/15 blur-2xl"/>
    <div className="pointer-events-none absolute right-24 -bottom-16 h-44 w-44 rounded-full bg-sky-300/15 blur-2xl"/>
    <div className="relative">
     <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 px-3 py-1 text-xs font-extrabold text-amber-200">
      <Sparkles size={14} aria-hidden="true"/> Em yêu quê hương Thái Nguyên
     </span>
     <h1 className="text-2xl sm:text-3xl font-black mt-2.5 leading-tight tracking-tight text-white">GÓC TRUYỀN THỐNG SỐ</h1>
     <p className="mt-1.5 max-w-3xl text-sm sm:text-base font-medium text-sky-50/95">Em chọn một mục bên dưới để đọc, xem ảnh hoặc thử sức với câu hỏi về quê hương.</p>
    </div>
   </section>
 <div className={selected ? '' : 'grid gap-6 md:grid-cols-[240px_minmax(0,1fr)] items-start'}>
 {!selected && <nav aria-label="Mục tư liệu" className="grid grid-cols-2 md:flex md:flex-col gap-3 md:sticky md:top-20"><a href="#history-library" onClick={(e)=>{e.preventDefault();switchSection('history-library');}} aria-current={activeSection==='history-library'?'location':undefined} className={navClass('history-library')}><BookOpen size={23}/><span>Bài giới thiệu lịch sử</span></a><a href="#tradition-map" onClick={(e)=>{e.preventDefault();switchSection('tradition-map');}} aria-current={activeSection==='tradition-map'?'location':undefined} className={navClass('tradition-map')}><MapPinned size={23}/><span>Bản đồ khám phá</span></a><a href="#heritage-catalog" onClick={(e)=>{e.preventDefault();switchSection('heritage-catalog');}} aria-current={activeSection==='heritage-catalog'?'location':undefined} className={navClass('heritage-catalog')}><BookOpen size={23}/><span>Tra cứu di tích</span></a>{Object.entries(materialKinds).map(([kind,label])=><a key={kind} href={'#material-'+kind} onClick={(e)=>{e.preventDefault();switchSection('material-'+kind);}} aria-current={activeSection==='material-'+kind?'location':undefined} className={navClass('material-'+kind)}>{sectionIcons[kind]}<span className="whitespace-normal">{label}</span></a>)}<a href="#tradition-questions" onClick={(e)=>{e.preventDefault();switchSection('tradition-questions');}} aria-current={activeSection==='tradition-questions'?'location':undefined} className={navClass('tradition-questions')}><Gamepad2 size={23}/><span className="whitespace-normal">Câu hỏi tương tác</span></a></nav>}
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

   if(kind==='IMAGE'){
    const currentImage=focusedImageId ? (list.find(item=>item.id===focusedImageId || 'image-'+item.id===focusedImageId || item.id==='curated-image-'+focusedImageId) || null) : null;
    const currentIndex=currentImage ? list.findIndex(item=>item.id===currentImage.id) : -1;
    const prevImage=currentIndex > 0 ? list[currentIndex - 1] : null;
    const nextImage=currentIndex >= 0 && currentIndex < list.length - 1 ? list[currentIndex + 1] : null;

    return <section id="material-IMAGE" className="space-y-4 scroll-mt-4">
     <div className={`rounded-2xl bg-gradient-to-r ${sectionHeaderStyles.IMAGE} border border-violet-200 p-5 shadow-2xs`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
       <h2 className="font-black text-2xl text-sky-950 flex items-center gap-2.5">{sectionIcons.IMAGE}<span>{label}</span></h2>
       <span className="rounded-full bg-white/90 border border-violet-300 px-3 py-1 text-xs font-extrabold text-violet-900">{list.length} tư liệu ảnh</span>
      </div>
      <p className="mt-2 leading-7 text-slate-700">{materialGuides.IMAGE}</p>
     </div>

     {currentImage ? (
      /* GIAO DIỆN KHI MỞ ẢNH RA: CHỈ 1 ẢNH ĐÓ XUẤT HIỆN, KHÔNG HIỆN TÊN CÁC ẢNH KHÁC, GIAO DIỆN RỘNG */
      <div className="space-y-4">
       {/* Thanh điều khiển khi xem ảnh: Quay lại danh sách và Chuyển ảnh trước/sau */}
       <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-violet-200 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-2.5">
         <button 
          type="button"
          onClick={()=>{
           setFocusedImageId('');
           window.location.hash='material-IMAGE';
          }} 
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-violet-700 hover:bg-violet-800 text-white transition-all shadow-xs active:scale-98"
         >
          <span>← Quay lại danh sách tất cả ảnh</span>
         </button>
         <span className="text-xs sm:text-sm font-black text-violet-900 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200 hidden sm:inline-block">
          Ảnh {currentIndex + 1} / {list.length}
         </span>
        </div>

        <div className="flex items-center gap-2">
         <button 
          type="button"
          disabled={!prevImage}
          onClick={()=>{
           if(prevImage){
            setFocusedImageId(prevImage.id);
            window.location.hash='image-'+prevImage.id;
            requestAnimationFrame(()=>{
             document.getElementById('tradition-content')?.scrollIntoView({behavior:'smooth',block:'start'});
            });
           }
          }} 
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
           prevImage 
            ? 'bg-slate-100 hover:bg-violet-100 text-slate-800 hover:text-violet-900 border border-slate-200' 
            : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
          }`}
          title={prevImage ? 'Xem ảnh trước' : undefined}
         >
          ‹ Ảnh trước
         </button>
         <span className="text-xs font-black text-slate-700 sm:hidden">
          {currentIndex + 1}/{list.length}
         </span>
         <button 
          type="button"
          disabled={!nextImage}
          onClick={()=>{
           if(nextImage){
            setFocusedImageId(nextImage.id);
            window.location.hash='image-'+nextImage.id;
            requestAnimationFrame(()=>{
             document.getElementById('tradition-content')?.scrollIntoView({behavior:'smooth',block:'start'});
            });
           }
          }} 
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
           nextImage 
            ? 'bg-slate-100 hover:bg-violet-100 text-slate-800 hover:text-violet-900 border border-slate-200' 
            : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
          }`}
          title={nextImage ? 'Xem ảnh tiếp theo' : undefined}
         >
          Ảnh tiếp theo ›
         </button>
        </div>
       </div>

       {/* Khung hiển thị DUY NHẤT bức ảnh này, giao diện mở rộng toàn bộ chiều ngang (không có cột danh sách tên ảnh khác) */}
       <article id={'card-'+currentImage.id} className="w-full bg-white border-2 border-violet-300 rounded-3xl p-5 sm:p-7 space-y-6 shadow-md">
        <div className="space-y-3">
         <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="inline-flex items-center rounded-full bg-violet-50 border border-violet-200 px-3.5 py-1 text-xs font-extrabold text-violet-900">
           Hình ảnh tư liệu lịch sử • Ảnh {currentIndex + 1}/{list.length}
          </span>
          <button
           type="button"
           onClick={async()=>{
            const link=`${window.location.origin}${window.location.pathname}#image-${currentImage.id}`;
            window.history.replaceState(null,'','#image-'+currentImage.id);
            try{
             await navigator.clipboard.writeText(link);
            }catch{
             const input=document.createElement('textarea');
             input.value=link;
             document.body.appendChild(input);
             input.select();
             document.execCommand('copy');
             document.body.removeChild(input);
            }
            setCopiedImageId(currentImage.id);
            setTimeout(()=>setCopiedImageId(''),2500);
           }}
           className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-900 px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all shadow-2xs"
          >
           {copiedImageId===currentImage.id ? <Check size={14} className="text-emerald-600"/> : <LinkIcon size={14} className="text-violet-700"/>}
           <span>{copiedImageId===currentImage.id ? 'Đã sao chép liên kết!' : 'Sao chép đường dẫn riêng'}</span>
          </button>
         </div>
         <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-sky-950 leading-tight">
          {currentImage.title}
         </h3>
        </div>

        {/* Khung ảnh rộng toàn diện */}
        <div className="w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center shadow-sm">
         <img 
          src={currentImage.mediaUrl} 
          alt={currentImage.title} 
          className="w-full max-h-[640px] sm:max-h-[720px] object-contain"
         />
        </div>

        {/* Phần giới thiệu về bức ảnh đó */}
        {currentImage.text && (
         <div className="rounded-2xl bg-amber-50/80 border-2 border-amber-200/90 p-5 sm:p-6 space-y-2.5">
          <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
           <span>📖 Giới thiệu chi tiết bức ảnh</span>
          </h4>
          <p className="text-base sm:text-lg leading-relaxed text-slate-800 whitespace-pre-line font-medium">
           {currentImage.text}
          </p>
         </div>
        )}

        {/* Nguồn & liên kết gốc */}
        {(currentImage.source || currentImage.sourceUrl) && (
         <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-600 pt-3 border-t border-slate-100">
          <span>Nguồn: <strong className="font-semibold text-slate-800">{currentImage.source || 'Tư liệu lịch sử'}</strong></span>
          <div className="flex items-center gap-3">
           {currentImage.mediaUrl && (
            <a href={currentImage.mediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-sky-700 hover:text-sky-900 underline">
             <ExternalLink size={14}/> Mở tệp ảnh gốc ↗
            </a>
           )}
           {currentImage.sourceUrl && (
            <a href={currentImage.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline">
             Xem nguồn tư liệu ↗
            </a>
           )}
          </div>
         </div>
        )}
       </article>
      </div>
     ) : (
      /* GIAO DIỆN KHI CHƯA MỞ ẢNH: HIỂN THỊ DANH SÁCH / LƯỚI TẤT CẢ CÁC BỨC ẢNH ĐỂ NGƯỜI DÙNG CHỌN */
      list.length ? (
       <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs">
         <p className="text-sm font-bold text-slate-700">
          👉 Bấm vào bất kỳ bức ảnh nào bên dưới để mở xem ảnh lớn và phần giới thiệu:
         </p>
         <button
          type="button"
          onClick={()=>{
           setFocusedImageId(list[0].id);
           window.location.hash='image-'+list[0].id;
           requestAnimationFrame(()=>{
            document.getElementById('tradition-content')?.scrollIntoView({behavior:'smooth',block:'start'});
           });
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold bg-violet-700 hover:bg-violet-800 text-white transition-all shadow-xs"
         >
          Mở xem ảnh đầu tiên →
         </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 items-stretch">
         {list.map(item=>(
          <MaterialCard 
           key={item.id} 
           item={item} 
           compact={false} 
           onOpenImage={img=>{
            setFocusedImageId(img.id);
            window.location.hash='image-'+img.id;
            requestAnimationFrame(()=>{
             document.getElementById('tradition-content')?.scrollIntoView({behavior:'smooth',block:'start'});
            });
           }}
          />
         ))}
        </div>
       </div>
      ) : loading ? (
       <p>Đang tải tư liệu…</p>
      ) : (
       <p className="bg-white border rounded-xl p-4 text-slate-600">
        {error || 'Tư liệu đang được giáo viên chuẩn bị và kiểm tra trước khi đưa lên.'}
       </p>
      )
     )}
    </section>;
   }

   return <section id={'material-'+kind} className="space-y-4 scroll-mt-4">
    <div className={`rounded-2xl bg-gradient-to-r ${sectionHeaderStyles[kind]||sectionHeaderStyles.HISTORY} border p-5 shadow-2xs`}>
     <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-black text-2xl text-sky-950 flex items-center gap-2.5">{sectionIcons[kind]}<span>{label}</span></h2>
      <span className="rounded-full bg-white/90 border border-slate-300 px-3 py-1 text-xs font-extrabold text-slate-800">{list.length} tư liệu</span>
     </div>
     <p className="mt-2 leading-7 text-slate-700">{materialGuides[kind]}</p>
    </div>
    {list.length?<div className="grid sm:grid-cols-2 gap-4 items-stretch">{list.map(item=><MaterialCard key={item.id} item={item} compact={kind!=='HISTORY'&&kind!=='CULTURE'} onOpenImage={img=>setSelectedImageModal(img)}/>)}</div>:loading?<p>Đang tải tư liệu…</p>:<p className="bg-white border rounded-xl p-4 text-slate-600">{error || 'Tư liệu đang được giáo viên chuẩn bị và kiểm tra trước khi đưa lên.'}</p>}
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

 {/* Lightbox Modal for Selected Image (when in grid view) */}
 {selectedImageModal && (
  <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6" onClick={()=>{setSelectedImageModal(null);if(window.location.hash.startsWith('#image-')){window.history.replaceState(null,'','#material-IMAGE');}}} role="dialog" aria-modal="true">
   <div className="relative max-w-4xl w-full max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50">
     <div className="flex items-center gap-2 min-w-0">
      <span className="shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-extrabold bg-violet-50 border-violet-200 text-violet-900">Hình ảnh tư liệu</span>
      <h3 className="font-black text-slate-900 text-base sm:text-lg truncate" title={selectedImageModal.title}>{selectedImageModal.title}</h3>
     </div>
     <button type="button" onClick={()=>{setSelectedImageModal(null);if(window.location.hash.startsWith('#image-')){window.history.replaceState(null,'','#material-IMAGE');}}} className="shrink-0 rounded-xl p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors" aria-label="Đóng"><X size={22}/></button>
    </div>
    <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
     <div className="w-full max-h-[55vh] rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center">
      <img src={selectedImageModal.mediaUrl} alt={selectedImageModal.title} className="max-w-full max-h-[55vh] object-contain"/>
     </div>
     {selectedImageModal.text && <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Chú thích tư liệu</h4>
      <p className="text-sm sm:text-base leading-relaxed text-slate-800 whitespace-pre-line">{selectedImageModal.text}</p>
     </div>}
     <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
      <span>Nguồn: <strong className="font-semibold text-slate-800">{selectedImageModal.source || 'Tư liệu lịch sử'}</strong></span>
      <div className="flex items-center gap-3">
       {selectedImageModal.mediaUrl && <a href={selectedImageModal.mediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-sky-700 hover:text-sky-900 underline"><ExternalLink size={14}/> Mở tệp ảnh gốc ↗</a>}
       {selectedImageModal.sourceUrl && <a href={selectedImageModal.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline">Xem nguồn tư liệu ↗</a>}
      </div>
     </div>
    </div>
   </div>
  </div>
 )}

 <footer className="border-t border-sky-200/70 pt-5 text-sm font-medium text-slate-600 text-center sm:text-left">Học liệu phục vụ giáo dục truyền thống tại Phân hiệu Lý Tự Trọng • Trường Tiểu học Sông Công</footer>
 </main></div>;
};
