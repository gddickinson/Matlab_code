// Demo: the two ode45 scripts solved in the browser with the Octave 4.4 ode45 port (ode45_engine.js).
import { $, api } from './core.js';
import { scatter } from './chart.js';
import { logistic, ode45, springDamper } from './ode45_engine.js';
import { parseOctaveText } from './octave_text.js';

const num = (root, id) => +$(id, root).value;

export async function render(root) {
  const saved = parseOctaveText((await api('/octave_run')).text);
  const ref = saved.tSol.value.map((r, i) => [r[0], saved.PSol.value[i][0]]);
  root.innerHTML = `<p class="kicker">Demo · ode45</p><h1>Solving ODEs with ode45</h1>
  <p class="lead">Both scripts call <code>ode45</code>, the adaptive Dormand-Prince Runge-Kutta solver. This page runs a
    JavaScript port of Octave 4.4's ode45 (default tolerances RelTol 1e-3, AbsTol 1e-6, maximum step a tenth of the
    time span). With the script's values it reproduces the Octave 4.4.1 run saved in the repository file
    <a href="#/code/test">test</a>: the same ${ref.length} time steps and values (to 1e-9).</p>
  <h2>Logistic growth <span class="small mute">logisticGrowth_ode45.m</span></h2>
  <p class="eq">dP/dt = r P (1 - P/K)</p>
  <div class="row">
    <div><label for="r">Growth rate r</label><input id="r" type="number" step="0.1" value="1"></div>
    <div><label for="K">Carrying capacity K</label><input id="K" type="number" step="10" value="1000"></div>
    <div><label for="P0">Starting size P0</label><input id="P0" type="number" step="1" value="20"></div>
    <div><label for="tf">End time</label><input id="tf" type="number" step="1" value="10"></div>
  </div>
  <div id="lplot"></div><p class="small mute" id="lnote"></p>
  <h2>Mass-spring-damper <span class="small mute">motionofMassSpringDamper_ode45.m</span></h2>
  <p class="eq">x'' = -x' - x,  x(0) = x0, x'(0) = v0</p>
  <div class="row">
    <div><label for="x0">Start position x0</label><input id="x0" type="number" step="0.1" value="0"></div>
    <div><label for="v0">Start velocity v0</label><input id="v0" type="number" step="0.1" value="1"></div>
    <div><label for="stf">End time</label><input id="stf" type="number" step="1" value="10"></div>
  </div>
  <div id="splot"></div><p class="small mute" id="snote"></p>`;
  const logi = () => {
    const r = num(root, '#r'), K = num(root, '#K'), P0 = num(root, '#P0'), tf = Math.max(0.1, num(root, '#tf'));
    if (!(K > 0)) { $('#lnote', root).textContent = 'K must be positive.'; return; }
    const sol = ode45(logistic(r, K), [0, tf], [P0]);
    const exact = t => K / (1 + ((K - P0) / P0) * Math.exp(-r * t));
    const ys = sol.x.map(x => x[0]), lo = Math.min(0, ...ys), hi = Math.max(...ys, 1);
    const curve = Array.from({ length: 201 }, (_, i) => [i * tf / 200, exact(i * tf / 200)]);
    const isScript = r === 1 && K === 1000 && P0 === 20 && tf === 10;
    $('#lplot', root).innerHTML = scatter(sol.t.map((t, i) => ({ x: t, y: ys[i], colour: '#ff9e3d', title: `t ${t.toFixed(4)}  P ${ys[i].toFixed(4)}` }))
      .concat(isScript ? ref.map(([t, p]) => ({ x: t, y: p, colour: '#2ee6ff', symbol: 'square-open', title: `Octave: t ${t.toFixed(4)} P ${p.toFixed(4)}` })) : []),
      { title: 'logistic growth', xlim: [0, tf], ylim: [lo, hi * 1.05], xlab: 'time', ylab: 'population size',
        lines: P0 > 0 ? [{ xy: curve, colour: '#94a3c6', dash: true, width: 1 }] : [] });
    $('#lnote', root).innerHTML = `${sol.t.length} steps (${sol.rejected} rejected). Orange: ode45 points; dashed: exact solution
      K / (1 + (K - P0)/P0 e^(-rt)) for comparison${isScript ? '; cyan squares: the Octave 4.4.1 run saved in the repository' : ''}.`;
  };
  const spring = () => {
    const x0 = num(root, '#x0'), v0 = num(root, '#v0'), tf = Math.max(0.1, num(root, '#stf'));
    const sol = ode45(springDamper(), [0, tf], [x0, v0]);
    const all = sol.x.flat(), lo = Math.min(...all), hi = Math.max(...all);
    const pad = (hi - lo) * 0.08 || 1;
    $('#splot', root).innerHTML = scatter([
      ...sol.t.map((t, i) => ({ x: t, y: sol.x[i][0], colour: '#ff5c7a', title: `t ${t.toFixed(3)} position ${sol.x[i][0].toFixed(4)}` })),
      ...sol.t.map((t, i) => ({ x: t, y: sol.x[i][1], colour: '#3dff8f', title: `t ${t.toFixed(3)} velocity ${sol.x[i][1].toFixed(4)}` }))],
      { title: 'Spring Dampening', xlim: [0, tf], ylim: [lo - pad, hi + pad], xlab: 'time', ylab: 'position (red), velocity (green)' });
    $('#snote', root).textContent = `${sol.t.length} steps (${sol.rejected} rejected), red position and green velocity as in the script.`;
  };
  ['#r', '#K', '#P0', '#tf'].forEach(s => $(s, root).addEventListener('input', logi));
  ['#x0', '#v0', '#stf'].forEach(s => $(s, root).addEventListener('input', spring));
  logi(); spring();
}
