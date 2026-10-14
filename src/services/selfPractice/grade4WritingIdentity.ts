/** Shared data contracts for the grade-four writing workflow.
 * Never treat a selected roster ID as proof of student identity.
 * PIN verification must happen on a trusted server, not in browser code.
 */
export interface Grade4StudentChoice {
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
}

export interface Grade4StudentSession extends Grade4StudentChoice {
  /** Opaque server-issued session identifier; never a PIN or PIN hash. */
  verifiedSessionId: string;
  verifiedAt: string;
}

export interface Grade4WritingSubmission {
  classId: string;
  studentId: string;
  week: number;
  outline: string;
  writing: string;
  status: 'DRAFT' | 'SUBMITTED';
  updatedAt: string;
  submittedAt?: string;
}

export const isGradeFourClass = (grade: string): boolean =>
  /^(?:khối\\s*)?4$/i.test(grade.trim());

export const isValidStudentPinFormat = (pin: string): boolean =>
  /^[0-9]{6}$/.test(pin);

export const isValidWritingWeek = (week: number): boolean =>
  Number.isInteger(week) && week >= 1 && week <= 35;

export const canRevealWritingSuggestion = (
  submission: Pick<Grade4WritingSubmission, 'status' | 'submittedAt'> | null,
): boolean => submission?.status === 'SUBMITTED' && Boolean(submission.submittedAt);
