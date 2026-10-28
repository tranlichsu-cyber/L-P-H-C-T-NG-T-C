import fs from 'node:fs';
import path from 'node:path';
import { historyGeoLessons } from './historygeo4-questions.mjs';
import { validateQrBank } from '../src/services/qrBank/content.ts';

console.log(`Total History and Geography lessons loaded: ${historyGeoLessons.length}`);

if (historyGeoLessons.length !== 27) {
  throw new Error(`Expected 27 lessons, but got ${historyGeoLessons.length}`);
}

const targetLetters = ['A', 'B', 'C', 'D', 'B'];

const qrBanks = historyGeoLessons.map((lesson) => {
  const padNum = String(lesson.number).padStart(2, '0');
  const bankId = `qr-bank-historygeo4-b${padNum}`;
  const title = `Bài ${lesson.number} – ${lesson.title}`;

  const questions = lesson.questions.map((q, qIdx) => {
    const qId = `qr-hg4-b${padNum}-q${qIdx + 1}`;
    const targetLetter = targetLetters[qIdx % targetLetters.length];
    const targetPos = targetLetter.charCodeAt(0) - 65; // 0 for A, 1 for B, 2 for C, 3 for D

    const options = [...q.options];
    if (targetPos !== 0) {
      // Swap correct answer from pos 0 to targetPos
      const correctText = options[0];
      options[0] = options[targetPos];
      options[targetPos] = correctText;
    }

    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      content: q.content,
      options,
      correctAnswer: targetLetter,
      correctPoints: 10,
      wrongPenalty: 0,
      explanation: q.explanation
    };
  });

  const bank = {
    id: bankId,
    teacherId: 'system',
    title,
    subject: 'Lịch sử và Địa lí',
    grade: 'Khối 4',
    questions,
    createdAt: '2026-10-28T00:00:00.000Z',
    updatedAt: '2026-10-28T00:00:00.000Z'
  };

  try {
    validateQrBank(bank);
  } catch (err) {
    console.error(`Validation failed for ${title}:`, err.message);
    throw err;
  }

  return bank;
});

console.log(`Successfully validated all ${qrBanks.length} History and Geography QR banks!`);

const outDir = path.resolve('src/data/qr');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const tsPath = path.join(outDir, 'grade4HistoryGeoQrBanks.ts');
const tsContent = `import type { QrBank } from '../../services/qrBank/content';\n\nexport const GRADE_4_HISTORY_GEO_QR_BANKS: QrBank[] = ${JSON.stringify(qrBanks, null, 2)};\n`;
fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log(`Saved ${qrBanks.length} History and Geography QR banks to ${tsPath}`);
