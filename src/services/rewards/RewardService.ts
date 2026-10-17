import {doc,onSnapshot,runTransaction,setDoc} from 'firebase/firestore';
import {auth,db} from '../firebase/firebase';
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
export class RewardService{
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
 static async select(i:RewardIdentity,id:AvatarId){if(i.teacher)throw Error('Avatar do học sinh lựa chọn.');if(isFirebaseActive&&db){const firestore=db;await runTransaction(firestore,async tx=>{const ref=doc(firestore,'classes',i.classId,'rewardWallets',i.studentId),snap=await tx.get(ref);if(!snap.exists())throw Error('Thầy/cô cần đồng bộ huy hiệu trước.');tx.set(ref,selectAvatar(snap.data() as RewardWallet,id));});}else{await mockAccess(i);const wallet=read(i);if(!wallet)throw Error('Thầy/cô cần đồng bộ huy hiệu trước.');write(i,selectAvatar(wallet,id));}}
}
