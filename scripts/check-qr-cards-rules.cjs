const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const req=require('node:module').createRequire(require.resolve('@firebase/rules-unit-testing'));
const {doc,setDoc,updateDoc,getDoc,runTransaction,serverTimestamp,increment}=req('firebase/firestore');
const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
const load=source=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
(async()=>{const env=await initializeTestEnvironment({projectId:'demo-self-practice',firestore:{rules:fs.readFileSync('firestore.rules','utf8')}});await env.clearFirestore();try{
 const teacher=env.authenticatedContext('t',{firebase:{sign_in_provider:'password'}}).firestore(),other=env.authenticatedContext('other',{firebase:{sign_in_provider:'password'}}).firestore(),pupil=env.authenticatedContext('u',{firebase:{sign_in_provider:'anonymous'}}).firestore();
 await env.withSecurityRulesDisabled(async c=>{const db=c.firestore();for(const id of ['t','other'])await setDoc(doc(db,'users',id),{status:'ACTIVE',role:'TEACHER'});await setDoc(doc(db,'rooms','r'),{teacherId:'t',classId:'c',status:'ACTIVE',activeQuestionId:'q',participantCount:0});await setDoc(doc(db,'rooms','r','liveQuestions','q'),{id:'q',type:'MULTIPLE_CHOICE',status:'OPEN',options:['1','2','3','4']});for(const id of ['s','s2','s3'])await setDoc(doc(db,'rooms','r','roster',id),{studentId:id,name:'Em '+id});});
 const answer=(studentId='s')=>({questionId:'q',studentId,studentName:'Em '+studentId,authUid:'t',source:'QR_CARD',answer:'B',submittedAt:serverTimestamp()});
 const ref=(db,id='s')=>doc(db,'rooms','r','submissions','q_'+id);
 await assertFails(setDoc(ref(pupil),{...answer(),authUid:'u'}));await assertFails(setDoc(ref(other),{...answer(),authUid:'other'}));await assertFails(setDoc(ref(teacher),{...answer(),studentName:'Giả tên'}));await assertFails(setDoc(ref(teacher,'outsider'),answer('outsider')));await assertFails(setDoc(ref(teacher),{...answer(),answer:'E'}));
 await assertSucceeds(runTransaction(teacher,async tx=>{tx.set(doc(teacher,'rooms','r','participants','s'),{studentId:'s',name:'Em s',mockAuthUid:'',sessionToken:'',responseMode:'QR_CARD',joinedAt:serverTimestamp(),lastSeenAt:serverTimestamp()});tx.update(doc(teacher,'rooms','r'),{participantCount:1});tx.set(ref(teacher),answer());}));
 assert.equal((await getDoc(ref(teacher))).data().answer,'B');
 await assertSucceeds(updateDoc(doc(pupil,'rooms','r','participants','s'),{mockAuthUid:'u',sessionToken:'new'}));
 await assertFails(setDoc(ref(teacher,'s2'),{...answer('s2'),submittedAt:'not-server-time'}));
 for(const change of [{activeQuestionId:'another'},{status:'FINISHED'},{activeGame:{status:'PAUSED'}},{activeGame:{status:'RUNNING',type:'QUICK_ANSWER',roundQuestionId:'q',roundDeadlineAt:1}}]){await updateDoc(doc(teacher,'rooms','r'),change);await assertFails(setDoc(ref(teacher,'s2'),answer('s2')));await updateDoc(doc(teacher,'rooms','r'),{status:'ACTIVE',activeQuestionId:'q',activeGame:null});}
 await updateDoc(doc(teacher,'rooms','r','liveQuestions','q'),{status:'CLOSED'});await assertFails(setDoc(ref(teacher,'s2'),answer('s2')));await updateDoc(doc(teacher,'rooms','r','liveQuestions','q'),{status:'OPEN',options:['1','2']});await assertFails(setDoc(ref(teacher,'s2'),{...answer('s2'),answer:'D'}));await updateDoc(doc(teacher,'rooms','r','liveQuestions','q'),{type:'SHORT_ANSWER'});await assertFails(setDoc(ref(teacher,'s2'),answer('s2')));
 // Run the application's transaction itself: simultaneous scans cannot overwrite an answer.
 await updateDoc(doc(teacher,'rooms','r','liveQuestions','q'),{type:'MULTIPLE_CHOICE',status:'OPEN',options:['1','2','3','4']});
 const policy=await load(fs.readFileSync('src/services/realtime/gamePolicy.ts','utf8'));
 const qr=await load('const gameAcceptsAnswer='+policy.gameAcceptsAnswer.toString()+';\n'+fs.readFileSync('src/services/qr/cards.ts','utf8').replace(/^import .*;\n/gm,''));
 globalThis.__qrRuleFixture={doc,runTransaction,serverTimestamp,increment,auth:{currentUser:{uid:'t',isAnonymous:false}},db:teacher,...qr,createSharedSubscriptions:()=>()=>{}};
 const source=ts.transpileModule(fs.readFileSync('src/services/firebase/FirestoreRealtimeService.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/^import .*;\n/gm,'');
 const module=await load('const {doc,runTransaction,serverTimestamp,increment,auth,db,canScanQuestion,qrAnswer,createSharedSubscriptions}=globalThis.__qrRuleFixture;\n'+source);
 const service=new module.FirestoreRealtimeService();
 const outcomes=await Promise.all([service.submitQrAnswer('r','q','s3','B'),service.submitQrAnswer('r','q','s3','D')]);
 assert.equal(outcomes.filter(o=>o.success).length,1);assert(['B','D'].includes((await getDoc(ref(teacher,'s3'))).data().answer));assert.equal((await getDoc(doc(teacher,'rooms','r'))).data().participantCount,2);
 await updateDoc(doc(teacher,'rooms','r'),{activeQuestionId:'different'});assert.equal((await service.submitQrAnswer('r','q','s2','A')).success,false);
 console.log('PASS QR Firestore rules: teacher-only recording, roster identity, server time, atomic attendance, normal device join, active question, closure, paused/expired games, type and option bounds.');
 }finally{await env.cleanup();}})().catch(e=>{console.error(e);process.exit(1)});
