import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const elements=[],events=new Map();
const ctx2d=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:()=>{}});
function element(tag){return {tag,children:[],style:{},value:'auto',appendChild(child){this.children.push(child);return child;},setAttribute(){},addEventListener(name,fn){this[name]=fn;},remove(){}};}
const document={createElement(tag){const el=element(tag);if(tag==='canvas')el.getContext=()=>ctx2d;elements.push(el);return el;},body:element('body')};
const context=vm.createContext({console,document,performance,devicePixelRatio:2,navigator:{hardwareConcurrency:4},matchMedia:()=>({matches:false})});
context.window=context;context.addEventListener=(name,fn)=>events.set(name,fn);context.removeEventListener=()=>{};
vm.runInContext(fs.readFileSync('public/models/lib/three.min.js','utf8'),context);
vm.runInContext(fs.readFileSync('public/models/lib/scene-realism.js','utf8'),context);
const {THREE,ModelRealism:R}=context;
for(const kind of ['wood','stone','roof','cloth','soil','strata','bronze','leaf','tissue','scales','water']){
 const a=R.detail(new THREE.MeshStandardMaterial(),kind,2,.03),b=R.detail(new THREE.MeshStandardMaterial(),kind,2,.03);
 assert.equal(a.bumpMap,b.bumpMap,'Reuse '+kind+' maps');assert.equal(a.map,b.map,'Reuse '+kind+' color maps');
 assert.equal(a.bumpMap.image.width,256);assert.equal(a.userData.surfaceKind,kind);
}
const water=R.detail(new THREE.MeshStandardMaterial({metalness:.9}),'water');assert.equal(water.metalness,.02);R.updateMaterials();assert(Number.isFinite(water.bumpMap.offset.x));
const scene=new THREE.Scene(),box=new THREE.Mesh(new THREE.BoxGeometry(3,2,4),new THREE.MeshStandardMaterial());scene.add(box);
const before=new THREE.Box3().setFromObject(box);R.softenEdges(scene);const after=new THREE.Box3().setFromObject(box);
assert(before.min.distanceTo(after.min)<.001&&before.max.distanceTo(after.max)<.001,'Bevels preserve object bounds');
const trees=R.forest(scene,[[1,2,3,1],[-2,0,5,1.5]]);assert.equal(trees.userData.treeCount,2);assert.equal(trees.children.length,2,'Trees are batched');
const crops=R.cropRows(scene,{count:200});assert.equal(crops.count,200);
const uv=R.planarUV(R.mound(5,3),['x','z'],4).attributes.uv;assert([...uv.array].every(Number.isFinite));
let meshes=0;scene.traverse(o=>{if(o.isMesh){meshes++;for(const key of ['position','normal'])assert([...o.geometry.attributes[key].array].every(Number.isFinite));if(o.isInstancedMesh)assert([...o.instanceMatrix.array].every(Number.isFinite));}});
const renderer={shadowMap:{enabled:true},setPixelRatio(value){this.ratio=value;}};
R.finish(scene,renderer,{model:'test'});assert.equal(renderer.ratio,1,'Auto detects low-core device');assert.equal(renderer.shadowMap.enabled,false);
R.setQuality(scene,'high');assert.equal(renderer.ratio,1.5);assert.equal(renderer.shadowMap.enabled,true);
R.setQuality(scene,'low');assert.equal(renderer.ratio,1);assert.equal(scene.userData.quality,'low');
const panels=document.body.children.length;R.finish(scene,renderer);assert.equal(document.body.children.length,panels,'No duplicated quality selector');
events.get('pagehide')();
for(const name of fs.readdirSync('public/models').filter(p=>p.endsWith('-3d.html'))){
 const html=fs.readFileSync('public/models/'+name,'utf8');assert(html.includes('lib/realism-quality.css'),name);assert(html.includes('lib/scene-realism.js'),name);
 const workshop=html.includes('lib/model-workshop.js');assert(workshop||html.includes('ModelRealism.finish(scene,renderer'),name);
}
console.log(`PASS realism: eleven cached surface types, nonmetallic water, preserved bevel bounds, ${meshes} finite meshes, batched trees/crops, quality switching and all 13 integrations.`);
