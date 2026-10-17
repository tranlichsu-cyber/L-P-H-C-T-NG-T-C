import type {PracticeQuestion,PracticeResult} from '../practice/types';
export interface RewardAttempt {studentId:string;quizId:string;workId:string;version:string;cursor:number;earnedUnits:number;maxUnits:number;pendingUnits:number}
export interface RewardPoints {currentPoints:number;livePoints:number;practicePoints:number;legacyImported:boolean;updatedAt:string;sourceId:string}
export const emptyPoints=():RewardPoints=>({currentPoints:0,livePoints:0,practicePoints:0,legacyImported:false,updatedAt:new Date().toISOString(),sourceId:''});
// The same arithmetic is enforced by Firestore rules in steps of one question.
export function advanceAttempt(old:RewardAttempt,questions:PracticeQuestion[],result:PracticeResult):RewardAttempt{
 const end=Math.min(old.cursor+1,questions.length),next={...old,cursor:end};
 for(let i=old.cursor;i<end;i++){const q=questions[i],answer=result.breakdown[i];if(answer?.questionId!==q.id)throw Error('Thứ tự câu trả lời không khớp đề gốc.');const units=Math.round((Number.isFinite(q.points)&&(q.points??0)>=0?q.points!:1)*100);next.maxUnits+=units;if(q.reviewMode==='TEACHER')next.pendingUnits+=units;else if(answer.isCorrect)next.earnedUnits+=units;}
 return next;
}
export const attemptPoints=(a:RewardAttempt)=>a.pendingUnits||!a.maxUnits?0:Math.round(a.earnedUnits/a.maxUnits*1000)/100;
