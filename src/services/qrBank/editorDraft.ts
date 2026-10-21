import type { QrBank } from './content';
const key = (uid: string, id: string) => `qr-editor-draft-v1:${uid}:${id}`;
export function readQrDraft(uid: string, id: string): QrBank | null {
  if (!uid || !id) return null;
  try {
    const raw = localStorage.getItem(key(uid, id));
    if (!raw || raw.length > 1200000) return null;
    const value = JSON.parse(raw) as QrBank;
    if (value.teacherId !== uid || (id !== 'new' && value.id !== id) || typeof value.id !== 'string' || !value.id || value.id.includes('/')) return null;
    if (![value.title, value.subject, value.grade].every(s => typeof s === 'string') || !Array.isArray(value.questions) || !value.questions.length || value.questions.length > 80) return null;
    if (value.questions.some(q => !q || typeof q.id !== 'string' || typeof q.content !== 'string' || q.type !== 'MULTIPLE_CHOICE' || !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4 || q.options.some(s => typeof s !== 'string') || typeof q.correctAnswer !== 'string')) return null;
    if (new Set(value.questions.map(q => q.id)).size !== value.questions.length) return null;
    if (value.questions.some(q => !q.id || q.id.includes('/') || (q.explanation !== undefined && typeof q.explanation !== 'string') || (q.media !== undefined && (!q.media || typeof q.media !== 'object' || Array.isArray(q.media) || ['imageUrl', 'imageAlt', 'videoUrl'].some(field => { const item = q.media?.[field as keyof NonNullable<typeof q.media>]; return item !== undefined && typeof item !== 'string'; }))))) return null;
    return value;
  } catch { return null; }
}
export function writeQrDraft(uid: string, id: string, bank: QrBank): boolean {
  if (!uid || !id || bank.teacherId !== uid) return false;
  try { const raw = JSON.stringify(bank); if (raw.length > 1200000) return false; localStorage.setItem(key(uid, id), raw); return true; } catch { return false; }
}
export function clearQrDraft(uid: string, id: string) {
  try { localStorage.removeItem(key(uid, id)); } catch { /* Remote save remains successful if browser storage is unavailable. */ }
}
