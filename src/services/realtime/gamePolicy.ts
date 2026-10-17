import type {GameSessionData,MockSubmission,TeamData} from './types';
export function openGameRound(game:GameSessionData,questionId:string,now=Date.now()):GameSessionData{
 const duration=game.settings.timerSeconds??0;
 return {...game,activeQuestionId:questionId,roundQuestionId:questionId,roundDeadlineAt:game.type==='QUICK_ANSWER'&&duration>0?now+duration*1000:0,roundPausedRemainingMs:0};
}
export function toggleGamePause(game:GameSessionData,now=Date.now()):GameSessionData{
 if(game.status==='PAUSED')return {...game,status:'RUNNING',roundDeadlineAt:game.roundDeadlineAt?now+(game.roundPausedRemainingMs||0):0,roundPausedRemainingMs:0};
 return {...game,status:'PAUSED',roundPausedRemainingMs:game.roundDeadlineAt?Math.max(0,game.roundDeadlineAt-now):0};
}
export function gameAcceptsAnswer(game:GameSessionData|null|undefined,questionId:string,now=Date.now()){
 return !game||(game.status!=='PAUSED'&&(game.type!=='QUICK_ANSWER'||(game.roundQuestionId===questionId&&(!game.roundDeadlineAt||now<game.roundDeadlineAt))));
}
export function teamResults(teams:Record<string,TeamData>,submissions:MockSubmission[]){
 const unique=[...new Map(submissions.map(w=>[w.questionId+'\0'+w.studentId,w])).values()];
 const rounds=new Set(unique.filter(w=>typeof w.isCorrect==='boolean').map(w=>w.questionId)).size;
 return Object.values(teams).sort((a,b)=>a.displayOrder-b.displayOrder).map(team=>{const correct=unique.filter(w=>team.memberIds.includes(w.studentId)&&w.isCorrect===true).length;const possible=rounds*team.memberIds.length;return {...team,correct,possible,score:possible?Math.round(correct/possible*100):0};});
}
export function wheelStopRotation(current:number,index:number,count:number){const turn=Math.PI*2;const target=((Math.PI*1.5-turn*(index+.5)/count)%turn+turn)%turn;return current+turn*5+((target-current%turn+turn)%turn);}
