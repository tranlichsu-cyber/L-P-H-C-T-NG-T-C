import type { LiveQuestionPublic } from '../../services/realtime/types';
import { choiceIndex } from '../../services/realtime/choiceStatistics';
import { QrQuestionMedia } from './QrQuestionMedia';

/** The same question and choices are visible in both teacher and projector views. */
export function QrQuestionContent({ question, projector = false }: { question?: LiveQuestionPublic; projector?: boolean }) {
  const correct = question?.status === 'RESULT'
    ? choiceIndex(question.options || [], question.correctAnswer, question.type) : -1;
  const Heading = projector ? 'h1' : 'h2';
  return <>
    <Heading className={`qr-question-heading break-words whitespace-pre-wrap font-black ${projector ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'}`}>{question?.content || 'Chờ giáo viên chọn câu hỏi'}</Heading>
    <QrQuestionMedia key={question?.id} media={question?.media} className="qr-question-media" />
    <div className="qr-question-choices grid gap-4 sm:grid-cols-2">
      {question?.options?.map((option, i) => <div key={i} className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-xl font-bold sm:p-5 sm:text-2xl ${i === correct ? 'border-emerald-300 bg-emerald-700' : 'border-indigo-400 bg-indigo-950'}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">{String.fromCharCode(65 + i)}</span>
        <span className="min-w-0 break-words whitespace-pre-wrap">{option}{i === correct && ' ✓'}</span>
      </div>)}
    </div>
    {question?.status === 'RESULT' && question.explanation && <p className="break-words whitespace-pre-wrap rounded-xl bg-slate-800 p-4 text-xl">{question.explanation}</p>}
  </>;
}
