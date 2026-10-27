import {HistoryArticle} from './HistoryArticle';
import React,{useState} from 'react';
import {parseArticle} from '../../services/tradition/articleText';
import {youtubeEmbed,safeHttps,materialKinds,type TraditionMaterial} from '../../services/tradition/TraditionMaterials';
import {Link as LinkIcon, Check, Maximize2, X, Copy, ExternalLink} from 'lucide-react';

const kindBadgeStyles:Record<string,string>={
 HISTORY:'bg-amber-50 border-amber-200 text-amber-900',
 CULTURE:'bg-rose-50 border-rose-200 text-rose-900',
 IMAGE:'bg-violet-50 border-violet-200 text-violet-900',
 VIDEO:'bg-orange-50 border-orange-200 text-orange-900',
};
const kindCardBorders:Record<string,string>={
 HISTORY:'border-amber-200/90 hover:border-amber-400',
 CULTURE:'border-rose-200/90 hover:border-rose-400',
 IMAGE:'border-violet-200/90 hover:border-violet-400',
 VIDEO:'border-orange-200/90 hover:border-orange-400',
};

export const MaterialCard:React.FC<{item:TraditionMaterial;compact?:boolean;onOpenImage?:(item:TraditionMaterial)=>void}>=({item,compact,onOpenImage})=>{
 const [failed,setFailed]=useState(false);
 const [expanded,setExpanded]=useState(false);
 const [copied,setCopied]=useState(false);
 const [fallbackModalOpen,setFallbackModalOpen]=useState(false);

 const isArticle=['HISTORY','CULTURE'].includes(item.kind);
 const sections=isArticle?parseArticle(item.text):[];
 const hasMultipleSections=sections.length>1;
 const excerpt=isArticle?item.text.replace(/^#{1,3}[^\n]*\n/gm,'').trim().split('\n')[0]:'';
 const paragraphs=item.text.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
 const embed=item.kind==='VIDEO'?youtubeEmbed(item.mediaUrl):null;
 const mp4=(()=>{try{return /\.(mp4|webm)$/i.test(new URL(item.mediaUrl).pathname);}catch{return false;}})();
 const badgeClass=kindBadgeStyles[item.kind]||kindBadgeStyles.HISTORY;
 const borderClass=kindCardBorders[item.kind]||'border-emerald-200';

 const getPermalink=()=>{
  if(typeof window==='undefined')return '';
  return `${window.location.origin}${window.location.pathname}#image-${item.id}`;
 };

 const copyPermalink=async(e?:React.MouseEvent)=>{
  if(e){e.preventDefault();e.stopPropagation();}
  const link=getPermalink();
  window.location.hash='image-'+item.id;
  try{
   if(navigator.clipboard && window.isSecureContext){
    await navigator.clipboard.writeText(link);
   }else{
    const input=document.createElement('textarea');
    input.value=link;
    input.style.position='fixed';
    input.style.opacity='0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
   }
   setCopied(true);
   setTimeout(()=>setCopied(false),2500);
  }catch(err){
   console.error('Không sao chép được link',err);
  }
 };

 const handleImageSelect=()=>{
  window.location.hash='image-'+item.id;
  if(onOpenImage){
   onOpenImage(item);
  }else{
   setFallbackModalOpen(true);
  }
 };

 if(isArticle && !expanded){
  return <article className={`flex flex-col justify-between h-full bg-white border-2 ${borderClass} rounded-2xl p-5 sm:p-6 min-w-0 shadow-2xs hover:shadow-md transition-all`}>
   <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
     <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${badgeClass}`}>{materialKinds[item.kind]}</span>
     {hasMultipleSections&&<span className="text-xs font-bold text-slate-500">{sections.length} phần nội dung</span>}
    </div>
    <h3 className="font-black text-xl leading-snug text-sky-950">{item.title}</h3>
    {excerpt&&<p className="text-sm sm:text-base leading-7 text-slate-700 line-clamp-3">{excerpt}</p>}
    {!compact&&hasMultipleSections&&<div className="flex flex-wrap gap-1.5 pt-1">
     {sections.slice(0,4).map((s,i)=><span key={i} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{i+1}. {s.title}</span>)}
     {sections.length>4&&<span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">+{sections.length-4} mục</span>}
    </div>}
   </div>
   <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
    {(item.source || item.sourceUrl) && <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
     <span className="line-clamp-1" title={item.source}>Nguồn: {item.source||'Tư liệu đối chiếu'}</span>
     {safeHttps(item.sourceUrl) && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="shrink-0 font-bold text-emerald-800 underline">Nguồn gốc ↗</a>}
    </div>}
    <button type="button" onClick={()=>setExpanded(true)} className="w-full min-h-11 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold px-4 py-2.5 text-sm sm:text-base transition-colors">{hasMultipleSections?`Đọc bài tư liệu (${sections.length} phần) →`:'Đọc bài tư liệu →'}</button>
   </div>
  </article>;
 }

 return <>
  <article id={'card-'+item.id} className={`flex flex-col justify-between h-full bg-white border-2 ${borderClass} rounded-3xl p-5 sm:p-6 min-w-0 shadow-sm transition-all duration-300 ${isArticle?'sm:col-span-2 space-y-5':'space-y-4'}`}>
   <div className={isArticle?'space-y-5':'space-y-3.5'}>
    <div className="flex flex-wrap items-center justify-between gap-2">
     <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${badgeClass}`}>{materialKinds[item.kind]}</span>
     {item.kind==='IMAGE' && (
      <button
       type="button"
       onClick={copyPermalink}
       className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all shadow-2xs ${copied ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-900'}`}
       title={`Sao chép đường dẫn riêng (#image-${item.id})`}
      >
       {copied ? <Check size={13} className="text-emerald-600"/> : <LinkIcon size={13} className="text-violet-700"/>}
       <span>{copied ? 'Đã sao chép link' : 'Đường dẫn riêng'}</span>
      </button>
     )}
     {isArticle&&<button type="button" onClick={()=>setExpanded(false)} className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-800 transition-colors">Thu gọn bài viết ▲</button>}
    </div>
    <h3 className={`font-black leading-snug text-sky-950 ${isArticle?'text-2xl sm:text-3xl':'text-lg sm:text-xl min-h-[3.25rem] line-clamp-2'} ${item.kind==='IMAGE'?'cursor-pointer hover:text-violet-700 transition-colors':''}`} onClick={item.kind==='IMAGE'?handleImageSelect:undefined} title={item.kind==='IMAGE'?'Nhấp để xem riêng ảnh này':undefined}>{item.title}</h3>
    {item.kind==='IMAGE' && (failed?<p className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">Không hiển thị được ảnh. Vui lòng kiểm tra quyền chia sẻ hoặc liên kết ảnh.</p>:<div
     className="group relative w-full aspect-[16/10] rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center cursor-pointer select-none shadow-2xs hover:shadow-md transition-all"
     onClick={handleImageSelect}
     title="Nhấp để chọn xem ảnh lớn và lấy đường dẫn riêng"
    >
     <img src={item.mediaUrl} alt={item.title} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={()=>setFailed(true)}/>
     <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-auto">
      <div className="flex justify-end gap-1.5">
       <button
        type="button"
        onClick={copyPermalink}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-900 px-2.5 py-1 text-xs font-bold shadow-md transition-all active:scale-95"
        title={`Sao chép đường dẫn riêng: #image-${item.id}`}
       >
        {copied ? <Check size={14} className="text-emerald-600"/> : <LinkIcon size={14} className="text-sky-700"/>}
        <span>{copied ? 'Đã sao chép link!' : 'Lấy đường dẫn riêng'}</span>
       </button>
      </div>
      <div className="flex items-center justify-between text-white text-xs font-semibold drop-shadow">
       <span className="inline-flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-xs">
        <Maximize2 size={13}/> Bấm để xem ảnh lớn & chi tiết
       </span>
       <span className="font-mono bg-sky-950/80 px-2 py-0.5 rounded text-[11px] text-sky-200">
        #image-{item.id}
       </span>
      </div>
     </div>
    </div>)}
    {item.kind==='VIDEO' && safeHttps(item.mediaUrl) && (embed?<div className="w-full aspect-video rounded-2xl bg-slate-950 border border-slate-200 overflow-hidden shadow-2xs"><iframe title={item.title} src={embed} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="w-full h-full border-0"/></div>:mp4?<video src={item.mediaUrl} controls preload="metadata" className="w-full aspect-video rounded-2xl bg-slate-950" onError={()=>setFailed(true)}/>:<a href={item.mediaUrl} target="_blank" rel="noreferrer" className="inline-block bg-emerald-800 text-white p-3 rounded-xl font-bold">Mở video ↗</a>)}
    {item.kind==='VIDEO' && failed && <p className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">Không phát được video. Hãy kiểm tra liên kết và quyền xem.</p>}
    {isArticle&&item.text?<HistoryArticle key={item.id+item.text} id={'material-'+item.id} title={item.title} text={item.text} sources={[]}/>:item.text && <div className="space-y-2.5" id={'material-text-'+item.id}>
     {paragraphs.map((paragraph,index)=>/^#{1,3}\s+/.test(paragraph)
      ? <h4 key={index} className="text-lg font-extrabold leading-snug text-sky-900 border-l-4 border-amber-400 pl-3 pt-1">{paragraph.replace(/^#{1,3}\s+/,'')}</h4>
      : <p key={index} className="text-sm sm:text-base leading-7 text-slate-700 whitespace-pre-line break-words">{paragraph}</p>)}
    </div>}
   </div>
   {(item.source || item.sourceUrl) && <div className="pt-3.5 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
    <span>Nguồn: <strong className="font-semibold text-slate-700">{item.source||'Tư liệu đối chiếu'}</strong></span>
    {safeHttps(item.sourceUrl) && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0">Xem tư liệu gốc ↗</a>}
   </div>}
  </article>

  {/* Fallback Lightbox Modal if parent does not handle onOpenImage */}
  {!onOpenImage && fallbackModalOpen && item.kind==='IMAGE' && (
   <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6" onClick={()=>setFallbackModalOpen(false)} role="dialog" aria-modal="true">
    <div className="relative max-w-4xl w-full max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
     <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50">
      <div className="flex items-center gap-2 min-w-0">
       <span className="shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-extrabold bg-violet-50 border-violet-200 text-violet-900">Hình ảnh tư liệu</span>
       <h3 className="font-black text-slate-900 text-base sm:text-lg truncate" title={item.title}>{item.title}</h3>
      </div>
      <button type="button" onClick={()=>setFallbackModalOpen(false)} className="shrink-0 rounded-xl p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors" aria-label="Đóng"><X size={20}/></button>
     </div>
     <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
      <div className="w-full max-h-[55vh] rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center">
       <img src={item.mediaUrl} alt={item.title} className="max-w-full max-h-[55vh] object-contain"/>
      </div>
      <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3.5 space-y-2">
       <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-sky-900 flex items-center gap-1.5"><LinkIcon size={14}/> Đường dẫn riêng của bức ảnh này:</span>
        <button type="button" onClick={copyPermalink} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white px-3 py-1 text-xs font-bold transition-colors">
         {copied ? <Check size={14}/> : <Copy size={14}/>}
         <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết'}</span>
        </button>
       </div>
       <input type="text" readOnly value={getPermalink()} onClick={e=>(e.target as HTMLInputElement).select()} className="w-full text-xs font-mono bg-white border border-sky-300 rounded-lg px-3 py-2 text-slate-800 select-all focus:outline-none focus:ring-2 focus:ring-sky-500"/>
      </div>
      {item.text && <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
       <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Chú thích tư liệu</h4>
       <p className="text-sm sm:text-base leading-relaxed text-slate-800 whitespace-pre-line">{item.text}</p>
      </div>}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
       <span>Nguồn: <strong className="font-semibold text-slate-800">{item.source || 'Tư liệu lịch sử'}</strong></span>
       <div className="flex items-center gap-3">
        {item.mediaUrl && <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-sky-700 hover:text-sky-900 underline"><ExternalLink size={14}/> Mở tệp ảnh gốc ↗</a>}
        {safeHttps(item.sourceUrl) && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline">Xem nguồn tư liệu ↗</a>}
       </div>
      </div>
     </div>
    </div>
   </div>
  )}
 </>;
};
