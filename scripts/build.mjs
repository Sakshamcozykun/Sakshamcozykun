// Generates every static asset. Run: node scripts/build.mjs
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { C, MONO, px, pw, chamfer, rng, reg, wrap, panel, led, topo } from './lib.mjs';
const out = (n, s) => writeFileSync('assets/' + n, s);
mkdirSync('assets', { recursive: true });

// ---------- header ----------
function header() {
  const p = 'hd', W = 900, H = 190, name = 'SAKSHAM GUPTA', s = 9, x = 30, y = 56, r = rng(3); let bar = '', bx = 716;
  while (bx < 868) { const w = 1 + (r() * 3 | 0); if (r() > .3) bar += `<rect x="${bx}" y="150" width="${w}" height="26" fill="${C.dim}"/>`; bx += w + 2; }
  return wrap(W, H, p, panel(W, H, p, 24) + reg(14, 14) + reg(886, 176)
    + `<text x="30" y="34" font-size="11" fill="${C.dim}" letter-spacing="3">// OPERATOR PROFILE</text><text x="840" y="34" font-size="11" fill="${C.dim}" text-anchor="end" letter-spacing="2">UNIT SK-2028 / REV 5.0</text>${led(852, 26, C.green)}<text x="866" y="34" font-size="11" fill="${C.green}">ON</text>`
    + `<g opacity=".6" transform="translate(4 3)">${px(name, x, y, s, C.cyan)}</g><g filter="url(#${p}gl)">${px(name, x, y, s, C.amber)}</g>`
    + `<clipPath id="${p}c"><rect x="0" y="${y + 14}" width="${W}" height="9"/></clipPath><g clip-path="url(#${p}c)"><g><animateTransform attributeName="transform" type="translate" values="0 0;10 0;-8 0;0 0;0 0" keyTimes="0;.03;.06;.09;1" dur="5s" repeatCount="indefinite"/>${px(name, x, y, s, C.cyan)}</g></g>`
    + `<text x="30" y="132" font-size="14" fill="${C.txt}" letter-spacing="1">B.TECH CSE <tspan fill="${C.amber}">//</tspan> JIIT NOIDA <tspan fill="${C.amber}">//</tspan> CLASS OF 2028 <tspan fill="${C.amber}">//</tspan> OSDC COORDINATOR</text>`
    + `<rect x="30" y="152" width="620" height="10" fill="url(#${p}hz)"/>${bar}<text x="716" y="184" font-size="9" fill="${C.dim}">SKG-0X1A-2028</text>`);
}

