import {doc,getDoc,getDocs,collection,query,where,runTransaction,setDoc,deleteDoc} from 'firebase/firestore';
import {signInAnonymously} from 'firebase/auth';
import {auth,db,isFirebaseConfigured} from '../firebase/firebase';
import type {ClassGroup} from '../../types';
import type {SelfPracticeQuiz} from './content';
import {prepareRewardResult} from '../rewards/freePoints';
import {gradePractice} from '../practice/grading';
import type {PracticeResult} from '../practice/types';

export interface StudentAccess {
 code:string; teacherId:string; classId:string; className:string; grade:string; studentId:string; studentName:string;
}
export interface StudentWork {
 id:string; teacherId:string; classId:string; className:string; studentId:string; studentName:string;
 quizId:string; quizTitle:string; subject:string; submittedAt:string;
 kind:'QUIZ'|'WRITING'; rewardStatus?:'RECORDED'|'PENDING'; result?:PracticeResult; outline?:string[]; essay?:string;
}
const accessKey='self-practice-student-access',workKey='self-practice-student-work';
const read=<T,>(key:string):T[]=>JSON.parse(localStorage.getItem(key)||'[]');
const teacherId=()=>{
 if(isFirebaseConfigured&&!auth?.currentUser?.uid)throw new Error('Cần đăng nhập giáo viên.');
 return auth?.currentUser?.uid||'mock-teacher';
};
export const normalizeAccessCode=(value:string)=>value.replace(/[\s-]/g,'').toUpperCase();
const randomCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(12)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');

export class StudentAccessService {
 static async listCodes():Promise<StudentAccess[]>{
  const uid=teacherId();
  if(isFirebaseConfigured&&db){const snap=await getDocs(query(collection(db,'selfPracticeAccess'),where('teacherId','==',uid)));return snap.docs.map(d=>d.data() as StudentAccess);}
  return read<StudentAccess>(accessKey).filter(a=>a.teacherId===uid);
 }
 static async createCodes(group:ClassGroup):Promise<void>{
  const uid=teacherId(),existing=await this.listCodes();
  for(const student of group.students){
   const old=existing.find(a=>a.classId===group.id&&a.studentId===student.id);
   const item:StudentAccess={code:old?.code||randomCode(),teacherId:uid,classId:group.id,className:group.name,grade:group.grade,studentId:student.id,studentName:student.name};
   if(isFirebaseConfigured&&db){const firestore=db;await runTransaction(firestore,async tx=>{
    const ref=doc(firestore,'selfPracticeAccess',item.code),snap=await tx.get(ref);
    if(snap.exists()&&(!old||snap.data().studentId!==student.id||snap.data().teacherId!==uid))throw new Error('Mã bị trùng. Vui lòng tạo lại.');
    tx.set(ref,item);
   });}else localStorage.setItem(accessKey,JSON.stringify([...read<StudentAccess>(accessKey).filter(a=>a.code!==item.code),item]));
  }
 }
 static async revoke(code:string){
  if(isFirebaseConfigured&&db)await deleteDoc(doc(db,'selfPracticeAccess',code));
  else localStorage.setItem(accessKey,JSON.stringify(read<StudentAccess>(accessKey).filter(a=>a.code!==code||a.teacherId!==teacherId())));
 }
 static async enter(value:string):Promise<StudentAccess>{
  const code=normalizeAccessCode(value);
  if(!/^[A-HJ-NP-Z2-9]{12}$/.test(code))throw new Error('Mã tự luyện gồm 12 ký tự. Em kiểm tra lại mã giáo viên đã cấp.');
  let item:StudentAccess|undefined;
  if(isFirebaseConfigured&&db&&auth){
   await auth.authStateReady();
   if(!auth.currentUser)await signInAnonymously(auth);
   const snap=await getDoc(doc(db,'selfPracticeAccess',code));if(snap.exists())item=snap.data() as StudentAccess;
  }else item=read<StudentAccess>(accessKey).find(a=>a.code===code);
  if(!item)throw new Error('Mã không tồn tại hoặc đã bị thu hồi. Em liên hệ giáo viên.');
  return item;
 }
 static async submit(access:StudentAccess,quiz:SelfPracticeQuiz,payload:{answers:Record<string,string>}|{outline:string[];essay:string},id:string):Promise<'RECORDED'|'PENDING'>{
  const current=await this.enter(access.code);
  if(current.studentId!==access.studentId||current.classId!==access.classId)throw new Error('Mã học sinh đã thay đổi. Em vui lòng vào lại.');
  const work:StudentWork={id,teacherId:current.teacherId,classId:current.classId,className:current.className,studentId:current.studentId,studentName:current.studentName,quizId:quiz.id,quizTitle:quiz.title,subject:quiz.subject,submittedAt:new Date().toISOString(),...('answers' in payload?{kind:'QUIZ',result:prepareRewardResult(quiz.questions,gradePractice(quiz.questions,payload.answers))}:{kind:'WRITING',outline:payload.outline.map(s=>s.trim()),essay:payload.essay.trim()})};
  if(isFirebaseConfigured&&db){await setDoc(doc(db,'selfPracticeWork',id),{...work,rewardVersion:2,rewardQuizVersion:quiz.updatedAt,accessCode:access.code,authUid:auth?.currentUser?.uid});
   if(work.kind==='QUIZ'){try{const {FreeRewardService}=await import('../rewards/FreeRewardService');await FreeRewardService.refresh({classId:access.classId,studentId:access.studentId,accessCode:access.code},'VIEW');await FreeRewardService.recordPractice({classId:access.classId,studentId:access.studentId,accessCode:access.code},id);}catch(error){console.warn('Bài nộp đã lưu, điểm huy hiệu chờ đối soát.',error);return 'PENDING';}}
  }
  else {localStorage.setItem(workKey,JSON.stringify([work,...read<StudentWork>(workKey).filter(w=>w.id!==id)]));if(typeof window!=='undefined')window.dispatchEvent(new Event('self-practice-work-updated'));}
  return 'RECORDED';
 }
 static async listWork():Promise<StudentWork[]>{
  const uid=teacherId();
  const items=isFirebaseConfigured&&db?(await getDocs(query(collection(db,'selfPracticeWork'),where('teacherId','==',uid)))).docs.map(d=>d.data() as StudentWork):read<StudentWork>(workKey).filter(w=>w.teacherId===uid);
  return items.sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
 }
}
