const assert = require('node:assert/strict');
const { emptyMetadata, encode, decode, prepare, apply } = require('./cleanup-empty-quizzes.cjs');
for (const name of ['quizzes', 'qrQuestionSets', 'selfPracticeQuizzes', 'traditionQuizzes']) {
  assert(emptyMetadata(name, { questions: [] }));
  assert(!emptyMetadata(name, { questions: [{ content: 'Bài viết của em' }] }));
  assert(!emptyMetadata(name, { questions: null }));
  assert(!emptyMetadata(name, { questions: [], writingPrompt: 'Viết đoạn văn' }));
}
assert(emptyMetadata('quizzes', { questionCount: 50 }));
assert(!emptyMetadata('qrQuestionSets', {}));
assert(!emptyMetadata('practiceSets', { questions: [] }));
assert.deepEqual(encode({ __type: 'timestamp', nested: [null, 2] }), { type: 'object', entries: { __type: { type: 'scalar', value: 'timestamp' }, nested: { type: 'array', values: [{ type: 'scalar', value: null }, { type: 'scalar', value: 2 }] } } });
if (process.argv.includes('--unit')) { console.log('PASS empty-quiz candidate policy and typed backup encoding.'); process.exit(0); }
if (!/^(127\.0\.0\.1|localhost):[0-9]+$/.test(process.env.FIRESTORE_EMULATOR_HOST || '')) throw Error('EMULATOR_REQUIRED');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
initializeApp({ projectId: 'demo-empty-quizzes' });
const db = getFirestore();
(async () => {
  await db.doc('quizzes/empty').set({ questionCount: 8, title: 'Stale count', createdAt: Timestamp.now() });
  await db.doc('quizzes/stale-zero').set({ questionCount: 0 });
  await db.doc('quizzes/stale-zero/questions/q').set({ content: 'Keep me' });
  await db.doc('quizzes/legacy').set({ questions: [{ content: 'Keep inline content' }] });
  for (const c of ['qrQuestionSets', 'selfPracticeQuizzes', 'traditionQuizzes']) {
    await db.doc(c + '/empty').set({ questions: [] });
    await db.doc(c + '/filled').set({ questions: [{ content: 'Keep' }] });
  }
  await db.doc('qrQuestionSets/legacy-child').set({ questions: [] });
  await db.doc('qrQuestionSets/legacy-child/questions/q').set({ content: 'Keep child' });
  await db.doc('practiceSets/writing').set({ questions: [], prompt: 'Write' });
  await db.doc('selfPracticeWork/student').set({ earnedPoints: 10 });
  const original = { time: new Timestamp(123, 456), bytes: Buffer.from('backup'), ref: db.doc('quizzes/empty'), coordinates: { latitude: 1, longitude: 2 }, nan: NaN };
  const restored = decode(JSON.parse(JSON.stringify(encode(original))), db);
  assert(restored.time.isEqual(original.time)); assert(restored.bytes.equals(original.bytes)); assert.equal(restored.ref.path, original.ref.path); assert.deepEqual(restored.coordinates, original.coordinates); assert(Number.isNaN(restored.nan));
  const plan = await prepare(db, 'test');
  assert.equal(plan.documents.length, 4);
  assert.equal(plan.documents.find(d => d.path === 'quizzes/empty').data.entries.createdAt.type, 'timestamp');
  assert((await db.doc('quizzes/empty').get()).exists); // prepare is read-only
  // A parent edit and a question added without updating its parent must both cancel deletion.
  await db.doc('qrQuestionSets/empty').update({ questions: [{ content: 'Added after backup' }] });
  await db.doc('selfPracticeQuizzes/empty/questions/new').set({ content: 'Concurrent child' });
  const result = await apply(db, plan);
  assert.equal(result.deleted.quizzes, 1);
  assert.equal(result.deleted.traditionQuizzes, 1);
  assert.equal(result.skippedChanged, 2);
  for (const path of ['quizzes/stale-zero', 'quizzes/legacy', 'qrQuestionSets/empty', 'qrQuestionSets/legacy-child', 'selfPracticeQuizzes/empty', 'practiceSets/writing', 'selfPracticeWork/student']) assert((await db.doc(path).get()).exists, path);
  assert.equal((await db.doc('selfPracticeWork/student').get()).data().earnedPoints, 10);
  const again = await prepare(db, 'test');
  assert.equal(again.documents.length, 0);
  assert(again.report.alreadyCompleted);
  console.log('PASS actual empty-quiz cleanup: read-only backup, real child count, stale counts, inline content, changed-parent/child guards, typed backup, writing/work retention and idempotence.');
})().catch(error => { console.error(error); process.exit(1); });
