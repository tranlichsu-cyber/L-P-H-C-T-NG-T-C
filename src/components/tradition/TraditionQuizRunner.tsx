import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Trophy } from 'lucide-react';
import { OrderingAnswer } from '../student/OrderingAnswer';
import { gradePractice } from '../../services/practice/grading';
import type { PracticeResult } from '../../services/practice/types';
import type { TraditionQuizContent } from '../../services/tradition/TraditionService';

export function TraditionQuizRunner({ quiz, onBack, mode='tradition', durationMinutes, onComplete }: { quiz: TraditionQuizContent; onBack: () => void; mode?:'tradition'|'practice'; durationMinutes?:number; onComplete?:(answers:Record<string,string>)=>void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const exam = mode==='practice' && typeof durationMinutes==='number' && durationMinutes>0;
  const [deadline,setDeadline] = useState(() => Date.now() + (durationMinutes || 0)*60000);
  const [secondsLeft,setSecondsLeft] = useState(() => Math.max(0,Math.ceil((deadline-Date.now())/1000)));
  const [expired,setExpired] = useState(false);
  const deliveredResult=useRef<PracticeResult|null>(null);
  useEffect(()=>{if(result&&deliveredResult.current!==result){deliveredResult.current=result;onComplete?.({...answers});}},[result,answers,onComplete]);
  useEffect(() => {if(!exam||result)return;const tick=()=>{const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));setSecondsLeft(left);if(left===0){setExpired(true);setResult(previous=>previous??gradePractice(quiz.questions,answers));}};tick();const timer=window.setInterval(tick,500);return()=>window.clearInterval(timer);},[exam,deadline,result,answers,quiz.questions]);
  const submit = () => {if(!result)setResult(gradePractice(quiz.questions,answers));};
  useEffect(() => { heading.current?.focus(); }, [currentIndex, result]);
  const question = quiz.questions[currentIndex];
  const answered = quiz.questions.filter(q => answers[q.id]?.trim()).length;
  const buttonClass = 'min-h-12 rounded-2xl px-5 py-3 font-bold focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-700';
  const answer = (value: string) => setAnswers(previous => ({ ...previous, [question.id]: value }));

  return <section aria-label={mode==='practice'?'Làm bài tự luyện':'Làm câu hỏi tương tác'} className="mx-auto max-w-3xl space-y-5">
    <button type="button" className={`${buttonClass} flex items-center gap-2 bg-white border-2 border-sky-200 text-sky-900`} onClick={onBack}><ArrowLeft size={20} aria-hidden="true"/>Chọn bộ câu hỏi khác</button>
    <h2 className="text-2xl sm:text-3xl font-black text-sky-950">{quiz.title}</h2>
    {quiz.instructions&&<p className="rounded-xl bg-sky-50 p-4 text-sm leading-6">{quiz.instructions}</p>}
    {quiz.passage&&!result&&<details open className="rounded-2xl border-2 border-violet-200 bg-white p-5"><summary className="cursor-pointer text-xl font-black text-violet-900">Bài đọc: {quiz.passageTitle||'Đọc văn bản'}</summary><div className="mt-4 space-y-4 text-lg leading-8">{quiz.passage.split('\n\n').map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>{quiz.passageAttribution&&<p className="mt-4 text-sm italic">{quiz.passageAttribution}</p>}</details>}
    {exam&&!result&&<div role="timer" aria-label="Thời gian còn lại" className={`rounded-2xl p-4 text-xl font-black ${secondsLeft<=60?'bg-red-100 text-red-900':'bg-amber-100 text-amber-950'}`}>⏳ Còn lại: {String(Math.floor(secondsLeft/60)).padStart(2,'0')}:{String(secondsLeft%60).padStart(2,'0')}</div>}
    {result ? <>
      <div role="status" className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-6 sm:p-8 text-center space-y-3">
        <Trophy className="mx-auto text-amber-600" size={44} aria-hidden="true"/>
        <h3 ref={heading} tabIndex={-1} className="text-2xl font-black outline-none">{expired?'Đã hết giờ! Bài được tự động nộp.':'Em đã hoàn thành!'}</h3>
        {mode==='practice'&&(result.pendingReview?<><p className="text-xl font-black">Điểm phần tự chấm: {result.earnedPoints}/{Math.round((result.maxPoints-(result.pendingPoints||0))*100)/100}</p><p className="font-bold text-amber-900">Còn {result.pendingPoints} điểm tự luận cần giáo viên xem. Đây chưa phải điểm toàn bài và chưa cộng vào điểm tích lũy.</p></>:<p className="text-2xl font-black">Điểm tự luyện: {result.maxPoints?Math.round(result.earnedPoints/result.maxPoints*100)/10:0}/10</p>)}
        <p className="text-xl font-bold text-emerald-900">Em trả lời đúng {result.correctCount}/{result.breakdown.filter(q=>!q.pendingReview).length} câu tự chấm</p>
        <p className="text-lg">{result.correctCount === result.totalCount ? (mode==='practice'?'Rất tốt! Em hãy tiếp tục luyện tập nhé.':'Rất tốt! Em hãy tiếp tục khám phá quê hương nhé.') : (mode==='practice'?'Em hãy xem lời giải và thử lại nhé.':'Em hãy xem lời giải để hiểu thêm về quê hương nhé.')}</p>
        <button type="button" className={`${buttonClass} inline-flex gap-2 items-center bg-sky-700 text-white hover:bg-sky-800`} onClick={() => { setAnswers({}); setCurrentIndex(0); setResult(null); setExpired(false); const end=Date.now()+(durationMinutes||0)*60000;setDeadline(end);setSecondsLeft(Math.ceil((end-Date.now())/1000)); }}><RotateCcw size={20} aria-hidden="true"/>Làm lại</button>
      </div>
      <h3 className="text-xl font-bold">Cùng xem lại đáp án</h3>
      {quiz.questions.map((q, index) => <details key={q.id} className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-lg font-bold leading-relaxed">Câu {index + 1}. {q.content} <span className={result.breakdown[index].isCorrect ? 'text-emerald-800' : 'text-amber-900'}>{result.breakdown[index].pendingReview?' — Chờ giáo viên xem':result.breakdown[index].isCorrect ? ' — Đúng' : ' — Cần xem lại'}</span></summary>
        <div className="mt-3 space-y-2 text-lg leading-relaxed"><p className="whitespace-pre-wrap break-words">Bài làm: {answers[q.id] || 'Chưa trả lời'}</p><p className="font-bold text-emerald-900 whitespace-pre-wrap">{q.reviewMode==='TEACHER'?'Gợi ý trả lời / hướng dẫn xem bài:':'Đáp án:'} {q.correctAnswer}</p>{q.explanation && <p>{q.explanation}</p>}</div>
      </details>)}
    </> : question ? <>
      <div className="rounded-2xl bg-white border-2 border-sky-100 p-4 space-y-2">
        <div className="flex justify-between gap-3 text-base font-bold text-sky-900"><p aria-live="polite">Câu {currentIndex + 1}/{quiz.questions.length}</p><p>Đã trả lời {answered} câu</p></div>
        <progress aria-label="Tiến độ trả lời" value={answered} max={quiz.questions.length} className="w-full h-3 accent-emerald-600"/>
      </div>
      <div className="rounded-3xl border-2 border-sky-200 bg-white p-5 sm:p-8 shadow-sm space-y-5">
        <h3 ref={heading} tabIndex={-1} className="text-xl sm:text-2xl font-bold leading-relaxed whitespace-pre-wrap outline-none">{question.content}</h3>
        {(question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') && <fieldset className="grid sm:grid-cols-2 gap-3"><legend className="sr-only">Chọn một câu trả lời</legend>
          {(question.type === 'TRUE_FALSE' ? ['Đúng', 'Sai'] : question.options || []).map((option, index) => <label key={index} className={`relative min-h-20 cursor-pointer rounded-2xl border-2 p-4 flex items-center gap-3 text-lg leading-relaxed focus-within:ring-4 focus-within:ring-sky-300 ${answers[question.id] === option ? 'bg-sky-100 border-sky-700 text-sky-950' : 'border-slate-200 hover:bg-sky-50 hover:border-sky-400'}`}>
            <input className="sr-only" type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => answer(option)}/>
            <span aria-hidden="true" className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black ${answers[question.id] === option ? 'bg-sky-700 text-white' : 'bg-sky-50 text-sky-900'}`}>{String.fromCharCode(65 + index)}</span><span>{option}</span>{answers[question.id] === option && <Check size={20} className="shrink-0 ml-auto" aria-hidden="true"/>}
          </label>)}
        </fieldset>}
        {question.type === 'ORDERING' && <OrderingAnswer key={question.id} options={question.options || []} value={answers[question.id] || ''} onChange={answer}/>}
        {question.reviewMode==='TEACHER'?<label className="block text-lg font-bold">Bài tự luận của em<textarea rows={7} maxLength={6000} className="mt-2 block w-full rounded-2xl border-2 border-sky-200 p-4 font-normal leading-8 focus:outline-sky-700" value={answers[question.id]||''} onChange={event=>answer(event.target.value)} placeholder="Em trình bày câu trả lời hoặc các bước giải ở đây…"/><span className="mt-2 block text-sm font-normal text-slate-600">Phần này dành cho giáo viên xem, không đối chiếu máy móc từng chữ với đáp án mẫu.</span></label>:(question.type === 'SHORT_ANSWER' || question.type === 'FILL_BLANK') && <label className="block text-lg font-bold">Câu trả lời của em<input maxLength={1000} className="mt-2 block w-full rounded-2xl border-2 border-sky-200 p-4 font-normal focus:outline-sky-700" value={answers[question.id] || ''} onChange={event => answer(event.target.value)}/></label>}
        <p className="text-base text-slate-600">{answers[question.id]?.trim() ? 'Em có thể đổi câu trả lời trước khi xem kết quả.' : 'Em hãy chọn hoặc nhập câu trả lời, rồi sang câu tiếp theo.'}</p>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <button type="button" disabled={currentIndex === 0} className={`${buttonClass} flex gap-2 items-center bg-white border-2 border-slate-200 disabled:opacity-40`} onClick={() => setCurrentIndex(index => index - 1)}><ArrowLeft size={20} aria-hidden="true"/>Câu trước</button>
        {currentIndex < quiz.questions.length - 1 ? <button type="button" disabled={!exam&&!answers[question.id]?.trim()} className={`${buttonClass} flex gap-2 items-center bg-sky-700 text-white hover:bg-sky-800 disabled:bg-slate-200 disabled:text-slate-500`} onClick={() => setCurrentIndex(index => index + 1)}>Câu tiếp theo<ArrowRight size={20} aria-hidden="true"/></button> : <button type="button" disabled={!exam&&answered !== quiz.questions.length} className={`${buttonClass} bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-500`} onClick={submit}>{exam?'Nộp bài':'Xem kết quả'}</button>}
        {exam&&<button type="button" onClick={submit} className={`${buttonClass} bg-amber-500 text-slate-950 hover:bg-amber-400`}>Nộp bài ngay ({answered}/{quiz.questions.length} câu)</button>}
      </div>
    </> : <p>Bộ câu hỏi đang được chuẩn bị.</p>}
  </section>;
}
