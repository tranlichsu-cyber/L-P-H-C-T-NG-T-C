import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';

async function loadTs(path) {
  const source = await fs.readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}
const { curatedTraditionQuizzes: quizzes } = await loadTs('../src/data/traditionQuizzes.ts');
const { gradePractice } = await loadTs('../src/services/practice/grading.ts');
assert.equal(quizzes.length, 4);
const ids = new Set();
for (const quiz of quizzes) {
  assert.equal(quiz.questions.length, 10);
  const correct = {}, wrong = {};
  for (const question of quiz.questions) {
    assert(!ids.has(question.id)); ids.add(question.id);
    assert.equal(question.type, 'MULTIPLE_CHOICE');
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.equal(question.options.filter(option => option === question.correctAnswer).length, 1);
    assert(question.content.trim() && question.explanation.trim());
    correct[question.id] = question.correctAnswer;
    wrong[question.id] = question.options.find(option => option !== question.correctAnswer);
  }
  assert.equal(gradePractice(quiz.questions, correct).score, 100);
  assert.equal(gradePractice(quiz.questions, wrong).score, 0);
  assert.equal(gradePractice(quiz.questions, {}).correctCount, 0);
  const first = quiz.questions[0];
  assert.equal(gradePractice(quiz.questions, { ...wrong, [first.id]: first.correctAnswer }).score, 10);
}
assert.equal(ids.size, 40);
console.log('PASS: 4 bộ, 40 câu, 4 lựa chọn duy nhất; chấm đúng toàn bộ, sai toàn bộ, chưa trả lời và đúng một câu.');
