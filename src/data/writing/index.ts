import data from './lessons.json';
import type {WritingLesson} from './types';
import type {SelfPracticeQuiz} from '../../services/selfPractice/content';
export const writingLessons:WritingLesson[]=data;
export const weeklyWritingSets:SelfPracticeQuiz[]=writingLessons.map(lesson=>({id:'writing-grade4-week-'+lesson.week,teacherId:'editorial',title:'Tuần '+lesson.week+' – '+lesson.title,grade:'Khối 4',subject:'Tập làm văn',questions:[],published:true,category:'PRACTICE',updatedAt:'2026-10-16'}));
/** Replace legacy grade-four weekly quiz cards with one direct writing assignment per week. */
export function withWeeklyWritingSets(items:SelfPracticeQuiz[]){return [...items.filter(item=>!getWritingLesson(item)),...weeklyWritingSets];}
export function getWritingLesson(quiz:{subject:string;grade:string;title:string;category?:string}):WritingLesson|undefined {
 const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().trim();
 if(norm(quiz.subject)!=='tap lam van'||quiz.category==='EXAM'||!/(?:^|\D)4(?:\D|$)/.test(quiz.grade))return;
 const week=Number(norm(quiz.title).match(/\btuan\s*0*(\d{1,2})(?!\d)/)?.[1]);
 return writingLessons.find(l=>l.week===week);
}
