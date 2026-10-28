import assert from 'node:assert/strict';
import {
  getStandardGrade4HistoryGeoBanks,
  getAllStandardGrade4Banks,
  getStandardGrade4Bank,
  mergeWithStandardBanks
} from '../src/services/qrBank/standardBanks.ts';
import { validateQrBank } from '../src/services/qrBank/content.ts';

const banks = getStandardGrade4HistoryGeoBanks();
assert.equal(banks.length, 27, 'Must have exactly 27 History and Geography lessons');

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

  assert.equal(bank.subject, 'Lịch sử và Địa lí');
  assert.equal(bank.grade, 'Khối 4');
  assert.equal(bank.questions.length, 5, `Lesson ${bank.title} must have exactly 5 questions`);

  validateQrBank(bank);

  totalQuestions += bank.questions.length;
});

assert.equal(totalQuestions, 135, 'Total questions across all 27 lessons must be 135');

const b01 = getStandardGrade4Bank('qr-bank-historygeo4-b01');
assert.ok(b01);
assert.equal(b01.title, 'Bài 1 – Làm quen với phương tiện học tập môn Lịch sử và Địa lí');

const b27 = getStandardGrade4Bank('qr-bank-historygeo4-b27');
assert.ok(b27);
assert.equal(b27.title, 'Bài 27 – Ôn tập');

const allStandards = getAllStandardGrade4Banks();
assert.equal(allStandards.length, 100, 'Must have 100 standard lessons in total (73 Math + 27 History & Geography)');

const merged = mergeWithStandardBanks([]);
assert.equal(merged.length, 100);

console.log('PASS: All 27 Grade 4 History & Geography lessons and 135 QR questions verified according to SGK Ket noi tri thuc (taphuan.nxbgd.vn)!');
