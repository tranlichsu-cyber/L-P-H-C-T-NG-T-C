import {curatedTraditionQuizzes} from '../../data/traditionQuizzes';
import {onAuthStateChanged} from 'firebase/auth';
import {createReadCache} from '../data/readEfficiency';
import {collection,doc,getDoc,getDocs,query,where,setDoc,deleteDoc} from 'firebase/firestore';
import {auth,db,isFirebaseConfigured} from '../firebase/firebase';
import type {Quiz} from '../../types';
import {publicQuizCopy,type SelfPracticeQuiz} from './content';
const key='self-practice-public-quizzes';
const bankSetup=new Map<string,Promise<void>>();
const listCache=createReadCache<SelfPracticeQuiz[]>(120000);
if(auth)onAuthStateChanged(auth,()=>listCache.clear());
export class SelfPracticeService{
 static async ensureRewardBanks(){
  const uid=auth?.currentUser?.uid;if(!isFirebaseConfigured||!db||!uid||auth?.currentUser?.isAnonymous)return;
  const pending=bankSetup.get(uid);if(pending)return pending;
  const operation=(async()=>{const firestore=db!;for(let offset=0;offset<curatedTraditionQuizzes.length;offset+=30){const items=curatedTraditionQuizzes.slice(offset,offset+30),existing=await getDocs(query(collection(firestore,'selfPracticeQuizzes'),where('published','==',true),where('id','in',items.map(q=>q.id))));const ids=new Set(existing.docs.map(d=>d.id));for(const q of items.filter(q=>!ids.has(q.id)))await setDoc(doc(firestore,'selfPracticeQuizzes',q.id),{id:q.id,teacherId:uid,title:q.title,grade:q.grade,subject:'Giáo dục địa phương',questions:q.questions,published:true,updatedAt:'2026-10-13'});}listCache.clear();})();
  bankSetup.set(uid,operation);try{await operation;}catch(error){bankSetup.delete(uid);throw error;}
 }

 static async list(publicOnly=true,forceRefresh=false):Promise<SelfPracticeQuiz[]>{
  if(isFirebaseConfigured&&db){const firestore=db,uid=auth?.currentUser?.uid||'';return listCache.read(publicOnly?'public':'teacher:'+uid,async()=>{const snap=await getDocs(query(collection(firestore,'selfPracticeQuizzes'),publicOnly?where('published','==',true):where('teacherId','==',uid)));return snap.docs.map(d=>({...d.data(),id:d.id} as SelfPracticeQuiz)).sort((a,b)=>a.title.localeCompare(b.title,'vi'));},forceRefresh);}
  const items=JSON.parse(localStorage.getItem(key)||'[]') as SelfPracticeQuiz[];return items.filter(i=>publicOnly?i.published:i.teacherId===(auth?.currentUser?.uid||'mock-teacher'));
 }
 static async publish(quiz:Quiz,category:'PRACTICE'|'EXAM'='PRACTICE',durationMinutes=30){
  const uid=auth?.currentUser?.uid||(isFirebaseConfigured?'':'mock-teacher');
  if(isFirebaseConfigured&&db&&quiz.teacherId!==uid){const profile=await getDoc(doc(db,'users',uid));if(profile.data()?.role!=='SCHOOL_ADMIN')throw new Error('Chỉ công khai bộ đề do thầy/cô quản lý.');}
  const item=publicQuizCopy(quiz,uid,category,durationMinutes);
  if(isFirebaseConfigured&&db){await setDoc(doc(db,'selfPracticeQuizzes',item.id),item);listCache.clear();}else localStorage.setItem(key,JSON.stringify([item,...(await this.list(false)).filter(i=>i.id!==item.id)]));
 }
 static async remove(id:string){if(isFirebaseConfigured&&db){await deleteDoc(doc(db,'selfPracticeQuizzes',id));listCache.clear();}else localStorage.setItem(key,JSON.stringify((await this.list(false)).filter(i=>i.id!==id)));}
}
