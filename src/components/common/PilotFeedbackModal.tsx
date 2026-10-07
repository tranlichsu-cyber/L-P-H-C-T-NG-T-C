import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { PilotFeedbackService } from '../../services/feedback/PilotFeedbackService';
import { useToast } from '../../context/ToastContext';
import { Star, Smile, Meh, Frown } from 'lucide-react';

interface PilotFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'TEACHER' | 'STUDENT';
}

export const PilotFeedbackModal: React.FC<PilotFeedbackModalProps> = ({
  isOpen,
  onClose,
  userRole = 'TEACHER',
}) => {
  const { showToast } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [studentReaction, setStudentReaction] = useState<'HAPPY' | 'NEUTRAL' | 'SAD'>('HAPPY');
  const [category, setCategory] = useState<'USABILITY' | 'SPEED' | 'STABILITY' | 'INTERFACE' | 'OTHER'>(
    'USABILITY'
  );
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await PilotFeedbackService.submitFeedback({
        role: userRole,
        rating: userRole === 'STUDENT' ? (studentReaction === 'HAPPY' ? 5 : studentReaction === 'NEUTRAL' ? 3 : 1) : rating,
        emojiReaction: userRole === 'STUDENT' ? studentReaction : undefined,
        category: userRole === 'TEACHER' ? category : undefined,
        comment: comment.trim() || undefined,
      });

      showToast('Cảm ơn Thầy/Cô và các em đã gửi phản hồi đóng góp!', 'success');
      onClose();
    } catch {
      showToast('Lỗi khi gửi phản hồi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userRole === 'TEACHER' ? 'GỬI PHẢN HỒI Ý KIẾN THỬ NGHIỆM PILOT' : 'EM THẤY ỨNG DỤNG THẾ NÀO?'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
          </Button>
        </>
      }
    >
      {userRole === 'STUDENT' ? (
        <div className="text-center py-4 space-y-6">
          <p className="text-base font-bold text-slate-700">Em hãy chọn biểu cảm phù hợp nhất nhé:</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setStudentReaction('HAPPY')}
              className={`p-4 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${
                studentReaction === 'HAPPY'
                  ? 'border-emerald-500 bg-emerald-50 scale-110 shadow-lg'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <Smile className="w-12 h-12 text-emerald-600" />
              <span className="font-black text-sm text-emerald-900">😊 Dễ dùng</span>
            </button>

            <button
              onClick={() => setStudentReaction('NEUTRAL')}
              className={`p-4 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${
                studentReaction === 'NEUTRAL'
                  ? 'border-amber-500 bg-amber-50 scale-110 shadow-lg'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <Meh className="w-12 h-12 text-amber-600" />
              <span className="font-black text-sm text-amber-900">😐 Bình thường</span>
            </button>

            <button
              onClick={() => setStudentReaction('SAD')}
              className={`p-4 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${
                studentReaction === 'SAD'
                  ? 'border-rose-500 bg-rose-50 scale-110 shadow-lg'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <Frown className="w-12 h-12 text-rose-600" />
              <span className="font-black text-sm text-rose-900">😕 Khó dùng</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Đánh giá độ thuận tiện & ổn định (1 đến 5 sao)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1.5 transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="font-black text-slate-800 text-lg ml-2">{rating}/5 sao</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Phân loại góp ý
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="USABILITY">Độ dễ sử dụng & Số bước thao tác</option>
              <option value="SPEED">Tốc độ gửi nhận câu hỏi/đáp án Realtime</option>
              <option value="STABILITY">Độ ổn định khi kết nối Wi-Fi trường</option>
              <option value="INTERFACE">Giao diện trình chiếu & Chữ viết</option>
              <option value="OTHER">Đóng góp ý kiến khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Điều Thầy/Cô muốn cải thiện nhất? (Tùy chọn)
            </label>
            <textarea
              rows={3}
              placeholder="Ví dụ: Cần phóng to QR Code hơn khi chiếu lên máy chiếu..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </Modal>
  );
};
