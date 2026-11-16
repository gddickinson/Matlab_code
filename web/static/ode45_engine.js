// Port of Octave 4.4's ode45 (Dormand-Prince 4(5), the solver the scripts were run with; see the Octave workspace
// file `test` in the repository, written by Octave 4.4.1): default RelTol 1e-3, AbsTol 1e-6, MaxStep 0.1*|tf-t0|,
// initial step from Hairer's starting_stepsize, step-size control
// dt *= min(facmax, max(facmin, fac * (1/err)^(1/(order+1)))) with fac = 0.38^(1/6), facmin = 0.8, facmax = 1.5,
// and no output refinement (one output row per accepted step). Pure; tested in ode45_engine.test.mjs.

const A = [[], [1 / 5], [3 / 40, 9 / 40], [44 / 45, -56 / 15, 32 / 9],
  [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729], [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656],
  [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84]];
const C = [0, 1 / 5, 3 / 10, 4 / 5, 8 / 9, 1, 1];
const B5 = [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84, 0];
const B4 = [5179 / 57600, 0, 7571 / 16695, 393 / 640, -92097 / 339200, 187 / 2100, 1 / 40];

const axpy = (x, h, ks, w) => x.map((xi, j) => xi + h * ks.reduce((s, k, i) => s + (w[i] ? w[i] * k[j] : 0), 0));

// Octave's AbsRel_Norm (NormControl off): max(|x - y| ./ max(AbsTol, RelTol * max(|x|, |x_old|))).
export function absRelNorm(x, xOld, absTol, relTol, y = null) {
  let m = 0;
  for (let j = 0; j < x.length; j++) {
    const sc = Math.max(absTol, relTol * Math.max(Math.abs(x[j]), Math.abs(xOld[j])));
    m = Math.max(m, Math.abs(x[j] - (y ? y[j] : 0)) / sc);
  }
  return m;
}

// Octave's starting_stepsize (order 5).
export function startingStep(f, t0, x0, absTol, relTol, order = 5) {
  const d0 = absRelNorm(x0, x0, absTol, relTol), y = f(t0, x0), d1 = absRelNorm(y, y, absTol, relTol);
  const h0 = d0 < 1e-5 || d1 < 1e-5 ? 1e-6 : 0.01 * (d0 / d1);
  const x1 = x0.map((v, j) => v + h0 * y[j]), yh = f(t0 + h0, x1), dy = yh.map((v, j) => v - y[j]);
  const d2 = (1 / h0) * absRelNorm(dy, dy, absTol, relTol);
  const h1 = Math.max(d1, d2) <= 1e-15 ? Math.max(1e-6, h0 * 1e-3) : (1e-2 / Math.max(d1, d2)) ** (1 / (order + 1));
  return Math.min(100 * h0, h1);
}

// ode45(f, [t0, tf], x0) -> { t: [...], x: [[...], ...], rejected }. f(t, x) returns an array.
export function ode45(f, [t0, tf], x0, { relTol = 1e-3, absTol = 1e-6, maxStep = 0.1 * Math.abs(tf - t0), maxSteps = 1e5 } = {}) {
  const order = 5, fac = 0.38 ** (1 / (order + 1)), facmin = 0.8, facmax = 1.5;
  let t = t0, x = x0.slice(), dt = Math.min(startingStep(f, t0, x0, absTol, relTol), maxStep), rejected = 0;
  const T = [t], X = [x.slice()];
  let k1 = f(t, x);
  for (let n = 0; n < maxSteps && t < tf; n++) {
    if (t + dt > tf) dt = tf - t;
    const ks = [k1];
    for (let s = 1; s < 7; s++) ks.push(f(t + C[s] * dt, axpy(x, dt, ks, A[s])));
    const xNew = axpy(x, dt, ks, B5), xEst = axpy(x, dt, ks, B4);
    let err = absRelNorm(xNew, x, absTol, relTol, xEst);
    if (err <= 1) {
      t += dt; x = xNew; k1 = ks[6];
      T.push(t); X.push(x.slice());
    } else rejected++;
    err += Number.EPSILON;
    dt *= Math.min(facmax, Math.max(facmin, fac * (1 / err) ** (1 / (order + 1))));
    dt = Math.min(Math.abs(dt), maxStep);
  }
  return { t: T, x: X, rejected };
}

// The two scripts' equations.
export const logistic = (r = 1, K = 1000) => (t, P) => [r * P[0] * (1 - P[0] / K)];   // logisticGrowth_ode45.m
export const springDamper = () => (t, x) => [x[1], -x[1] - x[0]];                   // motionofMassSpringDamper_ode45.m
