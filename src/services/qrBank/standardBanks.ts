import type { QrBank } from './content';
import { GRADE_4_MATH_QR_BANKS } from '../../data/qr/grade4MathQrBanks.ts';
import { GRADE_4_HISTORY_GEO_QR_BANKS } from '../../data/qr/grade4HistoryGeoQrBanks.ts';

export function getStandardGrade4MathBanks(): QrBank[] {
  return GRADE_4_MATH_QR_BANKS;
}

export function getStandardGrade4HistoryGeoBanks(): QrBank[] {
  return GRADE_4_HISTORY_GEO_QR_BANKS;
}

export function getAllStandardGrade4Banks(): QrBank[] {
  return [...GRADE_4_MATH_QR_BANKS, ...GRADE_4_HISTORY_GEO_QR_BANKS];
}

export function getStandardGrade4Bank(id: string): QrBank | null {
  const found = getAllStandardGrade4Banks().find(b => b.id === id);
  return found || null;
}

export function getStandardGrade4MathBank(id: string): QrBank | null {
  return getStandardGrade4Bank(id);
}

export function mergeWithStandardBanks(userBanks: QrBank[]): QrBank[] {
  const userMap = new Map(userBanks.map(b => [b.id, b]));
  const standards = getAllStandardGrade4Banks();

  // If a standard bank was copied/edited by teacher (same id), use the teacher's copy
  const standardResults: QrBank[] = [];
  for (const std of standards) {
    if (!userMap.has(std.id)) {
      standardResults.push(std);
    }
  }

  return [...userBanks, ...standardResults];
}
