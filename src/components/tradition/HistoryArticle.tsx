import {useRef,useState} from 'react';
import {parseArticle} from '../../services/tradition/articleText';
import {safeHttps} from '../../services/tradition/TraditionMaterials';

export interface ArticleSource {title:string;url:string}
export function HistoryArticle({title,text,sources,id}:{title:string;text:string;sources:ArticleSource[];id:string}){
 const [presenting,setPresenting]=useState(false),[index,setIndex]=useState(0);
 const heading=useRef<HTMLHeadingElement>(null);
 const sections=parseArticle(text);
 const hasMultipleSections=sections.length>1;
 const isSingleIntro=sections.length===1&&/^mở đầu$/i.test(sections[0].title.trim());
 const change=(next:number)=>{setIndex(next);requestAnimationFrame(()=>heading.current?.focus());};
 const selected=sections[index];
 return <div className="space-y-5">
 {hasMultipleSections&&<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-200/90 px-4 py-3">
  <p className="text-sm font-bold text-slate-700">Bố cục bài viết: <span className="text-sky-900">{sections.length} phần nội dung</span></p>
  <div className="flex flex-wrap gap-2.5">
   <button type="button" aria-pressed={!presenting} onClick={()=>setPresenting(false)} className={`min-h-10 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-colors ${!presenting?'bg-sky-700 border-sky-700 text-white shadow-sm':'bg-white border-sky-200 text-sky-900 hover:bg-sky-50'}`}>Đọc toàn bài</button>
   <button type="button" aria-pressed={presenting} disabled={!sections.length} onClick={()=>{setPresenting(true);change(0);}} className={`min-h-10 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-colors ${presenting?'bg-emerald-700 border-emerald-700 text-white shadow-sm':'bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-50'}`}>Trình bày từng phần</button>
  </div>
 </div>}
 {hasMultipleSections&&presenting&&selected?<section aria-label={'Thuyết trình: '+title} className="rounded-2xl bg-gradient-to-br from-sky-50 via-white to-emerald-50/70 border-2 border-sky-200 p-5 sm:p-7 space-y-5 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 pb-3">
   <p role="status" className="inline-flex items-center gap-2 rounded-full bg-sky-700 text-white px-3.5 py-1 text-sm font-extrabold">Phần {index+1} / {sections.length}</p>
   <div className="flex flex-wrap gap-1.5" aria-label="Chọn nhanh phần trình bày">
    {sections.map((s,i)=><button key={i} type="button" onClick={()=>change(i)} aria-label={`Phần ${i+1}: ${s.title}`} className={`w-8 h-8 rounded-lg text-xs font-extrabold border transition-colors ${i===index?'bg-sky-700 border-sky-700 text-white':'bg-white border-sky-200 text-sky-900 hover:bg-sky-100'}`}>{i+1}</button>)}
   </div>
  </div>
  <h4 ref={heading} tabIndex={-1} className="text-2xl sm:text-3xl font-black text-sky-950 outline-none leading-snug">{selected.title}</h4>
  <div className="space-y-4">
   {selected.paragraphs.map((p,i)=><p key={i} className="text-lg sm:text-xl leading-9 text-slate-800 whitespace-pre-line">{p}</p>)}
  </div>
  <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-sky-100">
   <button type="button" disabled={index===0} onClick={()=>change(index-1)} className="min-h-11 bg-white border-2 border-sky-200 hover:bg-sky-50 rounded-xl px-4 py-2 font-bold text-sky-950 disabled:opacity-40">← Phần trước</button>
   <button type="button" disabled={index===sections.length-1} onClick={()=>change(index+1)} className="min-h-11 bg-sky-700 hover:bg-sky-800 text-white rounded-xl px-5 py-2 font-bold disabled:opacity-40">Phần tiếp theo →</button>
  </div>
 </section>:<>
 <div className="grid grid-cols-1 gap-4 sm:gap-5">
  {sections.map((section,i)=><section key={i} id={id+'-section-'+i} className="scroll-mt-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 p-5 sm:p-6 space-y-3.5">
   {!isSingleIntro&&<div className="flex items-center gap-3 border-b border-slate-200/80 pb-2.5">
    {hasMultipleSections&&<span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-sky-800 text-white text-xs font-black shrink-0">{i+1}</span>}
    <h4 className="text-lg sm:text-xl font-extrabold text-sky-950 leading-snug">{section.title}</h4>
   </div>}
   <div className="space-y-3.5">
    {section.paragraphs.map((p,j)=><p key={j} className="text-base sm:text-[17px] leading-8 text-slate-800 whitespace-pre-line break-words">{p}</p>)}
   </div>
  </section>)}
 </div>
 </>}
 {sources.length>0&&<section aria-label="Nguồn tham khảo" className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 text-sm text-slate-700 space-y-1.5"><h4 className="font-extrabold text-amber-950">Nguồn tham khảo đối chiếu</h4>{sources.map((source,i)=><p key={i} className="leading-6">{source.title}{safeHttps(source.url)&&<a href={source.url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block font-bold underline text-sky-800 break-words">Đọc tư liệu gốc ↗</a>}</p>)}</section>}
 </div>;
}
