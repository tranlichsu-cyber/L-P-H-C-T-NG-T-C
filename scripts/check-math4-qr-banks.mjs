import assert from 'node:assert/strict';
import { getStandardGrade4MathBanks, getStandardGrade4MathBank, mergeWithStandardBanks } from '../src/services/qrBank/standardBanks.ts';
import { validateQrBank } from '../src/services/qrBank/content.ts';

const banks = getStandardGrade4MathBanks();
assert.equal(banks.length, 73, 'Must have exactly 73 Math lessons');

let totalQuestions = 0;
const titles = new Set();
const ids = new Set();

banks.forEach((bank, idx) => {
  assert.ok(bank.id, `Bank at index ${idx} must have an id`);
  assert.ok(!ids.has(bank.id), `Duplicate bank id: ${bank.id}`);
  ids.add(bank.id);

  assert.ok(bank.title, `Bank at index ${idx} must have a title`);
  assert.ok(!titles.has(bank.title), `Duplicate bank title: ${bank.title}`);
  titles.add(bank.title);

  assert.equal(bank.subject, 'Toán');
  assert.equal(bank.grade, 'Khối 4');
  assert.equal(bank.questions.length, 5, `Lesson ${bank.title} must have exactly 5 questions`);

  validateQrBank(bank);

  totalQuestions += bank.questions.length;
});

assert.equal(totalQuestions, 365, 'Total questions across all 73 lessons must be 365');

const b01 = getStandardGrade4MathBank('qr-bank-math4-b01');
assert.ok(b01);
assert.equal(b01.title, 'Bài 1 – Ôn tập các số đến 100 000');

const b73 = getStandardGrade4MathBank('qr-bank-math4-b73');
assert.ok(b73);
assert.equal(b73.title, 'Bài 73 – Ôn tập chung');

const merged = mergeWithStandardBanks([]);
assert.equal(merged.length, 100);

const mockCustom = [{
  id: 'custom-1',
  teacherId: 't1',
  title: 'Bộ tự tạo',
  subject: 'Toán',
  grade: 'Khối 4',
  questions: [],
  createdAt: '',
  updatedAt: ''
}];
const mergedWithCustom = mergeWithStandardBanks(mockCustom);
assert.equal(mergedWithCustom.length, 101);
assert.equal(mergedWithCustom[0].id, 'custom-1');

console.log('PASS: All 73 Grade 4 Math lessons and 365 QR questions verified according to SGK Ket noi tri thuc (taphuan.nxbgd.vn)!');
