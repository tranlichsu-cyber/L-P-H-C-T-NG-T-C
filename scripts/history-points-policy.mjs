export const round=value=>Math.round((value+Number.EPSILON)*100)/100;
export function historicalSources({classId,studentId,teacherId,rooms,works,banks,gradePractice}){
 const sources=[],best=new Map();let unavailable=0,pending=0,invalid=0;
 for(const room of rooms){if(room.classId!==classId||room.status!=='FINISHED')continue;
  const score=room.scores.get(studentId),raw=score?.totalScore??score?.score??room.events.get(studentId)??0;
  if(!Number.isFinite(raw)){invalid++;continue;}const points=round(Math.max(0,raw));if(points)sources.push({kind:'room',id:room.id,points});
 }
 for(const w of works){if(w.classId!==classId||w.studentId!==studentId||w.teacherId!==teacherId||w.kind!=='QUIZ')continue;
  const bank=banks.get(w.quizId),rows=w.result?.breakdown;
  if(!bank||!Array.isArray(rows)||!Array.isArray(bank.questions)||!bank.questions.length||bank.questions.length!==rows.length||(w.rewardQuizVersion&&bank.version&&w.rewardQuizVersion!==bank.version)||(bank.version&&Date.parse(bank.version)>Date.parse(w.submittedAt))){unavailable++;continue;}
  const ids=new Set(bank.questions.map(q=>q.id));
  if(ids.size!==bank.questions.length||new Set(rows.map(q=>q.questionId)).size!==rows.length||rows.some(q=>!ids.has(q.questionId)||typeof q.answer!=='string'||q.answer.length>10000)){invalid++;continue;}
  let result;try{result=gradePractice(bank.questions,Object.fromEntries(rows.map(q=>[q.questionId,q.answer])));}catch{invalid++;continue;}
  if(result.pendingReview){pending++;continue;}if(!result.maxPoints)continue;
  const points=round(result.earnedPoints/result.maxPoints*10);if(!Number.isFinite(points)||points<0||points>10){invalid++;continue;}
  best.set(w.quizId,Math.max(best.get(w.quizId)||0,points));
 }
 for(const [id,points]of best)if(points)sources.push({kind:'quiz',id,points});
 return {sources,unavailable,pending,invalid};
}
export function validLedger(ledger,credits){
 const live=round(credits.filter(c=>c.kind==='room').reduce((n,c)=>n+c.points,0)),practice=round(credits.filter(c=>c.kind==='quiz').reduce((n,c)=>n+c.points,0));
 if(credits.some(c=>!Number.isFinite(c.points)||c.points<0))return false;
 if(!ledger)return live===0&&practice===0;
 return ['livePoints','practicePoints','currentPoints'].every(k=>Number.isFinite(ledger[k])&&ledger[k]>=0)
  &&round(ledger.livePoints)===live&&round(ledger.practicePoints)===practice&&round(ledger.currentPoints)===round(live+practice);
}
