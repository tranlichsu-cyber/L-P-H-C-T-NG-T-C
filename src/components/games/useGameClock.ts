import {useEffect,useState} from 'react';
import type {GameSessionData} from '../../services/realtime/types';
export function useGameClock(game:GameSessionData|null|undefined,questionId:string|undefined){
 const [now,setNow]=useState(Date.now);
 const deadline=game?.type==='QUICK_ANSWER'&&game.roundQuestionId===questionId?game.roundDeadlineAt||0:0;
 const paused=game?.status==='PAUSED';
 useEffect(()=>{if(!deadline||paused)return;const tick=()=>setNow(Date.now());const first=setTimeout(tick,0),interval=setInterval(tick,250);return()=>{clearTimeout(first);clearInterval(interval);};},[deadline,paused]);
 return deadline?Math.max(0,Math.ceil((paused?(game?.roundPausedRemainingMs||0):deadline-now)/1000)):null;
}
