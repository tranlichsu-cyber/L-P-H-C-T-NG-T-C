import {onCall,HttpsError} from 'firebase-functions/v2/https';
import {initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore,FieldValue} from 'firebase-admin/firestore';
import {randomInt,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
if(!getApps().length)initializeApp();
const db=getFirestore();
const options={region:'asia-southeast1',enforceAppCheck:true,maxInstances:20};
const fail=(code,message)=>{throw new HttpsError(code,message);};
const clean=(v,max=10000)=>typeof v==='string'?v.trim().slice(0,max):'';
const bounded=(v,max)=>typeof v==='string'&&v.length<=max?v.trim():fail('invalid-argument','Nội dung quá dài hoặc không hợp lệ.');
const pinHash=(pin,salt)=>scryptSync(pin,salt,64).toString('hex');
const teacher=async(uid,classId,provider)=>{
 if(provider==='anonymous')fail('permission-denied','Phiên học sinh không được quản lý lớp.');
 if(!uid)fail('unauthenticated','Cần đăng nhập giáo viên.');
 const [user,cls]=await Promise.all([db.doc('users/'+uid).get(),db.doc('classes/'+classId).get()]);
 if(!cls.exists||!user.exists||user.data().status!=='ACTIVE')fail('permission-denied','Không có quyền truy cập lớp.');
 const u=user.data(),c=cls.data();
 if(u.role!=='SCHOOL_ADMIN'&&!(c.teacherId===uid||(c.coTeacherIds||[]).includes(uid)))fail('permission-denied','Không có quyền truy cập lớp.');
 return c;
};
const assertIds=(classId,studentId)=>{
 if(!/^[A-Za-z0-9_-]{1,100}$/.test(classId)||!/^[A-Za-z0-9_-]{1,100}$/.test(studentId))fail('invalid-argument','Mã định danh không hợp lệ.');
};
const requireStudent=async(classId,studentId)=>{
 const snap=await db.doc(`classes/${classId}/students/${studentId}`).get();
 if(!snap.exists)fail('not-found','Không tìm thấy học sinh.');return snap.data();
};
const secureSession=async(data,uid,provider)=>{
 if(provider!=='anonymous')fail('permission-denied','Chỉ phiên học sinh được phép lưu bài.');
 const classId=clean(data.classId,100),studentId=clean(data.studentId,100),sessionToken=clean(data.sessionToken,150);
 assertIds(classId,studentId);
 if(!uid||!sessionToken)fail('unauthenticated','Cần xác minh mã học sinh.');
 const snap=await db.doc('grade4WritingSessions/'+uid).get();
 if(!snap.exists)fail('permission-denied','Phiên học sinh không tồn tại.');
 const s=snap.data();
 if(s.classId!==classId||s.studentId!==studentId||s.tokenHash!==pinHash(sessionToken,s.salt)||s.expiresAt<Date.now())fail('permission-denied','Phiên đã hết hạn.');
 const credential=await db.doc('grade4WritingCredentials/'+classId+'_'+studentId).get();
 if(!credential.exists||credential.data().version!==s.credentialVersion)fail('permission-denied','Mã đã được cấp lại. Vui lòng xác minh lại.');
 return {classId,studentId};
};
export const issueGrade4Pin=onCall(options,async req=>{
 const classId=clean(req.data?.classId,100),studentId=clean(req.data?.studentId,100);assertIds(classId,studentId);
 await teacher(req.auth?.uid,classId,req.auth?.token?.firebase?.sign_in_provider);await requireStudent(classId,studentId);
 const pin=String(randomInt(0,1000000)).padStart(6,'0'),salt=randomBytes(16).toString('hex');
 await db.doc(`grade4WritingCredentials/${classId}_${studentId}`).set({classId,studentId,salt,pinHash:pinHash(pin,salt),version:randomBytes(16).toString('hex'),failed:0,lockedUntil:0,updatedAt:FieldValue.serverTimestamp()});
 return {pin}; // Show once to the authorized teacher; never log or persist plaintext.
});
export const verifyGrade4Pin=onCall(options,async req=>{
 const classId=clean(req.data?.classId,100),studentId=clean(req.data?.studentId,100),pin=req.data?.pin;
 assertIds(classId,studentId);
 if(!req.auth?.uid||req.auth.token.firebase.sign_in_provider!=='anonymous')fail('unauthenticated','Cần phiên học sinh ẩn danh.');
 if(typeof pin!=='string'||!/^[0-9]{6}$/.test(pin))fail('invalid-argument','Mã xác nhận không hợp lệ.');
 const ref=db.doc(`grade4WritingCredentials/${classId}_${studentId}`);
 const verification=await db.runTransaction(async tx=>{
 const snap=await tx.get(ref);if(!snap.exists)return {valid:false};
 const c=snap.data();if((c.lockedUntil||0)>Date.now())fail('resource-exhausted','Vui lòng thử lại sau.');
 const actual=Buffer.from(pinHash(pin,c.salt),'hex'),expected=Buffer.from(c.pinHash,'hex');
 const valid=actual.length===expected.length&&timingSafeEqual(actual,expected);
 tx.update(ref,valid?{failed:0,lockedUntil:0}:{failed:FieldValue.increment(1),lockedUntil:(c.failed||0)>=4?Date.now()+15*60*1000:0});
 return {valid,version:c.version};
 });
 if(!verification.valid)fail('permission-denied','Không thể xác minh thông tin.');
 await requireStudent(classId,studentId);
 const token=randomBytes(32).toString('hex'),salt=randomBytes(16).toString('hex');
 await db.doc('grade4WritingSessions/'+req.auth.uid).set({classId,studentId,salt,tokenHash:pinHash(token,salt),credentialVersion:verification.version,expiresAt:Date.now()+2*60*60*1000});
 return {sessionToken:token,expiresInSeconds:7200};
});
export const saveGrade4Writing=onCall(options,async req=>{
 const {classId,studentId}=await secureSession(req.data||{},req.auth?.uid,req.auth?.token?.firebase?.sign_in_provider);
 const week=req.data?.week,status=req.data?.status;
 if(!Number.isInteger(week)||week<1||week>35||!['DRAFT','SUBMITTED'].includes(status))fail('invalid-argument','Tuần hoặc trạng thái không hợp lệ.');
 const outline=bounded(req.data?.outline,12000),writing=bounded(req.data?.writing,30000);
 if(status==='SUBMITTED'&&(!outline||!writing))fail('invalid-argument','Cần hoàn thành dàn ý và bài viết.');
 const student=await requireStudent(classId,studentId);
 const ref=db.doc(`grade4WritingSubmissions/${classId}_${studentId}_${week}`);
 await db.runTransaction(async tx=>{
 const old=await tx.get(ref);if(old.exists&&old.data().status==='SUBMITTED')fail('failed-precondition','Bài đã nộp, không thể sửa.');
 const payload={classId,studentId,studentName:student.name||'',week,outline,writing,status,updatedAt:new Date().toISOString()};
 if(status==='SUBMITTED')payload.submittedAt=new Date().toISOString();
 tx.set(ref,payload,{merge:true});
 });
 return {saved:true};
});
export const commentGrade4Writing=onCall(options,async req=>{
 const classId=clean(req.data?.classId,100),studentId=clean(req.data?.studentId,100),week=req.data?.week;
 assertIds(classId,studentId);await teacher(req.auth?.uid,classId);
 if(!Number.isInteger(week)||week<1||week>35)fail('invalid-argument','Tuần không hợp lệ.');
 const comment=bounded(req.data?.comment,3000);
 const ref=db.doc(`grade4WritingSubmissions/${classId}_${studentId}_${week}`);
 if(!(await ref.get()).exists)fail('not-found','Chưa có bài làm.');
 await ref.update({teacherComment:comment,reviewedAt:new Date().toISOString(),reviewerUid:req.auth.uid});
 return {saved:true};
});
