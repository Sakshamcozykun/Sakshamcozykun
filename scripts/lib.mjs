// Shared palette, 5x5 bitmap font and a tiny pixel-grid renderer.
// Everything in assets/ is generated from these helpers (build-assets.mjs / chakra-map.mjs),
// but the output SVGs are plain, commented and hand-editable.
export const P = {
  navy0: '#0a1018', navy: '#0f1722', navy2: '#142031', haze: '#1a2c31', haze2: '#203a36',
  forestD: '#1c3027', forest: '#2d4630', forest2: '#3b5a3a', olive: '#8b9b5a', olive2: '#a7b672', olive3: '#c5d08a',
  cream: '#e9e0c9', beige: '#cfc5a8', beige3: '#a89f85', black: '#0a0c0b',
  orange: '#e9873f', orangeD: '#a8582a', blue: '#4f8cff', slate: '#3a4d6b', slateD: '#223247', slateM: '#2a3b52',
};

const FONT = {A:'01110,10001,11111,10001,10001',B:'11110,10001,11110,10001,11110',C:'01111,10000,10000,10000,01111',D:'11110,10001,10001,10001,11110',E:'11111,10000,11110,10000,11111',F:'11111,10000,11110,10000,10000',G:'01111,10000,10011,10001,01111',H:'10001,10001,11111,10001,10001',I:'11111,00100,00100,00100,11111',J:'00111,00010,00010,10010,01100',K:'10010,10100,11000,10100,10010',L:'10000,10000,10000,10000,11111',M:'10001,11011,10101,10001,10001',N:'10001,11001,10101,10011,10001',O:'01110,10001,10001,10001,01110',P:'11110,10001,11110,10000,10000',Q:'01110,10001,10101,10010,01101',R:'11110,10001,11110,10100,10010',S:'01111,10000,01110,00001,11110',T:'11111,00100,00100,00100,00100',U:'10001,10001,10001,10001,01110',V:'10001,10001,10001,01010,00100',W:'10001,10001,10101,11011,10001',X:'10001,01010,00100,01010,10001',Y:'10001,01010,00100,00100,00100',Z:'11111,00010,00100,01000,11111',0:'01110,10011,10101,11001,01110',1:'00100,01100,00100,00100,01110',2:'11110,00001,01110,10000,11111',3:'11110,00001,01110,00001,11110',4:'10010,10010,11111,00010,00010',5:'11111,10000,11110,00001,11110',6:'01110,10000,11110,10001,01110',7:'11111,00001,00010,00100,00100',8:'01110,10001,01110,10001,01110',9:'01110,10001,01111,00001,01110','-':'00000,00000,11111,00000,00000','/':'00001,00010,00100,01000,10000',':':'00000,00100,00000,00100,00000','.':'00000,00000,00000,00000,00100','>':'10000,01000,00100,01000,10000','+':'00100,00100,11111,00100,00100','_':'00000,00000,00000,00000,11111'};
export const textWidth = (t, s) => t.length * 6 * s - s;
export const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
export const bay = (x, y) => (BAYER[((y % 4) + 4) % 4][((x % 4) + 4) % 4] + .5) / 16;
export const rng = (seed) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Pixel grid: paint cells, then render as merged <path> rects (compact, crisp).
export class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.c = Array.from({ length: h }, () => Array(w).fill(null)); }
  set(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.c[y][x] = c; }
  get(x, y) { return (x >= 0 && y >= 0 && x < this.w && y < this.h) ? this.c[y][x] : null; }
  rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, c); }
  frame(x0, y0, x1, y1, c) { this.rect(x0, y0, x1, y0, c); this.rect(x0, y1, x1, y1, c); this.rect(x0, y0, x0, y1, c); this.rect(x1, y0, x1, y1, c); }
  // rounded rect with corner radius r (in cells, stair-stepped)
  round(x0, y0, x1, y1, r, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const dx = Math.min(x - x0, x1 - x), dy = Math.min(y - y0, y1 - y); if (dx >= r || dy >= r || dx + dy >= r) this.set(x, y, c); } }
  disc(cx, cy, r, c, f) { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if (Math.hypot(x - cx, (y - cy) * 1.1) <= r && (!f || f(x, y))) this.set(x, y, c); }
  text(t, x, y, s, c) { let cx = x; for (const ch of t) { const g = FONT[ch]; if (g) g.split(',').forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === '1') this.rect(cx + i * s, y + j * s, cx + i * s + s - 1, y + j * s + s - 1, c); }); cx += 6 * s; } }
  sprite(rows, x, y, legend) { rows.forEach((r, j) => [...r].forEach((ch, i) => { if (legend[ch]) this.set(x + i, y + j, legend[ch]); })); }
  clearCorners(n = 2) { for (const [cx, cy, bx, by] of [[0, 0, 1, 1], [this.w - 1, 0, -1, 1], [0, this.h - 1, 1, -1], [this.w - 1, this.h - 1, -1, -1]]) for (let dx = 0; dx < n; dx++) for (let dy = 0; dy < n; dy++) if (dx + dy < n) this.set(cx + dx * bx, cy + dy * by, null); }
  render(id) {
    const seen = Array.from({ length: this.h }, () => Array(this.w).fill(false)), by = {};
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const c = this.c[y][x]; if (!c || seen[y][x]) continue;
      let w = 1; while (x + w < this.w && this.c[y][x + w] === c && !seen[y][x + w]) w++;
      let h = 1; outer: while (y + h < this.h) { for (let i = 0; i < w; i++) if (this.c[y + h][x + i] !== c || seen[y + h][x + i]) break outer; h++; }
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) seen[y + j][x + i] = true;
      (by[c] ||= []).push(`M${x} ${y}h${w}v${h}h-${w}z`);
    }
    return `<!-- ${id} -->\n<g id="${id}">` + Object.entries(by).map(([c, d]) => `<path fill="${c}" d="${d.join('')}"/>`).join('') + `</g>\n`;
  }
}
// Creeping vine painter. dir: 'down' | 'up' (vertical) or 'right' | 'left' (horizontal).
export function vine(g, x, y, len, dir, seed, cols = [P.forest2, P.olive, P.olive2]) {
  const r = rng(seed), vert = dir === 'down' || dir === 'up', sg = (dir === 'down' || dir === 'right') ? 1 : -1;
  for (let i = 0; i < len; i++) {
    const w = Math.round(Math.sin(i * .55 + seed)), px = vert ? x + w : x + i * sg, py = vert ? y + i * sg : y + w;
    g.set(px, py, cols[0]);
    if (i % 3 === 1) {
      const s = r() > .5 ? 1 : -1, c = cols[1 + (r() > .6 ? 1 : 0)];
      if (vert) { g.set(px + s, py, c); g.set(px + s * 2, py - 1, c); } else { g.set(px, py + s, c); g.set(px - 1, py + s * 2, c); }
    }
  }
}
export const svgDoc = (w, h, u, title, body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w * u} ${h * u}" width="${w * u}" height="${h * u}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${defs}<g transform="scale(${u})" shape-rendering="crispEdges">\n${body}</g></svg>\n`;
export const blink = (dur = 1) => `<animate attributeName="opacity" values="1;0" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>`;
