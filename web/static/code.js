// Code explorer: #/code (tree + search), #/code/<id>?l=<line> (one file: facts and numbered, highlighted source).
import { $, api, app, esc, list, route } from './core.js';
import { highlight } from './highlight.js';

const kb = n => (n < 1000 ? `${n} B` : `${(n / 1000).toFixed(n < 10000 ? 1 : 0)} kB`);

function tree(files, current, folder) {
  const root = { dirs: {}, files: [] };
  for (const f of files) {
    let node = root;
    for (const part of f.path.split('/').slice(0, -1)) node = node.dirs[part] ??= { dirs: {}, files: [] };
    node.files.push(f);
  }
  const open = (path) => (current && current.path.startsWith(path + '/')) || (folder && (folder === path || folder.startsWith(path + '/')));
  const render = (node, prefix) => Object.entries(node.dirs).map(([name, sub]) => {
    const path = prefix ? `${prefix}/${name}` : name;
    return `<details ${open(path) ? 'open' : ''}><summary>${esc(name)}/</summary>${render(sub, path)}</details>`;
  }).join('') + node.files.map(f => `<a href="#/code/${f.id}" class="${f.id === current?.id ? 'on' : ''} ${f.shown ? '' : 'off'}" data-name="${esc(f.path.toLowerCase())}">
      <span>${esc(f.name)}</span><span>${f.lines != null ? f.lines + ' l' : kb(f.size)}</span></a>`).join('');
  return `<aside class="panel tree"><label for="tq">Filter by file name</label><input id="tq" type="search" placeholder="e.g. Plot2a">
    <div id="tree">${render(root, '')}</div></aside>`;
}

function wireTree(root) {
  const q = $('#tq', root);
  q.addEventListener('input', () => {
    const v = q.value.toLowerCase().trim();
    root.querySelectorAll('#tree a').forEach(a => a.classList.toggle('hide', !!v && !a.dataset.name.includes(v)));
    root.querySelectorAll('#tree details').forEach(d => { if (v) d.open = !!d.querySelector('a:not(.hide)'); d.classList.toggle('hide', !!v && !d.querySelector('a:not(.hide)')); });
  });
}

function numbered(text, lang, hl) {
  const lines = lang ? highlight(text, lang) : text.split('\n').map(esc);
  if (lines.length > 1 && lines.at(-1) === '') lines.pop();
  return `<div class="code-view panel"><table><tbody>${lines.map((l, i) =>
    `<tr id="L${i + 1}" class="${i + 1 === hl ? 'hl' : ''}"><td class="n">${i + 1}</td><td>${l || ' '}</td></tr>`).join('')}</tbody></table></div>`;
}

function factsBlock(fx) {
  if (!fx) return '';
  const row = (k, v) => (v && v.length ? `<dt>${k}</dt><dd>${v.map(esc).join(', ')}</dd>` : '');
  return `<dl class="kv">${row('Classes', fx.classes)}${row('Functions', fx.functions)}${row('Solvers', fx.solvers)}
    ${fx.plots ? `<dt>Plot calls</dt><dd>${fx.plots}</dd>` : ''}</dl>`;
}

async function search(root, files, q) {
  const out = $('#results', root);
  if (q.trim().length < 2) { out.innerHTML = ''; return; }
  const corpus = Object.fromEntries(await Promise.all(files.filter(f => f.shown).map(async f => [f.id, (await api('/file/' + f.id)).text]))), byId = Object.fromEntries(files.map(f => [f.id, f]));
  const needle = q.toLowerCase(), hits = [];
  for (const [id, text] of Object.entries(corpus)) {
    text.split('\n').forEach((line, i) => { if (line.toLowerCase().includes(needle) && hits.length < 200) hits.push({ id, line: i + 1, text: line.trim() }); });
  }
  const rx = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  out.innerHTML = `<p class="small mute">${hits.length === 200 ? 'First 200' : hits.length} matching line${hits.length === 1 ? '' : 's'} in the shown files.</p>
    ${list(hits, h => `<a class="hit" href="#/code/${h.id}?l=${h.line}"><b>${esc(byId[h.id].path)}:${h.line}</b> ${esc(h.text.slice(0, 160)).replace(rx, m => `<mark>${m}</mark>`)}</a>`)}`;
}

route('code', async ([id], query) => {
  const { files } = await api('/files');
  const root = app();
  if (!id) {
    const shown = query.folder ? files.filter(f => f.path.startsWith(query.folder + '/')) : files;
    root.innerHTML = `<div class="side">${tree(files, null, query.folder)}<section>
      <h1>Code</h1><p class="lead">${files.length} files. Pick one in the tree, or search the text of every file.
        Greyed files are listed but not shown (binary, or third-party without a licence).</p>
      <label for="q">Search text</label><input id="q" type="search" value="${esc(query.q || '')}" placeholder="e.g. ode45, exp(i">
      <div id="results"></div>
      ${query.folder ? `<h2>${esc(query.folder)}/</h2>` : '<h2>All files</h2>'}
      <table><tbody>${list(shown, f => `<tr><td><a href="#/code/${f.id}">${esc(f.path)}</a></td>
        <td class="small">${esc(f.summary || f.why || f.kind)}</td></tr>`)}</tbody></table></section></div>`;
    wireTree(root);
    const q = $('#q', root);
    let t = 0;
    q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => {
      history.replaceState(null, '', '#/code' + (q.value ? '?q=' + encodeURIComponent(q.value) : '')); search(root, files, q.value); }, 250); });
    if (query.q) search(root, files, query.q);
    return;
  }
  const f = await api('/file/' + id), line = +query.l || 0;
  let body;
  if (!f.shown) body = `<p class="callout">Not shown: ${esc(f.why)}.</p>`;
  else body = numbered(f.text, f.lang, line);
  root.innerHTML = `<div class="side">${tree(files, f)}<article>
    <p class="crumbs mono small">${esc(f.path)}</p><h1>${esc(f.name)}</h1>
    <p class="small mute">${esc(f.kind)} · ${kb(f.size)}${f.lines != null ? ` · ${f.lines} lines` : ''} ·
      <a href="https://github.com/gddickinson/Matlab_code/blob/main/${f.path.split('/').map(encodeURIComponent).join('/')}" target="_blank" rel="noopener">on GitHub</a></p>
    ${f.note ? `<p class="callout">Third-party: ${esc(f.note)}.</p>` : ''}
    ${f.summary ? `<p class="lead">${esc(f.summary)}</p>` : ''}
    ${factsBlock(f.facts)}${body}</article></div>`;
  wireTree(root);
  if (line) requestAnimationFrame(() => root.querySelector('#L' + line)?.scrollIntoView({ block: 'center' }));
});
