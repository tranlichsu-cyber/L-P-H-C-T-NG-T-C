import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { RemediationEngine } from '../../services/practice/RemediationEngine';
import type { TopicRecommendation } from '../../services/practice/types';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  BookOpen,
  Filter,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export const RemediationHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes } = useTeacherData();
  const { showToast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [timeframeDays, setTimeframeDays] = useState<number>(30);

  const [recommendations, setRecommendations] = useState<TopicRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const fetchRecommendations = async () => {
    if (!currentClass) return;
    setIsLoading(true);
    try {
      const recs = await RemediationEngine.analyzeClassRemediation(currentClass.id, selectedSubject, timeframeDays);
      setRecommendations(recs);
    } catch {
      showToast('Lỗi khi phân tích nội dung cần củng cố.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedClassId, selectedSubject, timeframeDays]);

  const handleCreatePracticeFromTopic = (topicRec: TopicRecommendation) => {
    navigate('/teacher/practice/new', {
      state: {
        classId: currentClass.id,
        className: currentClass.name,
        subject: selectedSubject !== 'ALL' ? selectedSubject : 'Toán',
        grade: currentClass.grade,
        topic: topicRec.topic,
        type: topicRec.recommendationLevel === 'REMEDIATION' ? 'REMEDIATION' : 'PRACTICE',
        suggestedStudentIds: topicRec.suggestedStudents.map((s) => s.id),
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ÔN TẬP & CỦNG CỐ NĂNG LỰC HỌC SINH"
        description="Hệ thống tự động phân tích dữ liệu bài dạy live để gợi ý nội dung cần củng cố và giao bài tập phân hóa theo nhóm"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/teacher/practice')}>
              <BookOpen className="w-4 h-4 mr-1 text-sky-600" /> QUẢN LÝ BÀI ÔN ĐÃ GIAO
            </Button>
            <Button variant="primary" onClick={() => navigate('/teacher/practice/new')}>
              <PlusCircle className="w-4 h-4 mr-1" /> TẠO BÀI ÔN MỚI
            </Button>
          </div>
        }
      />

      {/* FILTER CONTROLS */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b pb-3">
          <Filter className="w-4 h-4 text-sky-600" /> BỘ LỌC DỮ LIỆU PHÂN TÍCH
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
          <div>
            <label className="text-slate-600 block mb-1">Lớp học:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.grade})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Môn học:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="ALL">Tất cả các môn</option>
              <option value="Toán">Toán</option>
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="Khoa học">Khoa học</option>
              <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
              <option value="Tin học">Tin học</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Khoảng thời gian:</label>
            <select
              value={timeframeDays}
              onChange={(e) => setTimeframeDays(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value={7}>7 ngày gần nhất</option>
              <option value={30}>30 ngày gần nhất</option>
              <option value={90}>Tất cả lịch sử học tập</option>
            </select>
          </div>
        </div>
      </Card>

      {/* RECOMMENDATION RESULTS */}
      {isLoading ? (
        <Card className="p-12 text-center text-slate-500 space-y-2">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600" />
          <p className="font-bold text-sm">Đang phân tích kết quả bài học để lập danh sách củng cố...</p>
        </Card>
      ) : recommendations.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <div>
            <h3 className="font-bold text-lg text-slate-800">Không có nội dung nào cần củng cố gấp</h3>
            <p className="text-xs text-slate-500 mt-1">
              Học sinh lớp {currentClass?.name} đã hoàn thành tốt các bài học hoặc chưa có đủ dữ liệu kiểm tra gần đây.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/teacher/practice/new')}>
            <PlusCircle className="w-4 h-4 mr-1" /> TỰ TẠO BÀI ÔN TẬP CHO LỚP
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600 px-1">
            <span>Tìm thấy <strong>{recommendations.length}</strong> nội dung gợi ý ôn tập cho {currentClass?.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {recommendations.map((rec, idx) => (
              <Card key={idx} className="p-6 border-2 border-slate-200 hover:border-sky-400 transition-all space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          rec.recommendationLevel === 'REMEDIATION'
                            ? 'warning'
                            : rec.recommendationLevel === 'PRACTICE'
                            ? 'info'
                            : 'success'
                        }
                      >
                        {rec.recommendationLevel === 'REMEDIATION'
                          ? 'Nên củng cố'
                          : rec.recommendationLevel === 'PRACTICE'
                          ? 'Cần luyện thêm'
                          : 'Đã nắm tốt'}
                      </Badge>
                      <span className="text-xs text-slate-500 font-semibold">{rec.questionCount} câu đã kiểm tra</span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{rec.topic}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{rec.reasonExplanation}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-bold block">Tỷ lệ đúng lớp</span>
                      <span
                        className={`text-2xl font-black ${
                          rec.accuracy >= 80 ? 'text-emerald-600' : rec.accuracy >= 60 ? 'text-amber-600' : 'text-rose-600'
                        }`}
                      >
                        {rec.accuracy}%
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleCreatePracticeFromTopic(rec)}
                      className="font-bold"
                    >
                      <Sparkles className="w-4 h-4 mr-1" /> TẠO BÀI ÔN TẬP NGAY
                    </Button>
                  </div>
                </div>

                {/* SUGGESTED STUDENTS LIST */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Gợi ý nhóm học sinh cần củng cố bài này ({rec.suggestedStudents.length} em):
                  </span>

                  {rec.suggestedStudents.length === 0 ? (
                    <span className="text-xs text-emerald-700 font-bold">✓ Tất cả học sinh đều đạt kết quả tốt bài này!</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {rec.suggestedStudents.map((s) => (
                        <div
                          key={s.id}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950 flex items-center gap-2"
                        >
                          <span>{s.name}</span>
                          <span className="px-1.5 py-0.5 bg-amber-200 rounded text-[10px] text-amber-900 font-black">
                            {s.accuracy}% đúng
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
