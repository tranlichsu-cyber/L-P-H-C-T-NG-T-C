import { HistoryService } from '../history/HistoryService';
import type { TopicRecommendation } from './types';

export class RemediationEngine {
  // Configurable thresholds for pedagogy rules
  public static readonly MIN_QUESTIONS_FOR_RECOMMENDATION = 2;
  public static readonly MASTERY_THRESHOLD = 80;
  public static readonly PRACTICE_THRESHOLD = 60;

  public static getRecommendationLevel(accuracy: number): {
    level: 'REMEDIATION' | 'PRACTICE' | 'MASTERY';
    label: string;
  } {
    if (accuracy >= this.MASTERY_THRESHOLD) {
      return { level: 'MASTERY', label: 'Đã nắm tốt' };
    } else if (accuracy >= this.PRACTICE_THRESHOLD) {
      return { level: 'PRACTICE', label: 'Cần luyện thêm một chút' };
    } else {
      return { level: 'REMEDIATION', label: 'Nên củng cố nội dung này' };
    }
  }

  public static async analyzeClassRemediation(
    classId: string,
    subject: string = 'ALL',
    daysLimit?: number
  ): Promise<TopicRecommendation[]> {
    const { summaries } = await HistoryService.getHistoryList({ classId, subject, showArchived: false, sortBy: 'newest' }, 1, 50);

    let filteredSummaries = summaries;
    if (daysLimit) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysLimit);
      const cutoffStr = cutoffDate.toISOString();
      filteredSummaries = summaries.filter((s) => s.startedAt >= cutoffStr);
    }

    if (filteredSummaries.length === 0) {
      return [];
    }

    // Map: Topic / QuizTitle -> Stats
    const topicStatsMap: Record<
      string,
      {
        topic: string;
        totalCorrect: number;
        totalSubmissions: number;
        questionCount: number;
        studentMap: Record<string, { id: string; name: string; correct: number; total: number }>;
      }
    > = {};

    for (const summary of filteredSummaries) {
      const detail = await HistoryService.getSessionDetail(summary.roomId);
      if (!detail) continue;

      const topicKey = summary.quizTitle || summary.subject;

      if (!topicStatsMap[topicKey]) {
        topicStatsMap[topicKey] = {
          topic: topicKey,
          totalCorrect: 0,
          totalSubmissions: 0,
          questionCount: 0,
          studentMap: {},
        };
      }

      const item = topicStatsMap[topicKey];
      item.questionCount += summary.questionCount;
      item.totalCorrect += summary.correctCount;
      item.totalSubmissions += summary.submissionCount || (summary.participantCount * summary.questionCount);

      detail.studentResults.forEach((std) => {
        if (!item.studentMap[std.studentId]) {
          item.studentMap[std.studentId] = { id: std.studentId, name: std.studentName, correct: 0, total: 0 };
        }
        item.studentMap[std.studentId].correct += std.correctCount;
        item.studentMap[std.studentId].total += summary.questionCount;
      });
    }

    const recommendations: TopicRecommendation[] = [];

    Object.values(topicStatsMap).forEach((st) => {
      if (st.questionCount < this.MIN_QUESTIONS_FOR_RECOMMENDATION) {
        return; // Skip topics with insufficient questions data
      }

      const accuracy = st.totalSubmissions > 0 ? Math.round((st.totalCorrect / st.totalSubmissions) * 100) : 0;
      const recInfo = this.getRecommendationLevel(accuracy);

      const suggestedStudents = Object.values(st.studentMap)
        .map((s) => {
          const stdAcc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
          return { id: s.id, name: s.name, accuracy: stdAcc };
        })
        .filter((s) => s.accuracy < this.MASTERY_THRESHOLD)
        .sort((a, b) => a.accuracy - b.accuracy);

      recommendations.push({
        topic: st.topic,
        accuracy,
        questionCount: st.questionCount,
        suggestedStudents,
        recommendationLevel: recInfo.level,
        reasonExplanation: `Gợi ý dựa trên kết quả ${st.questionCount} câu hỏi đã thực hiện, tỷ lệ hoàn thành đúng trung bình đạt ${accuracy}%.`,
      });
    });

    return recommendations.sort((a, b) => a.accuracy - b.accuracy);
  }
}
