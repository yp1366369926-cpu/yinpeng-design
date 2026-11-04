import * as THREE from 'three';
import {createPaperLayers} from './paper-layers.js';
import {scrollState,tunnelMotion,clamp01,ease} from './scroll-state.js';
import { createFluidEffect } from './fluid-effect.js';
import { createFluidPointer } from './fluid-pointer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const base = './assets/';
const quadVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const u = value => ({ value });
const color = hex => new THREE.Color(hex);

export async function createHeroScene(host, { onReady, onError, onProgress, reducedMotion }) {
  const fluidPointer=createFluidPointer();
  let fluid,papers;
  let disposed = false, raf, elapsed = 0, last = performance.now(), pulse = 0;
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40,1,.1,100);
  camera.position.set(0,0,22);
  const ortho = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const passScene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2)); passScene.add(quad);
  const pointer = new THREE.Vector2(.5,.5), smooth = new THREE.Vector2(.5,.5);
  const resolution = new THREE.Vector2(1,1);
  let width=1,height=1,mobile=false,dark=false, nextSticker=5;
  let loadedAssets=0;
  const track=promise=>promise.then(value=>{onProgress?.(Math.min(.94,++loadedAssets/30));return value;});
  const fetchText = name => track(fetch(base+name).then(r=>{if(!r.ok)throw Error('Asset unavailable: '+name);return r.text()}));
  const loader = new GLTFLoader();
  const loadModel=url=>track(loader.loadAsync(url));
  const resources = [];
  const targets = [0,1].map(()=>new THREE.WebGLRenderTarget(1,1,{depthBuffer:false}));
  const refraction = new THREE.WebGLRenderTarget(1,1,{depthBuffer:true});
  const fullTarget=new THREE.WebGLRenderTarget(1,1,{depthBuffer:true});
  const flareTarget=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false});
  const compositeTarget=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false});
  resources.push(...targets,refraction,fullTarget,flareTarget,compositeTarget);
  const noiseData = new Uint8Array(128*128*4);
  for(let i=0;i<noiseData.length;i+=4){const n=Math.random()*255;noiseData[i]=noiseData[i+1]=noiseData[i+2]=n;noiseData[i+3]=255;}
  const noise = new THREE.DataTexture(noiseData,128,128);noise.wrapS=noise.wrapT=THREE.RepeatWrapping;noise.needsUpdate=true;resources.push(noise);
  let passes=[],hello,contactModel,arrow,glassMaterials=[],stickers=[],flareMaterial,compositeMaterial;
  function resize(){
    width=host.clientWidth;height=host.clientHeight;mobile=width<1024;
    renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();
    resolution.set(Math.max(1,Math.floor(width*.3)),Math.max(1,Math.floor(height*.3)));
    targets.forEach(t=>t.setSize(resolution.x,resolution.y));
    refraction.setSize(Math.floor(width*renderer.getPixelRatio()*.5),Math.floor(height*renderer.getPixelRatio()*.5));
    fullTarget.setSize(Math.floor(width*renderer.getPixelRatio()),Math.floor(height*renderer.getPixelRatio()));
    compositeTarget.setSize(fullTarget.width,fullTarget.height);
    fluid?.resize(fullTarget.width,fullTarget.height);fluidPointer.reset();
    flareTarget.setSize(Math.floor(width*renderer.getPixelRatio()*.5),Math.floor(height*renderer.getPixelRatio()*.5));
    if(flareMaterial){flareMaterial.uniforms.uResolution.value.set(fullTarget.width,fullTarget.height);flareMaterial.uniforms.uStreakScale.value=8*width/1920*(mobile?2:1);}
    glassMaterials.forEach(m=>{m.uniforms.uScreenResolutionPx.value.set(width*renderer.getPixelRatio(),height*renderer.getPixelRatio());m.uniforms.uLoop.value=mobile?2:3;});
    stickers.forEach(s=>s.mesh.scale.copy(s.baseScale).multiplyScalar(mobile?.45:1));
    passes.forEach((pass,i)=>{if(pass.uniforms.uTrackMouse)pass.uniforms.uTrackMouse.value=+!mobile; if(pass.uniforms.uPos)pass.uniforms.uPos.value=mobile?new THREE.Vector2(.5,-.1):(i<3?smooth:new THREE.Vector2(.5,i===4?-.1:.5));});
    if(hello){const worldWidth=2*Math.tan(THREE.MathUtils.degToRad(20))*20*camera.aspect;hello.scale.setScalar(mobile?Math.min(19,worldWidth/.78):22);hello.position.set(-.1,0,2);}
    if(contactModel){const worldWidth=2*Math.tan(THREE.MathUtils.degToRad(20))*20*camera.aspect;contactModel.scale.setScalar(mobile?Math.min(19,worldWidth/.85):19);contactModel.position.z=mobile?2:0;}
    if(arrow){const worldWidth=2*Math.tan(THREE.MathUtils.degToRad(20))*25*camera.aspect;arrow.position.set(mobile?worldWidth*.36:11.6,mobile?-2.5:-4.2,-3);arrow.scale.setScalar(mobile?.05:.1);}
  }
  function material(shader, extra={}){
    const m=new THREE.ShaderMaterial({vertexShader:quadVertex,fragmentShader:shader,uniforms:{tInput:u(null),uResolution:u(resolution),uTime:u(0),uPos:u(smooth),uMousePos:u(smooth),uTrackMouse:u(1),...extra},depthTest:false,depthWrite:false,toneMapped:false,blending:THREE.NoBlending});resources.push(m);return m;
  }
  function merged(gltf){
    gltf.scene.updateMatrixWorld(true);const geometries=[];
    gltf.scene.traverse(o=>{if(o.isMesh){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);geometries.push(g);}});
    const geometry=mergeGeometries(geometries);geometry.center();geometry.computeBoundingBox();resources.push(geometry);return geometry;
  }
  function glass(geometry,vertexShader,fragmentShader,isArrow){
    const m=new THREE.ShaderMaterial({vertexShader,fragmentShader,toneMapped:false,transparent:true,uniforms:{
      uHeroOptics:u(0),uOpticsTime:u(0),uOpticsPointer:u(smooth),uTexture:u(refraction.texture),uIorR:u(1.15),uIorY:u(1.16),uIorG:u(1.18),uIorC:u(1.22),uIorB:u(1.22),uIorP:u(1.22),uRefractPower:u(.72),uChromaticAberration:u(.14),uSaturation:u(1.2),uShininess:u(120),uDiffuseness:u(.1),uFresnelPower:u(1),uBrightness:u(.78),uContrast:u(.9),uGamma:u(1),uSpecularStrength:u(1.2),uFresnelStrength:u(.24),uFresnelSideDir:u(new THREE.Vector3(-1,1,-1)),uTintColorA:u(new THREE.Vector4()),uTintColorB:u(new THREE.Vector4()),uTintLocalYRange:u(new THREE.Vector2(geometry.boundingBox.min.y,geometry.boundingBox.max.y)),uTintEnabled:u(1),uTintMix:u(1),uTintThicknessMinAlpha:u(1),uTintThicknessMaxAlpha:u(.92),uDark:u(0),uLoop:u(mobile?2:3),uSceneRefractionEnabled:u(1),uRgbRefraction:u(1),uLight:u(new THREE.Vector3(4,9,.5)),uScreenResolutionPx:u(new THREE.Vector2())
    }});m.userData.isArrow=isArrow;glassMaterials.push(m);resources.push(m);return m;
  }
  function setTheme(value){
    dark=value;
    if(flareMaterial)flareMaterial.uniforms.uTailColor.value.copy(color(dark?"#1600ff":"#ffa300"));
    if(passes.length){passes[0].uniforms.uClearColor.value.copy(color(dark?'#2c4bd5':'#ffead6'));passes[0].uniforms.uVignetteColor.value.copy(color(dark?'#00000d':'#6196ff'));passes[0].uniforms.uEdgeIntensity.value=dark?-.82:-.16;passes[5].uniforms.uBgColor.value.copy(color(dark?'#2c4bd5':'#ffead6'));passes[5].uniforms.uOutputColor.value.copy(color(dark?'#00344C':'#acffb9'));passes[5].uniforms.uOutputMix.value=dark?.95:.65;}
    glassMaterials.forEach(m=>{const v=m.uniforms;const a=color(m.userData.isContact?(dark?'#8e9dc4':'#ffffff'):(dark?'#64c3ff':'#009dff')),b=color(m.userData.isContact?(dark?'#64c3ff':'#009dff'):m.userData.isArrow?(dark?'#64c3ff':'#009dff'):(dark?'#8e9dc4':'#ffffff'));v.uTintColorA.value.set(a.r,a.g,a.b,1);v.uTintColorB.value.set(b.r,b.g,b.b,1);v.uDark.value=+dark;v.uBrightness.value=dark?.6:.78;v.uFresnelPower.value=dark?3:1;v.uFresnelStrength.value=dark?.72:.24;v.uShininess.value=dark?100:120;v.uTintThicknessMaxAlpha.value=dark?.4:.92;});
  }
  function spawn(count=7,initial=false){
    if(reducedMotion&&!initial)return;
    const viewH=2*Math.tan(THREE.MathUtils.degToRad(20))*28,viewW=viewH*camera.aspect;
    for(let i=0;i<count;i++){
      const texture=stickerTextures[Math.floor(Math.random()*stickerTextures.length)];
      if(!texture)continue;
      const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.8,2.8),m);
      const aspect=texture.image.width/texture.image.height;mesh.scale.set(aspect>1?aspect:1,aspect<1?1/aspect:1,1);
      mesh.position.set((Math.random()-.5)*viewW*.92,initial?(Math.random()-.5)*viewH:viewH*.65+Math.random()*4,-6);
      mesh.rotation.z=Math.random()*Math.PI*2;
      const baseScale=mesh.scale.clone();mesh.scale.multiplyScalar(mobile?.45:1);scene.add(mesh);stickers.push({mesh,baseScale,speed:1.1+Math.random()*1.4,spin:(Math.random()-.5)*1.5,phase:Math.random()*6.28});
    }
  }
  let stickerTextures=[],footerBurst=false;
  function move(e){const rect=host.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width,1-(e.clientY-rect.top)/rect.height);fluidPointer.move(pointer.x,pointer.y);}
  function leave(){pointer.set(.5,.5);fluidPointer.leave();}
  function click(e){if(e.target.closest('button,a,input'))return;pulse=1;spawn(9);}
  const observer=new ResizeObserver(resize);observer.observe(host);
  host.parentElement.addEventListener('pointermove',move);host.parentElement.addEventListener('pointerleave',leave);host.parentElement.addEventListener('pointerdown',click);
  const tunnelEl=document.querySelector('#purpose'),contactEl=document.querySelector('#contact');
  const root=host.parentElement;
  // Original 4 CSS-pixel dot lattice: radius grows with scroll, joining into paper.
  const flat=material(`
    uniform vec3 uColor;
    uniform float uAlpha;
    uniform vec2 uResolution;
    varying vec2 vUv;
    void main(){
      float a=clamp(uAlpha,0.,1.);
      if(a<=0.){gl_FragColor=vec4(uColor,0.);return;}
      if(a>=1.){gl_FragColor=vec4(uColor,1.);return;}
      vec2 cellUV=fract(vUv*max(uResolution,vec2(1.))/4.);
      float distanceFromCenter=distance(cellUV,vec2(.5));
      float aa=fwidth(distanceFromCenter)*1.5;
      float radius=.9*a;
      float mask=1.-smoothstep(radius-aa,radius,distanceFromCenter);
      gl_FragColor=vec4(uColor,mask);
    }`,{uColor:u(color('#faf9f6')),uAlpha:u(0),uResolution:u(new THREE.Vector2(1,1))});flat.transparent=true;flat.blending=THREE.NormalBlending;
  const whiteSheet=new THREE.Mesh(new THREE.PlaneGeometry(2,2),flat);whiteSheet.frustumCulled=false;whiteSheet.renderOrder=-90;scene.add(whiteSheet);resources.push(whiteSheet.geometry);
  let tunnelMat, tunnelMesh,arrowStripe;
  try{
    fluid=await createFluidEffect(renderer);
    const [vs,fs,...results]=await Promise.all([fetchText('glass.vert'),fetchText('glass.frag'),...Array.from({length:6},(_,i)=>fetchText(`background-${i}.frag`)),loadModel(base+'hello.gltf'),loadModel(base+'cursor.glb'),...Array.from({length:12},(_,i)=>track(new THREE.TextureLoader().loadAsync(base+`s_${String(i+1).padStart(2,'0')}.png`))),fetchText('flare.frag'),fetchText('composite.frag')]);
    if(disposed)return;
    const shaders=results.slice(0,6),helloGltf=results[6],arrowGltf=results[7];stickerTextures=results.slice(8,20);stickerTextures.forEach(t=>{t.colorSpace=THREE.SRGBColorSpace;resources.push(t);});
    passes=[
      material(shaders[0],{uRadius:u(.354),uFalloff:u(1),uMix:u(1),uDisplace:u(0),uSkew:u(.54),uAngle:u(0),uEdgeIntensity:u(-.16),uVignetteColor:u(color('#6196ff')),uClearColor:u(color('#ffead6'))}),
      material(shaders[1],{uRadius:u(.25),uAngle:u(.1),uPhase:u(0),uMix:u(.5),uPinch:u(0)}),
      material(shaders[2],{uMixRadius:u(1),uFrequency:u(.35),uAmplitude:u(1.18),uRotation:u(0)}),
      material(shaders[3],{uAmount:u(1),uSpread:u(.9),uAngle:u(-45/360),uSkew:u(.9),uCellScale:u(16),uMixRadius:u(1),uMixRadiusInvert:u(0),uEasing:u(1),uTrackMouse:u(0),uPos:u(new THREE.Vector2(.5,.5)),uRoundness:u(.02)}),
      material(shaders[4],{tBlueNoise:u(noise),uBlueNoiseResolution:u(new THREE.Vector2(128,128)),uAmount:u(3.125*.754),uTilt:u(.5),uPos:u(new THREE.Vector2(.5,.5)),uTrackMouse:u(0)}),
      material(shaders[5],{uBgColor:u(color('#ffead6')),uOutputColor:u(color('#acffb9')),uLoaded:u(1),uOutputMix:u(.65)})
    ];
    const background=new THREE.Mesh(new THREE.PlaneGeometry(2,2),passes[5]);background.frustumCulled=false;background.renderOrder=-100;scene.add(background);resources.push(background.geometry);
    const hg=merged(helloGltf);hello=new THREE.Mesh(hg,glass(hg,vs,fs,false));scene.add(hello);
    const ag=merged(arrowGltf);arrow=new THREE.Mesh(ag,glass(ag,vs,fs,true));arrow.renderOrder=12;scene.add(arrow);
    flareMaterial=material(results[20].replace(/#include\s+<colorspace_fragment>/g,''),{tDiffuse:u(fullTarget.texture),uResolution:u(new THREE.Vector2()),uEnabled:u(1),uIntensity:u(.7),uThreshold:u(.99),uStreakScale:u(8),uHotspotPower:u(32),uGate:u(.88),uStarRays:u(6),uTailColor:u(color("#ffa300"))});
    compositeMaterial=material(results[21],{tBase:u(fullTarget.texture),tFlare:u(flareTarget.texture)});
    const [footerGltf,tunnelShader]=await Promise.all([loadModel(base+'model/cnt.gltf'),fetchText('tunnel.frag')]);
    const cg=merged(footerGltf);contactModel=new THREE.Mesh(cg,glass(cg,vs,fs,false));contactModel.material.userData.isContact=true;contactModel.position.z=2;scene.add(contactModel);
    tunnelMat=material(tunnelShader,{iResolution:u(new THREE.Vector3()),iTime:u(0),uScrollDuration:u(2),uStripeColorA:u(color('#009dff')),uStripeColorB:u(color('#64c3ff')),uOpacity:u(0),uStageOpacity:u(0)});tunnelMat.transparent=true;tunnelMat.blending=THREE.NormalBlending;
    tunnelMesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),tunnelMat);tunnelMesh.frustumCulled=false;tunnelMesh.renderOrder=-80;scene.add(tunnelMesh);resources.push(tunnelMesh.geometry);
    const [arrowVs,arrowFs]=await Promise.all([fetchText('arrow-transition.vert'),fetchText('arrow-transition.frag')]);
    arrowStripe=new THREE.ShaderMaterial({vertexShader:arrowVs,fragmentShader:arrowFs,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,uniforms:{iResolution:u(new THREE.Vector3()),iTime:u(0),uScrollDuration:u(2),uAccentColor:u(color('#009dff')),uStripeColorA:u(color('#009dff')),uStripeColorB:u(color('#64c3ff')),uStripeReveal:u(0),uOpacity:u(1),uLight:u(new THREE.Vector3(4,9,.5)),uShininess:u(120),uDiffuseness:u(.1),uSpecularStrength:u(.3),uFresnelPower:u(1),uFresnelStrength:u(.24),uFresnelSideDir:u(new THREE.Vector3(-1,1,-1))}});resources.push(arrowStripe);
    papers=await createPaperLayers(scene,{reducedMotion});
    setTheme(false);resize();spawn(8,true);
    const started=performance.now();
    let arrowScale=.1;
    arrow.geometry.computeBoundingSphere();const arrowRadius=Math.max(arrow.geometry.boundingSphere.radius,.0001);
    const ringEllipses=Array.from(document.querySelectorAll('.tunnel-rings ellipse'));
    function frame(now){
      if(disposed)return;
      const dt=Math.min((now-last)/1000,.04);last=now;elapsed+=dt;
      smooth.lerp(pointer,1-Math.exp(-dt*5));pulse=Math.max(0,pulse-dt*.7);
      const entry=reducedMotion?1:Math.min(1,(now-started)/1500),entryEase=1-Math.pow(1-entry,3);
      const tunnelTop=tunnelEl.offsetTop,contactTop=contactEl.offsetTop;
      const state=scrollState(scrollY,height,tunnelTop,tunnelEl.offsetHeight,contactTop);
      flat.uniforms.uColor.value.copy(color(dark?'#181817':'#faf9f6'));flat.uniforms.uAlpha.value=1-state.glass;
      flat.uniforms.uResolution.value.set(width,height);
      // Mask departing glass as well as its background; keep the middle arrow above paper.
      whiteSheet.renderOrder=state.heroExit<1||state.contact>0?10:-90;
      const chapter=(scrollY-tunnelTop)/height;
      const stage=chapter<2?'primary':chapter<4?'human':chapter<6?'values':'future';
      root.dataset.tunnelStage=stage;
      const reveal=chapter>=-.2&&chapter<8;
      ['primary','human','values','future'].forEach(name=>root.style.setProperty(`--${name}-opacity`,name===stage&&reveal?1:0));
      root.style.setProperty('--tunnel-progress',state.travel);
      root.classList.toggle('at-contact',state.contact>.8);
      tunnelMesh.visible=false;
      const ringProgress=clamp01((chapter-4)/2),distance=ringProgress*945;
      const ringPhase=distance<=300?0:distance<=600?1:2;
      const ringOffset=distance-ringPhase*300,seen=[];
      ringEllipses.forEach((el,i)=>{
        const bucket=Math.min(6,Math.floor(ringOffset/50));
        const l=ringPhase===0?ringOffset-(bucket-i)*50:ringPhase===1?(ringOffset+50*i)%300:ringOffset+50*i;
        const visible=(ringPhase!==0||ringOffset>=i*50)&&l>0&&l<300&&!seen.some(v=>Math.abs(v-l)<.5);
        const radius=visible?Math.sqrt(Math.max(0,22500-(l-150)**2)):0;
        if(visible)seen.push(l);
        el.style.visibility=visible?'visible':'hidden';el.setAttribute('cy',22+l);el.setAttribute('rx',radius);el.setAttribute('ry',radius*.1);
      });
      root.style.setProperty('--hero-text-shift',`${-state.heroExit*height*.16}px`);
      const px=mobile?0:(smooth.x-.5)*1.4,py=mobile?0:(smooth.y-.5)*1.4;
      camera.position.x=px;camera.position.y=py;camera.lookAt(0,0,0);
      hello.rotation.set(0,THREE.MathUtils.degToRad(240)*(1-entryEase)+state.heroExit*Math.PI/2,THREE.MathUtils.degToRad(4));
      hello.position.y=reducedMotion||mobile?0:Math.sin(elapsed*1.2)*.18+Math.sin(elapsed*.6)*.06;
      hello.position.y+=(scrollY/height)*16*.72;hello.visible=state.heroExit<1;
      contactModel.visible=state.contact>0;contactModel.rotation.x=reducedMotion?0:-(1-ease(state.contact))*Math.PI;contactModel.position.y=-(1-state.contact)*16*.72;
      arrow.rotation.set(pulse*.25,pulse*Math.PI*2+state.heroExit*Math.PI*4,Math.sin(elapsed*.65)*.04);
      if(state.heroExit>.9){
        const top=tunnelTop-scrollY,bottom=top+tunnelEl.offsetHeight,center=height*.5,margin=120;
        const worldH=2*Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*camera.position.z,worldW=worldH*camera.aspect;
        const smoothstep=x=>{x=clamp01(x);return x*x*(3-2*x);};
        const expand=smoothstep((center-top-margin)/height);
        const shrinkStart=center+margin-tunnelEl.offsetHeight,shrinkEnd=Math.min(height,shrinkStart+height);
        const shrink=1-smoothstep((top-shrinkStart)/(shrinkEnd-shrinkStart));
        const peak=Math.hypot(worldW,worldH)*1.64/arrowRadius;
        const goal=THREE.MathUtils.lerp(THREE.MathUtils.lerp(.1,peak,expand),.1,shrink);
        arrowScale=reducedMotion?goal:THREE.MathUtils.damp(arrowScale,goal,32,dt);
        const fraction=clamp01((arrowScale-.1)/(peak-.1));
        const y=shrink===0?Math.max(center,top+margin):shrink===1?Math.min(center,bottom-margin):center;
        arrow.position.set(0,(.5-y/height)*worldH,0);arrow.scale.setScalar(arrowScale);
        arrow.rotation.set(0,shrink>0?Math.PI+clamp01((shrink-.6)/.4)*Math.PI:clamp01(fraction/.4)*Math.PI,Math.PI/4);
        arrow.material=arrowStripe;
        arrowStripe.uniforms.iResolution.value.set(fullTarget.width,fullTarget.height,1);
        arrowStripe.uniforms.iTime.value=2*clamp01((height-top)/(height+tunnelEl.offsetHeight));
        arrowStripe.uniforms.uStripeReveal.value=fraction;
        arrow.visible=top<height+480&&bottom>-240;
        root.classList.toggle('in-tunnel',fraction>.88);
      }else{
        root.classList.remove('in-tunnel');arrow.material=glassMaterials[1];
        const worldW=2*Math.tan(THREE.MathUtils.degToRad(20))*25*camera.aspect;
        arrow.position.set(mobile?worldW*.36:11.6,(mobile?-2.5:-4.2)+(scrollY/height)*16*.72,-3);arrow.scale.setScalar(mobile?.05:.1);arrow.visible=state.heroExit<1;
      }
      papers.update(dt,width,height);flareMaterial.uniforms.uIntensity.value=.7*state.glass;
      const lightAngle=Math.atan2(-(smooth.y-.5),-(smooth.x-.5));
      glassMaterials.forEach(m=>{m.uniforms.uHeroOptics.value=m.userData.isContact?ease(state.contact):1-state.heroExit;m.uniforms.uOpticsTime.value=reducedMotion?0:elapsed;m.uniforms.uLight.value.set(pointer.distanceTo(new THREE.Vector2(.5,.5))<.03?4:Math.cos(lightAngle)*9.85,pointer.distanceTo(new THREE.Vector2(.5,.5))<.03?9:Math.sin(lightAngle)*9.85,.5);});
      if(!reducedMotion && elapsed>nextSticker){nextSticker=elapsed+4; if(stickers.length<7)spawn(1);}
      if(state.contact>.55&&!footerBurst){footerBurst=true;spawn(12,true);}if(state.contact===0)footerBurst=false;
      stickers.forEach(s=>s.mesh.visible=state.glass>.2);
      stickers=stickers.filter(s=>{if(!reducedMotion){s.mesh.position.y-=dt*s.speed;s.mesh.position.x+=Math.sin(elapsed*.6+s.phase)*dt*.5;s.mesh.rotation.z+=dt*s.spin;}if(s.mesh.position.y< -18){scene.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();return false;}return true;});
      for(let i=0;i<5;i++){const pass=passes[i];pass.uniforms.uTime.value=reducedMotion?0:elapsed;pass.uniforms.tInput.value=i?targets[(i-1)%2].texture:null;quad.material=pass;renderer.setRenderTarget(targets[i%2]);renderer.render(passScene,ortho);}
      passes[5].uniforms.tInput.value=targets[0].texture;
      const visibility=[hello.visible,arrow.visible,contactModel.visible];hello.visible=arrow.visible=contactModel.visible=false;renderer.setRenderTarget(refraction);renderer.render(scene,camera);[hello.visible,arrow.visible,contactModel.visible]=visibility;
      renderer.setRenderTarget(fullTarget);renderer.render(scene,camera);
      quad.material=flareMaterial;renderer.setRenderTarget(flareTarget);renderer.render(passScene,ortho);
      quad.material=compositeMaterial;renderer.setRenderTarget(compositeTarget);renderer.render(passScene,ortho);
      fluid.render(compositeTarget,{...fluidPointer.sample(now,{width,height,dpr:renderer.getPixelRatio(),mobile,reducedMotion}),heroOptics:Math.max(1-state.heroExit,ease(state.contact))});
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);onProgress?.(1);onReady();
  }catch(error){onError(error);}
  return {setTheme,burst:()=>{pulse=1;spawn(9);},dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();host.parentElement.removeEventListener('pointermove',move);host.parentElement.removeEventListener('pointerleave',leave);host.parentElement.removeEventListener('pointerdown',click);stickers.forEach(s=>{s.mesh.geometry.dispose();s.mesh.material.dispose();});papers?.dispose();fluid?.dispose();resources.forEach(r=>r.dispose());quad.geometry.dispose();renderer.dispose();renderer.domElement.remove();}};
}
