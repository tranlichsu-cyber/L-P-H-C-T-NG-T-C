import {useEffect,useState} from 'react';
export function useGroupDeadline(deadlineAt?:number){
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{if(!deadlineAt)return;let active=true;const tick=()=>{if(!active)return;const time=Date.now();setNow(time);if(time>=deadlineAt)window.clearInterval(timer);};const timer=window.setInterval(tick,1000);Promise.resolve().then(tick);return()=>{active=false;window.clearInterval(timer);};},[deadlineAt]);
 return deadlineAt?Math.max(0,Math.ceil((deadlineAt-now)/1000)):null;
}
export const groupTimeLabel=(remaining:number)=>remaining===0?'Đã hết thời gian thảo luận':`Thời gian nhóm còn lại: ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;
