import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {prepareCorrections,encode,decode} from './apply-curriculum-corrections.mjs';
const plan=JSON.parse(await fs.readFile('data-migrations/curriculum-20261015.json','utf8'));
const documents=new Map();const root='projects/lop-hoc-tuong-tac-a62a5/databases/(default)/documents/';
function doc(relative,value){const item={name:root+relative,fields:encode(value).mapValue.fields,updateTime:'2026-10-15T13:40:00.000000Z'};documents.set(relative,item);return item;}
for(const quiz of plan.quizzes){
 const uid=quiz.id.slice(0,quiz.id.indexOf('_')),sourceId=quiz.id.slice(uid.length+1);
 doc('selfPracticeQuizzes/'+quiz.id,{...quiz,questions:quiz.expectedQuestions,published:true,teacherId:uid});
 doc('quizzes/'+sourceId,{teacherId:uid,title:quiz.title});
 for(const change of quiz.questions)doc(`quizzes/${sourceId}/questions/${change.id}`,change.before);
}
const read=async key=>structuredClone(documents.get(key)||null);
const prepared=await prepareCorrections(plan,read,'2026-10-15T14:00:00.000Z');
assert.equal(prepared.summary.publicQuizzes,60);assert.equal(prepared.summary.sourceQuestions,76);assert.equal(prepared.writes.length,136);
assert.equal(prepared.rollback.length,136);assert.equal(prepared.summary.missingSources.length,0);
for(const write of prepared.writes){assert.equal(write.currentDocument.updateTime,'2026-10-15T13:40:00.000000Z');assert.ok(/\/documents\/(selfPracticeQuizzes\/[^/]+|quizzes\/[^/]+\/questions\/[^/]+)$/.test(write.update.name));assert.ok(!write.update.name.includes('/students/'));}
const first=plan.quizzes[0];const firstRelative='selfPracticeQuizzes/'+first.id;const original=structuredClone(documents.get(firstRelative));
documents.get(firstRelative).fields.title={stringValue:'Teacher edited the title'};
await assert.rejects(()=>prepareCorrections(plan,read),/changed after review/);documents.set(firstRelative,original);
const sourceId=first.id.slice(first.id.indexOf('_')+1),sourceRelative=`quizzes/${sourceId}/questions/${first.questions[0].id}`;const originalSource=structuredClone(documents.get(sourceRelative));
documents.get(sourceRelative).fields.content={stringValue:'Teacher edited this question'};
await assert.rejects(()=>prepareCorrections(plan,read),/changed after publication/);documents.set(sourceRelative,originalSource);
const current=decode({mapValue:{fields:originalSource.fields}});
doc(sourceRelative,{...current,...first.questions[0].changes});const already=await prepareCorrections(plan,read);assert.equal(already.summary.alreadyCorrectSources,1);assert.equal(already.writes.length,135);documents.set(sourceRelative,originalSource);
documents.delete(sourceRelative);const missing=await prepareCorrections(plan,read);assert.equal(missing.summary.missingSources.length,1);assert.equal(missing.writes.length,135);documents.set(sourceRelative,originalSource);
const badPlan=structuredClone(plan);badPlan.quizzes[0].questions[0].changes.score=10;await assert.rejects(()=>prepareCorrections(badPlan,read),/may only change learning content/);
const writing=plan.quizzes.filter(q=>q.subject==='Tập làm văn');assert.equal(writing.length,53);
for(const q of writing){const change=q.questions.find(q=>q.id===q.before.id&&q.before.content.startsWith('Tuần'));assert.ok(change?.changes.explanation.includes('Nguồn: Tiếng Việt 4'));}
const spelling=plan.quizzes.filter(q=>q.subject==='Tiếng Việt').flatMap(q=>q.questions).filter(q=>q.changes.caseInsensitive===false);assert.equal(spelling.length,4);
const numbers=plan.quizzes.filter(q=>q.subject==='Toán').flatMap(q=>q.questions).filter(q=>q.changes.correctAnswer);assert.deepEqual(numbers.map(q=>q.changes.correctAnswer).sort(),['1296','735','960']);
console.log('PASS: 60 reviewed public quizzes, 76 question corrections, paired source updates, exact field masks, concurrency preconditions, rollback records, changed-source rejection, missing-source reporting and content-only writes.');
