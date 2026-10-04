// Generates the static SVG assets. Run: node scripts/build-assets.mjs
// (The chakra map is generated separately by scripts/chakra-map.mjs.)
// Output SVGs are layered, commented and plain, so you can hand-edit them afterwards.
import { writeFileSync, mkdirSync } from 'node:fs';
import { P, Grid, vine, rng, bay, svgDoc, blink } from './lib.mjs';
mkdirSync('assets/labels', { recursive: true });
const out = (n, s) => writeFileSync('assets/' + n, s);

// ============================================================ HERO (300x93 cells, 3px each)
function hero() {
  const W = 300, H = 93, U = 3, R = rng(5), mk = () => new Grid(W, H);
  const sky = mk(), trees = mk(), ground = mk(), desk = mk(), crt = mk(), keys = mk(), chr = mk(), plants = mk(), title = mk(), win = mk(), vines = mk();

  // --- sky: dithered night gradient with a soft glow around the monitor
  const T = [P.navy0, P.navy, P.navy2, P.haze, P.haze2];
  for (let y = 8; y < H; y++) for (let x = 0; x < W; x++) {
    const v = (y - 8) / 85 * 4, i = Math.floor(v); let f = Math.max(0, ((v - i) - .7) / .3);
    let c = T[Math.min(4, i + (bay(x, y) < f ? 1 : 0))];
    const gv = 1 - Math.hypot((x - 232) * .8, y - 46) / 50;
    if (gv > 0) { if (bay(x, y) < gv * .8) c = P.haze2; if (gv > .5 && bay(x, y) < (gv - .5) * 1.7) c = '#2a4a42'; }
    sky.set(x, y, c);
  }
  // --- forest backdrop: trunks + canopy
  for (const [tx, tw] of [[5, 3], [24, 2], [128, 4], [150, 3], [268, 4], [289, 3]]) { trees.rect(tx, 8, tx + tw - 1, 82, P.forestD); trees.rect(tx, 8, tx, 82, P.forest); }
  for (let x = 0; x < W; x++) { const cy = 9 + Math.round(5 * Math.abs(Math.sin(x * .07 + 1)) + 3 * Math.sin(x * .21) + 2); trees.rect(x, 8, x, cy, P.forestD); if (bay(x, cy + 1) < .5) trees.set(x, cy + 1, P.forestD); if (R() < .25) trees.set(x, cy - 1, P.forest); }
  for (const [cx, cy, r] of [[274, 13, 13], [292, 20, 10], [250, 10, 10], [60, 9, 8], [186, 9, 9]]) trees.disc(cx, cy, r, P.forestD), trees.disc(cx - 2, cy - 2, r - 3, P.forest, (x, y) => bay(x, y) < .55);
  for (let i = 0; i < 90; i++) { const x = R() * W | 0, y = 8 + (R() * 14 | 0); if (trees.get(x, y)) trees.set(x, y, R() > .5 ? P.forest2 : P.olive); }

  // --- ground + moss
  ground.rect(0, 81, W - 1, H - 1, P.forestD); ground.rect(0, 81, W - 1, 81, P.forest);
  for (let x = 0; x < W; x++) { if (R() < .22) ground.set(x, 81 + (R() * 3 | 0), P.olive); if (R() < .1) ground.set(x, 80, P.forest2); if (x % 5 === (R() * 5 | 0)) { const h = 2 + (R() * 3 | 0); for (let k = 0; k < h; k++) ground.set(x, 80 - k, k === h - 1 ? P.olive : P.forest2); } }

  // --- desk (right side)
  desk.rect(160, 70, 296, 71, P.cream); desk.rect(160, 71, 296, 71, P.beige); desk.rect(160, 72, 296, 80, P.slateD); desk.rect(160, 72, 296, 72, P.black);
  for (const [a, b, kn] of [[166, 200, P.beige3], [206, 240, P.beige3], [246, 290, P.orange]]) { desk.frame(a, 74, b, 79, P.black); desk.rect(a + 1, 75, b - 1, 78, P.slateM); desk.rect((a + b) / 2 - 2, 76, (a + b) / 2 + 2, 76, kn); }
  for (let x = 258; x < 296; x++) if (R() < .6) desk.set(x, 70, P.olive);
  for (const x of [262, 271, 283, 292]) { const h = 2 + (R() * 4 | 0); for (let k = 0; k < h; k++) desk.set(x, 72 + k, k % 2 ? P.forest2 : P.olive); }

  // --- CRT monitor
  crt.round(210, 16, 254, 20, 2, P.beige3); crt.rect(212, 16, 252, 16, P.cream);
  crt.round(204, 20, 260, 68, 4, P.beige); crt.rect(207, 20, 257, 20, P.cream); crt.rect(204, 23, 204, 65, P.cream); crt.rect(207, 68, 257, 68, P.beige3); crt.rect(260, 23, 260, 65, P.beige3);
  crt.round(209, 25, 255, 61, 4, P.beige3); crt.round(210, 26, 254, 60, 4, '#1a1d1b'); crt.round(212, 28, 252, 58, 3, '#08111f');
  for (let y = 29; y < 58; y += 2) crt.rect(213, y, 251, y, '#0c1a2d');
  const lines = [[31, P.blue, 17], [35, P.olive2, 28], [39, P.olive, 21], [43, P.olive2, 33], [47, P.olive, 12]];
  for (const [ly, col, tot] of lines) { let x = 215, used = 0; while (used < tot) { const sw = 2 + (R() * 6 | 0); crt.rect(x, ly, x + Math.min(sw, tot - used) - 1, ly + 1, col); x += sw + 2; used += sw + 2; } }
  crt.text('>', 215, 50, 1, P.olive2);
  for (let i = 0; i < 7; i++) crt.rect(212 + i * 3, 63, 212 + i * 3, 66, P.beige3);
  crt.rect(236, 63, 244, 65, P.cream); crt.rect(252, 63, 255, 65, P.beige3); crt.rect(212, 69, 252, 69, '#8a8165');
  // cables
  crt.rect(260, 58, 270, 58, P.black); crt.rect(270, 58, 270, 69, P.black); crt.rect(256, 62, 262, 62, P.orange); crt.rect(262, 62, 262, 69, P.orange);
  for (let x = 270; x < 284; x++) desk.set(x, 69, P.black);
  // keyboard (in front of the monitor)
  keys.rect(166, 66, 206, 69, P.beige3); keys.rect(166, 66, 206, 66, P.beige); for (let x = 168; x < 205; x += 3) { keys.rect(x, 67, x + 1, 67, P.cream); keys.rect(x + 1, 69, x + 2, 69, P.cream); }

  // --- character (side view, seated, facing the CRT)
  const ox = 146;
  chr.rect(ox - 1, 60, ox, 72, P.black); chr.rect(ox, 72, ox + 14, 73, P.black); chr.rect(ox + 6, 74, ox + 7, 82, P.black); chr.rect(ox + 1, 83, ox + 12, 84, P.black);   // chair
  chr.rect(ox + 2, 59, ox + 10, 70, P.cream); chr.rect(ox + 10, 59, ox + 10, 70, P.beige); chr.rect(ox + 1, 58, ox + 4, 60, P.cream);                                      // hoodie + hood
  chr.rect(ox + 5, 66, ox + 7, 68, P.beige);                                                                                                                              // pocket
  chr.rect(ox + 3, 49, ox + 11, 57, P.black); chr.rect(ox + 3, 49, ox + 3, 51, null); chr.rect(ox + 8, 52, ox + 12, 57, '#d9b896'); chr.set(ox + 10, 54, P.black); chr.rect(ox + 8, 51, ox + 12, 51, P.black); // hair + face
  chr.rect(ox + 6, 61, ox + 10, 63, P.cream); chr.rect(ox + 9, 64, ox + 19, 66, P.cream); chr.rect(ox + 19, 65, ox + 21, 66, '#d9b896');                                    // arm
  chr.rect(ox + 3, 70, ox + 17, 73, P.slate); chr.rect(ox + 15, 74, ox + 18, 81, P.slate); chr.rect(ox + 15, 82, ox + 21, 83, P.black);                                      // legs

  // --- plants
  const fern = (g, cx, cy, n, sc, cols) => { const ang = [160, 135, 108, 82, 55, 28, 8]; ang.slice(0, n).forEach((a, k) => { const len = (12 + (k % 3) * 3) * sc; for (let t = 0; t < len; t++) { const rad = a * Math.PI / 180, x = cx + Math.cos(rad) * t, y = cy - Math.sin(rad) * t + .035 * t * t; g.set(x, y, cols[0]); if (t % 2 === 0 && t > 2) { g.set(x, y - 1, cols[1]); g.set(x, y + 1, cols[2]); } } }); };
  plants.rect(268, 62, 278, 69, P.orangeD); plants.rect(267, 61, 279, 62, P.orange); plants.rect(268, 70, 278, 70, P.orangeD);
  fern(plants, 273, 60, 7, 1, [P.forest2, P.olive, P.forest]);
  fern(plants, 134, 80, 5, .8, [P.forest2, P.olive, P.forest]);
  for (const [px, py] of [[212, 19], [226, 17], [244, 19], [250, 21]]) for (let k = 0; k < 5; k++) plants.set(px + k, py + (k % 2), P.olive);   // moss on the CRT

  // --- title block
  const ttl = 'SAKSHAM.EXE';
  title.text(ttl, 13, 23, 2, P.forest); title.text(ttl, 12, 22, 2, P.cream); title.rect(12, 34, 44, 34, P.orange);
  title.text('DESIGN / DEVELOP', 12, 40, 1, P.olive2); title.text('EXPLORE / REPEAT', 12, 47, 1, P.olive2);
  title.text('CSE / JIIT NOIDA', 12, 57, 1, P.beige3);
  const pressStart = new Grid(W, H); pressStart.text('> PRESS START', 12, 70, 1, P.cream);

  // --- window chrome (title bar + border)
  win.rect(0, 0, W - 1, 7, P.cream); win.rect(0, 7, W - 1, 7, P.black); win.text('C:/SAKSHAM.EXE', 5, 2, 1, P.navy);
  for (const [bx, kind] of [[270, 'min'], [278, 'max'], [286, 'x']]) { win.frame(bx, 1, bx + 6, 6, P.black); win.rect(bx + 1, 2, bx + 5, 5, P.beige); if (kind === 'min') win.rect(bx + 2, 5, bx + 4, 5, P.black); if (kind === 'max') win.frame(bx + 2, 2, bx + 4, 4, P.black); if (kind === 'x') { win.set(bx + 2, 2, P.black); win.set(bx + 4, 2, P.black); win.set(bx + 3, 3, P.black); win.set(bx + 2, 4, P.black); win.set(bx + 4, 4, P.black); } }
  win.rect(0, 0, W - 1, 0, P.black); win.rect(0, 0, 0, H - 1, P.black); win.rect(W - 1, 0, W - 1, H - 1, P.black); win.rect(0, H - 1, W - 1, H - 1, P.black);

  // --- vines (the forest slowly taking over the interface)
  for (const [x, len, s] of [[240, 16, 1], [247, 34, 2], [254, 28, 3], [258, 14, 4], [266, 12, 5], [281, 9, 6], [70, 7, 7], [93, 5, 8], [118, 8, 9], [186, 10, 10], [200, 9, 11]]) vine(vines, x, 8, len, 'down', s);
  // V2: a denser canopy of hanging vines, creepers up the window frame and leaf clumps on the ground
  for (const [x, len, s] of [[14, 12, 31], [31, 18, 32], [46, 8, 33], [58, 14, 34], [80, 11, 35], [104, 16, 36], [140, 9, 37], [160, 13, 38], [172, 7, 39], [216, 8, 40], [228, 11, 41], [263, 20, 42], [275, 15, 43], [290, 24, 44]]) vine(vines, x, 8, len, 'down', s);
  for (const [x, len, s] of [[2, 30, 45], [297, 28, 46], [291, 14, 47]]) vine(vines, x, 91, len, 'up', s);
  vine(vines, 1, 62, 22, 'right', 48); vine(vines, 150, 80, 24, 'right', 49); vine(vines, 232, 80, 36, 'right', 50);
  for (const [cx, cy, n, s] of [[40, 80, 6, 61], [96, 80, 5, 62], [122, 80, 4, 63], [196, 80, 5, 64], [8, 80, 5, 65]]) { const rr = rng(s); for (let k = 0; k < n * 3; k++) { const lx = cx + Math.round((rr() - .5) * 18), ly = cy - (rr() * 6 | 0); vines.set(lx, ly, k % 3 ? P.olive : P.olive2); vines.set(lx + 1, ly + 1, P.forest2); vines.set(lx - 1, ly + 1, P.forest); } }
  vine(vines, 297, 0, 36, 'down', 12); vine(vines, 296, 4, 20, 'down', 13);
  vine(vines, 3, 92, 20, 'up', 14); vine(vines, 6, 92, 10, 'up', 15);

  for (const g of [sky, trees, ground, desk, crt, keys, chr, plants, title, win, vines]) g.clearCorners(2);
  for (const [cx, cy, bx, by] of [[0, 0, 1, 1], [W - 1, 0, -1, 1], [0, H - 1, 1, -1], [W - 1, H - 1, -1, -1]]) { win.set(cx + 2 * bx, cy, P.black); win.set(cx + bx, cy + by, P.black); win.set(cx, cy + 2 * by, P.black); }

  const extra = `<!-- blinking bits: cursor + power LED -->\n<g id="blinkers"><rect x="222" y="49" width="3" height="5" fill="${P.orange}">${blink(1)}</rect><rect x="247" y="64" width="2" height="2" fill="${P.orange}"><animate attributeName="opacity" values="1;.35;1" dur="2.4s" repeatCount="indefinite"/></rect></g>\n`
    + pressStart.render('press-start').replace('<g id="press-start">', '<g id="press-start">' + blink(1.2));
  const body = [['sky', sky], ['forest-backdrop', trees], ['ground', ground], ['desk', desk], ['crt-monitor', crt], ['keyboard', keys], ['character', chr], ['plants', plants], ['title', title]].map(([n, g]) => g.render(n)).join('')
    + extra + win.render('window-chrome') + vines.render('vines');
  return svgDoc(W, H, U, 'SAKSHAM.EXE: a small pixel scene of a CRT workstation being taken over by a forest', body);
}

