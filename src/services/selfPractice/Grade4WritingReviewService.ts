import {collection,getDocs,query,where} from 'firebase/firestore';
import {auth,db,isFirebaseConfigured} from '../firebase/firebase';
import type {Grade4WritingSubmission} from './grade4WritingIdentity';

export interface TeacherWritingSubmission extends Grade4WritingSubmission {
  id:string;
  studentName:string;
  className:string;
  teacherComment?:string;
  reviewedAt?:string;
}

/** Read-only review access. Firestore security rules must enforce teacher class ownership.
 * No client-side PIN checks, and no fallback to fabricated student submissions.
 */
export class Grade4WritingReviewService {
  static async listForClass(classId:string):Promise<TeacherWritingSubmission[]> {
    if(!isFirebaseConfigured||!db||!auth?.currentUser)throw new Error('Giáo viên cần đăng nhập để xem bài học sinh.');
    if(!classId.trim())throw new Error('Vui lòng chọn lớp.');
    const snap=await getDocs(query(collection(db,'grade4WritingSubmissions'),where('classId','==',classId)));
    return snap.docs.map(d=>({...(d.data() as Omit<TeacherWritingSubmission,'id'>),id:d.id}));
  }
}