// ---------- boot terminal (SMIL typing, works inside <img>) ----------
function boot() {
  const p = 'bt', W = 900, H = 250;
  const L = [['> whoami', 'c'], ['saksham_gupta // cse undergrad @ jiit noida', 't'], ['> ls ./focus', 'c'], ['web  backend  c++  python  dsa  open-source  ui/ux', 't'], ['> cat now.txt', 'c'], ['building ./sharesplit   contributing @ tilesprivacy   organizing osdhack-2026', 't'], ['> ./connect --open', 'c']];
  let t = 0, o = '';
  L.forEach(([s, k], i) => {
    const n = s.length, cw = 9.6, y = 72 + i * 25, dur = Math.max(.5, n * .035), vals = Array.from({ length: n + 1 }, (_, j) => (j * cw).toFixed(1)).join(';');
    o += `<clipPath id="${p}${i}"><rect x="32" y="${y - 16}" height="22" width="0"><animate attributeName="width" values="${vals}" calcMode="discrete" dur="${dur.toFixed(2)}s" begin="${t.toFixed(2)}s" fill="freeze"/></rect></clipPath><text x="32" y="${y}" font-size="16" fill="${k === 'c' ? C.amber : C.txt}" clip-path="url(#${p}${i})" xml:space="preserve">${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
    t += dur + .25;
    if (i === L.length - 1) o += `<rect x="${(32 + n * cw + 4).toFixed(1)}" y="${y - 14}" width="9" height="17" fill="${C.amber}" visibility="hidden"><set attributeName="visibility" to="visible" begin="${t.toFixed(2)}s"/><animate attributeName="opacity" values="1;0" dur="1s" calcMode="discrete" repeatCount="indefinite" begin="${t.toFixed(2)}s"/></rect>`;
  });
  return wrap(W, H, p, panel(W, H, p, 18) + `<rect x="1" y="1" width="898" height="28" fill="${C.panel2}"/><text x="32" y="20" font-size="11" fill="${C.dim}" letter-spacing="2">TTY0 // /DEV/SAKSHAM</text>`
    + [0, 1, 2].map(i => `<rect x="${812 + i * 24}" y="8" width="14" height="14" fill="none" stroke="${C.dim}"/>`).join('') + `<path d="M815 17H823M836 10V20M852 11L862 21M862 11L852 21" stroke="${C.dim}"/>`
    + o + `<path d="M1 29H899" stroke="${C.line}"/>`);
}

// ---------- spec sheet ----------
function spec() {
  const p = 'sp', W = 900, rows = [['OPERATOR', 'Saksham Gupta'], ['UNIT', 'B.Tech CSE / JIIT Noida / Class of 2028'], ['ROLE', 'Coordinator, OSDC (Open Source Developer Community)'], ['FOCUS', 'Web dev / backend / DSA / open source / UI-UX'], ['LOADING', 'OSDHack 2026 // On Device AI'], ['STATUS', 'Learning. Shipping. Breaking things.']], H = 76 + rows.length * 30;
  let o = ''; rows.forEach(([k, v], i) => { const y = 74 + i * 30; o += `<text x="40" y="${y}" font-size="11" fill="${C.amber}">0${i + 1}</text><text x="70" y="${y}" font-size="14" fill="${C.dim}" letter-spacing="2">${k}</text><path d="M${70 + k.length * 10 + 10} ${y - 4}H228" stroke="${C.line}" stroke-dasharray="2 4"/><text x="244" y="${y}" font-size="15" fill="${C.txt}">${v}</text>`; });
  return wrap(W, H, p, panel(W, H, p, 20) + `<rect x="0" y="40" width="4" height="${H - 80}" fill="${C.amber}"/><text x="40" y="34" font-size="11" fill="${C.dim}" letter-spacing="3">SPEC SHEET // REV 5.0</text><rect x="826" y="22" width="46" height="10" fill="url(#${p}hz)"/>` + o + reg(886, H - 14));
}

// ---------- section header ----------
function hdr(n, label) {
  const p = 'h' + n, W = 900, H = 44, lx = 66, ex = lx + pw(label, 5) + 18; let tk = '';
  for (let x = ex; x < 900; x += 10) tk += `<path d="M${x} 28v${((x - ex) / 10) % 5 === 0 ? -9 : -4}" stroke="${C.dim}" opacity="${(1 - (x - ex) / (900 - ex) * .7).toFixed(2)}"/>`;
  return wrap(W, H, p, `<rect x="0" y="4" width="52" height="34" fill="${C.amber}"/>${px('0' + n, 4, 12, 4, C.bg)}${px(label, lx, 9, 5, C.txt)}<path d="M${ex} 28H900" stroke="${C.line}"/>${tk}<text x="896" y="14" font-size="10" fill="${C.dim}" text-anchor="end" letter-spacing="2">SEC.0${n}</text>`);
}

// ---------- stack ----------
function stack() {
  const p = 'st', W = 900, H = 118, items = ['C++', 'PYTHON', 'JS', 'TS', 'HTML', 'CSS', 'PHP']; let o = '';
  items.forEach((t, i) => { const x = 16 + i * 125; o += `<polygon points="${chamfer(x, 22, 113, 78, 12)}" fill="${C.panel2}" stroke="${C.line}"/><rect x="${x}" y="22" width="113" height="3" fill="${i % 2 ? C.cyan : C.amber}"/><text x="${x + 12}" y="44" font-size="9" fill="${C.dim}">M0${i + 1}</text>${led(x + 93, 36, C.green, i % 3 === 0)}<text x="${x + 12}" y="82" font-size="18" font-weight="bold" fill="${C.txt}">${t}</text>`; });
  return wrap(W, H, p, o + `<text x="16" y="14" font-size="10" fill="${C.dim}" letter-spacing="3">LOADED MODULES</text>`);
}

// ---------- project arc ----------
const PROJ = ['CLASSROOM-DL', 'BEAUTY-FINDER', 'FAKEJOBPOSTING', 'SHARESPLIT', 'TILES', 'KABADIWALA'];
function arc() {
  const p = 'ar', W = 900, H = 500, n = PROJ.length; let t = '';
  PROJ.forEach((name, i) => {
    const a = Math.PI * (1 - i / (n - 1)), x = 450 + 340 * Math.cos(a), y = 395 - 310 * Math.sin(a), rot = ((i / (n - 1)) - .5) * 44;
    t += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${rot.toFixed(0)})"><g class="fl" style="animation-delay:-${(i * .8).toFixed(1)}s"><clipPath id="${p}c${i}"><polygon points="${chamfer(-60, -60, 120, 120, 16)}"/></clipPath><polygon points="${chamfer(-60, -60, 120, 120, 16)}" fill="#0b0d0f"/><g clip-path="url(#${p}c${i})"><rect x="-60" y="-60" width="120" height="120" fill="url(#${p}sc)"/>${topo(0, 0, 58, 11 + i * 7)}<path d="M-8 0H8M0 -8V8" stroke="${C.txt}" opacity=".7"/></g><polygon points="${chamfer(-60, -60, 120, 120, 16)}" fill="none" stroke="${i % 2 ? C.cyan : C.amber}" stroke-opacity=".7"/><text x="-50" y="-44" font-size="11" fill="${C.amber}">0${i + 1}</text><text y="82" text-anchor="middle" font-size="12" fill="${C.txt}" letter-spacing="1">${name}</text></g></g>`;
  });
  const title = 'BUILD LOG';
  return wrap(W, H, p, panel(W, H, p, 24) + `<path d="M110 395A340 310 0 0 1 790 395" fill="none" stroke="${C.line}" stroke-dasharray="3 7"/>` + reg(14, 14) + reg(886, 486)
    + `<text x="30" y="34" font-size="11" fill="${C.dim}" letter-spacing="3">// PROJECT INDEX</text>` + t
    + px(title, 450 - pw(title, 7) / 2, 232, 7, C.amber).replace('<g ', `<g filter="url(#${p}gl)" `)
    + `<text x="450" y="300" text-anchor="middle" font-size="13" fill="${C.dim}" letter-spacing="2">6 MODULES ONLINE // SELECT TARGET BELOW</text><polygon points="${chamfer(345, 322, 210, 34, 8)}" fill="none" stroke="${C.amber}"/><text x="450" y="344" text-anchor="middle" font-size="13" fill="${C.amber}" letter-spacing="2" class="pl">[ OPEN REPOSITORIES ]</text>`);
}