// ============================================================ SECTION LABELS (300x12 cells)
function label(n, name) {
  const W = 300, H = 12, g = new Grid(W, H);
  g.rect(0, 0, W - 1, H - 1, P.navy); g.frame(0, 0, W - 1, H - 1, P.forest);
  g.rect(3, 2, 17, 9, P.orange); g.text(n, 5, 4, 1, P.navy0); g.text('/ ' + name, 22, 4, 1, P.cream);
  const x0 = 22 + (name.length + 2) * 6 + 4;
  for (let x = x0; x < W - 26; x += 3) g.set(x, 6, P.forest2);
  // console controls: tiny d-pad + A / B buttons
  g.rect(W - 19, 5, W - 13, 6, P.beige3); g.rect(W - 17, 3, W - 15, 8, P.beige3); g.set(W - 16, 5, P.black);
  g.rect(W - 10, 6, W - 8, 8, P.orange); g.rect(W - 6, 3, W - 4, 5, P.olive);
  g.clearCorners(2);
  return svgDoc(W, H, 3, `${n} / ${name}`, g.render('label'));
}
[['01', 'PROFILE'], ['02', 'PROJECTS'], ['03', 'STACK'], ['04', 'CHAKRA LOG'], ['05', 'CONTACT']].forEach(([n, t]) => writeFileSync(`assets/labels/${n}-${t.toLowerCase().replace(' ', '-')}.svg`, label(n, t)));

