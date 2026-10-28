import type { QrBank } from './content';
import { GRADE_4_MATH_QR_BANKS } from '../../data/qr/grade4MathQrBanks.ts';

export function getStandardGrade4MathBanks(): QrBank[] {
  return GRADE_4_MATH_QR_BANKS;
}

export function getStandardGrade4MathBank(id: string): QrBank | null {
  const found = GRADE_4_MATH_QR_BANKS.find(b => b.id === id);
  return found || null;
}

export function mergeWithStandardBanks(userBanks: QrBank[]): QrBank[] {
  const userMap = new Map(userBanks.map(b => [b.id, b]));
  const standards = getStandardGrade4MathBanks();

  // If a standard bank was copied/edited by teacher (same id), use the teacher's copy
  const standardResults: QrBank[] = [];
  for (const std of standards) {
    if (!userMap.has(std.id)) {
      standardResults.push(std);
    }
  }

  return [...userBanks, ...standardResults];
}
