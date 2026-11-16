// Demo router: #/demo/<name> loads the demo's module.
import { app, route } from './core.js';

const DEMOS = { ode: './demo_ode.js', shapes: './demo_shapes.js' };

route('demo', async ([name = 'ode'], query) => {
  if (!DEMOS[name]) { app().innerHTML = '<h1>Not found</h1><p><a href="#/">Back to the start</a></p>'; return; }
  const mod = await import(DEMOS[name]);
  await mod.render(app(), query);
});
