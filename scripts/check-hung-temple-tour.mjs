import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the actual standalone tour controller with a deterministic clock.
const html = fs.readFileSync('public/models/den-hung-3d.html', 'utf8');
const source = html.slice(html.indexOf('const journeyIds='), html.indexOf('let gameBusy='));
assert(source.includes('function journeyStart()'), 'Tour controller must exist');
const elements = new Map();
const $ = id => {
  if (!elements.has(id)) elements.set(id, { style: {}, textContent: '', disabled: false });
  return elements.get(id);
};
const ids = ['gate', 'ha', 'trung', 'thuong', 'lang', 'gieng'];
const visits = [];
const timers = new Map();
let now = 0;
let timerId = 0;
let overviewCount = 0;
let visibilityListener;
const context = vm.createContext({
  $, Math,
  data: { places: ids.map(id => ({ id, name: id, core: 'Nội dung', remember: 'Ghi nhớ' })) },
  finding: false, journey: false, journeyPaused: false, rotating: false,
  journeyTimer: null, infoHidden: false, infoCollapsed: false,
  renderer: { dispose() {} },
  selectPlace: index => visits.push(ids[index]),
  speak() {}, endFind() {}, updateInfoVisibilityUI() {}, toast() {},
  flyOverview: () => overviewCount++,
  performance: { now: () => now },
  setTimeout: (callback, delay) => { timers.set(++timerId, { callback, at: now + delay }); return timerId; },
  clearTimeout: id => timers.delete(id),
  document: { hidden: false, addEventListener: (event, callback) => { if (event === 'visibilitychange') visibilityListener = callback; } },
  // Deliberately no speechSynthesis: tours must work without a speech engine.
  window: { addEventListener() {} },
});
vm.runInContext(source, context);
const run = code => vm.runInContext(code, context);
function nextTimer() {
  assert.equal(timers.size, 1, 'Exactly one tour timer should be active');
  const [id, timer] = [...timers][0];
  now = timer.at;
  timers.delete(id);
  timer.callback();
}
run('journeyStart()');
assert.deepEqual(visits, ['gate']);
now += 5000;
$('journeyPause').onclick();
assert.equal(timers.size, 0);
const pausedIndex = run('journeyIndex');
$('journeyNext').onclick();
assert.equal(run('journeyIndex'), pausedIndex, 'Next cannot advance a paused tour');
now += 60000;
$('journeyPause').onclick();
assert.deepEqual(visits, ['gate'], 'Resume must retain the current stop');
assert.equal([...timers.values()][0].at - now, 13000, 'Resume retains remaining reading time');
nextTimer();
assert.deepEqual(visits, ['gate', 'ha']);
context.document.hidden = true;
visibilityListener();
assert.equal(timers.size, 0, 'Hidden tabs pause the tour');
assert.equal($('journeyPause').textContent, 'Tiếp tục');
context.document.hidden = false;
$('journeyPause').onclick();
for (let i = 0; i < 5; i++) nextTimer();
assert.deepEqual(visits, ids, 'Automatic tour visits all six stops in order');
assert.equal(run('journey'), false);
assert.equal(overviewCount, 1);
assert.equal($('btnJourney').disabled, false);
assert.equal(timers.size, 0);
run('journeyStart()');
assert.equal(visits.at(-1), 'gate');
assert.equal($('journeyPause').textContent, 'Tạm dừng');
$('journeyExit').onclick();
assert.equal(timers.size, 0, 'Exit cleans up the pending timer');
assert.equal(run('journey'), false);
console.log('PASS Đền Hùng tour: six automatic stops, pause/resume timing, no skipped stop, hidden-tab pause, no speech engine, completion, restart and cleanup.');
