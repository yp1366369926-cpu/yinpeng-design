export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ease = x => {x=clamp01(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;};
// Absolute document coordinates keep scrubbing and reverse scrolling deterministic.
export function scrollState(y, height, tunnelTop, tunnelHeight, contactTop) {
  const heroExit=clamp01(y/height);
  const approach=clamp01((y-tunnelTop)/height);
  const travel=clamp01((y-tunnelTop)/Math.max(1,tunnelHeight-height));
  const contact=clamp01((y-contactTop+height)/height);
  return {heroExit,approach,travel,contact,tunnel:approach*(1-ease(contact)),glass:Math.max(1-ease(heroExit),ease(contact))};
}

// Text and GPU particles consume the same reversible chapter envelope.
export function tunnelMotion(y,height,top){
 const position=(y-top)/Math.max(height,1);
 const entrance=ease(clamp01((position+.65)/.65));
 const exit=1-ease(clamp01((position-3.25)/.55));
 const background=entrance*exit;
 const weights=[0,1,2,3].map(i=>{
  const distance=Math.abs(position-i);
  const pulse=1-ease(clamp01((distance-.18)/.32));
  return i===0&&position<0?entrance:pulse*background;
 });
 return {position,background,weights,particles:Math.max(...weights)};
}