// ============================================================ SMALL SPRITES (hand-edit friendly)
{
  const g = new Grid(8, 8);
  g.sprite(['......ff', '....ffoo', '...ffooo', '..ffooo.', '..fooo..', '.fooo...', 'ffoo....', 'f.......'], 0, 0, { f: P.forest2, o: P.olive });
  out('leaf.svg', svgDoc(8, 8, 4, 'leaf', g.render('leaf')));
}
for (const [file, seed, ph] of [['vine.svg', 21, 0]]) {
  // V2 divider: thicker stem, bigger leaves, a few orange berries. Fades out at both ends.
  const g = new Grid(300, 11), r = rng(seed), stem = x => 5 + Math.round(Math.sin(x * .09 + ph) * 1.6 + Math.sin(x * .031 + 1 + ph));
  for (let x = 0; x < 300; x++) { g.set(x, stem(x), P.forest2); if (x % 7 < 3) g.set(x, stem(x) + 1, P.forest); }
  for (let x = 5; x < 296; x += 3 + (r() * 3 | 0)) {
    const y = stem(x), s = r() > .5 ? -1 : 1, c = r() > .4 ? P.olive : P.olive2;
    g.set(x, y + s, P.forest2); g.set(x + 1, y + s * 2, c); g.set(x + 2, y + s * 2, c); g.set(x + 2, y + s * 3, c); g.set(x + 3, y + s * 3, P.olive3); g.set(x, y + s * 2, P.forest);
  }
  for (const bx of [60, 150, 240]) { g.set(bx + ph * 3, stem(bx) - 2, P.orange); g.set(bx + ph * 3 + 1, stem(bx) - 2, P.orangeD); }
  for (let x = 0; x < 300; x++) { const k = Math.min(1, Math.min(x, 299 - x) / 34); if (k < 1 && bay(x, 3) > k) for (let y = 0; y < 11; y++) g.set(x, y, null); }
  out(file, svgDoc(300, 11, 3, 'vine divider', g.render('vine')));
}
{
  const g = new Grid(10, 10);
  g.rect(0, 0, 9, 1, P.beige3); g.rect(0, 0, 1, 9, P.beige3); g.rect(2, 2, 3, 2, P.cream); g.rect(2, 2, 2, 3, P.cream);
  g.sprite(['..o', '.oo', 'ooo'], 6, 6, { o: P.olive }); g.set(5, 7, P.forest2); g.set(7, 5, P.forest2);
  out('corner.svg', svgDoc(10, 10, 4, 'pixel corner bracket with a leaf', g.render('corner')));
}
{
  const g = new Grid(12, 17);
  const rows = ['b...........', 'bb..........', 'bwb.........', 'bwwb........', 'bwwwb.......', 'bwwwwb......', 'bwwwwwb.....', 'bwwwwwwb....', 'bwwwwwwwb...', 'bwwwwwbbbb..', 'bwwbwwb.....', 'bwb.bwwb....', 'bb..bwwb....', 'b....bwwb...', '.....bwwb...', '......bb....', '............'];
  g.sprite(rows, 0, 0, { b: P.black, w: P.cream });
  out('pixel-cursor.svg', svgDoc(12, 17, 3, 'pixel cursor arrow', g.render('cursor')));
}
out('status-dot.svg', svgDoc(5, 5, 4, 'status dot', `<g><path fill="${P.forest}" d="M1 0h3v1h1v3h-1v1h-3v-1h-1v-3h1z"/><path fill="${P.orange}" d="M1 1h3v3h-3z"/><animate attributeName="opacity" values="1;.35;1" dur="2s" repeatCount="indefinite"/></g>`));

