uniform float uHeroOptics;
uniform float uGlassOpacity;
uniform float uOpticsTime;
uniform vec2 uOpticsPointer;
uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;

uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uFresnelPower;
uniform float uShininess;
uniform float uDiffuseness;
uniform vec3 uLight;
// New tone controls
uniform float uBrightness;      // scales base refracted color
uniform float uContrast;        // adjusts contrast around 0.5
uniform float uGamma;           // gamma correction (1.0 = neutral)
uniform float uSpecularStrength;// scales specular contribution
uniform float uFresnelStrength; // scales fresnel contribution
uniform vec3 uFresnelSideDir;   // fresnel side direction (world space)

// Tint controls for colored glass effect
uniform vec4 uTintColorA;      // gradient color A (rgb) + alpha
uniform vec4 uTintColorB;      // gradient color B (rgb) + alpha
uniform vec2 uTintLocalYRange; // model local y min/max for vertical gradient normalization
uniform float uTintEnabled;   // 0.0 = off, 1.0 = on
uniform float uTintMix;       // blend amount [0,1]
uniform float uTintThicknessMinAlpha; // min alpha at grazing angles [0,1]
uniform float uTintThicknessMaxAlpha; // max alpha at facing angles [0,1]

uniform vec2 uScreenResolutionPx;
uniform sampler2D uTexture;
// 1.0：多采样折射；0.0：单次采样（FBO skip 时省算力，遮罩全屏时几乎不可见）
uniform float uSceneRefractionEnabled;
// 1.0：每 loop 三次 texture2D（RGB）；0.0：六通道光谱路径
uniform float uRgbRefraction;

// 0.0 = Beer-Lambert transmission, 1.0 = Hard Light duotone mix
uniform float uDark;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying float modelLocalY;

