import {collection,doc,getDoc,getDocs,runTransaction} from 'firebase/firestore';
import {db} from '../firebase/firebase';
import {gradePractice} from '../practice/grading';
import type {PracticeQuestion} from '../practice/types';
import type {StudentWork} from '../selfPractice/studentAccess';
import {SelfPracticeService} from '../selfPractice/SelfPracticeService';
import {curatedTraditionQuizzes} from '../../data/traditionQuizzes';
import type {MockRoomData} from '../realtime/types';
import type {StudentLongitudinalRecord} from '../history/types';
import {advanceAttempt,attemptPoints,emptyPoints,type RewardAttempt,type RewardPoints} from './freePoints';
import {bindRewardIdentity} from './rewardBinding';
import {creditWallet,type RewardIdentity,type RewardWallet} from './content';
export class FreeRewardService {
 static bind=bindRewardIdentity;
 static async refresh(i:RewardIdentity,action:'VIEW'|'CLAIM'){
  const firestore=db!;await this.bind(i);
  return runTransaction(firestore,async tx=>{
   const groupRef=doc(firestore,'classes',i.classId),studentRef=doc(groupRef,'students',i.studentId),walletRef=doc(groupRef,'rewardWallets',i.studentId),pointRef=doc(groupRef,'rewardPoints',i.studentId);
   const [group,student,wallet,points]=await Promise.all([tx.get(groupRef),tx.get(studentRef),tx.get(walletRef),tx.get(pointRef)]);
   if(!group.exists()||!student.exists())throw Error('Không tìm thấy học sinh.');
   const previous=wallet.exists()?wallet.data() as RewardWallet:undefined,p=points.exists()?points.data() as RewardPoints:emptyPoints();
   const identity={classId:i.classId,studentId:i.studentId,studentName:student.data().name,teacherId:group.data().teacherId};
   const next=action==='CLAIM'?creditWallet(previous,identity,p.currentPoints):previous||creditWallet(undefined,identity,0);
   if(!points.exists())tx.set(pointRef,p);
   if(!previous||next.totalPoints!==previous.totalPoints||next.studentName!==previous.studentName)tx.set(walletRef,next);
   return {...next,currentPoints:Math.max(next.totalPoints,p.currentPoints),livePoints:p.livePoints,practicePoints:p.practicePoints,legacyImported:p.legacyImported};
  });
 }
 static async recordPractice(i:RewardIdentity,workId:string){
  const firestore=db!;await this.bind(i);
  const workSnap=await getDoc(doc(firestore,'selfPracticeWork',workId));if(!workSnap.exists())throw Error('Chưa tìm thấy bài nộp.');
  const work=workSnap.data() as StudentWork&{rewardVersion?:number};if(work.kind!=='QUIZ'||work.rewardVersion!==2)return;
  const quizSnap=await getDoc(doc(firestore,'selfPracticeQuizzes',work.quizId));if(!quizSnap.exists()||quizSnap.data().published!==true)throw Error('Bài đã lưu; điểm cần đối soát với đề gốc.');
  const quiz=quizSnap.data(),questions=quiz.questions as PracticeQuestion[];
  if(questions.some(q=>Number.isFinite(q.points)&&Math.abs((q.points??0)*100-Math.round((q.points??0)*100))>0.000001))throw Error('Biểu điểm quá hai chữ số thập phân; bài đã lưu và cần đối soát.');
  const result=gradePractice(questions,Object.fromEntries((work.result?.breakdown||[]).map(q=>[q.questionId,q.answer])));
  const ref=doc(firestore,'classes',i.classId,'rewardAttempts',workId);
  await runTransaction(firestore,async tx=>{if(!(await tx.get(ref)).exists())tx.set(ref,{studentId:i.studentId,quizId:work.quizId,workId,version:quiz.updatedAt,cursor:0,earnedUnits:0,maxUnits:0,pendingUnits:0} satisfies RewardAttempt);});
  let complete:RewardAttempt;
  for(;;){complete=await runTransaction(firestore,async tx=>{const old=(await tx.get(ref)).data() as RewardAttempt;if(old.version!==quiz.updatedAt)throw Error('Đề đã đổi; bài cần giáo viên đối soát.');if(old.cursor>=questions.length)return old;const next=advanceAttempt(old,questions,result);tx.set(ref,next);return next;});if(complete.cursor>=questions.length)break;}
  const points=attemptPoints(complete);if(!points)return;
  await this.creditSource(i.classId,i.studentId,'quiz',work.quizId,points,workId);
 }
 static async creditSource(classId:string,studentId:string,kind:'quiz'|'room',sourceId:string,points:number,attemptId='legacy'){
  if(!Number.isFinite(points)||points<0||points>1e9)throw Error('Điểm chưa hợp lệ.');
  const firestore=db!,pointRef=doc(firestore,'classes',classId,'rewardPoints',studentId),creditRef=doc(pointRef,kind==='quiz'?'quizCredits':'roomCredits',sourceId);
  await runTransaction(firestore,async tx=>{const [pointSnap,source]=await Promise.all([tx.get(pointRef),tx.get(creditRef)]),old=source.exists()?source.data().points:0;if(points<=old)return;
   const before=pointSnap.exists()?pointSnap.data() as RewardPoints:emptyPoints(),field=kind==='quiz'?'practicePoints':'livePoints';
   const next={...before,[field]:before[field]+(points-old),sourceId,updatedAt:new Date().toISOString()};next.currentPoints=next.livePoints+next.practicePoints;
   tx.set(pointRef,next);tx.set(creditRef,{points,attemptId,updatedAt:next.updatedAt});
  });
 }
 static async recordRoom(room:MockRoomData){
  if(!room.classId)return;
  const students=[...new Set([...room.roster.map(s=>s.id),...Object.keys(room.participants)])];
  for(let offset=0;offset<students.length;offset+=5)await Promise.all(students.slice(offset,offset+5).map(async studentId=>{
   const score=room.scores[studentId],fallback=Object.values(room.scoreEvents||{}).filter(e=>e.studentId===studentId).reduce((n,e)=>n+e.points,0);
   const points=Math.max(0,score?.totalScore??score?.score??fallback);if(points>0)await this.creditSource(room.classId!,studentId,'room',room.id,points);
  }));
 }
 static async importLegacy(classId:string,studentId:string,records:StudentLongitudinalRecord[],works:StudentWork[]){
  const publicQuizzes=await SelfPracticeService.list(false),banks=new Map<string,PracticeQuestion[]>([...curatedTraditionQuizzes.map(q=>[q.id,q.questions] as [string,PracticeQuestion[]]),...publicQuizzes.map(q=>[q.id,q.questions] as [string,PracticeQuestion[]])]);
  const best=new Map<string,number>();let missing=0;
  for(const w of works.filter(w=>w.classId===classId&&w.studentId===studentId&&w.kind==='QUIZ')){
   if(!banks.has(w.quizId)&&w.quizId.startsWith(w.teacherId+'_')){const id=w.quizId.slice(w.teacherId.length+1),meta=await getDoc(doc(db!,'quizzes',id));if(meta.exists()&&meta.data().teacherId===w.teacherId){const qs=await getDocs(collection(meta.ref,'questions'));if(qs.size)banks.set(w.quizId,qs.docs.map(d=>({...d.data(),id:d.id,points:d.data().correctPoints>0?d.data().correctPoints:1}) as PracticeQuestion));}}
   const bank=banks.get(w.quizId);if(!bank){missing++;continue;}
   const result=gradePractice(bank,Object.fromEntries((w.result?.breakdown||[]).map(q=>[q.questionId,q.answer])));if(result.pendingReview||!result.maxPoints)continue;
   best.set(w.quizId,Math.max(best.get(w.quizId)||0,Math.round(result.earnedPoints/result.maxPoints*1000)/100));
  }
  for(const record of records)await this.creditSource(classId,studentId,'room',record.roomId,Math.max(0,record.score));
  for(const [quizId,points] of best)await this.creditSource(classId,studentId,'quiz',quizId,points);
  await runTransaction(db!,async tx=>{const ref=doc(db!,'classes',classId,'rewardPoints',studentId),snap=await tx.get(ref),old=snap.exists()?snap.data() as RewardPoints:emptyPoints();tx.set(ref,{...old,legacyImported:missing===0,updatedAt:new Date().toISOString()});});
  return missing;
 }
}
