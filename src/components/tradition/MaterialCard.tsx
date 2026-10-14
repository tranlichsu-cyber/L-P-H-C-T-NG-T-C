import {HistoryArticle} from './HistoryArticle';
import React,{useState} from 'react';
import {youtubeEmbed,safeHttps,materialKinds,type TraditionMaterial} from '../../services/tradition/TraditionMaterials';
export const MaterialCard:React.FC<{item:TraditionMaterial;compact?:boolean}>=({item})=>{
 const [failed,setFailed]=useState(false);const isArticle=['HISTORY','CULTURE'].includes(item.kind);const paragraphs=item.text.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);const embed=item.kind==='VIDEO'?youtubeEmbed(item.mediaUrl):null;
 const mp4=(()=>{try{return /\.(mp4|webm)$/i.test(new URL(item.mediaUrl).pathname);}catch{return false;}})();
 return <article className={`bg-white border border-emerald-200 rounded-3xl p-5 sm:p-7 min-w-0 shadow-sm ${isArticle?'space-y-5':'space-y-4'}`}><p className="text-sm text-emerald-800 font-bold">{materialKinds[item.kind]}</p><h3 className={`font-black leading-tight text-sky-950 ${isArticle?'text-2xl sm:text-3xl':'text-xl'}`}>{item.title}</h3>
 {item.kind==='IMAGE' && (failed?<p className="text-amber-900">Không hiển thị được ảnh. Vui lòng kiểm tra quyền chia sẻ hoặc liên kết ảnh.</p>:<img src={item.mediaUrl} alt={item.title} loading="lazy" referrerPolicy="no-referrer" className="w-full max-h-[500px] object-contain rounded-xl" onError={()=>setFailed(true)}/>)}
 {item.kind==='VIDEO' && safeHttps(item.mediaUrl) && (embed?<iframe title={item.title} src={embed} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="w-full aspect-video rounded-xl border-0"/>:mp4?<video src={item.mediaUrl} controls preload="metadata" className="w-full rounded-xl" onError={()=>setFailed(true)}/>:<a href={item.mediaUrl} target="_blank" rel="noreferrer" className="inline-block bg-emerald-800 text-white p-3 rounded-xl">Mở video ↗</a>)}
 {item.kind==='VIDEO' && failed && <p className="text-amber-900">Không phát được video. Hãy kiểm tra liên kết và quyền xem.</p>}
 {isArticle&&item.text?<HistoryArticle key={item.id+item.text} id={'material-'+item.id} title={item.title} text={item.text} sources={[]}/>:item.text && <div className={isArticle?'mx-auto w-full max-w-[72ch] space-y-5':'space-y-3'} id={'material-text-'+item.id}>
  {isArticle && <p className="text-xs font-bold tracking-wide uppercase text-emerald-800 border-b border-emerald-100 pb-3">TƯ LIỆU TÌM HIỂU QUÊ HƯƠNG</p>}
  {paragraphs.map((paragraph,index)=>/^#{1,3}\s+/.test(paragraph)
   ? <h4 key={index} className="text-xl font-extrabold leading-snug text-sky-900 border-l-4 border-amber-400 pl-3 pt-2">{paragraph.replace(/^#{1,3}\s+/,'')}</h4>
   : <p key={index} className={isArticle?'text-base sm:text-lg leading-8 text-slate-800 whitespace-pre-line break-words text-left':'text-base leading-7 text-slate-800 whitespace-pre-line break-words'}>{paragraph}</p>)}
 </div>}
 {(item.source || item.sourceUrl) && <p className="text-sm text-slate-600">Nguồn: {item.source}{safeHttps(item.sourceUrl) && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="ml-2 text-emerald-800 underline break-all">Xem tư liệu gốc ↗</a>}</p>}
 </article>;
};
