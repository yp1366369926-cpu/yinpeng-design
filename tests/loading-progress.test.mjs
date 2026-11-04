import test from 'node:test';
import assert from 'node:assert/strict';
import { loadingProgress } from '../src/loading-progress.js';
test('resource progress cannot finish before the scene is ready',()=>{
  assert.equal(loadingProgress(5000,1,false),94);
  assert.equal(loadingProgress(5000,.35,false),35);
});
test('cached resources retain a readable entrance before completing',()=>{
  assert.equal(loadingProgress(0,1,true),0);
  assert.equal(loadingProgress(600,1,true),50);
  assert.equal(loadingProgress(1200,1,true),100);
});
test('reduced motion skips the minimum animation time but still waits for readiness',()=>{
  assert.equal(loadingProgress(0,.4,false,true),40);
  assert.equal(loadingProgress(0,1,true,true),100);
});
