precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform vec3 uBgColor;
uniform vec3 uOutputColor;
uniform int uLoaded;
// 可调输出混合权重（0.0~1.0），用于替代固定 0.6
uniform float uOutputMix;
// 方案A：更接近 before.js 的合成逻辑 (base * mix(1, blend, 0.26))

vec3 overlay(vec3 base, vec3 blend){
  return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
}

void main(){
  if(uLoaded!=1){
    gl_FragColor = vec4(197./255.,136./255.,122./255.,1.);
    return;
  }

  // uBgColor/uOutputColor are provided in Three.js working space (linear).
  vec3 bgTex = vec3(1.0); // 无背景贴图时近似常量
  vec3 base = mix(uBgColor, overlay(uBgColor, bgTex), 0.61);

  vec4 inTex = texture2D(tInput, vUv);
  // 作为 tint 加色，不依赖 alpha，保证 OUTPUT_COLOR 可见
  vec3 tint = uOutputColor * 0.35;
  vec3 blend = clamp(inTex.rgb + tint, 0.0, 1.0);
  vec3 finalColor = base * mix(vec3(1.0), blend, clamp(uOutputMix, 0.0, 1.0));

  gl_FragColor = vec4(finalColor, 1.0);

  #include <colorspace_fragment>
}