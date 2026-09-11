import assert from 'node:assert/strict';
import { estimateHeadAnchor, smoothAnchor } from '../arTrackingEngine';

const anchor = estimateHeadAnchor({
  x: 40,
  y: 80,
  width: 220,
  height: 300,
  confidence: 0.82,
  label: 'cat',
});

assert.equal(anchor.visible, true);
assert.equal(anchor.label, 'cat');
assert.equal(anchor.x, 150);
assert.ok(anchor.y >= 125 && anchor.y <= 145, `unexpected y ${anchor.y}`);
assert.ok(anchor.scale > 1.4, `unexpected scale ${anchor.scale}`);

const hidden = estimateHeadAnchor({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  confidence: 0.2,
  label: 'dog',
});

assert.equal(hidden.visible, false);

const smoothed = smoothAnchor(
  { x: 10, y: 10, scale: 1, rotation: 0, visible: true, confidence: 0.7, label: 'cat' },
  { x: 30, y: 30, scale: 2, rotation: 10, visible: true, confidence: 0.9, label: 'cat' },
  0.25
);

assert.equal(smoothed.x, 15);
assert.equal(smoothed.y, 15);
assert.equal(smoothed.scale, 1.25);

console.log('arTrackingEngine tests passed');
