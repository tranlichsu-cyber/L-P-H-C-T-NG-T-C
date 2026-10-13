import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const map=JSON.parse(readFileSync('public/maps/thai-nguyen-92.json','utf8'));
assert.equal(map.units.length,92);
assert.equal(new Set(map.units.map(u=>u.id)).size,92);
assert.equal(new Set(map.units.map(u=>u.name)).size,92);
assert.equal(map.units.filter(u=>u.name.startsWith('Phường ')).length,15);
assert.equal(map.units.filter(u=>u.name.startsWith('Xã ')).length,77);
for(const u of map.units){assert.match(u.id,/^\d{5}$/);assert.match(u.path,/^M[0-9.,LZ]+Z$/);assert.ok(u.path.length>30);assert.ok(Number.isFinite(u.label.x)&&Number.isFinite(u.label.y));assert.equal(u.label.lines.join(' '),u.name);assert.ok(u.label.font>=5);}
const communes=[...readFileSync('src/data/heritageCatalog.ts','utf8').matchAll(/"commune": "([^"]+)"/g)].map(m=>m[1]);
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
for(const name of communes)assert.ok(map.units.some(u=>norm(u.name)===norm(name)),name);
console.log('PASS: 92 unique SVG regions, 77 communes/15 wards, all heritage communes matched.');
