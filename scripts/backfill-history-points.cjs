// One-off, source-based historical reward update. Never modifies grades, earned/spent badges or avatars.
const {initializeApp,applicationDefault}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const fs=require('node:fs/promises'),ts=require('typescript');
const PROJECT='lop-hoc-tuong-tac-a62a5',VERSION='history-points-20261018-v1';
const APPLY=process.argv.includes('--apply');
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
(async()=>{
 const {gradePractice}=await import(moduleUrl(await fs.readFile('src/services/practice/grading.ts','utf8'))),{curatedTraditionQuizzes}=await import(moduleUrl(await fs.readFile('src/data/traditionQuizzes.ts','utf8')));
 const {round,historicalSources,validLedger}=await import('./history-points-policy.mjs');
 initializeApp({projectId:PROJECT,credential:applicationDefault()});const db=getFirestore();
 const report={mode:APPLY?'APPLY':'DRY_RUN',classes:0,students:0,completedRooms:0,archivedRooms:0,attempts:0,sourceUpdates:0,projectedAddedPoints:0,unavailableAttempts:0,pendingAttempts:0,invalidSources:0,inconsistentStudents:0,readDocuments:0,updatedStudents:0,addedPoints:0};
 async function read(query){const snapshot=await query.get();report.readDocuments+=Math.max(1,snapshot.size);if(report.readDocuments>18000)throw Error('READ_BUDGET_EXCEEDED: no further reads or new student updates will run');return snapshot;}
 const classes=(await read(db.collection('classes').limit(501))).docs;if(classes.length>500)throw Error('CLASS_LIMIT_EXCEEDED');
 const groups=[];for(const c of classes){const data=c.data();if(['class-4a','class-4b','class-5a'].includes(c.id)||typeof data.teacherId!=='string')continue;const students=(await read(c.ref.collection('students').limit(1001))).docs;if(students.length>1000)throw Error('STUDENT_LIMIT_EXCEEDED');if(students.length)groups.push({id:c.id,teacherId:data.teacherId,students});}
 report.classes=groups.length;const groupIds=new Set(groups.map(c=>c.id));
 const roomDocs=(await read(db.collection('rooms').where('status','==','FINISHED'))).docs.filter(d=>groupIds.has(d.data().classId));
 report.completedRooms=roomDocs.length;report.archivedRooms=roomDocs.filter(d=>d.data().archived).length;
 const rooms=[];for(const doc of roomDocs){const scores=await read(doc.ref.collection('scores')),events=await read(doc.ref.collection('scoreEvents')),totals=new Map();for(const e of events.docs){const d=e.data();if(typeof d.studentId==='string'&&Number.isFinite(d.points))totals.set(d.studentId,(totals.get(d.studentId)||0)+d.points);else report.invalidSources++;}rooms.push({...doc.data(),id:doc.id,scores:new Map(scores.docs.map(d=>[d.id,d.data()])),events:totals});}
 const works=(await read(db.collection('selfPracticeWork'))).docs.map(d=>d.data()).filter(w=>groupIds.has(w.classId));report.attempts=works.length;
 const banks=new Map(curatedTraditionQuizzes.map(q=>[q.id,{questions:q.questions,version:'2026-10-13'}]));
 for(const q of (await read(db.collection('selfPracticeQuizzes').where('published','==',true))).docs)banks.set(q.id,{questions:q.data().questions,version:q.data().updatedAt});
 // Only recover a private original when the public copy is absent and the owner matches the work's teacher.
 const missing=new Map();for(const w of works)if(w.kind==='QUIZ'&&typeof w.quizId==='string'&&!w.quizId.includes('/')&&!banks.has(w.quizId)&&w.quizId.startsWith(w.teacherId+'_'))missing.set(w.quizId,w.teacherId);
 for(const [id,teacherId]of missing){const source=id.slice(teacherId.length+1);if(!source||source.includes('/'))continue;const meta=await db.doc('quizzes/'+source).get();report.readDocuments++;if(!meta.exists||meta.data().teacherId!==teacherId)continue;const questions=await read(meta.ref.collection('questions'));if(questions.size)banks.set(id,{questions:questions.docs.map(d=>({...d.data(),id:d.id,points:d.data().correctPoints>0?d.data().correctPoints:1}))});}
 const plans=[];
 for(const group of groups)for(const student of group.students){report.students++;const pointRef=group.id&&db.doc('classes/'+group.id+'/rewardPoints/'+student.id),ledger=await pointRef.get();report.readDocuments++;
  const credits=[];for(const [kind,path]of [['room','roomCredits'],['quiz','quizCredits']])for(const d of (await read(pointRef.collection(path))).docs)credits.push({kind,id:d.id,points:d.data().points});
  if(!validLedger(ledger.data(),credits)){report.inconsistentStudents++;continue;}
  const plan=historicalSources({classId:group.id,studentId:student.id,teacherId:group.teacherId,rooms,works,banks,gradePractice});
  report.unavailableAttempts+=plan.unavailable;report.pendingAttempts+=plan.pending;report.invalidSources+=plan.invalid;
  const existing=new Map(credits.map(c=>[c.kind+':'+c.id,c.points]));
  for(const source of plan.sources){const delta=round(Math.max(0,source.points-(existing.get(source.kind+':'+source.id)||0)));if(delta){report.sourceUpdates++;report.projectedAddedPoints=round(report.projectedAddedPoints+delta);}}
  plans.push({pointRef,...plan,sources:plan.sources.filter(source=>source.points>(existing.get(source.kind+':'+source.id)||0))});
 }
 if(report.sourceUpdates+plans.length>5000)throw Error('WRITE_BUDGET_EXCEEDED');
 console.log('::notice::HISTORY_POINTS_PLAN='+JSON.stringify(report));
 if(!APPLY)return;
 for(const plan of plans){let changed=false;
  for(let offset=0;offset<plan.sources.length;offset+=50){const sources=plan.sources.slice(offset,offset+50),refs=sources.map(s=>plan.pointRef.collection(s.kind==='quiz'?'quizCredits':'roomCredits').doc(s.id));
   const added=await db.runTransaction(async tx=>{const snaps=await tx.getAll(plan.pointRef,...refs),before=snaps[0].exists?snaps[0].data():{currentPoints:0,livePoints:0,practicePoints:0,legacyImported:false,updatedAt:'',sourceId:''};
    if(!['currentPoints','livePoints','practicePoints'].every(k=>Number.isFinite(before[k])&&before[k]>=0))throw Error('INVALID_LEDGER_DURING_APPLY');
    const next={...before};let deltaTotal=0;const now=new Date().toISOString();
    sources.forEach((source,index)=>{const old=snaps[index+1].exists?snaps[index+1].data().points:0;if(!Number.isFinite(old)||old<0)throw Error('INVALID_SOURCE_DURING_APPLY');if(source.points<=old)return;const delta=round(source.points-old),field=source.kind==='quiz'?'practicePoints':'livePoints';next[field]=round(next[field]+delta);next.sourceId=source.id;deltaTotal=round(deltaTotal+delta);tx.set(refs[index],{points:source.points,attemptId:VERSION,updatedAt:now});});
    if(deltaTotal){next.currentPoints=round(next.livePoints+next.practicePoints);if(next.currentPoints>1e9)throw Error('POINT_LIMIT_EXCEEDED');next.updatedAt=now;tx.set(plan.pointRef,next);}return deltaTotal;
   });if(added){changed=true;report.addedPoints=round(report.addedPoints+added);}
  }
  await db.runTransaction(async tx=>{const snap=await tx.get(plan.pointRef),before=snap.exists?snap.data():{currentPoints:0,livePoints:0,practicePoints:0,legacyImported:false,sourceId:''};const verified=plan.unavailable===0&&plan.invalid===0;if(!snap.exists||before.legacyImported!==verified)tx.set(plan.pointRef,{...before,currentPoints:round(before.livePoints+before.practicePoints),legacyImported:verified,updatedAt:new Date().toISOString()});});
  if(changed)report.updatedStudents++;
 }
 await db.doc('systemMigrations/'+VERSION).set({...report,completedAt:new Date().toISOString(),walletsChanged:false,gradesChanged:false});
 console.log('::notice::HISTORY_POINTS_COMPLETED='+JSON.stringify(report));
})().catch(error=>{const reason=/^[A-Z_]+(?::|$)/.test(error.message||'')?error.message.split(':')[0]:'REQUEST_FAILED';console.log('::error::Historical point update stopped; code='+(error.code||'LOCAL')+'; reason='+reason);process.exit(1)});
