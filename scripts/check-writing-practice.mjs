import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const lessons=JSON.parse(fs.readFileSync('src/data/writing/lessons.json','utf8'));
assert.equal(lessons.length,35);
assert.deepEqual(lessons.map(l=>l.week),Array.from({length:35},(_,i)=>i+1));
assert.equal(new Set(lessons.map(l=>l.prompt)).size,35);
assert.equal(new Set(lessons.map(l=>l.model)).size,35);
for(const l of lessons){assert.equal(l.outline.length,3);assert.equal(l.checklist.length,3);assert.ok(l.model.split(/\s+/).length>=70,`Tuần ${l.week} có gợi ý đủ nội dung theo thể loại`);assert.ok(l.sourceBook&&l.sourcePages?.length&&l.sourceNote,`Tuần ${l.week} có căn cứ sách`);}
const catalogueSource=ts.transpileModule(fs.readFileSync('src/data/writing/index.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/import data from ['"]\.\/lessons\.json['"];?/, 'const data='+JSON.stringify(lessons)+';');
const {weeklyWritingSets,withWeeklyWritingSets}=await import('data:text/javascript;base64,'+Buffer.from(catalogueSource).toString('base64'));
assert.equal(weeklyWritingSets.length,35);assert.equal(new Set(weeklyWritingSets.map(q=>q.id)).size,35);assert(weeklyWritingSets.every(q=>q.questions.length===0));
const legacy={...weeklyWritingSets[0],id:'legacy',questions:Array(5).fill({id:'old'})};
const math={...legacy,id:'math',subject:'Toán'},exam={...legacy,id:'writing-exam',category:'EXAM'},grade5={...legacy,id:'grade5',grade:'Khối 5'};
const inputs=[legacy,math,exam,grade5,...weeklyWritingSets];
const catalogue=withWeeklyWritingSets(inputs);
assert.equal(catalogue.length,38);assert(!catalogue.some(q=>q.id==='legacy'));assert(catalogue.includes(math)&&catalogue.includes(exam)&&catalogue.includes(grade5));assert.equal(inputs.length,39);
const source=fs.readFileSync('src/components/writing/WritingPracticeRunner.tsx','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const tmp=new URL('../src/components/writing/.runner-test.mjs',import.meta.url);
fs.writeFileSync(tmp,compiled);
try{
 const {WritingPracticeRunner}=await import(tmp.href);
 let value=null;globalThis.localStorage={getItem:()=>value};
 const render=()=>renderToStaticMarkup(createElement(WritingPracticeRunner,{lesson:lessons[0],onBack:()=>{}}));
 let html=render();assert.equal((html.match(/<textarea/g)||[]).length,1);assert.ok(!html.includes('Xem gợi ý'));assert.ok(!html.includes(lessons[0].model.slice(0,70)));
 value=JSON.stringify({outline:['a','b','c'],essay:'Bài đã viết',checked:[true,true,true],completed:true});
 html=render();assert.ok(html.includes('Xem gợi ý'));assert.ok(!html.includes(lessons[0].model.slice(0,70)));
 value='{bad';assert.doesNotThrow(render);
 const revised=lessons.find(l=>l.week===15);assert.equal(revised.curriculumRevision,'sgk4-2026-v3');
 const oldDraft={outline:['Ý cũ 1','Ý cũ 2','Ý cũ 3'],essay:'Bản nháp v2 của học sinh A',checked:[true,true,true],completed:true};
 const savedDrafts=new Map([
  ['writing-practice-sgk4-2026-v2-week-15-student-A',JSON.stringify(oldDraft)],
  ['writing-practice-v1-week-15-student-A',JSON.stringify({...oldDraft,essay:'Bản nháp v1 của học sinh A'})],
  ['writing-practice-sgk4-2026-v2-week-15-student-B',JSON.stringify({...oldDraft,essay:'Bài riêng của học sinh B'})]
 ]);
 globalThis.localStorage={getItem:key=>savedDrafts.get(key)||null};
 let revisedHtml=renderToStaticMarkup(createElement(WritingPracticeRunner,{lesson:revised,studentKey:'student-A',onBack:()=>{}}));
 assert.ok(revisedHtml.includes('Bản nháp v2 của học sinh A'));assert.ok(revisedHtml.includes('Bản nháp v1 của học sinh A'));
 assert.ok(!revisedHtml.includes('Bài riêng của học sinh B'));assert.ok(!revisedHtml.includes('Xem gợi ý'));assert.ok(!revisedHtml.includes('readonly'));
 savedDrafts.set('writing-practice-sgk4-2026-v3-week-15-student-A',JSON.stringify({...oldDraft,essay:'Bài theo đề mới'}));
 revisedHtml=renderToStaticMarkup(createElement(WritingPracticeRunner,{lesson:revised,studentKey:'student-A',onBack:()=>{}}));
 assert.ok(revisedHtml.includes('Bài theo đề mới'));assert.ok(revisedHtml.includes('Xem gợi ý'));
 savedDrafts.set('writing-practice-sgk4-2026-v2-week-15-student-A','{broken');
 assert.doesNotThrow(()=>renderToStaticMarkup(createElement(WritingPracticeRunner,{lesson:revised,studentKey:'student-A',onBack:()=>{}})));
 console.log('PASS: 35 distinct lessons, complete hints, one direct essay field, hint gated and hidden until clicked, corrupted draft recovery.');
}finally{fs.unlinkSync(tmp);delete globalThis.localStorage;}
