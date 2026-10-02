// Shared design tokens + helpers. Soft dark, rounded, one warm accent.
export const C = {
  card: '#14171f', card2: '#1b1f29', line: '#272c39',
  txt: '#eceef3', sub: '#b6bdcc', dim: '#8791a5',
  acc: '#f2a65a', acc2: '#e8735a', ink: '#1c130d',
};
export const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif";
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const tw = (t, s) => t.length * s * 0.58; // rough text width
export const STYLE = `<style>.fl{animation:fl 6s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-6px)}}</style>`;
export const wrap = (w, h, body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="${FONT}">${STYLE}<defs>${defs}</defs>${body}</svg>`;
export const card = (w, h, r = 28, fill = C.card) =>
  `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${fill}" stroke="${C.line}"/>`;
export const label = (x, y, t) =>
  `<text x="${x}" y="${y}" font-size="12" font-weight="600" fill="${C.dim}" letter-spacing="2">${esc(t.toUpperCase())}</text>`;
export function chip(x, y, t, o = {}) {
  const { s = 13, h = 30, p = 14, fill = C.card2, stroke = C.line, color = C.sub, dot } = o;
  const w = Math.round(tw(t, s) + p * 2 + (dot ? 16 : 0));
  const tx = dot ? x + p + 14 : x + w / 2;
  return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${stroke}"/>`
    + (dot ? `<circle cx="${x + p + 3}" cy="${y + h / 2}" r="4" fill="${dot}"/>` : '')
    + `<text x="${tx}" y="${y + h / 2 + s * 0.35}" font-size="${s}" fill="${color}" text-anchor="${dot ? 'start' : 'middle'}">${esc(t)}</text>` };
}
export const rng = (seed) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
