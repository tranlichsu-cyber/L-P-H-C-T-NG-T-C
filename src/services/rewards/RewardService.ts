import {doc,onSnapshot,runTransaction,setDoc} from 'firebase/firestore';
import {app,auth,db} from '../firebase/firebase';
import {isFirebaseActive} from '../realtime/realtimeServiceSwitch';
import {eventBus} from '../realtime/broadcastChannel';
import {getRoomById} from '../realtime/mockStorage';
import {StudentAccessService} from '../selfPractice/studentAccess';
import {createSharedSubscriptions} from '../data/readEfficiency';
import {creditWallet,selectAvatar,type RewardIdentity,type RewardWallet,type AvatarId} from './content';
const shared=createSharedSubscriptions<RewardWallet|null>(),bindQueue=new Map<string,Promise<void>>();
const key=(i:RewardIdentity)=>'lhtt-reward-v1-'+i.classId+'-'+i.studentId;
const read=(i:RewardIdentity):RewardWallet|undefined=>JSON.parse(localStorage.getItem(key(i))||'null')||undefined;
const write=(i:RewardIdentity,w:RewardWallet)=>{localStorage.setItem(key(i),JSON.stringify(w));eventBus.publish({type:'ROOM_UPDATED',roomId:'rewards:'+i.classId,timestamp:new Date().toISOString()});};
async function mockAccess(i:RewardIdentity){if(i.teacher){if(auth?.currentUser?.isAnonymous)throw Error('Cần tài khoản giáo viên.');return;}if(i.roomId){const r=getRoomById(i.roomId);if(r?.classId===i.classId&&r.participants[i.studentId]?.mockAuthUid===auth?.currentUser?.uid)return;}if(i.accessCode){const a=await StudentAccessService.enter(i.accessCode);if(a.classId===i.classId&&a.studentId===i.studentId)return;}throw Error('Em cần vào phòng hoặc nhập đúng mã của mình.');}
const refreshes=new Map<string,Promise<RewardWallet>>();
export class RewardService{
 static async refresh(i:RewardIdentity,action:'VIEW'|'CLAIM'='VIEW'):Promise<RewardWallet>{
  const cacheKey=JSON.stringify([auth?.currentUser?.uid,i,action]);
  const pending=refreshes.get(cacheKey);if(pending)return pending;
  const operation=(async()=>{
   if(isFirebaseActive&&app){const {getFunctions,httpsCallable}=await import('firebase/functions');const call=httpsCallable<unknown,RewardWallet>(getFunctions(app,'us-central1'),'automaticRewardPoints');const result=await call({classId:i.classId,studentId:i.studentId,roomId:i.roomId||'',accessCode:i.accessCode||'',action});return result.data;}
   await mockAccess(i);const previous=read(i);const identity={classId:i.classId,studentId:i.studentId,studentName:previous?.studentName||'Học sinh',teacherId:previous?.teacherId||'local'};
   const currentPoints=previous?.currentPoints??previous?.totalPoints??0;const base=previous||creditWallet(undefined,identity,0);const next={...(action==='CLAIM'?creditWallet(base,identity,currentPoints):base),currentPoints,checkedAt:new Date().toISOString()};write(i,next);return next;
  })();refreshes.set(cacheKey,operation);try{return await operation;}finally{if(refreshes.get(cacheKey)===operation)refreshes.delete(cacheKey);}
 }

 static subscribe(i:RewardIdentity,next:(w:RewardWallet|null)=>void,error:(e:Error)=>void){
  const uid=auth?.currentUser?.uid||'local';return shared(JSON.stringify([uid,i]),(emit,fail)=>{
   let active=true,stop=()=>{};
   void (async()=>{if(isFirebaseActive&&db){if(!i.teacher){const previous=bindQueue.get(uid)||Promise.resolve();const request=previous.catch(()=>{}).then(async()=>{if(active)await setDoc(doc(db!,'rewardAccess',uid),{classId:i.classId,studentId:i.studentId,roomId:i.roomId||'',accessCode:i.accessCode||''});});bindQueue.set(uid,request);try{await request;}finally{if(bindQueue.get(uid)===request)bindQueue.delete(uid);}}
     if(active)stop=onSnapshot(doc(db,'classes',i.classId,'rewardWallets',i.studentId),snap=>emit(snap.exists()?snap.data() as RewardWallet:null),fail);
    }else{await mockAccess(i);if(!active)return;const send=()=>emit(read(i)||null);send();stop=eventBus.subscribe(e=>{if(e.roomId==='rewards:'+i.classId)send();});}
   })().catch(e=>{if(active)fail(e);});return()=>{active=false;stop();};
  },next,error);
 }
 static async credit(classId:string,studentId:string,studentName:string,teacherId:string,points:number){
  const i={classId,studentId,teacher:true};if(isFirebaseActive&&db){const firestore=db;await runTransaction(firestore,async tx=>{const group=await tx.get(doc(firestore,'classes',classId)),student=await tx.get(doc(firestore,'classes',classId,'students',studentId)),ref=doc(firestore,'classes',classId,'rewardWallets',studentId),old=await tx.get(ref);if(!group.exists()||!student.exists())throw Error('Không tìm thấy học sinh của lớp.');const previous=old.exists()?old.data() as RewardWallet:undefined;const w=creditWallet(previous,{classId,studentId,studentName:student.data().name,teacherId:group.data().teacherId},points);if(!previous||w.totalPoints!==previous.totalPoints||w.studentName!==previous.studentName||w.teacherId!==previous.teacherId)tx.set(ref,w);});}
  else{await mockAccess(i);if(auth?.currentUser?.uid&&auth.currentUser.uid!==teacherId)throw Error('Cần giáo viên của lớp.');const previous=read(i),w=creditWallet(previous,{classId,studentId,studentName,teacherId},points);if(!previous||w.totalPoints!==previous.totalPoints)write(i,w);}
 }
 static async select(i:RewardIdentity,id:AvatarId){if(i.teacher)throw Error('Avatar do học sinh lựa chọn.');if(isFirebaseActive&&db){const firestore=db;await runTransaction(firestore,async tx=>{const ref=doc(firestore,'classes',i.classId,'rewardWallets',i.studentId),snap=await tx.get(ref);if(!snap.exists())throw Error('Em hãy cập nhật điểm trước khi đổi avatar.');tx.set(ref,selectAvatar(snap.data() as RewardWallet,id));});}else{await mockAccess(i);const wallet=read(i);if(!wallet)throw Error('Em hãy cập nhật điểm trước khi đổi avatar.');write(i,selectAvatar(wallet,id));}}
}
