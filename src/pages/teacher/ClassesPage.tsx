import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useToast } from '../../context/ToastContext';
import type { ClassGroup } from '../../types';
import { Plus, Edit2, Trash2, Eye, AlertTriangle } from 'lucide-react';

export const ClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, addClass, updateClass, deleteClass } = useTeacherData();
  const { showToast } = useToast();

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [activeClass, setActiveClass] = useState<ClassGroup | null>(null);

  // Form States
  const [classNameInput, setClassNameInput] = useState('');
  const [gradeInput, setGradeInput] = useState('Khối 4');
  const [formError, setFormError] = useState('');

  // Handle Create
  const handleOpenCreate = () => {
    setClassNameInput('');
    setGradeInput('Khối 4');
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) {
      setFormError('Vui lòng nhập tên lớp học!');
      return;
    }
    const created = addClass(classNameInput, gradeInput);
    showToast(`Đã tạo ${created.name} thành công!`, 'success');
    setIsCreateOpen(false);
  };

  // Handle Edit
  const handleOpenEdit = (cls: ClassGroup) => {
    setActiveClass(cls);
    setClassNameInput(cls.name);
    setGradeInput(cls.grade);
    setFormError('');
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;
    if (!classNameInput.trim()) {
      setFormError('Tên lớp học không được để trống!');
      return;
    }
    updateClass(activeClass.id, classNameInput, gradeInput);
    showToast(`Đã cập nhật thông tin lớp ${classNameInput.trim()}!`, 'success');
    setIsEditOpen(false);
  };

  // Handle Delete Confirm
  const handleOpenDelete = (cls: ClassGroup) => {
    setActiveClass(cls);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!activeClass) return;
    deleteClass(activeClass.id);
    showToast(`Đã xóa ${activeClass.name}!`, 'info');
    setIsDeleteOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Quản Lý Lớp Học"
        description="Quản lý thông tin danh sách các lớp học và số lượng học sinh"
        action={
          <Button variant="primary" size="lg" onClick={handleOpenCreate}>
            <Plus className="w-5 h-5 mr-1" /> Tạo lớp mới
          </Button>
        }
      />

      {/* Class List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <Card key={cls.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xl">
                  {cls.name.substring(0, 3)}
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                  {cls.grade}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-1">{cls.name}</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">
                Sĩ số: <span className="font-bold text-sky-700">{cls.students.length} học sinh</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/teacher/classes/${cls.id}`)}
              >
                <Eye className="w-4 h-4 mr-1" /> Xem học sinh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(cls)}
                title="Sửa thông tin lớp"
              >
                <Edit2 className="w-4 h-4 text-slate-600" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenDelete(cls)}
                title="Xóa lớp"
                className="hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Class Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo Lớp Học Mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveCreate}>Lưu lớp</Button>
          </>
        }
      >
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <Input
            label="Tên Lớp Học"
            placeholder="Ví dụ: 4A, 4B, 5A..."
            value={classNameInput}
            onChange={(e) => {
              setClassNameInput(e.target.value);
              setFormError('');
            }}
            error={formError}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Khối</label>
            <select
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none"
            >
              <option value="Khối 1">Khối 1</option>
              <option value="Khối 2">Khối 2</option>
              <option value="Khối 3">Khối 3</option>
              <option value="Khối 4">Khối 4</option>
              <option value="Khối 5">Khối 5</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Chỉnh Sửa Thông Tin Lớp"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Tên Lớp Học"
            placeholder="Ví dụ: 4A..."
            value={classNameInput}
            onChange={(e) => {
              setClassNameInput(e.target.value);
              setFormError('');
            }}
            error={formError}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Khối</label>
            <select
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none"
            >
              <option value="Khối 1">Khối 1</option>
              <option value="Khối 2">Khối 2</option>
              <option value="Khối 3">Khối 3</option>
              <option value="Khối 4">Khối 4</option>
              <option value="Khối 5">Khối 5</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Class Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Lớp Học"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Xóa lớp</Button>
          </>
        }
      >
        <div className="flex items-start gap-4 p-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              Bạn có chắc muốn xóa <span className="text-rose-600">{activeClass?.name}</span>?
            </h4>
            <p className="mt-1 text-sm font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              ⚠️ Danh sách học sinh trong lớp cũng sẽ bị xóa hoàn toàn khỏi hệ thống.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
