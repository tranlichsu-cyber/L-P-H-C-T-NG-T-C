import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import type { Question } from '../../types';

export interface BankQuestion {
  id: string;
  teacherId: string;
  subject: string;
  grade: string;
  topic: string;
  question: Omit<Question, 'id'>;
  createdAt: string;
  updatedAt: string;
}
export const QUESTION_LABELS: Record<Question['type'], string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm', TRUE_FALSE: 'Đúng / Sai', SHORT_ANSWER: 'Trả lời ngắn',
  FILL_BLANK: 'Điền chỗ trống', ORDERING: 'Sắp xếp thứ tự',
};
// Keep only question fields: never copy Firestore order/timestamps into a new quiz.
export function copyQuestion(q: Question | Omit<Question, 'id'>): Omit<Question, 'id'> {
  return Object.fromEntries(Object.entries({
    type: q.type, content: q.content, options: q.options ? [...q.options] : undefined,
    correctAnswer: q.correctAnswer, explanation: q.explanation,
    caseInsensitive: q.caseInsensitive, trimWhitespace: q.trimWhitespace,
    correctPoints: q.correctPoints, wrongPenalty: q.wrongPenalty,
    difficulty: q.difficulty, source: q.source, aiReviewed: q.aiReviewed,
  }).filter(([, value]) => value !== undefined)) as Omit<Question, 'id'>;
}

export function useQuestionBank() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const [items, setItems] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setItems([]); setError('');
    if (!uid || !db || !isFirebaseConfigured) { setLoading(false); return; }
    setLoading(true);
    return onSnapshot(query(collection(db, 'questionBank'), where('teacherId', '==', uid)),
      (snap) => {
        setItems(snap.docs.map((entry) => ({ ...entry.data(), id: entry.id } as BankQuestion))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
        setLoading(false); setError('');
      }, () => { setError('Không tải được kho câu hỏi. Kiểm tra kết nối rồi thử tải lại trang.'); setLoading(false); });
  }, [uid]);
  const save = async (data: Pick<BankQuestion, 'subject' | 'grade' | 'topic' | 'question'>, existing?: BankQuestion) => {
    if (!uid || !db) throw new Error('Cần đăng nhập và kết nối Firebase để lưu vào kho.');
    const now = new Date().toISOString();
    const item: BankQuestion = { ...data, question: copyQuestion(data.question), id: existing?.id || crypto.randomUUID(),
      teacherId: uid, createdAt: existing?.createdAt || now, updatedAt: now };
    await setDoc(doc(db, 'questionBank', item.id), item);
  };
  const remove = async (id: string) => {
    if (!uid || !db) throw new Error('Cần đăng nhập để xoá câu hỏi.');
    await deleteDoc(doc(db, 'questionBank', id));
  };
  return { items, loading, error, save, remove };
}
