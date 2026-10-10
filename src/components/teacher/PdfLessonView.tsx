import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { getLessonFile, type Lesson } from '../../services/lessons/lessonLibrary';
GlobalWorkerOptions.workerSrc = workerUrl;
const pdfAssets = { cMapUrl: `${import.meta.env.BASE_URL}pdfjs/cmaps/`, cMapPacked: true, standardFontDataUrl: `${import.meta.env.BASE_URL}pdfjs/standard_fonts/`, wasmUrl: `${import.meta.env.BASE_URL}pdfjs/wasm/` };
export async function countPdfPages(blob: Blob): Promise<number> {
  const task = getDocument({ data: new Uint8Array(await blob.arrayBuffer()), ...pdfAssets });
  try { const pdf=await task.promise; return pdf.numPages; } finally { await task.destroy(); }
}
export function PdfLessonView({ lesson, page, onCount }: { lesson: Lesson; page: number; onCount?: (count: number)=>void }) {
  const canvas=useRef<HTMLCanvasElement>(null); const container=useRef<HTMLDivElement>(null);
  const [pdf,setPdf]=useState<PDFDocumentProxy | null>(null); const [error,setError]=useState('');
  const [loading,setLoading]=useState(true); const [size,setSize]=useState({width:1,height:1});
  const onCountRef=useRef(onCount);
  useEffect(()=>{onCountRef.current=onCount;},[onCount]);
  useEffect(()=>{
    let disposed=false; let task: ReturnType<typeof getDocument> | undefined;
    setPdf(null);setLoading(true);setError('');
    void (async()=>{
      try {
        const blob=await getLessonFile({id:lesson.id,ownerId:lesson.ownerId,title:lesson.title,subject:lesson.subject,grade:lesson.grade,createdAt:lesson.createdAt},'pdf');const bytes=new Uint8Array(await blob.arrayBuffer());
        if(disposed)return;
        task=getDocument({ data:bytes, ...pdfAssets }); const doc=await task.promise;
        if(!disposed){setPdf(doc);onCountRef.current?.(doc.numPages);}
      } catch {if(!disposed)setError('Không mở được PDF. Tệp có thể hỏng hoặc có mật khẩu. Hãy xuất lại PDF từ PowerPoint.');}
      finally {if(!disposed)setLoading(false);}
    })();
    return()=>{disposed=true;void task?.destroy();};
  },[lesson.id,lesson.ownerId,lesson.title,lesson.subject,lesson.grade,lesson.createdAt]);
  useEffect(()=>{
    const el=container.current;if(!el)return;
    const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));
    observer.observe(el);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    let cancelled=false;let render:RenderTask | undefined;
    void (async()=>{
      if(!pdf || !canvas.current || size.width<2 || size.height<2)return;
      try {
        const slide=await pdf.getPage(Math.min(pdf.numPages,Math.max(1,page)));
        if(cancelled || !canvas.current)return;
        const base=slide.getViewport({scale:1}); const scale=Math.min(size.width/base.width,size.height/base.height);
        const ratio=Math.min(window.devicePixelRatio || 1,2);const viewport=slide.getViewport({scale:scale*ratio});
        const el=canvas.current; el.width=Math.ceil(viewport.width);el.height=Math.ceil(viewport.height);el.style.width=`${viewport.width/ratio}px`;el.style.height=`${viewport.height/ratio}px`;
        render=slide.render({canvas:el,viewport});await render.promise;
      }catch(err){if(!cancelled && (err as Error).name!=='RenderingCancelledException')setError('Không hiển thị được trang này. Thử chuyển trang hoặc mở lại bài.');}
    })();
    return()=>{cancelled=true;render?.cancel();};
  },[pdf,page,size]);
  return <div ref={container} className="w-full h-full min-h-0 flex items-center justify-center overflow-hidden bg-slate-950" aria-label={`Bài giảng ${lesson.title}, trang ${page}`}>
    {error ? <p role="alert" className="text-amber-200 p-4">{error}</p> : loading ? <p className="text-white">Đang mở bài giảng…</p> : null}
    <canvas ref={canvas} className={loading || error ? 'hidden' : 'block'} />
  </div>;
}
