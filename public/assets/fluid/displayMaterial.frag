uniform float uHeroOptics;
uniform sampler2D tDiffuse;
uniform sampler2D uVelocity;
uniform vec2 uSimSize;
uniform float uDisplacementStrength;
uniform float uChromaticBoost;
uniform float uEffectEnabled;

vec3 spectrum(float x) {
  return cos((x - vec3(0.0, 0.5, 1.0)) * vec3(0.6, 1.0, 0.5) * 3.14);
}

vec4 getFluidDisplayColor(vec2 uv) {
  vec2 velocity = texture2D(uVelocity, uv).xy;
  float effectEnabled = uEffectEnabled;
  vec2 displacement = velocity / max(uSimSize, vec2(1.0)) * uDisplacementStrength * effectEnabled;
  float velocityMagnitude = length(displacement);
  // Bounded lens displacement keeps fast strokes from tearing the glass.
  vec2 lens = displacement * (.16 * velocityMagnitude / (1.0 + 1.5 * velocityMagnitude * velocityMagnitude));
  float lensEnergy = smoothstep(.015, .38, velocityMagnitude);

  const int samples = 4; // 采样次数
  vec4 color = vec4(0.0);
  vec3 weightSum = vec3(0.0);

  for (int index = 0; index < samples; index++) {
    float t = float(index) / float(samples - 1);
    vec3 weight = max(vec3(0.0), cos((t - vec3(0.0, 0.5, 1.0)) * 3.14159 * 0.5));
    vec2 originalOffset = displacement * 0.3 * (t + 0.3) * velocityMagnitude;
    vec2 lensOffset = lens * (.60 + .65 * t);
    vec2 offset = mix(originalOffset, lensOffset, uHeroOptics);
    vec4 sampleColor = texture2D(tDiffuse, clamp(uv - offset, .001, .999));
    color.rgb += sampleColor.rgb * weight;
    color.a += sampleColor.a * (weight.r + weight.g + weight.b) / 3.0;
    weightSum += weight;
  }

  color.rgb /= max(weightSum, vec3(0.0001));
  color.a /= max((weightSum.r + weightSum.g + weightSum.b) / 3.0, 0.0001);

  vec3 spectralHighlight = spectrum(sin(velocityMagnitude * 2.0) * 0.4 + 0.6);
  color.rgb += spectralHighlight * smoothstep(0.2, 0.8, velocityMagnitude)
               * mix(.5, .13, uHeroOptics) * uChromaticBoost * effectEnabled;
  color.rgb += vec3(.012, .021, .028) * lensEnergy * uHeroOptics * effectEnabled;

  return color;
}

varying vec2 vUv;

void main() {
  vec4 color = getFluidDisplayColor(vUv);
  gl_FragColor = color;
  #include <colorspace_fragment>
}