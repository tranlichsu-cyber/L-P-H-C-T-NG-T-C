import {getFunctions,httpsCallable} from 'firebase/functions';
import {app,auth} from '../firebase/firebase';
import {signInAnonymously} from 'firebase/auth';
import {isValidStudentPinFormat,isValidWritingWeek} from './grade4WritingIdentity';

const fn=(name:string)=>{
 if(!app)throw new Error('Chưa kết nối Firebase.');
 return httpsCallable(getFunctions(app,'asia-southeast1'),name);
};
export async function issueGrade4Pin(classId:string,studentId:string):Promise<string>{
 const result=await fn('issueGrade4Pin')({classId,studentId});
 return (result.data as {pin:string}).pin;
}
export async function verifyGrade4Pin(classId:string,studentId:string,pin:string):Promise<string>{
 if(!isValidStudentPinFormat(pin))throw new Error('Mã phải gồm 6 chữ số.');
 if(!auth)throw new Error('Chưa kết nối Firebase Authentication.');
 if(!auth.currentUser)await signInAnonymously(auth);
 const result=await fn('verifyGrade4Pin')({classId,studentId,pin});
 return (result.data as {sessionToken:string}).sessionToken;
}
export async function saveGrade4Writing(input:{classId:string;studentId:string;sessionToken:string;week:number;outline:string;writing:string;status:'DRAFT'|'SUBMITTED'}):Promise<void>{
 if(!isValidWritingWeek(input.week))throw new Error('Tuần học không hợp lệ.');
 await fn('saveGrade4Writing')(input);
}
export async function commentGrade4Writing(input:{classId:string;studentId:string;week:number;comment:string}):Promise<void>{
 if(!isValidWritingWeek(input.week))throw new Error('Tuần học không hợp lệ.');
 await fn('commentGrade4Writing')(input);
}
