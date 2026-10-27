import {curatedHistoryArticles} from '../../data/historyArticles';
import {useState} from 'react';
import {heritageCatalog} from '../../data/heritageCatalog';
import {normalizeMapText} from '../../data/traditionMap';
import {historyTopics,inferHistoryTopic,parseArticle,type HistoryTopic} from '../../services/tradition/articleText';
import type {TraditionMaterial} from '../../services/tradition/TraditionMaterials';
import {HistoryArticle} from './HistoryArticle';
export function HistoryLibrary({materials}:{materials:TraditionMaterial[]}){
 const [topic,setTopic]=useState<HistoryTopic>('SITE'),[search,setSearch]=useState(''),[selected,setSelected]=useState('');
 const teacherArticles=materials.filter(m=>m.kind==='HISTORY');
 const fallback=heritageCatalog.filter(r=>r.detail&&!teacherArticles.some(m=>normalizeMapText(m.title)===normalizeMapText(r.name))).map(r=>({id:'catalog-'+r.id,title:r.name,text:r.detail!,historyTopic:'SITE' as HistoryTopic,source:r.sourceName,sourceUrl:r.sourceUrl}));
 const articles:{id:string;title:string;text:string;historyTopic?:HistoryTopic;source:string;sourceUrl:string;grade?:string;question?:string;answer?:string}[]=[...curatedHistoryArticles,...teacherArticles,...fallback.filter(r=>!curatedHistoryArticles.some(a=>normalizeMapText(a.title).includes(normalizeMapText(r.title))))];
 const shown=articles.filter(a=>(a.historyTopic||inferHistoryTopic(a.title))===topic&&normalizeMapText(a.title+' '+a.text+' '+a.source).includes(normalizeMapText(search)));
 const article=articles.find(a=>a.id===selected);
 return <section id="history-library" aria-labelledby="history-library-heading" className="scroll-mt-5 space-y-4">
 <div className="rounded-2xl bg-gradient-to-r from-amber-100 via-amber-50 to-orange-50 border border-amber-200 p-5 shadow-2xs">
  <div className="flex flex-wrap items-center justify-between gap-2">
   <h2 id="history-library-heading" className="text-2xl font-black text-sky-950">Bài giới thiệu lịch sử</h2>
   <span className="rounded-full bg-white/90 border border-amber-300 px-3 py-1 text-xs font-extrabold text-amber-900">{articles.length} bài đọc chuyên đề</span>
  </div>
  <p className="mt-2 leading-7 text-slate-700">Chọn di tích, nhân vật hoặc sự kiện. Mỗi bài có mục lục, nguồn tham khảo và chế độ trình bày từng phần để em tập làm hướng dẫn viên.</p>
 </div>
 {article?<article className="rounded-3xl border-2 border-amber-200 bg-white p-5 sm:p-7 space-y-5 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
   <button className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 px-4 py-2 text-sky-900 font-bold min-h-11 transition-colors" onClick={()=>setSelected('')}>← Trở lại danh sách bài</button>
   <div className="flex flex-wrap items-center gap-2">
    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-extrabold text-emerald-800">{historyTopics[article.historyTopic||inferHistoryTopic(article.title)]}</span>
    {article.grade&&<span className="rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-extrabold text-amber-900">Học liệu lớp {article.grade}</span>}
   </div>
  </div>
  <div className="space-y-1.5">
   <h3 className="text-2xl sm:text-3xl text-sky-950 font-black leading-tight">{article.title}</h3>
   {article.grade&&<p className="text-sm text-slate-600">Biên soạn diễn giải phục vụ học tập từ nguồn tham khảo đối chiếu</p>}
  </div>
  <HistoryArticle key={article.id} id={'history-'+article.id} title={article.title} text={article.text} sources={article.source||article.sourceUrl?[{title:article.source||'Tư liệu tham khảo',url:article.sourceUrl}]:[]}/>
  {article.question&&<section className="rounded-2xl bg-emerald-50/80 border-2 border-emerald-200 p-5 space-y-3">
   <h4 className="font-extrabold text-lg text-emerald-950">Em thử làm hướng dẫn viên</h4>
   <p className="font-semibold text-slate-800 leading-7">{article.question}</p>
   <details className="rounded-xl bg-white border border-emerald-200 px-4 py-2.5">
    <summary className="cursor-pointer font-bold text-emerald-900 min-h-9 flex items-center">Xem gợi ý trả lời</summary>
    <p className="leading-7 mt-2 pt-2 border-t border-emerald-100 text-slate-800">{article.answer}</p>
   </details>
   <p className="text-sm text-slate-600">Chọn ba ý chính trong bài, trình bày bằng lời của em và nêu nguồn đã đọc.</p>
  </section>}
 </article>:<>
  <div className="grid lg:grid-cols-[1fr_280px] gap-3 items-end bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
   <div>
    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Chọn nhóm chuyên đề</p>
    <nav aria-label="Nhóm bài giới thiệu" className="flex flex-wrap gap-2.5">
     {Object.entries(historyTopics).map(([value,label])=><button key={value} aria-pressed={topic===value} onClick={()=>setTopic(value as HistoryTopic)} className={`min-h-11 rounded-xl border-2 px-4 py-2 text-sm sm:text-base font-bold transition-all ${topic===value?'bg-sky-700 border-sky-700 text-white shadow-sm':'bg-slate-50 hover:bg-sky-50 border-sky-200 text-sky-950'}`}>{label} ({articles.filter(a=>(a.historyTopic||inferHistoryTopic(a.title))===value).length})</button>)}
    </nav>
   </div>
   <label className="block font-bold text-sm text-slate-700">Tìm bài giới thiệu
    <input type="search" value={search} onChange={e=>setSearch(e.target.value)} className="mt-1.5 block w-full border-2 border-slate-200 focus:border-sky-600 rounded-xl px-3.5 py-2.5 font-normal bg-slate-50/60 focus:bg-white outline-none" placeholder="Tên di tích, nhân vật, sự kiện…"/>
   </label>
  </div>
  {shown.length?<div className="grid sm:grid-cols-2 gap-4 items-stretch">{shown.map(a=>{
   const sections=parseArticle(a.text);
   const hasMultipleSections=sections.length>1;
   const meta=[a.grade&&`Lớp ${a.grade}`,hasMultipleSections&&`${sections.length} phần`].filter(Boolean).join(' • ');
   const excerpt=a.text.replace(/^#{1,3}[^\n]*\n/gm,'').trim().split('\n')[0];
   return <article key={a.id} className="flex flex-col justify-between h-full rounded-2xl bg-white border-2 border-amber-200/80 hover:border-sky-400 p-5 shadow-2xs hover:shadow-md transition-all">
    <div className="space-y-3">
     <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-extrabold text-amber-900">{historyTopics[a.historyTopic||inferHistoryTopic(a.title)]}</span>
      {meta&&<span className="text-xs font-bold text-slate-500">{meta}</span>}
     </div>
     <h3 className="font-black text-xl text-sky-950 leading-snug">{a.title}</h3>
     <p className="leading-7 text-slate-700 text-sm sm:text-base line-clamp-3">{excerpt}</p>
     {hasMultipleSections&&<div className="flex flex-wrap gap-1.5 pt-1">
      {sections.slice(0,4).map((s,i)=><span key={i} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{i+1}. {s.title}</span>)}
      {sections.length>4&&<span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">+{sections.length-4} mục</span>}
     </div>}
    </div>
    <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
     <p className="text-xs text-slate-500 line-clamp-1" title={a.source}>Nguồn: {a.source||'Học liệu do giáo viên công khai'}</p>
     <button className="w-full min-h-11 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold px-4 py-2.5 text-sm sm:text-base transition-colors" onClick={()=>setSelected(a.id)}>Đọc bài giới thiệu →</button>
    </div>
   </article>;
  })}</div>:<p className="rounded-xl bg-white border p-4">{search?'Chưa có bài phù hợp với từ khóa.':'Các bài thuộc nhóm này đang được bổ sung và đối chiếu tư liệu.'}</p>}
 </>}
 </section>;
}
