import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const curriculum=JSON.parse(fs.readFileSync('src/data/curriculum/grade4.json','utf8'));
const writing=JSON.parse(fs.readFileSync('src/data/writing/lessons.json','utf8'));
const data=JSON.parse(fs.readFileSync('src/data/mindmaps/grade4.json','utf8'));
const maps=data.maps,byId=new Map(maps.map(m=>[m.id,m]));
assert.equal(maps.length,263);assert.equal(byId.size,maps.length);
for(const lesson of curriculum.lessons){const map=byId.get(lesson.id);assert.ok(map,lesson.id);for(const key of ['title','book','number','subject'])assert.equal(map[key],lesson[key],`${lesson.id}: ${key}`);assert.equal(map.sourcePages[0],lesson.printedPage);if(map.subject!=='Tiếng Việt')assert.equal(map.week,null,'No invented week mapping outside Vietnamese');}
for(const w of curriculum.weeks){const language=byId.get(`language-${w.week}`),essay=byId.get(`writing-${w.week}`);assert.equal(language.section,'Luyện từ và câu');assert.equal(language.title,w.language);assert.equal(language.book,w.book);assert.equal(essay.section,'Tập làm văn');assert.equal(essay.title,writing[w.week-1].topic);assert.deepEqual(essay.sourcePages,w.writingPages);assert.deepEqual(essay.branches[1].items,writing[w.week-1].outline);assert.ok(w.readingIds.every(id=>byId.get(id).week===w.week));}
for(const m of maps){assert.ok(curriculum.books[m.book]);assert.ok(m.branches.length>=3&&m.branches.length<=4,m.id);assert.equal(new Set(m.branches.map(b=>b.title)).size,m.branches.length);assert.ok(m.sourcePages.every(p=>Number.isInteger(p)&&p>0&&p<200));assert.ok(m.sourceLabel);for(const b of m.branches){assert.ok(b.items.length>=1&&b.items.length<=4,m.id);for(const item of b.items){assert.ok(item.trim().length>=8,m.id);assert.doesNotMatch(item,/TODO|TBD|đang biên soạn|nội dung mẫu/i);}}}
const text=id=>byId.get(id).branches.flatMap(b=>b.items).join(' ');
assert.match(text('historygeo-5'),/Mù Cang Chải, Sa Pa ở Lào Cai/);assert.match(text('historygeo-5'),/Hoàng Su Phì ở Tuyên Quang/);assert.match(text('historygeo-20'),/thành phố Đà Nẵng/);
assert.match(text('math2-60'),/Không cộng hai mẫu/);assert.match(text('math2-64'),/Chỉ đảo phân số thứ hai/);assert.match(text('math1-19'),/2001.*2100/);
assert.match(text('science-21'),/không thể xác định an toàn chỉ bằng màu sắc/);assert.match(text('science-27'),/Không tự nhảy xuống nước/);assert.match(text('science-29'),/không đảo chiều/);
assert.match(text('tv1-23'),/giai thoại/);assert.match(text('tv2-25'),/nhiều động vật/);assert.doesNotMatch(text('tv2-25'),/25 000 loài/);
let code=fs.readFileSync('src/services/curriculum/mindmaps.ts','utf8').replace("import content from '../../data/mindmaps/grade4.json';",'const content='+JSON.stringify(data)+';').replace("import {curriculumText, grade4Curriculum} from './grade4';",'const grade4Curriculum='+JSON.stringify(curriculum)+'; const curriculumText='+`(s)=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();`);
const output=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {filterLessonMaps}=await import('data:text/javascript;base64,'+Buffer.from(output).toString('base64'));
assert.equal(filterLessonMaps('Toán','','','').length,73);
assert.equal(filterLessonMaps('Khoa học','','','').length,31);
assert.equal(filterLessonMaps('Lịch sử và Địa lí','','','').length,27);
assert.equal(filterLessonMaps('Tiếng Việt','Đọc hiểu','tv1','').length,32);
assert.equal(filterLessonMaps('Tiếng Việt','Đọc hiểu','tv2','').length,30);
for(const section of ['Luyện từ và câu','Tập làm văn']){assert.equal(filterLessonMaps('Tiếng Việt',section,'tv1','').length,18);assert.equal(filterLessonMaps('Tiếng Việt',section,'tv2','').length,17);}
assert.equal(filterLessonMaps('Tiếng Việt','Luyện từ và câu','tv1','danh tu chung')[0].id,'language-2');assert.equal(filterLessonMaps('Toán','','math2','chia phan so')[0].id,'math2-64');assert.equal(filterLessonMaps('Khoa học','','','khong co bai nay').length,0);
const page=fs.readFileSync('src/pages/LessonMapsPage.tsx','utf8');assert.doesNotMatch(page,/firebase|Firestore|fetch\(/);assert.match(fs.readFileSync('src/App.tsx','utf8'),/so-do-tu-duy\/:lessonId/);
console.log('PASS: 193 numbered textbook lessons + 35 language weeks + 35 writing weeks; exact identities, source pages, separate Vietnamese sections, ordered books, accent-insensitive search, key factual/safety regressions and static library.');