// ============================================================ CARTRIDGES
// One art file per project. Real name/description/link live in README.md as text; this is only the label art.
// Add a project: add a row here, run `node scripts/build-assets.mjs`, copy a block in README.md section 02.
const PROJECTS = [
  { file: 'tiles', title: 'TILES PRIVACY', sub: 'LOCAL-FIRST' },
  { file: 'lan-transfer', title: 'LAN BUDDY', sub: 'LOCAL NETWORK' },
  { file: 'food-delivery', title: 'FOOD DELIVERY', sub: 'ORDER TO DOOR' },
  { file: 'sakshamos', title: 'SAKSHAMOS', sub: 'EXPERIMENTAL' },
];
function cartridge(p) {   // every cartridge is the same size and format
  const W = 140, H = 34, g = new Grid(W, H), body = P.beige, shade = P.beige3, hi = P.cream;
  g.round(0, 0, W - 1, H - 1, 3, P.black); g.round(1, 1, W - 2, H - 2, 2, body);
  g.rect(2, 1, W - 3, 1, hi); g.rect(2, H - 2, W - 3, H - 2, shade);
  const nx = W / 2 - 11; g.rect(nx, 0, nx + 21, 2, P.black); g.rect(nx + 1, 1, nx + 20, 1, shade);   // cartridge notch
  const lw = W - 26; g.rect(5, 6, 5 + lw, H - 7, P.navy); g.frame(5, 6, 5 + lw, H - 7, P.black);       // label window
  g.text(p.title, 10, 11, 1, P.cream); g.text(p.sub, 10, 20, 1, P.olive2);
  g.rect(W - 18, H - 13, W - 14, H - 11, P.orange);                                                    // tiny orange pip
  for (let x = W - 20; x < W - 6; x += 3) g.rect(x, 6, x + 1, H - 15, shade);                          // contacts
  g.clearCorners(2);
  return svgDoc(W, H, 3, `${p.title} project cartridge`, g.render('cartridge'));
}
mkdirSync('assets/cartridges', { recursive: true });
for (const p of PROJECTS) out(`cartridges/${p.file}.svg`, cartridge(p));

out('hero.svg', hero());
console.log('built static assets');
