import type { MockRoomData } from '../realtime/types';
import type {
  RoomSummary,
  QuestionAnalysisStats,
  StudentSessionResult,
  SessionDetailResult,
  DifficultyTag,
} from './types';

export class SessionAnalysisService {
  public static calculateAccuracy(correctCount: number, totalCount: number): number {
    if (totalCount <= 0) return 0;
    return Math.round((correctCount / totalCount) * 100);
  }

  public static getDifficultyTag(accuracy: number): { tag: DifficultyTag; label: string } {
    if (accuracy >= 80) {
      return { tag: 'EXCELLENT', label: 'Đã nắm tốt' };
    } else if (accuracy >= 50) {
      return { tag: 'REINFORCE', label: 'Cần củng cố' };
    } else {
      return { tag: 'NEEDS_SUPPORT', label: 'Cần hỗ trợ thêm' };
    }
  }

  public static generateSessionSummary(
    room: MockRoomData,
    privateQuestions?: Record<string, { correctAnswer: string; explanation?: string }>
  ): RoomSummary {
    const participants = Object.values(room.participants || {});
    const liveQuestions = Object.values(room.liveQuestions || {});
    const submissions = Object.values(room.submissions || {});
    const scores = room.scores || {};

    const participantCount = participants.length || room.roster?.length || 0;
    const questionCount = liveQuestions.length;

    let correctCount = 0;
    let incorrectCount = 0;

    submissions.forEach((sub) => {
      const q = liveQuestions.find((item) => item.id === sub.questionId);
      const cAns = q?.correctAnswer || privateQuestions?.[sub.questionId]?.correctAnswer || '';
      const isCorr = sub.isCorrect ?? (sub.answer.trim().toLowerCase() === cAns.trim().toLowerCase());

      if (isCorr) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const expectedSubmissions = participantCount * questionCount;
    const unansweredCount = Math.max(0, expectedSubmissions - (correctCount + incorrectCount));
    const averageAccuracy = this.calculateAccuracy(correctCount, expectedSubmissions || submissions.length);

    let totalScoreAwarded = 0;
    Object.values(scores).forEach((scoreObj) => {
      totalScoreAwarded += scoreObj.totalScore || scoreObj.score || 0;
    });

    const now = new Date().toISOString();

    return {
      roomId: room.id,
      teacherId: room.teacherId || '',
      classId: room.classId,
      className: room.className,
      subject: room.subject,
      grade: room.grade || '',
      quizId: room.quizId,
      quizTitle: room.quizTitle || 'Bài kiểm tra',
      startedAt: room.createdAt,
      endedAt: room.finishedAt || now,
      participantCount,
      questionCount,
      submissionCount: submissions.length,
      correctCount,
      incorrectCount,
      unansweredCount,
      averageAccuracy,
      totalScoreAwarded,
      createdAt: now,
      archived: room.archived || false,
    };
  }

  public static analyzeSession(
    room: MockRoomData,
    privateQuestions?: Record<string, { correctAnswer: string; explanation?: string }>
  ): SessionDetailResult {
    const summary = this.generateSessionSummary(room, privateQuestions);

    const liveQuestions = Object.values(room.liveQuestions || {});
    const submissions = Object.values(room.submissions || {});
    const participants = Object.values(room.participants || {});

    // Fallback roster if no participants recorded
    const studentList = participants.length > 0
      ? participants.map((p) => ({ id: p.studentId, name: p.name }))
      : (room.roster || []).map((r) => ({ id: r.studentId, name: r.name }));

    // 1. Question Analysis
    const questionStats: QuestionAnalysisStats[] = liveQuestions.map((q) => {
      const qSubmissions = submissions.filter((s) => s.questionId === q.id);
      
      const priv = privateQuestions?.[q.id];
      const correctAnswer = q.correctAnswer || priv?.correctAnswer || '';
      const explanation = q.explanation || priv?.explanation || '';

      let qCorrect = 0;
      let qIncorrect = 0;
      const optionDistribution: Record<string, number> = {};

      qSubmissions.forEach((s) => {
        const rawAns = s.answer ? s.answer.trim() : '';
        optionDistribution[rawAns] = (optionDistribution[rawAns] || 0) + 1;

        const isCorr = s.isCorrect ?? (s.answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase());
        if (isCorr) {
          qCorrect++;
        } else {
          qIncorrect++;
        }
      });

      const qTotal = studentList.length;
      const qUnanswered = Math.max(0, qTotal - qSubmissions.length);
      const accuracy = this.calculateAccuracy(qCorrect, qTotal || 1);
      const diffInfo = this.getDifficultyTag(accuracy);

      return {
        questionId: q.id,
        type: q.type,
        content: q.content,
        options: q.options,
        correctAnswer,
        explanation,
        correctCount: qCorrect,
        incorrectCount: qIncorrect,
        unansweredCount: qUnanswered,
        accuracy,
        difficultyTag: diffInfo.tag,
        difficultyTagLabel: diffInfo.label,
        optionDistribution,
      };
    });

    // 2. Student Results Analysis
    const studentResults: StudentSessionResult[] = studentList.map((std) => {
      const stdSubmissions = submissions.filter((s) => s.studentId === std.id);
      let stdCorrect = 0;
      let stdIncorrect = 0;
      const answers: Record<string, { studentAnswer: string; isCorrect: boolean; correctAnswer: string }> = {};

      liveQuestions.forEach((q) => {
        const sub = stdSubmissions.find((s) => s.questionId === q.id);
        const priv = privateQuestions?.[q.id];
        const cAns = q.correctAnswer || priv?.correctAnswer || 'A';

        if (sub) {
          const isCorr = sub.isCorrect ?? (sub.answer.trim().toLowerCase() === cAns.trim().toLowerCase());
          if (isCorr) stdCorrect++;
          else stdIncorrect++;

          answers[q.id] = {
            studentAnswer: sub.answer || '—',
            isCorrect: isCorr,
            correctAnswer: cAns,
          };
        } else {
          answers[q.id] = {
            studentAnswer: 'Chưa trả lời',
            isCorrect: false,
            correctAnswer: cAns,
          };
        }
      });

      const totalQ = liveQuestions.length || 1;
      const stdUnanswered = Math.max(0, totalQ - stdSubmissions.length);
      const accuracy = this.calculateAccuracy(stdCorrect, totalQ);
      const scoreObj = room.scores?.[std.id];
      const eventScore = Object.values(room.scoreEvents || {})
        .filter((event) => event.studentId === std.id)
        .reduce((sum, event) => sum + (event.points || 0), 0);
      const score =
        scoreObj?.totalScore ??
        scoreObj?.score ??
        eventScore;

      // Logic gợi ý học sinh cần quan tâm thêm (accuracy < 50% hoặc bỏ nhiều hơn 50% số câu)
      const needsSupport = accuracy < 50 || (stdUnanswered / totalQ) >= 0.5;

      return {
        studentId: std.id,
        studentName: std.name,
        correctCount: stdCorrect,
        incorrectCount: stdIncorrect,
        unansweredCount: stdUnanswered,
        accuracy,
        score,
        answers,
        needsSupport,
      };
    });

    const studentsNeedingSupport = studentResults.filter((s) => s.needsSupport);

    return {
      summary,
      questionStats,
      studentResults,
      studentsNeedingSupport,
      topicPerformance: {},
    };
  }
}