// ---------- featured ----------
function featured() {
  const p = 'ft', W = 720, H = 300, chips = ['MULTI-ACCOUNT', 'FORMAT CONVERSION'];
  let ch = '', cx = 26; chips.forEach(c => { const w = c.length * 7.2 + 16; ch += `<polygon points="${chamfer(cx, 24, w, 24, 6)}" fill="#000" fill-opacity=".45" stroke="${C.amber}" stroke-opacity=".6"/><text x="${cx + 8}" y="40" font-size="10" fill="${C.txt}">${c}</text>`; cx += w + 8; });
  return wrap(W, H, p, `<clipPath id="${p}b"><polygon points="${chamfer(0, 0, 470, 300, 22)}"/></clipPath><linearGradient id="${p}o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.amber}"/><stop offset="1" stop-color="${C.amber2}"/></linearGradient>`
    + `<polygon points="${chamfer(0, 0, 470, 300, 22)}" fill="#0b0d0f"/><g clip-path="url(#${p}b)"><rect width="470" height="300" fill="url(#${p}sc)"/>${topo(330, 150, 190, 5, 11)}<rect y="214" width="470" height="86" fill="#0b0d0f" opacity=".72"/></g><polygon points="${chamfer(0.5, 0.5, 469, 299, 22)}" fill="none" stroke="${C.line}"/>` + ch
    + `<g opacity=".5" transform="translate(3 3)">${px('CLASSROOM', 26, 104, 7, C.cyan)}</g>${px('CLASSROOM', 26, 104, 7, '#fff')}<text x="26" y="170" font-size="14" fill="${C.amber}" letter-spacing="3">BULK DOWNLOADER // CHROME EXT</text><text x="26" y="250" font-size="12" fill="${C.txt}">LANG: JAVASCRIPT</text><text x="26" y="272" font-size="12" fill="${C.dim}">STARS 09   FORKS 02   PUBLIC</text>`
    + `<polygon points="${chamfer(486, 0, 234, 300, 22)}" fill="url(#${p}o)"/><rect x="486" y="0" width="234" height="10" fill="url(#${p}hz)" opacity=".35"/><text x="506" y="46" font-size="20" font-weight="bold" fill="${C.bg}">CLASSROOM-DL</text><text x="506" y="72" font-size="12" fill="${C.bg}">Bulk download Google</text><text x="506" y="88" font-size="12" fill="${C.bg}">Classroom attachments.</text><text x="506" y="104" font-size="12" fill="${C.bg}">Multi-account, native</text><text x="506" y="120" font-size="12" fill="${C.bg}">format conversion.</text>`
    + `<text x="506" y="214" font-size="11" fill="${C.bg}" letter-spacing="1">STATUS // AVAILABLE</text><polygon class="pl" points="${chamfer(506, 228, 194, 40, 10)}" fill="${C.bg}"/><text x="603" y="253" text-anchor="middle" font-size="14" font-weight="bold" fill="${C.amber}" letter-spacing="2">VIEW REPO &gt;</text>`);
}

