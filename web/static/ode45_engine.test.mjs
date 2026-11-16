// Node test: the ode45 port reproduces the Octave 4.4.1 run saved in the repository file `test`
// (tSol and PSol of logisticGrowth_ode45.m), and the spring-damper solution matches the exact one.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logistic, ode45, springDamper, startingStep } from './ode45_engine.js';
import { parseOctaveText } from './octave_text.js';
import { shape, SHAPES } from './shapes_engine.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const saved = parseOctaveText(readFileSync(join(ROOT, 'test'), 'utf8'));
assert.equal(saved.K.value, 1000); assert.equal(saved.P0.value, 20); assert.equal(saved.r.value, 1);

const run = ode45(logistic(saved.r.value, saved.K.value), saved.tSpan.value[0], [saved.P0.value]);
const tRef = saved.tSol.value.map(r => r[0]), pRef = saved.PSol.value.map(r => r[0]);
assert.equal(run.t.length, tRef.length, `steps ${run.t.length} vs Octave ${tRef.length}`);
run.t.forEach((t, i) => assert.ok(Math.abs(t - tRef[i]) < 1e-12, `t[${i}] ${t} vs ${tRef[i]}`));
run.x.forEach((x, i) => assert.ok(Math.abs(x[0] - pRef[i]) < 1e-9 * Math.max(1, pRef[i]), `P[${i}] ${x[0]} vs ${pRef[i]}`));
// hand-traced first step: d0 = d1 = 1000 -> h0 = 0.01; d2 = 1e5 -> h1 = (1e-7)^(1/6)
assert.ok(Math.abs(startingStep(logistic(), 0, [20], 1e-6, 1e-3) - 1e-7 ** (1 / 6)) < 1e-15);

// x'' + x' + x = 0, x(0) = 0, x'(0) = 1: x(t) = (2/sqrt3) e^(-t/2) sin(sqrt3 t / 2)
const sd = ode45(springDamper(), [0, 10], [0, 1]);
const exact = t => (2 / Math.sqrt(3)) * Math.exp(-t / 2) * Math.sin((Math.sqrt(3) / 2) * t);
sd.t.forEach((t, i) => assert.ok(Math.abs(sd.x[i][0] - exact(t)) < 2e-3, `spring x(${t})`));
assert.equal(sd.t.at(-1), 10);

// compleExponential.m: the star, theta = (0:3:15)'*(2*pi/5) + pi/2, z = exp(i*theta): hand-traced vertices
const star = shape('star');
assert.equal(star.length, 6);
assert.ok(Math.abs(star[0].re) < 1e-15 && Math.abs(star[0].im - 1) < 1e-15);              // theta = pi/2 -> i
const th1 = 3 * 2 * Math.PI / 5 + Math.PI / 2;                                              // 6pi/5 + pi/2
assert.ok(Math.abs(star[1].re - Math.cos(th1)) < 1e-15 && Math.abs(star[1].im - Math.sin(th1)) < 1e-15);
assert.ok(Math.abs(star[5].re - star[0].re) < 1e-12 && Math.abs(star[5].im - star[0].im) < 1e-12); // closes (15 * 2pi/5 = 6 pi)
assert.equal(shape('octagon').length, 9); assert.equal(shape('hexagon').length, 9); assert.equal(shape('circle').length, 151);
assert.deepEqual(Object.keys(SHAPES), ['star', 'octagon', 'hexagon', 'circle']);
console.log(`ode45 tests ok (${run.t.length} steps match Octave 4.4.1; spring-damper ${sd.t.length} steps)`);
