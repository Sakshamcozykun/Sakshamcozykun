// Generates every static asset. Run: node scripts/build.mjs
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { C, FONT, esc, tw, wrap, card, label, chip } from './lib.mjs';
mkdirSync('assets', { recursive: true });

// ---------- header ----------
function header() {
  const W = 900, H = 290;
  const defs = `<clipPath id="hc"><rect width="${W}" height="${H}" rx="28"/></clipPath>
<radialGradient id="g1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.acc}" stop-opacity=".26"/><stop offset="1" stop-color="${C.acc}" stop-opacity="0"/></radialGradient>
<radialGradient id="g2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7c8cff" stop-opacity=".14"/><stop offset="1" stop-color="#7c8cff" stop-opacity="0"/></radialGradient>
<linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.acc}"/><stop offset="1" stop-color="${C.acc2}"/></linearGradient>`;
  let chips = '', cx = 44;
  ['Web', 'Backend', 'DSA', 'Open source', 'UI / UX'].forEach(t => { const c = chip(cx, 224, t); chips += c.svg; cx += c.w + 8; });
  const rows = [['Role', 'Coordinator, OSDC'], ['Organising', 'OSDHack 2026'], ['Building', 'ShareSplit']];
  let info = '';
  rows.forEach(([k, v], i) => {
    const y = 84 + i * 56;
    info += `<text x="620" y="${y}" font-size="11" font-weight="600" fill="${C.dim}" letter-spacing="1.8">${k.toUpperCase()}</text><text x="620" y="${y + 24}" font-size="17" fill="${C.txt}">${esc(v)}</text>`;
    if (i < 2) info += `<path d="M620 ${y + 38}H836" stroke="${C.line}"/>`;
  });
  return wrap(W, H,
    `<g clip-path="url(#hc)"><rect width="${W}" height="${H}" fill="${C.card}"/><circle cx="800" cy="30" r="250" fill="url(#g1)"/><circle cx="40" cy="300" r="220" fill="url(#g2)"/></g>${card(W, H)}`
    + `<rect x="44" y="40" width="52" height="52" rx="17" fill="url(#mg)"/><text x="70" y="76" font-size="28" font-weight="700" fill="${C.ink}" text-anchor="middle">S</text>`
    + `<text x="112" y="72" font-size="15" fill="${C.dim}">@Sakshamcozykun</text><text x="112" y="92" font-size="12" fill="${C.dim}" opacity=".7">Learning. Shipping. Breaking things.</text>`
    + `<text x="42" y="164" font-size="52" font-weight="700" fill="${C.txt}" letter-spacing="-1.2">Saksham Gupta</text>`
    + `<text x="44" y="198" font-size="18" fill="${C.sub}">B.Tech CSE at JIIT Noida <tspan fill="${C.acc}">·</tspan> Class of 2028</text>` + chips
    + `<rect x="596" y="40" width="264" height="210" rx="22" fill="${C.card2}" stroke="${C.line}"/>` + info, defs);
}

// ---------- stack ----------
function stack() {
  const W = 900, H = 120, items = [['C++', '#e8718d'], ['Python', '#6fa8dc'], ['JavaScript', '#f0d264'], ['TypeScript', '#5b9bd5'], ['HTML', '#e8825a'], ['CSS', '#9b8cf0'], ['PHP', '#8d93c9']];
  const cs = items.map(([t, d]) => chip(0, 0, t, { s: 15, h: 38, p: 18, dot: d }));
  const total = cs.reduce((a, c) => a + c.w, 0), gap = (W - 72 - total) / (items.length - 1);
  let x = 36, o = '';
  items.forEach(([t, d], i) => { o += chip(Math.round(x), 60, t, { s: 15, h: 38, p: 18, dot: d }).svg; x += cs[i].w + gap; });
  return wrap(W, H, card(W, H, 24) + label(36, 38, 'Stack') + o);
}

