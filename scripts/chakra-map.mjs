// CHAKRA LOG generator: real GitHub contributions -> assets/chakra-map.svg
// Usage: node scripts/chakra-map.mjs [--mock]      (run by .github/workflows/update-chakra-map.yml)
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { P, Grid, vine, rng, textWidth, svgDoc, esc } from './lib.mjs';

const LV = ['#1b2733', P.forest, '#55723f', P.olive, P.olive3];   // LOW -> HIGH chakra
const PEAK = P.orange;                                             // the very best days
// Original pixel runner (2 frames): hooded wanderer with an orange scarf. h=hood s=skin e=eye r=scarf w=cloth b=boots
const SPR = { h: P.olive, s: '#e5cdb0', e: P.black, r: P.orange, w: P.cream, b: P.forest2 };
const FR = [
  ['...hhhhhh...', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hhsssssshh.', '.hsessssesh.', '.hhsssssshh.', '..hhssssh...', 'rr.rrrrrr...', '.rrwwwwww...', '...wwwwww...', '...wwwwwss..', '..bb...bb...', '.bb.....bb..'],
  ['...hhhhhh...', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hhsssssshh.', '.hsessssesh.', '.hhsssssshh.', '..hhssssh...', '.rrrrrrrr...', 'rr.wwwwww...', '...wwwwww...', '..ss.wwww...', '....bbbb....', '....bb.bb...'],
];

export function mockWeeks() {
  const r = rng(42), end = new Date(), start = new Date(end); start.setUTCDate(end.getUTCDate() - 364 - end.getUTCDay());
  const weeks = []; let cur = null, d = new Date(start), hot = 0;
  while (d <= end) {
    if (d.getUTCDay() === 0 || !cur) { cur = { contributionDays: [] }; weeks.push(cur); }
    if (r() < .03) hot = 4 + (r() * 8 | 0);
    const on = hot > 0 || r() < .12; if (hot > 0) hot--;
    cur.contributionDays.push({ date: d.toISOString().slice(0, 10), weekday: d.getUTCDay(), contributionCount: on ? 1 + (r() * r() * 9 | 0) : 0 });
    d = new Date(d.getTime() + 864e5);
  }
  return weeks;
}

export function render(weeks, meta = {}) {
  const W = 300, H = 121, U = 3, X0 = 24, Y0 = 36, PITCH = 5, days = weeks.flatMap(w => w.contributionDays);
  const total = days.reduce((a, d) => a + d.contributionCount, 0), max = Math.max(1, ...days.map(d => d.contributionCount));
  const lvl = c => c === 0 ? 0 : Math.min(4, Math.ceil(c / max * 4));
  let longest = 0, run = 0; for (const d of days) { run = d.contributionCount > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let cur = 0, i = days.length - 1; if (i >= 0 && days[i].contributionCount === 0) i--; for (; i >= 0 && days[i].contributionCount > 0; i--) cur++;
  const best = days.reduce((a, d) => d.contributionCount > a.contributionCount ? d : a, days[0]);

  // card + border
  const card = new Grid(W, H);
  card.rect(0, 0, W - 1, H - 1, P.navy); card.frame(0, 0, W - 1, H - 1, P.forest); card.frame(2, 2, W - 3, H - 3, P.navy2); card.clearCorners(2);
  for (const [cx, cy, bx, by] of [[0, 0, 1, 1], [W - 1, 0, -1, 1], [0, H - 1, 1, -1], [W - 1, H - 1, -1, -1]]) { card.set(cx + 2 * bx, cy, P.forest); card.set(cx + bx, cy + by, P.forest); card.set(cx, cy + 2 * by, P.forest); }

  // text + sprites
  const t = new Grid(W, H);
  t.sprite(['......ff', '....ffoo', '...ffooo', '..ffooo.', '..fooo..', '.fooo...', 'ffoo....', 'f.......'], 8, 5, { f: P.forest2, o: P.olive });
  t.text('LAST 365 DAYS', 20, 4, 2, P.cream);
  const tag = meta.mock ? 'SAMPLE DATA' : 'SYNC ' + (meta.sync || new Date().toISOString().slice(0, 10));
  t.text(tag, W - 8 - textWidth(tag, 1), 6, 1, meta.mock ? P.orange : P.beige3);
  ['M', 'W', 'F'].forEach((d, k) => t.text(d, 10, Y0 + (k * 2 + 1) * PITCH, 1, P.beige3));

  // heatmap
  const cells = new Grid(W, H); let lastM = -1, lastWi = -9;
  weeks.forEach((w, wi) => {
    const m = new Date(w.contributionDays[0].date + 'T00:00:00Z').getUTCMonth();
    if (m !== lastM && wi < weeks.length - 2 && wi - lastWi >= 4) { t.text(['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][m], X0 + wi * PITCH, 29, 1, P.beige3); lastM = m; lastWi = wi; }
    w.contributionDays.forEach(d => { const l = lvl(d.contributionCount), c = (l === 4 && d.contributionCount >= max * .85) ? PEAK : LV[l]; cells.rect(X0 + wi * PITCH, Y0 + d.weekday * PITCH, X0 + wi * PITCH + 3, Y0 + d.weekday * PITCH + 3, c); });
  });

  // legend
  const lg = new Grid(W, H), ly = 76; lg.text('LOW CHAKRA', 24, ly, 1, P.beige3);
  const lx = 24 + textWidth('LOW CHAKRA', 1) + 6; [...LV, PEAK].forEach((c, k) => lg.rect(lx + k * 6, ly, lx + k * 6 + 3, ly + 4, c));
  lg.text('HIGH CHAKRA', lx + 6 * 6 + 2, ly, 1, P.beige3);

  // stats (numbers big, labels small)
  const st = new Grid(W, H), stats = [[total, 'THIS YEAR'], [cur, 'STREAK NOW'], [longest, 'LONGEST'], [best.contributionCount, 'BEST DAY']];
  st.rect(8, 87, W - 9, 87, P.navy2);
  stats.forEach(([n, l], k) => { const x = 10 + k * 74; st.text(String(n), x, 92, 3, k === 0 ? P.olive3 : P.cream); st.text(l, x, 110, 1, P.beige3); });

  // runner + drifting leaves (SMIL)
  const rects = rows => rows.map((r, y) => [...r].map((c, x) => c === '.' ? '' : `<rect x="${x}" y="${y}" width="1" height="1" fill="${SPR[c]}"/>`).join('')).join('');
  const track = W - 8 - 14;
  const runner = `<!-- runner -->\n<g id="runner"><animateTransform attributeName="transform" type="translate" values="${X0} 15;${track} 15" dur="20s" repeatCount="indefinite"/>`
    + `<g><animate attributeName="visibility" values="visible;hidden" dur=".5s" calcMode="discrete" repeatCount="indefinite"/>${rects(FR[0])}</g>`
    + `<g visibility="hidden"><animate attributeName="visibility" values="hidden;visible" dur=".5s" calcMode="discrete" repeatCount="indefinite"/>${rects(FR[1])}</g></g>\n`;
  const r = rng(11); let leaves = '<!-- drifting leaves -->\n';
  for (let k = 0; k < 7; k++) { const x = 30 + r() * 250, d = (10 + r() * 8).toFixed(1), dl = (-r() * 12).toFixed(1); leaves += `<g opacity=".8"><animateTransform attributeName="transform" type="translate" values="${x.toFixed(0)} 30;${(x - 24).toFixed(0)} ${H - 6}" dur="${d}s" begin="${dl}s" repeatCount="indefinite"/><path fill="${k % 2 ? P.olive : P.forest2}" d="M0 1h1v-1h1v1h1v1h-1v1h-1v-1h-1z"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.8;1" dur="${d}s" begin="${dl}s" repeatCount="indefinite"/></path></g>\n`; }

  // vine border (corners only)
  const vn = new Grid(W, H);
  vine(vn, W - 3, 0, 30, 'down', 31); vine(vn, W - 6, 1, 14, 'down', 32); vine(vn, 2, H - 1, 22, 'up', 33); vine(vn, 1, H - 3, 34, 'right', 34);
  const body = card.render('card') + t.render('labels') + cells.render('contribution-cells') + lg.render('legend') + st.render('stats') + runner + leaves + vn.render('vine-border');
  return svgDoc(W, H, U, `Chakra log: ${total} real GitHub contributions in the last year, current streak ${cur} days, longest ${longest}`, body);
}

async function live(login, token) {
  const q = `query($l:String!){user(login:$l){contributionsCollection{contributionCalendar{weeks{contributionDays{date weekday contributionCount}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'chakra-map' }, body: JSON.stringify({ query: q, variables: { l: login } }) });
  const j = await res.json(); if (!res.ok || j.errors) throw new Error(JSON.stringify(j.errors || res.status));
  return j.data.user.contributionsCollection.contributionCalendar.weeks;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const login = process.env.PROFILE_LOGIN || 'Sakshamcozykun', token = process.env.GH_TOKEN, mock = process.argv.includes('--mock') || !token;
  const weeks = mock ? mockWeeks() : await live(login, token);
  mkdirSync('assets', { recursive: true });
  writeFileSync('assets/chakra-map.svg', render(weeks, { mock }));
  console.log(mock ? 'wrote chakra map from SAMPLE data (no token)' : 'wrote chakra map from live GitHub data');
}
