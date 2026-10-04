// Fill the README placeholders in one go:  node scripts/set-links.mjs tiles=https://github.com/you/tiles lan=... food=... os=... linkedin=... email=... portfolio=... osdc=...
import { readFileSync, writeFileSync } from 'node:fs';
const MAP = { tiles: 'YOUR_TILES_REPO', lan: 'YOUR_LAN_TRANSFER_REPO', food: 'YOUR_FOOD_DELIVERY_REPO', os: 'YOUR_SAKSHAMOS_REPO', linkedin: 'YOUR_LINKEDIN', email: 'YOUR_EMAIL', portfolio: 'YOUR_PORTFOLIO', osdc: 'YOUR_OSDC_ORG' };
let md = readFileSync('README.md', 'utf8');
for (const a of process.argv.slice(2)) { const [k, ...v] = a.split('='); if (MAP[k] && v.length) md = md.replaceAll(MAP[k], v.join('=')); else console.warn('skipped', a); }
writeFileSync('README.md', md); console.log('left to fill:', [...new Set(md.match(/YOUR_[A-Z_]+/g) || [])].join(', ') || 'nothing');
