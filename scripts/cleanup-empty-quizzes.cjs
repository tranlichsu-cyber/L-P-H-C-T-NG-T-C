const fs = require('node:fs/promises');
const COLLECTIONS = ['quizzes', 'qrQuestionSets', 'selfPracticeQuizzes', 'traditionQuizzes'];
const PROJECT = 'lop-hoc-tuong-tac-a62a5';
function emptyMetadata(collection, data) {
  if (!COLLECTIONS.includes(collection) || !data || typeof data !== 'object') return false;
  // Written assignments and worksheets live elsewhere; unknown formats are retained.
  if (data.prompt || data.writingPrompt || data.type === 'WRITING') return false;
  if (collection === 'quizzes' && !Object.hasOwn(data, 'questions')) return true;
  return Array.isArray(data.questions) && data.questions.length === 0;
}
function encode(value) {
  if (typeof value === 'number' && !Number.isFinite(value)) return { type: 'number', value: String(value) };
  if (value === null || typeof value !== 'object') return { type: 'scalar', value };
  if (Buffer.isBuffer(value)) return { type: 'bytes', value: value.toString('base64') };
  if (typeof value.seconds === 'number' && typeof value.nanoseconds === 'number' && typeof value.toDate === 'function') return { type: 'timestamp', seconds: value.seconds, nanoseconds: value.nanoseconds };
  if (value.constructor?.name === 'GeoPoint' && typeof value.latitude === 'number' && typeof value.longitude === 'number') return { type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
  if (typeof value.path === 'string' && typeof value.get === 'function') return { type: 'reference', path: value.path };
  if (Array.isArray(value)) return { type: 'array', values: value.map(encode) };
  return { type: 'object', entries: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)])) };
}
function decode(saved, db) {
  const { Timestamp, GeoPoint } = require('firebase-admin/firestore');
  switch (saved.type) {
    case 'scalar': return saved.value;
    case 'number': return Number(saved.value);
    case 'bytes': return Buffer.from(saved.value, 'base64');
    case 'timestamp': return new Timestamp(saved.seconds, saved.nanoseconds);
    case 'geopoint': return new GeoPoint(saved.latitude, saved.longitude);
    case 'reference': return db.doc(saved.path);
    case 'array': return saved.values.map(item => decode(item, db));
    case 'object': return Object.fromEntries(Object.entries(saved.entries).map(([key, item]) => [key, decode(item, db)]));
    default: throw Error('INVALID_BACKUP_TYPE');
  }
}
async function prepare(db, version) {
  const report = { version, scanned: {}, candidates: {}, deleted: {}, skippedChanged: 0, alreadyCompleted: false };
  const completed = await db.doc('systemMigrations/' + version).get();
  if (completed.exists) return { version, documents: [], report: { ...completed.data(), alreadyCompleted: true } };
  const documents = [];
  for (const collection of COLLECTIONS) {
    const docs = (await db.collection(collection).limit(2001).get()).docs;
    if (docs.length > 2000) throw Error('COLLECTION_READ_LIMIT');
    report.scanned[collection] = docs.length;
    report.candidates[collection] = 0;
    report.deleted[collection] = 0;
    for (const doc of docs) {
      if (!emptyMetadata(collection, doc.data())) continue;
      // Never trust questionCount. Also protect legacy child questions in array-based banks.
      if (!(await doc.ref.collection('questions').limit(1).get()).empty) continue;
      documents.push({ path: doc.ref.path, seconds: doc.updateTime.seconds, nanoseconds: doc.updateTime.nanoseconds, data: encode(doc.data()) });
      report.candidates[collection]++;
      if (documents.length > 300) throw Error('DELETE_LIMIT_EXCEEDED');
    }
  }
  return { version, documents, report };
}
async function apply(db, plan) {
  if (plan.report.alreadyCompleted) return plan.report;
  const completedRef = db.doc('systemMigrations/' + plan.version);
  if ((await completedRef.get()).exists) return { ...(await completedRef.get()).data(), alreadyCompleted: true };
  const report = { ...plan.report, deleted: { ...plan.report.deleted } };
  for (const saved of plan.documents) {
    const parts = saved.path.split('/');
    if (parts.length !== 2 || !COLLECTIONS.includes(parts[0])) throw Error('INVALID_PLAN_PATH');
    const deleted = await db.runTransaction(async tx => {
      const ref = db.doc(saved.path), current = await tx.get(ref);
      if (!current.exists) return false;
      if (current.updateTime.seconds !== saved.seconds || current.updateTime.nanoseconds !== saved.nanoseconds || !emptyMetadata(parts[0], current.data())) return false;
      // Transactional query protects against a question being added during cleanup.
      if (!(await tx.get(ref.collection('questions').limit(1))).empty) return false;
      tx.delete(ref);
      return true;
    });
    if (deleted) report.deleted[parts[0]]++;
    else report.skippedChanged++;
  }
  report.verified = true;
  // Verify actual deletion, retaining a newly recreated document rather than deleting it again.
  report.remainingCandidates = 0;
  for (const saved of plan.documents) if ((await db.doc(saved.path).get()).exists) report.remainingCandidates++;
  report.completedAt = new Date().toISOString();
  await completedRef.set(report);
  return report;
}
async function main() {
  const { initializeApp, applicationDefault } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const config = JSON.parse(await fs.readFile('.github/operations/empty-quiz-cleanup.json', 'utf8'));
  if (config.version !== 'empty-quizzes-20261021-v1' || config.project !== PROJECT) throw Error('INVALID_CONFIG');
  initializeApp({ projectId: PROJECT, credential: applicationDefault() });
  const db = getFirestore(), [mode, file] = process.argv.slice(2);
  if (!file || !['prepare', 'apply'].includes(mode)) throw Error('EXPECTED_PREPARE_OR_APPLY_AND_FILE');
  if (mode === 'prepare') {
    const plan = await prepare(db, config.version);
    await fs.writeFile(file, JSON.stringify(plan) + '\n', { mode: 0o600 });
    console.log(JSON.stringify(plan.report));
  } else {
    const plan = JSON.parse(await fs.readFile(file, 'utf8'));
    if (plan.version !== config.version || plan.documents.length > 300) throw Error('INVALID_PLAN');
    const report = await apply(db, plan);
    await fs.writeFile(file + '.result.json', JSON.stringify(report, null, 2) + '\n');
    console.log('::notice::EMPTY_QUIZ_CLEANUP=' + JSON.stringify(report));
  }
}
module.exports = { emptyMetadata, encode, decode, prepare, apply };
if (require.main === module) main().catch(error => { console.error(error.message); process.exit(1); });
