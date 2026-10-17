import {collection,doc,onSnapshot,runTransaction} from 'firebase/firestore';
import {auth,db} from '../firebase/firebase';
import {isFirebaseActive} from '../realtime/realtimeServiceSwitch';
import {eventBus} from '../realtime/broadcastChannel';
import {getRoomById} from '../realtime/mockStorage';
import {createSharedSubscriptions} from '../data/readEfficiency';
import {validateEncouragement,type EncouragementKind,type StudentEncouragement} from './content';
const shared=createSharedSubscriptions<StudentEncouragement[]>(),key=(room:string)=>'lhtt-encouragement-v1-'+room;
const read=(room:string):Record<string,StudentEncouragement>=>JSON.parse(localStorage.getItem(key(room))||'{}');
export class EncouragementService{
 static subscribe(room:string,studentId:string|null,next:(values:StudentEncouragement[])=>void,error:(e:Error)=>void){
  return shared(JSON.stringify([auth?.currentUser?.uid||'local',room,studentId]),(emit,fail)=>{
   if(isFirebaseActive&&db)return studentId?onSnapshot(doc(db,'rooms',room,'encouragements',studentId),s=>emit(s.exists()?[s.data() as StudentEncouragement]:[]),fail):onSnapshot(collection(db,'rooms',room,'encouragements'),s=>emit(s.docs.map(d=>d.data() as StudentEncouragement)),fail);
   const send=()=>{const data=read(room);emit(studentId?(data[studentId]?[data[studentId]]:[]):Object.values(data));};send();return eventBus.subscribe(e=>{if(e.roomId===room)send();});
  },next,error);
 }
 static async change(roomId:string,studentId:string,kind:EncouragementKind,reason:string|null,expectedId?:string){
  validateEncouragement(kind,reason);
  const update=(old:StudentEncouragement|undefined,name:string,teacherId:string)=>{
   const current=old?.badges[kind];if(reason===null&&(!current||!expectedId))throw Error('Huy hiệu đã thay đổi. Thầy/cô xem lại trước khi thu hồi.');
   if(reason===null&&current?.id!==expectedId)throw Error('Huy hiệu đã thay đổi. Thầy/cô xem lại trước khi thu hồi.');
   if(reason!==null&&current?.reason===reason.trim())return old!;
   const badges={...old?.badges};if(reason===null)delete badges[kind];else badges[kind]={id:crypto.randomUUID(),reason:reason.trim(),awardedAt:current?.awardedAt||new Date().toISOString()};
   return {studentId,studentName:name,teacherId,updatedAt:new Date().toISOString(),badges};
  };
  if(isFirebaseActive&&db){const firestore=db;await runTransaction(firestore,async tx=>{
   const room=await tx.get(doc(firestore,'rooms',roomId)),participant=await tx.get(doc(firestore,'rooms',roomId,'participants',studentId)),ref=doc(firestore,'rooms',roomId,'encouragements',studentId),existing=await tx.get(ref);
   if(!room.exists()||!participant.exists())throw Error('Học sinh cần tham gia phòng trước khi nhận huy hiệu.');
   const old=existing.exists()?existing.data() as StudentEncouragement:undefined,next=update(old,participant.data().name,room.data().teacherId);if(next!==old)tx.set(ref,next);
  });}else{const room=getRoomById(roomId),participant=room?.participants[studentId];if(!room||!participant)throw Error('Học sinh cần tham gia phòng trước khi nhận huy hiệu.');if(auth?.currentUser?.uid!==room.teacherId)throw Error('Chỉ giáo viên của phòng được trao huy hiệu.');const data=read(roomId),old=data[studentId],next=update(old,participant.name,room.teacherId);if(next===old)return;data[studentId]=next;localStorage.setItem(key(roomId),JSON.stringify(data));eventBus.publish({type:'ROOM_UPDATED',roomId,timestamp:new Date().toISOString()});}
 }
}