float random(vec2 p){
  return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

float fresnel(vec3 eyeDir, vec3 normal, float power) {
  float fresnelFactor = abs(dot(eyeDir, normal));
  float inversefresnelFactor = 1.0 - fresnelFactor;
  return pow(inversefresnelFactor, power);
}

float specular(vec3 light, vec3 normal, vec3 eyeDir, float shininess, float diffuseness) {
  vec3 lightVector = normalize(-light);
  vec3 halfVector = normalize(eyeDir + lightVector);

  float NdotL = dot(normal, lightVector);
  float NdotH = abs(dot(normal, halfVector));
  float kDiffuse = max(0.0, NdotL);

  float kSpecular = pow(NdotH, shininess);
  // 可选：使用 smoothstep 进一步柔化高光边缘
  // kSpecular = smoothstep(0.0, 1.0, kSpecular);
  return kSpecular + kDiffuse * diffuseness;
}

uniform int uLoop;

void main() {
  vec2 uv = gl_FragCoord.xy / uScreenResolutionPx.xy;
  // 确保法线归一化，这对平滑高光至关重要
  vec3 normal = normalize(worldNormal);
  vec3 eyeDir = normalize(eyeVector);
  // Optical surface motion only: preserve the model silhouette and placement.
  vec2 aspect = vec2(uScreenResolutionPx.x / uScreenResolutionPx.y, 1.0);
  vec2 toPointer = (uv - uOpticsPointer) * aspect;
  float proximity = exp(-dot(toPointer, toPointer) * 13.0);
  vec2 flow = vec2(sin(uv.y * 19.0 + uOpticsTime * .8),
                   cos(uv.x * 16.0 - uOpticsTime * .65));
  normal = normalize(normal + vec3(flow * .014 * proximity * uHeroOptics, 0.0));
  vec3 color;

  if (uSceneRefractionEnabled > 0.5) {
    color = vec3(0.0);

    float noiseIntensity = mix(0.025, 0.004, uHeroOptics);
    float noise = random(uv) * noiseIntensity;

    if (uRgbRefraction > 0.5) {
      vec3 refractVecR = refract(eyeDir, normal, (1.0 / uIorR));
      vec3 refractVecG = refract(eyeDir, normal, (1.0 / uIorG));
      vec3 refractVecB = refract(eyeDir, normal, (1.0 / uIorB));

      for (int i = 0; i < uLoop; i++) {
        float slide = float(i) / float(uLoop) * 0.1 + noise;
        float facing = abs(dot(normal, eyeDir));
        float offset = (uRefractPower + slide) * uChromaticAberration * mix(1.0, .85 + .45 * (1.0-facing), uHeroOptics);

        color.r += texture2D(uTexture, uv + refractVecR.xy * offset).r;
        color.g += texture2D(uTexture, uv + refractVecG.xy * offset).g;
        color.b += texture2D(uTexture, uv + refractVecB.xy * offset).b;
      }
    } else {
      vec3 refractVecR = refract(eyeDir, normal, (1.0 / uIorR));
      vec3 refractVecY = refract(eyeDir, normal, (1.0 / uIorY));
      vec3 refractVecG = refract(eyeDir, normal, (1.0 / uIorG));
      vec3 refractVecC = refract(eyeDir, normal, (1.0 / uIorC));
      vec3 refractVecB = refract(eyeDir, normal, (1.0 / uIorB));
      vec3 refractVecP = refract(eyeDir, normal, (1.0 / uIorP));

      for (int i = 0; i < uLoop; i++) {
        float slide = float(i) / float(uLoop) * 0.1 + noise;

        float offsetR = (uRefractPower + slide * 1.0) * uChromaticAberration;
        float offsetY = (uRefractPower + slide * 1.0) * uChromaticAberration;
        float offsetG = (uRefractPower + slide * 2.0) * uChromaticAberration;
        float offsetC = (uRefractPower + slide * 2.5) * uChromaticAberration;
        float offsetB = (uRefractPower + slide * 3.0) * uChromaticAberration;
        float offsetP = (uRefractPower + slide * 1.0) * uChromaticAberration;

        float r = texture2D(uTexture, uv + refractVecR.xy * offsetR).x * 0.5;

        vec3 ySample = texture2D(uTexture, uv + refractVecY.xy * offsetY).xyz;
        float y = (ySample.x * 2.0 + ySample.y * 2.0 - ySample.z) / 6.0;

        float g = texture2D(uTexture, uv + refractVecG.xy * offsetG).y * 0.5;

        vec3 cSample = texture2D(uTexture, uv + refractVecC.xy * offsetC).xyz;
        float c = (cSample.y * 2.0 + cSample.z * 2.0 - cSample.x) / 6.0;

        float b = texture2D(uTexture, uv + refractVecB.xy * offsetB).z * 0.5;

        vec3 pSample = texture2D(uTexture, uv + refractVecP.xy * offsetP).xyz;
        float p = (pSample.z * 2.0 + pSample.x * 2.0 - pSample.y) / 6.0;

        float R = r + (2.0 * p + 2.0 * y - c) / 3.0;
        float G = g + (2.0 * y + 2.0 * c - p) / 3.0;
        float B = b + (2.0 * c + 2.0 * p - y) / 3.0;

        color.r += R;
        color.g += G;
        color.b += B;
      }
    }

    color /= float(uLoop);
  } else {
    color = texture2D(uTexture, uv).rgb;
  }

  color = sat(color, uSaturation);

  // Tone adjustments to counter light/dark inversion
  color *= uBrightness;
  color = (color - 0.5) * uContrast + 0.5;
  // prevent division by zero; apply gamma correction
  float invGamma = 1.0 / max(uGamma, 0.0001);
  color = pow(max(color, 0.0), vec3(invGamma));

  // 有色玻璃透射/混合：保持原计算逻辑不变
  // uDark = 0 -> Beer-Lambert
  // uDark = 1 -> Hard Light
  float mode = clamp(uDark, 0.0, 1.0);

  // --- Beer-Lambert (原逻辑) ---
  float localYMin = uTintLocalYRange.x;
  float localYMax = uTintLocalYRange.y;
  float localYDenominator = max(localYMax - localYMin, 1e-5);
  float tintGradientFactor = clamp((modelLocalY - localYMin) / localYDenominator, 0.0, 1.0);
  vec4 tintColorGradient = mix(uTintColorB, uTintColorA, tintGradientFactor);

  float ndotv = abs(dot(normal, eyeDir));
  float thicknessMask = clamp(1.0 - ndotv, 0.0, 1.0);
  float tintAlpha = clamp(tintColorGradient.a, 0.0, 1.0);
  float minAlpha = clamp(uTintThicknessMinAlpha, 0.0, 1.0);
  float maxAlpha = clamp(uTintThicknessMaxAlpha, 0.0, 1.0);
  tintAlpha *= mix(maxAlpha, minAlpha, thicknessMask);

  float tintK_beer = clamp(uTintEnabled, 0.0, 1.0) * tintAlpha;
  vec3 tintColorClamped = clamp(tintColorGradient.rgb, 0.001, 1.0);
  float thickness = clamp(uTintMix, 0.01, 3.0);
  vec3 transmittance = pow(tintColorClamped, vec3(thickness));
  vec3 beerColor = mix(color, color * transmittance, tintK_beer);

  // --- Hard Light (原逻辑) ---
  float tintK_hard = clamp(uTintEnabled, 0.0, 1.0) * clamp(uTintMix, 0.0, 1.0) * tintAlpha;
  vec3 baseClamped = clamp(color, 0.0, 1.0);
  vec3 blendClamped = clamp(tintColorGradient.rgb, 0.0, 1.0);
  vec3 h = step(vec3(0.5), blendClamped);
  vec3 hard = mix(2.0 * baseClamped * blendClamped,
                  1.0 - 2.0 * (1.0 - blendClamped) * (1.0 - baseClamped),
                  h);
  vec3 hardColor = mix(color, hard, tintK_hard);

  color = mix(beerColor, hardColor, mode);

  // Specular
  float specularLight = specular(uLight, normal, eyeDir, uShininess, uDiffuseness);
  color += specularLight * uSpecularStrength * mix(1.0, .82, uHeroOptics);

  // Softbox reflections form a continuous polished ribbon on curved glass.
  vec3 reflection = reflect(eyeDir, normal);
  float ribbonCoord = dot(reflection, normalize(vec3(.85, .45, .24)));
  float ribbonCenter = .23 + (uOpticsPointer.x - .5) * .18;
  float ribbonDistance = ribbonCoord - ribbonCenter;
  float ribbon = exp(-ribbonDistance * ribbonDistance / (.055 * .055));
  float softRibbon = exp(-ribbonDistance * ribbonDistance / (.21 * .21));
  float rim = pow(1.0 - abs(dot(normal, eyeDir)), 2.5);
  color += uHeroOptics * (ribbon * .30 + softRibbon * .045)
           * mix(vec3(.78, .89, 1.0), vec3(1.0, .96, .90), proximity);
  color += uHeroOptics * rim * vec3(.035, .065, .10);

  // Fresnel
  float f = fresnel(eyeDir, normal, uFresnelPower);
  float sideDot = dot(normal, normalize(uFresnelSideDir));
  float sideMask = smoothstep(-0.5, 0.5, sideDot);
  color.rgb += f * sideMask * vec3(uFresnelStrength);

  gl_FragColor = vec4(color, uGlassOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
