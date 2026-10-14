import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const compile=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const grading=moduleUrl(compile(await fs.readFile('src/services/practice/grading.ts','utf8')));
// Exercise the actual local service; Firebase imports are inactive in mock mode.
const source=compile(await fs.readFile('src/services/selfPractice/studentAccess.ts','utf8'))
 .replace(/^import .* from 'firebase\/[^']+';\n/gm,'')
 .replace(/^import .* from '\.\.\/firebase\/firebase';\n/m,"const auth=null,db=null,isFirebaseConfigured=false;\n")
 .replace("'../practice/grading'",JSON.stringify(grading));
const {StudentAccessService:S,normalizeAccessCode}=await import(moduleUrl(source));
const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
try{
 const group={id:'class1',name:'4A',grade:'Khối 4',students:[{id:'s1',name:'Minh Anh'},{id:'s2',name:'Gia Bảo'}]};
 await S.createCodes(group);const first=await S.listCodes();assert.equal(first.length,2);assert.equal(new Set(first.map(c=>c.code)).size,2);
 await S.createCodes(group);assert.deepEqual(await S.listCodes(),first);
 assert.equal(normalizeAccessCode(' abcd-efgh 2345 '),'ABCDEFGH2345');
 await assert.rejects(()=>S.enter('INVALID'));
 const student=await S.enter(first[0].code.toLowerCase());assert.equal(student.studentId,'s1');
 const quiz={id:'quiz',title:'Toán',subject:'Toán',questions:[{id:'q1',type:'MULTIPLE_CHOICE',content:'2 + 3?',options:['3','4','5','6'],correctAnswer:'C',points:5}]};
 await S.submit(student,quiz,{answers:{q1:'5'}},'attempt1');await S.submit(student,quiz,{answers:{q1:'5'}},'attempt1');
 let works=await S.listWork();assert.equal(works.length,1);assert.equal(works[0].studentId,'s1');assert.equal(works[0].result.earnedPoints,5);assert.equal(works[0].result.breakdown[0].answer,'5');
 await S.submit(student,quiz,{answers:{q1:'4'}},'attempt2');works=await S.listWork();assert.equal(works.length,2);assert.equal(works.find(w=>w.id==='attempt2').result.correctCount,0);
 await S.submit(student,quiz,{outline:[' Mở ','Thân','Kết'],essay:' Bài của em '},'writing');const writing=(await S.listWork()).find(w=>w.id==='writing');assert.equal(writing.kind,'WRITING');assert.equal(writing.essay,'Bài của em');assert.deepEqual(writing.outline,['Mở','Thân','Kết']);
 await S.revoke(student.code);await assert.rejects(()=>S.enter(student.code));await assert.rejects(()=>S.submit(student,quiz,{answers:{}},'revoked'));
 assert.equal((await S.listWork()).length,3);assert.equal((await S.enter(first[1].code)).studentId,'s2');
 console.log('PASS: stable unique personal codes, normalization, bound student, answer/points persistence, delivery deduplication, separate attempts, writing, revocation and retained history.');
}finally{delete globalThis.localStorage;}
