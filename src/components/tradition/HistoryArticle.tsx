import {useRef,useState} from 'react';
import {parseArticle} from '../../services/tradition/articleText';
import {safeHttps} from '../../services/tradition/TraditionMaterials';

export interface ArticleSource {title:string;url:string}
export function HistoryArticle({title,text,sources,id}:{title:string;text:string;sources:ArticleSource[];id:string}){
 const [presenting,setPresenting]=useState(false),[index,setIndex]=useState(0);
 const heading=useRef<HTMLHeadingElement>(null);
 const sections=parseArticle(text);
 const change=(next:number)=>{setIndex(next);requestAnimationFrame(()=>heading.current?.focus());};
 const selected=sections[index];
 return <div className="space-y-5">
 <div className="flex flex-wrap gap-3"><button type="button" aria-pressed={!presenting} onClick={()=>setPresenting(false)} className={`min-h-11 px-4 py-2 rounded-xl border-2 font-bold ${!presenting?'bg-sky-700 border-sky-700 text-white':'bg-white border-sky-200 text-sky-900'}`}>Đọc toàn bài</button><button type="button" aria-pressed={presenting} disabled={!sections.length} onClick={()=>{setPresenting(true);change(0);}} className={`min-h-11 px-4 py-2 rounded-xl border-2 font-bold ${presenting?'bg-emerald-700 border-emerald-700 text-white':'bg-white border-emerald-200 text-emerald-900'}`}>Trình bày từng phần</button></div>
 {presenting&&selected?<section aria-label={'Thuyết trình: '+title} className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-5 sm:p-7 space-y-5"><p role="status" className="font-bold text-sky-700">Phần {index+1}/{sections.length}</p><h4 ref={heading} tabIndex={-1} className="text-2xl sm:text-3xl font-black text-sky-950 outline-none">{selected.title}</h4>{selected.paragraphs.map((p,i)=><p key={i} className="text-lg sm:text-xl leading-9 whitespace-pre-line">{p}</p>)}<div className="flex justify-between gap-3"><button type="button" disabled={index===0} onClick={()=>change(index-1)} className="min-h-12 bg-white border-2 border-sky-200 rounded-xl px-4 font-bold disabled:opacity-40">← Phần trước</button><button type="button" disabled={index===sections.length-1} onClick={()=>change(index+1)} className="min-h-12 bg-sky-700 text-white rounded-xl px-4 font-bold disabled:opacity-40">Phần tiếp theo →</button></div></section>:<>
 {sections.length>1&&<nav aria-label={'Mục lục: '+title} className="bg-sky-50 border border-sky-100 rounded-xl p-4"><p className="font-bold text-sky-950 mb-2">Mục lục bài giới thiệu</p><ol className="list-decimal ml-5 space-y-2">{sections.map((s,i)=><li key={i}><a className="underline text-sky-800" href={'#'+id+'-section-'+i}>{s.title}</a></li>)}</ol></nav>}
 <div className="mx-auto max-w-[72ch] space-y-7">{sections.map((section,i)=><section key={i} id={id+'-section-'+i} className="scroll-mt-5 space-y-4"><h4 className="text-xl font-extrabold text-sky-900 border-l-4 border-amber-400 pl-3">{section.title}</h4>{section.paragraphs.map((p,j)=><p key={j} className="text-base sm:text-lg leading-8 text-slate-800 whitespace-pre-line break-words">{p}</p>)}</section>)}</div>
 </>}
 {sources.length>0&&<section aria-label="Nguồn tham khảo" className="border-t pt-4 text-sm text-slate-600 space-y-2"><h4 className="font-bold">Nguồn tham khảo</h4>{sources.map((source,i)=><p key={i}>{source.title}{safeHttps(source.url)&&<a href={source.url} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-sky-800 break-words">Đọc tư liệu gốc ↗</a>}</p>)}</section>}
 </div>;
}
