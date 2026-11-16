// About: what the repository is, how the site is made, what is not shown, how to run it.
import { app, route } from './core.js';

route('about', async () => {
  app().innerHTML = `<h1>About</h1>
  <p class="lead">Matlab_code holds "Various MATLAB and OCTAVE code samples used for testing" (README) by George
    Dickinson, MIT licence. This site shows the repository; it does not run MATLAB or Octave.</p>
  <h2>How the site is made</h2>
  <ul>
    <li>The code explorer shows each file's header comment, functions, classes, solvers and plot calls, read from its text.</li>
    <li>The ode45 demo is a JavaScript port of Octave 4.4's ode45. Its node test reproduces the Octave 4.4.1 run stored
      in the repository file <code>test</code> (16 steps, to 1e-9) and checks the spring-damper against the exact
      solution. The shapes demo evaluates the script's angle vectors.</li>
    <li>Octave was not installed when the site was built, so no other reference runs were made.</li>
  </ul>
  <h2>What is not shown</h2>
  <ul>
    <li>GainTuningExercise/QuadPlot.m: third-party exercise code (its QuatToRot says "written by Daniel Mellinger") with
      no licence statement; listed with its structure only. pd_control_gui.p is protected P-code and the .fig is a binary figure.</li>
    <li>The user and machine name in the header of the Octave workspace file are replaced.</li>
  </ul>
  <h2>Running the code</h2>
  <p>Open the .m files in MATLAB or GNU Octave and run them; ode45 is built into both. The gain-tuning GUI
    (GainTuningExercise/runsim.m) needs MATLAB, since P-code does not run in Octave.</p>
  <h2>Run this site locally</h2>
  <pre>pip install -r requirements-web.txt
python run_web.py            # http://127.0.0.1:8255</pre>
  <p>The static copy for GitHub Pages is built by <code>scripts/build_static.py</code> and published by
    <code>.github/workflows/pages.yml</code> on every push to main.</p>`;
});
