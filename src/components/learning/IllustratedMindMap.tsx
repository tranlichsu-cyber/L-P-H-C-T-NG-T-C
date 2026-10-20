import {useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {Eye,EyeOff,Maximize2,ScanSearch} from 'lucide-react';
import {artPositions,branchIcon,branchPalette,centralTitle,lessonArt,scienceArt,type MapArt} from './mindmapVisuals';
import '../../pages/lessonMaps.css';
export interface VisualBranch {title:string;items:string[];groups?:{title:string;items:string[]}[];art?:MapArt}
export interface VisualLessonMap {id:string;title:string;subject:string;section?:string;number?:number|null;week?:number|null;branches:VisualBranch[]}
export function MapPicture({art,className=''}:{art:MapArt;className?:string}){
 const [x,y]=artPositions[art];
 return <span aria-hidden="true" className={'map-picture '+className} style={{backgroundPosition:`${x}% ${y}%`,...(scienceArt.has(art)?{backgroundImage:'url(/illustrations/mindmap-science-20261021.png)'}:{})}}/>;
}
function MapText({text,math}:{text:string;math:boolean}){
 if(!math)return <>{text}</>;
 return <>{text.split(/(\b\d+\/\d+\b)/).map((part,i)=>/^\d+\/\d+$/.test(part)?<span key={i} className="map-fraction" role="math" aria-label={part.replace('/',' phần ')}><span>{part.split('/')[0]}</span><span>{part.split('/')[1]}</span></span>:part)}</>;
}
export function IllustratedMindMap({map,source,tagline}:{map:VisualLessonMap;source:string;tagline?:string}){
 const [recall,setRecall]=useState(false),[revealed,setRevealed]=useState<number[]>([]),[overview,setOverview]=useState(false);
 const viewport=useRef<HTMLDivElement>(null),canvas=useRef<HTMLElement>(null),hub=useRef<HTMLDivElement>(null),nodes=useRef<(HTMLElement|null)[]>([]);
 const [size,setSize]=useState({width:1080,height:720});
 useLayoutEffect(()=>{
  const measure=()=>{const width=viewport.current?.clientWidth||1080,height=canvas.current?.offsetHeight||720;setSize(old=>old.width===width&&old.height===height?old:{width,height});};
  const observer=new ResizeObserver(measure);if(viewport.current)observer.observe(viewport.current);if(canvas.current)observer.observe(canvas.current);measure();return()=>observer.disconnect();
 },[]);
 const compact=size.width<1040,drawWidth=Math.max(1080,size.width),scale=compact&&overview?size.width/drawWidth:1;
 const focusNode=(index:number)=>{setOverview(false);requestAnimationFrame(()=>{const view=viewport.current,node=index<0?hub.current:nodes.current[index];if(!view||!node)return;view.scrollTo({left:node.offsetLeft+node.offsetWidth/2-view.clientWidth/2,top:node.offsetTop+node.offsetHeight/2-view.clientHeight/2,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});node.focus({preventScroll:true});});};
 useLayoutEffect(()=>{if(size.width<1040&&viewport.current)viewport.current.scrollLeft=(drawWidth-size.width)/2;},[map.id,size.width,drawWidth]);
 const paths=map.branches.length===3?['M500 500 C350 455 350 545 170 500','M500 500 C690 500 620 250 830 250','M500 500 C690 500 620 750 830 750']:['M500 500 C310 500 380 250 170 250','M500 500 C690 500 620 250 830 250','M500 500 C310 500 380 750 170 750','M500 500 C690 500 620 750 830 750'];
 return <div className="mindmap-print-target">
 <div className="map-study-controls print:hidden"><p>Chủ đề ở giữa • Theo nhánh màu để ghi nhớ</p><button type="button" aria-pressed={recall} onClick={()=>{setRecall(!recall);setRevealed([]);}}>{recall?<Eye size={19}/>:<EyeOff size={19}/>} {recall?'Hiện tất cả kiến thức':'Che nhánh để tự nhớ'}</button>{compact&&<button type="button" aria-pressed={overview} onClick={()=>setOverview(!overview)}>{overview?<ScanSearch size={19}/>:<Maximize2 size={19}/>} {overview?'Đọc chữ lớn':'Xem toàn sơ đồ'}</button>}</div>
 {recall&&<p role="status" className="map-study-hint print:hidden">Em thử nhắc lại các ý dưới mỗi nhánh, rồi bấm “Mở nhánh” để đối chiếu.</p>}
 {compact&&<p className="map-study-hint print:hidden">Vuốt để xem quanh sơ đồ, hoặc chọn một nhánh bên dưới để đọc chữ lớn.</p>}
 <nav className="map-branch-nav print:hidden" aria-label="Đi đến nhánh sơ đồ"><button type="button" onClick={()=>focusNode(-1)}>Chủ đề trung tâm</button>{map.branches.map((b,i)=><button type="button" key={b.title} style={{'--branch-ink':branchPalette[i].ink,'--branch-line':branchPalette[i].line} as CSSProperties} onClick={()=>focusNode(i)}>{i+1}. {b.title}</button>)}</nav>
 <div className="mindmap-viewport" ref={viewport} tabIndex={0} aria-label="Vùng sơ đồ, có thể cuộn để đọc các nhánh">
 <div className="mindmap-sizer" style={{width:drawWidth*scale,height:size.height*scale}}>
 <figure ref={canvas} className={`mindmap-canvas map-count-${map.branches.length} ${map.branches.some(b=>b.groups)?'map-has-groups':''}`} style={{width:drawWidth,transform:`scale(${scale})`}} aria-label={'Sơ đồ tư duy: '+map.title}>
 <div className="map-spark map-spark-one" aria-hidden="true">✦</div><div className="map-spark map-spark-two" aria-hidden="true">✧</div>
 <svg className="mindmap-connections" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">{paths.map((d,i)=><g key={d}><path d={d} stroke="white" strokeWidth="16" vectorEffect="non-scaling-stroke"/><path data-branch={i} d={d} stroke={branchPalette[i].line} strokeWidth="8" vectorEffect="non-scaling-stroke"/></g>)}</svg>
 <div className="mindmap-center" ref={hub} tabIndex={-1}>
 <svg viewBox="0 0 300 360" preserveAspectRatio="none" className="map-cloud" aria-hidden="true"><path d="M36 68 C-2 63 1 125 15 142 C-5 167 3 213 22 220 C5 259 23 291 47 292 C43 331 79 352 111 335 C139 365 184 359 204 337 C239 356 274 331 270 298 C306 287 307 250 286 228 C309 199 300 160 285 148 C306 107 283 68 257 73 C250 36 213 24 187 43 C160 7 111 13 95 44 C63 19 32 35 36 68Z"/></svg>
 <div className="mindmap-center-content"><MapPicture art={lessonArt(map.subject,map.section||'',map.title)} className="map-center-picture"/><p className="map-center-kicker">{map.number?`Bài ${map.number}`:`Tuần ${map.week}`} • {map.section==='Bài học'||!map.section?map.subject:map.section}</p><h2>{centralTitle(map)}</h2><span className="map-center-stars" aria-hidden="true">✦ ✧ ✦</span></div>
 </div>
 {map.branches.map((b,i)=>{const palette=branchPalette[i],Icon=branchIcon(b.title,map.subject),shown=!recall||revealed.includes(i);return <article key={b.title} ref={node=>{nodes.current[i]=node;}} tabIndex={-1} className={`mindmap-node map-node-${i}`} style={{'--branch-line':palette.line,'--branch-ink':palette.ink,'--branch-wash':palette.wash} as CSSProperties}>
 <header className="map-node-heading"><div><span className="map-node-number">{i+1}</span><h3>{b.title}</h3></div><MapPicture art={b.art||lessonArt(map.subject,map.section||'',map.title,b.title)}/></header>
 <div className={`map-node-content ${shown?'':'map-content-concealed'}`}>
 {b.items.length>0&&<ul>{b.items.map(text=><li key={text}><Icon aria-hidden="true"/><span><MapText text={text} math={map.subject==='Toán'}/></span></li>)}</ul>}
 {b.groups?.map(group=><section key={group.title} className="map-node-group"><h4>{group.title}</h4><ul>{group.items.map(text=><li key={text}><Icon aria-hidden="true"/><span>{text}</span></li>)}</ul></section>)}
 </div>
 {recall&&<button type="button" className="map-reveal print:hidden" aria-expanded={shown} onClick={()=>setRevealed(old=>shown?old.filter(n=>n!==i):[...old,i])}>{shown?'Che nhánh':'Mở nhánh'}</button>}
 </article>})}
 {tagline&&<figcaption className="map-tagline">🌿 {tagline}</figcaption>}
 <p className="map-print-source">{map.title} • {source}</p>
 </figure>
 </div></div>
 <p className="map-reading-tip print:hidden"><strong>Mẹo nhớ:</strong> Nhìn hình → đọc từ khóa → nhắc lại một ý → tự vẽ lại nhánh em nhớ.</p>
 </div>;
}
