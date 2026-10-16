import type {StudentWork} from './studentAccess';
import {roundPoints} from '../practice/grading';

/** One contribution per class/student/quiz: the best score, normalized to ten. */
export function selfPracticePoints(works:StudentWork[],classId:string,studentId:string,subject='ALL') {
 const best=new Map<string,number>();
 for(const work of works){
  if(work.classId!==classId||work.studentId!==studentId||work.kind!=='QUIZ'||(subject!=='ALL'&&work.subject!==subject))continue;
  const result=work.result;
  if(!result||result.pendingReview||!Number.isFinite(result.earnedPoints)||!Number.isFinite(result.maxPoints)||result.maxPoints<=0||result.earnedPoints<0||result.earnedPoints>result.maxPoints)continue;
  const points=roundPoints(result.earnedPoints/result.maxPoints*10);
  best.set(work.quizId,Math.max(best.get(work.quizId)||0,points));
 }
 return roundPoints([...best.values()].reduce((sum,points)=>sum+points,0));
}
