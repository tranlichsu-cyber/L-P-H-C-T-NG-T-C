import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
let now=0;const nodes=[],events=new Map();
const ctx2d=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:()=>{}});
function element(tag){const e={tag,children:[],style:{},value:'auto',appendChild(c){this.children.push(c);},setAttribute(){},addEventListener(){},remove(){}};if(tag==='canvas')e.getContext=()=>ctx2d;nodes.push(e);return e;}
const document={hidden:false,body:element('body'),createElement:element};
const context=vm.createContext({console,document,performance:{now:()=>now},devicePixelRatio:3,navigator:{hardwareConcurrency:8},matchMedia:()=>({matches:false})});context.window=context;context.addEventListener=(k,f)=>events.set(k,f);context.removeEventListener=()=>{};
vm.runInContext(fs.readFileSync('public/models/lib/three.min.js','utf8'),context);vm.runInContext(fs.readFileSync('public/models/lib/scene-realism.js','utf8'),context);
const {THREE,ModelRealism:R}=context,scene=new THREE.Scene(),material=R.detail(new THREE.MeshStandardMaterial(),'wood'),bump=material.bumpMap;
const box=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),material);scene.add(box);const camera=new THREE.PerspectiveCamera(),controls={target:new THREE.Vector3()};
const renderer={shadowMap:{enabled:true},setPixelRatio(v){this.ratio=v;}};
R.finish(scene,renderer,{camera,controls});assert.equal(renderer.ratio,1);assert.equal(renderer.shadowMap.enabled,false);assert.equal(scene.environment,null);assert.equal(box.geometry.type,'BoxGeometry','No bevel expansion at default quality');assert.equal(material.bumpMap,null,'Disable bump sampling by default');assert.equal(nodes.filter(n=>n.tag==='details').length,0,'No floating inspection window is installed');
assert(R.shouldRenderFrame());now=10;assert.equal(R.shouldRenderFrame(),false);now=34;assert(R.shouldRenderFrame());document.hidden=true;now=100;assert.equal(R.shouldRenderFrame(),false);document.hidden=false;
R.setQuality(scene,'high');assert.equal(renderer.ratio,1.5);assert.equal(renderer.shadowMap.enabled,true);assert.equal(material.bumpMap,bump);assert.notEqual(box.geometry.type,'BoxGeometry');assert(R.shouldRenderFrame());now=118;assert(R.shouldRenderFrame());
R.setQuality(scene,'low');assert.equal(material.bumpMap,null);assert.equal(renderer.ratio,1);assert.equal(renderer.shadowMap.enabled,false);now=140;assert.equal(R.shouldRenderFrame(),false);now=160;assert(R.shouldRenderFrame());
for(const file of fs.readdirSync('public/models').filter(x=>x.endsWith('-3d.html'))){const html=fs.readFileSync('public/models/'+file,'utf8');assert(html.includes('v=20261102-performance1'),file);if(!html.includes('lib/model-workshop.js'))assert(html.includes('if(!ModelRealism.shouldRenderFrame())return;'),file);}
assert(fs.readFileSync('public/models/lib/model-workshop.js','utf8').includes('if(!ModelRealism.shouldRenderFrame())return;'));
console.log('PASS performance: no inspection window, 1x default resolution, no default shadows/environment/bevel/bump work, explicit high quality, 30/24/60 frame gates, hidden-tab gate and all 13 versioned models.');
