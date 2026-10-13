import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=await fs.readFile(new URL('../src/data/traditionMap.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});
const {traditionMapPlaces:places,traditionMapSource:map,matchesMapPlace,matchingMapSites}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
assert.equal(places.length,10);
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
const sites=places.flatMap(p=>p.sites||[]);
assert.equal(sites.length,6);
assert.equal(new Set(sites.map(s=>s.id)).size,sites.length);
for(const site of sites){
 assert(site.address && site.sources.length && site.story && site.culture && site.task);
 assert.equal(site.question.options.length,4);assert.equal(new Set(site.question.options).size,4);
 assert(site.question.correct>=0 && site.question.correct<4);
 for(const source of site.sources)assert(new URL(source.url).hostname.endsWith('thainguyen.gov.vn'));
 if(site.image)assert(new URL(site.image.url).protocol==='https:' && site.image.caption);
}
const tan=places.find(p=>p.id==='tan-cuong');
assert(matchesMapPlace(tan,'GHENH CHE','Thiên nhiên'));
assert(!matchesMapPlace(tan,'GHENH CHE','Lịch sử'));
assert.equal(matchingMapSites(tan,'cang ba van','Lịch sử')[0].id,'cang-ba-van');
assert(matchesMapPlace(places.find(p=>p.id==='van-phu'),'dai tu','Tất cả'));
assert(!places.some(p=>matchesMapPlace(p,'zzzzzz','Tất cả')));
assert(sites.find(s=>s.id==='chua-ba-xuyen').address.includes('Phường Bá Xuyên'));
console.log('PASS: 10 khu vực, 6 địa điểm có địa chỉ và nguồn, 16 câu hỏi bốn đáp án; tìm không dấu và lọc chủ đề theo địa điểm.');
