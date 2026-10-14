import {signInAnonymously} from 'firebase/auth';
import {getFunctions,httpsCallable} from 'firebase/functions';
import {app,auth,isFirebaseConfigured} from '../firebase/firebase';
import type {Grade4WritingSubmission} from './grade4WritingIdentity';

const functions=()=>{if(!isFirebaseConfigured||!app||!auth)throw new Error('Firebase chưa được cấu hình.');return getFunctions(app,'asia-southeast1');};
export type WritingIdentity={classId:string;studentId:string;sessionToken:string};
export const WritingIdentityService={
 async issuePin(classId:string,studentId:string):Promise<string>{
  const call=httpsCallable<{classId:string;studentId:string},{pin:string}>(functions(),'issueGrade4Pin');
  return (await call({classId,studentId})).data.pin;
 },
 async verify(classId:string,studentId:string,pin:string):Promise<WritingIdentity>{
  if(!auth)throw new Error('Firebase chưa được cấu hình.');
  if(!auth.currentUser)await signInAnonymously(auth);
  if(auth.currentUser?.providerData.length)throw new Error('Hãy sử dụng phiên học sinh, không phải tài khoản giáo viên.');
  const call=httpsCallable<{classId:string;studentId:string;pin:string},{sessionToken:string}>(functions(),'verifyGrade4Pin');
  const result=await call({classId,studentId,pin});
  return {classId,studentId,sessionToken:result.data.sessionToken};
 },
 async save(identity:WritingIdentity,week:number,outline:string,writing:string,status:'DRAFT'|'SUBMITTED'){
  const call=httpsCallable<WritingIdentity&Pick<Grade4WritingSubmission,'week'|'outline'|'writing'|'status'>,{saved:boolean}>(functions(),'saveGrade4Writing');
  return (await call({...identity,week,outline,writing,status})).data.saved;
 },
 async get(identity:WritingIdentity,week:number):Promise<{found:boolean;outline?:string;writing?:string;status?:'DRAFT'|'SUBMITTED';teacherComment?:string}>{
  const call=httpsCallable<WritingIdentity&{week:number},{found:boolean;outline?:string;writing?:string;status?:'DRAFT'|'SUBMITTED';teacherComment?:string}>(functions(),'getGrade4Writing');
  return (await call({...identity,week})).data;
 },
 async comment(classId:string,studentId:string,week:number,comment:string){
  const call=httpsCallable<{classId:string;studentId:string;week:number;comment:string},{saved:boolean}>(functions(),'commentGrade4Writing');
  return (await call({classId,studentId,week,comment})).data.saved;
 }
};
