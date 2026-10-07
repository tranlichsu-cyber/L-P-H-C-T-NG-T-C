import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { HistoryService } from '../../services/history/HistoryService';
import type { StudentLongitudinalRecord } from '../../services/history/types';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const StudentHistoryPage: React.FC = () => {
  const { classId, studentId } = useParams<{ classId: string; studentId: string }>();
  const navigate = useNavigate();
  const { classes } = useTeacherData();
  const { showToast } = useToast();

  const currentClass = classes.find((c) => c.id === classId);
  const currentStudent = currentClass?.students.find((s) => s.id === studentId);

  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [studentName, setStudentName] = useState<string>(currentStudent?.name || 'Học sinh');
  const [records, setRecords] = useState<StudentLongitudinalRecord[]>([]);
  const [averageAccuracy, setAverageAccuracy] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!classId || !studentId) return;
    setIsLoading(true);

    HistoryService.getStudentLongitudinalHistory(classId, studentId, subjectFilter)
      .then((res) => {
        setStudentName(res.studentName || currentStudent?.name || 'Học sinh');
        setRecords(res.records);
        setAverageAccuracy(res.averageAccuracy);
      })
      .catch(() => showToast('Lỗi khi tải lịch sử học sinh.', 'error'))
      .finally(() => setIsLoading(false));
  }, [classId, studentId, subjectFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/teacher/classes/${classId}`)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title="Quay lại danh sách lớp"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">{currentClass?.name || 'Lớp học'}</Badge>
            <Badge variant="neutral">{currentClass?.grade || 'Khối'}</Badge>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">
            LỊCH SỬ TIẾN BỘ HỌC SINH: {studentName.toUpperCase()}
          </h1>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Số buổi học đã tham gia</span>
          <span className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <BookOpen className="w-6 h-6 text-sky-600" /> {records.length} buổi
          </span>
        </Card>

        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Tỷ lệ chính xác trung bình</span>
          <span
            className={`text-2xl font-black flex items-center gap-2 mt-1 ${
              averageAccuracy >= 80 ? 'text-emerald-600' : averageAccuracy >= 50 ? 'text-amber-600' : 'text-rose-600'
            }`}
          >
            <CheckCircle2 className="w-6 h-6" /> {averageAccuracy}%
          </span>
        </Card>

        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Lọc theo môn học</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full mt-1.5 p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
          >
            <option value="ALL">Tất cả các môn</option>
            <option value="Toán">Toán</option>
            <option value="Tiếng Việt">Tiếng Việt</option>
            <option value="Khoa học">Khoa học</option>
            <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
            <option value="Tin học">Tin học</option>
          </select>
        </Card>
      </div>

      {/* PROGRESS TREND (Lightweight SVG Line Chart) */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-3">
          <TrendingUp className="w-5 h-5 text-sky-600" /> XU HƯỚNG TỶ LỆ ĐÚNG QUA CÁC BUỔI HỌC
        </h3>

        {records.length < 2 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            Cần ít nhất 2 buổi học để hiển thị biểu đồ xu hướng tiến bộ.
          </p>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="h-44 w-full flex items-end gap-6 justify-around pt-6 px-4">
              {records.map((r, idx) => (
                <div key={r.roomId} className="flex-1 flex flex-col items-center gap-2 max-w-[60px]">
                  <span className="text-xs font-black text-sky-700">{r.accuracy}%</span>
                  <div className="w-full bg-slate-200 rounded-t-xl overflow-hidden h-32 flex items-end">
                    <div
                      style={{ height: `${r.accuracy}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        r.accuracy >= 80 ? 'bg-emerald-500' : r.accuracy >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 text-center truncate w-full">
                    B{idx + 1}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 text-center font-medium">
              * Biểu đồ thể hiện phần trăm tỷ lệ làm bài đúng của {studentName} qua từng buổi học
            </p>
          </div>
        )}
      </Card>

      {/* DETAILED SESSIONS TABLE */}
      <Card className="p-0 overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm">
          DANH SÁCH CÁC BUỔI HỌC ĐÃ THAM GIA ({records.length})
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
            <span className="text-xs font-bold">Đang tải lịch sử...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            Chưa có lịch sử học tập được ghi nhận cho học sinh này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Ngày</th>
                  <th className="p-3">Môn học</th>
                  <th className="p-3">Tên bài học / Bộ đề</th>
                  <th className="p-3 text-center">Số câu đúng</th>
                  <th className="p-3 text-center">Tỷ lệ đúng</th>
                  <th className="p-3 text-center">Điểm</th>
                  <th className="p-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {records.map((r) => (
                  <tr key={r.roomId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-600">{r.date}</td>
                    <td className="p-3">
                      <Badge variant="neutral" size="sm">{r.subject}</Badge>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{r.quizTitle}</td>
                    <td className="p-3 text-center font-bold text-emerald-700">
                      {r.correctCount}/{r.totalQuestions}
                    </td>
                    <td className="p-3 text-center font-bold">
                      <span
                        className={
                          r.accuracy >= 80 ? 'text-emerald-600' : r.accuracy >= 50 ? 'text-amber-600' : 'text-rose-600'
                        }
                      >
                        {r.accuracy}%
                      </span>
                    </td>
                    <td className="p-3 text-center font-black text-sky-700">{r.score} đ</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/teacher/history/${r.roomId}`)}
                      >
                        Xem buổi học
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
