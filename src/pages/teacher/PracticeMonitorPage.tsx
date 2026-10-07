import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PracticeService } from '../../services/practice/PracticeService';
import type { PracticeSet, PracticeAssignment } from '../../services/practice/types';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Award,
  Edit,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const PracticeMonitorPage: React.FC = () => {
  const { practiceSetId } = useParams<{ practiceSetId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStudentAssignment, setSelectedStudentAssignment] = useState<PracticeAssignment | null>(null);

  useEffect(() => {
    if (!practiceSetId) return;
    setIsLoading(true);
    PracticeService.getPracticeSetDetail(practiceSetId)
      .then((set) => {
        if (set) {
          setPracticeSet(set);
        } else {
          showToast('Không tìm thấy bài ôn tập này.', 'error');
        }
      })
      .catch(() => showToast('Lỗi khi tải chi tiết bài ôn tập.', 'error'))
      .finally(() => setIsLoading(false));
  }, [practiceSetId]);

  if (isLoading) {
    return (
      <Card className="p-12 text-center text-slate-500 space-y-2">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-600" />
        <p className="font-bold text-sm">Đang tải tiến độ bài ôn tập...</p>
      </Card>
    );
  }

  if (!practiceSet) {
    return (
      <Card className="p-12 text-center space-y-4">
        <h3 className="font-bold text-lg text-slate-800">Không tìm thấy bài ôn tập</h3>
        <Button variant="outline" onClick={() => navigate('/teacher/practice')}>
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const assignmentsList = Object.values(practiceSet.assignments || {});
  const totalAssigned = assignmentsList.length;
  const completedList = assignmentsList.filter((a) => a.status === 'COMPLETED');
  const inProgressCount = assignmentsList.filter((a) => a.status === 'IN_PROGRESS').length;
  const notStartedCount = assignmentsList.filter((a) => a.status === 'NOT_STARTED').length;

  const totalScoreAcc = completedList.reduce((acc, a) => acc + (a.score || 0), 0);
  const avgAccuracy = completedList.length > 0 ? Math.round(totalScoreAcc / completedList.length) : 0;

  const handleExportExcel = () => {
    const data = assignmentsList.map((a, idx) => ({
      STT: idx + 1,
      'Họ và tên': a.studentName,
      'Trạng thái': a.status === 'COMPLETED' ? 'Đã hoàn thành' : a.status === 'IN_PROGRESS' ? 'Đang làm' : 'Chưa làm',
      'Số câu đúng': a.correctCount !== undefined ? `${a.correctCount}/${practiceSet.questions.length}` : '—',
      'Tỷ lệ đúng (%)': a.score !== undefined ? `${a.score}%` : '—',
      'Thời gian hoàn thành': a.completedAt ? new Date(a.completedAt).toLocaleDateString('vi-VN') : '—',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Ket_qua_On_tap');
    XLSX.writeFile(wb, `Ket_qua_${practiceSet.className}_${practiceSet.subject}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/teacher/practice')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Quay lại Danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{practiceSet.className}</Badge>
              <Badge variant="neutral">Môn {practiceSet.subject}</Badge>
              <Badge variant={practiceSet.type === 'REMEDIATION' ? 'warning' : 'info'}>
                {practiceSet.type === 'REMEDIATION' ? 'Củng cố' : 'Luyện tập'}
              </Badge>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1">{practiceSet.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="font-bold text-emerald-800">
            <FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-600" /> Xuất Excel
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/teacher/practice/${practiceSet.id}/edit`)}>
            <Edit className="w-4 h-4 mr-1" /> Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Đã giao cho</span>
          <span className="text-2xl font-black text-slate-900 flex items-center gap-1.5 mt-1">
            <Users className="w-6 h-6 text-sky-600" /> {totalAssigned} em
          </span>
        </Card>

        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Đã hoàn thành</span>
          <span className="text-2xl font-black text-emerald-600 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-6 h-6" /> {completedList.length}/{totalAssigned}
          </span>
        </Card>

        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Chưa làm / Đang làm</span>
          <span className="text-2xl font-black text-amber-600 flex items-center gap-1.5 mt-1">
            <Clock className="w-6 h-6" /> {notStartedCount + inProgressCount} em
          </span>
        </Card>

        <Card className="p-4 border-2 border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 block">Tỷ lệ đúng TB nhóm</span>
          <span className="text-2xl font-black text-indigo-600 flex items-center gap-1.5 mt-1">
            <Award className="w-6 h-6" /> {avgAccuracy}%
          </span>
        </Card>
      </div>

      {/* PROGRESS TABLE */}
      <Card className="p-0 overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-50 border-b font-bold text-slate-900 text-sm">
          TIẾN ĐỘ VÀ KẾT QUẢ BÀI LÀM CỦA HỌC SINH ({assignmentsList.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b">
              <tr>
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3">Họ và tên học sinh</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-center">Số câu đúng</th>
                <th className="p-3 text-center">Tỷ lệ đúng</th>
                <th className="p-3 text-center">Điểm số</th>
                <th className="p-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {assignmentsList.map((a, idx) => (
                <tr key={a.studentId} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-900">{a.studentName}</td>
                  <td className="p-3 text-center">
                    <Badge
                      variant={
                        a.status === 'COMPLETED' ? 'success' : a.status === 'IN_PROGRESS' ? 'warning' : 'neutral'
                      }
                      size="sm"
                    >
                      {a.status === 'COMPLETED' ? 'Đã hoàn thành' : a.status === 'IN_PROGRESS' ? 'Đang làm' : 'Chưa làm'}
                    </Badge>
                  </td>
                  <td className="p-3 text-center font-bold text-emerald-700">
                    {a.correctCount !== undefined ? `${a.correctCount}/${practiceSet.questions.length}` : '—'}
                  </td>
                  <td className="p-3 text-center font-bold">
                    {a.score !== undefined ? `${a.score}%` : '—'}
                  </td>
                  <td className="p-3 text-center font-black text-sky-700">
                    {a.score !== undefined ? `${a.score} đ` : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedStudentAssignment(a)}
                      className="px-2.5 py-1 bg-sky-100 text-sky-800 hover:bg-sky-200 rounded-lg font-bold transition-all inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Bài làm
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* STUDENT DETAIL RESPONSES MODAL */}
      {selectedStudentAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">{selectedStudentAssignment.studentName}</h3>
                <p className="text-xs text-slate-500 font-medium">Chi tiết câu trả lời bài ôn tập</p>
              </div>
              <Badge variant="primary">{selectedStudentAssignment.score || 0} điểm</Badge>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1 text-xs">
              {practiceSet.questions.map((q, idx) => {
                const subId = `${q.id}_${selectedStudentAssignment.studentId}`;
                const sub = practiceSet.responses?.[subId];
                const isCorrect = sub?.isCorrect;
                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-xl border ${
                      isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 mb-1">
                      Câu {idx + 1}: {q.content}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Đáp án của em: <strong>{sub?.answer || 'Chưa làm'}</strong></span>
                      <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isCorrect ? '✓ Đúng' : '✗ Chưa đúng'} (Đáp án đúng: {q.correctAnswer})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <Button variant="outline" size="sm" onClick={() => setSelectedStudentAssignment(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
