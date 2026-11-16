// Port of compleExponential.m: z = exp(i*theta) for the script's angle vectors (the star is the active one; the
// octagon, hexagon and circle are its commented-out alternatives). plot(z) of a complex vector draws real vs imaginary.
export const SHAPES = {
  star: { line: 9, code: "theta = (0:3:15)'*(2*pi/5) + pi/2;", theta: () => range(0, 3, 15).map(k => k * (2 * Math.PI / 5) + Math.PI / 2) },
  octagon: { line: 2, code: "theta = (1:2:17)'*pi/8", theta: () => range(1, 2, 17).map(k => k * Math.PI / 8) },
  hexagon: { line: 4, code: "theta = (1:2:17)'*pi/6", theta: () => range(1, 2, 17).map(k => k * Math.PI / 6) },
  circle: { line: 6, code: "theta = (0:0.1:15)'*(2*pi/5) + pi/2;", theta: () => range(0, 0.1, 15).map(k => k * (2 * Math.PI / 5) + Math.PI / 2) },
};

// MATLAB colon a:s:b (count from the rounded number of steps, as MATLAB does, to avoid float drift).
export function range(a, s, b) {
  const n = Math.floor((b - a) / s + 1e-10);
  return Array.from({ length: n + 1 }, (_, k) => a + k * s);
}

export const shape = name => SHAPES[name].theta().map(t => ({ theta: t, re: Math.cos(t), im: Math.sin(t) }));
