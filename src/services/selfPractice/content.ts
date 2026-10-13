import type {Quiz} from '../../types';
import type {PracticeQuestion} from '../practice/types';
export interface SelfPracticeQuiz {id:string;teacherId:string;title:string;grade:string;subject:string;questions:PracticeQuestion[];published:true;updatedAt:string;category?:'PRACTICE'|'EXAM'}
export function publicQuizCopy(quiz:Quiz,teacherId:string,category:'PRACTICE'|'EXAM'='PRACTICE'):SelfPracticeQuiz{
 if(!teacherId)throw new Error('Cần đăng nhập tài khoản giáo viên.');
 if(!quiz.title.trim()||!quiz.subject.trim()||!/[1-5]/.test(quiz.grade))throw new Error('Bộ đề cần tiêu đề, môn học và lớp 1–5.');
 if(!quiz.questions.length||quiz.questions.length>200)throw new Error('Bộ đề cần 1–200 câu hỏi.');
 const types=['MULTIPLE_CHOICE','TRUE_FALSE','SHORT_ANSWER','FILL_BLANK','ORDERING'];
 const questions:PracticeQuestion[]=quiz.questions.map(q=>({id:q.id,type:q.type,content:q.content.trim(),...(q.options?{options:q.options.map(o=>o.trim())}:{}),correctAnswer:q.correctAnswer.trim(),explanation:q.explanation||'',points:1,caseInsensitive:q.caseInsensitive??true,trimWhitespace:q.trimWhitespace??true}));
 if(new Set(questions.map(q=>q.id)).size!==questions.length)throw new Error('Mã câu hỏi bị trùng.');
 for(const q of questions){
  if(!q.id||!types.includes(q.type)||!q.content||!q.correctAnswer)throw new Error('Câu hỏi chưa đủ nội dung hoặc đáp án.');
  if(q.type==='MULTIPLE_CHOICE'){
   if(q.options?.length!==4||q.options.some(o=>!o)||new Set(q.options).size!==4)throw new Error('Mỗi câu trắc nghiệm cần 4 đáp án khác nhau.');
   if(!q.options.includes(q.correctAnswer)&&!/^[A-D]$/i.test(q.correctAnswer))throw new Error('Đáp án trắc nghiệm không hợp lệ.');
  }
  if(q.type==='TRUE_FALSE'&&!['Đúng','Sai'].includes(q.correctAnswer))throw new Error('Đáp án đúng/sai cần là Đúng hoặc Sai.');
  if(q.type==='ORDERING'&&(!q.options?.length||q.options.some(o=>!o)))throw new Error('Câu sắp xếp cần các mục để chọn.');
 }
 return {id:teacherId+'_'+quiz.id,teacherId,title:quiz.title.trim(),grade:quiz.grade.trim(),subject:quiz.subject.trim(),questions,published:true,category,updatedAt:new Date().toISOString()};
}
export const matchesGrade=(grade:string,choice:string)=>!choice||(grade.match(/[1-5]/g)?.some(n=>n===choice)??false);
