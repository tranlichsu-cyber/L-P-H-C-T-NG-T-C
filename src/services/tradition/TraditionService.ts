import { collection, doc, getDoc, getDocs, query, where, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/firebase';
import type { Quiz } from '../../types';
import type { PracticeQuestion } from '../practice/types';
export interface TraditionQuiz { id:string; teacherId:string; title:string; grade:string; questions:PracticeQuestion[]; published:boolean; updatedAt:string; }
export type TraditionQuizContent=Pick<TraditionQuiz,'id'|'title'|'grade'|'questions'>&{passageTitle?:string;passage?:string;passageAttribution?:string;instructions?:string};
const key='tradition-public-quizzes';
export class TraditionService {
 static async list(publicOnly=true):Promise<TraditionQuiz[]> {
  if(isFirebaseConfigured && db){const constraint=publicOnly?where('published','==',true):where('teacherId','==',auth?.currentUser?.uid || '');const snap=await getDocs(query(collection(db,'traditionQuizzes'),constraint));return snap.docs.map(d=>({...d.data(),id:d.id} as TraditionQuiz)).sort((a,b)=>a.title.localeCompare(b.title,'vi'));}
  const items=JSON.parse(localStorage.getItem(key)||'[]') as TraditionQuiz[];return publicOnly?items.filter(q=>q.published):items;
 }
 static async publish(quiz:Quiz){
  if(!quiz.questions.length || quiz.questions.length>200)throw new Error('Bộ câu hỏi cần 1–200 câu.');
  const teacherId=auth?.currentUser?.uid || 'mock-teacher';
  if(isFirebaseConfigured && db){const profile=await getDoc(doc(db,'users',teacherId));if(quiz.teacherId!==teacherId && profile.data()?.role!=='SCHOOL_ADMIN')throw new Error('Chỉ đưa lên bộ câu hỏi do thầy/cô quản lý.');}
  const questions=quiz.questions.map(q=>({id:q.id,type:q.type,content:q.content,...(q.options?{options:q.options}:{}),correctAnswer:q.correctAnswer,explanation:q.explanation || '',points:q.correctPoints ?? 1,caseInsensitive:q.caseInsensitive ?? true,trimWhitespace:q.trimWhitespace ?? true}));
  if(questions.some(q=>!q.content.trim() || !q.correctAnswer.trim()))throw new Error('Cần đủ nội dung và đáp án cho từng câu.');
  const item:TraditionQuiz={id:teacherId+'_'+quiz.id,teacherId,title:quiz.title,grade:quiz.grade,questions,published:true,updatedAt:new Date().toISOString()};
  if(isFirebaseConfigured && db)await setDoc(doc(db,'traditionQuizzes',item.id),item);else{const items=await this.list(false);localStorage.setItem(key,JSON.stringify([...items.filter(q=>q.id!==item.id),item]));}
 }
 static async remove(id:string){if(isFirebaseConfigured && db)await deleteDoc(doc(db,'traditionQuizzes',id));else localStorage.setItem(key,JSON.stringify((await this.list(false)).filter(q=>q.id!==id)));}
}
