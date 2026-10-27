import {HistoryArticle} from './HistoryArticle';
import React,{useState} from 'react';
import {parseArticle} from '../../services/tradition/articleText';
import {youtubeEmbed,safeHttps,materialKinds,type TraditionMaterial} from '../../services/tradition/TraditionMaterials';

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

export const MaterialCard:React.FC<{item:TraditionMaterial;compact?:boolean}>=({item,compact})=>{
 const [failed,setFailed]=useState(false);
 const [expanded,setExpanded]=useState(false);
 const isArticle=['HISTORY','CULTURE'].includes(item.kind);
 const sections=isArticle?parseArticle(item.text):[];
 const hasMultipleSections=sections.length>1;
 const excerpt=isArticle?item.text.replace(/^#{1,3}[^\n]*\n/gm,'').trim().split('\n')[0]:'';
 const paragraphs=item.text.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
 const embed=item.kind==='VIDEO'?youtubeEmbed(item.mediaUrl):null;
 const mp4=(()=>{try{return /\.(mp4|webm)$/i.test(new URL(item.mediaUrl).pathname);}catch{return false;}})();
 const badgeClass=kindBadgeStyles[item.kind]||kindBadgeStyles.HISTORY;
 const borderClass=kindCardBorders[item.kind]||'border-emerald-200';

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

 return <article id={'card-'+item.id} className={`flex flex-col justify-between h-full bg-white border-2 ${borderClass} rounded-3xl p-5 sm:p-6 min-w-0 shadow-sm ${isArticle?'sm:col-span-2 space-y-5':'space-y-4'}`}>
  <div className={isArticle?'space-y-5':'space-y-3.5'}>
   <div className="flex flex-wrap items-center justify-between gap-2">
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${badgeClass}`}>{materialKinds[item.kind]}</span>
    {isArticle&&<button type="button" onClick={()=>setExpanded(false)} className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-800 transition-colors">Thu gọn bài viết ▲</button>}
   </div>
   <h3 className={`font-black leading-snug text-sky-950 ${isArticle?'text-2xl sm:text-3xl':'text-lg sm:text-xl min-h-[3.25rem] line-clamp-2'}`}>{item.title}</h3>
   {item.kind==='IMAGE' && (failed?<p className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">Không hiển thị được ảnh. Vui lòng kiểm tra quyền chia sẻ hoặc liên kết ảnh.</p>:<div className="w-full aspect-[16/10] rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center"><img src={item.mediaUrl} alt={item.title} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={()=>setFailed(true)}/></div>)}
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
 </article>;
};
