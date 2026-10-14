import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
async function readTs(path){const {outputText}=ts.transpileModule(await fs.readFile(new URL(path,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});return import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));}
const {heritageCatalog:records}=await readTs('../src/data/heritageCatalog.ts');
const {traditionMapPlaces:areas,normalizeMapText}=await readTs('../src/data/traditionMap.ts');
assert.equal(records.length,38);assert.equal(new Set(records.map(r=>r.id)).size,records.length);
for(const r of records){
 assert(/^(Xã|Phường) /.test(r.commune));assert(normalizeMapText(r.address).includes(normalizeMapText(r.commune)));
 assert(r.name && r.summary && r.formerArea && r.checkedAt);
 for(const url of [r.sourceUrl,r.addressSourceUrl].filter(Boolean)){const u=new URL(url);assert(u.protocol==='https:' && (u.hostname==='thainguyen.gov.vn'||u.hostname.endsWith('.thainguyen.gov.vn')||u.hostname==='baotanglichsu.vn'));}
 if(r.mapAreaId)assert(areas.some(a=>a.id===r.mapAreaId));
}
assert.equal(records.find(r=>r.id==='den-luc-giap').commune,'Phường Phổ Yên');
assert.equal(records.find(r=>r.id==='den-muc').commune,'Phường Vạn Xuân');
assert.equal(records.filter(r=>r.id.startsWith('chua-hang-')).length,2);
assert.equal(records.filter(r=>normalizeMapText(r.name).includes('na tu')).length,1);
assert.equal(records.filter(r=>r.commune==='Xã Nghĩa Tá').length,5);
console.log('PASS: 38 hồ sơ, địa chỉ hiện nay, nguồn chính thức, ID duy nhất và liên kết khu vực bản đồ hợp lệ.');
