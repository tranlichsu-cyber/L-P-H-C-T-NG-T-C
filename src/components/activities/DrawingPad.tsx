import {useLayoutEffect,useRef} from 'react';
import type {Strokes,Point} from '../../services/worksheets/activities';
export function DrawingPad({strokes,onChange,disabled=false,overlay=false,color='#0369a1',label='Bảng vẽ của em'}:{strokes:Strokes;onChange?:(strokes:Strokes)=>void;disabled?:boolean;overlay?:boolean;color?:string;label?:string}){
 const pointer=useRef<number|null>(null),latest=useRef(strokes);useLayoutEffect(()=>{latest.current=strokes;},[strokes]);
 const locate=(e:React.PointerEvent<SVGSVGElement>):Point=>{const r=e.currentTarget.getBoundingClientRect();return [Math.round(Math.min(1,Math.max(0,(e.clientX-r.left)/r.width))*1000)/1000,Math.round(Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))*1000)/1000];};
 const change=(next:Strokes)=>{latest.current=next;onChange?.(next);};
 const canDraw=!!onChange&&!disabled;
 return <svg aria-label={label} role="img" viewBox="0 0 600 300" preserveAspectRatio="none" className={overlay?'absolute inset-0 h-full w-full':'block w-full aspect-[2/1] rounded-xl border-2 border-sky-200 bg-white'} style={{touchAction:canDraw?'none':'auto',pointerEvents:overlay&&!canDraw?'none':'auto',cursor:canDraw?'crosshair':'default'}}
 onPointerDown={e=>{if(!canDraw||e.button!==0||pointer.current!==null||latest.current.length>=32||latest.current.flat().length>=480)return;pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);change([...latest.current,[locate(e)]]);}}
 onPointerMove={e=>{if(!canDraw||pointer.current!==e.pointerId)return;const all=latest.current;if(all.flat().length>=480)return;const stroke=all.at(-1);if(!stroke)return;const p=locate(e),last=stroke.at(-1)!;if(Math.hypot(p[0]-last[0],p[1]-last[1])<.006)return;change([...all.slice(0,-1),[...stroke,p]]);}}
 onPointerUp={e=>{if(pointer.current===e.pointerId)pointer.current=null;}}
 onPointerCancel={()=>{pointer.current=null;}} onLostPointerCapture={()=>{pointer.current=null;}}>
 {strokes.map((stroke,i)=>stroke.length===1?<circle key={i} cx={stroke[0][0]*600} cy={stroke[0][1]*300} r={2} fill={color}/>:<path key={i} d={stroke.map((p,j)=>(j?'L':'M')+p[0]*600+','+p[1]*300).join(' ')} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/>)}
 </svg>;
}
