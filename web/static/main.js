// Entry point: lazy page modules, the mode label, a faint background of decaying oscillations, then the router.
import { $, app, isStatic, lazy, route, start } from './core.js';

const PAGES = { 'home.js': ['home'], 'code.js': ['code'], 'how.js': ['how'], 'demos.js': ['demo'], 'about.js': ['about'] };
lazy(Object.fromEntries(Object.entries(PAGES).flatMap(([file, names]) => names.map(n => [n, () => import('./' + file)]))));
route('notfound', () => { app().innerHTML = '<h1>Not found</h1><p><a href="#/">Back to the start</a></p>'; });

$('#mode').textContent = isStatic()
  ? 'static site: files read from the repository at build time; ode45 and the shapes run in your browser'
  : 'local app: files read from this checkout; demos run in your browser';

// Background: a few faint damped oscillations scrolling past. Off under prefers-reduced-motion.
function background(canvas) {
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const g = canvas.getContext('2d'), cols = ['#ff9e3d', '#2ee6ff', '#b28cff'];
  const fit = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  fit(); addEventListener('resize', fit);
  let last = 0, phase = 0;
  const tick = t => {
    requestAnimationFrame(tick);
    if (document.hidden || t - last < 50) return;
    last = t; phase += 0.02;
    const W = canvas.width, H = canvas.height;
    g.clearRect(0, 0, W, H); g.lineWidth = 1.2;
    cols.forEach((c, k) => {
      g.strokeStyle = c; g.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const u = ((x / W + phase * (k + 1) * 0.3) % 1) * 10;
        const y = H * (k + 1) / 4 - 40 * Math.exp(-u / 2) * Math.sin(Math.sqrt(3) / 2 * u * 3);
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    });
  };
  requestAnimationFrame(tick);
}
background($('#bg'));
start();
