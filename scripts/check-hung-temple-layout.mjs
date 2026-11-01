import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('public/models/den-hung-3d.html', 'utf8');
const context = vm.createContext({ Math });
vm.runInContext(html.slice(html.indexOf('const terraces='), html.indexOf('function buildMountain()')), context);
const sites = vm.runInContext('terraces', context);
const height = (x, z) => vm.runInContext(`terrainHeight(${x},${z})`, context);
// Relationships visible in the reference image, independent of precise survey coordinates.
assert(Math.abs(sites.gate[0]) < 1, 'Gate should be centred at the front');
assert(sites.gate[2] > sites.ha[2] && sites.gate[2] > sites.gieng[2]);
assert(sites.ha[0] < sites.gate[0], 'Hạ should be on the left');
assert(sites.lang[0] > sites.trung[0] && sites.gieng[0] > sites.gate[0]);
assert(sites.ha[1] < sites.trung[1] && sites.trung[1] < sites.thuong[1]);
assert(sites.ha[2] > sites.trung[2] && sites.trung[2] > sites.thuong[2]);
for (const [id, [x, y, z]] of Object.entries(sites)) {
  assert(Math.abs(height(x, z) - y) < .01, `${id}: terrace must support its building`);
}
for (let x = -17; x <= 17; x += .5) for (let z = -13; z <= 13; z += .5) {
  const y = height(x, z);
  assert(Number.isFinite(y) && y >= 0 && y < 15, 'Relief must contain finite, plausible heights');
}
console.log('PASS reference layout: front gate, left Hạ, rising central temples, right tomb/pond and grounded terraces.');
