import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({console,performance,devicePixelRatio:1});context.window=context;
vm.runInContext(fs.readFileSync('public/models/lib/three.min.js','utf8'),context);
vm.runInContext(fs.readFileSync('public/models/lib/scene-realism.js','utf8'),context);
const {ModelRealism:R}=context;
const camera=new context.THREE.PerspectiveCamera(45,.5,.1,1000);R.resizeCamera(camera);assert(camera.fov>45&&camera.fov<=82);camera.aspect=2;R.resizeCamera(camera);assert(Math.abs(camera.fov-45)<.001,'Desktop FOV is restored after mobile resize');
for(const geometry of [R.mound(20,30),R.hull(8,3.5,1.2)]){
 for(const key of ['position','normal'])assert([...geometry.attributes[key].array].every(Number.isFinite));
 assert(geometry.index.count>0);
}
const hill=R.mound(20,30);hill.computeBoundingBox();assert(hill.boundingBox.max.y>25);assert.equal(hill.boundingBox.min.y,0);
const hull=R.hull(8,3.5,1.2),p=hull.attributes.position;
assert(Math.abs(p.getX(0))<.1,'Bow must taper rather than form a box');assert(Math.abs(p.getX(50))>1.5);
const modelDocuments=fs.readdirSync('public/models').filter(n=>n.endsWith('.html'));
for(const name of modelDocuments){
 const html=fs.readFileSync('public/models/'+name,'utf8');
 for(const match of html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(match[1],{filename:name});
}
const coast=JSON.parse(fs.readFileSync('public/models/data/vietnam-coastline.json','utf8'));
assert.equal(coast.type,'Polygon');const ring=coast.coordinates[0];assert(ring.length>40);assert(Math.min(...ring.map(p=>p[1]))<9);assert(Math.max(...ring.map(p=>p[1]))>23);
assert(fs.readFileSync('public/models/textures/earth-blue-marble.jpg').subarray(0,2).equals(Buffer.from([255,216])));
assert(fs.readFileSync('public/models/textures/earth-clouds.png').subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
console.log(`PASS model geometry: finite normals/vertices, rounded relief, tapered hull, geographic extents, local texture integrity and ${modelDocuments.length} inline documents.`);
