# Grade 4 writing: secure launch checklist

Status: NOT PRODUCTION READY. Never publish student names or PINs as publicly readable Firestore documents.

## Completed on feature branch
- Teacher read-only review screen with class/week/student filters.
- Class/name/PIN presentation component (not wired to production).
- Firestore rule denying browser writes to grade4WritingSubmissions; teachers may read assigned classes.

## Required before enabling student access
1. Deploy a trusted backend (Firebase Cloud Functions or equivalent) with Firebase Admin SDK. The browser must never generate, hash, compare or persist a student's PIN.
2. Authenticated class teacher creates/rotates a unique cryptographically random PIN for each pupil. Store only a salted, slow password hash in a server-only collection; never return hashes to clients. Show plaintext PIN once to the issuing teacher. Do not email bulk PIN lists.
3. Rate-limit verification by student ID, IP/device signals, and class. Add lockout/backoff, audit logs, and App Check where appropriate. Six-digit PINs alone have low entropy.
4. Do not expose private class rosters to unauthenticated users. Publish a minimal, consent-reviewed directory only if school policy permits; alternatively use opaque invitation codes and server-mediated name selection.
5. Verify student PIN on server, issue a short-lived identity-bound session, and bind every draft/submission to immutable classId/studentId/week. Verify that the student belongs to the selected class on every write.
6. Write submissions with Admin SDK; validate size, status transitions, week range 1–35, and prevent cross-student writes. Keep immutable submission history and teacher review audit trail.
7. Make teacher feedback writable only by assigned teachers; add server-side checks for ownership and content lengths.
8. Supply and review 35 distinct writing-week lessons against the current textbook/curriculum. Do not publish invented or duplicated content.
9. Test security in Firebase Emulator: student A cannot read/write B, anonymous cannot list roster, teacher A cannot read class B, revoked PIN stops working, old session expires, double submit is idempotent.
10. Test build and end-to-end flows in staging; deploy backend and rules first, then frontend behind a feature flag. Back up Firestore before any data migration. Do not deploy or merge until tests pass.

## Current limitation
The student picker and review UI exist as source files, but PIN issuance, verification, submissions, feedback and production wiring are not complete. The review page is not evidence that production contains grade4WritingSubmissions data.
