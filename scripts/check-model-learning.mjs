import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const compile = path => ts.transpileModule(fs.readFileSync(path, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const load = async path => import('data:text/javascript;base64,' + Buffer.from(compile(path)).toString('base64'));
const { modelsCatalog } = await load('src/data/models/modelsCatalog.ts');
const { filterLearningModels: filter } = await load('src/data/models/modelSearch.ts');
const search = (query, overrides = {}) => filter(modelsCatalog, { subject: 'ALL', grade: 0, status: 'ALL', query, ...overrides }).map(m => m.id);
assert(search('DEN hung').includes('den-hung'));
assert(search('ĐỀN HÙNG').includes('den-hung'));
assert(search('  tuan   hoan  nuoc ').includes('vong-tuan-hoan-nuoc'));
assert(search('Đền Hùng').includes('den-hung'), 'Decomposed Vietnamese');
assert.equal(search('den hung', { subject: 'Khoa học' }).length, 0);
assert.equal(search('', { grade: 5 }).length, 0);
assert.equal(search('', { status: 'UPCOMING' }).length, modelsCatalog.filter(m => m.status === 'UPCOMING').length);
assert.equal(search('khong co hoc lieu nay').length, 0);
assert.equal(search('').length, modelsCatalog.length);
console.log('PASS model search: accents, case, whitespace, combined filters, empty results and reset values.');

// Exercise the real simulation loop and visibility handler with a controlled RAF queue.
const html = fs.readFileSync('public/models/vong-tuan-hoan-nuoc-3d.html', 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('function animate()'));
const listeners = new Map(), frames = new Map(); let nextId = 0, renders = 0;
const context = vm.createContext({
  console, Date, Math,
  THREE: { Vector3: class { constructor() {} } },
  document: { hidden: false, addEventListener: (name, fn) => listeners.set(name, fn) },
  window: { addEventListener() {} },
  ModelRealism: { delta: () => 0.016 },
  requestAnimationFrame: fn => { const id = ++nextId; frames.set(id, fn); return id; },
  cancelAnimationFrame: id => frames.delete(id),
});
vm.runInContext(script, context);
context.recordRender = () => renders++;
vm.runInContext('renderer = {render: recordRender}; updateMarkersPosition = () => {}; animate();', context);
assert.equal(frames.size, 1); assert.equal(renders, 1);
context.document.hidden = true; listeners.get('visibilitychange')();
assert.equal(frames.size, 0);
context.document.hidden = false; listeners.get('visibilitychange')();
assert.equal(frames.size, 1); assert.equal(renders, 2);
listeners.get('visibilitychange')(); assert.equal(frames.size, 1, 'No duplicate render loop');
console.log('PASS water simulation: hidden tab cancels frames, return resumes exactly one render loop.');