// ---------- projects arc ----------
const PROJ = [
  ['Classroom-DL', 'Chrome extension', ['#f6b26b', '#e8735a']],
  ['Beauty Finder', 'AI product recommender', ['#e0a3cb', '#7b5ea7']],
  ['FakeJobPosting', 'Fake job detection', ['#8db8ff', '#4a5bd0']],
  ['ShareSplit', 'Currently building', ['#93d7bb', '#3a8f8a']],
  ['Tiles', 'Open-source contribution', ['#f2d594', '#c98a4b']],
  ['Kabadiwala', 'Collaboration', ['#aeb8da', '#5a6488']],
];
function projects() {
  const W = 900, H = 520, n = PROJ.length, S = 108;
  let defs = `<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>`, t = '';
  PROJ.forEach(([name, tag, [a, b]], i) => {
    const ang = Math.PI * (1 - i / (n - 1)), x = 450 + 340 * Math.cos(ang), y = 400 - 290 * Math.sin(ang), rot = (i / (n - 1) - .5) * 48;
    defs += `<linearGradient id="t${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><clipPath id="tc${i}"><rect x="${-S / 2}" y="${-S / 2}" width="${S}" height="${S}" rx="30"/></clipPath>`;
    t += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><g class="fl" style="animation-delay:-${(i * 1.1).toFixed(1)}s">`
      + `<g transform="rotate(${rot.toFixed(0)})"><g clip-path="url(#tc${i})"><rect x="${-S / 2}" y="${-S / 2}" width="${S}" height="${S}" fill="url(#t${i})"/>`
      + `<circle cx="-22" cy="-26" r="30" fill="#fff" opacity=".4" filter="url(#bl)"/><circle cx="30" cy="34" r="34" fill="#000" opacity=".28" filter="url(#bl)"/></g>`
      + `<rect x="${-S / 2 + .5}" y="${-S / 2 + .5}" width="${S - 1}" height="${S - 1}" rx="30" fill="none" stroke="#fff" stroke-opacity=".18"/>`
      + `<text x="${-S / 2 + 18}" y="${S / 2 - 16}" font-size="14" font-weight="700" fill="#fff" fill-opacity=".85">0${i + 1}</text></g>`
      + `<text y="${S / 2 + 26}" text-anchor="middle" font-size="14" font-weight="600" fill="${C.txt}">${esc(name)}</text><text y="${S / 2 + 45}" text-anchor="middle" font-size="12" fill="${C.dim}">${esc(tag)}</text></g></g>`;
  });
  const bw = 232;
  return wrap(W, H, card(W, H) + label(36, 44, 'Projects') + t
    + `<text x="450" y="268" text-anchor="middle" font-size="36" font-weight="700" fill="${C.txt}" letter-spacing="-.6">Selected work</text>`
    + `<text x="450" y="300" text-anchor="middle" font-size="15" fill="${C.dim}">Six projects across web, backend and AI.</text>`
    + `<rect x="${450 - bw / 2}" y="326" width="${bw}" height="42" rx="21" fill="${C.txt}"/><text x="450" y="352" text-anchor="middle" font-size="14" font-weight="600" fill="${C.card}">View all repositories</text>`, defs);
}

// ---------- featured ----------
function featured() {
  const W = 900, H = 300, LW = 580, RX = 596, RW = 304;
  const defs = `<clipPath id="lc"><rect width="${LW}" height="${H}" rx="28"/></clipPath><filter id="bg" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="42"/></filter>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#0e1015" stop-opacity="0"/><stop offset="1" stop-color="#0e1015" stop-opacity=".85"/></linearGradient>
<linearGradient id="ra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.acc}"/><stop offset="1" stop-color="${C.acc2}"/></linearGradient>`;
  let ch = '', cx = 32;
  ['Chrome extension', 'Multi-account', 'Format conversion'].forEach(t => { const c = chip(cx, 28, t, { s: 12, h: 28, fill: 'rgba(255,255,255,.08)', stroke: 'rgba(255,255,255,.16)', color: C.txt }); ch += c.svg; cx += c.w + 8; });
  const desc = ['Bulk download Google Classroom', 'attachments in one go. Works', 'across multiple accounts, with', 'native format conversion.'];
  const bw = 208;
  return wrap(W, H,
    `<g clip-path="url(#lc)"><rect width="${LW}" height="${H}" fill="#0e1015"/><circle cx="470" cy="70" r="150" fill="${C.acc}" opacity=".5" filter="url(#bg)"/><circle cx="260" cy="270" r="130" fill="#7b5ea7" opacity=".42" filter="url(#bg)"/><circle cx="60" cy="20" r="100" fill="#4a5bd0" opacity=".3" filter="url(#bg)"/><rect width="${LW}" height="${H}" fill="url(#fade)"/></g>`
    + `<rect x=".5" y=".5" width="${LW - 1}" height="${H - 1}" rx="28" fill="none" stroke="${C.line}"/>` + ch
    + `<text x="32" y="188" font-size="56" font-weight="700" fill="#fff" letter-spacing="-1.4">Classroom-DL</text>`
    + `<text x="34" y="222" font-size="18" fill="#fff" fill-opacity=".78">Bulk downloader for Google Classroom</text>`
    + `<circle cx="38" cy="266" r="5" fill="#f0d264"/><text x="52" y="271" font-size="14" fill="${C.sub}">JavaScript  ·  Public repository</text>`
    + `<rect x="${RX}" width="${RW}" height="${H}" rx="28" fill="url(#ra)"/>`
    + `<text x="${RX + 28}" y="46" font-size="11" font-weight="700" fill="${C.ink}" fill-opacity=".7" letter-spacing="2">FEATURED</text>`
    + `<text x="${RX + 28}" y="82" font-size="26" font-weight="700" fill="${C.ink}" letter-spacing="-.4">Classroom-DL</text>`
    + desc.map((l, i) => `<text x="${RX + 28}" y="${116 + i * 22}" font-size="14.5" fill="${C.ink}" fill-opacity=".85">${l}</text>`).join('')
    + `<rect x="${RX + 28}" y="224" width="${bw}" height="46" rx="23" fill="${C.ink}"/><text x="${RX + 28 + bw / 2}" y="252" text-anchor="middle" font-size="14" font-weight="600" fill="#fff">View repository  →</text>`, defs);
}

const A = { 'header.svg': header(), 'stack.svg': stack(), 'projects.svg': projects(), 'featured.svg': featured() };
for (const k in A) writeFileSync('assets/' + k, A[k]);

// ---------- preview page (mirrors README on a GitHub-dark surface) ----------
const cm = existsSync('assets/commit-map.svg') ? readFileSync('assets/commit-map.svg', 'utf8') : '';
const L = (t) => `<a href="#">${t}</a>`;
writeFileSync('preview.html', `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Profile preview</title><style>body{margin:0;background:#010409;color:#c9d1d9;font:14px system-ui}.gh{max-width:860px;margin:20px auto;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:24px;text-align:center}svg{display:block;width:100%;height:auto;margin:14px 0}a{color:#58a6ff;text-decoration:none}p{margin:18px 0}</style></head><body><div class="gh">${A['header.svg']}<img src="assets/scene.gif" style="width:100%;display:block;margin:14px 0">${A['stack.svg']}${A['projects.svg']}<p>${['Classroom-DL', 'Beauty Finder', 'FakeJobPosting', 'ShareSplit', 'Tiles', 'Kabadiwala'].map(L).join(' &nbsp;·&nbsp; ')}</p>${A['featured.svg']}${cm}<p>${['Projects', 'OSDC', 'Design work', 'LinkedIn', 'Email'].map(L).join(' &nbsp;·&nbsp; ')}</p></div></body></html>`);
console.log('built', Object.keys(A).length, 'assets');
