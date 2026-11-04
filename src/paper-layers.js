import * as THREE from 'three';
import {ease} from './scroll-state.js';

export async function createPaperLayers(scene,{reducedMotion}){
 const [vertexShader,fragmentShader]=await Promise.all(['vert','frag'].map(ext=>fetch('./assets/paper.'+ext).then(r=>r.text())));
 const geometry=new THREE.PlaneGeometry(2,2),loader=new THREE.TextureLoader(),layers=[];
 await Promise.all(Array.from(document.querySelectorAll('.paper-target')).map(async el=>{
  const [map,mapHover]=await Promise.all([loader.loadAsync(el.dataset.image),loader.loadAsync(el.dataset.hover||el.dataset.image)]);
  for(const tex of [map,mapHover]){tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;if(el.dataset.hover){tex.generateMipmaps=false;tex.minFilter=THREE.LinearFilter;}tex.magFilter=THREE.LinearFilter;}
  const uniform=value=>({value});
  const mat=new THREE.ShaderMaterial({vertexShader,fragmentShader,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{map:uniform(map),mapHover:uniform(mapHover),uRect:uniform(new THREE.Vector4()),uCurlStrength:uniform(0),uPolarityPositive:uniform(0),uLayerOpacity:uniform(1),uRevealProgress:uniform(1),uRevealSoftness:uniform(0),uRevealDirection:uniform(1),uHoverRevealProgress:uniform(0),uDotPixelSize:uniform(18),uViewportPx:uniform(new THREE.Vector2(1,1))}});
  const mesh=new THREE.Mesh(geometry,mat);mesh.frustumCulled=false;mesh.renderOrder=20;scene.add(mesh);
  const layer={el,map,mapHover,mat,mesh,reveal:0,hover:0,target:0};layers.push(layer);
  const link=el.closest('button,a')||el;const enter=()=>layer.target=1,leave=()=>layer.target=0;
  link.addEventListener('pointerenter',enter);link.addEventListener('pointerleave',leave);link.addEventListener('focus',enter);link.addEventListener('blur',leave);
  layer.cleanup=()=>{link.removeEventListener('pointerenter',enter);link.removeEventListener('pointerleave',leave);link.removeEventListener('focus',enter);link.removeEventListener('blur',leave);};
 }));
 let previousY=scrollY,curl=0;
 return {update(dt,width,height){
  const velocity=Math.abs(scrollY-previousY)/Math.max(dt,.001);previousY=scrollY;
  const goal=reducedMotion?0:Math.min(1,velocity/800)*.06;curl+=(goal-curl)*(1-Math.exp(-dt/(goal>curl?.025:.175)));
  for(const l of layers){const r=l.el.getBoundingClientRect();l.mesh.visible=r.bottom>-height*.25&&r.top<height*1.25;if(!l.mesh.visible){l.reveal=0;continue;}
   if(r.bottom>0&&r.top<height)l.reveal=Math.min(1,l.reveal+dt/.8);else l.reveal=0;
   l.hover+=Math.sign(l.target-l.hover)*Math.min(Math.abs(l.target-l.hover),dt/.42);
   const u=l.mat.uniforms;u.uRect.value.set(r.left/width,1-(r.top+r.height)/height,r.width/width,r.height/height);u.uViewportPx.value.set(width,height);u.uCurlStrength.value=curl;u.uPolarityPositive.value=reducedMotion?1:ease(l.reveal);u.uHoverRevealProgress.value=reducedMotion?l.target:.5-.5*Math.cos(Math.PI*l.hover);
  }
 },dispose(){for(const l of layers){l.cleanup();scene.remove(l.mesh);l.mat.dispose();l.map.dispose();l.mapHover.dispose();}geometry.dispose();}};
}
