import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import { matchVietnameseText, normalizeVietnameseText } from '../../utils/normalizeVietnamese';
import type { Student } from '../../types';
import {
  Plus,
  FileText,
  Search,
  ArrowLeft,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const ClassDetailsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { classes, addStudent, bulkAddStudents, updateStudent, deleteStudent } = useTeacherData();
  const { showToast } = useToast();

  const currentClass = classes.find((c) => c.id === classId);

  // Search & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'a-z' | 'z-a' | 'original'>('original');

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Active Student State
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // Single Add State
  const [singleNameInput, setSingleNameInput] = useState('');
  const [singleError, setSingleError] = useState('');

  // Bulk Import States
  const [bulkTextarea, setBulkTextarea] = useState('');
  const [bulkStep, setBulkStep] = useState<'input' | 'preview'>('input');
  const [bulkPreviewList, setBulkPreviewList] = useState<{ name: string; isDuplicate: boolean }[]>([]);

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    if (!currentClass) return [];

    let list = currentClass.students.filter((s) => matchVietnameseText(s.name, searchQuery));

    if (sortOrder === 'a-z') {
      list = [...list].sort((a, b) => {
        const nameA = a.name.split(' ').pop() || a.name;
        const nameB = b.name.split(' ').pop() || b.name;
        return nameA.localeCompare(nameB, 'vi');
      });
    } else if (sortOrder === 'z-a') {
      list = [...list].sort((a, b) => {
        const nameA = a.name.split(' ').pop() || a.name;
        const nameB = b.name.split(' ').pop() || b.name;
        return nameB.localeCompare(nameA, 'vi');
      });
    }

    return list;
  }, [currentClass, searchQuery, sortOrder]);

  if (!currentClass) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy lớp học</h2>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/teacher/classes')}>
          Quay lại danh sách lớp
        </Button>
      </div>
    );
  }

  // --- SINGLE ADD HANDLER ---
  const handleSaveSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleNameInput.trim()) {
      setSingleError('Vui lòng nhập họ và tên học sinh!');
      return;
    }

    const success = addStudent(currentClass.id, singleNameInput);
    if (!success) {
      setSingleError('Học sinh này đã có trong lớp!');
      return;
    }

    showToast(`Đã thêm học sinh ${singleNameInput.trim()}!`, 'success');
    setSingleNameInput('');
    setIsAddOpen(false);
  };

  // --- BULK IMPORT HANDLERS ---
  const handleOpenBulk = () => {
    setBulkTextarea('');
    setBulkStep('input');
    setBulkPreviewList([]);
    setIsBulkOpen(true);
  };

  const handlePreviewBulk = () => {
    const lines = bulkTextarea
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      showToast('Vui lòng dán danh sách học sinh vào ô văn bản!', 'error');
      return;
    }

    const existingSet = new Set(
      currentClass.students.map((s) => normalizeVietnameseText(s.name))
    );

    const preview = lines.map((name) => {
      const norm = normalizeVietnameseText(name);
      return {
        name,
        isDuplicate: existingSet.has(norm),
      };
    });

    setBulkPreviewList(preview);
    setBulkStep('preview');
  };

  const handleConfirmBulkAdd = () => {
    const validNames = bulkPreviewList.filter((item) => !item.isDuplicate).map((item) => item.name);

    if (validNames.length === 0) {
      showToast('Tất cả học sinh trong danh sách đều trùng với lớp!', 'error');
      return;
    }

    const result = bulkAddStudents(currentClass.id, validNames);
    showToast(`Đã thêm thành công ${result.addedCount} học sinh vào ${currentClass.name}!`, 'success');
    setIsBulkOpen(false);
  };

  // --- EDIT STUDENT HANDLERS ---
  const handleOpenEdit = (std: Student) => {
    setActiveStudent(std);
    setSingleNameInput(std.name);
    setSingleError('');
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    if (!singleNameInput.trim()) {
      setSingleError('Họ và tên không được để trống!');
      return;
    }

    updateStudent(currentClass.id, activeStudent.id, singleNameInput);
    showToast(`Đã cập nhật thông tin học sinh thành ${singleNameInput.trim()}!`, 'success');
    setIsEditOpen(false);
  };

  // --- DELETE STUDENT HANDLERS ---
  const handleOpenDelete = (std: Student) => {
    setActiveStudent(std);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!activeStudent) return;
    deleteStudent(currentClass.id, activeStudent.id);
    showToast(`Đã xóa học sinh ${activeStudent.name}!`, 'info');
    setIsDeleteOpen(false);
  };

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate('/teacher/classes')}
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp
        </button>
      </div>

      <PageHeader
        title={`${currentClass.name.toUpperCase()} - DANH SÁCH HỌC SINH`}
        description={`Khối: ${currentClass.grade} • Sĩ số hiện tại: ${currentClass.students.length} học sinh`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => navigate(`/teacher/history?classId=${currentClass.id}`)}>
              <FileText className="w-4 h-4 mr-1.5 text-indigo-600" /> LỊCH SỬ BÀI HỌC LỚP
            </Button>

            <Button variant="outline" onClick={handleOpenBulk}>
              <FileText className="w-4 h-4 mr-1.5 text-sky-600" /> NHẬP NHANH DANH SÁCH
            </Button>

            <Button variant="primary" onClick={() => {
              setSingleNameInput('');
              setSingleError('');
              setIsAddOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-1" /> Thêm học sinh
            </Button>
          </div>
        }
      />

      {/* Search & Sort Controls */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm học sinh (ví dụ: Minh, Nguyen)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-sky-500 focus:outline-none"
            >
              <option value="original">Thứ tự nhập</option>
              <option value="a-z">Theo tên A → Z</option>
              <option value="z-a">Theo tên Z → A</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Roster List Table / Cards */}
      <Card>
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">
            {searchQuery
              ? 'Không tìm thấy học sinh nào phù hợp với từ khóa tìm kiếm.'
              : 'Lớp này chưa có học sinh. Bấm "+ Thêm học sinh" hoặc "NHẬP NHANH DANH SÁCH" để tạo.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4 w-16">STT</th>
                  <th className="py-3 px-4">Họ và Tên Học Sinh</th>
                  <th className="py-3 px-4">Mã Học Sinh</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.map((std, idx) => (
                  <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-base">{std.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{std.studentCode || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/teacher/classes/${currentClass.id}/students/${std.id}/history`)}
                        className="text-sky-700 border-sky-300 hover:bg-sky-50"
                      >
                        Lịch sử tiến bộ
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(std)}>
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Sửa
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenDelete(std)}
                        className="hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 mr-1" /> Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Single Add Student */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`Thêm Học Sinh Vào ${currentClass.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveSingleStudent}>Thêm học sinh</Button>
          </>
        }
      >
        <form onSubmit={handleSaveSingleStudent} className="space-y-4">
          <Input
            label="Họ và Tên Học Sinh"
            placeholder="Ví dụ: Nguyễn Minh Anh"
            value={singleNameInput}
            onChange={(e) => {
              setSingleNameInput(e.target.value);
              setSingleError('');
            }}
            error={singleError}
            required
          />
        </form>
      </Modal>

      {/* Modal Bulk Import Students */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title={`Nhập Nhanh Danh Sách Học Sinh vào ${currentClass.name}`}
        footer={
          bulkStep === 'input' ? (
            <>
              <Button variant="secondary" onClick={() => setIsBulkOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handlePreviewBulk}>Xem trước danh sách</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setBulkStep('input')}>Quay lại sửa</Button>
              <Button variant="primary" onClick={handleConfirmBulkAdd}>THÊM VÀO LỚP</Button>
            </>
          )
        }
      >
        {bulkStep === 'input' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Dán danh sách tên học sinh vào ô bên dưới (mỗi dòng là một tên học sinh):
            </p>
            <textarea
              rows={8}
              placeholder={`Nguyễn Minh Anh\nTrần Gia Bảo\nLê Hoàng Minh\nNguyễn Hà My\nĐỗ Minh Quân`}
              value={bulkTextarea}
              onChange={(e) => setBulkTextarea(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 p-4 text-slate-900 font-medium focus:border-sky-500 focus:outline-none"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-sky-50 text-sky-900 rounded-xl border border-sky-200 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-600" />
              Tổng cộng {bulkPreviewList.length} dòng ({bulkPreviewList.filter(i => !i.isDuplicate).length} học sinh mới hợp lệ)
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3">
              {bulkPreviewList.map((item, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg flex items-center justify-between text-sm ${
                    item.isDuplicate ? 'bg-amber-50 border border-amber-200 text-amber-900' : 'bg-slate-50 text-slate-800'
                  }`}
                >
                  <span className="font-bold">{i + 1}. {item.name}</span>
                  {item.isDuplicate ? (
                    <span className="text-xs font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded">
                      Đã có trong lớp
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      Sẵn sàng thêm
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Edit Student Name */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Chỉnh Sửa Họ Tên Học Sinh"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Họ và Tên Học Sinh"
            placeholder="Ví dụ: Nguyễn Minh Anh"
            value={singleNameInput}
            onChange={(e) => {
              setSingleNameInput(e.target.value);
              setSingleError('');
            }}
            error={singleError}
            required
          />
        </form>
      </Modal>

      {/* Modal Confirm Delete Student */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Học Sinh"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Xóa học sinh</Button>
          </>
        }
      >
        <div className="flex items-start gap-4 p-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              Bạn có chắc muốn xóa học sinh <span className="text-rose-600">{activeStudent?.name}</span>?
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Thao tác này sẽ xóa tên học sinh khỏi lớp {currentClass.name}.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
