import {gradePractice,roundPoints} from './shared/grading.mjs';
export function verifiedPoints({classId,studentId,teacherId,roomScores,works,banks}){
 const livePoints=roundPoints(roomScores.reduce((sum,score)=>sum+(Number.isFinite(score)?Math.max(0,score):0),0));
 const best=new Map();let unavailable=0,pending=0;
 for(const work of works){if(work.classId!==classId||work.studentId!==studentId||work.teacherId!==teacherId||work.kind!=='QUIZ')continue;
  const bank=banks.get(work.quizId);if(!bank?.length){unavailable++;continue;}
  const answers=Object.fromEntries((Array.isArray(work.result?.breakdown)?work.result.breakdown:[]).filter(q=>typeof q.questionId==='string'&&typeof q.answer==='string'&&q.answer.length<=10000).map(q=>[q.questionId,q.answer]));
  const grade=gradePractice(bank,answers);if(grade.pendingReview){pending++;continue;}if(!grade.maxPoints)continue;
  best.set(work.quizId,Math.max(best.get(work.quizId)||0,roundPoints(grade.earnedPoints/grade.maxPoints*10)));
 }
 const practicePoints=roundPoints([...best.values()].reduce((n,p)=>n+p,0));
 return {currentPoints:roundPoints(livePoints+practicePoints),livePoints,practicePoints,unavailableAttempts:unavailable,pendingAttempts:pending};
}
export function canUseIdentity({uid,provider,profile,group,studentId,room,participant,access}){
 const teacher=provider!=='anonymous'&&profile?.status==='ACTIVE'&&(group.teacherId===uid||group.coTeacherIds?.includes(uid)||profile.role==='SCHOOL_ADMIN');
 return !!(teacher||(room?.classId===group.id&&participant?.mockAuthUid===uid)||(access?.classId===group.id&&access.studentId===studentId&&access.teacherId===group.teacherId));
}
