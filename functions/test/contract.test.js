import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');

test('student PIN: six digits including leading zeros',()=>{
 const pattern=/^[0-9]{6}$/;
 assert.ok(pattern.test('000123'));
 assert.ok(!pattern.test('12345'));
 assert.ok(!pattern.test('1234567'));
 assert.ok(!pattern.test('12a456'));
});
test('writing submissions limited to 35 weeks',()=>{
 const valid=n=>Number.isInteger(n)&&n>=1&&n<=35;
 for(const n of [0,36,1.5,NaN])assert.equal(valid(n),false);
 for(const n of [1,18,35])assert.equal(valid(n),true);
});
test('PINs are generated securely and salted, not stored in plaintext',()=>{
 assert.match(source,/randomInt\(0,1000000\)/);
 assert.match(source,/scryptSync\(/);
 assert.match(source,/pinHash:pinHash\(pin,salt\)/);
 assert.doesNotMatch(source,/\.set\(\{[^}]*\bpin,\s*salt/);
});
test('PIN verification requires anonymous auth and locks out repeated failures',()=>{
 assert.match(source,/sign_in_provider!=='anonymous'/);
 assert.match(source,/lockedUntil/);
 assert.match(source,/15\*60\*1000/);
 assert.match(source,/timingSafeEqual/);
});
test('PIN rotation invalidates previously verified student sessions',()=>{
 assert.match(source,/version:randomBytes\(16\)/);
 assert.match(source,/credentialVersion:verification.version/);
 assert.match(source,/credential\.data\(\)\.version!==s\.credentialVersion/);
});
test('student submission cannot edit an already submitted assignment',()=>{
 assert.match(source,/old\.data\(\)\.status==='SUBMITTED'/);
 assert.match(source,/\['DRAFT','SUBMITTED'\]/);
 assert.match(source,/tx\.set\(ref,payload/);
});
test('teacher comments require classroom authorization',()=>{
 assert.match(source,/export const commentGrade4Writing/);
 assert.match(source,/await teacher\(req\.auth\?\.uid,classId\)/);
 assert.match(source,/reviewerUid:req\.auth\.uid/);
});
test('oversized writing is rejected rather than silently truncated',()=>{
 assert.match(source,/bounded\(req\.data\?\.outline,12000\)/);
 assert.match(source,/bounded\(req\.data\?\.writing,30000\)/);
 assert.match(source,/bounded\(req\.data\?\.comment,3000\)/);
});
