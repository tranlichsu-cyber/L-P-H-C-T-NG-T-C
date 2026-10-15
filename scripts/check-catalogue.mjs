import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const compiled=ts.transpileModule(await fs.readFile('src/services/selfPractice/catalogue.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {quizWeeks,catalogueSearch,compareQuiz,withoutRepeatedWritingSets}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
for(const [title,weeks]of [
 ['Bài 32 – Tuần 15–16',[15,16]],['Tuần 18, 19, 20',[18,19,20]],['Tuần 9 đến 11 và 14',[9,10,11,14]],['Tuần 9 - Tuần 11',[9,10,11]],['Tuần 35',[35]],['Week 02',[2]],['Bài 43',[]],['Kiểm tra Toán (8 tuần)',[]],['Tuần 0',[]],['Tuần 36',[]],['Tuần 15–14',[]],['Tuần 100',[]],['Tuần 1–35',Array.from({length:35},(_,i)=>i+1)]
])assert.deepEqual(quizWeeks(title),weeks,title);
assert.ok(catalogueSearch('don viet',['Tuần 13','Tập làm văn','Đơn xin tham gia câu lạc bộ','Tìm hiểu cách viết đơn']));
assert.ok(catalogueSearch('thAi NGUYEN',['Khám phá quê hương Thái Nguyên']));
assert.ok(!catalogueSearch('đơn phân số',['Viết đơn']));
const quiz=(id,title,extra={})=>({id,title,subject:'Toán',grade:'Khối 4',teacherId:'T',published:true,updatedAt:'2026-10-15',questions:[{id:'q'}],...extra});
assert.deepEqual([quiz('b','Bài 10 – Tuần 4'),quiz('a','Bài 2 – Tuần 8')].sort(compareQuiz).map(q=>q.id),['a','b']);
assert.deepEqual([quiz('b','Tuần 10',{subject:'Tiếng Việt'}),quiz('a','Tuần 2',{subject:'Tiếng Việt'})].sort(compareQuiz).map(q=>q.id),['a','b']);
const writing=title=>quiz(title,title,{subject:'Tập làm văn'});
const original=[writing('Tuần 15'),{...writing('Tuần 15'),id:'fuller',questions:[{id:'a'},{id:'b'}]},writing('Tuần 15–16'),quiz('exam','Tuần 15',{subject:'Tập làm văn',category:'EXAM'})];
assert.equal(withoutRepeatedWritingSets(original).length,3);assert.ok(withoutRepeatedWritingSets(original).some(q=>q.id==='fuller'));assert.equal(original.length,4);
// Regression fixtures from the real reviewed catalogue, with no server read.
const plan=JSON.parse(await fs.readFile('data-migrations/curriculum-20261015.json','utf8'));
for(const row of plan.quizzes){const match=row.title.match(/Tuần\s+(\d+)[–-](\d+)/);if(match)for(let week=Number(match[1]);week<=Number(match[2]);week++)assert.ok(quizWeeks(row.title).includes(week));}
console.log('PASS: week ranges/lists/boundaries, no false week from lesson numbers or duration, accent-insensitive multiword search, math lesson order, writing duplicate preference and separate exam/multiweek sets.');
