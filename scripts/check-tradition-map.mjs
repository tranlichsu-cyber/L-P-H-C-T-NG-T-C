import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=await fs.readFile(new URL('../src/data/traditionMap.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});
const {traditionMapPlaces:places,traditionMapSource:map}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
assert.equal(places.length,9);
assert.equal(new Set(places.map(p=>p.id)).size,places.length);
assert.equal(new URL(map.url).hostname,'thainguyen.gov.vn');
for(const p of places){
 assert(p.x>0 && p.x<100 && p.y>0 && p.y<100);
 assert(/^(Xã|Phường) /.test(p.name));
 assert(p.sources.length && p.story && p.culture && p.task);
 for(const s of p.sources){const u=new URL(s.url);assert(u.protocol==='https:' && (u.hostname==='thainguyen.gov.vn'||u.hostname.endsWith('.thainguyen.gov.vn')));}
 assert.equal(p.question.options.length,4);
 assert.equal(new Set(p.question.options).size,4);
 assert(Number.isInteger(p.question.correct) && p.question.correct>=0 && p.question.correct<4);
 assert(p.question.explanation);
}
assert(places.find(p=>p.id==='tan-cuong').culture.includes('Căng Bá Vân'));
assert(places.find(p=>p.id==='nghia-ta').story.includes('Nà Pậu'));
assert(places.find(p=>p.id==='ba-be'));
console.log('PASS: 9 khu vực, điểm chọn trong bản đồ, nguồn chính thức, 9 câu hỏi với 4 đáp án hợp lệ; có Bắc Kạn trước sáp nhập.');
