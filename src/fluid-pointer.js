// Sample mouse motion once per rendered frame, matching the reference's
// device-pixel impulse units and 600 ms interaction window.
export function createFluidPointer() {
  let x = .5, y = .5, inside = false, previous = null;
  let lastMotion = -Infinity, dx = 0, dy = 0;
  return {
    move(nextX, nextY) { x = nextX; y = nextY; inside = true; },
    leave() { inside = false; },
    reset() { previous = null; dx = dy = 0; lastMotion = -Infinity; },
    sample(now, { width, height, dpr, mobile, reducedMotion }) {
      const position = [x * width * dpr, y * height * dpr];
      if (inside && !mobile && !reducedMotion) {
        dx = previous ? position[0] - previous[0] : 0;
        dy = previous ? position[1] - previous[1] : 0;
        previous = position;
        if (dx * dx + dy * dy > 1) lastMotion = now;
      } else { dx *= .9; dy *= .9; }
      const idle = now - lastMotion;
      const enabled = !mobile && !reducedMotion && idle <= 600;
      const fade = enabled ? Math.max(0, Math.min(1, (600 - idle) / 180)) : 0;
      return { position, delta: [dx, dy], enabled, fade: fade * fade * (3 - 2 * fade) };
    }
  };
}
