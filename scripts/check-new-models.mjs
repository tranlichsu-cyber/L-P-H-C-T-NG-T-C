import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const content=JSON.parse(fs.readFileSync('public/models/data/new-models.json','utf8'));
const ids=['thap-dinh-duong','co-the-nguoi-tuan-hoan','trong-dong-dong-son','van-mieu-quoc-tu-giam','nha-rong-tay-nguyen','dia-dao-cu-chi'];
const ctx2d=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),measureText:t=>({width:t.length*30}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:()=>{}});
const context=vm.createContext({console,performance,devicePixelRatio:1,document:{body:{dataset:{model:ids[0]}},createElement:()=>({width:1024,height:1024,getContext:()=>ctx2d})}});context.window=context;
vm.runInContext(fs.readFileSync('public/models/lib/three.min.js','utf8'),context);
vm.runInContext(fs.readFileSync('public/models/lib/scene-realism.js','utf8'),context);
const source=fs.readFileSync('public/models/lib/model-workshop.js','utf8');new vm.Script(source);
const harness=source.replace('init();\n})();',`window.WorkshopGeometryTest={build(id,config){data=config;scene=new THREE.Scene();root=new THREE.Group();scene.add(root);renderer={capabilities:{getMaxAnisotropy:()=>4}};parts.clear();hitMeshes.length=0;animated=[];const builders={'thap-dinh-duong':nutrition,'co-the-nguoi-tuan-hoan':heart,'trong-dong-dong-son':drum,'van-mieu-quoc-tu-giam':temple,'nha-rong-tay-nguyen':rong,'dia-dao-cu-chi':tunnels};builders[id]();return {scene,parts,animated};}};\n})();`);
assert.notEqual(harness,source);vm.runInContext(harness,context);
let meshes=0;
for(const id of ids){
 const data=content[id];assert(data&&data.features.length===6&&data.quiz.length===3);
 assert.equal(new Set(data.features.map(f=>f.id)).size,6);
 for(const q of data.quiz){assert(q.question&&q.explanation);assert(q.options.length===3);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);}
 const built=context.WorkshopGeometryTest.build(id,data);assert.equal(built.parts.size,6,id);
 built.scene.traverse(o=>{if(!o.geometry)return;meshes++;for(const key of ['position','normal']){const attr=o.geometry.attributes[key];if(attr)assert([...attr.array].every(Number.isFinite),id+' '+key);}});
 if(id==='van-mieu-quoc-tu-giam'){assert.equal(built.parts.get('steles').group.userData.steleCount,82);let count=0;built.parts.get('steles').group.traverse(o=>{if(o.userData.stele)count++;});assert.equal(count,82,'Count the actual stele meshes, not only metadata');}
 if(id==='co-the-nguoi-tuan-hoan'){
  assert(built.animated.filter(a=>a.type==='flow').length>=6,'Both lungs need circulation paths');
  const right=new context.THREE.Box3().setFromObject(built.parts.get('right-atrium').group).getCenter(new context.THREE.Vector3());
  const left=new context.THREE.Box3().setFromObject(built.parts.get('left-atrium').group).getCenter(new context.THREE.Vector3());assert(right.x<left.x,'Anatomical right is on viewer left');
 }
 if(id==='trong-dong-dong-son'){const star=built.parts.get('sun').group.children[0].geometry.parameters.shapes;const points=star.getPoints().slice(0,-1);assert.equal(points.filter(p=>Math.hypot(p.x,p.y)>1).length,14,'Star has fourteen outer rays');}
 if(id==='dia-dao-cu-chi'){
  const y=['level1','level2','level3'].map(key=>new context.THREE.Box3().setFromObject(built.parts.get(key).group).getCenter(new context.THREE.Vector3()).y);assert(y[0]>y[1]&&y[1]>y[2]);
 }
 const html=fs.readFileSync(`public/models/${id}-3d.html`,'utf8');assert(html.includes(`data-model="${id}"`));assert(html.includes('lib/model-workshop.js'));
}
const compiled=ts.transpileModule(fs.readFileSync('src/data/models/modelsCatalog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {modelsCatalog}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
assert.equal(modelsCatalog.filter(m=>m.status==='AVAILABLE').length,13);
for(const m of modelsCatalog){assert.equal(m.route,'/mo-hinh/'+m.id);assert(fs.existsSync('public/models/'+m.id+'-3d.html'));if(m.coverImage.startsWith('/'))assert(fs.existsSync('public'+m.coverImage),m.coverImage);}
console.log(`PASS six new models: ${meshes} finite geometries, 36 features, 18 quiz questions, 82 steles, circulation anatomy, tunnel layers and 13 working catalog routes.`);
// Run the real tour/controller handlers with a fake clock, without waiting minutes.
const elements=new Map(),visits=[],timers=new Map();let time=0,timerId=0;
const $=id=>{if(!elements.has(id))elements.set(id,{style:{},setAttribute(){}});return elements.get(id);};
const tourContext=vm.createContext({$,Math,window:{},document:{},controls:{autoRotate:false},data:{title:'Test',intro:'Intro',notice:'Notice',features:ids.map(id=>({id,name:id,text:'Nội dung ngắn'}))},tourActive:false,tourPaused:false,tourIndex:0,tourTimer:null,tourDeadline:0,tourRemaining:14000,performance:{now:()=>time},setTimeout:(callback,delay)=>{timers.set(++timerId,{callback,at:time+delay});return timerId;},clearTimeout:id=>timers.delete(id),selectFeature:id=>visits.push(id),modelControls(){},overview(){},zoom(){},showQuestion(){}});
vm.runInContext(source.slice(source.indexOf('function tourUI(){'),source.indexOf('function showQuestion(){')),tourContext);
vm.runInContext(source.slice(source.indexOf('function installUI(){'),source.indexOf('function zoom(')),tourContext);
vm.runInContext('installUI();startTour()',tourContext);assert.deepEqual(visits,[ids[0]]);time=3000;$('tour-pause').onclick();assert.equal(timers.size,0);time+=30000;$('tour-pause').onclick();assert.deepEqual(visits,[ids[0]],'Resume cannot skip the current stop');assert.equal([...timers.values()][0].at-time,9000,'Remaining reading time is retained');
for(let i=0;i<6;i++){assert.equal(timers.size,1);const [id,timer]=[...timers][0];time=timer.at;timers.delete(id);timer.callback();}
assert.deepEqual(visits,ids);assert.equal(tourContext.tourActive,false);assert.equal($('tour-start').disabled,false);assert.equal(timers.size,0);
vm.runInContext('startTour()',tourContext);$('tour-stop').onclick();assert.equal(timers.size,0);assert.equal(tourContext.tourActive,false);
console.log('PASS new-model tour: timed progression, retained pause/resume point and time, six stops, completion, restart and timer cleanup.');
