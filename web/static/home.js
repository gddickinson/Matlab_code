// Home: what the repository is, real counts, the scripts and the demos.
import { api, app, esc, list, route } from './core.js';

route('home', async () => {
  const [{ stats: s }, { files }] = await Promise.all([api('/info'), api('/files')]);
  app().innerHTML = `
  <section class="hero">
    <p class="kicker">gddickinson / Matlab_code</p>
    <h1 class="glow">MATLAB code</h1>
    <p class="lead">"Various MATLAB and OCTAVE code samples used for testing" (the README): solving ODEs with ode45,
      drawing shapes with complex exponentials, and a PD gain-tuning exercise. Read the code, see how it works, and run
      the calculations in your browser with a port of Octave's ode45 that reproduces the Octave run saved in the repository.</p>
    <a class="btn" href="#/demo/ode">Run ode45</a><a class="btn alt" href="#/code">Browse the code</a>
    <a class="btn alt" href="#/how">How it works</a>
  </section>
  <div class="tiles">
    <div class="tile"><b>${s.m_files}</b><span>.m files</span></div>
    <div class="tile"><b>${s.m_lines}</b><span>lines of MATLAB</span></div>
    <div class="tile"><b>${s.functions}</b><span>functions and methods</span></div>
    <div class="tile"><b>${s.files}</b><span>files</span></div>
    <div class="tile"><b>2</b><span>in-browser demos</span></div>
  </div>
  <h2>Demos</h2>
  <div class="grid wide">
    <a class="card" href="#/demo/ode"><b>ode45: logistic growth and a damped spring</b><small>logisticGrowth_ode45.m, motionofMassSpringDamper_ode45.m</small>
      <span>Octave 4.4's Dormand-Prince solver ported to JavaScript: same steps and values as the saved Octave run, with your own parameters.</span></a>
    <a class="card" href="#/demo/shapes"><b>Shapes from exp(i&theta;)</b><small>compleExponential.m</small>
      <span>The star the script draws and its commented-out octagon, hexagon and circle.</span></a>
  </div>
  <h2>Files</h2>
  <div class="grid">${list(files.filter(f => f.kind === 'code'), f => `<a class="card" href="#/code/${f.id}"><b>${esc(f.name)}</b>
    <small>${esc(f.path)} · ${f.lines} lines${f.shown ? '' : ' · listed only'}</small><span>${esc(f.summary || f.note || '')}</span></a>`)}</div>`;
});
