import type { PracticeQuestion, PracticeResult } from './types';
export const roundPoints = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
export const questionPoints = (q: PracticeQuestion) => Number.isFinite(q.points) && (q.points ?? 0) >= 0 ? q.points! : 1;
export const totalPoints = (questions: PracticeQuestion[]) => roundPoints(questions.reduce((sum,q)=>sum+questionPoints(q),0));
export function distributeTenPoints(questions: PracticeQuestion[]): PracticeQuestion[] {
  if (!questions.length) return [];
  const base=Math.floor(1000/questions.length), remainder=1000%questions.length;
  return questions.map((q,i)=>({...q,points:(base+(i<remainder?1:0))/100}));
}
export function gradePractice(questions: PracticeQuestion[], answers: Record<string,string>): PracticeResult {
  const breakdown=questions.map((q)=>{
    const answer=typeof answers[q.id]==='string'?answers[q.id]:'';
    const normalize=(value:string)=>{
      let text=q.trimWhitespace===false?value:value.trim();
      if(q.caseInsensitive!==false)text=text.toLocaleLowerCase('vi-VN');
      return text.normalize('NFC');
    };
    const optionValue=(value:string)=>{
      const trimmed=value.trim(); const index=/^[A-D]$/i.test(trimmed)?trimmed.toUpperCase().charCodeAt(0)-65:-1;
      return index>=0 && q.options?.[index]!==undefined?q.options[index]:value;
    };
    const isCorrect=Boolean(answer.trim()) && (q.type==='MULTIPLE_CHOICE'
      ? normalize(optionValue(answer))===normalize(optionValue(q.correctAnswer))
      : normalize(answer)===normalize(q.correctAnswer));
    const maxPoints=questionPoints(q);
    return {questionId:q.id,content:q.content,answer,correctAnswer:q.correctAnswer,explanation:q.explanation || '',isCorrect,maxPoints,earnedPoints:isCorrect?maxPoints:0};
  });
  const correctCount=breakdown.filter((q)=>q.isCorrect).length;
  return {score:questions.length?Math.round(correctCount/questions.length*100):0,correctCount,totalCount:questions.length,
    earnedPoints:roundPoints(breakdown.reduce((sum,q)=>sum+q.earnedPoints,0)),maxPoints:totalPoints(questions),breakdown};
}
export function validateTestQuestions(questions: PracticeQuestion[]) {
  if(!questions.length || questions.length>200)throw new Error('Bài kiểm tra cần 1–200 câu hỏi.');
  if(new Set(questions.map((q)=>q.id)).size!==questions.length)throw new Error('Mỗi câu cần mã riêng.');
  if(questions.some((q)=>!Number.isFinite(q.points) || (q.points ?? 0)<=0 || !q.content.trim() || !q.correctAnswer.trim()))throw new Error('Mỗi câu cần nội dung, đáp án và điểm lớn hơn 0.');
  if(questions.some(q=>Math.abs((q.points ?? 0)*100-Math.round((q.points ?? 0)*100))>0.000001))throw new Error('Điểm mỗi câu chỉ được có tối đa 2 chữ số thập phân.');
  if(Math.abs(totalPoints(questions)-10)>0.001)throw new Error('Tổng biểu điểm bài kiểm tra phải bằng 10.');
}
