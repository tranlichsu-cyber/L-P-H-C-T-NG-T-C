/* Six educational WebGL scenes. No remote assets, accounts or production data required. */
(function(){
'use strict';
const $=id=>document.getElementById(id),modelId=document.body.dataset.model;
let data,scene,camera,renderer,controls,root,frameId,selected=null,labelsVisible=true;
const parts=new Map(),hitMeshes=[],labels=[],disposables=new Set();
let outline,animated=[],pulse=true,pulseSpeed=60,mode='default',audio=null,plateGroup=null,pyramidGroup=null,heartShell=null,soilCover=null;
let lastTime=performance.now(),elapsed=0,tourActive=false,tourPaused=false,tourIndex=0,tourTimer=null,tourDeadline=0,tourRemaining=14000;
let quizIndex=0,quizScore=0,quizAnswered=false;
const meal=new Set();
const mat=(color,roughness=.85,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const palette={stone:mat(0xc5bda8),wood:mat(0x68442c),lightWood:mat(0xa67c4d),roof:mat(0xa14b32),grass:mat(0x607b47),soil:mat(0x93714e),bronze:mat(0xac8543,.6,.65),water:mat(0x487b78,.25,.02)};
function mesh(geometry,material,x=0,y=0,z=0,parent=root){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const box=(w,h,d,x,y,z,material,parent=root)=>mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
function ellipsoid(rx,ry,rz,x,y,z,material,parent=root){const m=mesh(new THREE.SphereGeometry(1,24,16),material,x,y,z,parent);m.scale.set(rx,ry,rz);return m;}
function group(x=0,y=0,z=0,parent=root){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
function line(points,r,material,parent=root){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,Math.max(24,points.length*10),r,8,false),material,0,0,0,parent);}
function register(id,g,anchor){const item=data.features.find(f=>f.id===id);if(!item)throw new Error('Thiếu nội dung '+id);g.userData.featureId=id;parts.set(id,{group:g,anchor:anchor?new THREE.Vector3(...anchor):null});g.traverse(o=>{if(o.isMesh){o.userData.featureId=id;hitMeshes.push(o)}});}
function canvasTexture(draw,w=1024,h=1024){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());disposables.add(t);return t;}
function ground(w,d){box(w,.5,d,0,-.3,0,palette.soil);box(w,.12,d,0,0,0,palette.grass);}
function tree(x,z,s=1){const g=group(x,0,z);mesh(new THREE.CylinderGeometry(.1,.17,1.9,8),palette.wood,0,.95,0,g);for(let i=0;i<4;i++)ellipsoid(.85,.8,.75,Math.cos(i*2.4)*.4,2+i*.16,Math.sin(i*2.4)*.4,mat(i%2?0x4e733e:0x557b40),g);g.scale.setScalar(s);}
function roof(parent,w,d,y,h=.9){
 const vertices=[],indices=[],nx=18,nz=12;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=(i/nx-.5)*w,z=(j/nz-.5)*d;vertices.push(x,y+h*(1-Math.abs(z/(d/2))*.9)+.2*Math.abs(x/(w/2))**8+.15*Math.abs(z/(d/2))**6,z);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;indices.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const material=palette.roof.clone();material.side=THREE.DoubleSide;mesh(geo,material,0,0,0,parent);
 const tileMat=mat(0xb66645),tileGeo=new THREE.CylinderGeometry(.025,.025,d/nz,5),tiles=new THREE.InstancedMesh(tileGeo,tileMat,nx*nz),dummy=new THREE.Object3D();
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=((i+.5)/nx-.5)*w,z=((j+.5)/nz-.5)*d,yv=y+h*(1-Math.abs(z/(d/2))*.9)+.2*Math.abs(x/(w/2))**8+.15*Math.abs(z/(d/2))**6;dummy.position.set(x,yv+.025,z);dummy.rotation.x=Math.PI/2+(z<0?-.3:.3);dummy.updateMatrix();tiles.setMatrixAt(j*nx+i,dummy.matrix);}parent.add(tiles);
 box(w,.12,.13,0,y+h+.08,0,tileMat,parent);
 for(const side of [-1,1])line([[side*w*.42,y+h,0],[side*w*.5,y+h+.1,0],[side*w*.55,y+h+.42,0]],.045,tileMat,parent);
}
function hall(x,z,w=6,d=4){const g=group(x,.2,z);box(w+.7,.35,d+.7,0,.18,0,palette.stone,g);box(w,.15,d,0,.45,0,palette.lightWood,g);box(w,2,.15,0,1.5,-d*.45,palette.wood,g);for(let i=0;i<5;i++){const xx=(i/4-.5)*w*.9;mesh(new THREE.CylinderGeometry(.09,.13,2.6,10),palette.wood,xx,1.7,d*.4,g);}roof(g,w+1,d+1,3,.9);return g;}
function nutrition(){
 ground(18,14);pyramidGroup=group();const materials=[0xc9a66a,0x71994f,0xb5855c,0xc8d5cd,0xcda64d,0xd5c7a8],ids=['grain','greens','protein','milk','fat','limit'];
 for(let i=0;i<6;i++){
  const w=10-i*1.4,top=i===5?.25:w-1.25,d=w*.45,td=top*.45,g=group(0,.35+i*1.05,0,pyramidGroup);
  const vertices=[-w/2,0,d/2,w/2,0,d/2,top/2,1,td/2,-top/2,1,td/2,-w/2,0,-d/2,w/2,0,-d/2,top/2,1,-td/2,-top/2,1,-td/2],indices=[0,1,2,0,2,3,1,5,6,1,6,2,5,4,7,5,7,6,4,0,3,4,3,7,3,2,6,3,6,7,4,5,1,4,1,0];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,mat(materials[i]),0,0,0,g);
  const label=canvasTexture((ctx,W,H)=>{ctx.fillStyle='#fff4d7';ctx.fillRect(0,0,W,H);ctx.fillStyle='#513a24';ctx.font='bold 42px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(data.features[i].name,W/2,H/2,W-25);},768,128);
  const sign=mesh(new THREE.PlaneGeometry(Math.min(w-.3,5.5),.55),new THREE.MeshBasicMaterial({map:label}),0,.48,(d+td)/4+.03,g);sign.rotation.x=-.26;register(ids[i],g,[0,1+i*1.05,d/2+.3]);
 }
 plateGroup=group(0,0,1);plateGroup.visible=false;
 mesh(new THREE.CylinderGeometry(5,4.7,.25,64),mat(0xe1dfd2),0,.3,0,plateGroup);
 const rim=mesh(new THREE.TorusGeometry(4.7,.14,8,64),mat(0xcac5b3),0,.5,0,plateGroup);rim.rotation.x=Math.PI/2;
}
function addFood(id){
 const angle=['grain','greens','protein','fruit','milk','water'].indexOf(id)/6*Math.PI*2,x=Math.cos(angle)*2.7,z=Math.sin(angle)*2.7,g=group(x,.5,z,plateGroup);g.userData.food=id;
 if(id==='grain'){mesh(new THREE.CylinderGeometry(.9,.6,.5,24),mat(0xe5e0ca),0,.25,0,g);for(let i=0;i<22;i++)ellipsoid(.12,.07,.055,Math.sin(i*2.4)*.65,.57+(i%3)*.025,Math.cos(i*2.4)*.65,mat(0xf2e4bd),g);}
 if(id==='greens')for(let i=0;i<9;i++){const leaf=ellipsoid(.4,.12,.7,Math.sin(i)*.4,.15+i*.06,Math.cos(i)*.3,mat(i%2?0x608442:0x436e37),g);leaf.rotation.y=i;}
 if(id==='protein'){ellipsoid(.95,.2,.4,0,.25,0,mat(0xa8997c),g);const tail=mesh(new THREE.ConeGeometry(.4,.6,3),mat(0x8d806a),-1,.25,0,g);tail.rotation.z=Math.PI/2;ellipsoid(.08,.06,.05,.7,.35,.28,mat(0x20241c),g);}
 if(id==='fruit'){ellipsoid(.5,.48,.5,-.3,.5,0,mat(0xd59a35),g);ellipsoid(.4,.4,.4,.5,.4,.3,mat(0xb86443),g);}
 if(id==='milk'){box(.8,1.3,.7,0,.7,0,mat(0xdde6d8),g);box(.85,.3,.75,0,1.5,0,mat(0x688d9b),g);}
 if(id==='water'){const glass=mat(0x9dc8d2,.15);glass.transparent=true;glass.opacity=.45;mesh(new THREE.CylinderGeometry(.46,.4,1.25,24),glass,0,.7,0,g);mesh(new THREE.CylinderGeometry(.4,.35,.85,24),palette.water,0,.5,0,g);}
 ModelRealism.naturalize(g);
}
function heart(){
 const heartGroup=group();heartGroup.userData.kind='heart';
 const blue=mat(0x416b9d,.6),red=mat(0xb64d4a,.65),wall=mat(0xa65147,.65);wall.transparent=true;wall.opacity=.22;wall.depthWrite=false;
 heartShell=ellipsoid(2.7,3.3,1.55,.1,5.5,0,wall,heartGroup);heartShell.rotation.z=-.18;
 const specs=[['right-atrium',-1.4,7.2,.95,1.05,blue],['right-ventricle',-1.2,4.7,1.15,1.9,blue],['left-atrium',1.2,7.3,.85,1,red],['left-ventricle',1.3,4.5,1.25,2.2,red]];
 for(const [id,x,y,rx,ry,material] of specs){const g=group(0,0,0,heartGroup),chamber=ellipsoid(rx,ry,.95,x,y,.05,material,g);chamber.rotation.z=x>0?-.12:.16;register(id,g,[x<0?-3.4:3.4,y+ry*.7,.8]);}
 for(const x of [-1.2,1.2]){const valve=mesh(new THREE.TorusGeometry(.48,.065,8,28),mat(0xd8c7aa),x,6.2,.25,heartGroup);valve.rotation.x=Math.PI/2;}
 const lungs=group();for(const side of [-1,1]){const material=mat(0xc49d95);material.transparent=true;material.opacity=.3;material.depthWrite=false;ellipsoid(1.9,3.1,1,side*6,7,-1,material,lungs);for(let i=0;i<3;i++)line([[side*3.8,8.5,-.6],[side*5.2,8-i,-.4],[side*6.5,8.6-i*1.5,-.5]],.08,mat(0x9c8575),lungs);}register('lungs',lungs,[-6,10.8,0]);
 const body=group();const bodyOutline=mat(0xa9c1bf,.9);bodyOutline.transparent=true;bodyOutline.opacity=.14;bodyOutline.depthWrite=false;ellipsoid(4.9,6.8,1.25,0,4,-2.3,bodyOutline,body);register('body',body,[4.5,.3,0]);
 const routes=[
  {color:blue,points:[[0,-1.5,0],[-4,-1,0],[-4,9,0],[-1.5,8,0],[-1.4,7.2,0],[-1.2,4.7,0]]},
  {color:blue,points:[[-1.2,4.7,0],[-.3,8.8,.4],[-3.5,9,0],[-6,7,0]]},
  {color:red,points:[[-6,7,0],[-4,6.3,.5],[1.2,7.3,.5],[1.3,4.5,.5]]},
  {color:blue,points:[[-1.2,4.7,0],[-.3,8.8,.4],[3.5,9,0],[6,7,0]]},
  {color:red,points:[[6,7,0],[4,6.3,.5],[1.2,7.3,.5],[1.3,4.5,.5]]},
  {color:red,points:[[1.3,4.5,.5],[2,10,0],[4,10,0],[4,-1,0],[0,-1.5,0]]}
 ];
 for(const route of routes){const tube=line(route.points,.15,route.color);tube.castShadow=false;const curve=new THREE.CatmullRomCurve3(route.points.map(p=>new THREE.Vector3(...p)));const dots=[];for(let i=0;i<8;i++)dots.push(mesh(new THREE.SphereGeometry(.13,10,8),route.color,0,0,0));animated.push({type:'flow',curve,dots});}
 animated.push({type:'heart',group:heartGroup});
}
function drum(){
 ground(16,14);const g=group();const points=[[4.7,.4],[4.65,.8],[3.6,2.2],[3.4,3.4],[4.5,4.5],[5.2,5.3],[5.35,6.35],[5.2,6.8]].map(([r,y])=>new THREE.Vector2(r,y));
 const bronze=palette.bronze.clone();bronze.bumpMap=ModelRealism.surface('stone');bronze.bumpScale=.035;const shell=mesh(new THREE.LatheGeometry(points,128),bronze,0,0,0,g);register('body',g,[4,3,0]);
 const face=group(),faceMap=canvasTexture((ctx,W,H)=>{
  ctx.fillStyle='#bda061';ctx.fillRect(0,0,W,H);const c=W/2;ctx.strokeStyle='#68502b';ctx.lineWidth=3;
  for(const r of [180,205,220,270,300,335,355,385,415,445,475]){ctx.beginPath();ctx.arc(c,c,r,0,Math.PI*2);ctx.stroke();}
  for(let i=0;i<64;i++){let a=i*Math.PI/32;ctx.beginPath();ctx.arc(c+Math.cos(a)*460,c+Math.sin(a)*460,4,0,Math.PI*2);ctx.fillStyle='#6b542e';ctx.fill();}
  for(let i=0;i<18;i++){const a=i*Math.PI*2/18;ctx.save();ctx.translate(c+Math.cos(a)*360,c+Math.sin(a)*360);ctx.rotate(a+Math.PI/2);ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(-3,-8);ctx.lineTo(23,-32);ctx.lineTo(9,-4);ctx.lineTo(33,5);ctx.lineTo(3,7);ctx.lineTo(-16,23);ctx.lineTo(-9,3);ctx.closePath();ctx.fill();ctx.restore();}
  for(let i=0;i<28;i++){const a=i*Math.PI/14;ctx.save();ctx.translate(c+Math.cos(a)*245,c+Math.sin(a)*245);ctx.rotate(a);ctx.strokeRect(-9,-10,18,20);ctx.restore();}
 },1024,1024);
 const topMat=bronze.clone();topMat.map=faceMap;mesh(new THREE.CylinderGeometry(5.23,5.23,.12,128),topMat,0,6.83,0,face);register('birds',face,[3.7,7.1,0]);
 const sun=group();const star=new THREE.Shape();for(let i=0;i<28;i++){const a=i*Math.PI/14,r=i%2?.7:1.65;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?star.lineTo(x,y):star.moveTo(x,y);}star.closePath();const starMesh=mesh(new THREE.ExtrudeGeometry(star,{depth:.035,bevelEnabled:false}),mat(0xd7b363,.65,.65),0,6.93,0,sun);starMesh.rotation.x=-Math.PI/2;register('sun',sun,[0,7.7,0]);
 const handles=group();for(const x of [-4.4,4.4])for(const z of [-.65,.65]){const h=mesh(new THREE.TorusGeometry(.62,.13,10,32,Math.PI*1.6),bronze,x,3.9,z,handles);h.rotation.y=Math.PI/2;}register('handles',handles,[-4.7,4.7,0]);
 const life=group();for(let i=0;i<16;i++){const a=i*Math.PI/8;const x=Math.cos(a)*4.7,z=Math.sin(a)*4.7;ellipsoid(.12,.13,.12,x,5.25,z,bronze,life);ModelRealism.limb(life,[x,5.1,z],[x,4.6,z],.06,bronze);for(const sign of [-1,1])ModelRealism.limb(life,[x,4.65,z],[x+Math.cos(a+Math.PI/2)*sign*.25,4.3,z+Math.sin(a+Math.PI/2)*sign*.25],.045,bronze);}register('life',life,[-3,5.3,3]);
 const base=group();box(11.5,.25,11.5,0,.1,0,palette.wood,base);register('heritage',base,[0,.3,5.7]);
}
function temple(){
 ground(27,45);box(4,.08,41,0,.15,0,palette.stone);for(const x of [-12.8,12.8])box(.22,.8,43,x,.45,0,palette.stone);
 const gate=group(0,.2,17);for(const x of [-2.6,2.6])box(.65,3.3,.7,x,1.65,0,palette.stone,gate);box(5.9,.5,.9,0,3,0,palette.stone,gate);roof(gate,7,2.6,3.4,.9);register('gate',gate,[0,4.8,17]);
 const middle=hall(0,9,6,2);register('middle',middle,[0,4.7,9]);
 const khue=group(0,.2,2);for(const x of [-1.65,1.65])for(const z of [-1.3,1.3])box(.4,2.7,.4,x,1.35,z,palette.stone,khue);
 box(4,.25,3.5,0,2.8,0,palette.wood,khue);for(const x of [-1.7,1.7])box(.2,2.5,3.3,x,4.1,0,palette.wood,khue);for(const x of [-1.1,1.1])box(.45,2.1,.2,x,4,-1.55,palette.wood,khue);
 const circle=mesh(new THREE.TorusGeometry(.8,.11,10,48),palette.wood,0,4.2,1.68,khue);ModelRealism.limb(khue,[-.8,4.2,1.68],[.8,4.2,1.68],.045,palette.lightWood);ModelRealism.limb(khue,[0,3.4,1.68],[0,5,1.68],.045,palette.lightWood);roof(khue,4.9,4.2,5.4,.75);roof(khue,5.6,4.7,3.1,.65);register('khue',khue,[0,6.6,2]);
 const well=group(0,0,-5.8);box(8,.12,8,0,.13,0,palette.water,well);for(const x of [-4.2,4.2])box(.35,.45,8.7,x,.3,0,palette.stone,well);for(const z of [-4.2,4.2])box(8.7,.45,.35,0,.3,z,palette.stone,well);register('well',well,[0,.5,-5.8]);
 const steles=group();let count=0;for(const side of [-1,1])for(let i=0;i<41;i++){
  const row=i%7,col=Math.floor(i/7),x=side*(5.4+col*.95),z=-1.4-row*1.3,g=group(x,.2,z,steles);
  ellipsoid(.34,.14,.45,0,.15,0,palette.stone,g);ellipsoid(.12,.08,.12,0,.16,.48,palette.stone,g);const slab=box(.42,.85,.12,0,.68,0,palette.stone,g);ellipsoid(.21,.16,.065,0,1.1,0,palette.stone,g);
  for(let j=0;j<5;j++)box(.28,.015,.015,0,.48+j*.11,.07,palette.wood,g);slab.userData.stele=true;count++;
 }steles.userData.steleCount=count;for(const side of [-1,1]){const pavilion=group(side*8,.15,-5.3,steles);for(const x of [-2.9,2.9])for(const z of [-4.7,4.7])mesh(new THREE.CylinderGeometry(.08,.1,2.6,8),palette.wood,x,1.3,z,pavilion);roof(pavilion,7,10.5,2.8,.7);}register('steles',steles,[-8,4,-5]);
 const study=group();const dai=hall(0,-13.4,10,4);study.add(dai);const thai=hall(0,-20,9,3);study.add(thai);register('study',study,[0,5,-16]);
 for(let i=0;i<16;i++)tree((i%2?1:-1)*(9.5+(i%3)),17-Math.floor(i/2)*4.3,.7);
}
function rong(){
 ground(29,27);const house=group(0,0,-2);const floor=group(0,0,0,house);
 for(const x of [-3.4,0,3.4])for(const z of [-2.2,2.2])mesh(new THREE.CylinderGeometry(.17,.22,2.5,10),palette.wood,x,1.25,z,floor);
 box(8,.22,5.6,0,2.5,0,palette.lightWood,floor);for(let x=-3.8;x<4;x+=.35)box(.025,.03,5.5,x,2.63,0,palette.wood,floor);
 const woven=palette.lightWood.clone();woven.bumpMap=ModelRealism.surface('wood');woven.bumpScale=.04;
 for(const side of [-1,1])box(.15,1.8,5,side*3.9,3.5,0,woven,floor);box(8,1.8,.14,0,3.5,-2.45,woven,floor);for(const x of [-2.6,2.6])box(2.5,1.8,.14,x,3.5,2.45,woven,floor);register('floor',floor,[-4,3,-2]);
 const roofGroup=group(0,0,0,house),vertices=[],indices=[],nx=36,nz=16;
 const height=x=>4.1+8.4*(1-Math.abs(x)/5.5)**1.65;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=(i/nx-.5)*11,z=(j/nz-.5)*7.2;vertices.push(x,height(x),z);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;indices.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const thatch=mat(0x8c6b3f);thatch.side=THREE.DoubleSide;thatch.bumpMap=ModelRealism.surface('wood');thatch.bumpMap.repeat.set(10,7);thatch.bumpScale=.1;mesh(geo,thatch,0,0,0,roofGroup);
 for(let i=0;i<34;i++){const x=(i/33-.5)*10.8;line([[x,height(x)+.04,-3.6],[x,height(x)+.04,3.6]],.015,palette.lightWood,roofGroup);}box(.15,.2,7.5,0,12.55,0,palette.wood,roofGroup);const gableShape=new THREE.Shape();gableShape.moveTo(-5.5,4.1);for(let i=0;i<=36;i++){const x=(i/36-.5)*11;gableShape.lineTo(x,height(x));}gableShape.lineTo(5.5,4.1);gableShape.closePath();
 const gableMaterial=palette.lightWood.clone();gableMaterial.side=THREE.DoubleSide;gableMaterial.bumpMap=ModelRealism.surface('wood');gableMaterial.bumpScale=.05;
 for(const z of [-3.59,3.59])mesh(new THREE.ShapeGeometry(gableShape),gableMaterial,0,0,z,roofGroup);
 register('roof',roofGroup,[0,13.5,-2]);
 const ladder=group();ModelRealism.limb(ladder,[-.8,0,5],[-.8,2.6,.8],.12,palette.wood);ModelRealism.limb(ladder,[.8,0,5],[.8,2.6,.8],.12,palette.wood);for(let i=0;i<8;i++)box(1.6,.12,.3,0,.15+i*.32,4.8-i*.52,palette.lightWood,ladder);register('ladder',ladder,[0,2.5,3]);
 const gongs=group(-7,0,5);for(const x of [-2.5,2.5])mesh(new THREE.CylinderGeometry(.09,.13,3.7,8),palette.wood,x,1.85,0,gongs);box(5.4,.18,.18,0,3.7,0,palette.wood,gongs);
 for(let i=0;i<7;i++){const r=.65-i*.055,x=-2+i*.66,gong=mesh(new THREE.CylinderGeometry(r,r,.07,40),palette.bronze,x,2.2,0,gongs);gong.rotation.x=Math.PI/2;ellipsoid(r*.22,r*.22,.12,x,2.2,.1,palette.bronze,gongs);ModelRealism.limb(gongs,[x,3.6,0],[x,2.8,0],.018,palette.wood);}register('gongs',gongs,[-7,4.5,5]);
 const hearth=group(4.5,0,6.5);mesh(new THREE.CylinderGeometry(1.1,1.1,.08,32),mat(0x5f5545),0,.1,0,hearth);for(let i=0;i<8;i++){const a=i*Math.PI/4;ellipsoid(.25,.16,.21,Math.cos(a),.15,Math.sin(a),palette.stone,hearth);}for(let i=0;i<3;i++){const log=mesh(new THREE.CylinderGeometry(.12,.12,1.7,8),palette.wood,0,.25,0,hearth);log.rotation.z=Math.PI/2;log.rotation.y=i*1.1;}
 const flame=mesh(new THREE.ConeGeometry(.45,1.5,9),new THREE.MeshBasicMaterial({color:0xe5a43c,transparent:true,opacity:.85}),0,.9,0,hearth);animated.push({type:'fire',mesh:flame});register('hearth',hearth,[4.5,2.5,6.5]);
 const community=group();for(let i=0;i<9;i++){const a=i*Math.PI*2/9,x=Math.cos(a)*3+4.5,z=Math.sin(a)*3+6.5;ellipsoid(.15,.15,.15,x,1.45,z,mat(0xa67f60),community);box(.35,.7,.23,x,.95,z,mat(i%2?0x59382d:0x343c36),community);for(const side of [-1,1])ModelRealism.limb(community,[x+side*.09,.6,z],[x+side*.12,.1,z],.07,palette.wood);}register('community',community,[8,2.4,7]);for(let i=0;i<10;i++)tree((i%2?1:-1)*(10+i%3),-10+Math.floor(i/2)*4,1.2);
}
function tunnels(){
 const soil=mat(0x9e7b52),dark=mat(0x6b5038),floorMat=mat(0xc2a077);box(24,.4,18,0,-13.7,0,dark);
 box(24,.13,8,0,.12,-5,palette.grass);
 const back=box(24,13.5,8,0,-6.7,-5,soil);back.material=soil.clone();back.material.transparent=true;back.material.opacity=.25;back.material.depthWrite=false;
 soilCover=group();box(24,13.5,18,0,-6.7,0,soil,soilCover);box(24,.15,18,0,.13,0,palette.grass,soilCover);soilCover.visible=false;mode='cutaway';
 const ids=['level1','level2','level3'];
 for(let level=0;level<3;level++){
  const y=-2.5-level*3.7,g=group();const routes=[ [[-9,y,2],[-6,y,2],[0,y,2],[7,y,2],[9,y,-1]], [[-6,y,2],[-6,y,-3],[1,y,-3],[1,y,2]] ];
  for(const route of routes){const tunnel=line(route,.6,dark,g);tunnel.material=dark.clone();tunnel.material.side=THREE.DoubleSide;tunnel.material.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,0,-1),2.1)];}
  box(18,.12,1.1,0,y-.5,2,floorMat,g);box(3,1.7,.15,4,y+.3,-1,dark,g);box(3,.12,3,4,y-.5,.4,floorMat,g);for(const x of [2.5,5.5])box(.12,1.7,3,x,y+.3,.4,dark,g);
  if(level===1){box(2.2,.12,1.25,4,y-.15,.2,palette.wood,g);box(1.9,.15,1.1,4,y+.01,.2,mat(0xc4c6aa),g);ellipsoid(.22,.1,.4,3.3,y+.14,.2,mat(0xe2dfc8),g);for(const x of [3.1,4.9])for(const z of [-.25,.65])box(.08,.35,.08,x,y-.33,z,palette.wood,g);}
  register(ids[level],g,[9,y+.7,2]);
 }
 const entry=group();line([[-9,.1,2],[-9,-1.2,2],[-9,-2.5,2]],.7,dark,entry);box(1.8,.13,1.6,-9,.2,2,palette.wood,entry);for(let i=0;i<5;i++)box(.9,.08,.3,-9,-.2-i*.45,2,palette.lightWood,entry);register('entry',entry,[-9,1.2,2]);
 const shafts=group();for(const x of [-5,6]){line([[x,-2.5,2],[x,-6.2,2],[x,-9.9,2]],.45,dark,shafts);for(let i=0;i<17;i++)ModelRealism.limb(shafts,[x-.3,-2.5-i*.44,2],[x+.3,-2.5-i*.44,2],.03,palette.lightWood);}
 const kitchen=group();box(3,.15,2.8,-1,-2.95,-2,palette.stone,kitchen);for(let i=0;i<3;i++)mesh(new THREE.CylinderGeometry(.4,.48,.38,16),dark,-1+i*.65,-2.65,-2,kitchen);line([[-1,-2.5,-2],[-1,-1.3,-4],[3,-.6,-5],[7,.3,-6]],.12,dark,kitchen);register('kitchen',kitchen,[-1,-1.3,-2]);
 const air=group();for(const x of [-7,8]){line([[x,-6.2,-3],[x,-2,-4],[x,.2,-5]],.13,dark,air);mesh(new THREE.ConeGeometry(.65,1.1,12),soil,x,.45,-5,air);}register('air',air,[8,1.8,-5]);
 for(let i=0;i<9;i++)tree(-10+i*2.6,-7,1);
 const smoke=group(7,.5,-6);for(let i=0;i<7;i++){const m=ellipsoid(.12,.09,.12,0,i*.3,0,mat(0xd2d2c5),smoke);m.material.transparent=true;m.material.opacity=.35;animated.push({type:'smoke',mesh:m,phase:i/7});}
}
const presets={
 'thap-dinh-duong':{position:{x:14,y:11,z:17},target:{x:0,y:3,z:0}},
 'co-the-nguoi-tuan-hoan':{position:{x:1,y:7,z:29},target:{x:0,y:5,z:0}},
 'trong-dong-dong-son':{position:{x:12,y:13,z:17},target:{x:0,y:3,z:0}},
 'van-mieu-quoc-tu-giam':{position:{x:27,y:30,z:36},target:{x:0,y:0,z:-1}},
 'nha-rong-tay-nguyen':{position:{x:18,y:16,z:25},target:{x:0,y:4,z:0}},
 'dia-dao-cu-chi':{position:{x:24,y:9,z:28},target:{x:0,y:-5,z:0}}
};
function overview(){if(!camera)return;if(tourActive&&!tourPaused)pauseTour();controls.autoRotate=false;$('rotate').setAttribute('aria-pressed','false');const p=presets[modelId];ModelRealism.fly(camera,controls,p.position,p.target);}
function selectFeature(id,focus=true,manual=true){
 if(!parts.has(id))return;if(manual&&tourActive&&!tourPaused)pauseTour();
 if(modelId==='thap-dinh-duong'&&mode==='meal'){mode='default';pyramidGroup.visible=true;plateGroup.visible=false;$('meal-mode')?.setAttribute('aria-pressed','false');}
 if(soilCover&&id!=='entry'){soilCover.visible=false;mode='cutaway';const b=$('cutaway-mode');if(b)b.setAttribute('aria-pressed','true');}
 selected=id;const feature=data.features.find(f=>f.id===id),part=parts.get(id);
 $('feature-title').textContent=feature.name;$('feature-text').textContent=feature.text;
 document.querySelectorAll('[data-feature]').forEach(b=>{const active=b.dataset.feature===id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 if(outline){scene.remove(outline);outline.geometry.dispose();outline.material.dispose();}outline=null;
 if(focus){const bbox=new THREE.Box3().setFromObject(part.group),centre=bbox.getCenter(new THREE.Vector3()),size=bbox.getSize(new THREE.Vector3());const distance=Math.max(7,Math.min(25,size.length()*.95));const direction=new THREE.Vector3(.85,.65,1.3).normalize().multiplyScalar(distance);ModelRealism.fly(camera,controls,centre.clone().add(direction),centre);}
}
function buildLabels(){
 for(const feature of data.features){const part=parts.get(feature.id);if(!part)throw new Error('Chưa dựng điểm '+feature.id);
  const button=document.createElement('button');button.type='button';button.dataset.feature=feature.id;button.textContent=feature.name;button.setAttribute('aria-pressed','false');button.onclick=()=>selectFeature(feature.id);$('places').appendChild(button);
  const marker=button.cloneNode(true);marker.onclick=()=>selectFeature(feature.id);$('labels').appendChild(marker);labels.push({id:feature.id,element:marker,part});
 }
}
function projectLabels(){if(!camera||!renderer)return;const w=$('scene').clientWidth,h=$('scene').clientHeight;
 for(const label of labels){let p;if(label.part.anchor)p=label.part.anchor.clone();else{const bbox=new THREE.Box3().setFromObject(label.part.group);p=bbox.getCenter(new THREE.Vector3());p.y=bbox.max.y+.6;}p.project(camera);const visible=labelsVisible&&p.z>=-1&&p.z<=1&&Math.abs(p.x)<1.1&&Math.abs(p.y)<1.05;label.element.hidden=!visible;if(visible){label.element.style.left=(p.x*.5+.5)*w+'px';label.element.style.top=(-p.y*.5+.5)*h+'px';}}
}
function audioStrike(kind='gong'){
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audio??=new Audio();void audio.resume();const frequencies=kind==='drum'?[80,127,183]:[140,217,338];frequencies.forEach((frequency,i)=>{const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.12/(i+1),audio.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+1.8);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+1.9);});}catch{$('plate-result').textContent='Trình duyệt chưa cho phép phát âm thanh.';}
}
function controlButton(id,text,callback,pressed){const b=document.createElement('button');b.type='button';b.id=id;b.textContent=text;if(pressed!==undefined)b.setAttribute('aria-pressed',String(pressed));b.onclick=callback;$('model-controls').appendChild(b);return b;}
function modelControls(){
 if(modelId==='thap-dinh-duong'){
  controlButton('meal-mode','Ghép bữa ăn',()=>{stopTour();mode=mode==='meal'?'default':'meal';pyramidGroup.visible=mode!=='meal';plateGroup.visible=mode==='meal';$('meal-mode').setAttribute('aria-pressed',String(mode==='meal'));const p=mode==='meal'?{position:{x:8,y:13,z:12},target:{x:0,y:1,z:1}}:presets[modelId];ModelRealism.fly(camera,controls,p.position,p.target);},false);
  for(const [id,name] of [['grain','Cơm'],['greens','Rau'],['protein','Cá'],['fruit','Quả'],['milk','Sữa'],['water','Nước']])controlButton('food-'+id,name,()=>{
   if(mode!=='meal')$('meal-mode').click();if(meal.has(id))return;meal.add(id);addFood(id);$('food-'+id).setAttribute('aria-pressed','true');const needed=['grain','greens','protein','fruit'];const names={grain:'lương thực',greens:'rau',protein:'thực phẩm giàu đạm',fruit:'quả'};const missing=needed.filter(x=>!meal.has(x));$('plate-result').textContent=missing.length?'Bổ sung để đa dạng: '+missing.map(x=>names[x]).join(', ')+'.':'Bữa ăn minh họa đã có lương thực, rau, đạm và quả. Lượng ăn cần phù hợp từng em.';
  },false);
  controlButton('meal-reset','Làm lại bữa ăn',()=>{meal.clear();plateGroup.children.filter(g=>g.userData.food).forEach(g=>{g.traverse(o=>{if(o.geometry)o.geometry.dispose();});plateGroup.remove(g);});document.querySelectorAll('[id^="food-"]').forEach(b=>b.setAttribute('aria-pressed','false'));$('plate-result').textContent='';});
 }
 if(modelId==='co-the-nguoi-tuan-hoan'){
  controlButton('pulse-toggle','Nhịp tim',()=>{pulse=!pulse;$('pulse-toggle').setAttribute('aria-pressed',String(pulse));},true);
  controlButton('heart-cutaway','Mặt cắt tim',()=>{heartShell.visible=!heartShell.visible;$('heart-cutaway').setAttribute('aria-pressed',String(!heartShell.visible));},false);
  const label=document.createElement('label');label.textContent='Nhịp minh họa: 60 lần/phút';const slider=document.createElement('input');slider.type='range';slider.min='50';slider.max='100';slider.value='60';slider.setAttribute('aria-label','Nhịp tim minh họa');slider.oninput=()=>{pulseSpeed=Number(slider.value);label.firstChild.textContent='Nhịp minh họa: '+pulseSpeed+' lần/phút';};label.appendChild(slider);$('model-controls').appendChild(label);
 }
 if(modelId==='trong-dong-dong-son')controlButton('strike','Gõ trống minh họa',()=>{audioStrike('drum');animated.push({type:'strike',start:elapsed});});
 if(modelId==='nha-rong-tay-nguyen')controlButton('strike','Nghe cồng minh họa',()=>{audioStrike('gong');selectFeature('gongs');});
 if(modelId==='dia-dao-cu-chi')controlButton('cutaway-mode','Mở mặt cắt',()=>{soilCover.visible=!soilCover.visible;mode=soilCover.visible?'covered':'cutaway';$('cutaway-mode').setAttribute('aria-pressed',String(!soilCover.visible));},true);
}
function tourUI(){for(const id of ['tour-pause','tour-next','tour-stop'])$(id).hidden=!tourActive;$('tour-start').disabled=tourActive;}
function scheduleTour(){tourDeadline=performance.now()+tourRemaining;tourTimer=setTimeout(nextTour,tourRemaining);}
function showTour(){const feature=data.features[tourIndex];selectFeature(feature.id,true,false);$('tour-status').textContent=(tourIndex+1)+' / '+data.features.length+' · '+feature.name;tourRemaining=Math.max(12000,feature.text.split(/\s+/).length/2.7*1000+1800);scheduleTour();}
function startTour(){stopTour();tourActive=true;tourIndex=0;controls.autoRotate=false;$('rotate').setAttribute('aria-pressed','false');$('tour-pause').textContent='Tạm dừng';tourUI();showTour();}
function pauseTour(){if(!tourActive||tourPaused)return;tourPaused=true;tourRemaining=Math.max(0,tourDeadline-performance.now());clearTimeout(tourTimer);$('tour-pause').textContent='Tiếp tục';$('tour-next').disabled=true;}
function nextTour(){if(!tourActive||tourPaused)return;clearTimeout(tourTimer);tourIndex++;if(tourIndex>=data.features.length){stopTour();overview();$('tour-status').textContent='Đã hoàn thành chuyến tham quan.';return;}showTour();}
function stopTour(){clearTimeout(tourTimer);tourActive=false;tourPaused=false;$('tour-next').disabled=false;$('tour-status').textContent='';tourUI();}
function showQuestion(){
 const q=data.quiz[quizIndex];quizAnswered=false;$('quiz-progress').textContent='Câu '+(quizIndex+1)+' / '+data.quiz.length;$('quiz-question').textContent=q.question;$('quiz-feedback').textContent='';$('quiz-options').replaceChildren();$('quiz-next').disabled=true;$('quiz-next').textContent=quizIndex===data.quiz.length-1?'Xem kết quả':'Câu tiếp';
 q.options.forEach((text,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String.fromCharCode(65+i)+'. '+text;b.onclick=()=>{if(quizAnswered)return;quizAnswered=true;if(i===q.answer)quizScore++;$('quiz-feedback').textContent=(i===q.answer?'Đúng. ':'Chưa đúng. ')+q.explanation;$('quiz-options').querySelectorAll('button').forEach((o,j)=>{o.disabled=true;if(j===q.answer)o.classList.add('active');});$('quiz-next').disabled=false;};$('quiz-options').appendChild(b);});
}
function installUI(){
 $('title').textContent=data.title;$('feature-text').textContent=data.intro;$('notice').textContent=data.notice;
 $('overview').onclick=overview;
 $('rotate').onclick=()=>{if(tourActive&&!tourPaused)pauseTour();controls.autoRotate=!controls.autoRotate;$('rotate').setAttribute('aria-pressed',String(controls.autoRotate));};
 $('labels-toggle').onclick=()=>{labelsVisible=!labelsVisible;$('labels-toggle').setAttribute('aria-pressed',String(labelsVisible));projectLabels();};
 $('zoom-in').onclick=()=>zoom(.78);$('zoom-out').onclick=()=>zoom(1.28);
 $('fullscreen').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{$('tour-status').textContent='Trình duyệt chưa cho phép toàn màn hình.';}};
 $('tour-start').onclick=startTour;$('tour-pause').onclick=()=>{if(!tourActive)return;if(tourPaused){tourPaused=false;$('tour-pause').textContent='Tạm dừng';$('tour-next').disabled=false;scheduleTour();}else pauseTour();};$('tour-next').onclick=nextTour;$('tour-stop').onclick=stopTour;
 $('quiz-open').onclick=()=>{if(tourActive&&!tourPaused)pauseTour();quizIndex=0;quizScore=0;showQuestion();$('quiz-dialog').showModal();};$('quiz-close').onclick=()=>$('quiz-dialog').close();
 $('quiz-next').onclick=()=>{if(!quizAnswered)return;quizIndex++;if(quizIndex>=data.quiz.length){$('quiz-question').textContent='Kết quả: '+quizScore+' / '+data.quiz.length+' câu đúng';$('quiz-progress').textContent='Đã hoàn thành';$('quiz-options').replaceChildren();$('quiz-feedback').textContent='Có thể quay lại mô hình để xem lại các điểm khám phá.';$('quiz-next').disabled=true;return;}showQuestion();};
 modelControls();
}
function zoom(factor){if(tourActive&&!tourPaused)pauseTour();const direction=camera.position.clone().sub(controls.target),distance=Math.max(controls.minDistance,Math.min(controls.maxDistance,direction.length()*factor));direction.setLength(distance);ModelRealism.fly(camera,controls,controls.target.clone().add(direction),controls.target);}
function resize(){if(!renderer)return;const w=$('scene').clientWidth,h=$('scene').clientHeight;if(w<1||h<1)return;camera.aspect=w/h;ModelRealism.resizeCamera(camera);renderer.setSize(w,h);projectLabels();}
function animate(now){
 frameId=requestAnimationFrame(animate);const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now;elapsed+=dt;
 const phase=elapsed*pulseSpeed/60*Math.PI*2,beat=pulse ? .5+.5*Math.sin(phase) : 0;
 for(const item of animated){
  if(item.type==='heart')item.group.scale.setScalar(1+beat*.025);
  if(item.type==='flow'&&pulse)item.dots.forEach((dot,i)=>dot.position.copy(item.curve.getPoint((elapsed*.12*pulseSpeed/60+i/item.dots.length)%1)));
  if(item.type==='fire'){item.mesh.scale.set(.9+Math.sin(elapsed*6)*.08,.9+Math.sin(elapsed*9)*.15,1);}
  if(item.type==='smoke'){const u=(elapsed*.12+item.phase)%1;item.mesh.position.set(Math.sin(u*4)*.3,u*2.3,0);item.mesh.material.opacity=(1-u)*.28;}
 }
 animated=animated.filter(item=>item.type!=='strike'||elapsed-item.start<.8);
 controls.update();if(outline)outline.update();renderer.render(scene,camera);projectLabels();
}
function dispose(){cancelAnimationFrame(frameId);clearTimeout(tourTimer);observer?.disconnect();controls?.dispose();audio?.close();const geometries=new Set(),materials=new Set(),textures=new Set();scene?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){materials.add(m);for(const key of ['map','bumpMap'])if(m[key])textures.add(m[key]);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());disposables.forEach(t=>t.dispose());renderer?.dispose();}
let observer;
async function init(){
 try{
  const response=await fetch('data/new-models.json');if(!response.ok)throw new Error('Không tải được nội dung');const all=await response.json();data=all[modelId];if(!data||!presets[modelId])throw new Error('Không có mô hình này');
  scene=new THREE.Scene();scene.background=new THREE.Color(modelId==='co-the-nguoi-tuan-hoan'?0x172834:0xc6dbe3);
  const weak=navigator.hardwareConcurrency<=4||matchMedia('(max-width:768px)').matches;
  renderer=new THREE.WebGLRenderer({antialias:!weak,alpha:false});ModelRealism.configure(renderer);renderer.shadowMap.enabled=!weak;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.localClippingEnabled=true;$('scene').appendChild(renderer.domElement);
  camera=new THREE.PerspectiveCamera(43,1,.1,500);camera.position.copy(new THREE.Vector3(...Object.values(presets[modelId].position)));controls=new THREE.OrbitControls(camera,renderer.domElement);controls.target.copy(new THREE.Vector3(...Object.values(presets[modelId].target)));controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=150;controls.maxPolarAngle=modelId==='dia-dao-cu-chi'?Math.PI*.66:Math.PI*.49;controls.autoRotateSpeed=.6;ModelRealism.cameraControls(camera,controls);controls.addEventListener('start',()=>{if(tourActive&&!tourPaused)pauseTour();});
  scene.add(new THREE.HemisphereLight(0xf0f5ff,0x655742,.65));const sun=new THREE.DirectionalLight(0xffedcf,1.2);sun.position.set(-18,30,25);sun.castShadow=!weak;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-32,right:32,top:32,bottom:-32,far:100});sun.shadow.bias=-.0002;scene.add(sun);root=new THREE.Group();scene.add(root);
  const builders={'thap-dinh-duong':nutrition,'co-the-nguoi-tuan-hoan':heart,'trong-dong-dong-son':drum,'van-mieu-quoc-tu-giam':temple,'nha-rong-tay-nguyen':rong,'dia-dao-cu-chi':tunnels};builders[modelId]();ModelRealism.naturalize(scene);buildLabels();installUI();resize();selectFeature(data.features[0].id,false,false);$('loading').hidden=true;
  observer=new ResizeObserver(resize);observer.observe($('stage'));
  const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();let pointerStart=null,multi=false;const pointers=new Set();
  renderer.domElement.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);if(pointers.size===1){pointerStart={x:e.clientX,y:e.clientY};multi=false;}else multi=true;});
  renderer.domElement.addEventListener('pointerup',e=>{if(!multi&&pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)<6){const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(hitMeshes,false);const hit=hits.find(h=>{let visible=true;for(let p=h.object;p;p=p.parent)visible&&=p.visible;return visible;});if(hit)selectFeature(hit.object.userData.featureId);}pointers.delete(e.pointerId);if(!pointers.size)pointerStart=null;});renderer.domElement.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);pointerStart=null;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&tourActive&&!tourPaused)pauseTour();});window.addEventListener('pagehide',dispose,{once:true});
  window.ModelWorkshop={select:id=>selectFeature(id),startTour,pauseTour,stopTour,nextTour,getState:()=>({id:modelId,selected,tourActive,tourPaused,tourIndex,meal:[...meal],pulse,pulseSpeed,mode,features:parts.size,steles:parts.get('steles')?.group.userData.steleCount,quizScore}),getScene:()=>scene,getCamera:()=>camera,getControls:()=>controls};
  frameId=requestAnimationFrame(animate);
 }catch(error){console.error(error);$('loading').textContent='Không dựng được mô hình. Hãy thử trình duyệt có WebGL hoặc bật tăng tốc đồ họa.';}
}
init();
})();
