import assert from 'node:assert/strict';
import {validateRecovery,prepareRestore} from './restore-five-question-writing.mjs';
import {encode} from './apply-curriculum-corrections.mjs';
const root='projects/lop-hoc-tuong-tac-a62a5/databases/(default)/documents/';
const doc=(path,value)=>({name:root+path,updateTime:'2026-10-16T00:00:00Z',fields:Object.fromEntries(Object.entries(value).map(([k,v])=>[k,encode(v)]))});
const documents=[];
for(let i=0;i<53;i++)documents.push(doc('selfPracticeQuizzes/p'+i,{subject:'Tập làm văn',title:'Tuần '+i,questions:Array.from({length:5},(_,id)=>({id:String(id)}))}));
for(let i=0;i<35;i++){
 documents.push(doc('quizzes/q'+i,{subject:'Tập làm văn',title:'Tuần '+i,questionCount:5}));
 for(let j=0;j<5;j++)documents.push(doc('quizzes/q'+i+'/questions/c'+j,{content:'Câu '+j,correctAnswer:'Đúng'}));
}
const backup={version:'remove-five-writing-20261016',documents};
assert.equal(validateRecovery(backup).length,263);
assert.throws(()=>validateRecovery({...backup,documents:documents.slice(1)}));
assert.throws(()=>validateRecovery({...backup,documents:[...documents,doc('studentWork/unsafe',{content:'forbidden'})]}));
const writes=await prepareRestore(documents,async()=>null);
assert.equal(writes.length,263);
assert(writes.every(w=>w.currentDocument.exists===false));
assert.deepEqual(writes[0].update.fields,documents[0].fields);
assert.equal((await prepareRestore(documents,async name=>documents.find(d=>d.name===name))).length,0);
await assert.rejects(()=>prepareRestore(documents,async()=>({fields:{content:encode('Newer work')}})));
console.log('PASS: exact 263-document recovery, original fields/IDs, no overwrite, idempotent identical data, reject unexpected paths or incomplete backup.');
