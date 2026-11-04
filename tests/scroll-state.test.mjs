import test from 'node:test';
import assert from 'node:assert/strict';
import {scrollState} from '../src/scroll-state.js';
const state=y=>scrollState(y,720,3600,2880,6480);
test('scroll phases preserve glass at both ends and white work interval',()=>{assert.equal(state(0).glass,1);assert.equal(state(1600).glass,0);assert.equal(state(6480).glass,1);assert.equal(state(6480).tunnel,0);});
test('tunnel grows during approach and fades continuously into footer',()=>{assert.equal(state(3600).tunnel,0);assert.equal(state(4320).tunnel,1);assert.ok(state(6120).tunnel>0&&state(6120).tunnel<1);assert.ok(state(6120).glass>0&&state(6120).glass<1);});
test('scrubbing is reversible and supports changed responsive section sizes',()=>{const before=state(5000);state(6400);assert.deepEqual(state(5000),before);for(const y of [-100,0,500,3000,10000]){const values=scrollState(y,844,4000,2954,6954);for(const v of Object.values(values))assert.ok(v>=0&&v<=1);}});
