import React,{useState} from 'react';
import {youtubeEmbed,safeHttps,materialKinds,type TraditionMaterial} from '../../services/tradition/TraditionMaterials';
export const MaterialCard:React.FC<{item:TraditionMaterial}>=({item})=>{
 const [failed,setFailed]=useState(false);const embed=item.kind==='VIDEO'?youtubeEmbed(item.mediaUrl):null;
 const mp4=(()=>{try{return /\.(mp4|webm)$/i.test(new URL(item.mediaUrl).pathname);}catch{return false;}})();
 return <article className="bg-white border border-emerald-200 rounded-2xl p-5 space-y-3 min-w-0"><p className="text-sm text-emerald-800 font-bold">{materialKinds[item.kind]}</p><h3 className="font-black text-xl">{item.title}</h3>
 {item.kind==='IMAGE' && (failed?<p className="text-amber-900">Không hiển thị được ảnh. Vui lòng kiểm tra quyền chia sẻ hoặc liên kết ảnh.</p>:<img src={item.mediaUrl} alt={item.title} loading="lazy" referrerPolicy="no-referrer" className="w-full max-h-[500px] object-contain rounded-xl" onError={()=>setFailed(true)}/>)}
 {item.kind==='VIDEO' && safeHttps(item.mediaUrl) && (embed?<iframe title={item.title} src={embed} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="w-full aspect-video rounded-xl border-0"/>:mp4?<video src={item.mediaUrl} controls preload="metadata" className="w-full rounded-xl" onError={()=>setFailed(true)}/>:<a href={item.mediaUrl} target="_blank" rel="noreferrer" className="inline-block bg-emerald-800 text-white p-3 rounded-xl">Mở video ↗</a>)}
 {item.kind==='VIDEO' && failed && <p className="text-amber-900">Không phát được video. Hãy kiểm tra liên kết và quyền xem.</p>}
 {item.text && <p className="whitespace-pre-wrap break-words leading-relaxed">{item.text}</p>}
 {(item.source || item.sourceUrl) && <p className="text-sm text-slate-600">Nguồn: {item.source}{safeHttps(item.sourceUrl) && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="ml-2 text-emerald-800 underline break-all">Xem tư liệu gốc ↗</a>}</p>}
 </article>;
};
