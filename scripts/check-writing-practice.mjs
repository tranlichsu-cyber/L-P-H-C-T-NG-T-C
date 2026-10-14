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
const source=fs.readFileSync('src/components/writing/WritingPracticeRunner.tsx','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const tmp=new URL('../src/components/writing/.runner-test.mjs',import.meta.url);
fs.writeFileSync(tmp,compiled);
try{
 const {WritingPracticeRunner}=await import(tmp.href);
 let value=null;globalThis.localStorage={getItem:()=>value};
 const render=()=>renderToStaticMarkup(createElement(WritingPracticeRunner,{lesson:lessons[0],onBack:()=>{}}));
 let html=render();assert.equal((html.match(/<textarea/g)||[]).length,4);assert.ok(!html.includes('Xem gợi ý'));assert.ok(!html.includes(lessons[0].model.slice(0,70)));
 value=JSON.stringify({outline:['a','b','c'],essay:'Bài đã viết',checked:[true,true,true],completed:true});
 html=render();assert.ok(html.includes('Xem gợi ý'));assert.ok(!html.includes(lessons[0].model.slice(0,70)));
 value='{bad';assert.doesNotThrow(render);
 console.log('PASS: 35 distinct lessons, complete hints, four writing fields, hint gated and hidden until clicked, corrupted draft recovery.');
}finally{fs.unlinkSync(tmp);delete globalThis.localStorage;}
