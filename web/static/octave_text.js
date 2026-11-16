// Reader for Octave's text save format (the repository file `test`): '# name:' / '# type: scalar|matrix' blocks.
// Returns { name: { type, value } } with matrices as arrays of rows; other types keep their raw lines.
export function parseOctaveText(text) {
  const out = {}, lines = text.replace(/\r\n?/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^# name: (\S+)/);
    if (!m) continue;
    const type = (lines[i + 1] || '').replace(/^# type: /, '').trim();
    if (type === 'scalar') { out[m[1]] ??= { type, value: Number(lines[i + 2]) }; continue; }
    if (type === 'matrix') {
      const rows = +lines[i + 2].replace('# rows: ', ''), value = [];
      for (let r = 0; r < rows; r++) value.push(lines[i + 4 + r].trim().split(/\s+/).map(Number));
      out[m[1]] ??= { type, value };
      continue;
    }
    out[m[1]] ??= { type, value: null };
  }
  return out;
}
