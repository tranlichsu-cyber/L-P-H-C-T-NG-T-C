import {collection,doc,onSnapshot,runTransaction,writeBatch,setDoc,updateDoc,getDoc} from 'firebase/firestore';
import {auth,db} from '../firebase/firebase';
import {isFirebaseActive} from '../realtime/realtimeServiceSwitch';
import {eventBus} from '../realtime/broadcastChannel';
import {getRoomById} from '../realtime/mockStorage';
import {emptyWorksheetState,validateWorksheet,validateWorksheetAnswers,type WorksheetDraft,type RoomWorksheet,type WorksheetResponse,type WorksheetState} from './content';
interface LocalData {state:WorksheetState;sheets:Record<string,RoomWorksheet>;responses:Record<string,Record<string,WorksheetResponse>>}
const key=(roomId:string)=>'lhtt-worksheets-v1-'+roomId;
const read=(roomId:string):LocalData=>JSON.parse(localStorage.getItem(key(roomId))||'null')||{state:emptyWorksheetState(),sheets:{},responses:{}};
const write=(roomId:string,data:LocalData)=>{localStorage.setItem(key(roomId),JSON.stringify(data));eventBus.publish({type:'ROOM_UPDATED',roomId,timestamp:new Date().toISOString()});};
export class WorksheetService {
 static subscribeState(roomId:string,callback:(state:WorksheetState)=>void,onError:(error:Error)=>void){
  if(isFirebaseActive&&db)return onSnapshot(doc(db,'rooms',roomId,'worksheetState','current'),s=>callback(s.exists()?s.data() as WorksheetState:emptyWorksheetState()),onError);
  callback(read(roomId).state);return eventBus.subscribe(e=>{if(e.roomId===roomId)callback(read(roomId).state);});
 }
 static subscribeSheet(roomId:string,id:string,callback:(sheet:RoomWorksheet|null)=>void,onError:(error:Error)=>void){
  if(isFirebaseActive&&db)return onSnapshot(doc(db,'rooms',roomId,'worksheets',id),s=>callback(s.exists()?s.data() as RoomWorksheet:null),onError);
  callback(read(roomId).sheets[id]||null);return eventBus.subscribe(e=>{if(e.roomId===roomId)callback(read(roomId).sheets[id]||null);});
 }
 static subscribeResponses(roomId:string,id:string,studentId:string|null,callback:(work:WorksheetResponse[])=>void,onError:(error:Error)=>void){
  if(isFirebaseActive&&db){
   if(studentId)return onSnapshot(doc(db,'rooms',roomId,'worksheets',id,'responses',studentId),s=>callback(s.exists()?[s.data() as WorksheetResponse]:[]),onError);
   return onSnapshot(collection(db,'rooms',roomId,'worksheets',id,'responses'),s=>callback(s.docs.map(d=>d.data() as WorksheetResponse)),onError);
  }
  const emit=()=>{const responses=read(roomId).responses[id]||{};callback(studentId?(responses[studentId]?[responses[studentId]]:[]):Object.values(responses));};emit();return eventBus.subscribe(e=>{if(e.roomId===roomId)emit();});
 }
 static async publish(roomId:string,draft:WorksheetDraft):Promise<string>{
  validateWorksheet(draft);const id=crypto.randomUUID();const sheet:RoomWorksheet={...draft,title:draft.title.trim(),id,roomId,status:'OPEN',createdAt:new Date().toISOString()};const state={worksheetId:id,projectedStudentId:null,projectedWorksheetId:null,showStudentName:true};
  if(isFirebaseActive&&db){const firestore=db;await runTransaction(firestore,async tx=>{
   const room=await tx.get(doc(firestore,'rooms',roomId));if(!room.exists()||room.data().status==='FINISHED')throw new Error('Buổi học đã kết thúc.');
   const current=await tx.get(doc(firestore,'rooms',roomId,'worksheetState','current'));
   const oldId=current.data()?.worksheetId;
   if(oldId)tx.update(doc(firestore,'rooms',roomId,'worksheets',oldId),{status:'CLOSED'});
   tx.set(doc(firestore,'rooms',roomId,'worksheets',id),{...sheet,questionIds:sheet.questions.map(q=>q.id)});tx.set(doc(firestore,'rooms',roomId,'worksheetState','current'),state);
  });}else{if(!getRoomById(roomId))throw new Error('Không tìm thấy phòng học.');if(getRoomById(roomId)?.status==='FINISHED')throw new Error('Buổi học đã kết thúc.');const data=read(roomId);if(data.state.worksheetId&&data.sheets[data.state.worksheetId])data.sheets[data.state.worksheetId].status='CLOSED';data.sheets[id]=sheet;data.responses[id]={};data.state=state;write(roomId,data);}
  return id;
 }
 static async close(roomId:string,id:string){
  if(isFirebaseActive&&db)await updateDoc(doc(db,'rooms',roomId,'worksheets',id),{status:'CLOSED'});
  else{const data=read(roomId);if(data.sheets[id])data.sheets[id].status='CLOSED';write(roomId,data);}
 }
 static async stop(roomId:string){
  if(isFirebaseActive&&db){const state=await getDoc(doc(db,'rooms',roomId,'worksheetState','current'));const batch=writeBatch(db);if(state.data()?.worksheetId)batch.update(doc(db,'rooms',roomId,'worksheets',state.data()!.worksheetId),{status:'CLOSED'});batch.set(doc(db,'rooms',roomId,'worksheetState','current'),emptyWorksheetState());await batch.commit();}
  else{const data=read(roomId);if(data.state.worksheetId&&data.sheets[data.state.worksheetId])data.sheets[data.state.worksheetId].status='CLOSED';data.state=emptyWorksheetState();write(roomId,data);}
 }
 static async project(roomId:string,id:string|null,showStudentName:boolean,worksheetId:string){
  if(isFirebaseActive&&db)await setDoc(doc(db,'rooms',roomId,'worksheetState','current'),{projectedStudentId:id,projectedWorksheetId:worksheetId,showStudentName},{merge:true});
  else{const data=read(roomId);data.state.projectedStudentId=id;data.state.projectedWorksheetId=worksheetId;data.state.showStudentName=showStudentName;write(roomId,data);}
 }
 static subscribeSheets(roomId:string,callback:(sheets:RoomWorksheet[])=>void,onError:(error:Error)=>void){
  if(isFirebaseActive&&db)return onSnapshot(collection(db,'rooms',roomId,'worksheets'),s=>callback(s.docs.map(d=>d.data() as RoomWorksheet).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))),onError);
  const emit=()=>callback(Object.values(read(roomId).sheets).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));emit();return eventBus.subscribe(e=>{if(e.roomId===roomId)emit();});
 }
 static async submit(roomId:string,id:string,studentId:string,answers:Record<string,string>):Promise<void>{
  if(isFirebaseActive&&db){const firestore=db;await runTransaction(firestore,async tx=>{
   const ref=doc(firestore,'rooms',roomId,'worksheets',id,'responses',studentId);const existing=await tx.get(ref);if(existing.exists())return;
   const room=await tx.get(doc(firestore,'rooms',roomId));const sheet=await tx.get(doc(firestore,'rooms',roomId,'worksheets',id));const participant=await tx.get(doc(firestore,'rooms',roomId,'participants',studentId));
   if(!sheet.exists()||sheet.data().status!=='OPEN'||room.data()?.status==='FINISHED')throw new Error('Giáo viên đã khóa nhận bài hoặc kết thúc buổi học.');
   if(!participant.exists()||participant.data().mockAuthUid!==auth?.currentUser?.uid)throw new Error('Em cần vào phòng và chọn đúng tên của mình.');
   validateWorksheetAnswers(sheet.data().questions,answers);
   tx.set(ref,{studentId,studentName:participant.data().name,authUid:auth!.currentUser!.uid,answers,submittedAt:new Date().toISOString()});
  });}else{const data=read(roomId);if(data.responses[id]?.[studentId])return;const sheet=data.sheets[id],room=getRoomById(roomId),participant=room?.participants[studentId];if(!sheet||sheet.status!=='OPEN'||room?.status==='FINISHED')throw new Error('Giáo viên đã khóa nhận bài hoặc kết thúc buổi học.');if(!participant)throw new Error('Em chưa vào phòng học.');validateWorksheetAnswers(sheet.questions,answers);data.responses[id]??={};data.responses[id][studentId]={studentId,studentName:participant.name,authUid:participant.mockAuthUid||studentId,answers,submittedAt:new Date().toISOString()};write(roomId,data);}
 }
}
