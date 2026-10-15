import type {SelfPracticeQuiz} from './content';
export const catalogueText=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().trim();

/** Read explicit week labels only; a lesson number or “8 tuần” is not a week assignment. */
export function quizWeeks(title:string):number[]{
 const text=catalogueText(title),weeks=new Set<number>();
 const groups=text.matchAll(/\b(?:tuan|week)\s*[:.]?\s*(\d{1,2})(?!\d)((?:\s*(?:[-–—]|den|toi|,|va|&)\s*(?:(?:tuan|week)\s*)?\d{1,2}(?!\d))*)/g);
 for(const group of groups){
  let previous=Number(group[1]);const found=[previous];let valid=previous>=1&&previous<=35;
  for(const part of group[2].matchAll(/([-–—]|den|toi|,|va|&)\s*(?:(?:tuan|week)\s*)?(\d{1,2})(?!\d)/g)){
   const next=Number(part[2]),range=['-','–','—','den','toi'].includes(part[1]);
   if(next<1||next>35||(range&&next<previous)){valid=false;break;}
   if(range)for(let week=previous+1;week<=next;week++)found.push(week);else found.push(next);
   previous=next;
  }
  if(valid)found.forEach(week=>weeks.add(week));
 }
 return [...weeks].sort((a,b)=>a-b);
}
export function lessonOrder(title:string,kind:'week'|'lesson'){
 if(kind==='week')return quizWeeks(title)[0]??Number.POSITIVE_INFINITY;
 const match=catalogueText(title).match(/\b(?:bai|lesson)\s*[:.\-–]?\s*0*(\d{1,3})(?!\d)/);
 return match?Number(match[1]):Number.POSITIVE_INFINITY;
}
export function catalogueSearch(search:string,values:(string|undefined)[]){
 const text=catalogueText(values.filter(Boolean).join(' '));
 return catalogueText(search).split(/\s+/).filter(Boolean).every(word=>text.includes(word));
}
export function compareQuiz(a:SelfPracticeQuiz,b:SelfPracticeQuiz){
 const common=Number(a.grade.match(/[1-5]/)?.[0]||99)-Number(b.grade.match(/[1-5]/)?.[0]||99)||a.subject.localeCompare(b.subject,'vi');
 if(common)return common;
 const order=(kind:'week'|'lesson')=>{const left=lessonOrder(a.title,kind),right=lessonOrder(b.title,kind);return left===right?0:left<right?-1:1;};
 return (catalogueText(a.subject)==='toan'?(order('lesson')||order('week')):(order('week')||order('lesson')))||a.title.localeCompare(b.title,'vi',{numeric:true});
}
export function withoutRepeatedWritingSets(quizzes:SelfPracticeQuiz[]){
 const unique=new Map<string,SelfPracticeQuiz>(),other:SelfPracticeQuiz[]=[];
 for(const quiz of quizzes){
  const subject=catalogueText(quiz.subject),week=lessonOrder(quiz.title,'week');
  if(subject!=='tap lam van'||!Number.isFinite(week)){other.push(quiz);continue;}
  const key=[quiz.grade.match(/[1-5]/)?.[0]||quiz.grade,subject,quizWeeks(quiz.title).join(','),quiz.category||'PRACTICE'].join(':');
  const old=unique.get(key);
  if(!old||quiz.questions.length>old.questions.length||(quiz.questions.length===old.questions.length&&quiz.updatedAt>old.updatedAt))unique.set(key,quiz);
 }
 return [...other,...unique.values()];
}
