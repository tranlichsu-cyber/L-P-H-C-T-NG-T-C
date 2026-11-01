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
 global.ModelRealism={configure,material,mound,hull,limb,surface,delta,naturalize,particleTexture,fly,cameraControls,boatDetail,resizeCamera};
})(window);
