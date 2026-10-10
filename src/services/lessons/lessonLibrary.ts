import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
export interface Lesson {
  id: string; ownerId: string; title: string; subject: string; grade: string;
  pptName?: string; pdfName?: string; pageCount?: number; createdAt: string;
}
const EVENT = 'lesson-library-changed';
const LIMIT = 50 * 1024 * 1024;
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('interactive-classroom-lessons', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('lessons', { keyPath: 'id' }).createIndex('ownerId', 'ownerId');
      request.result.createObjectStore('files');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Không mở được kho trên trình duyệt. Hãy dùng chế độ duyệt thông thường.'));
  });
}
const finished = (tx: IDBTransaction) => new Promise<void>((resolve, reject) => {
  tx.oncomplete = () => resolve();
  tx.onabort = () => reject(new Error('Không lưu được tệp. Máy có thể đã hết dung lượng lưu trữ.'));
  tx.onerror = () => reject(new Error('Lỗi đọc hoặc ghi kho bài giảng.'));
});
export async function validateLessonFile(file: File, type: 'pdf' | 'ppt') {
  if (!file.size || file.size > LIMIT) throw new Error('Mỗi tệp cần có nội dung và không vượt quá 50 MB.');
  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  if (type === 'pdf') {
    if (!/\.pdf$/i.test(file.name) || !new TextDecoder().decode(bytes).includes('%PDF-')) throw new Error('Vui lòng chọn tệp PDF hợp lệ.');
  } else {
    const zip = bytes[0] === 0x50 && bytes[1] === 0x4b;
    const ole = [0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1].every((v,i) => bytes[i] === v);
    if (!(/\.pptx$/i.test(file.name) && zip) && !(/\.ppt$/i.test(file.name) && ole)) throw new Error('Vui lòng chọn tệp .ppt hoặc .pptx hợp lệ.');
  }
}
export async function listLessons(ownerId: string): Promise<Lesson[]> {
  const db = await openDb();
  try {
    const tx = db.transaction('lessons', 'readonly');
    const done = finished(tx);
    const request = tx.objectStore('lessons').index('ownerId').getAll(ownerId);
    const items = await new Promise<Lesson[]>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    await done; return items.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  } finally { db.close(); }
}
export async function saveLesson(lesson: Lesson, ppt: File | null, pdf: File | null) {
  if (!ppt && !pdf) throw new Error('Chọn PPT gốc hoặc PDF trình chiếu.');
  if (ppt) await validateLessonFile(ppt, 'ppt');
  if (pdf) await validateLessonFile(pdf, 'pdf');
  const db = await openDb();
  try {
    const tx = db.transaction(['lessons', 'files'], 'readwrite');
    const done = finished(tx);
    tx.objectStore('lessons').put(lesson);
    if (ppt) tx.objectStore('files').put(ppt, `${lesson.ownerId}/${lesson.id}/ppt`);
    if (pdf) tx.objectStore('files').put(pdf, `${lesson.ownerId}/${lesson.id}/pdf`);
    await done; window.dispatchEvent(new Event(EVENT));
  } finally { db.close(); }
}
export async function getLessonFile(lesson: Lesson, type: 'pdf' | 'ppt'): Promise<Blob> {
  const db = await openDb();
  try {
    const tx = db.transaction('files', 'readonly'); const done = finished(tx);
    const request = tx.objectStore('files').get(`${lesson.ownerId}/${lesson.id}/${type}`);
    const blob = await new Promise<Blob | undefined>((resolve,reject) => { request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); });
    await done;
    if (!blob) throw new Error('Không tìm thấy tệp trên máy này. Hãy tải lại bài giảng.');
    return blob;
  } finally { db.close(); }
}
export async function deleteLesson(lesson: Lesson) {
  const db = await openDb();
  try {
    const tx = db.transaction(['lessons','files'],'readwrite'); const done=finished(tx);
    tx.objectStore('lessons').delete(lesson.id);
    for (const type of ['ppt','pdf']) tx.objectStore('files').delete(`${lesson.ownerId}/${lesson.id}/${type}`);
    await done; window.dispatchEvent(new Event(EVENT));
  } finally { db.close(); }
}
export async function downloadLesson(lesson: Lesson, type: 'pdf' | 'ppt') {
  const url = URL.createObjectURL(await getLessonFile(lesson,type));
  const link = document.createElement('a'); link.href=url; link.download=(type === 'pdf' ? lesson.pdfName : lesson.pptName) || `${lesson.title}.${type}`;
  link.click(); setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export function useLessonLibrary() {
  const { currentUser } = useAuth(); const uid=currentUser?.uid;
  const [items,setItems]=useState<Lesson[]>([]); const [error,setError]=useState(''); const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let disposed=false;
    const load=async()=>{
      if(!uid) { setItems([]);setLoading(false);return; }
      try { const lessons=await listLessons(uid); if(!disposed) { setItems(lessons);setError(''); } }
      catch { if(!disposed) setError('Không đọc được kho trên máy. Hãy kiểm tra chế độ trình duyệt và tải lại trang.'); }
      finally { if(!disposed) setLoading(false); }
    };
    void load(); window.addEventListener(EVENT,load);
    return()=>{disposed=true;window.removeEventListener(EVENT,load);};
  },[uid]);
  return { items: items.filter((i)=>i.ownerId===uid),error,loading };
}
