// Live commit map. Run by GitHub Actions (see .github/workflows/commit-map.yml).
// Usage: node scripts/commit-map.mjs [--mock]
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { C, MONO, px, pw, chamfer, rng, reg, wrap, panel, led } from './lib.mjs';

const LV = ['#171a1d', '#4a3a00', '#9a7400', '#e6a800', '#ffd21a'];

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
  const p = 'cm', W = 900, H = 350, x0 = 52, y0 = 74, P = 16, days = weeks.flatMap(w => w.contributionDays);
  const total = days.reduce((a, d) => a + d.contributionCount, 0), max = Math.max(1, ...days.map(d => d.contributionCount));
  const lvl = c => c === 0 ? 0 : Math.min(4, Math.ceil(c / max * 4));
  let longest = 0, run = 0; for (const d of days) { run = d.contributionCount > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let cur = 0, i = days.length - 1; if (i >= 0 && days[i].contributionCount === 0) i--; for (; i >= 0 && days[i].contributionCount > 0; i--) cur++;
  const best = days.reduce((a, d) => d.contributionCount > a.contributionCount ? d : a, days[0]);
  let cells = '', glow = '', months = '', lastM = -1, today = '';
  weeks.forEach((w, wi) => {
    const m = new Date(w.contributionDays[0].date + 'T00:00:00Z').getUTCMonth();
    if (m !== lastM && wi < weeks.length - 2) { months += `<text x="${x0 + wi * P}" y="${y0 - 10}" font-size="10" fill="${C.dim}">${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m]}</text>`; lastM = m; }
    w.contributionDays.forEach(d => {
      const x = x0 + wi * P, y = y0 + d.weekday * P, l = lvl(d.contributionCount), c = `<rect x="${x}" y="${y}" width="13" height="13" fill="${LV[l]}"/>`;
      cells += c; if (l >= 3) glow += c; today = `<rect class="bl" x="${x - 2}" y="${y - 2}" width="17" height="17" fill="none" stroke="${C.cyan}" stroke-width="1.5"/>`;
    });
  });
  const gw = weeks.length * P, wk = weeks.map(w => w.contributionDays.reduce((a, d) => a + d.contributionCount, 0)), wmax = Math.max(1, ...wk);
  const bars = wk.map((v, k) => { const h = Math.max(2, v / wmax * 62), bx = 548 + k * (324 / wk.length); return `<rect x="${bx.toFixed(1)}" y="${(318 - h).toFixed(1)}" width="${(324 / wk.length - 2).toFixed(1)}" height="${h.toFixed(1)}" fill="${v === wmax ? C.amber : C.amber2}" opacity="${v === wmax ? 1 : .55}"/>`; }).join('');
  const stat = (n, label, sub, k) => { const t = String(n), s = t.length > 3 ? 4 : 5, x = 28 + k * 126; return `<polygon points="${chamfer(x, 218, 118, 100, 10)}" fill="${C.panel2}" stroke="${C.line}"/><rect x="${x}" y="218" width="118" height="3" fill="${C.amber}"/>${px(t, x + 12, 242, s, C.amber)}<text x="${x + 12}" y="288" font-size="10" fill="${C.txt}" letter-spacing="1">${label}</text><text x="${x + 12}" y="304" font-size="9" fill="${C.dim}">${sub}</text>`; };
  const sync = meta.sync || new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z';
  const body = panel(W, H, p, 20)
    + `<rect x="28" y="22" width="8" height="8" fill="${C.amber}"/><text x="44" y="30" font-size="12" fill="${C.txt}" letter-spacing="2">CONTRIBUTION TERRAIN <tspan fill="${C.dim}">// LAST 365 DAYS // ${meta.login || 'OPERATOR'}</tspan></text>`
    + `<text x="872" y="30" font-size="11" fill="${C.dim}" text-anchor="end">${meta.mock ? 'SIMULATED DATA' : 'SYNC ' + sync}</text>${led(880, 22, meta.mock ? C.red : C.green)}`
    + `<path d="M28 42H872" stroke="${C.line}"/>`
    + ['MON', 'WED', 'FRI'].map((t, k) => `<text x="14" y="${y0 + (k * 2 + 1) * P + 10}" font-size="9" fill="${C.dim}">${t}</text>`).join('') + months
    + cells + `<g filter="url(#${p}gl)" opacity=".8">${glow}</g>`
    + `<clipPath id="${p}gc"><rect x="${x0}" y="${y0 - 2}" width="${gw}" height="${7 * P}"/></clipPath><linearGradient id="${p}sw" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".28"/></linearGradient>`
    + `<g clip-path="url(#${p}gc)"><g><animateTransform attributeName="transform" type="translate" from="0 0" to="${gw + 70} 0" dur="7s" repeatCount="indefinite"/><rect x="${x0 - 70}" y="${y0 - 2}" width="70" height="${7 * P}" fill="url(#${p}sw)"/><rect x="${x0 - 2}" y="${y0 - 2}" width="2" height="${7 * P}" fill="${C.cyan}"/></g></g>` + today
    + `<text x="${x0 + gw - 150}" y="${y0 + 7 * P + 18}" font-size="9" fill="${C.dim}">LESS</text>` + LV.map((c, k) => `<rect x="${x0 + gw - 118 + k * 16}" y="${y0 + 7 * P + 10}" width="11" height="11" fill="${c}"/>`).join('') + `<text x="${x0 + gw - 34}" y="${y0 + 7 * P + 18}" font-size="9" fill="${C.dim}">MORE</text>`
    + stat(total, 'CONTRIBUTIONS', '365D TOTAL', 0) + stat(cur, 'CURRENT STREAK', 'DAYS', 1) + stat(longest, 'LONGEST STREAK', 'DAYS', 2) + stat(best.contributionCount, 'PEAK DAY', best.date, 3)
    + `<text x="548" y="236" font-size="10" fill="${C.txt}" letter-spacing="1">WEEKLY PULSE</text><path d="M548 322H872" stroke="${C.line}"/>${bars}` + reg(14, 14) + reg(886, 336);
  return wrap(W, H, p, body);
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
  writeFileSync('assets/commit-map.svg', render(weeks, { login: login.toUpperCase(), mock }));
  console.log(mock ? 'wrote simulated commit map' : 'wrote live commit map');
}
