// Live contribution map. Run by GitHub Actions (see .github/workflows/commit-map.yml).
// Usage: node scripts/commit-map.mjs [--mock]
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { C, esc, wrap, card, label, rng } from './lib.mjs';

const LV = ['#1f2330', '#4a2f40', '#94496a', '#e0708f', '#ffb3a7']; // sakura ramp

// Pixel runner (2 frames). h=hair s=skin e=eye r=scarf w=outfit b=boots p=blush
const SPR = { h: '#b9a3ff', s: '#ffdcc8', e: '#2a2340', r: '#ff6f91', w: '#f4efff', b: '#6a5acd', p: '#ff9fbd' };
const FR = [
  ['...hhhhhh...', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hhsssssshh.', '.hsessssesh.', '.hhsspsshh..', '..hhssssh...', 'rr.rrrrrr...', '.rrwwwwww...', '...wwwwww...', '...wwwwwss..', '..bb...bb...', '.bb.....bb..'],
  ['...hhhhhh...', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hhsssssshh.', '.hsessssesh.', '.hhsspsshh..', '..hhssssh...', '.rrrrrrrr...', 'rr.wwwwww...', '...wwwwww...', '..ss.wwww...', '....bbbb....', '....bb.bb...'],
];
const sprite = (rows, px) => rows.map((r, y) => [...r].map((c, x) => c === '.' ? '' : `<rect x="${x * px}" y="${y * px}" width="${px}" height="${px}" fill="${SPR[c]}"/>`).join('')).join('');

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
  const W = 900, H = 372, x0 = 66, y0 = 128, days = weeks.flatMap(w => w.contributionDays);
  const P = (W - x0 - 36) / weeks.length, cs = P - 3.5;
  const total = days.reduce((a, d) => a + d.contributionCount, 0), max = Math.max(1, ...days.map(d => d.contributionCount));
  const lvl = c => c === 0 ? 0 : Math.min(4, Math.ceil(c / max * 4));
  let longest = 0, run = 0; for (const d of days) { run = d.contributionCount > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let cur = 0, i = days.length - 1; if (i >= 0 && days[i].contributionCount === 0) i--; for (; i >= 0 && days[i].contributionCount > 0; i--) cur++;
  const best = days.reduce((a, d) => d.contributionCount > a.contributionCount ? d : a, days[0]);
  let cells = '', months = '', lastM = -1, lastWi = -9;
  weeks.forEach((w, wi) => {
    const m = new Date(w.contributionDays[0].date + 'T00:00:00Z').getUTCMonth();
    if (m !== lastM && wi < weeks.length - 2 && wi - lastWi >= 3) { months += `<text x="${(x0 + wi * P).toFixed(1)}" y="${y0 - 10}" font-size="11" fill="${C.dim}">${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m]}</text>`; lastM = m; lastWi = wi; }
    w.contributionDays.forEach(d => { cells += `<rect x="${(x0 + wi * P).toFixed(1)}" y="${(y0 + d.weekday * P).toFixed(1)}" width="${cs.toFixed(1)}" height="${cs.toFixed(1)}" rx="3.5" fill="${LV[lvl(d.contributionCount)]}"/>`; });
  });
  const gy = y0 + 7 * P, lx = W - 36 - 5 * 16 - 62;
  const legend = `<text x="${lx}" y="${gy + 13}" font-size="11" fill="${C.dim}">Less</text>` + LV.map((c, k) => `<rect x="${lx + 32 + k * 16}" y="${gy + 4}" width="11" height="11" rx="3" fill="${c}"/>`).join('') + `<text x="${lx + 32 + 5 * 16 + 4}" y="${gy + 13}" font-size="11" fill="${C.dim}">More</text>`;
  const stats = [[total, 'Contributions, last year'], [cur, 'Current streak (days)'], [longest, 'Longest streak (days)'], [best.contributionCount, 'Best day · ' + best.date]];
  const sy = 304, sw = (W - 72) / 4;
  const st = stats.map(([n, l], k) => `${k ? `<path d="M${36 + k * sw - 12} ${sy - 26}V${sy + 26}" stroke="${C.line}"/>` : ''}<text x="${36 + k * sw + (k ? 8 : 0)}" y="${sy}" font-size="32" font-weight="700" fill="${k === 0 ? C.acc : C.txt}" letter-spacing="-.8">${n}</text><text x="${36 + k * sw + (k ? 8 : 0)}" y="${sy + 24}" font-size="12" fill="${C.dim}">${esc(l)}</text>`).join('');
  const sync = meta.sync || new Date().toISOString().slice(0, 10);
  const PX = 3, spr = FR.map(f => sprite(f, PX));
  const runner = `<g><animateTransform attributeName="transform" type="translate" values="${x0 - 10} ${y0 - 62};${W - 36 - 40} ${y0 - 62}" dur="18s" repeatCount="indefinite"/>`
    + `<g><animate attributeName="visibility" values="visible;hidden" dur=".5s" calcMode="discrete" repeatCount="indefinite"/>${spr[0]}</g>`
    + `<g visibility="hidden"><animate attributeName="visibility" values="hidden;visible" dur=".5s" calcMode="discrete" repeatCount="indefinite"/>${spr[1]}</g></g>`
    + `<path d="M${x0} ${y0 - 20}H${W - 36}" stroke="${C.line}" stroke-dasharray="2 6"/>`;
  const r = rng(11); let petals = '';
  for (let k = 0; k < 9; k++) { const px = 60 + r() * 780, d = (9 + r() * 8).toFixed(1), dl = (-r() * 12).toFixed(1), c = r() > .5 ? '#ffc4d6' : '#ff90b2';
    petals += `<g opacity=".75"><animateTransform attributeName="transform" type="translate" values="${px.toFixed(0)} 56;${(px - 70).toFixed(0)} ${H - 24}" dur="${d}s" begin="${dl}s" repeatCount="indefinite"/><rect width="4" height="4" fill="${c}"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="${d}s" begin="${dl}s" repeatCount="indefinite"/></rect></g>`; }
  return wrap(W, H, card(W, H, 28) + label(36, 44, 'Activity')
    + `<text x="${W - 36}" y="44" font-size="12" fill="${C.dim}" text-anchor="end">${meta.mock ? 'Sample data' : 'Updated ' + sync}</text>`
    + ['Mon', 'Wed', 'Fri'].map((t, k) => `<text x="36" y="${(y0 + (k * 2 + 1) * P + cs * .75).toFixed(1)}" font-size="11" fill="${C.dim}">${t}</text>`).join('') + months + cells + legend + petals + runner
    + `<path d="M36 ${sy - 50}H${W - 36}" stroke="${C.line}"/>` + st);
}

async function live(login, token) {
  const q = `query($l:String!){user(login:$l){contributionsCollection{contributionCalendar{weeks{contributionDays{date weekday contributionCount}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'commit-map' }, body: JSON.stringify({ query: q, variables: { l: login } }) });
  const j = await res.json(); if (!res.ok || j.errors) throw new Error(JSON.stringify(j.errors || res.status));
  return j.data.user.contributionsCollection.contributionCalendar.weeks;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const login = process.env.PROFILE_LOGIN || 'Sakshamcozykun', token = process.env.GH_TOKEN, mock = process.argv.includes('--mock') || !token;
  const weeks = mock ? mockWeeks() : await live(login, token);
  mkdirSync('assets', { recursive: true });
  writeFileSync('assets/commit-map.svg', render(weeks, { login, mock }));
  console.log(mock ? 'wrote sample commit map' : 'wrote live commit map');
}
