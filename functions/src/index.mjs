import {onCall,HttpsError} from 'firebase-functions/v2/https';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {creditWallet} from './shared/rewards.mjs';
import {curatedTraditionQuizzes} from './shared/tradition.mjs';
import {verifiedPoints,canUseIdentity} from './points.mjs';
initializeApp();const db=getFirestore();
const builtin=new Map(curatedTraditionQuizzes.map(q=>[q.id,q.questions]));
const validId=value=>typeof value==='string'&&value.length>0&&value.length<=200&&!value.includes('/');
const stamp=value=>typeof value==='string'?Date.parse(value):value?.toMillis?.()||0;
export const automaticRewardPoints=onCall({region:'us-central1',memory:'256MiB',timeoutSeconds:120,maxInstances:2,concurrency:10},async request=>{
 if(!request.auth)throw new HttpsError('unauthenticated','Em cần vào lớp hoặc nhập mã học sinh.');
 const data=request.data||{};if(Object.keys(data).some(k=>!['classId','studentId','roomId','accessCode','action'].includes(k))||!validId(data.classId)||!validId(data.studentId)||!['VIEW','CLAIM'].includes(data.action))throw new HttpsError('invalid-argument','Yêu cầu đổi điểm không hợp lệ.');
 const {classId,studentId,action}=data,uid=request.auth.uid;
 const [groupSnap,studentSnap,profileSnap]=await db.getAll(db.doc('classes/'+classId),db.doc('classes/'+classId+'/students/'+studentId),db.doc('users/'+uid));
 if(!groupSnap.exists||!studentSnap.exists)throw new HttpsError('not-found','Không tìm thấy học sinh.');
 let room,participant,access;
 if(data.roomId){if(!validId(data.roomId))throw new HttpsError('invalid-argument','Phòng không hợp lệ.');const snaps=await db.getAll(db.doc('rooms/'+data.roomId),db.doc('rooms/'+data.roomId+'/participants/'+studentId));room=snaps[0].data();participant=snaps[1].data();}
 if(data.accessCode){if(typeof data.accessCode!=='string'||! /^[A-HJ-NP-Z2-9]{12}$/.test(data.accessCode))throw new HttpsError('invalid-argument','Mã học sinh không hợp lệ.');access=(await db.doc('selfPracticeAccess/'+data.accessCode).get()).data();}
 const group={...groupSnap.data(),id:classId};if(!canUseIdentity({uid,provider:request.auth.token.firebase?.sign_in_provider,profile:profileSnap.data(),group,studentId,room,participant,access}))throw new HttpsError('permission-denied','Phiên hoặc mã học sinh đã thay đổi. Em vui lòng vào lại.');
 const ref=db.doc('classes/'+classId+'/rewardWallets/'+studentId),old=(await ref.get()).data();
 let report=old&&Date.now()-stamp(old.checkedAt)<60000?{currentPoints:old.currentPoints,livePoints:old.livePoints,practicePoints:old.practicePoints,unavailableAttempts:old.unavailableAttempts||0,pendingAttempts:old.pendingAttempts||0}:null;
 const cached=!!report&&Number.isFinite(report.currentPoints);
 if(cached&&action==='VIEW')return old;
 if(!cached){
  const roomList=await db.collection('rooms').where('classId','==',classId).limit(2001).get();if(roomList.size>2000)throw new HttpsError('resource-exhausted','Lịch sử lớp quá lớn để tính trong một lượt.');
  const completed=roomList.docs.filter(d=>d.data().status==='FINISHED'&&!d.data().archived).sort((a,b)=>stamp(a.data().startedAt||a.data().createdAt)-stamp(b.data().startedAt||b.data().createdAt)).slice(0,100);
  const roomScores=await Promise.all(completed.map(async r=>{const s=(await r.ref.collection('scores').doc(studentId).get()).data();if(s)return s.totalScore??s.score??0;const events=await r.ref.collection('scoreEvents').where('studentId','==',studentId).get();return events.docs.reduce((n,d)=>n+(Number(d.data().points)||0),0);}));
  const workList=await db.collection('selfPracticeWork').where('classId','==',classId).where('studentId','==',studentId).limit(2001).get();if(workList.size>2000)throw new HttpsError('resource-exhausted','Có quá nhiều lượt tự luyện để tính trong một lượt.');
  const works=workList.docs.map(d=>d.data()),banks=new Map(builtin),ids=[...new Set(works.filter(w=>w.kind==='QUIZ'&&typeof w.quizId==='string'&&validId(w.quizId)).map(w=>w.quizId))];
  for(let index=0;index<ids.length;index+=100){const batch=ids.slice(index,index+100);const quizzes=await db.getAll(...batch.map(id=>db.doc('selfPracticeQuizzes/'+id)));for(let j=0;j<quizzes.length;j++){const quiz=quizzes[j].data();if(quiz?.published===true&&Array.isArray(quiz.questions))banks.set(batch[j],quiz.questions);}}
  // Recover teacher-owned source questions when an old public copy has been removed.
  for(const id of ids.filter(id=>!banks.has(id)&&id.startsWith(group.teacherId+'_'))){const source=id.slice(group.teacherId.length+1);if(!validId(source))continue;const meta=await db.doc('quizzes/'+source).get();if(meta.data()?.teacherId!==group.teacherId)continue;const qs=await meta.ref.collection('questions').get();if(qs.size)banks.set(id,qs.docs.map(d=>{const q=d.data();return {...q,id:d.id,points:q.correctPoints>0?q.correctPoints:1};}));}
  report=verifiedPoints({classId,studentId,teacherId:group.teacherId,roomScores,works,banks});
 }
 const now=new Date().toISOString();
 const result=await db.runTransaction(async tx=>{const snap=await tx.get(ref),previous=snap.data();const identity={classId,studentId,studentName:studentSnap.data().name,teacherId:group.teacherId};const base=previous||creditWallet(undefined,identity,0);
  const wallet=action==='CLAIM'?creditWallet(base,identity,report.currentPoints):{...base,...identity};
  const next={...wallet,...report,checkedAt:cached?old.checkedAt:now,updatedAt:now,...(action==='CLAIM'?{lastClaimedAt:now}:{})};tx.set(ref,next);return next;});
 return result;
});
