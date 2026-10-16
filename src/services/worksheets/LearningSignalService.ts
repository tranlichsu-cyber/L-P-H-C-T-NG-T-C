import {collection,doc,onSnapshot,runTransaction} from 'firebase/firestore';
import {auth,db} from '../firebase/firebase';
import {isFirebaseActive} from '../realtime/realtimeServiceSwitch';
import {eventBus} from '../realtime/broadcastChannel';
import {getRoomById} from '../realtime/mockStorage';
import {createSharedSubscriptions} from '../data/readEfficiency';
export const signalLabels={UNDERSTOOD:'Em đã hiểu bài',UNSURE:'Em còn phân vân',HELP:'Em cần thầy/cô giúp'} as const;
export type SignalLevel=keyof typeof signalLabels;
export interface LearningSignal {studentId:string;studentName:string;authUid:string;level:SignalLevel;handled:boolean;updatedAt:string;requestId:string}
const shared=createSharedSubscriptions<LearningSignal[]>();
const key=(room:string)=>'lhtt-learning-signals-v1-'+room;
const read=(room:string):Record<string,LearningSignal>=>JSON.parse(localStorage.getItem(key(room))||'{}');
const write=(room:string,data:Record<string,LearningSignal>)=>{localStorage.setItem(key(room),JSON.stringify(data));eventBus.publish({type:'ROOM_UPDATED',roomId:room,timestamp:new Date().toISOString()});};
export class LearningSignalService{
 static subscribe(room:string,studentId:string|null,next:(signals:LearningSignal[])=>void,error:(error:Error)=>void){
  return shared(JSON.stringify([auth?.currentUser?.uid||'local',room,studentId]),(emit,fail)=>{
   if(isFirebaseActive&&db)return studentId?onSnapshot(doc(db,'rooms',room,'learningSignals',studentId),s=>emit(s.exists()?[s.data() as LearningSignal]:[]),fail):onSnapshot(collection(db,'rooms',room,'learningSignals'),s=>emit(s.docs.map(d=>d.data() as LearningSignal)),fail);
   const send=()=>emit(studentId?(read(room)[studentId]?[read(room)[studentId]]:[]):Object.values(read(room)));send();return eventBus.subscribe(e=>{if(e.roomId===room)send();});
  },next,error);
 }
 static async send(roomId:string,studentId:string,level:SignalLevel){
  if(!Object.hasOwn(signalLabels,level))throw Error('Tín hiệu không hợp lệ.');
  if(isFirebaseActive&&db){const firestore=db;await runTransaction(firestore,async tx=>{
   const room=await tx.get(doc(firestore,'rooms',roomId)),p=await tx.get(doc(firestore,'rooms',roomId,'participants',studentId)),ref=doc(firestore,'rooms',roomId,'learningSignals',studentId),old=await tx.get(ref);
   if(!room.exists()||room.data().status==='FINISHED')throw Error('Buổi học đã kết thúc.');
   if(!p.exists()||p.data().mockAuthUid!==auth?.currentUser?.uid)throw Error('Em cần vào phòng và chọn đúng tên.');
   if(old.data()?.level===level&&!old.data()?.handled)return;
   tx.set(ref,{studentId,studentName:p.data().name,authUid:auth!.currentUser!.uid,level,handled:false,requestId:crypto.randomUUID(),updatedAt:new Date().toISOString()});
  });}else{const room=getRoomById(roomId),p=room?.participants[studentId];if(!room||room.status==='FINISHED')throw Error('Buổi học đã kết thúc.');if(!p)throw Error('Em chưa vào phòng.');const data=read(roomId);if(data[studentId]?.level===level&&!data[studentId]?.handled)return;data[studentId]={studentId,studentName:p.name,authUid:p.mockAuthUid||studentId,level,handled:false,requestId:crypto.randomUUID(),updatedAt:new Date().toISOString()};write(roomId,data);}
 }
 static async acknowledge(roomId:string,studentId:string,expectedRequest:string){
  if(isFirebaseActive&&db){const firestore=db;await runTransaction(firestore,async tx=>{const ref=doc(firestore,'rooms',roomId,'learningSignals',studentId),snap=await tx.get(ref);if(!snap.exists()||snap.data().requestId!==expectedRequest)throw Error('Học sinh vừa đổi tín hiệu. Thầy/cô xem lại yêu cầu mới.');tx.update(ref,{handled:true});});}
  else{const data=read(roomId);if(!data[studentId]||data[studentId].requestId!==expectedRequest)throw Error('Học sinh vừa đổi tín hiệu. Thầy/cô xem lại yêu cầu mới.');data[studentId].handled=true;write(roomId,data);}
 }
}
