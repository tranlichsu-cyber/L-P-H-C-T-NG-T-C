const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const req=require('node:module').createRequire(require.resolve('@firebase/rules-unit-testing'));
const {doc,collection,getDocs,setDoc,getDoc,deleteDoc,updateDoc,writeBatch,runTransaction}=req('firebase/firestore');
const fs=require('node:fs'),ts=require('typescript');
const load=source=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
(async()=>{const {gradePractice}=await load(fs.readFileSync('src/services/practice/grading.ts','utf8')),policy=await load(fs.readFileSync('src/services/rewards/freePoints.ts','utf8'));
const rules=fs.readFileSync('firestore.rules','utf8');
const env=await initializeTestEnvironment({projectId:'demo-self-practice',firestore:{rules}});await env.clearFirestore();
try{
const teacher=env.authenticatedContext('t',{firebase:{sign_in_provider:'password'}}).firestore(),student=env.authenticatedContext('u',{firebase:{sign_in_provider:'anonymous'}}).firestore(),other=env.authenticatedContext('v',{firebase:{sign_in_provider:'anonymous'}}).firestore();
const code='ABCDEFGH2345',access={code,classId:'c',className:'4A',grade:'Khối 4',studentId:'s',studentName:'An',teacherId:'t'};
await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();await setDoc(doc(db,'users','t'),{status:'ACTIVE',role:'TEACHER'});await setDoc(doc(db,'classes','c'),{teacherId:'t',coTeacherIds:[],name:'4A',grade:'Khối 4'});await setDoc(doc(db,'classes','c','students','s'),{name:'An'});await setDoc(doc(db,'classes','c','students','other'),{name:'Bình'});await setDoc(doc(db,'selfPracticeAccess',code),access);});
await assertSucceeds(setDoc(doc(student,'rewardAccess','u'),{classId:'c',studentId:'s',roomId:'',accessCode:code}));
const pointRef=doc(student,'classes','c','rewardPoints','s'),walletRef=doc(student,'classes','c','rewardWallets','s');
const wallet={classId:'c',studentId:'s',studentName:'An',teacherId:'t',totalPoints:0,earnedBadges:0,spentBadges:0,ownedAvatars:['starter'],equippedAvatar:'starter',updatedAt:'now'};
await assertFails(setDoc(walletRef,{...wallet,totalPoints:200,earnedBadges:10}));await assertSucceeds(setDoc(walletRef,wallet));
await assertFails(setDoc(pointRef,{...policy.emptyPoints(),currentPoints:100,practicePoints:100}));await assertSucceeds(setDoc(pointRef,policy.emptyPoints()));
await assertFails(updateDoc(pointRef,{currentPoints:100,practicePoints:100}));await assertFails(getDoc(doc(other,'classes','c','rewardPoints','s')));
const bank=[{id:'q0',type:'MULTIPLE_CHOICE',options:['Một','Hai','Ba','Bốn'],correctAnswer:'B',content:'Chọn',points:2},{id:'q1',type:'SHORT_ANSWER',correctAnswer:'1,5',content:'Số',points:2},{id:'q2',type:'TRUE_FALSE',correctAnswer:'Đúng',content:'Đ/S',points:1},{id:'q3',type:'FILL_BLANK',correctAnswer:'1000',content:'Điền',points:1},{id:'q4',type:'ORDERING',correctAnswer:'A B C',content:'Xếp',points:1},{id:'q5',type:'SHORT_ANSWER',correctAnswer:'Thái Nguyên',content:'Địa danh',points:2},{id:'q6',type:'SHORT_ANSWER',correctAnswer:'học',content:'Từ',points:1}];
const answers={q0:' hai ',q1:'1.5',q2:'ĐÚNG',q3:'1 000',q4:'a b c',q5:' THÁI NGUYÊN ',q6:'học'};
async function prepare(quizId,questions){await assertSucceeds(setDoc(doc(teacher,'selfPracticeQuizzes',quizId),{id:quizId,teacherId:'t',title:'Đề',grade:'4',subject:'Toán',questions,published:true,updatedAt:'v1'}));}
async function attempt(id,quizId,questions,input=answers,{forged=false}={}){
 const grade=policy.prepareRewardResult(questions,gradePractice(questions,input)),work={id,...access,kind:'QUIZ',quizId,quizTitle:'Đề',subject:'Toán',submittedAt:'now',result:forged?{...grade,earnedPoints:99999,breakdown:grade.breakdown.map(q=>({...q,earnedPoints:99999,isCorrect:true}))}:grade,accessCode:code,authUid:'u',rewardVersion:2};delete work.code;delete work.grade;
 await assertSucceeds(setDoc(doc(student,'selfPracticeWork',id),work));
 const ref=doc(student,'classes','c','rewardAttempts',id);let state={studentId:'s',quizId,workId:id,version:'v1',cursor:0,earnedUnits:0,maxUnits:0,pendingUnits:0};
 await assertFails(setDoc(ref,{...state,cursor:5,earnedUnits:1000}));await assertSucceeds(setDoc(ref,state));
 const first=policy.advanceAttempt(state,questions,grade);await assertFails(setDoc(ref,{...first,earnedUnits:first.earnedUnits+1}));await assertFails(setDoc(ref,{...first,cursor:first.cursor+1}));
 while(state.cursor<questions.length){state=policy.advanceAttempt(state,questions,grade);if(state.cursor===questions.length)console.log('Verified',id,state.cursor,'questions');await assertSucceeds(setDoc(ref,state));}
 await assertFails(updateDoc(ref,{workId:'other'}));await assertFails(getDoc(doc(other,'classes','c','rewardAttempts',id)));
 return {state,points:policy.attemptPoints(state),ref};
}
async function credit(quizId,attemptId,points,expectSuccess=true){const creditRef=doc(pointRef,'quizCredits',quizId),old=(await getDoc(creditRef)).data()?.points||0,p=(await getDoc(pointRef)).data();const batch=writeBatch(student);batch.set(creditRef,{points,attemptId,updatedAt:'now'});batch.update(pointRef,{practicePoints:p.practicePoints+points-old,currentPoints:p.currentPoints+points-old,sourceId:quizId,updatedAt:'now'});await (expectSuccess?assertSucceeds:assertFails)(batch.commit());}
await prepare('quiz',bank);const first=await attempt('a1','quiz',bank,{...answers,q0:'wrong',q5:'wrong'},{forged:true});if(first.points!==6)throw Error('Canonical grade must ignore client claimed scores');
await credit('quiz','a1',100,false);await credit('quiz','a1',6);await credit('quiz','a1',6,false); // cannot replay receipt as extra points
const second=await attempt('a2','quiz',bank);if(second.points!==10)throw Error('Normalization differs from grader');await credit('quiz','a2',10);if((await getDoc(pointRef)).data().currentPoints!==10)throw Error('Best score only');
await assertFails(updateDoc(walletRef,{totalPoints:20,earnedBadges:1}));
await prepare('quiz2',bank);await attempt('a3','quiz2',bank);await credit('quiz2','a3',10);await assertSucceeds(updateDoc(walletRef,{totalPoints:20,earnedBadges:1}));await assertSucceeds(updateDoc(walletRef,{totalPoints:20,earnedBadges:1}));
const pendingBank=[{...bank[0],reviewMode:'TEACHER'}];await prepare('manual',pendingBank);await attempt('manual-a','manual',pendingBank,{q0:'Hai'});await credit('manual','manual-a',10,false);
const many=Array.from({length:200},(_,i)=>({id:'m'+i,type:'SHORT_ANSWER',content:'Số',correctAnswer:'1',points:1}));await prepare('large',many);await attempt('large-a','large',many,Object.fromEntries(many.map(q=>[q.id,'1'])));await credit('large','large-a',10);
// Teacher records live points with a stable room source; no anonymous authority over room points.
await assertFails(updateDoc(pointRef,{livePoints:100,currentPoints:130}));const p=(await getDoc(pointRef)).data();await assertSucceeds(setDoc(doc(teacher,'classes','c','rewardPoints','s'),{...p,livePoints:30,currentPoints:60}));
await assertSucceeds(updateDoc(walletRef,{totalPoints:60,earnedBadges:3}));const purchased={...wallet,totalPoints:60,earnedBadges:3,spentBadges:3,ownedAvatars:['starter','cat'],equippedAvatar:'cat'};await assertSucceeds(setDoc(walletRef,purchased));await assertSucceeds(updateDoc(walletRef,{totalPoints:60,earnedBadges:3}));await assertFails(updateDoc(walletRef,{spentBadges:0}));
// Revoked code blocks claims and new evidence, even when an attempt already exists.
await assertSucceeds(deleteDoc(doc(teacher,'selfPracticeAccess',code)));await assertFails(updateDoc(walletRef,{totalPoints:60,earnedBadges:3}));await assertFails(getDoc(pointRef));
// Exercise the actual application service against the emulator, not just matching test transactions.
await assertSucceeds(setDoc(doc(teacher,'selfPracticeAccess',code),access));
const walletPolicy=await load(fs.readFileSync('src/services/rewards/content.ts','utf8'));
globalThis.__freeRewardFixture={doc,collection,getDoc,getDocs,setDoc,runTransaction,auth:{currentUser:{uid:'u'}},db:student,gradePractice,SelfPracticeService:{list:async()=>[]},curatedTraditionQuizzes:[],bindRewardIdentity:async i=>{await setDoc(doc(student,'rewardAccess','u'),{classId:i.classId,studentId:i.studentId,roomId:i.roomId||'',accessCode:i.accessCode||''});},...policy,...walletPolicy};
const serviceSource=ts.transpileModule(fs.readFileSync('src/services/rewards/FreeRewardService.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/^import .*;\n/gm,'');
const service=await import('data:text/javascript;base64,'+Buffer.from('const {doc,collection,getDoc,getDocs,setDoc,runTransaction,auth,db,gradePractice,SelfPracticeService,curatedTraditionQuizzes,advanceAttempt,attemptPoints,emptyPoints,creditWallet,bindRewardIdentity}=globalThis.__freeRewardFixture;\n'+serviceSource).toString('base64'));
await prepare('actual-service',bank);const actualGrade=policy.prepareRewardResult(bank,gradePractice(bank,answers));
await assertSucceeds(setDoc(doc(student,'selfPracticeWork','service-work'),{id:'service-work',teacherId:'t',classId:'c',className:'4A',studentId:'s',studentName:'An',quizId:'actual-service',quizTitle:'Đề',subject:'Toán',submittedAt:'now',kind:'QUIZ',result:actualGrade,rewardVersion:2,accessCode:code,authUid:'u'}));
const identity={classId:'c',studentId:'s',accessCode:code};
await service.FreeRewardService.refresh(identity,'VIEW');await service.FreeRewardService.recordPractice(identity,'service-work');await service.FreeRewardService.recordPractice(identity,'service-work');
if((await getDoc(pointRef)).data().currentPoints!==70)throw Error('Actual service failed best-only resumable recording');
const actualWallet=await service.FreeRewardService.refresh(identity,'CLAIM');if(actualWallet.totalPoints!==70||actualWallet.spentBadges!==3||actualWallet.equippedAvatar!=='cat')throw Error('Actual self-claim must preserve purchase and grades');
console.log('PASS free reward rules: canonical answer proofs, forged score/cursor denial, weighted normalization, 200-question support, best-only retries, atomic source/ledger, self-claim thresholds, preserved avatar spend, identity and revocation.');
}finally{await env.cleanup();}})().catch(e=>{console.error(e);process.exit(1)});
