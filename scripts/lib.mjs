// Shared design tokens + helpers. Everything is sharp-cornered by design.
export const C = { bg:'#0a0b0c', panel:'#0f1113', panel2:'#16191c', line:'#2b3036', dim:'#6b747d', txt:'#d7dde3', amber:'#ffb800', amber2:'#ff8a00', cyan:'#19e6ff', red:'#ff3b30', green:'#39ff88' };
export const MONO = "'Courier New',Consolas,monospace";
const F = {A:'01110,10001,11111,10001,10001',B:'11110,10001,11110,10001,11110',C:'01111,10000,10000,10000,01111',D:'11110,10001,10001,10001,11110',E:'11111,10000,11110,10000,11111',F:'11111,10000,11110,10000,10000',G:'01111,10000,10011,10001,01111',H:'10001,10001,11111,10001,10001',I:'11111,00100,00100,00100,11111',J:'00111,00010,00010,10010,01100',K:'10010,10100,11000,10100,10010',L:'10000,10000,10000,10000,11111',M:'10001,11011,10101,10001,10001',N:'10001,11001,10101,10011,10001',O:'01110,10001,10001,10001,01110',P:'11110,10001,11110,10000,10000',Q:'01110,10001,10101,10010,01101',R:'11110,10001,11110,10100,10010',S:'01111,10000,01110,00001,11110',T:'11111,00100,00100,00100,00100',U:'10001,10001,10001,10001,01110',V:'10001,10001,10001,01010,00100',W:'10001,10001,10101,11011,10001',X:'10001,01010,00100,01010,10001',Y:'10001,01010,00100,00100,00100',Z:'11111,00010,00100,01000,11111',0:'01110,10011,10101,11001,01110',1:'00100,01100,00100,00100,01110',2:'11110,00001,01110,10000,11111',3:'11110,00001,01110,00001,11110',4:'10010,10010,11111,00010,00010',5:'11111,10000,11110,00001,11110',6:'01110,10000,11110,10001,01110',7:'11111,00001,00010,00100,00100',8:'01110,10001,01110,10001,01110',9:'01110,10001,01111,00001,01110','-':'00000,00000,11111,00000,00000','/':'00001,00010,00100,01000,10000',':':'00000,00100,00000,00100,00000','.':'00000,00000,00000,00000,00100','>':'10000,01000,00100,01000,10000','+':'00100,00100,11111,00100,00100'};
export const pw = (t, s) => { let w = 0; for (const c of t) w += c === ' ' ? 3 * s : 6 * s; return w - s; };
export function px(t, x, y, s, fill, gap = 1) {
  let o = '', cx = x;
  for (const c of t) {
    if (c === ' ') { cx += 3 * s; continue; }
    const g = F[c]; if (!g) { cx += 6 * s; continue; }
    g.split(',').forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '1') o += `<rect x="${cx + i * s}" y="${y + j * s}" width="${s - gap}" height="${s - gap}"/>`; });
    cx += 6 * s;
  }
  return `<g fill="${fill}" shape-rendering="crispEdges">${o}</g>`;
}
// Asymmetric chamfer: top-left and bottom-right corners cut. No curves anywhere.
export const chamfer = (x, y, w, h, c) => `${x + c},${y} ${x + w},${y} ${x + w},${y + h - c} ${x + w - c},${y + h} ${x},${y + h} ${x},${y + c}`;
export const rng = (seed) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
export const reg = (x, y, c = C.dim) => `<path d="M${x - 6} ${y}H${x + 6}M${x} ${y - 6}V${y + 6}" stroke="${c}" stroke-width="1"/>`;
export const defs = (p) => `<defs><pattern id="${p}hz" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="12" fill="${C.amber}"/></pattern><pattern id="${p}sc" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity=".04"/></pattern><filter id="${p}gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
export const STYLE = `<style>.bl{animation:bl 1.2s steps(1) infinite}@keyframes bl{50%{opacity:0}}.fl{animation:fl 5s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-8px)}}.pl{animation:pl 2.4s ease-in-out infinite}@keyframes pl{50%{opacity:.5}}</style>`;
export const wrap = (w, h, p, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="${MONO}">${STYLE}${defs(p)}${body}</svg>`;
export const panel = (w, h, p, c = 18) => `<polygon points="${chamfer(0.5, 0.5, w - 1, h - 1, c)}" fill="${C.panel}" stroke="${C.line}"/><polygon points="${chamfer(0.5, 0.5, w - 1, h - 1, c)}" fill="url(#${p}sc)"/>`;
export const led = (x, y, col, blink = true) => `<rect x="${x}" y="${y}" width="8" height="8" fill="${col}" ${blink ? 'class="bl"' : ''}/>`;
// Topographic contour art (stands in for screenshots).
export function topo(cx, cy, R, seed, n = 7) {
  const r = rng(seed), p1 = r() * 6, p2 = r() * 6, a1 = .16 + r() * .15, a2 = .08 + r() * .1; let o = '';
  for (let k = 1; k <= n; k++) {
    const base = R * k / n; let d = '';
    for (let i = 0; i <= 48; i++) { const t = i / 48 * 2 * Math.PI, rr = base * (1 + a1 * Math.sin(3 * t + p1 + k * .35) + a2 * Math.sin(5 * t + p2 - k * .2)); d += (i ? 'L' : 'M') + (cx + rr * Math.cos(t)).toFixed(1) + ' ' + (cy + rr * Math.sin(t) * .85).toFixed(1); }
    o += `<path d="${d}Z" fill="none" stroke="${k % 2 ? C.amber : C.cyan}" stroke-opacity="${(.22 + .6 * k / n).toFixed(2)}" stroke-width="${k === n ? 1.4 : 1}"/>`;
  }
  return o;
}
