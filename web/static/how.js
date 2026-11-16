// How it works: the main analyses explained from their code, each claim linked to the line it describes.
import { api, app, esc, list, route } from './core.js';


route('how', async () => {
  const { sections } = await api('/how');
  app().innerHTML = `<h1>How it works</h1>
  <p class="lead">What the main scripts actually do, read from their code. Each statement links to the line it
    describes in the code explorer.</p>
  ${list(sections, s => `<h2 id="${s.id}">${esc(s.title)}</h2>
    ${list(s.claims, c => `<div class="claim">${esc(c.text)}<br><a href="#/code/${c.id}?l=${c.line}">${esc(c.file)}:${c.line}</a>
      <code>${esc(c.quote)}</code></div>`)}`)}
  <h2>Not covered</h2>
  <p>GainTuningExercise/QuadPlot.m (a quadrotor plotting class) is third-party exercise code without a licence: the
    explorer lists its class, methods and functions but not its source. The tuning GUI itself is protected P-code.</p>`;
});
