import test from 'node:test';
import assert from 'node:assert/strict';
const { createFluidPointer } = await import('../src/fluid-pointer.js').catch(() => ({}));
const metrics = { width: 1280, height: 720, dpr: 2, mobile: false, reducedMotion: false };

test('a mouse swipe injects velocity without a first-entry teleport', () => {
  assert.equal(typeof createFluidPointer, 'function', 'fluid pointer tracking is missing');
  const pointer = createFluidPointer();
  pointer.move(.2, .5);
  const first = pointer.sample(0, metrics);
  assert.deepEqual(first.delta, [0, 0]);
  pointer.move(.5, .5);
  const moving = pointer.sample(16, metrics);
  assert.equal(moving.enabled, true);
  assert.ok(Math.abs(moving.delta[0] - 768) < .001);
  assert.equal(moving.delta[1], 0);
});
test('the fluid pass stops after the reference 600ms inactivity window', () => {
  assert.equal(typeof createFluidPointer, 'function', 'fluid pointer tracking is missing');
  const pointer = createFluidPointer();
  pointer.move(.2, .5); pointer.sample(0, metrics);
  pointer.move(.5, .5); pointer.sample(16, metrics);
  assert.equal(pointer.sample(400, metrics).enabled, true);
  assert.equal(pointer.sample(617, metrics).enabled, false);
});
test('mobile and reduced-motion preferences disable fluid distortion', () => {
  assert.equal(typeof createFluidPointer, 'function', 'fluid pointer tracking is missing');
  for (const override of [{ mobile: true }, { reducedMotion: true }]) {
    const pointer = createFluidPointer();
    pointer.move(.2, .5); pointer.sample(0, { ...metrics, ...override });
    pointer.move(.8, .8);
    assert.equal(pointer.sample(16, { ...metrics, ...override }).enabled, false);
  }
});
