import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Trophy } from 'lucide-react';
import { OrderingAnswer } from '../student/OrderingAnswer';
import { gradePractice } from '../../services/practice/grading';
import type { PracticeResult } from '../../services/practice/types';
import type { TraditionQuizContent } from '../../services/tradition/TraditionService';

export function TraditionQuizRunner({ quiz, onBack, mode='tradition' }: { quiz: TraditionQuizContent; onBack: () => void; mode?:'tradition'|'practice' }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [currentIndex, result]);
  const question = quiz.questions[currentIndex];
  const answered = quiz.questions.filter(q => answers[q.id]?.trim()).length;
  const buttonClass = 'min-h-12 rounded-2xl px-5 py-3 font-bold focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-700';
  const answer = (value: string) => setAnswers(previous => ({ ...previous, [question.id]: value }));

  return <section aria-label={mode==='practice'?'Làm bài tự luyện':'Làm câu hỏi tương tác'} className="mx-auto max-w-3xl space-y-5">
    <button type="button" className={`${buttonClass} flex items-center gap-2 bg-white border-2 border-sky-200 text-sky-900`} onClick={onBack}><ArrowLeft size={20} aria-hidden="true"/>Chọn bộ câu hỏi khác</button>
    <h2 className="text-2xl sm:text-3xl font-black text-sky-950">{quiz.title}</h2>
    {result ? <>
      <div role="status" className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-6 sm:p-8 text-center space-y-3">
        <Trophy className="mx-auto text-amber-600" size={44} aria-hidden="true"/>
        <h3 ref={heading} tabIndex={-1} className="text-2xl font-black outline-none">Em đã hoàn thành!</h3>
        {mode==='practice'&&<p className="text-2xl font-black">Điểm tự luyện: {result.maxPoints?Math.round(result.earnedPoints/result.maxPoints*100)/10:0}/10</p>}
        <p className="text-xl font-bold text-emerald-900">Em trả lời đúng {result.correctCount}/{result.totalCount} câu</p>
        <p className="text-lg">{result.correctCount === result.totalCount ? (mode==='practice'?'Rất tốt! Em hãy tiếp tục luyện tập nhé.':'Rất tốt! Em hãy tiếp tục khám phá quê hương nhé.') : (mode==='practice'?'Em hãy xem lời giải và thử lại nhé.':'Em hãy xem lời giải để hiểu thêm về quê hương nhé.')}</p>
        <button type="button" className={`${buttonClass} inline-flex gap-2 items-center bg-sky-700 text-white hover:bg-sky-800`} onClick={() => { setAnswers({}); setCurrentIndex(0); setResult(null); }}><RotateCcw size={20} aria-hidden="true"/>Làm lại</button>
      </div>
      <h3 className="text-xl font-bold">Cùng xem lại đáp án</h3>
      {quiz.questions.map((q, index) => <details key={q.id} className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-lg font-bold leading-relaxed">Câu {index + 1}. {q.content} <span className={result.breakdown[index].isCorrect ? 'text-emerald-800' : 'text-amber-900'}>{result.breakdown[index].isCorrect ? ' — Đúng' : ' — Cần xem lại'}</span></summary>
        <div className="mt-3 space-y-2 text-lg leading-relaxed"><p>Em chọn: {answers[q.id] || 'Chưa trả lời'}</p><p className="font-bold text-emerald-900">Đáp án: {q.correctAnswer}</p>{q.explanation && <p>{q.explanation}</p>}</div>
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
        {(question.type === 'SHORT_ANSWER' || question.type === 'FILL_BLANK') && <label className="block text-lg font-bold">Câu trả lời của em<input className="mt-2 block w-full rounded-2xl border-2 border-sky-200 p-4 font-normal focus:outline-sky-700" value={answers[question.id] || ''} onChange={event => answer(event.target.value)}/></label>}
        <p className="text-base text-slate-600">{answers[question.id]?.trim() ? 'Em có thể đổi câu trả lời trước khi xem kết quả.' : 'Em hãy chọn hoặc nhập câu trả lời, rồi sang câu tiếp theo.'}</p>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <button type="button" disabled={currentIndex === 0} className={`${buttonClass} flex gap-2 items-center bg-white border-2 border-slate-200 disabled:opacity-40`} onClick={() => setCurrentIndex(index => index - 1)}><ArrowLeft size={20} aria-hidden="true"/>Câu trước</button>
        {currentIndex < quiz.questions.length - 1 ? <button type="button" disabled={!answers[question.id]?.trim()} className={`${buttonClass} flex gap-2 items-center bg-sky-700 text-white hover:bg-sky-800 disabled:bg-slate-200 disabled:text-slate-500`} onClick={() => setCurrentIndex(index => index + 1)}>Câu tiếp theo<ArrowRight size={20} aria-hidden="true"/></button> : <button type="button" disabled={answered !== quiz.questions.length} className={`${buttonClass} bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-500`} onClick={() => setResult(gradePractice(quiz.questions, answers))}>Xem kết quả</button>}
      </div>
    </> : <p>Bộ câu hỏi đang được chuẩn bị.</p>}
  </section>;
}
