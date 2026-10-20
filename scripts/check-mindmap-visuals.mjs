import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const maps=JSON.parse(fs.readFileSync('src/data/mindmaps/grade4.json','utf8')).maps;
let source=fs.readFileSync('src/components/learning/mindmapVisuals.ts','utf8');
source=source.replace(/import \{([^}]+)\} from 'lucide-react';/,(_,names)=>'const '+names.split(',').map(n=>`${n.trim()}=${JSON.stringify(n.trim())}`).join(',')+';').replace("import {curriculumText} from '../../services/curriculum/grade4';",`const curriculumText=(s)=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();`);
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {branchPalette,artPositions,lessonArt,centralTitle,branchIcon}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
assert.equal(branchPalette.length,4);assert.equal(new Set(branchPalette.map(c=>c.line)).size,4);
for(const m of maps){const title=centralTitle(m);assert.ok(title.trim().length>0&&title.length<110,m.id);assert.ok(artPositions[lessonArt(m.subject,m.section,m.title)],m.id);assert.ok(m.branches.every(b=>branchIcon(b.title,m.subject)));}
for(const [title,art] of [['Làm ruộng bậc thang','terraces'],['Xây dựng thủy điện','dam'],['Khai thác khoáng sản','minerals']])assert.equal(lessonArt('Lịch sử và Địa lí','Bài học',title),art);
for(const [title,art] of [['Âm thanh và sự truyền âm thanh','sound'],['Nhiệt độ và sự truyền nhiệt','heat'],['Đặc điểm chung của nấm','fungi'],['Động vật cần gì để sống?','animals'],['Chế độ ăn uống cân bằng','food'],['Không khí có ở đâu?','air'],['Sự chuyển thể của nước','water']])assert.equal(lessonArt('Khoa học','Bài học',title),art);
assert.equal(lessonArt('Tiếng Việt','Tập làm văn','Viết thư'),'writing');
assert.equal(lessonArt('Tiếng Việt','Đọc hiểu','Cảm xúc Trường Sa'),'reading');
assert.equal(lessonArt('Khoa học','Bài học','Sự ô nhiễm và bảo vệ nguồn nước'),'water');
assert.equal(lessonArt('Khoa học','Bài học','Vai trò của không khí và bảo vệ bầu không khí trong lành'),'air');
assert.equal(branchIcon('Văn hóa Nam Bộ','Lịch sử và Địa lí'),'Landmark','Do not confuse Nam Bộ with a mine');
for(const file of ['mindmap-scenes-20261021.png','mindmap-science-20261021.png']){const bytes=fs.readFileSync('public/illustrations/'+file);assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(bytes.readUInt32BE(16),2*bytes.readUInt32BE(20));}
const headers=JSON.parse(fs.readFileSync('firebase.json')).hosting.headers;assert.ok(headers.some(h=>h.source==='/illustrations/**'&&h.headers.some(k=>k.key==='Cache-Control'&&k.value.includes('immutable'))));
const css=fs.readFileSync('src/pages/lessonMaps.css','utf8');assert.match(css,/@page mindmap-sheet/);assert.match(css,/A4 landscape/);assert.match(css,/map-content-concealed\s*\{\s*display: block !important/);
console.log('PASS: all lesson visual titles, sixteen topic illustrations, science-specific pictures, distinct branch colors, no misleading mine icon for Nam Bộ, versioned cached PNG atlases and full-content landscape print styles.');
