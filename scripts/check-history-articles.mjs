import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
async function load(path){const {outputText}=ts.transpileModule(await fs.readFile(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});return import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));}
const {parseArticle,presentationTemplate,inferHistoryTopic}=await load('src/services/tradition/articleText.ts');
const {heritageCatalog}=await load('src/data/heritageCatalog.ts');
assert.deepEqual(parseArticle('# Vị trí\nDi tích nằm ở địa phương.\n\nĐoạn thứ hai.\n\n## Giá trị\nMột đoạn khác.'),[{title:'Vị trí',paragraphs:['Di tích nằm ở địa phương.','Đoạn thứ hai.']},{title:'Giá trị',paragraphs:['Một đoạn khác.']}]);
assert.deepEqual(parseArticle('Mở bài.\r\n\r\n# Bối cảnh\r\nNội dung.\r\n## Kết luận\r\nLời kết.'),[{title:'Mở đầu',paragraphs:['Mở bài.']},{title:'Bối cảnh',paragraphs:['Nội dung.']},{title:'Kết luận',paragraphs:['Lời kết.']}]);
assert.deepEqual(parseArticle(''),[]);
for(const record of heritageCatalog.filter(r=>r.detail)){
 const sections=parseArticle(record.detail);assert.ok(sections.length>=4,record.id);assert.ok(sections.every(s=>s.title&&!s.title.includes('\n')&&s.paragraphs.length),record.id);
 const words=record.detail.replace(/^#{1,3}\s*/gm,'').split(/\s+/).filter(Boolean);
 assert.deepEqual(sections.flatMap(s=>[s.title,...s.paragraphs]).join(' ').split(/\s+/).filter(Boolean),words,record.id+' preserves every word');
}
assert.equal(inferHistoryTopic('Đền Mục – Đền thờ Lý Nam Đế'),'SITE');assert.equal(inferHistoryTopic('Lý Bí và khát vọng độc lập'),'PERSON');assert.equal(inferHistoryTopic('Khởi nghĩa Thái Nguyên năm 1917'),'EVENT');
for(const topic of ['SITE','PERSON','EVENT']){const sections=parseArticle(presentationTemplate(topic));assert.equal(sections[0].title,'Mở đầu');assert.ok(sections.some(s=>s.title==='Kết luận'));assert.ok(sections.length>=7);assert.ok(sections.every(s=>!s.paragraphs.length),'Template contains no invented historical claims');}
console.log('PASS: article headings/body separation, legacy text preservation, CRLF and adjacent headings, topic classification, and three presentation templates.');

const {curatedHistoryArticles}=await load('src/data/historyArticles.ts');
const {bookCultureArticles}=await load('src/data/bookCultureArticles.ts');
const {curatedTraditionMaterials}=await load('src/data/traditionMaterials.ts');
const ids=new Set();
for(const article of [...curatedHistoryArticles,...bookCultureArticles,...curatedTraditionMaterials.filter(m=>m.kind==='HISTORY'||m.kind==='CULTURE')]){
 assert.ok(!ids.has(article.id),'unique article '+article.id);ids.add(article.id);
 assert.ok(article.source.trim(),article.id+' has source');
 assert.ok(!article.sourceUrl || new URL(article.sourceUrl).protocol==='https:',article.id+' safe source');
 const sections=parseArticle(article.text);assert.ok(sections.length>=5,article.id+' substantial structure');
 assert.ok(sections.every(s=>s.paragraphs.length),article.id+' no empty outlines');
 assert.ok(article.text.split(/\s+/).length>200,article.id+' connected reading');
 if(article.source.includes('tệp giáo viên'))assert.match(article.source,/trang \d/);
}
for(const media of curatedTraditionMaterials.filter(m=>m.kind==='IMAGE'||m.kind==='VIDEO')){
 assert.ok(!ids.has(media.id),'unique media '+media.id);ids.add(media.id);
 assert.ok(media.title.trim() && media.text.trim() && media.source.trim(),media.id+' complete metadata');
 assert.equal(new URL(media.mediaUrl).protocol,'https:',media.id+' safe mediaUrl');
 assert.equal(new URL(media.sourceUrl).protocol,'https:',media.id+' safe sourceUrl');
}
const allMaterials=[...bookCultureArticles,...curatedTraditionMaterials];
for(const kind of ['HISTORY','CULTURE','IMAGE','VIDEO'])assert.ok(allMaterials.some(m=>m.kind===kind),'has material kind '+kind);
for(const topic of ['SITE','PERSON','EVENT'])assert.ok(curatedHistoryArticles.some(a=>a.historyTopic===topic));
assert.ok(curatedHistoryArticles.every(a=>a.question&&a.answer));
assert.match(curatedHistoryArticles.find(a=>a.id==='reading-nguom').text,/báo cáo sơ bộ/i);
assert.doesNotMatch(heritageCatalog.find(a=>a.id==='than-sa').detail,/30.000 đến 10.000/);
console.log('PASS: sourced historical and cultural reading, nonempty sections, book page citations, questions, media materials and updated archaeology scope.');
