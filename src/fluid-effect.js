import * as THREE from 'three';

const vertexShader = `varying vec2 vUv;void main(){vUv=position.xy*.5+.5;gl_Position=vec4(position.xy,0.,1.);}`;
const u = value => ({ value });

// GPU velocity field: curl -> pointer force -> divergence -> pressure solve
// -> pressure gradient -> advection -> spectral screen displacement.
export async function createFluidEffect(renderer) {
  const names = ['curlMaterial','vorticityMaterial','divergenceMaterial','clearMaterial','pressureMaterial','gradientMaterial','advectMaterial','displayMaterial'];
  const shaders = await Promise.all(names.map(async name => {
    const response = await fetch(`./assets/fluid/${name}.frag?v=melt-1`);
    if (!response.ok) throw Error(`Fluid shader unavailable: ${name}`);
    return response.text();
  }));
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2));quad.frustumCulled=false;scene.add(quad);
  const texel = new THREE.Vector2(1,1), resolution = new THREE.Vector2(1,1);
  const pointer = new THREE.Vector2(-1,-1), delta = new THREE.Vector2();
  const targets = Array.from({length:8},()=>new THREE.WebGLRenderTarget(1,1,{
    type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,
    depthBuffer:false,stencilBuffer:false
  }));
  let [velocityRead,velocityWrite,curl,vorticity,divergence,pressureA,pressureB,projected] = targets;
  const settings = [
    {uVelocity:u(null),uTexelSize:u(texel)},
    {uVelocity:u(null),uCurl:u(null),uTexelSize:u(texel),uResolution:u(resolution),uPointer:u(pointer),uPointerDelta:u(delta),uCurlStrength:u(0),uSplatRadius:u(.003),uSplatForce:u(3000)},
    {uVelocity:u(null),uTexelSize:u(texel)},
    {},
    {uPressure:u(null),uDivergence:u(null),uTexelSize:u(texel)},
    {uVelocity:u(null),uPressure:u(null),uTexelSize:u(texel)},
    {uVelocity:u(null),uProjectedVelocity:u(null),uTexelSize:u(texel),uDissipation:u(3)},
    {uHeroOptics:u(0),tDiffuse:u(null),uVelocity:u(null),uSimSize:u(new THREE.Vector2(160,160)),uDisplacementStrength:u(1),uChromaticBoost:u(.5),uEffectEnabled:u(1)}
  ];
  const materials=shaders.map((fragmentShader,i)=>new THREE.ShaderMaterial({
    vertexShader,fragmentShader,uniforms:settings[i],depthTest:false,depthWrite:false,blending:THREE.NoBlending,toneMapped:false
  }));
  const [curlPass,forcePass,divergencePass,clearPass,pressurePass,gradientPass,advectPass,displayPass]=materials;
  function draw(material,target){quad.material=material;renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,camera);}
  return {
    resize(width,height){
      resolution.set(width,height);
      const aspect=width/height;
      const w=aspect>1?Math.round(160*aspect):160;
      const h=aspect>1?160:Math.round(160/aspect);
      texel.set(1/w,1/h);displayPass.uniforms.uSimSize.value.set(w,h);
      const previous=renderer.getRenderTarget();
      for(const target of targets){target.setSize(w,h);draw(clearPass,target);}
      renderer.setRenderTarget(previous);
    },
    render(input,sample){
      pointer.set(...sample.position);delta.set(...sample.delta);
      if(sample.enabled){
        forcePass.uniforms.uCurlStrength.value=12*(sample.heroOptics??0);
        curlPass.uniforms.uVelocity.value=velocityRead.texture;draw(curlPass,curl);
        forcePass.uniforms.uVelocity.value=velocityRead.texture;forcePass.uniforms.uCurl.value=curl.texture;draw(forcePass,vorticity);
        divergencePass.uniforms.uVelocity.value=vorticity.texture;draw(divergencePass,divergence);
        draw(clearPass,pressureA);
        let read=pressureA,write=pressureB;
        pressurePass.uniforms.uDivergence.value=divergence.texture;
        for(let i=0;i<4;i++){pressurePass.uniforms.uPressure.value=read.texture;draw(pressurePass,write);[read,write]=[write,read];}
        gradientPass.uniforms.uVelocity.value=vorticity.texture;gradientPass.uniforms.uPressure.value=read.texture;draw(gradientPass,projected);
        advectPass.uniforms.uVelocity.value=velocityRead.texture;advectPass.uniforms.uProjectedVelocity.value=projected.texture;draw(advectPass,velocityWrite);
        [velocityRead,velocityWrite]=[velocityWrite,velocityRead];
      }
      displayPass.uniforms.uHeroOptics.value=sample.heroOptics??0;
      displayPass.uniforms.tDiffuse.value=input.texture;
      displayPass.uniforms.uVelocity.value=velocityRead.texture;
      displayPass.uniforms.uEffectEnabled.value=sample.fade;
      draw(displayPass,null);
    },
    dispose(){targets.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());quad.geometry.dispose();}
  };
}
