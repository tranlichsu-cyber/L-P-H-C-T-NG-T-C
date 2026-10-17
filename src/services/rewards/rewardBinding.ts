import {doc,setDoc} from 'firebase/firestore';
import {auth,db} from '../firebase/firebase';
import type {RewardIdentity} from './content';
const queue=new Map<string,Promise<void>>();
export async function bindRewardIdentity(i:RewardIdentity,active:()=>boolean=()=>true){
 if(i.teacher)return;
 const uid=auth?.currentUser?.uid;if(!uid||!db)throw Error('Em cần đăng nhập lại.');
 const previous=queue.get(uid)||Promise.resolve();
 const request=previous.catch(()=>{}).then(async()=>{if(!active())return;if(auth?.currentUser?.uid!==uid)throw Error('Phiên học sinh đã thay đổi.');await setDoc(doc(db!,'rewardAccess',uid),{classId:i.classId,studentId:i.studentId,roomId:i.roomId||'',accessCode:i.accessCode||''});});
 queue.set(uid,request);try{await request;}finally{if(queue.get(uid)===request)queue.delete(uid);}
}
