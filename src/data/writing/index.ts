import data from './lessons.json';
import type {WritingLesson} from './types';
export const writingLessons:WritingLesson[]=data;
export function getWritingLesson(quiz:{subject:string;grade:string;title:string;category?:string}):WritingLesson|undefined {
 const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().trim();
 if(norm(quiz.subject)!=='tap lam van'||quiz.category==='EXAM'||!/(?:^|\D)4(?:\D|$)/.test(quiz.grade))return;
 const week=Number(norm(quiz.title).match(/\btuan\s*0*(\d{1,2})(?!\d)/)?.[1]);
 return writingLessons.find(l=>l.week===week);
}
