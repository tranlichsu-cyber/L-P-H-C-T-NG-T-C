import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import mammoth from 'mammoth';
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const load=s=>import('data:text/javascript;base64,'+Buffer.from(compile(s)).toString('base64'));
const policy=await load(fs.readFileSync('src/services/qrBank/content.ts','utf8'));
globalThis.__qrWordPolicy=policy;
const source=compile(fs.readFileSync('src/services/qrBank/wordImport.ts','utf8')).replace(/^import .*;\n/gm,'');
const {bankFromWordRows}=await load('const {validateQrBank}=globalThis.__qrWordPolicy;\n'+source);
const meta=[{label:'Tên bộ câu hỏi',text:'Bộ Word'},{label:'Môn học',text:'Toán'},{label:'Khối lớp',text:'4'}];
const question=[{label:'Câu hỏi',text:'Chọn hai'},{label:'A',text:'Một'},{label:'B',text:'Hai'},{label:'C',text:''},{label:'D',text:''},{label:'Đáp án đúng',text:'b'},{label:'Điểm đúng',text:'2,5'},{label:'Điểm trừ',text:'0'},{label:'Ảnh',text:''},{label:'Video',text:'https://youtu.be/abcdefghijk'}];
const bank=bankFromWordRows([meta,question],'t');assert.equal(bank.teacherId,'t');assert.equal(bank.questions[0].correctAnswer,'B');assert.equal(bank.questions[0].options.length,2);assert.equal(bank.questions[0].correctPoints,2.5);
for(const mutate of [q=>q.push({...q[0]}),q=>q.find(v=>v.label==='B').text='',q=>q.find(v=>v.label==='Đáp án đúng').text='D',q=>q.find(v=>v.label==='Video').text='javascript:alert(1)',q=>q.find(v=>v.label==='A').images=['https://example.org/a.jpg'],q=>q.find(v=>v.label==='Câu hỏi').label='Cau hoii',q=>q.find(v=>v.label==='Ảnh').images=['https://example.org/a.jpg','https://example.org/b.jpg']]){const q=structuredClone(question);mutate(q);assert.throws(()=>bankFromWordRows([meta,q],'t'));}
assert.throws(()=>bankFromWordRows([meta,...Array.from({length:81},()=>question)],'t'));
// Test the exact downloadable DOCX, not a second template description.
for(const [name,count] of [['bo-mau-qr-toan4-10cau-v1.docx',10],['mau-bo-cau-hoi-qr-v1.docx',1]]){
 const buffer=fs.readFileSync('public/templates/'+name);assert.equal(buffer.readUInt16LE(0),0x4b50);
 const result=await mammoth.convertToHtml({buffer},{externalFileAccess:false});
 const text=html=>html.replace(/<\/p>/g,'\n').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim();
 const tables=[...result.value.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/g)].map(t=>[...t[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(r=>{const cells=[...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)];assert.equal(cells.length,2);return {label:text(cells[0][1]),text:text(cells[1][1])};}));
 assert.equal(tables.length,count+1);
 if(count===10){const imported=bankFromWordRows(tables,'t');assert.equal(imported.questions.length,10);assert.deepEqual(imported.questions.map(q=>q.correctAnswer),['B','B','C','A','D','C','B','A','D','B']);}else assert.throws(()=>bankFromWordRows(tables,'t'));
}
console.log('PASS Word QR: actual downloadable DOCX round-trip, ten answer keys, empty-template validation, table identity, 2–4 choices, localized points, bad/missing answers, unsafe media, duplicate rows, image position/count and 80-question bound.');
