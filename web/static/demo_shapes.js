// Demo: compleExponential.m: z = exp(i*theta) for the script's star and its commented-out shapes.
import { $, esc, list } from './core.js';
import { scatter } from './chart.js';
import { shape, SHAPES } from './shapes_engine.js';

export async function render(root, query) {
  const name = SHAPES[query.s] ? query.s : 'star';
  root.innerHTML = `<p class="kicker">Demo · compleExponential.m</p><h1>Shapes from exp(i&theta;)</h1>
  <p class="lead">Each angle &theta; becomes the point e<sup>i&theta;</sup> = cos &theta; + i sin &theta; on the unit circle, and
    plotting the complex vector joins the points in order. The script draws the star; the other angle vectors are
    commented out in the file.</p>
  <div class="seg">${list(Object.keys(SHAPES), k => `<button type="button" data-s="${k}" class="${k === name ? 'on' : ''}">${k}</button>`)}</div>
  <div class="two"><div id="plot"></div><div id="info"></div></div>`;
  const draw = k => {
    const z = shape(k), s = SHAPES[k];
    $('#plot', root).innerHTML = scatter(z.length < 20 ? z.map(p => ({ x: p.re, y: p.im, colour: '#ff5c7a', title: `theta ${p.theta.toFixed(4)}` })) : [],
      { title: k, square: true, xlim: [-1.2, 1.2], ylim: [-1.2, 1.2], xlab: 'real', ylab: 'imaginary',
        xticks: [[-1, '-1'], [-0.5, '-0.5'], [0, '0'], [0.5, '0.5'], [1, '1']],
        lines: [{ xy: z.map(p => [p.re, p.im]), colour: '#ff5c7a', width: 4 }] });
    $('#info', root).innerHTML = `<p>compleExponential.m line ${s.line}${k === 'star' ? '' : ' (commented out)'}:</p><pre>${esc(s.code)}</pre>
      <p>${z.length} points.</p>${z.length < 20 ? `<div class="scroll"><table><thead><tr><th>&theta;</th><th>Re z</th><th>Im z</th></tr></thead><tbody>
      ${list(z, p => `<tr><td>${p.theta.toFixed(4)}</td><td>${p.re.toFixed(4)}</td><td>${p.im.toFixed(4)}</td></tr>`)}</tbody></table></div>` : ''}`;
  };
  root.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => {
    root.querySelectorAll('[data-s]').forEach(x => x.classList.toggle('on', x === b));
    history.replaceState(null, '', '#/demo/shapes?s=' + b.dataset.s); draw(b.dataset.s);
  }));
  draw(name);
}
