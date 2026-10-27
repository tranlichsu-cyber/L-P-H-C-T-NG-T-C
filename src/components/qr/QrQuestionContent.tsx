import type { LiveQuestionPublic, MockSubmission } from '../../services/realtime/types';
import { choiceIndex, countChoices } from '../../services/realtime/choiceStatistics';
import { QrQuestionMedia } from './QrQuestionMedia';

/** The same question and choices are visible in both teacher and projector views. */
export function QrQuestionContent({
  question,
  projector = false,
  submissions = [],
  showGraph = false,
}: {
  question?: LiveQuestionPublic;
  projector?: boolean;
  submissions?: MockSubmission[];
  showGraph?: boolean;
}) {
  const isResult = question?.status === 'RESULT';
  const correct = isResult
    ? choiceIndex(question.options || [], question.correctAnswer, question.type)
    : -1;
  const counts = countChoices(
    question?.options || [],
    submissions,
    question?.type || 'MULTIPLE_CHOICE'
  );
  const totalAnswered = submissions.length;
  const displayGraph = showGraph || isResult;
  const Heading = projector ? 'h1' : 'h2';

  return (
    <>
      <Heading
        className={`qr-question-heading break-words whitespace-pre-wrap font-black ${
          projector ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'
        }`}
      >
        {question?.content || 'Chờ giáo viên chọn câu hỏi'}
      </Heading>
      <QrQuestionMedia key={question?.id} media={question?.media} className="qr-question-media" />
      <div className="qr-question-choices grid gap-4 sm:grid-cols-2">
        {question?.options?.map((option, i) => {
          const count = counts[i] || 0;
          const pct = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0;
          const isCorrectChoice = i === correct;
          return (
            <div
              key={i}
              className={`relative overflow-hidden flex flex-col justify-between gap-3 rounded-2xl border-2 p-4 text-xl font-bold sm:p-5 sm:text-2xl ${
                isCorrectChoice
                  ? 'border-emerald-300 bg-emerald-700'
                  : 'border-indigo-400 bg-indigo-950'
              }`}
            >
              {displayGraph && totalAnswered > 0 && (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-0 left-0 transition-all duration-500 ${
                    isCorrectChoice ? 'bg-emerald-500/35' : 'bg-indigo-500/30'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex w-full items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0 break-words whitespace-pre-wrap">
                    {option}
                    {isCorrectChoice && ' ✓'}
                  </span>
                </div>
                {displayGraph && (
                  <span className="shrink-0 rounded-xl bg-black/30 px-3 py-1 text-base font-extrabold text-amber-200 sm:text-lg">
                    {count} ({pct}%)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {isResult && question.explanation && (
        <p className="break-words whitespace-pre-wrap rounded-xl bg-slate-800 p-4 text-xl">
          {question.explanation}
        </p>
      )}
    </>
  );
}
