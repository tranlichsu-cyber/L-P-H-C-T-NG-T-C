import {collection,doc,getDoc,getDocs,query,where,setDoc,deleteDoc} from 'firebase/firestore';
import {auth,db,isFirebaseConfigured} from '../firebase/firebase';
import type {Quiz} from '../../types';
import {publicQuizCopy,type SelfPracticeQuiz} from './content';
const key='self-practice-public-quizzes';
export class SelfPracticeService{
 static async list(publicOnly=true):Promise<SelfPracticeQuiz[]>{
  if(isFirebaseConfigured&&db){const snap=await getDocs(query(collection(db,'selfPracticeQuizzes'),publicOnly?where('published','==',true):where('teacherId','==',auth?.currentUser?.uid||'')));return snap.docs.map(d=>({...d.data(),id:d.id} as SelfPracticeQuiz)).sort((a,b)=>a.title.localeCompare(b.title,'vi'));}
  const items=JSON.parse(localStorage.getItem(key)||'[]') as SelfPracticeQuiz[];return items.filter(i=>publicOnly?i.published:i.teacherId===(auth?.currentUser?.uid||'mock-teacher'));
 }
 static async publish(quiz:Quiz){
  const uid=auth?.currentUser?.uid||(isFirebaseConfigured?'':'mock-teacher');
  if(isFirebaseConfigured&&db){const profile=await getDoc(doc(db,'users',uid));if(quiz.teacherId!==uid&&profile.data()?.role!=='SCHOOL_ADMIN')throw new Error('Chỉ công khai bộ đề do thầy/cô quản lý.');}
  const item=publicQuizCopy(quiz,uid);
  if(isFirebaseConfigured&&db)await setDoc(doc(db,'selfPracticeQuizzes',item.id),item);else localStorage.setItem(key,JSON.stringify([item,...(await this.list(false)).filter(i=>i.id!==item.id)]));
 }
 static async remove(id:string){if(isFirebaseConfigured&&db)await deleteDoc(doc(db,'selfPracticeQuizzes',id));else localStorage.setItem(key,JSON.stringify((await this.list(false)).filter(i=>i.id!==id)));}
}
