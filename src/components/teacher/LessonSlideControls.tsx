import { useEffect } from 'react';
import { Button } from '../common/Button';
export function LessonSlideControls({ page, count, onPage }: { page:number;count:number;onPage:(page:number)=>void }) {
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      if(event.target instanceof HTMLElement && ['INPUT','TEXTAREA','SELECT','BUTTON'].includes(event.target.tagName))return;
      if(event.altKey || event.ctrlKey || event.metaKey)return;
      if(['ArrowRight','PageDown'].includes(event.key)){event.preventDefault();onPage(Math.min(count,page+1));}
      if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();onPage(Math.max(1,page-1));}
    };
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[page,count,onPage]);
  return <div className="flex flex-wrap gap-2 items-center justify-center shrink-0 text-white bg-slate-900 rounded-xl p-2">
    <Button variant="primary" size="sm" disabled={page<=1} onClick={()=>onPage(Math.max(1,page-1))}>← Trang trước</Button>
    <label className="text-sm">Trang <select aria-label="Chuyển đến trang" className="bg-slate-800 text-white border border-slate-600 rounded p-2" value={Math.min(page,count)} onChange={(e)=>onPage(Number(e.target.value))}>{Array.from({length:count},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select> / {count}</label>
    <Button variant="primary" size="sm" disabled={page>=count} onClick={()=>onPage(Math.min(count,page+1))}>Trang sau →</Button>
    <Button variant="outline" size="sm" className="text-white border-slate-500" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void document.documentElement.requestFullscreen().catch(()=>{});}}>Toàn màn hình</Button>
  </div>;
}
