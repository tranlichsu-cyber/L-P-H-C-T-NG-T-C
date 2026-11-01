// Run against the local Vite server. Playwright may be installed outside the checkout.
const {chromium}=require(process.env.MODEL_BROWSER_TOOLS || 'playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
for(const id of ['qua-dia-cau','dia-hinh-viet-nam','de-song-hong','bach-dang-938','vong-tuan-hoan-nuoc','chuoi-thuc-an','den-hung']){
 const p=await b.newPage({viewport:{width:1366,height:900}}),errors=[],external=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>{if(new URL(r.request().url()).hostname!=='127.0.0.1'){external.push(r.request().url());return r.abort();}return r.continue()});
 await p.goto(`${process.env.MODEL_BASE_URL || 'http://127.0.0.1:5173'}/models/${id}-3d.html`);await p.waitForTimeout(1000);await p.evaluate(()=>{try{renderer.shadowMap.enabled=false;renderer.setPixelRatio(1)}catch{}});
 if(id==='qua-dia-cau'){
  await p.waitForFunction(()=>earthMesh?.material.map?.image instanceof HTMLImageElement&&earthMesh.material.map.image.complete);
  const dot=await p.evaluate(()=>{focusVietnam();const v=latLonToVector3(16,106,12).applyAxisAngle(new THREE.Vector3(0,1,0),earthMesh.rotation.y).applyAxisAngle(new THREE.Vector3(0,0,1),globeGroup.rotation.z);return v.normalize().dot(camera.position.clone().normalize())});assert(dot>.9);
  await p.locator('#btn-toggle-grid').click();await p.locator('#btn-toggle-spin').click();
 }else if(id==='dia-hinh-viet-nam'){
  await p.waitForFunction(()=>terrainMesh?.geometry?.attributes.position.count>1000);const high=await p.evaluate(()=>terrainMesh.scale.y);await p.locator('#btn-toggle-relief').click();assert((await p.evaluate(()=>terrainMesh.scale.y))<high);await p.locator('.region-btn').last().click();await p.locator('#btnResetCam').click();
 }else if(id==='bach-dang-938'){
  assert.equal(await p.evaluate(()=>fleetHan.visible),false);await p.locator('.stage-btn').nth(1).click();await p.waitForFunction(()=>fleetHan.children[0].position.y>3,{},{timeout:25000});assert.equal(await p.evaluate(()=>isHighTide),true);await p.locator('.stage-btn').nth(2).click();await p.waitForFunction(()=>Math.abs(fleetHan.children[0].rotation.z)>.2);assert.equal(await p.evaluate(()=>isHighTide),false);
 }else if(id==='de-song-hong'){
  await p.locator('#btn-toggle-flood').click();await p.waitForFunction(()=>Math.abs(riverMesh.position.y-waterLevel)<.2,{},{timeout:25000});let delta=await p.evaluate(()=>riverBoat.position.y-riverMesh.position.y);assert(delta>.1&&delta<.5);await p.locator('#btn-toggle-flood').click();await p.waitForFunction(()=>riverBoat.position.y>4,{},{timeout:25000});
 }else if(id==='vong-tuan-hoan-nuoc'){
  assert(await p.evaluate(()=>rainParticles.isLineSegments&&rainParticles.geometry.attributes.position.count===1400));await p.locator('#btn-rain').count().then(async n=>{if(n)await p.locator('#btn-rain').click()});assert(await p.evaluate(()=>[...rainParticles.geometry.attributes.position.array].every(Number.isFinite)));
 }else if(id==='chuoi-thuc-an'){
  assert.equal(await p.evaluate(()=>energyCurves.length),4);const y=await p.evaluate(()=>nodeMeshes.map(m=>m.position.y));await p.waitForTimeout(300);assert.deepEqual(await p.evaluate(()=>nodeMeshes.map(m=>m.position.y)),y);assert(await p.evaluate(()=>nodeMeshes[1].children.length>15));await p.locator('#cam-frog').click();
 }else{await p.locator('#placeList button').filter({hasText:'Đền Giếng'}).click();assert.equal(await p.locator('#infoTitle').textContent(),'Đền Giếng');assert.equal(await p.locator('#annotToggleBtn,#hint').count(),0);}
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(250);const box=await p.locator('#canvas-container canvas,#scene canvas').first().boundingBox();assert(box&&box.width>300&&box.height>300,id+' mobile canvas');assert.deepEqual(errors,[],id);assert.deepEqual(external,[],id+' must work without external assets');console.log('PASS '+id+' offline render and functional checks');await p.close();
}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
