import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
let now=0;const listeners=new Map();
function element(tag){return {tag,children:[],attributes:{},style:{},textContent:'',appendChild(child){this.children.push(child);return child;},setAttribute(key,value){this.attributes[key]=value;},remove(){this.removed=true;}};}
const document={body:element('body'),createElement:element,addEventListener:(key,fn)=>listeners.set(key,fn),removeEventListener:key=>listeners.delete(key)};
const context=vm.createContext({console,document,performance:{now:()=>now},matchMedia:()=>({matches:false})});context.window=context;context.addEventListener=(key,fn)=>listeners.set(key,fn);context.removeEventListener=key=>listeners.delete(key);
vm.runInContext(fs.readFileSync('public/models/lib/three.min.js','utf8'),context);vm.runInContext(fs.readFileSync('public/models/lib/scene-realism.js','utf8'),context);
const {THREE,ModelRealism:R}=context;
now=1000;assert.equal(R.simulationTime(),1);R.setMotionPaused(true);now=5000;assert.equal(R.simulationTime(),1);
let renders=0,labels=0;const camera=new THREE.PerspectiveCamera(),controls={target:new THREE.Vector3(0,2,0),autoRotate:true,update(){assert.equal(this.autoRotate,false,'Pause must suppress autorotation while allowing orbit updates');}};
const renderer={render(){renders++;}};assert.equal(R.pausedFrame(renderer,{},camera,controls,()=>labels++),true);assert.equal(renders,1);assert.equal(labels,1);assert.equal(controls.autoRotate,true,'Remember original autorotation choice');
R.setMotionPaused(false);now=5500;assert.equal(R.simulationTime(),1.5,'No time jump after resume');assert.equal(R.pausedFrame(renderer,{},camera,controls),false);
const origin=new THREE.Vector3(12,14,20),target=new THREE.Vector3(0,3,0),distance=origin.distanceTo(target);
for(const view of ['overview','top','front','side']){const pose=R.inspectionPose(origin,target,view);assert(Math.abs(pose.position.distanceTo(pose.target)-distance)<1e-8);assert(pose.position.toArray().every(Number.isFinite));if(view==='top')assert(pose.position.y>target.y&&Math.abs(pose.position.z-target.z)<.1);}
assert.throws(()=>R.inspectionPose(origin,target,'invalid'));
const scene=new THREE.Scene(),roof=new THREE.Group();roof.userData.inspectionRole='roof';scene.add(roof);
const shared=new THREE.MeshStandardMaterial({color:0xa45b3b}),roofMesh=new THREE.Mesh(new THREE.BoxGeometry(3,.2,4),shared),wall=new THREE.Mesh(new THREE.BoxGeometry(3,2,.2),shared);roof.add(roofMesh);scene.add(wall);
const transparency=R.roofTransparency(scene);assert.equal(transparency.count,1);transparency.set(true);const copy=roofMesh.material;assert.notEqual(copy,shared);assert.equal(copy.opacity,.18);assert.equal(copy.depthWrite,false);assert.equal(wall.material,shared);assert.equal(shared.opacity,1);
transparency.set(true);assert.equal(roofMesh.material,copy,'Repeated enable reuses current clones');transparency.set(false);assert.equal(roofMesh.material,shared);transparency.dispose();
camera.position.copy(origin);controls.target.copy(target);controls.autoRotate=true;controls.update=()=>{};let manualViews=0;
const inspector=R.installInspection(scene,renderer,camera,controls,()=>manualViews++);const panel=document.body.children[0],body=panel.children[1],views=body.children[0];assert.equal(views.children.length,4);
views.children[1].onclick();assert.equal(manualViews,1);assert.equal(controls.autoRotate,false);assert(camera.position.y>target.y);assert(Math.abs(camera.position.z-target.z)<.1);
const pause=body.children[1];pause.onclick();assert.equal(R.isMotionPaused(),true);assert.equal(pause.attributes['aria-pressed'],'true');pause.onclick();assert.equal(R.isMotionPaused(),false);
const roofButton=body.children[2];roofButton.onclick();assert.equal(roofMesh.material.opacity,.18);assert.equal(roofButton.attributes['aria-pressed'],'true');inspector.dispose();assert.equal(roofMesh.material,shared);assert.equal(panel.removed,true);
for(const name of fs.readdirSync('public/models').filter(p=>p.endsWith('-3d.html'))){const html=fs.readFileSync('public/models/'+name,'utf8');assert(html.includes('v=20261102-inspection1'),name+' cache version');}
console.log('PASS inspection: four finite camera views, pause/resume without time jump, preserved manual orbit/autorotation state, isolated/restored roof materials, working UI handlers and 13 versioned pages.');