// ---------- footer ----------
function footer() {
  const p = 'ft2', W = 900, H = 56, r = rng(9); let bar = '', bx = 340;
  while (bx < 560) { const w = 1 + (r() * 3 | 0); if (r() > .3) bar += `<rect x="${bx}" y="14" width="${w}" height="28" fill="${C.dim}"/>`; bx += w + 2; }
  return wrap(W, H, p, `<rect x="0" y="22" width="300" height="12" fill="url(#${p}hz)"/><rect x="600" y="22" width="300" height="12" fill="url(#${p}hz)"/>${bar}<text x="450" y="52" text-anchor="middle" font-size="9" fill="${C.dim}" letter-spacing="3">END OF TRANSMISSION</text>`);
}

const A = { 'header.svg': header(), 'boot.svg': boot(), 'spec.svg': spec(), 'h-spec.svg': hdr(1, 'SPEC SHEET'), 'h-stack.svg': hdr(2, 'LOADOUT'), 'stack.svg': stack(), 'h-projects.svg': hdr(3, 'PROJECTS'), 'arc.svg': arc(), 'h-featured.svg': hdr(4, 'FEATURED'), 'featured.svg': featured(), 'h-telemetry.svg': hdr(5, 'TELEMETRY'), 'h-connect.svg': hdr(6, 'CONNECT'), 'footer.svg': footer() };
for (const k in A) out(k, A[k]);

// ---------- preview page (mirrors README) ----------
const cm = readFileSync('assets/commit-map.svg', 'utf8'), U = 'https://github.com/Sakshamcozykun/';
const links = [['CLASSROOM-DL', 'GoogleClasroom-Bulk-downloader'], ['BEAUTY-FINDER', '-Beauty-Finder-AI-Powered-Product-Recommendation-Tool'], ['FAKEJOBPOSTING', 'fakejobposting-'], ['SHARESPLIT', 'ShareSplit'], ['TILES', 'tiles'], ['KABADIWALA', 'Kabadiwala']].map(([n, r], i) => `<td>0${i + 1} <a href="#">${n}</a></td>`);
writeFileSync('preview.html', `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Profile preview</title><style>body{margin:0;background:#010409;color:#c9d1d9;font:14px system-ui}.gh{max-width:860px;margin:20px auto;background:#0d1117;border:1px solid #30363d;padding:24px;overflow-x:auto}svg{display:block;width:100%;min-width:600px;height:auto;margin:10px 0}table{border-collapse:collapse;width:100%;min-width:600px}td{padding:8px;vertical-align:top;border:1px solid #30363d}a{color:#58a6ff}.row{display:flex;gap:14px;min-width:600px}nav{width:150px;line-height:2.4}</style></head><body><div class="gh">${A['header.svg']}${A['boot.svg']}${A['h-spec.svg']}${A['spec.svg']}${A['h-stack.svg']}${A['stack.svg']}${A['h-projects.svg']}${A['arc.svg']}<table><tr>${links.slice(0, 3).join('')}</tr><tr>${links.slice(3).join('')}</tr></table>${A['h-featured.svg']}<div class="row"><nav><b>&#9656; <a href="#">Projects</a></b><br><a href="#">OSDC</a><br><a href="#">Design work</a><br><a href="#">Contact</a></nav><div style="flex:1">${A['featured.svg']}</div></div>${A['h-telemetry.svg']}${cm}${A['h-connect.svg']}<p><a href="#">LinkedIn</a> / <a href="#">Email</a></p>${A['footer.svg']}</div></body></html>`);
console.log('built', Object.keys(A).length, 'assets');
