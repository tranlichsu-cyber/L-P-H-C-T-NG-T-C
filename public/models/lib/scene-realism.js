/* Shared rendering and geometry utilities. Three.js r128, local and offline. */
(function(global){
 'use strict';
 function configure(renderer){
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.9;
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 }
 function material(color,roughness=.85){return new THREE.MeshStandardMaterial({color,roughness,metalness:0});}
 function mound(radius,height,segments=64){
  const geo=new THREE.PlaneGeometry(radius*2,radius*2,segments,segments);geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),z=pos.getZ(i),r=Math.hypot(x,z)/radius;
   const detail=1+.09*Math.sin(x*.47)*Math.cos(z*.36)+.045*Math.sin(x*.91+z*.73);
   pos.setY(i,Math.max(0,1-r*r)**1.7*height*detail);
  }
  const kept=[];for(let i=0;i<geo.index.count;i+=3){const tri=[geo.index.getX(i),geo.index.getX(i+1),geo.index.getX(i+2)];if(tri.every(j=>Math.hypot(pos.getX(j),pos.getZ(j))<=radius*1.01))kept.push(...tri);}geo.setIndex(kept);
  geo.computeVertexNormals();return geo;
 }
 function hull(length,width,depth){
  const vertices=[],indices=[],sections=20;
  for(let i=0;i<=sections;i++){
   const t=i/sections,z=(t-.5)*length,w=width*.5*Math.max(.025,Math.sin(Math.PI*t)**.6);
   const rise=Math.abs(t-.5)**3*depth*2;
   for(const [x,y] of [[-w,.1+rise],[-w*.5,-depth*.65],[0,-depth],[w*.5,-depth*.65],[w,.1+rise]])vertices.push(x,y,z);
  }
  for(let i=0;i<sections;i++)for(let j=0;j<4;j++){const a=i*5+j;indices.push(a,a+1,a+5,a+1,a+6,a+5);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
 }
 function limb(parent,a,b,r,mat){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r*.7,r,v.length(),8),mat);mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());mesh.castShadow=true;parent.add(mesh);return mesh;
 }
 function surface(kind){
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#b2aaa0';ctx.fillRect(0,0,128,128);
  let seed=19;for(let i=0;i<3500;i++){seed=(seed*16807)%2147483647;let x=seed%128;seed=(seed*16807)%2147483647;let y=seed%128;ctx.fillStyle=i%2?'rgba(30,20,10,.12)':'rgba(255,255,255,.1)';ctx.fillRect(x,y,kind==='wood'?1:2,kind==='wood'?12:2);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
 }
 const ticks=new Map();
 function delta(key){const now=performance.now(),last=ticks.get(key)??now;ticks.set(key,now);return Math.min(.05,Math.max(0,(now-last)/1000));}
 function naturalize(scene){
  const materials=new Set();scene.traverse(o=>{const list=Array.isArray(o.material)?o.material:[o.material];for(const m of list){if(!m||materials.has(m)||!m.isMeshStandardMaterial)continue;materials.add(m);if(!m.userData.srgbAlbedo){m.color.convertSRGBToLinear();m.userData.srgbAlbedo=true;}}
   if(o.isAmbientLight&&o.color.b>o.color.r*1.5){o.color.set(0xdce6ed);o.intensity=.15;}
  });
 }
 let dot;
 function particleTexture(){if(dot)return dot;const c=document.createElement('canvas');c.width=c.height=32;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(16,16,1,16,16,15);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,32,32);dot=new THREE.CanvasTexture(c);return dot;}
 const baseFovs=new WeakMap();
 function resizeCamera(camera){if(!baseFovs.has(camera))baseFovs.set(camera,camera.fov);const base=baseFovs.get(camera);camera.fov=Math.min(82,2*Math.atan(Math.tan(base*Math.PI/360)*Math.max(1,.95/camera.aspect))*180/Math.PI);camera.updateProjectionMatrix();}
 const flights=new WeakMap();
 function cameraControls(camera,controls){resizeCamera(camera);if(controls)controls.addEventListener('start',()=>flights.set(camera,{}));}
 function fly(camera,controls,targetPosition,targetLook){
  const token={};flights.set(camera,token);const start=performance.now(),from=camera.position.clone(),look=controls?controls.target.clone():new THREE.Vector3(),to=new THREE.Vector3(targetPosition.x,targetPosition.y,targetPosition.z),target=new THREE.Vector3(targetLook.x,targetLook.y,targetLook.z);
  const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?1:850;
  function frame(now){if(flights.get(camera)!==token)return;const t=Math.min(1,(now-start)/duration),e=t*t*(3-2*t);camera.position.lerpVectors(from,to,e);if(controls){controls.target.lerpVectors(look,target,e);controls.update();}else camera.lookAt(target);if(t<1)requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
 }
 function boatDetail(group,length,width){
  const wood=material(0x805a34),light=material(0xb08a57);
  for(const side of [-1,1]){
   const points=[];for(let i=0;i<=20;i++){const t=i/20;points.push(new THREE.Vector3(side*width*.5*Math.max(.025,Math.sin(Math.PI*t)**.6),.14+Math.abs(t-.5)**3*.6,(t-.5)*length));}
   group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.065,6,false),light));
   for(let i=0;i<5;i++){const z=(i-2)*length*.13;limb(group,[side*width*.4,.1,z],[side*(width*.5+1),-.15,z+.6],.035,wood);}
  }
  for(let i=0;i<4;i++){const seat=new THREE.Mesh(new THREE.BoxGeometry(width*.68,.1,.26),wood);seat.position.set(0,-.05,(i-1.5)*length*.17);group.add(seat);}
 }
 // Small deterministic surface atlases; no remote textures or per-object downloads.
 const detailTextures=new Map(),waterMaps=new Set(),roundedBoxes=new Map(),qualityControllers=new WeakMap();
 function detailTexture(kind,repeat=2){
  const key=kind+':'+repeat;if(detailTextures.has(key))return detailTextures.get(key);
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle='#eeeae1';ctx.fillRect(0,0,256,256);let seed=137;
  const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  for(let i=0;i<4200;i++){const x=rnd()*256,y=rnd()*256,v=Math.floor(140+rnd()*100);ctx.fillStyle=`rgba(${v},${v},${v},${kind==='tissue'?.09:.24})`;ctx.fillRect(x,y,1+rnd()*2,1+rnd()*2);}
  if(kind==='wood'||kind==='thatch'||kind==='cloth'){
   ctx.lineWidth=kind==='thatch'?1.5:.65;
   for(let x=0;x<256;x+=kind==='cloth'?5:3){ctx.beginPath();ctx.strokeStyle=`rgba(60,49,34,${.07+rnd()*.16})`;for(let y=0;y<=256;y+=4){const px=x+(kind==='cloth'?0:Math.sin(y*.035+x)*1.8);y?ctx.lineTo(px,y):ctx.moveTo(px,y);}ctx.stroke();}
   if(kind==='cloth')for(let y=0;y<256;y+=5){ctx.fillStyle='rgba(70,60,40,.14)';ctx.fillRect(0,y,256,1);}
   if(kind==='wood'){ctx.strokeStyle='rgba(55,38,18,.19)';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(40+i*60,70+(i%2)*115,3+i%2,13,0,0,Math.PI*2);ctx.stroke();}}
  }
  if(kind==='stone'||kind==='brick'||kind==='roof'){
   const row=kind==='roof'?32:64;ctx.lineWidth=kind==='stone'?1.5:2;
   for(let y=0;y<256;y+=row){ctx.fillStyle='rgba(40,30,20,.22)';ctx.fillRect(0,y,256,2);for(let x=(y/row%2)*32;x<256;x+=64){ctx.fillRect(x,y,2,row);ctx.fillStyle=`rgba(255,255,255,${.04+rnd()*.12})`;ctx.fillRect(x+3,y+3,59,row-5);ctx.fillStyle='rgba(40,30,20,.22)';}}
  }
  if(kind==='strata'){for(let y=0;y<256;y+=24){ctx.beginPath();ctx.strokeStyle='rgba(84,58,31,.24)';ctx.lineWidth=3;for(let x=0;x<=256;x+=8){const yy=y+Math.sin(x*.035+y)*2;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.stroke();}}
  if(kind==='bronze'){for(let i=0;i<320;i++){ctx.fillStyle='rgba(47,110,91,.15)';ctx.beginPath();ctx.arc(rnd()*256,rnd()*256,.5+rnd()*3,0,Math.PI*2);ctx.fill();}}
  if(kind==='scales'){for(let y=0;y<256;y+=12)for(let x=(y/12%2)*8;x<256;x+=16){ctx.beginPath();ctx.strokeStyle='rgba(55,63,36,.32)';ctx.ellipse(x,y,8,6,0,0,Math.PI);ctx.stroke();}}
  if(kind==='leaf'){ctx.strokeStyle='rgba(55,85,42,.24)';ctx.lineWidth=1;for(let y=0;y<256;y+=28){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y+90);ctx.stroke();}}
  if(kind==='water'){
   const image=ctx.createImageData(256,256);for(let y=0;y<256;y++)for(let x=0;x<256;x++){const n=(Math.sin(x*.2+Math.sin(y*.09)*2)+Math.cos(y*.17+x*.05)+Math.sin(x*.43-y*.31)*.2)*27+155,i=(y*256+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=n;image.data[i+3]=255;}ctx.putImageData(image,0,0);
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=4;
  detailTextures.set(key,t);return t;
 }
 function detail(material,kind,repeat=2,bump=.04){
  if(!material||!material.isMeshStandardMaterial)return material;
  const t=detailTexture(kind,repeat);material.bumpMap=t;material.bumpScale=bump;
  if(kind==='water'){material.metalness=.02;material.roughness=.24;material.flatShading=false;waterMaps.add(t);}
  else if(!material.map){const key=kind+':'+repeat+':color';if(!detailTextures.has(key)){const color=t.clone();color.encoding=THREE.sRGBEncoding;detailTextures.set(key,color);}material.map=detailTextures.get(key);}
  material.userData.surfaceKind=kind;material.needsUpdate=true;return material;
 }
 function updateMaterials(){
  if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const time=simulationTime()*.025;waterMaps.forEach(t=>t.offset.set(time%1,time*.43%1));
 }
 function planarUV(geo,axes=['x','z'],scale=1){
  const pos=geo.attributes.position,uv=[];for(let i=0;i<pos.count;i++)uv.push(pos['get'+axes[0].toUpperCase()](i)/scale,pos['get'+axes[1].toUpperCase()](i)/scale);geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return geo;
 }
 function softenEdges(scene){
  scene.traverse(o=>{
   if(!o.isMesh||o.isInstancedMesh||o.geometry.type!=='BoxGeometry'||Array.isArray(o.material)||o.material.opacity===0)return;
   const {width:w,height:h,depth:d}=o.geometry.parameters,min=Math.min(w,h,d),max=Math.max(w,h,d);
   if(min<.16||max/min>35)return;const r=Math.min(.045,min*.12),key=[w,h,d,r].join(':');
   if(!roundedBoxes.has(key)){
    const shape=new THREE.Shape();shape.moveTo(-w/2+r,-h/2+r);shape.lineTo(w/2-r,-h/2+r);shape.lineTo(w/2-r,h/2-r);shape.lineTo(-w/2+r,h/2-r);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,steps:1,curveSegments:1});geo.translate(0,0,-d/2+r);geo.computeVertexNormals();roundedBoxes.set(key,geo);
   }
   const old=o.geometry;o.geometry=roundedBoxes.get(key);old.dispose();
  });
 }
 // Inspection controls do not alter lesson content or the underlying model geometry.
 const motionListeners=new Set();let motionPaused=false,modelTime=0,modelTick=performance.now();
 function simulationTime(){const now=performance.now();if(!motionPaused)modelTime+=Math.max(0,(now-modelTick)/1000);modelTick=now;return modelTime;}
 function setMotionPaused(value){simulationTime();motionPaused=Boolean(value);motionListeners.forEach(fn=>fn(motionPaused));}
 function isMotionPaused(){return motionPaused;}
 function pausedFrame(renderer,scene,camera,controls,refresh){
  if(!motionPaused)return false;simulationTime();delta('simulation');
  if(controls){const auto=controls.autoRotate;controls.autoRotate=false;controls.update();controls.autoRotate=auto;}
  renderer.render(scene,camera);if(refresh)refresh();return true;
 }
 function inspectionPose(origin,target,view){
  const distance=Math.max(.1,origin.distanceTo(target));
  const directions={top:[0,1,.001],front:[0,.22,1],side:[1,.22,0]};
  if(view==='overview')return {position:origin.clone(),target:target.clone()};
  if(!directions[view])throw new Error('Unknown inspection view');
  return {position:new THREE.Vector3(...directions[view]).normalize().multiplyScalar(distance).add(target),target:target.clone()};
 }
 function roofTransparency(scene){
  const meshes=[];scene.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent){if(p.userData.inspectionRole==='roof'){meshes.push(o);break;}}});
  const originals=new Map(),copies=new Map();let active=false;
  function set(enabled){
   if(active===enabled)return;active=enabled;
   if(enabled){for(const mesh of meshes){originals.set(mesh,mesh.material);const make=material=>{if(!copies.has(material)){const copy=material.clone();copy.transparent=true;copy.opacity=.18;copy.depthWrite=false;copy.needsUpdate=true;copies.set(material,copy);}return copies.get(material);};mesh.material=Array.isArray(mesh.material)?mesh.material.map(make):make(mesh.material);}}
   else{originals.forEach((material,mesh)=>{mesh.material=material;});originals.clear();copies.forEach(material=>material.dispose());copies.clear();}
  }
  return {count:meshes.length,set,isActive:()=>active,dispose:()=>set(false)};
 }
 function installInspection(scene,renderer,camera,controls,onInspect){
  const origin=camera.position.clone(),target=controls.target.clone(),roof=roofTransparency(scene);
  const panel=document.createElement('details');panel.className='model-inspection';
  const summary=document.createElement('summary');summary.textContent='Góc nhìn & chuyển động';panel.appendChild(summary);
  const body=document.createElement('div');body.className='inspection-body';panel.appendChild(body);
  const views=document.createElement('div');views.className='inspection-views';views.setAttribute('role','group');views.setAttribute('aria-label','Góc quan sát');body.appendChild(views);
  for(const [id,label] of [['overview','Góc ban đầu'],['top','Từ trên'],['front','Phía trước'],['side','Bên cạnh']]){
   const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>{if(onInspect)onInspect();const pose=inspectionPose(origin,target,id);controls.autoRotate=false;flights.set(camera,{});camera.position.copy(pose.position);controls.target.copy(pose.target);controls.update();};views.appendChild(button);
  }
  const pause=document.createElement('button');pause.type='button';pause.title='Dừng chuyển động của mô hình; vẫn có thể xoay và đổi góc nhìn. Chuyến tham quan có nút tạm dừng riêng.';
  const syncPause=paused=>{pause.textContent=paused?'Tiếp tục chuyển động':'Dừng chuyển động';pause.setAttribute('aria-pressed',String(paused));};syncPause(motionPaused);motionListeners.add(syncPause);pause.onclick=()=>setMotionPaused(!motionPaused);body.appendChild(pause);
  if(roof.count){const toggle=document.createElement('button');toggle.type='button';toggle.textContent='Mái trong suốt';toggle.setAttribute('aria-pressed','false');toggle.onclick=()=>{roof.set(!roof.isActive());toggle.setAttribute('aria-pressed',String(roof.isActive()));};body.appendChild(toggle);}
  const note=document.createElement('p');note.textContent='Kéo để xoay; dùng con lăn hoặc hai ngón tay để thu phóng. Có thể đổi góc khi chuyển động đang dừng.';body.appendChild(note);document.body.appendChild(panel);
  const resetClock=()=>{modelTick=performance.now();};document.addEventListener('visibilitychange',resetClock);
  const cleanup=event=>{if(event?.persisted)return;roof.dispose();motionListeners.delete(syncPause);document.removeEventListener('visibilitychange',resetClock);panel.remove();};window.addEventListener('pagehide',cleanup);
  return {roof,dispose:()=>{cleanup();window.removeEventListener('pagehide',cleanup);}};
 }

 function finish(scene,renderer,{model='model',camera,controls,onInspect}={}){
  if(scene.userData.realismFinished)return;scene.userData.realismFinished=true;scene.userData.realismModel=model;
  softenEdges(scene);
  const low=typeof navigator!=='undefined'&&navigator.hardwareConcurrency<=4||typeof matchMedia==='function'&&matchMedia('(max-width:768px)').matches;
  let environmentTarget=null;
  // A local sky light probe gives non-metal surfaces soft environmental reflections.
  try { if(!low&&THREE.PMREMGenerator){
   const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const ctx=canvas.getContext('2d');
   const sky=ctx.createLinearGradient(0,0,0,128);sky.addColorStop(0,'#6d9fbf');sky.addColorStop(.48,'#dce7e8');sky.addColorStop(.53,'#c3c4aa');sky.addColorStop(1,'#626b51');ctx.fillStyle=sky;ctx.fillRect(0,0,256,128);ctx.fillStyle='#fff4d6';ctx.fillRect(180,32,9,7);
   const source=new THREE.CanvasTexture(canvas);source.encoding=THREE.sRGBEncoding;source.mapping=THREE.EquirectangularReflectionMapping;
   const generator=new THREE.PMREMGenerator(renderer);environmentTarget=generator.fromEquirectangular(source);scene.environment=environmentTarget.texture;source.dispose();generator.dispose();
  }} catch(error) { console.warn('Không tạo được ánh sáng môi trường; tiếp tục với đèn của mô hình.',error); }
  if(typeof document==='undefined'||!document.createElement)return;
  const panel=document.createElement('label');panel.className='model-quality';panel.textContent='Chất lượng hình ảnh ';const select=document.createElement('select');select.setAttribute('aria-label','Chất lượng hình ảnh');
  for(const [value,text] of [['auto','Tự động'],['low','Tiết kiệm'],['high','Chi tiết']]){const option=document.createElement('option');option.value=value;option.textContent=text;select.appendChild(option);}
  function apply(){const high=select.value==='high',autoLow=(typeof navigator!=='undefined'&&navigator.hardwareConcurrency<=4)||matchMedia('(max-width:768px)').matches,economy=select.value==='low'||select.value==='auto'&&autoLow;renderer.setPixelRatio(Math.min(typeof devicePixelRatio==='number'?devicePixelRatio:1,economy?1:high?2:1.5));renderer.shadowMap.enabled=!economy;scene.traverse(o=>{if(o.isDirectionalLight){o.castShadow=!economy;o.shadow.bias=-.0003;o.shadow.normalBias=.035;}});scene.userData.quality=select.value;}
  select.addEventListener('change',apply);qualityControllers.set(scene,value=>{select.value=value;apply();});panel.appendChild(select);document.body.appendChild(panel);window.addEventListener('resize',apply);apply();if(camera&&controls)installInspection(scene,renderer,camera,controls,onInspect);
  window.addEventListener('pagehide',event=>{if(event?.persisted)return;window.removeEventListener('resize',apply);panel.remove();environmentTarget?.dispose();qualityControllers.delete(scene);detailTextures.forEach(t=>t.dispose());roundedBoxes.forEach(g=>g.dispose());});
 }

 function setQuality(scene,value){if(['auto','low','high'].includes(value))qualityControllers.get(scene)?.(value);}
 function forest(parent,samples){
  const g=new THREE.Group();g.name='CanopyForest';parent.add(g);
  const trunk=detail(material(0x71543a),'wood',2,.035),foliage=detail(material(0x547044),'leaf',2,.025);
  const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.15,.24,2.2,7),trunk,samples.length);
  const canopies=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,7),foliage,samples.length*7),dummy=new THREE.Object3D();let i=0;
  for(const [x,y,z,scale=1] of samples){dummy.position.set(x,y+1.1*scale,z);dummy.scale.set(scale,scale,scale);dummy.rotation.set(0,0,0);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
   for(let k=0;k<7;k++){const a=k*2.399;dummy.position.set(x+Math.cos(a)*.6*scale,y+(2.5+(k%3)*.35)*scale,z+Math.sin(a)*.6*scale);dummy.scale.set((.95+k%2*.2)*scale,(.7+k%3*.09)*scale,.85*scale);dummy.rotation.y=a;dummy.updateMatrix();canopies.setMatrixAt(i*7+k,dummy.matrix);canopies.setColorAt(i*7+k,new THREE.Color().setHSL(.24+(k%3)*.008,.22,.7+(k%3)*.05));}i++;
  }
  for(const m of [trunks,canopies]){m.frustumCulled=false;m.castShadow=true;m.receiveShadow=true;g.add(m);}g.userData.treeCount=samples.length;return g;
 }
 function cropRows(parent,{x=0,z=0,width=10,depth=10,count=200,y=0,color=0x80934e,scale=1}={}){
  const vertices=[],uv=[],indices=[];for(let i=0;i<=6;i++){const t=i/6,w=Math.sin(Math.PI*t)*.12;vertices.push(-w,.9*t,.27*t*t,w,.9*t,.27*t*t);uv.push(0,t,1,t);if(i<6){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  const m=detail(material(color),'leaf',1,.02);m.side=THREE.DoubleSide;const crop=new THREE.InstancedMesh(geo,m,count),dummy=new THREE.Object3D();
  const cols=Math.ceil(Math.sqrt(count*width/depth)),rows=Math.ceil(count/cols);
  for(let i=0;i<count;i++){dummy.position.set(x+((i%cols)/cols-.5)*width,y,z+(Math.floor(i/cols)/rows-.5)*depth);dummy.rotation.set(0,i*2.399,Math.sin(i*3.1)*.12);dummy.scale.setScalar(scale*(.8+(i%7)*.06));dummy.updateMatrix();crop.setMatrixAt(i,dummy.matrix);}crop.receiveShadow=true;crop.frustumCulled=false;crop.name='CropRows';parent.add(crop);return crop;
 }

 global.ModelRealism={simulationTime,setMotionPaused,isMotionPaused,pausedFrame,inspectionPose,roofTransparency,installInspection,setQuality,forest,cropRows,detailTexture,detail,planarUV,softenEdges,finish,updateMaterials,configure,material,mound,hull,limb,surface,delta,naturalize,particleTexture,fly,cameraControls,boatDetail,resizeCamera};
})(window);
