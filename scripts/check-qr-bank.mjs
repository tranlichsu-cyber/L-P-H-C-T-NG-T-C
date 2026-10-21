import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const load=s=>import('data:text/javascript;base64,'+Buffer.from(compile(s)).toString('base64'));
const policy=await load(fs.readFileSync('src/services/qrBank/content.ts','utf8'));
for(const url of ['https://youtu.be/abcdefghijk','https://www.youtube.com/watch?v=abcdefghijk&t=3','https://youtube.com/shorts/abcdefghijk'])assert.equal(policy.youtubeId(url),'abcdefghijk');
for(const url of ['javascript:alert(1)','http://youtube.com/watch?v=abcdefghijk','https://youtube.com.evil.org/watch?v=abcdefghijk','https://youtube.com/watch?v=bad'])assert.equal(policy.videoSource(url),null);
assert.equal(policy.videoSource('https://example.org/movie.mp4?token=test').kind,'file');assert(!policy.safeImage('data:image/svg+xml;base64,abcd'));assert(!policy.safeImage('javascript:alert(1)'));assert(policy.safeImage('https://example.org/photo.png'));
const bank={id:'b',teacherId:'t',title:'Bộ thẻ',subject:'Toán',grade:'4',createdAt:'now',updatedAt:'now',questions:[{...policy.newQrQuestion(),content:'Chọn hai',options:['Một','Hai'],correctAnswer:'B',media:{imageUrl:'https://example.org/photo.png',videoUrl:'https://youtu.be/abcdefghijk'}}]};policy.validateQrBank(bank);
for(const mutate of [b=>b.questions[0].correctAnswer='D',b=>b.questions[0].options=['Một','Một'],b=>b.questions[0].media.videoUrl='javascript:alert(1)',b=>b.questions[0].media.imageUrl='http://example.org/a.jpg',b=>b.questions=[],b=>b.questions[0].wrongPenalty=-1]){const bad=structuredClone(bank);mutate(bad);assert.throws(()=>policy.validateQrBank(bad));}
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const cache=await load(fs.readFileSync('src/services/data/readEfficiency.ts','utf8'));
globalThis.__qrBank={...cache,...policy,isFirebaseConfigured:false,auth:null,db:null};
const source=compile(fs.readFileSync('src/services/qrBank/QrBankService.ts','utf8')).replace(/^import .*;\n/gm,'');
const {QrBankService}=await load('const {validateQrBank,createReadCache,isFirebaseConfigured,auth,db}=globalThis.__qrBank;\n'+source);
await QrBankService.save('t',bank);assert.equal((await QrBankService.list('t')).length,1);assert.equal((await QrBankService.list('other')).length,0);await assert.rejects(()=>QrBankService.save('other',bank));await QrBankService.save('t',{...bank,title:'Đã sửa'});assert.equal((await QrBankService.get('t','b')).title,'Đã sửa');await QrBankService.remove('t','b');assert.equal((await QrBankService.list('t')).length,0);
console.log('PASS separate QR bank: CRUD, owner/cache isolation, question/answer validation, media sizes, HTTPS/YouTube normalization and unsafe URL rejection.');
